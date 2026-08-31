# ADR-003 — API

Estado: Aceptada  
Fecha: 2026-08-25

## Context

El fundador eligió Next.js para UI y API, un proyecto, Recharts y react-icons. Un operador. Chat + login + health.

## Problem

¿API en el mismo Next, un backend aparte, o BFF + microservicios?

## Options considered

1. **Route Handlers en el mismo Next** (`src/app/api/*`): parsear → caso de uso → JSON.
2. Repo Next (solo UI) + repo API (Nest/Express/Fastify).
3. Next + varios microservicios detrás de un gateway.

## Decision

**Opción 1.** Un repo. Páginas y `/api/auth`, `/api/agent`, `/api/health`. El route handler no contiene SQL ni llamadas directas a Ollama: llama Application. UI: componentes de vista + **un hook por componente** que solo habla con `/api`.

## Why we chose it

- PRD y respuesta de diseño: “API dentro de Next”, “no otro proyecto solo para la API”.
- Un operador: dos repos duplican JWT, CORS y deploys.
- La separación de capas está **dentro** del monólito (`DEPENDENCIES.md`), no entre procesos.

## Consequences

- Mismo origen: cookie JWT `SameSite=Lax` sin CORS de API pública.
- Escalar = más instancias del mismo binario (subdominio/host en v1, `ADR-007`).
- El LLM **no** vive en el proceso Next (`ADR-006`); Next es cliente HTTP del clasificador.
- Ocultar SQL en la UI después es un flag de presentación; el API puede seguir enviando `sql` al fundador en v1.

## Alternatives rejected

- **API en otro repo:** contradice el PRD; dobla auth.
- **Microservicios detrás de Next:** no hay carga ni equipos (`ADR-001`).
