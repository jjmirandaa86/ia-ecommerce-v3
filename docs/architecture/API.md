# API Design — IA-ECOMMERCE

Estado: v1 (25 Aug 2026)  
Base: PRD, ADR-003, MODULES, DATABASE  
Estilo: REST JSON en Next.js Route Handlers (`src/app/api/*`)  
Idioma de payloads de negocio: inglés (mensajes al usuario)

El route handler solo: valida → llama caso de uso → responde. Sin SQL ni Ollama directo.

---

## 1. Convenciones

| Tema | Regla |
|---|---|
| Base URL | mismo origen que la UI (`/` + `/api/...`) |
| Content-Type | `application/json` |
| Auth | cookie httpOnly con JWT (ver SECURITY.md); no Bearer en v1 salvo necesidad |
| Tenant | header `Host` → `client_company.host_key` |
| Fechas | ISO-8601 UTC en JSON |
| Errores | envelope común (§6) |
| Validación | Zod (o equivalente) en el borde HTTP → 400 `VALIDATION` |

Envelope de éxito (opcional pero recomendado):

```json
{ "ok": true, "data": { } }
```

Envelope de error:

```json
{
  "ok": false,
  "error": {
    "code": "VALIDATION",
    "message": "Human-readable formal message in English"
  }
}
```

---

## 2. Mapa de endpoints (v1)

| Método | Path | Auth | Caso de uso | Notas |
|---|---|---|---|---|
| `POST` | `/api/auth/login` | No | `Login` | Rate limit login; body puede incluir `rememberMe` |
| `POST` | `/api/auth/logout` | Sí | — | Borra cookie |
| `GET` | `/api/auth/me` | Sí | — | Sesión + perfil display (nombre, department) |
| `POST` | `/api/agent/ask` | Sí | `AskQuestion` | Pregunta al chat |
| `GET` | `/api/conversation/today` | Sí | `LoadDayConversation` | Hilo del día calendario |
| `GET` | `/api/stats/overview` | Sí | `GetDashboardStats` | KPIs + charts Dashboard (7d default) |
| `GET` | `/api/health` | No* | `GetHealth` | *ver nota abajo |

\* `GET /api/health`: público para probes básicos (app). Detalle de BD cliente / LLM puede exigir auth o limitar campos si no hay sesión (ver §5).

**Fuera de v1:** registro público, CRUD Maintenance, pantallas de audit review UI, APIs admin de empresas.

---

## 3. Auth

### `POST /api/auth/login`

**Request**

```json
{
  "username": "string",
  "password": "string",
  "rememberMe": false
}
```

**Comportamiento**

1. Resolver `Host` → `client_company`.
2. Buscar `app_user` por `(client_company_id, username)`.
3. Verificar password (hash en BD producto).
4. Emitir JWT con claims mínimos: `userId`, `companyId`, `systemTypeCode`, `host`.
5. Set-Cookie httpOnly. Si `rememberMe === true`, TTL largo (ej. 30 días); si no, sesión corta (ej. 8–24h). Ver SECURITY.md.
6. Redirect UI a `/dashboard`.

**Response 200**

```json
{
  "ok": true,
  "data": {
    "user": {
      "id": "1",
      "username": "founder",
      "displayName": "Founder"
    },
    "company": {
      "id": "1",
      "name": "Pilot Co",
      "systemType": "ecommerce"
    }
  }
}
```

**Errores**

| HTTP | code | Cuándo |
|---|---|---|
| 400 | `VALIDATION` | body inválido |
| 401 | `AUTH_INVALID` | user/pass incorrectos o usuario inactivo |
| 404 | `TENANT_NOT_FOUND` | host no mapea a empresa |
| 429 | `RATE_LIMITED` | demasiados intentos |

No revelar si falló el usuario o la contraseña (mensaje genérico).

---

### `POST /api/auth/logout`

**Auth:** sí  
**Response 200:** `{ "ok": true, "data": { "loggedOut": true } }`  
Limpia cookie.

---

### `GET /api/auth/me`

**Auth:** sí  

**Response 200**

```json
{
  "ok": true,
  "data": {
    "user": {
      "id": "1",
      "username": "founder",
      "displayName": "Jeff Miranda",
      "department": "Engineers - IT"
    },
    "company": {
      "id": "1",
      "name": "Pilot Co",
      "systemType": "ecommerce",
      "hostKey": "a.acertijo.dev"
    }
  }
}
```

Sin password, sin connection strings, sin password de BD cliente.

---

## 4. Agent / Conversation

### `POST /api/agent/ask`

**Auth:** sí  

**Request**

```json
{
  "message": "What were sales in the last 3 months?"
}
```

`message`: string, trim, max length recomendado 2000 chars.

**Response 200 — matched**

```json
{
  "ok": true,
  "data": {
    "status": "matched",
    "answer": "Formal English answer summarizing the result.",
    "intentName": "sales_value_over_period",
    "columns": ["month", "total"],
    "rows": [
      { "month": "2026-05", "total": 12345.67 }
    ],
    "chart": {
      "type": "line",
      "xKey": "month",
      "yKeys": ["total"],
      "title": "Sales last 3 months"
    },
    "sql": "SELECT ...",
    "meta": {
      "rowCount": 3,
      "durationMs": 420,
      "auditId": "99"
    }
  }
}
```

- `chart`: **omitido o `null`** si la intención no es gráfica o faltan parámetros (no inventar).
- `sql`: presente en v1 (icono de prueba). Flag futuro para ocultarlo al cliente; el audit siempre lo guarda.

**Response 200 — no_match**

