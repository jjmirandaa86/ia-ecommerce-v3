# Code Review — IA-ECOMMERCE

Estado: v1 (25 Aug 2026)  
Uso: antes de merge / al cerrar un slice  
Base: DEPENDENCIES, SECURITY, API, TESTING, ADRs

---

## 1. Orden de revisión

1. **Correctitud** vs use case / API contract  
2. **Arquitectura** (capas e imports)  
3. **Seguridad** (auth, SQL, secretos, tenant)  
4. **Tests** y health  
5. **Docs** (¿cambió un ADR/contrato sin actualizar?)

Severidad:

| Marca | Significado |
|---|---|
| Critical | Bloquea merge |
| Should | Corregir en este PR si es razonable |
| Nice | Mejora opcional |

Citar `start:end:path`. Proponer fix concreto. No nitpick de estilo salvo que oculte un bug.

---

## 2. Critical (bloquear)

### Arquitectura

- [ ] `domain/**` importa Next, ORM, Ollama, Recharts, o `client-acl`
- [ ] Application instancia Prisma / `fetch` al LLM / ClientAcl concreto
- [ ] Route handler con SQL, lógica de intención, o negocio (más que validate → use case → JSON)
- [ ] Hook / `"use client"` importa Prisma, env de secretos, o repositorio
- [ ] Entidad `Product` / `SalesOrder` / tablas ecommerce modeladas en **nuestro** domain
- [ ] Identity importa QueryAgent (o al revés a nivel domain entities)
- [ ] ClientAcl elige la intención o llama casos de uso

### Seguridad

- [ ] Endpoint protegido sin verify JWT real (solo “hay cookie”)
- [ ] `companyId` / connection id aceptados desde el **body** del cliente
- [ ] Password, JWT, connection string o `password_encrypted` en logs o response JSON
- [ ] SQL armado concatenando texto del usuario
- [ ] LLM output ejecutado como SQL
- [ ] Write/UPDATE/DELETE hacia BD cliente
- [ ] Tabla fuera de allowlist ecommerce en ClientAcl
- [ ] Registro público o create-user expuesto sin diseño

### Datos / tenant

- [ ] Chat usa otra `client_db_connection` que la del JWT/host
- [ ] Escritura de audit/conversation en BD **cliente**
- [ ] Secretos de conexión en `app_user`

---

## 3. Should (corregir)

- [ ] Body sin validación (Zod o equivalente) en rutas nuevas
- [ ] 500 con stack trace al cliente
- [ ] Error de login que revela si falló user o password
- [ ] Ask sin escribir `ai_query_audit_log` (matched / no_match / error)
- [ ] Ask matched con chart requerido pero sin params → inventa chart
- [ ] no_match sin sugerencias del `system_type`
- [ ] `sql` en response sin contemplar flag futuro de ocultar (documentar al menos)
- [ ] Test del use case que importa adapter real sin tag integration
- [ ] Cambio de classify/builder/ACL sin test unit o integration tocado
- [ ] Health que expone host/password de BD cliente

---

## 4. Nice

- [ ] Mensajes formal English consistentes
- [ ] Nombres de intent alineados al catálogo del TESTING/INTERNAL
- [ ] Upsert `query_stats_daily` en el mismo flujo del ask
- [ ] Skip claro de `live-llm` si Ollama DOWN

---

## 5. Checklist por tipo de cambio

| Si el PR toca… | Revisar además |
|---|---|
| Login / JWT | SECURITY §3–5; cookie flags; host claim |
| Ask / classify | ADR-004; IntentGuard; audit; gold intent |
| ClientAcl / SQL | Allowlist; binds; SELECT only |
| Nuevo `system_type` | ADR-005; suggestions; catálogo intents |
| UI chat/chart | chart null-safe; hook solo `/api` |
| Health | ADR-009; sin secretos |
| DATABASE seed | No tocar schema ecommerce |

---

## 6. Tests mínimos para aprobar

Según [TESTING.md](TESTING.md):

| Cambio | Test esperado |
|---|---|
| Domain policy / plan | Unit Vitest |
| Use case Ask/Login | Unit con dobles |
| Route nueva | API test |
| Hook/componente | UI test |
| SQL builder / ACL | Integration cliente o unit del builder |
| Dependencia externa | No sustituir health por mock “siempre UP” |

Sin CI en v1: el autor debe haber corrido en local lo que aplique (`npm test`, integration si tocó DB).

---

## 7. Forma del feedback

```text
Critical — src/app/api/agent/ask/route.ts:40
Problema: se concatena message al SQL.
Fix: pasar Classification → QueryPlan → ClientQuery con binds.
```

No bloquear por orden de imports o comentarios cosméticos.

---

## 8. Definition of Done (slice)

- [ ] Cumple API.md / SECURITY.md para el slice
- [ ] Sin ítems Critical abiertos
- [ ] Should resueltos o justificados por escrito
- [ ] Tests del §6 verdes en local
- [ ] Si tocó agente: al menos 1 gold question a ojo o nota de defer
- [ ] Docs actualizados si cambió contrato o ADR

---

## 9. Relación

| Doc | Rol |
|---|---|
| [DEPENDENCIES.md](DEPENDENCIES.md) | Imports |
| [SECURITY.md](SECURITY.md) | Controles |
| [API.md](API.md) | Contratos |
| [TESTING.md](TESTING.md) | Evidencia |
| Skill futuro | Automatizar esta checklist en reviews |
