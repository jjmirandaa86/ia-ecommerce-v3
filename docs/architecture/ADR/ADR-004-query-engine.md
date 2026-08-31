# ADR-004 — Motor de consultas (LLM no escribe SQL)

Estado: Aceptada  
Fecha: 2026-08-25

## Context

El usuario pregunta en inglés. Hay que responder con datos reales, gráficos si hay parámetros, y no inyectar ni alucinar SQL. Intents **fijos por** `system_type`. Tono formal. No-match: decirlo y sugerir ejemplos de **ese** sistema.

## Problem

¿Quién construye la consulta: el LLM, un orquestador de SQL libre, o un catálogo + motor determinista?

## Options considered

1. **LLM → JSON de intención fija; motor de reglas → `QueryPlan` → ClientAcl ejecuta SELECT parametrizado (`1=1` + binds).**
2. LLM genera SQL; allowlist débil o post-check.
3. Text-to-SQL con RAG/embeddings sobre el esquema.
4. Solo dashboards fijos, sin lenguaje natural.

## Decision

**Opción 1.** `LlmClassifier` solo traduce a `Classification` (intent + params o no-match). `IntentGuard` + `QueryPlanFactory` + `AllowlistPolicy` + `ChartPolicy` viven en Domain. SQL físico solo en ClientAcl. Gráfico solo si hay parámetros. Sugerencias por sistema y por tema.

## Why we chose it

- Requisito explícito: el modelo **no** decide el query.
- Catálogo por `system_type`: una mejora ecommerce aplica a todos los ecommerce.
- RAG/embeddings están en non-goals del PRD.
- SQL libre del LLM no cumple allowlist ni joins controlados.

## Consequences

- Preguntas fuera de catálogo = no-match, no “inventa un SELECT”.
- Rankings más allá de los ejemplos del PRD = TBD; no hay motor “top N de cualquier columna”.
- Cambiar Ollama no cambia builders si el JSON se mantiene (`ADR-006`).
- 80/20: intents/reglas por sistema y entidad en catálogo + ACL, no en el chat.

## Alternatives rejected

- **LLM escribe SQL:** inyección, tablas prohibidas, cruce de sistemas.
- **RAG:** non-goal; no ancla intents fijos.
- **Solo dashboards:** no es el producto.
