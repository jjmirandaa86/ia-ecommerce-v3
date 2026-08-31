# PRD — IA-ECOMMERCE

Versión: descubrimiento cerrado (25 Aug 2026)
Estado: borrador para validación
Idioma de producto (UI y preguntas): **inglés**
Nombre de producto: **IA-ECOMMERCE**

---

## 1. Executive Summary

### Problem Statement

Los dueños de la información (no compradores) no pueden consultar ventas, productos, inventario, reseñas y clientes en lenguaje natural sobre **su** base, sin SQL y sin copiar datos a un chat genérico. Cada empresa usa un sistema distinto (ecommerce, SAP, Xerox, otros); si la interpretación no está acotada por sistema, el modelo mezcla significados y las respuestas dejan de ser confiables.

### Proposed Solution

Producto comercial B2B: el usuario entra a **IA-ECOMMERCE**, pregunta en inglés, y un LLM **solo traduce** la frase a un **JSON de intención fija** según el **tipo de sistema** del cliente. Un motor de reglas (por entidad, no el LLM) arma la consulta, lee **solo** la BD del cliente y muestra número, tabla y gráfico. Login, conversación, sugerencias, reglas e historial viven en **una MySQL nuestra**. La BD del cliente (piloto: `ecommerce`) queda **intacta y de solo lectura**.

### Success Criteria

1. El fundador inicia sesión (día 1) y, en el día 2, obtiene respuestas de la BD `ecommerce` para los tipos de pregunta listados en este PRD.
2. Toda pregunta queda en `ai_query_audit_log` (texto, intención, SQL, marca revisado sí/no).
3. Si no hay match de intención: mensaje formal de que no se entendió + sugerencias **de ese sistema**.
4. Si la intención es gráfica y trae parámetros (periodo, agrupación, N): se muestra gráfico con **lo que encuentre**; no se inventan series.
5. Precisión numérica (“contesta bien X%”) = **TBD** (el fundador valida; no hay set de oro todavía).

---

## 2. User Experience & Functionality

### User Personas

| Persona | Rol en MVP | Rol después |
|---|---|---|
| Fundador (único usuario del piloto) | Opera el flujo completo, valida respuestas, clasifica el audit | Sigue definiendo reglas con el cliente |
| Dueño de información / gerencia / operación | Fuera del piloto de usuarios | Pregunta KPIs y hechos; solo lectura |
| Comprador de la tienda | **Fuera de alcance** | Fuera de alcance |

No hay registro público. En MVP, **todos los usuarios autenticados ven todos los datos** de **su** empresa. Roles por departamento = post-MVP.

### User Stories

**US-1 — Login**
As a data owner, I want to sign in with credentials stored in the product database so that only authorized people reach the chat.

- AC: Un usuario creado por nosotros; usuario/contraseña en **nuestra** BD.
- AC: Sin registro público.
- AC: Tras login, la sesión apunta a **1 empresa = 1 BD cliente**.
- AC: MVP: un solo host (no hace falta `a.acertijo.dev`).

**US-2 — Preguntar en inglés**
As a data owner, I want to ask in natural English so that I get counts, lists, rankings, or charts from my data without writing SQL.

- AC: Tono **formal**.
- AC: El LLM **no** escribe el SQL final. Emite JSON de intención de un **catálogo fijo por `system_type`**.
- AC: La consulta se construye con reglas por entidad (filtros sobre un patrón tipo `1=1` + joins permitidos).
- AC: Cliente: **SELECT** solamente.

**US-3 — Conversación del día**
As a data owner, I want follow-up questions in the same day so that I can refine without repeating context.

- AC: Memoria de conversación = **día calendario en pantalla**.
- AC: Al día siguiente, la UI empieza de cero.
- AC: En **nuestra** BD se **guarda todo** lo consultado, aunque la UI solo muestre el día.

**US-4 — No entendido**
As a data owner, I want a clear failure and examples so that I know how to rephrase.

- AC: Mensaje: no se entendió; reescribir.
- AC: Sugerencias = lista **fija por sistema** (ecommerce ≠ SAP ≠ Xerox), porque los intents son distintos.
- AC: Si el tema es sales, se muestran las sugerencias de sales de **ese** sistema.

**US-5 — Gráficos**
As a data owner, I want a chart when I ask for a breakdown or a time series so that I can see the result, not only numbers.

