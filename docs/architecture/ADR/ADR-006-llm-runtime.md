# ADR-006 — Runtime del LLM

Estado: Aceptada  
Fecha: 2026-08-25

## Context

Clasificar inglés → JSON. Idea inicial: Ollama ~7B. Debe poder cambiarse sin tocar login ni Recharts. Next es el único binario de aplicación.

## Problem

¿El modelo corre in-process, en el mismo Docker que Next, o en un servicio aparte?

## Options considered

1. **Servicio LLM aparte** (Ollama u otro); Next llama `LlmClassifier` por HTTP.
2. Librería in-process en Node (`transformers`, etc.).
3. Microservicio “Classifier” con su propio dominio y DB.
4. API cloud de terceros como única opción.

## Decision

**Opción 1.** Proceso (o contenedor) distinto. Puerto `LlmClassifier`: `{ text, systemType }` → `Classification`. Sustituir Ollama = otro adapter, mismo puerto.

## Why we chose it

- Respuesta de diseño: “LLM lo pongo aparte en un servicio; API dentro de Next”.
- GPU/RAM del modelo no deben hinchar el proceso de UI.
- In-process (opción 2) acopla deploys y contradice “cambiar el LLM sin tocar Recharts”.
- Un microservicio de negocio (opción 3) es `ADR-001` rechazado.

## Consequences

- Health debe incluir LLM UP/DOWN (`ADR-009`).
- Latencia de clasificación = red local; timeouts y reintentos son de infra, no de Domain.
- Si el LLM está caído, login puede funcionar; `AskQuestion` falla explícito.
- El contrato JSON es la API estable, no la marca Ollama.

## Alternatives rejected

- **In-process:** mezcla ciclo de vida del modelo con Next.
- **Microservicio de dominio:** sobre-partición.
- **Solo cloud:** no se eligió; el puerto permite añadirlo después sin cambiar Domain.
