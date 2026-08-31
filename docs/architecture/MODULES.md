# Módulos — IA-ECOMMERCE

Fuente de verdad de contextos y responsabilidades. Dependencias: `DEPENDENCIES.md`.

---

## Bounded contexts

| Contexto | Pregunta | ¿Nuestro modelo? |
|---|---|---|
| **Identity** | ¿Quién, qué empresa, qué sistema, qué BD? | Sí |
| **Conversation** | ¿Qué se preguntó hoy y qué se guarda siempre? | Sí |
| **QueryAgent** | ¿Qué quiso decir y qué plan es válido? | Sí |
| **ClientAcl** | ¿Cómo se traduce el plan al SQL de este ERP? | No: solo adaptador |
| **Ops** | ¿Qué está UP o DOWN? | Infra, no dominio |

## Módulos de código

| Módulo | Path | Capas |
|---|---|---|
| Identity | `src/identity/{domain,application,adapters}` | Domain / Application / Adapters |
| Conversation | `src/conversation/{domain,application,adapters}` | igual |
| QueryAgent | `src/query-agent/{domain,application,adapters}` | igual |
| ClientAcl | `src/client-acl/{ecommerce,sap,xerox}` | **solo adapters** (`ClientQuery`) |
| Ops | `src/ops` + probes en infrastructure | `GetHealth` |
| Presentation | `src/app`, `src/presentation` | HTTP + vistas + 1 hook/componente |
| Shared | `src/shared/domain` | `TenantRef`, IDs |
| Wiring | `src/infrastructure` | composition root |

## Responsabilidades

| Módulo | Hace | No hace |
|---|---|---|
| Identity | Login, JWT, tenant por host, 1 usuario = 1 BD | LLM, SQL de ventas |
| Conversation | Hilo del día en UI; persistir **todo** | Clasificar intents |
| QueryAgent | Intención → plan → resultado DTO + audit | Recharts; Prisma; dialectos Oracle |
| ClientAcl | `QueryPlan` → SELECT parametrizado (`1=1` + binds) | Elegir la intención |
| Presentation | Pintar DTO; gráfico si hay `ChartSpec` | Tablas `salesorderdetail` |
| Ops | Health | Reglas de negocio |

## Entidades de dominio (nuestras)

- Identity: `AppUser`, `ClientCompany`, `SystemType`
- Conversation: `Conversation`, `Message`
- QueryAgent: `IntentDefinition`, `QueryAuditEntry`

**No** son dominio: `Product`, `Customer`, `SalesOrder` del cliente.

## Casos de uso v1

| Caso de uso | Módulo |
|---|---|
| `Login` | Identity |
| `AskQuestion` | QueryAgent |
| `LoadDayConversation` | Conversation |
| `GetDashboardStats` | QueryAgent u Ops (lectura audit/stats) |
| `GetHealth` | Ops |

## Repositorios vs integraciones

Repositorios (MySQL producto): `UserRepository`, `CompanyRepository`, `ConversationRepository`, `IntentCatalog`, `SuggestionCatalog`, `AuditLogRepository`.

Puertos de integración: `LlmClassifier`, `ClientQuery`, `PasswordVerifier`, `TokenIssuer`, `HealthChecks`.

`ClientQuery` no es repositorio: no reconstituye un agregado; ejecuta un plan de lectura.
