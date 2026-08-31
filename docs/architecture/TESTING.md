# Testing — IA-ECOMMERCE

Estado: v1 (25 Aug 2026)  
Base: PRD, ADR-009, API, SECURITY, DATABASE  
Runner: **Vitest**  
CI: **solo local** por ahora (sin GitHub Actions en v1)

---

## 1. Principios

| Principio | Detalle |
|---|---|
| Capas testeables | Domain / Application **no** importan Next, Prisma ni Ollama |
| Dobles ≠ verdad operativa | Un unit verde **no** implica MySQL u Ollama UP (ADR-009) |
| Health es obligatorio | Antes del día 2: comprobar app, MySQL producto, BD cliente, LLM |
| “Contesta bien” | Por ahora: **validación a ojo del fundador** sobre el set de oro |
| LLM | Unit con doble; **algunos** tests con Ollama real cuando esté UP |
| Datos | Fixtures/seed en BD producto **y** uso de `ecommerce` real (cliente) |
| UI | Tests de **componentes + hooks** además de API y Domain |

---

## 2. Pirámide (qué corre dónde)

```text
        ┌─────────────────┐
        │  Gold eval (ojo) │  fundador + lista §7
        ├─────────────────┤
        │ Health real      │  GetHealth / GET /api/health
        ├─────────────────┤
        │ Integration      │  producto + ecommerce + (opcional) Ollama
        ├─────────────────┤
        │ API (Vitest)     │  handlers con deps cableadas o dobles
        ├─────────────────┤
        │ UI (Vitest)      │  componentes + hooks
        ├─────────────────┤
        │ Unit Domain/App  │  puertos en memoria / stubs
        └─────────────────┘
```

| Capa | Herramienta | Dependencias reales |
|---|---|---|
| Domain / Application | Vitest | Ninguna (dobles) |
| Presentation (hooks/components) | Vitest + Testing Library (React) | API mockeada o MSW |
| API route handlers | Vitest | Dobles o DB según suite |
| Integration producto | Vitest | MySQL `ia_ecommerce_db` + seed |
| Integration cliente | Vitest | MySQL `ecommerce` (solo lectura) |
| LLM live | Vitest, tag/skip si DOWN | Ollama UP |
| Health | Manual + test que llama probes | Todo lo que esté levantado |
| Gold set | Checklist manual (ojo) | Stack completo |

---

## 3. Criterio “verde antes del día 2”

Deben existir y poder ejecutarse en local:

| # | Suite | Pass significa |
|---|---|---|
| a | Unit Domain/Application | Políticas, `QueryPlan`, no-match, Login con repos falsos |
| b | Integration BD producto | Login/seed, conversation, audit, stats contra `ia_ecommerce_db` |
| c | Integration BD cliente | ClientAcl ecommerce ejecuta SELECT allowlist y devuelve filas |
| d | Health real | `/api/health` (o probes) distingue UP/DOWN de app, producto, LLM, cliente |
| e | Gold questions | Lista §7 corrida a mano; fundador marca pass/fail a ojo |

Ningún ítem se da por hecho solo con mocks.

---

## 4. Unit (Domain / Application)

### Qué cubrir

| Módulo | Casos mínimos |
|---|---|
| Identity | `TenantBindingPolicy`; Login OK / fail; host ≠ company → fail |
| Conversation | Solo mensajes del `calendar_day` actual en “today”; persistencia no borra ayer |
| QueryAgent | `IntentGuard`: intent de otro `system_type` rechazado |
| QueryAgent | no-match → sugerencias del sistema; no llama `ClientQuery` |
| QueryAgent | gráfico solo si hay params (`ChartPolicy`) |
| QueryAgent | allowlist: plan con tabla ilegal → no ejecutar |
| QueryAgent | AskQuestion escribe audit (matched / no_match / error) vía puerto; rellena `classify_ms` / `llm_ms` / `build_ms` / `db_ms` / `format_ms` cuando existan |

### Reglas

- Constructor del use case recibe **puertos**, no Prisma/Ollama.
- Prohibido: `import` de adapters en tests unitarios del domain.
- Dobles: `InMemory*` / stubs que registran llamadas.

---

## 5. UI (componentes + hooks)

| Objetivo | Ejemplo |
|---|---|
| Hook de login | Llama `POST /api/auth/login`; maneja 401 vs 200 |
| Hook de chat | Envía mensaje; pinta `answer`, `suggestions`, `chart` |
| Componente chart | Si `chart` es null, no monta Recharts vacío inventado |
| Componente SQL icon | Muestra SQL solo si viene en el DTO (v1) |
| Health panel | Renderiza `up` / `down` / `n/a` por dependencia |

API mockeada (fetch stub o MSW). No abrir MySQL desde el test de componente.

---

## 6. API

| Endpoint | Casos mínimos |
|---|---|
| `POST /api/auth/login` | 200 + cookie; 401 genérico; 404 tenant; body inválido 400 |
| `GET /api/auth/me` | 401 sin cookie; 200 sin secretos |
| `POST /api/agent/ask` | matched / no_match envelopes; 401; 503 si dependencia marcada DOWN |
| `GET /api/conversation/today` | lista vacía o mensajes del día |
| `GET /api/health` | body con `app`, `productDatabase`, `llm`, `clientDatabase` |

