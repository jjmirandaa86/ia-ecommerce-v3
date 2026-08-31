# ADR-001 — Estilo de arquitectura

Estado: Aceptada  
Fecha: 2026-08-25

## Context

IA-ECOMMERCE es un B2B: chat en inglés, un Next.js (UI + API), un operador en v1, ERP del cliente de solo lectura, intents por tipo de sistema, ORM y LLM sustituibles. PRD: `docs/product/PRD.md`.

## Problem

Hay que elegir cómo se **empaqueta** y cómo se **separan** las reglas: un proceso vs varios; capas vs solo hooks; DDD táctico vs no.

## Options considered

1. Modular monolith Next + puertos (hexagonal) dentro de módulos.
2. Solo Next + hooks + Route Handlers, sin puertos.
3. Clean Architecture “de libro” modelando `Product`/`Order` del cliente.
4. DDD táctico (agregados, eventos, outbox) sobre el ERP.
5. Microservicios (Auth, Agente, conector SQL, LLM como deploys de negocio).

## Decision

**Opción 1:** un monólito modular Next.js con Identity, Conversation, QueryAgent; dependencias hacia adentro; puertos para BD producto, BD cliente, LLM y health.

## Why we chose it

- El PRD ya fija un repo y API dentro de Next (`ADR-003`).
- Un operador y un usuario de piloto no justifican red interna (`opción 5`).
- Sin puertos no se cambia ORM/LLM/SAP sin tocar el chat (`opción 2`).
- El cliente es solo lectura: no hay `Pedido.submit()` nuestro (`opciones 3–4`).
- `system_type` exige adaptadores, no un modelo único.

## Consequences

- Un deploy de aplicación; MySQL y LLM aparte son **infra** (`ADR-006`).
- Más archivos e interfaces que un CRUD típico.
- Añadir SAP = catálogo + ClientAcl, no un servicio nuevo (`ADR-005`).
- Tests de caso de uso no importan Prisma; health real es obligatorio (`ADR-009`).

## Alternatives rejected

- **Hooks-only:** incumple ORM/LLM sustituibles y el 80/20 de reglas.
- **Clean copiando el ERP:** corrompe el dominio con AdventureWorks/SAP (`ADR-010`).
- **DDD táctico de ventas:** no escribimos el ERP.
- **Microservicios:** coste y latencia sin equipo ni carga; contradicen un solo Next.
