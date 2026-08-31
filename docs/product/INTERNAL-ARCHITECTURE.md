# Arquitectura interna — IA-ECOMMERCE

Fuente de verdad de decisiones: `docs/architecture/` (`ARCHITECTURE.md`, `MODULES.md`, `DEPENDENCIES.md`, `ADR/`). Si este catálogo choca con un ADR, **gana el ADR**.

Complementa el detalle de entidades, VOs y puertos. Código de aplicación: todavía no.

---

## 0. Regla maestra (dirección de dependencias)

Las flechas son **imports permitidos**. Nada apunta hacia afuera.

```text
Presentation
  → Application          (casos de uso + DTO de entrada/salida)
  → NO Domain (salvo DTO/VO compartidos de frontera, ver §9)
  → NO Infrastructure
  → NO Adapters

Application
  → Domain               (entidades, VOs, servicios de dominio, puertos)
  → Domain de otro contexto SOLO a través de sus interfaces (puertos)
  → NO Infrastructure
  → NO Adapters
  → NO Presentation
  → NO Next / ORM / Ollama / Recharts

Domain
  → Domain del mismo contexto
  → shared/domain        (kernel mínimo: IDs y TenantRef)
  → NO Application
  → NO Infrastructure
  → NO Adapters
  → NO Presentation
  → NO Next / ORM / Ollama / Recharts / SQL strings de un motor concreto

Infrastructure / Adapters
  → implementan interfaces definidas en Domain (y, si hace falta, Application)
  → pueden usar Next, ORM, HTTP, Docker, Ollama
  → NO contienen reglas de intención ni políticas de allowlist
  → NO son llamadas desde Domain ni desde Presentation (solo desde wiring)

Infrastructure (composition root / wiring)
  → es la ÚNICA capa que puede ver Application + Adapters a la vez
  → construye el caso de uso inyectando adaptadores
```

En el formato pedido:

```text
Domain
  ↓
NO puede depender de Infrastructure

Application
  ↓
puede depender de Domain

Infrastructure
  ↓
puede implementar interfaces definidas por Domain (y Application)

Presentation
  ↓
utiliza Application
```

**Prohibido:** ciclo Domain ↔ Infrastructure; Application importando Prisma; un hook importando un repositorio; ClientAcl importando un caso de uso.

---

## 1. Bounded Contexts

Cuatro contextos de negocio + un área de ops que **no** es un contexto de dominio.

| Contexto | Pregunta que responde | Modelo |
|---|---|---|
| **Identity** | ¿Quién es, de qué empresa, qué sistema y a qué BD se conecta? | Nuestro |
| **Conversation** | ¿Qué se preguntó hoy y qué se guarda siempre? | Nuestro |
| **QueryAgent** | ¿Qué quiso decir y qué plan de consulta es válido? | Nuestro |
| **ClientAcl** | ¿Cómo se traduce ese plan al SQL de *este* ERP? | **No es dominio nuestro**; es anti-corrupción (adaptador) |
| **Ops** | ¿Qué proceso está UP o DOWN? | Infra, no lenguaje de negocio |

ClientAcl se lista aquí para no olvidarlo; **no** tiene entidades `Product` / `SalesOrder` en Domain. Vive en Infrastructure.

Mapa (contexto → contexto):

```text
Identity ──(TenantRef)──▶ QueryAgent
Identity ──(TenantRef)──▶ Conversation
QueryAgent ──(puerto ConversationStore)──▶ Conversation
QueryAgent ──(puerto AuditLog)──▶ persistencia (nuestro)
QueryAgent ──(puerto ClientQuery)──▶ ClientAcl (ecommerce | sap | xerox)
Ops ──(HealthChecks)──▶ MySQL producto, LLM, BD cliente
```

Un contexto **no** importa entidades de otro. Cruza con:

- `TenantRef` (shared)
- IDs (`UserId`, `CompanyId`, `ConversationId`)
- puertos (interfaces)

---

## 2. Modules (mapeo a carpetas)

Un módulo de código = un bounded context, mismas capas internas.

| Módulo | Path objetivo | Capas |
|---|---|---|
| Identity | `src/identity/{domain,application,adapters}` | las cuatro reglas de §0 |
| Conversation | `src/conversation/{domain,application,adapters}` | igual |
| QueryAgent | `src/query-agent/{domain,application,adapters}` | igual |
| ClientAcl | `src/client-acl/{ecommerce,sap,xerox}` | **solo adapters** (implementan `ClientQuery`) |
| Ops | `src/ops/application` + adapters en infrastructure | `GetHealth` |
| Presentation | `src/presentation/*`, `src/app/*` | driving adapter Next + UI |
| Shared | `src/shared/domain` | kernel mínimo |
| Wiring | `src/infrastructure` | composition root, env, logger |