Validar **códigos** y forma del JSON (API.md), no el texto exacto del LLM en unit.

---

## 7. Integration

### 7.1 BD producto (`ia_ecommerce_db`)

- Seed: `system_type`, server, company, connection, user, role, suggestions (DATABASE.md §4).
- Probar: login real, append conversation/message, insert audit, upsert `query_stats_daily`.
- No escribir en `ecommerce`.

### 7.2 BD cliente (`ecommerce`)

- Solo SELECT.
- Un test por familia allowlist (count, join sales↔product, inventory, review).
- Assert: `rowCount >= 0` y SQL no contiene verbs distintos de SELECT (spot-check).
- Si la BD está DOWN → test skip o fail explícito + health `down` (no silenciar).

### 7.3 LLM live (tag `live-llm`)

- Corre **solo** si health LLM = UP (si no → skip).
- Input fijo → esperar `matched` con intent razonable **o** documentar no_match para refinar prompts.
- No sustituye el set de oro a ojo.

---

## 8. Health

| Dependencia | Cómo probar |
|---|---|
| App | proceso Next responde |
| MySQL producto | probe / `SELECT 1` |
| LLM | ping al servicio Ollama |
| BD cliente | con sesión: probe o SELECT allowlist mínimo |

Test automatizado puede llamar `GetHealth` y assertar estructura.  
**Operación diaria:** mirar el panel antes de evaluar gold questions.

---

## 9. Gold questions (armar — ecommerce, inglés)

Validación: **fundador a ojo** (resultado coherente + intent razonable + gráfico cuando toca).  
Marcar en checklist: Pass / Fail / Skip + nota. Guardar pregunta en audit ayuda a clasificar después.

| ID | Pregunta (EN) | Intent esperado | Chart |
|---|---|---|---|
| G01 | How many customers do I have? | `count_customers` | no |
| G02 | Show the top 10 customers by sales. | `top_customers_by_sales` | opcional |
| G03 | Which customers spend the most in category Bikes? | `customers_by_category_spend` | opcional |
| G04 | What was the last sale? | `last_sale` | no |
| G05 | What was the sales value over the last 3 months? | `sales_value_over_period` | **yes** |
| G06 | How many products do we have? | `count_products` | no |
| G07 | What are the top selling products? | `top_products_by_sales` | opcional |
| G08 | What are the least sold products? | `least_sold_products` | opcional |
| G09 | How many products are there per category? | `products_by_category` | **yes** |
| G10 | How many products are there per subcategory? | `products_by_subcategory` | **yes** |
| G11 | What is the stock for product 680? | `product_stock` | no |
| G12 | What is the total stock? | `total_stock` | no |
| G13 | What is the average product rating? | `average_rating` | no |
| G14 | What is the worst product review? | `worst_review` | no |
| G15 | What is the rating by product? | `rating_by_product` | opcional |

### Negativos / no-match (también a ojo)

| ID | Pregunta | Esperado |
|---|---|---|
| N01 | Delete all products. | no_match o rechazo; **cero** write |
| N02 | asdf qwer zxcv | no_match + suggestions |
| N03 | What is the low inventory? | no_match o fuera de alcance (low stock **no** en MVP) |

Criterio Pass (ojo): tono formal; datos plausibles vs ecommerce; si chart requerido, aparece; si no_match, hay sugerencias; SQL (icono) es SELECT allowlist.

---

## 10. Organización de archivos (objetivo)

```text
tests/
  unit/
    identity/
    conversation/
    query-agent/
  ui/
    hooks/
    components/
  api/
  integration/
    product-db/
    client-db/
    live-llm/          # skip si LLM DOWN
  health/
fixtures/
  product-seed.sql     # o seed TS
docs/architecture/TESTING.md
```

Scripts sugeridos (al implementar):

| Script | Uso |
|---|---|
| `npm test` | unit + ui + api con dobles |
| `npm run test:integration` | requiere Docker MySQL producto + ecommerce |
| `npm run test:live-llm` | requiere Ollama UP |
| `npm run test:health` | probes |

---

## 11. Qué no hacer en v1

- CI en GitHub Actions (solo local).
- Umbral automático “85% gold pass” (aún es ojo).
- Tests E2E Playwright como puerta (opcional después).
- Escribir en BD cliente desde tests.
- Dar por bueno el agente si solo pasan units con LLM falso.

---

## 12. Checklist pre–día 2

- [ ] Vitest corre unit Domain/Application
- [ ] Tests UI de al menos login hook + chat message render + chart null-safe
- [ ] API tests de login / ask / today / health
- [ ] Integration producto con seed
- [ ] Integration ClientAcl contra ecommerce
- [ ] Health muestra UP/DOWN reales
- [ ] Gold G01–G15 + N01–N03 corridos a ojo y anotados
- [ ] Live-llm: al menos 1 caso cuando Ollama UP (o skip documentado)

---

## 13. Relación con otros docs

| Doc | Aporte |
|---|---|
| [API.md](API.md) | Contratos a assertar |
| [SECURITY.md](SECURITY.md) | No secrets en asserts/logs de test |
| [DATABASE.md](DATABASE.md) | Seed producto |
| [ADR-009](ADR/ADR-009-health.md) | Health no sustituible por mocks |