```json
{
  "ok": true,
  "data": {
    "status": "no_match",
    "answer": "I did not understand your request. Please rephrase it.",
    "suggestions": [
      {
        "topic": "sales",
        "text": "What was the sales value over the last 3 months?"
      }
    ],
    "meta": { "auditId": "100" }
  }
}
```

Sugerencias filtradas por `system_type` del tenant; si el mensaje sugiere un topic (sales, inventory, …), priorizar ese topic.

**Errores**

| HTTP | code | Cuándo |
|---|---|---|
| 400 | `VALIDATION` | message vacío / demasiado largo |
| 401 | `UNAUTHORIZED` | sin sesión |
| 503 | `DEPENDENCY_DOWN` | LLM o BD cliente DOWN |
| 500 | `INTERNAL` | fallo inesperado (mensaje genérico) |

Siempre intentar escribir audit (matched / no_match / error) y actualizar `query_stats_daily`.

---

### `GET /api/conversation/today`

**Auth:** sí  

**Response 200**

```json
{
  "ok": true,
  "data": {
    "calendarDay": "2026-08-25",
    "conversationId": "10",
    "messages": [
      {
        "id": "1",
        "role": "user",
        "content": "...",
        "createdAt": "2026-08-25T02:00:00.000Z"
      },
      {
        "id": "2",
        "role": "assistant",
        "content": "...",
        "createdAt": "2026-08-25T02:00:01.000Z",
        "auditId": "99"
      }
    ]
  }
}
```

Si no hay mensajes hoy: `messages: []` (crear conversación lazy en el primer ask o aquí).

---

## 4b. Dashboard stats

### `GET /api/stats/overview`

**Auth:** sí  
**Query (opcional):** `days=7` (default 7, max 90)

**Response 200**

```json
{
  "ok": true,
  "data": {
    "periodDays": 7,
    "kpis": {
      "totalQueries": 0,
      "successRate": 0,
      "avgResponseMs": 0,
      "avgLlmMs": 0,
      "avgDbMs": 0
    },
    "queriesOverTime": [
      { "date": "2026-08-19", "count": 0 }
    ],
    "latencyByService": [
      { "service": "Classify", "avgMs": 0 },
      { "service": "LLM", "avgMs": 0 },
      { "service": "Build SQL", "avgMs": 0 },
      { "service": "Database", "avgMs": 0 },
      { "service": "Format", "avgMs": 0 }
    ],
    "queriesByEntity": [
      { "entity": "product", "count": 0 }
    ],
    "queriesByCost": [
      {
        "name": "product",
        "value": 0,
        "count": 0,
        "avgMs": 0,
        "children": [
          {
            "name": "count_products",
            "value": 0,
            "count": 0,
            "avgMs": 0,
            "children": [
              { "name": "llm", "value": 0, "count": 0, "avgMs": 0 }
            ]
          }
        ]
      }
    ]
  }
}
```

Fuente: `ai_query_audit_log` (+ agregados `query_stats_daily` si se usan).  
`successRate` = matched / total (excluir o incluir error según implementación; documentar en código).

---

## 5. Health

### `GET /api/health`

**Auth:** no para el resumen mínimo; con sesión se puede enriquecer BD cliente del tenant.

**Response 200** (siempre 200 si Next responde; el detalle va en el body)

```json
{
  "ok": true,
  "data": {
    "app": { "status": "up" },
    "productDatabase": { "status": "up", "latencyMs": 12 },
    "llm": { "status": "down", "detail": "connection refused" },
    "clientDatabase": { "status": "n/a", "detail": "no session" }
  }
}
```

Con sesión autenticada:

```json
"clientDatabase": { "status": "up", "latencyMs": 30, "engine": "mysql" }
```

Valores de `status`: `up` | `down` | `n/a`.

No incluir connection strings, passwords ni SQL de prueba aquí.

---

## 6. Códigos de error (catálogo)

| code | HTTP típico | Uso |
|---|---|---|
| `VALIDATION` | 400 | body / query inválido |
| `UNAUTHORIZED` | 401 | falta o JWT inválido |
| `AUTH_INVALID` | 401 | login fallido |
| `TENANT_NOT_FOUND` | 404 | host desconocido |
| `FORBIDDEN` | 403 | reservado (roles v1.1) |
| `RATE_LIMITED` | 429 | login / ask abusivo |
| `DEPENDENCY_DOWN` | 503 | LLM o BD requerida caída |
| `INTERNAL` | 500 | genérico; sin stack al cliente |

---

## 7. Mapeo UI → API

| Pantalla / acción | Endpoint |
|---|---|
| Login form | `POST /api/auth/login` → UI `/dashboard` |
| Logout | `POST /api/auth/logout` |
| Bootstrap sesión / UserMenu | `GET /api/auth/me` |
| Enviar pregunta | `POST /api/agent/ask` |
| Cargar chat del día | `GET /api/conversation/today` |
| Dashboard | `GET /api/stats/overview` |
| Panel health | `GET /api/health` |
| Recharts (agent + dashboard) | DTOs `chart` / series del overview |

---

## 8. Fuera de alcance de esta API (v1)

- Endpoints admin para crear empresas / users (seed ORM).
- Marcar `reviewed` en audit (consulta directa a BD por fundador).
- WebSockets / streaming del LLM.
- Registro público.
- **Maintenance / CRUD** desde el frontend.

---

## 9. Relación con capas

```text
Route Handler  →  Application use case  →  Domain + ports
     ↑                    ↓
  Zod DTO            Response DTO (sin entidades Prisma)
```

Presentation hooks llaman solo estos paths.