- AC: Gráfico **obligatorio** cuando la intención lo pide y trae **parámetros** (si no hay parámetros controlables, no se inventa el gráfico).
- AC: Mostrar **lo que encuentre** (ej. productos por categoría; valor de ventas de los últimos 3 meses u otro periodo dicho por el usuario).
- AC: El tipo de gráfico depende de la entidad preguntada.
- AC: Implementación de UI acordada: Recharts; iconos: react-icons.

**US-6 — SQL de prueba**
As the founder, I want to see the SQL behind an icon so that I can verify the engine.

- AC: MVP: visible tras un icono.
- AC: Después: no se muestra al usuario del cliente. El SQL sigue en el audit para nosotros.

**US-7 — Mejora continua**
As the founder, I want every question stored and markable as reviewed so that I can improve intents with the client.

- AC: Audit en **nuestra** BD, no en ecommerce.
- AC: Campos mínimos: pregunta, JSON de intención, SQL, usuario, empresa, `system_type`, fecha, revisado sí/no.
- AC: **Sin pantalla** de revisión en el MVP; el fundador consulta la BD.

### Preguntas / intents del MVP (sistema `ecommerce`)

Cubiertas (inglés en producto; aquí en claro):

| Tema | Ejemplos acordados |
|---|---|
| Clientes | Cuántos clientes; top ventas por cliente; clientes que más compran por categoría |
| Ventas | Última venta; valor de ventas en un periodo (default 3 meses si el usuario lo pide así) |
| Productos | Conteos; top productos; menos vendidos |
| Categoría / subcategoría | Cantidad de productos por categoría; preguntas de subcategoría |
| Inventario | Stock de un producto; stock total. **No** “inventario bajo” |
| Reviews | Rating promedio; peor reseña; rating por producto |
| Gráficos | Según la entidad y parámetros de la pregunta |

**TBD:** si los rankings son una lista **cerrada** o un patrón abierto “top N de cualquier dimensión”. En el MVP se implementan **los ejemplos de la tabla**; el resto de variantes no se compromete.

### Allowlist de tablas (BD cliente `ecommerce`, solo lectura)

`product`, `productsubcategory`, `productcategory`, `salesorderheader`, `salesorderdetail`, `customer`, `individual`, `contact`, `productinventory`, `productreview`.

Joins de negocio (hecho del esquema, no de la app):

`customer` ← `salesorderheader` ← `salesorderdetail` → `product` → `productsubcategory` → `productcategory`

`customer` → `individual` → `contact` (Title, First/Middle/Last/Suffix, EmailAddress, EmailPromotion, Phone; sin passwords)

`product` → `productinventory` / `productreview`

`customer` tiene `CustomerID`, `AccountNumber`, `CustomerType`. Nombre de individuo vía `individual`+`contact`; tiendas (`CustomerType=S`) pueden no tener nombre — mostrar AccountNumber.

### Non-Goals (MVP)

- Escritura, update o delete en la BD del cliente.
- Inventario bajo / umbral parametrizado.
- Compradores (clientes de la tienda) usando el chat.
- Roles por departamento (todos ven todo).
- Multi-host / subdominio (`a.acertijo.dev`) y aislamiento de carga por dominio.
- Oracle u otro motor en el piloto (el diseño debe **permitir** cambiar de ORM/motor después; el piloto es MySQL).
- SAP y Xerox con intents reales (existen como `system_type`; reglas vacías).
- UI en español; preguntas en español.
- Registro público; más de un usuario en el piloto.
- Pantalla de clasificación revisado/no.
- Auto-descubrimiento de cualquier ERP.
- RAG, embeddings o que el LLM genere SQL.
- Redis como requisito duro (entra **si es sencillo**; si no, se omite).
- Fecha de entrega (no hay plazo).

---

## 3. AI System Requirements

### Comportamiento del modelo

- Entrada: texto en inglés + `system_type` del cliente (en el piloto: `ecommerce`).
- Salida: JSON de **intención fija** de ese sistema, o “no match”.
- **Prohibido:** que el modelo elija tablas libres, genere SQL, o use intents de otro sistema.
- Un cambio de intents/sugerencias en `ecommerce` aplica a **todos** los clientes `ecommerce`. Igual para SAP/Xerox cuando existan.

### Tool Requirements

| Pieza | Uso | Origen |
|---|---|---|
| LLM (Ollama ~7B, dicho en la idea inicial) | Solo NL → JSON de intención | Restricción del fundador; sustituible si el contrato JSON se mantiene |
| Motor de reglas por entidad | JSON → consulta determinista + joins allowlist | Requisito de producto |
| BD cliente | Solo lectura, allowlist de 10 tablas | Piloto `ecommerce` |
| BD producto | Auth, conversación, sugerencias, audit, `system_type`, conexión al cliente | Nueva MySQL |
| Recharts | Gráficos | Decisión del fundador |