`src/app` es Presentation/driving (HTTP), no Domain.

---

## 3. Layers (dentro de cada módulo de negocio)

| Capa | Contiene | I/O |
|---|---|---|
| **Domain** | Entidades, VOs, políticas, **interfaces** de repositorio y de servicios externos | Cero I/O real |
| **Application** | Casos de uso: orquestan dominio + puertos | Orquesta I/O vía puertos |
| **Infrastructure** | Implementaciones: ORM, JWT, HTTP al LLM, SQL cliente | I/O real |
| **Presentation** | Páginas, vistas, un hook por componente, route handlers | HTTP / UI |

ClientAcl no tiene capa Domain propia.

---

## 4. Responsibilities (quién hace qué)

| Capa / módulo | Sí | No |
|---|---|---|
| Identity Domain | Invariante 1 usuario = 1 empresa = 1 BD; validar host | Emitir JWT; hashear con bcrypt en la entidad |
| Identity Application | `Login`: buscar usuario, verificar secreto vía puerto, emitir token vía puerto | Armar SQL de ventas |
| Conversation Domain | “Día calendario” de un hilo; un mensaje es pregunta o respuesta | Llamar al LLM |
| Conversation Application | `LoadDayConversation`; persistir turnos que QueryAgent le pide por puerto | Clasificar intents |
| QueryAgent Domain | Catálogo de intents por `system_type`; `QueryPlan` válido; no-match; allowlist conceptual | Concatenar SQL MySQL; hablar con Ollama |
| QueryAgent Application | `AskQuestion` (flujo completo) | Renderizar Recharts |
| ClientAcl | SQL `1=1` + binds + joins de **ese** sistema; ejecutar SELECT | Elegir la intención |
| Presentation | Pintar DTO; gráfico si viene `ChartSpec`; icono SQL | Conocer tablas `salesorderdetail` |
| Ops | Health UP/DOWN | Reglas de negocio |
| Wiring | New de casos de uso + adapters | Políticas de allowlist |

---

## 5. Dependencies entre módulos

Permitido:

| De | A | Qué |
|---|---|---|
| Presentation | Application de Identity, Conversation, QueryAgent, Ops | Solo casos de uso |
| QueryAgent Application | Identity Domain **interfaces** | p. ej. ya no: el tenant llega en el DTO de sesión |
| QueryAgent Application | Conversation Domain **interfaces** | `ConversationStore` |
| QueryAgent Application | QueryAgent Domain | plan, políticas |
| Conversation Application | Conversation Domain | — |
| Identity Application | Identity Domain | — |
| Adapters Identity | Identity Domain interfaces | repos |
| ClientAcl ecommerce | QueryAgent Domain: **solo** el DTO/VO `QueryPlan` + puerto `ClientQuery` | no entidades Identity |

Prohibido:

| De | A |
|---|---|
| QueryAgent Domain | Conversation / Identity Domain (entidades) |
| Identity | QueryAgent |
| Conversation Domain | QueryAgent |
| Presentation | `client-acl`, ORM, Ollama |
| ClientAcl | casos de uso |
| Domain (cualquier) | `src/infrastructure`, `src/app` |

**Tenant en AskQuestion:** Presentation/HTTP resuelve sesión (Identity Application ya autenticó). El caso de uso recibe `TenantRef` en el request, no importa `AppUser`.

---

## 6. Shared kernel (mínimo)

`src/shared/domain` — lo único que varios contextos pueden importar:

| Tipo | Rol |
|---|---|
| `UserId` | Identidad de usuario de producto |
| `CompanyId` | Empresa |
| `SystemTypeCode` | `ecommerce` \| `sap` \| `xerox` |
| `TenantRef` | `{ userId, companyId, systemType, host }` |
| `ConversationId` | Hilo |
| `CalendarDay` | Día de la UI |

Si crece (Money, Product, Order): **está mal**. Eso es del cliente y no va aquí.

---

## 7. Domain entities

Solo lo **nuestro**. El ERP del cliente no entra.

### Identity

| Entidad | Identidad estable | Invariantes v1 |
|---|---|---|
| `AppUser` | `UserId` | Pertenece a exactamente una `ClientCompany`; credencial en BD producto; no registro público |
| `ClientCompany` | `CompanyId` | Un `SystemTypeCode`; un host/subdominio; una conexión a BD cliente |
| `SystemType` | `SystemTypeCode` | Catálogo de tipo (ecommerce/sap/xerox); no contiene SQL |

