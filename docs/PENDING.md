# Pendientes — IA-ECOMMERCE v3

Lista viva de trabajo diferido. No sustituye issues; sirve para no perder decisiones a medias.

---

## Client DB engines (health + ClientAcl)

**Estado:** solo **MySQL** conecta y hace ping real en `GET /api/health`.

**Hoy**

- Motor leído de `client_db_server.engine`
- Si `mysql` → prueba de conexión a `client_db_connection.database_name` (piloto: `ecommerce`)
- Cualquier otro valor → `status: down`, `detail: unsupported engine: …` (no hay driver)

**Revisar después**

- [ ] Definir allowlist canónica de engines (`mysql`, `oracle`, `sqlserver` / `mssql`, `mongodb`, …) y normalizar valores en seed/UI
- [ ] Adapter de ping por motor (mismo puerto que health / ClientAcl)
- [ ] Adapter de query read-only por motor (ClientAcl) — Oracle, SQL Server, Mongo, etc.
- [ ] Health: distinguir `unsupported` vs `down` (caída real) en UI/API
- [ ] Credenciales / SSL / connection options por motor en `client_db_server` + `client_db_connection`

**Referencias:** `src/infrastructure/db/client-db-ping.ts`, `docs/architecture/DATABASE.md` (`client_db_server.engine`)

---

## Otros (MVP pendiente de cablear)

- [x] Agent MVP: `count_products` via classify → ClientAcl SELECT → audit (`POST /api/agent/ask`)
- [x] Intents por tabla/módulo (`src/query-agent/domain/tables/product.ts` + registry)
- [ ] More ecommerce intents (sales, categories leftovers, inventory, reviews) en módulos por tabla
- [ ] Proteger rutas AppShell en middleware (hoy el shell redirige a login si 401)
- [x] Dashboard: `GET /api/stats/overview` + charts Recharts (from `ai_query_audit_log`)
- [ ] Health con sesión: preferir tenant por JWT (hoy también resuelve por `Host`)
