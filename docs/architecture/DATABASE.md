# Database Design — IA-ECOMMERCE (BD producto)

Estado: propuesto y confirmado (25 Aug 2026)  
Base: `docs/product/PRD.md`, ADR-002, respuestas de diseño DB  
Nombre de la base: **`ia_ecommerce_db`**  
Motor: MySQL  
Alcance: **solo** la BD del producto (login, dashboard, conversación, audit, **configuración de conexión al cliente**).  
La BD cliente (`ecommerce`, etc.) **no se modifica**; su conexión se guarda en `client_db_server` + `client_db_connection`.

### Flujo runtime

```text
.env → Prisma conecta a ia_ecommerce_db
Usuario hace login (app_user en ia_ecommerce_db)
  → JWT con companyId
  → App lee client_db_connection (+ client_db_server) de ESA empresa
  → Abre conexión SOLO LECTURA a la BD del cliente
  → Chat / agent consulta ahí; historial y stats quedan en ia_ecommerce_db
```

`CLIENT_DB_NAME` **no** va en `.env`. El nombre de la BD cliente y la conexión viven en `client_db_server` + `client_db_connection` (relacionados a `client_company` → `app_user`). El seed los escribe desde `prisma/seed-data.ts`.

---

## 1. Principios

| Regla | Detalle |
|---|---|
| Dos mundos | Escritura aquí; lectura en la BD del cliente |
| Conexión ≠ usuario | Credenciales y servidor del cliente **nunca** en `app_user` |
| Servidor aparte | Host/puerto/motor viven en `client_db_server`; la empresa se enlaza vía `client_db_connection` |
| 1 empresa = 1 BD (v1) | Una `client_db_connection` activa por `client_company` |
| Username | Único **por empresa** (`UNIQUE(client_company_id, username)`) |
| Roles | Tablas listas; **no** se aplican permisos en v1 |
| Stats + audit | `ai_query_audit_log` (detalle) + `query_stats_daily` (agregado) desde el MVP |

---

## 2. Diagrama (ER lógico)

```text
system_type
     │
     ├── suggestion_example
     │
     └── client_company
              │
              ├── app_user ── user_role ── role ── role_permission ── permission
              │
              └── client_db_connection ── client_db_server
                       (database_name, user, password)
                       (host, port, engine, ssl)

app_user / client_company
     │
     ├── conversation ── message
     ├── ai_query_audit_log
     └── query_stats_daily
```

---

## 3. Tablas

### 3.1 `system_type`

Catálogo de sistemas (intents/sugerencias compartidos por código).

| Columna | Tipo | Constraints |
|---|---|---|
| `id` | BIGINT UNSIGNED | PK, AI |
| `code` | VARCHAR(32) | UNIQUE NOT NULL — `ecommerce`, `sap`, `xerox` |
| `name` | VARCHAR(100) | NOT NULL |
| `is_active` | TINYINT(1) | NOT NULL DEFAULT 1 |
| `created_at` | DATETIME(3) | NOT NULL |
| `updated_at` | DATETIME(3) | NOT NULL |

**Seed v1:** `ecommerce` (active); `sap`, `xerox` (pueden existir inactivas).

---

### 3.2 `client_company`

Empresa / tenant.

| Columna | Tipo | Constraints |
|---|---|---|
| `id` | BIGINT UNSIGNED | PK, AI |
| `system_type_id` | BIGINT UNSIGNED | FK → `system_type.id` NOT NULL |
| `name` | VARCHAR(150) | NOT NULL |
| `host_key` | VARCHAR(120) | UNIQUE NOT NULL — ej. `a.acertijo.dev` |
| `is_active` | TINYINT(1) | NOT NULL DEFAULT 1 |
| `created_at` | DATETIME(3) | NOT NULL |
| `updated_at` | DATETIME(3) | NOT NULL |

Índice: `system_type_id`.

---

### 3.3 `client_db_server`

Servidor de base de datos del cliente (sin credenciales de login a una DB concreta).