### Conversation

| Entidad | Identidad | Invariantes v1 |
|---|---|---|
| `Conversation` | `ConversationId` | De un `UserId` + `CompanyId`; en UI solo se muestra el `CalendarDay` actual |
| `Message` | id de mensaje | Rol `user` \| `assistant`; texto; pertenece a un hilo |

### QueryAgent

| Entidad | Identidad | Invariantes v1 |
|---|---|---|
| `IntentDefinition` | nombre + `SystemTypeCode` | Fija; no la inventa el LLM; distinta por sistema |
| `QueryAuditEntry` | id de audit | Pregunta, JSON de intención o no-match, SQL, tenant, `reviewed` sí/no; no se borra porque la UI sea “solo hoy” |

**No son entidades de dominio (prohibido):** `Product`, `Customer`, `SalesOrder`, `ProductReview`, `ProductInventory` de ecommerce. Son filas que ClientAcl devuelve como `QueryResult` (ver VOs / read models).

---

## 8. Value objects

Inmutables; inválidos no se construyen.

### Identity

| VO | Significado |
|---|---|
| `HostName` | `a.acertijo.dev` |
| `Username` | login |
| `PasswordHash` | nunca el password en claro en Domain |
| `ClientConnectionId` | referencia a secretos; el secreto vive en Infrastructure |

### Conversation

| VO | Significado |
|---|---|
| `MessageRole` | user / assistant |
| `FormalText` | respuesta en inglés formal (puede nacer en Application; si se valida tono, VO) |

### QueryAgent

| VO | Significado |
|---|---|
| `IntentName` | p. ej. `count_customers`, `sales_over_period` |
| `IntentTopic` | `sales` \| `inventory` \| `review` \| `product` \| `customer` (para sugerencias) |
| `Classification` | match + `IntentName` + params **o** no-match |
| `QueryParams` | periodo, agrupación, N, ids de producto/categoría si vienen del JSON |
| `DateRange` | periodo explícito; sin él no hay gráfico de serie |
| `TopN` | N de ranking (ejemplos PRD; patrón abierto = TBD) |
| `QueryPlan` | intención + params + entidades lógicas + joins **permitidos** (nombres lógicos, no SQL motor) |
| `Allowlist` | conjunto de tablas lógicas permitidas para ese `system_type` |
| `QueryResult` | columnas, filas, `ExecutedSql` (para audit/icono) |
| `ChartSpec` | tipo + series; **solo** si la intención pide gráfico **y** hay params |
| `Suggestion` | frase de ejemplo, `system_type`, topic |

`QueryPlan` es VO (inmutable una vez validado), no agregado de pedidos.

### ClientAcl (no Domain)

Estructuras de infra: SQL + binds. No se importan en Domain. Domain solo ve `QueryResult`.

---

## 9. Interfaces (puertos)

Definidas en **Domain** del contexto dueño (salvo las de Application que son de orquestación pura). Infrastructure las implementa.

### Identity Domain

| Interfaz | Tipo | Operaciones (contrato) |
|---|---|---|
| `UserRepository` | Repositorio | `findByUsername(Username)` → `AppUser` |
| `CompanyRepository` | Repositorio | `findByHost(HostName)` → `ClientCompany` |
| `PasswordVerifier` | servicio de infra (puerto) | `matches(plain, PasswordHash)` → bool |
| `TokenIssuer` | servicio de infra (puerto) | `issue(TenantRef)` → token; `verify(token)` → `TenantRef` |

### Conversation Domain

| Interfaz | Tipo | Operaciones |
|---|---|---|
| `ConversationRepository` | Repositorio | `getOrCreateToday(TenantRef, CalendarDay)`; `append(Message)`; `listForDay(...)` |

### QueryAgent Domain

| Interfaz | Tipo | Operaciones |
|---|---|---|
| `IntentCatalog` | Repositorio / catálogo | `definitionsFor(SystemTypeCode)`; `contains(IntentName, SystemTypeCode)` |
| `SuggestionCatalog` | Repositorio | `examples(SystemTypeCode, IntentTopic?)` |
| `AuditLogRepository` | Repositorio | `append(QueryAuditEntry)` |
| `LlmClassifier` | integración externa (puerto) | `classify(text, SystemTypeCode)` → `Classification` |
| `ClientQuery` | integración externa (puerto) | `execute(QueryPlan, ClientConnectionId)` → `QueryResult` (SELECT only) |

### Ops

| Interfaz | Tipo | Operaciones |
|---|---|---|
| `HealthChecks` | infra | `productDatabase()`; `llm()`; `clientDatabase(TenantRef?)` → UP/DOWN + detalle |

