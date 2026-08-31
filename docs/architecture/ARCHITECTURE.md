# Arquitectura — IA-ECOMMERCE

Estado: decisión (25 Aug 2026)  
Producto: `docs/product/PRD.md`  
Módulos: `MODULES.md`  
Dependencias: `DEPENDENCIES.md`  
Decisiones: `ADR/`

---

## Decisión

**Modular monolith (Next.js: UI + API) con puertos y adaptadores por dentro.**

Un binario de aplicación. MySQL producto y LLM son procesos de **infra**, no microservicios de negocio. El ERP del cliente es de solo lectura, detrás de un ACL por `system_type`.

Detalle y justificación: [ADR-001](ADR/ADR-001-architecture.md).

## Runtime

```text
Navegador → Next.js (páginas + /api)
              → MySQL producto (Docker)
              → BD cliente (ecommerce | SAP | Oracle | …) solo lectura
              → LLM (servicio aparte)
```

Tenant v1: host/subdominio → empresa → BD cliente.  
Health: cada dependencia declara UP/DOWN.

## Lectura

| Documento | Contenido |
|---|---|
| [MODULES.md](MODULES.md) | Contextos, módulos, entidades, casos de uso |
| [DEPENDENCIES.md](DEPENDENCIES.md) | Qué puede importar qué |
| [DATABASE.md](DATABASE.md) | Diseño MySQL producto (`ia_ecommerce_db`) |
| [API.md](API.md) | Contratos REST (login, ask, conversation, health) |
| [SECURITY.md](SECURITY.md) | Auth, tenant, allowlist, secretos |
| [TESTING.md](TESTING.md) | Vitest, pirámide, gold questions, health |
| [CODE-REVIEW.md](CODE-REVIEW.md) | Checklist Critical / Should / Nice |
| [UI.md](UI.md) | Mapa de pantallas → API / gaps MVP |
| [ADR-001](ADR/ADR-001-architecture.md) | Estilo: monólito + puertos |
| [ADR-002](ADR/ADR-002-database.md) | Dos bases: producto vs cliente |
| [ADR-003](ADR/ADR-003-api.md) | API dentro de Next |
| [ADR-004](ADR/ADR-004-query-engine.md) | LLM → JSON; motor arma la consulta |
| [ADR-005](ADR/ADR-005-client-acl.md) | Un adaptador por tipo de sistema |
| [ADR-006](ADR/ADR-006-llm-runtime.md) | LLM proceso aparte |
| [ADR-007](ADR/ADR-007-tenancy.md) | Tenant por host |
| [ADR-008](ADR/ADR-008-caching.md) | Sin Redis en v1 |
| [ADR-009](ADR/ADR-009-health.md) | Visibilidad UP/DOWN |
| [ADR-010](ADR/ADR-010-domain-boundaries.md) | Dominio nuestro ≠ tablas del ERP |

Catálogo detallado de puertos y VOs (histórico): `docs/product/INTERNAL-ARCHITECTURE.md`. Si choca con un ADR, **gana el ADR**.
