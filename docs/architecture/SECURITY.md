# Security — IA-ECOMMERCE

Estado: v1 (25 Aug 2026)  
Base: PRD, ADR-002/004/007/009, DATABASE, API  
Aplica a la app Next + BD producto + acceso de solo lectura a BD cliente.

---

## 1. Objetivos

| Objetivo | Cómo |
|---|---|
| Solo dueños de la información | Login en BD producto; sin registro público |
| Aislamiento por empresa | Tenant por `Host` + JWT con `companyId` |
| El LLM no ejecuta poder | Solo JSON de intención; SQL lo arma ClientAcl |
| Cliente intacto | SELECT only; cero writes; cero tablas nuestras en ecommerce |
| Secretos fuera del cliente HTTP | Cookie httpOnly; passwords cifrados/hasheados; no logs sensibles |
| Visibilidad operativa | Health UP/DOWN sin filtrar secretos |

---

## 2. Superficie de ataque (v1)

| Activo | Riesgo principal | Control |
|---|---|---|
| JWT / cookie de sesión | Robo / reutilización cross-tenant | httpOnly, SameSite=Lax, Secure en prod, claims ligados a host/company |
| Password de `app_user` | Fuerza bruta / leak | Hash; rate limit login; mensaje genérico |
| Credenciales BD cliente | Exfiltración | Tabla aparte; cifradas en reposo; nunca en API responses |
| Texto del usuario en el chat | Inyección SQL / prompt abuse | No concatenar a SQL; catálogo fijo; allowlist |
| `executed_sql` en UI | Fuga de esquema | Solo v1 (fundador); ocultar después; no a compradores |
| LLM | Alucinación de SQL/tablas | Ignorar cualquier SQL del modelo; solo `Classification` |
| Multi-tenant | Ver datos de otra empresa | Conexión solo desde `client_db_connection` de la empresa del JWT |

---

## 3. Autenticación

### Login

- Credenciales en `app_user` (BD **`ia_ecommerce_db`**).
- Username único por empresa (`client_company_id` + `username`).
- Resolver tenant: `Host` → `client_company.host_key` **antes** de validar user.
- Si el usuario pertenece a otra empresa que el host → `AUTH_INVALID` (no filtrar datos).
- Sin registro público; usuarios creados por seed/ops.

### Password hashing (app users)

- Algoritmo moderno (bcrypt o argon2) en BD producto.
- Verificación timing-safe vía puerto `PasswordVerifier`.
- No reutilizar el hash AdventureWorks del cliente ecommerce (ese hash es de **otro** sistema).

### Sesión JWT

| Claim | Uso |
|---|---|
| `sub` / `userId` | `app_user.id` |
| `companyId` | `client_company.id` |
| `systemType` | code (`ecommerce`, …) |
| `host` | host_key con el que se emitió |
| `exp` | expiración (p. ej. 8–24h; definir al implementar) |

Cookie:

| Atributo | Valor v1 |
|---|---|
| HttpOnly | sí |
| SameSite | `Lax` |
| Secure | sí en production |
| Path | `/` |
| Name | desde env (ej. `ia_ecommerce_session`) |
| Max-Age / Expires | sesión corta por defecto; si login con `rememberMe: true`, TTL largo (ej. 30 días) |

Middleware puede comprobar **presencia** de cookie; la verificación criptográfica es en el handler / `requireAuth` (no confiar solo en “hay cookie”).

En cada request autenticada: `host` del claim debe coincidir con el `Host` actual (anti cross-subdomain).

### Remember me

- Body `rememberMe: true` en login → JWT `exp` y cookie Max-Age extendidos.
- `false` u omitido → TTL de sesión de trabajo (8–24h).
- No guardar password en el cliente.

### Logout

Invalidar cookie (Max-Age=0). Sin blacklist de JWT en v1 (aceptable con TTL corto).

---

## 4. Autorización

| Fase | Regla |
|---|---|
| v1 | Usuario autenticado de la empresa ve **todos** los datos de **su** BD cliente (solo lectura) |
| v1 | Tablas `role` / `permission` / `user_role` existen; **no** se enforcean |
| v1.1+ | Filtrar por rol/departamento según `permission.code` |

Endpoints protegidos por defecto (ver API.md). Públicos: `POST /api/auth/login`, `GET /api/health` (campos limitados).

No hay endpoint de “impersonate” ni de cambio de empresa en v1.

---

## 5. Tenancy

1. `Host` → `client_company`.
2. Login solo contra users de esa company.
3. JWT lleva `companyId` + `host`.
4. `AskQuestion` usa **solo** `client_db_connection` de esa company → `client_db_server` + database.
5. Nunca aceptar `companyId` o connection id desde el body del cliente.

