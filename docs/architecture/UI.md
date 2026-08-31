# UI Map — IA-ECOMMERCE

Estado: decisions cerradas (25 Aug 2026)  
Capturas: `docs/architecture/ui/screenshots/`  
Stack UI: **Mantine** + **Recharts** + **react-icons**

---

## 0. Decisiones confirmadas

| # | Decisión |
|---|---|
| 1 | MVP pantallas: **Login**, **Dashboard**, **Agent**, **Health** |
| 2 | Dashboard con **charts** (KPIs + series + latency by stage + by intent); UI con Mantine / Recharts / react-icons |
| 3 | Debe funcionar con tablas de `ia_ecommerce_db` + **usuario de prueba seed vía ORM** |
| 4 | Menú usuario **se mantiene** (nombre, departamento) para mostrar datos de perfil |
| 5 | **No Maintenance** — cero CRUD de BD desde el frontend |
| — | Post-login default: **`/dashboard`** |
| — | Subtítulo Agent: **no LangGraph** → “Intent JSON + safe SQL” |
| — | Remember me: **sí** (cookie/JWT más larga si checked) |

---

## 1. Pantallas

| # | Archivo | Ruta | Auth |
|---|---|---|---|
| 01 | [screenshots/01-dashboard.png](ui/screenshots/01-dashboard.png) | `/dashboard` | sí |
| 02–03 | [02](ui/screenshots/02-sql-agent.png) / [03](ui/screenshots/03-sql-agent-user-menu.png) | `/agent` | sí |
| 04 | [screenshots/04-login.png](ui/screenshots/04-login.png) | `/login` | no |
| — | (no captura aún) | `/health` | sí |

---

## 2. Shell (post-login)

| Pieza | Comportamiento v3 |
|---|---|
| Brand | `ia-ecommerce` |
| Nav Dashboard | `/dashboard` |
| Nav Agent | `/agent` — subtítulo: Intent JSON + safe SQL |
| Nav Health | `/health` — UP/DOWN dependencias |
| Nav Maintenance | **No renderizar** |
| User menu | `displayName`, `department` desde `GET /api/auth/me` + Sign out |
| Stack | Mantine AppShell + react-icons |

---

## 3. Login

| UI | API |
|---|---|
| Username (label: Username, no “email” obligatorio) | `POST /api/auth/login` `{ username, password, rememberMe?: boolean }` |
| Password + eye | |
| Remember me | `rememberMe: true` → cookie/JWT TTL largo (ver SECURITY) |
| Sign in | → redirect `/dashboard` |

Seed: usuario de prueba en ORM (ver DATABASE seed).

---

## 4. Agent (`/agent`)

| UI | API / datos |
|---|---|
| Welcome bubble | copy sin LangGraph |
| Thread del día | `GET /api/conversation/today` |
| Send | `POST /api/agent/ask` |
| Bombilla | suggestions por `system_type` |
| Table / Chart | `rows` + `chart` (Recharts) |
| SQL icon | `sql` (v1 testing) |
| Placeholder | ejemplo gold EN (no “Black products under $50”) |

---

## 5. Dashboard (`/dashboard`)

| Bloque | Fuente |
|---|---|
| Total Queries (7d) | `GET /api/stats/overview` |
| Success Rate | matched / total |
| Avg Response | avg `duration_ms` |
| Avg LLM Time | avg `llm_ms` (audit) |
| Avg DB Time | avg `db_ms` (audit) |
| Queries over time | series diaria |
| Latency by service | Classify / LLM / Build SQL / Database / Format |
| Queries by entity | conteo por módulo de intent (`product`, `review`, …) |
| Queries that cost the most | treemap anidado: entidad → intent → heuristic/LLM (`duration_ms` total) |

UI: Mantine cards + Recharts line/bar + react-icons.

---

## 6. Health (`/health`)

| UI | API |
|---|---|
| Lista app / product DB / LLM / client DB | `GET /api/health` |
| status up \| down \| n/a | sin secretos |

---

## 7. Componentes (Implementation)

```text
presentation/
  shell/AppShell, Sidebar, UserMenu
  auth/LoginForm
  charts/   # reusable Recharts (data-only): DashedLine, Bar, Pie, RadialBar, Treemap
  dashboard/DashboardPanel, KpiCard
  agent/ChatThread, ChatBubble, ChatComposer, SuggestionPanel, SqlIcon, ResultTable, ResultChart
  health/HealthStatusList
```

Hooks solo hablan a `/api/*`.

---

## 8. Fuera de alcance UI

- Maintenance / CRUD  
- LangGraph en copy  
- Editar empresa/conexión desde UI (seed/ops)