| Columna | Tipo | Constraints |
|---|---|---|
| `id` | BIGINT UNSIGNED | PK, AI |
| `name` | VARCHAR(120) | NOT NULL — etiqueta interna |
| `engine` | VARCHAR(32) | NOT NULL — `mysql`, `oracle`, … |
| `host` | VARCHAR(255) | NOT NULL |
| `port` | INT UNSIGNED | NOT NULL |
| `ssl_enabled` | TINYINT(1) | NOT NULL DEFAULT 0 |
| `is_active` | TINYINT(1) | NOT NULL DEFAULT 1 |
| `created_at` | DATETIME(3) | NOT NULL |
| `updated_at` | DATETIME(3) | NOT NULL |

Índice sugerido: `(engine, host, port)`.

Varias empresas **pueden** apuntar al mismo servidor físico (misma fila) con distintas bases/credenciales en `client_db_connection`.

---

### 3.4 `client_db_connection`

Enlace empresa → servidor + base + credenciales de **solo lectura**.  
**Aparte de `app_user`.** Relación: `client_company` → `client_db_connection` → `client_db_server`.

| Columna | Tipo | Constraints |
|---|---|---|
| `id` | BIGINT UNSIGNED | PK, AI |
| `client_company_id` | BIGINT UNSIGNED | FK → `client_company.id` **UNIQUE** NOT NULL (1:1 en v1) |
| `client_db_server_id` | BIGINT UNSIGNED | FK → `client_db_server.id` NOT NULL |
| `database_name` | VARCHAR(128) | NOT NULL — ej. `ecommerce` |
| `username` | VARCHAR(128) | NOT NULL |
| `password_encrypted` | TEXT | NOT NULL — cifrado por la app; nunca en claro |
| `is_active` | TINYINT(1) | NOT NULL DEFAULT 1 |
| `created_at` | DATETIME(3) | NOT NULL |
| `updated_at` | DATETIME(3) | NOT NULL |

No hay columna URL única: host/port/engine van en el **servidor**; nombre de base y user/password aquí.

Al login: `host_key` → company → connection → server + database_name → chat lee solo ahí.

---

### 3.5 `role`

| Columna | Tipo | Constraints |
|---|---|---|
| `id` | BIGINT UNSIGNED | PK, AI |
| `code` | VARCHAR(64) | UNIQUE NOT NULL — `owner`, `manager`, `operator` |
| `name` | VARCHAR(100) | NOT NULL |
| `description` | VARCHAR(255) | NULL |
| `created_at` | DATETIME(3) | NOT NULL |

**Seed:** al menos `owner`. En v1 no se usa para autorizar.

---

### 3.6 `permission`

| Columna | Tipo | Constraints |
|---|---|---|
| `id` | BIGINT UNSIGNED | PK, AI |
| `code` | VARCHAR(64) | UNIQUE NOT NULL — ej. `chat.ask`, `chat.view_sql`, `audit.review` |
| `name` | VARCHAR(100) | NOT NULL |
| `created_at` | DATETIME(3) | NOT NULL |

Estructura lista; seed opcional; **no se chequea en v1**.

---

### 3.7 `role_permission`

| Columna | Tipo | Constraints |
|---|---|---|
| `role_id` | BIGINT UNSIGNED | FK → `role.id` |
| `permission_id` | BIGINT UNSIGNED | FK → `permission.id` |
| PK | | (`role_id`, `permission_id`) |

---

### 3.8 `app_user`

| Columna | Tipo | Constraints |
|---|---|---|
| `id` | BIGINT UNSIGNED | PK, AI |
| `client_company_id` | BIGINT UNSIGNED | FK → `client_company.id` NOT NULL |
| `username` | VARCHAR(80) | NOT NULL |
| `password_hash` | VARCHAR(255) | NOT NULL |
| `display_name` | VARCHAR(120) | NULL |
| `department` | VARCHAR(120) | NULL — solo display menú usuario (v1) |
| `is_active` | TINYINT(1) | NOT NULL DEFAULT 1 |
| `last_login_at` | DATETIME(3) | NULL |
| `created_at` | DATETIME(3) | NOT NULL |
| `updated_at` | DATETIME(3) | NOT NULL |