Violación → 401/403 sin datos de otra empresa.

---

## 6. Motor de consultas (anti-inyección / anti-alucinación)

| Regla | Detalle |
|---|---|
| LLM | Entrada: texto + `system_type`. Salida: JSON de intención o no_match. **Descartar** SQL si el modelo lo inventa |
| Catálogo | Solo intents del `system_type` del tenant |
| SQL | Construido en ClientAcl: patrón `1=1` + filtros; **parámetros bindeados** |
| Verb | Solo `SELECT` |
| Allowlist ecommerce | `product`, `productsubcategory`, `productcategory`, `salesorderheader`, `salesorderdetail`, `customer`, `individual`, `contact`, `productinventory`, `productreview` |
| Prohibido | Concatenar `message` del usuario al SQL; multi-statement; DDL/DML |

Si el plan pide tabla fuera de allowlist → no ejecutar; audit `error` / no_match según política.

---

## 7. Secretos y datos sensibles

### En entorno / vault

| Secreto | Uso |
|---|---|
| `JWT_SECRET` | Firmar/verificar sesión |
| `DATABASE_URL` | MySQL `ia_ecommerce_db` |
| `CLIENT_DB_SECRET_KEY` (o similar) | Cifrar/descifrar `password_encrypted` de conexiones cliente |
| URL LLM | Endpoint Ollama/servicio |

Nunca commitear `.env`. No exponer en `GET /api/health` ni en respuestas JSON.

### En BD producto

| Campo | Tratamiento |
|---|---|
| `app_user.password_hash` | hash; irreversible |
| `client_db_connection.password_encrypted` | cifrado en reposo; descifrado solo en Infrastructure al abrir conexión |
| `ai_query_audit_log.executed_sql` | visible en API v1 al usuario autenticado (piloto); restringir después |

### No loguear

- Passwords (login o BD cliente)
- JWT completo / `Authorization`
- Connection strings con password
- `password_encrypted` en claro

---

## 8. Validación de entrada

- Bodies con schema (Zod): login, ask.
- Límites de tamaño (`message` max ~2000).
- Caracteres/control: no se pasan al SQL; solo al clasificador como texto.
- Errores 400 `VALIDATION` sin filtrar stack.

Respuestas 500: mensaje genérico formal en inglés; detalle solo en logs servidor.

---

## 9. Rate limiting

| Endpoint | Motivo |
|---|---|
| `POST /api/auth/login` | Fuerza bruta |
| `POST /api/agent/ask` | Abuso de LLM / BD cliente |

Implementación v1: en memoria o simple (un proceso). No Redis (ADR-008).

---

## 10. Transport & cookies

- HTTPS en producción (`Secure` cookie).
- Same origin UI + API → sin CORS abierto a terceros en v1.
- No poner secretos en LocalStorage.

---

## 11. Health sin fuga

`GET /api/health` puede decir `up`/`down`/`n/a` y latencia.  
No debe devolver host/password de BD cliente, JWT secret, ni filas de negocio.

BD cliente: solo con sesión (tenant conocido) o `n/a`.

---

## 12. Threat model corto (STRIDE resumido)

| Amenaza | Mitigación v1 |
|---|---|
| Spoofing identidad | JWT firmado + verify en servidor |
| Tampering SQL | Binds + allowlist + no LLM-SQL |
| Repudiation | `ai_query_audit_log` por pregunta |
| Information disclosure | Sin secretos en API; tenant isolation; SQL UI temporal |
| Denial of service | Rate limit login/ask; health para detectar caídas |
| Elevation of privilege | Sin enforce de roles aún; no endpoints admin públicos |

---

## 13. Checklist pre-implementación

- [ ] Cookie httpOnly + SameSite + Secure(prod)
- [ ] Login rate-limited; error genérico
- [ ] JWT verify en cada ruta protegida; host claim = Host
- [ ] Credenciales cliente solo en `client_db_connection` + server; cifradas
- [ ] ClientAcl SELECT + allowlist + binds
- [ ] LLM nunca ejecuta SQL
- [ ] No logs de passwords/JWT/connection secrets
- [ ] 500 genérico al cliente
- [ ] Health sin secretos

---

## 14. Relación con otros docs

| Doc | Qué aporta |
|---|---|
| [API.md](API.md) | Contratos a proteger |
| [DATABASE.md](DATABASE.md) | Dónde viven secretos y audit |
| [ADR-004](ADR/ADR-004-query-engine.md) | LLM no escribe SQL |
| [ADR-007](ADR/ADR-007-tenancy.md) | Tenant por host |
| [ADR-009](ADR/ADR-009-health.md) | UP/DOWN |