Presentation **no** implementa estos puertos. Next es driving adapter: llama casos de uso.

---

## 10. Use cases (Application)

Cada uno: un request DTO → un response DTO. Sin HTTP.

| Caso de uso | Módulo | Puertos que usa | Dominio que toca |
|---|---|---|---|
| `Login` | Identity | `UserRepository`, `CompanyRepository`, `PasswordVerifier`, `TokenIssuer` | `AppUser`, `ClientCompany`, host vs usuario |
| `AskQuestion` | QueryAgent | `LlmClassifier`, `IntentCatalog`, `SuggestionCatalog`, `ClientQuery`, `ConversationRepository`, `AuditLogRepository` | `Classification`, `QueryPlan`, políticas, `QueryAuditEntry` |
| `LoadDayConversation` | Conversation | `ConversationRepository` | `Conversation`, `Message`, `CalendarDay` |
| `GetHealth` | Ops | `HealthChecks` | ninguno de negocio |

No hay: `CreateProduct`, `PlaceOrder`, `UpdateStock`, `RegisterUser` (v1).

`AskQuestion` (pasos de aplicación, no de Domain I/O):

1. Recibe texto + `TenantRef`.
2. Llama `LlmClassifier` (puerto).
3. Domain: si no-match → sugerencias; no llama `ClientQuery`.
4. Domain: si match → validar intent en catálogo de **ese** `system_type` → construir `QueryPlan` (params; gráfico solo con params).
5. `ClientQuery.execute`.
6. Armar response (texto formal, filas, `ChartSpec` opcional, SQL para icono).
7. `ConversationRepository.append` + `AuditLogRepository.append`.

---

## 11. Repositories

Solo persistencia de **nuestro** modelo. La BD cliente **no** tiene repositorio de `Product`.

| Repositorio | Contexto | Almacén | Agregado / filas |
|---|---|---|---|
| `UserRepository` | Identity | MySQL producto | `AppUser` |
| `CompanyRepository` | Identity | MySQL producto | `ClientCompany` (+ enlace `SystemType`) |
| `ConversationRepository` | Conversation | MySQL producto | `Conversation` + `Message` |
| `IntentCatalog` | QueryAgent | MySQL producto y/o archivos de reglas por `system_type` (80/20) | `IntentDefinition` |
| `SuggestionCatalog` | QueryAgent | MySQL producto (`suggestion_example`) | `Suggestion` |
| `AuditLogRepository` | QueryAgent | MySQL producto (`ai_query_audit_log`) | `QueryAuditEntry` |

Implementación: adapters (ORM sustituible). Domain no conoce tablas físicas.

`ClientQuery` **no** es repositorio: no reconstituye un agregado; ejecuta un plan de lectura.

---

## 12. Domain services

Lógica que no cabe en una sola entidad; **sin I/O**.

| Servicio de dominio | Contexto | Responsabilidad |
|---|---|---|
| `TenantBindingPolicy` | Identity | 1 usuario ↔ 1 empresa ↔ 1 BD; el host de la request debe ser el de esa empresa |
| `ConversationDayPolicy` | Conversation | Qué mensajes son “hoy” para la UI; el persistido no se borra |
| `IntentGuard` | QueryAgent | El JSON del LLM o es un `IntentName` del catálogo de ese sistema, o no-match; nunca SQL |
| `QueryPlanFactory` | QueryAgent | De `Classification` + catálogo → `QueryPlan` o rechazo (params faltantes para gráfico) |
| `AllowlistPolicy` | QueryAgent | El plan solo cita entidades lógicas permitidas para el `system_type` |
| `ChartPolicy` | QueryAgent | Hay `ChartSpec` iff la intención es gráfica **y** hay parámetros |

ClientAcl **no** tiene domain service de “precio de pedido”. Tiene **builders de SQL** en Infrastructure.

---

## 13. Infrastructure services

I/O y detalles de framework. Implementan puertos o sirven al wiring.

| Servicio de infra | Implementa / apoya | Detalle v1 |
|---|---|---|
| `JwtTokenService` | `TokenIssuer` | Firma/verifica JWT; secreto en env |
| `ProductPasswordVerifier` | `PasswordVerifier` | Algoritmo de hash de **nuestra** BD (a elegir al implementar) |
| `PrismaProductStore` (o equivalente) | repositorios Identity/Conversation/Audit | MySQL producto, Docker |
| `OllamaClassifier` | `LlmClassifier` | HTTP al proceso LLM aparte |
| `EcommerceClientQuery` | `ClientQuery` | MySQL ecommerce, 10 tablas, `1=1` + binds |
| `SapClientQuery` / `XeroxClientQuery` | `ClientQuery` | v2; stub o ausente |
| `HealthProbeService` | `HealthChecks` | Ping MySQL producto, LLM, BD cliente |
| `Config/Env` | wiring | `DATABASE_URL` producto, URL LLM, `JWT_SECRET` |
| `Logger` | transversal | Sin passwords, sin JWT crudo, sin connection strings completos |