**UNIQUE** (`client_company_id`, `username`).

Sin campos de host/DB/credenciales cliente.  
Menú UI: `display_name`, `department`.

---

### 3.9 `user_role`

| Columna | Tipo | Constraints |
|---|---|---|
| `app_user_id` | BIGINT UNSIGNED | FK → `app_user.id` |
| `role_id` | BIGINT UNSIGNED | FK → `role.id` |
| PK | | (`app_user_id`, `role_id`) |

Piloto: tu usuario + `owner`.

---

### 3.10 `suggestion_example`

| Columna | Tipo | Constraints |
|---|---|---|
| `id` | BIGINT UNSIGNED | PK, AI |
| `system_type_id` | BIGINT UNSIGNED | FK → `system_type.id` NOT NULL |
| `topic` | VARCHAR(32) | NOT NULL — `sales`, `inventory`, `review`, `product`, `customer` |
| `example_text` | VARCHAR(500) | NOT NULL — inglés |
| `sort_order` | INT | NOT NULL DEFAULT 0 |
| `is_active` | TINYINT(1) | NOT NULL DEFAULT 1 |
| `created_at` | DATETIME(3) | NOT NULL |

Índice: (`system_type_id`, `topic`, `is_active`).

---

### 3.11 `conversation`

| Columna | Tipo | Constraints |
|---|---|---|
| `id` | BIGINT UNSIGNED | PK, AI |
| `app_user_id` | BIGINT UNSIGNED | FK → `app_user.id` NOT NULL |
| `client_company_id` | BIGINT UNSIGNED | FK → `client_company.id` NOT NULL |
| `calendar_day` | DATE | NOT NULL — día de la UI |
| `created_at` | DATETIME(3) | NOT NULL |
| `updated_at` | DATETIME(3) | NOT NULL |

**UNIQUE** (`app_user_id`, `calendar_day`).

UI muestra solo el día actual; las filas de días anteriores se conservan.

---

### 3.12 `message`

| Columna | Tipo | Constraints |
|---|---|---|
| `id` | BIGINT UNSIGNED | PK, AI |
| `conversation_id` | BIGINT UNSIGNED | FK → `conversation.id` NOT NULL |
| `role` | ENUM('user','assistant') | NOT NULL |
| `content` | TEXT | NOT NULL |
| `ai_query_audit_log_id` | BIGINT UNSIGNED | NULL FK → `ai_query_audit_log.id` |
| `created_at` | DATETIME(3) | NOT NULL |

Índice: (`conversation_id`, `created_at`).

---

### 3.13 `ai_query_audit_log`

Detalle de cada consulta (mejora continua + SQL de prueba).

| Columna | Tipo | Constraints |
|---|---|---|
| `id` | BIGINT UNSIGNED | PK, AI |
| `app_user_id` | BIGINT UNSIGNED | FK NOT NULL |
| `client_company_id` | BIGINT UNSIGNED | FK NOT NULL |
| `system_type_id` | BIGINT UNSIGNED | FK NOT NULL |
| `conversation_id` | BIGINT UNSIGNED | NULL FK |
| `message_id` | BIGINT UNSIGNED | NULL FK → `message.id` |
| `user_question` | TEXT | NOT NULL |
| `classification_status` | ENUM('matched','no_match','error') | NOT NULL |
| `intent_name` | VARCHAR(64) | NULL |
| `intent_json` | JSON | NULL |
| `executed_sql` | TEXT | NULL |
| `row_count` | INT | NULL |
| `duration_ms` | INT | NULL — total end-to-end |
| `classify_ms` | INT | NULL — etapa Classify (Dashboard) |
| `llm_ms` | INT | NULL — Classification / LLM |
| `build_ms` | INT | NULL — Build SQL |
| `db_ms` | INT | NULL — Database execution |
| `format_ms` | INT | NULL — Format response |
| `had_chart` | TINYINT(1) | NOT NULL DEFAULT 0 |
| `error_message` | TEXT | NULL |
| `reviewed` | TINYINT(1) | NOT NULL DEFAULT 0 |
| `reviewed_at` | DATETIME(3) | NULL |
| `reviewed_notes` | VARCHAR(500) | NULL |
| `created_at` | DATETIME(3) | NOT NULL |

