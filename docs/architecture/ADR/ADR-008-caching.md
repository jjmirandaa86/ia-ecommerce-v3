# ADR-008 — Caché (Redis)

Estado: Aceptada  
Fecha: 2026-08-25

## Context

El PRD mencionó Redis “si es sencillo” para no sofocar la BD en un piloto de concurrencia. El piloto real es **un usuario**. Pregunta de diseño: Redis día 1 → **no**.

## Problem

¿Hay capa de caché en v1?

## Options considered

1. **Sin Redis (ni puerto `Cache`) en v1.**
2. Puerto `Cache` + implementación no-op, Redis después.
3. Redis obligatorio desde el día 1.

## Decision

**Opción 1.** No Redis. No puerto de caché hasta que haya medida de carga (v1.1+).

## Why we chose it

- Un usuario no satura MySQL producto ni ecommerce.
- Redis es otro proceso a poner en health (`ADR-009`) sin beneficio.
- El PRD lo dejó como no duro; el fundador lo sacó de v1.

## Consequences

- Cada `AskQuestion` puede ir a LLM + BD cliente (salvo que más adelante se cachee).
- Añadir Redis después: nuevo ADR, puerto `Cache`, adapter; Domain no cambia si la caché es de infra.
- Compose v1: Next, MySQL producto, LLM — sin Redis.

## Alternatives rejected

- **Redis día 1:** ops extra, no pedido.
- **Puerto no-op ahora:** ceremonia sin caller; se introduce cuando exista un uso (p. ej. health o intents estáticos).