Sin Redis. Sin worker queue.

---

## 14. External integrations

| Sistema | Dirección | Dueño del puerto | Qué cruza la frontera |
|---|---|---|---|
| Navegador | Inbound | HTTP (Presentation) | HTML/JSON; cookie JWT |
| MySQL producto | Outbound | Repositorios Identity/Conversation/QueryAgent | Nuestro modelo |
| MySQL `ecommerce` (piloto) | Outbound, **solo lectura** | `ClientQuery` / ClientAcl ecommerce | `QueryPlan` → filas |
| Futuro Oracle / SAP / Xerox | Outbound, solo lectura | otros ClientAcl | mismo `QueryPlan` lógico, otro SQL |
| LLM (Ollama u otro) | Outbound | `LlmClassifier` | texto + `system_type` → JSON intención |
| Reloj / calendario | implícito | `CalendarDay` | “hoy” de la UI |

Nada escribe en la BD cliente. Nada envía el historial de chat a la BD cliente.

---

## 15. Catálogo lógico v1 (`system_type = ecommerce`)

No son entidades Domain de producto; son `IntentName` del catálogo.

| IntentName (propuesto) | Tema | ChartParams |
|---|---|---|
| `count_customers` | customer | no |
| `top_customers_by_sales` | customer / sales | N |
| `customers_by_category_spend` | customer / sales | categoría, N |
| `last_sale` | sales | no |
| `sales_value_over_period` | sales | `DateRange` (ej. 3 meses) → gráfico |
| `count_products` | product | no |
| `top_products_by_sales` | product / sales | N |
| `least_sold_products` | product / sales | N |
| `products_by_category` | product | gráfico de cantidades |
| `products_by_subcategory` | product | igual |
| `product_stock` | inventory | no (no “low stock”) |
| `total_stock` | inventory | no |
| `average_rating` | review | no |
| `worst_review` | review | no |
| `rating_by_product` | review | opcional |

Nombres finales se pueden ajustar al implementar; el **conjunto de preguntas del PRD** no. Rankings más allá de estos = TBD.

Allowlist lógica (mapeo a tablas físicas = ClientAcl, no Domain):  
`product`, `productsubcategory`, `productcategory`, `salesorderheader`, `salesorderdetail`, `customer`, `individual`, `contact`, `productinventory`, `productreview`.

---

## 16. Diagrama de dependencias (capas)

```text
                    ┌────────────── Presentation ──────────────┐
                    │  app/ (routes)  presentation/ (vistas+hooks) │
                    └──────────────────┬───────────────────────┘
                                       │ solo Application
                    ┌──────────────────▼───────────────────────┐
                    │              Application                   │
                    │  Login  AskQuestion  LoadDay  GetHealth    │
                    └──────────────────┬───────────────────────┘
                                       │ Domain + puertos
        ┌──────────────────────────────┼─────────────────────────┐
        ▼                              ▼                         ▼
 Identity Domain              Conversation Domain         QueryAgent Domain
 entidades + VOs              entidades + VOs             plan, guard, catalog
 + UserRepository             + ConversationRepository    + LlmClassifier
 + CompanyRepository                                      + ClientQuery
                                                          + AuditLogRepository
        ▲                              ▲                         ▲
        │ implementa                   │ implementa               │ implementa
 Identity Adapters            Conversation Adapters      QueryAgent Adapters
 (MySQL producto, JWT)        (MySQL producto)           (Ollama)
                                                         ClientAcl ecommerce
                                                         (MySQL cliente R/O)
```

---

## 17. Checklist al implementar (sin escribir código ahora)

Un PR o archivo viola la arquitectura si:

1. `domain/**` importa `next`, ORM, `fetch` a Ollama, o `client-acl`.
2. Un caso de uso instancia Prisma/Ollama en lugar de recibir el puerto.
3. Un hook o page importa un repositorio.
4. Aparece `model Product` en `query-agent/domain`.
5. El LLM devuelve SQL y Application lo ejecuta.
6. ClientAcl elige la intención.
7. Identity importa QueryAgent.
8. No hay forma de ver UP/DOWN de MySQL producto, LLM y BD cliente.