Índices: (`client_company_id`, `created_at`), (`app_user_id`, `created_at`), (`reviewed`, `created_at`), (`intent_name`).

Nota: FK circular `message` ↔ `audit` — crear tablas, luego FKs opcionales; o guardar `ai_query_audit_log_id` en message en un segundo update.

---

### 3.14 `query_stats_daily`

Agregados diarios (MVP desde día 1). No sustituye el audit.

| Columna | Tipo | Constraints |
|---|---|---|
| `id` | BIGINT UNSIGNED | PK, AI |
| `stats_date` | DATE | NOT NULL |
| `client_company_id` | BIGINT UNSIGNED | FK NOT NULL |
| `app_user_id` | BIGINT UNSIGNED | NULL FK — NULL = total empresa |
| `system_type_id` | BIGINT UNSIGNED | FK NOT NULL |
| `intent_name` | VARCHAR(64) | NULL — NULL = bucket agregador / no_match |
| `topic` | VARCHAR(32) | NULL |
| `total_queries` | INT UNSIGNED | NOT NULL DEFAULT 0 |
| `matched_count` | INT UNSIGNED | NOT NULL DEFAULT 0 |
| `no_match_count` | INT UNSIGNED | NOT NULL DEFAULT 0 |
| `error_count` | INT UNSIGNED | NOT NULL DEFAULT 0 |
| `avg_duration_ms` | INT UNSIGNED | NULL |
| `updated_at` | DATETIME(3) | NOT NULL |

**UNIQUE** (`stats_date`, `client_company_id`, `app_user_id`, `intent_name`)  
(usar valor centinela o columna generada si MySQL trata mal NULL en UNIQUE; al implementar: `app_user_id` 0 / `intent_name` `*` como convencción, o unique parcial).

Actualización: al cerrar cada `AskQuestion` (upsert) y/o job diario desde el audit.

---

## 4. Seed mínimo del piloto

| Tabla | Contenido |
|---|---|
| `system_type` | `ecommerce` active |
| `client_db_server` | host/port/engine del MySQL donde vive `ecommerce` |
| `client_company` | 1 empresa + `host_key` |
| `client_db_connection` | `database_name=ecommerce`, user RO, password cifrada |
| `role` | `owner` |
| `app_user` | usuario de prueba vía **ORM seed** (username/password documentados en `.env.example`, no en git) + `display_name`, `department` |
| `user_role` | user → owner |
| `suggestion_example` | ejemplos ecommerce por topic |
| `permission` / `role_permission` | opcionales / vacíos |
| connection + server | apuntan a MySQL `ecommerce` RO |

---

## 5. Fuera de esta BD

- Tablas `product`, `salesorderheader`, etc. → solo en BD **cliente**.
- No crear `ai_query_audit_log` en `ecommerce`.
- Intents detallados pueden vivir en código (catálogo 80/20) y/o ampliarse después; no son obligatorios como tabla en este diseño.

---

## 6. Confirmaciones aplicadas

| # | Decisión |
|---|---|
| 1 | Columnas separadas; **tabla aparte del usuario**; **`client_db_server`** + **`client_db_connection`** |
| 2 | `query_stats_daily` en el MVP |
| 3 | Roles: solo tablas; sin enforce en v1 |
| 4 | Username único por empresa |
| 5 | Nombre BD producto: `ia_ecommerce_db` |

---

## 7. Prisma schema (producto)

Un archivo por tabla en `prisma/schema/`. Generator y datasource viven en `prisma/schema/schema.prisma`. Las relaciones cruzan archivos; Prisma concatena el folder al generar el client.
