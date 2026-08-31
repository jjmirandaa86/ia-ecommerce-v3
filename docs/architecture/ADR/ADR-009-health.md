# ADR-009 — Health (quién está UP / DOWN)

Estado: Aceptada  
Fecha: 2026-08-25

## Context

Dependencias reales: Next, MySQL producto, BD cliente, LLM. El fundador no acepta que el agente se “teste” solo con dobles y se dé por bueno: **debe verse quién corre y quién no**.

## Problem

¿Cómo se sabe si el chat falla por el modelo, por nuestra BD, o por ecommerce?

## Options considered

1. **`GetHealth` + UI:** App, MySQL producto, LLM, BD cliente (si hay tenant/sesión) → UP/DOWN.
2. Solo logs.
3. Tests in-memory como única prueba de verdad (skill clásico).
4. APM de terceros como único canal.

## Decision

**Opción 1.** Caso de uso `GetHealth` (Ops). Puerto `HealthChecks`. La UI de health (fundador) muestra estados. Los dobles de test **existen** para contratos de puertos; **no** sustituyen este tablero.

## Why we chose it

- Respuesta explícita a “¿tests sin MySQL/Ollama?” → no; debe decir quién corre.
- Un operador necesita un vistazo, no rastrear logs.
- Alinea runtime real (`ADR-002`, `ADR-006`) con operación diaria.

## Consequences

- Si LLM está DOWN, health lo dice; `AskQuestion` no finge clasificación.
- BD cliente se comprueba en contexto de tenant (sin sesión puede ser N/A).
- Criterio de arquitectura: un verde de unit test no implica Ollama UP.

## Alternatives rejected

- **Solo in-memory:** oculta caídas reales.
- **Solo logs:** no cumple “decir quién está corriendo”.
- **Solo APM:** no está en el alcance v1; se puede añadir sin quitar `GetHealth`.