**TBD:** set de oro de preguntas y umbral de acierto.

### Evaluation Strategy

- El fundador valida si la respuesta es correcta.
- Lo mal entendido se revisa con el cliente usando el audit.
- Criterio de “hecho” por pregunta: (a) intención correcta, (b) consulta solo sobre allowlist, (c) resultado coherente con la BD, (d) gráfico solo con parámetros, (e) no match → texto formal + sugerencias del sistema.
- Métrica % = **TBD**.

---

## 4. Technical Specifications

### Architecture Overview

Solo lo acordado; no es diseño de carpetas.

```text
Usuario (1 host, inglés)
  → Next.js (UI + API, un solo proyecto)
  → Auth contra BD producto
  → LLM: texto → JSON de intención (catálogo de system_type)
  → Motor de reglas / entidades → SQL parametrizado
  → SELECT en BD cliente (ecommerce, intacta)
  → Respuesta: texto formal + tabla + gráfico (Recharts)
  → Persistencia: conversación + ai_query_audit_log en BD producto
```

Capas: cambiar reglas de una entidad no debe exigir cambiar UI o auth (requisito de mantenibilidad 80/20: motor genérico + reglas por entidad/sistema).

### Integration Points

**BD producto (nuestra MySQL)** — entidades aceptadas:

1. `system_type` — `ecommerce` | `sap` | `xerox`
2. `client_company` — empresa; FK a `system_type`; datos de conexión a **su** BD
3. `app_user` — login; 1 usuario = 1 empresa = 1 BD cliente
4. `suggestion_example` — ejemplos **por** `system_type`
5. `conversation` — hilo del día (UI)
6. `message` — turnos pregunta/respuesta
7. `ai_query_audit_log` — pregunta, JSON, SQL, revisado sí/no

**BD cliente (piloto):** MySQL `ecommerce`, 10 tablas, sin objetos nuevos de este producto.

**Auth:** credenciales en BD producto; JWT (idea original del fundador).
**ORM:** el desarrollo debe poder cambiar de ORM/motor sin reescribir el producto; piloto MySQL.
**Caché:** Redis solo si el añadido es sencillo; no bloquea el MVP.

### Security & Privacy

- Cliente: solo lectura; no se guarda conversación ahí.
- Credenciales de la BD cliente: en **nuestra** BD, no en el cliente.
- SQL visible en MVP (icono) para testing; no es el comportamiento futuro hacia el cliente.
- No loguear contraseñas ni el secreto JWT.
- Aislamiento de datos de negocio: cada empresa solo su BD (en MVP hay una).
- Subdominio por volumen/rendimiento = post-MVP.

---

## 5. Risks & Roadmap

### Phased Rollout

| Fase | Qué entra |
|---|---|
| **MVP** | 1 host, 1 usuario, inglés, sistema `ecommerce`, 10 tablas, chat del día, gráficos con parámetros, sugerencias por sistema, audit en BD producto, SQL con icono, Next + Recharts |
| **v1.1** | Subdominio por empresa; ocultar SQL; roles; inventario bajo; cerrar TBD de rankings; Redis si hace falta |
| **v2** | SAP y Xerox con intents reales; Oracle u otros motores; piloto de concurrencia (10 usuarios/departamento) |

### Technical Risks

| Riesgo | Mitigación en alcance |
|---|---|
| El LLM inventa SQL o cruza sistemas | JSON fijo + `system_type` + allowlist; el motor arma la consulta |
| Rankings “etc.” infinitos | Ejemplos de la tabla de intents; resto TBD |
| Nombre de cliente | Individuos: `individual`→`contact`; tiendas sin nombre: AccountNumber; no inventar nombres |
| Joins categoría | `productsubcategory` obligatoria en allowlist |
| Redis / ORM / Ollama | Redis opcional; ORM sustituible; LLM detrás del contrato JSON |
| Esperar ChatGPT abierto | No match explícito + sugerencias; no fingir que entiende |

---

## Abierto a propósito (no inventado)

- Lista cerrada vs patrón general de rankings.
- % de acierto y set de oro.
- Xerox/SAP: solo etiqueta de sistema hasta v2.
- Redis: sí si es sencillo.
