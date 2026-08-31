# ADR-002 — Bases de datos

Estado: Aceptada  
Fecha: 2026-08-25

## Context

Hay que persistir login, conversación, sugerencias, audit e intents **y** leer ventas/productos del cliente. El cliente entrega credenciales de **su** BD (MySQL ecommerce en el piloto; después SAP/Oracle u otra). El cliente debe quedar **intacto**.

## Problem

¿Una sola BD (meter audit en `ecommerce`)? ¿Escribir en el cliente? ¿Una BD nuestra y otra del cliente?

## Options considered

1. **Dos bases:** MySQL **producto** (R/W, nuestra, Docker) + BD **cliente** (R/O, intacta).
2. Todo en `ecommerce`, incluida `ai_query_audit_log`.
3. Audit en ecommerce **y** copia en la nuestra.
4. Una BD producto que **replica** tablas del cliente.

## Decision

**Opción 1.** Nuestra MySQL: `system_type`, `client_company`, `app_user`, `suggestion_example`, `conversation`, `message`, `ai_query_audit_log`. Cliente: allowlist de 10 tablas en el piloto (incluye `individual`+`contact` para nombre de cliente); **cero** objetos nuevos de este producto. Solo SELECT al cliente.

## Why we chose it

- El PRD: historial y SQL de prueba no se guardan en el cliente.
- Escribir audit en ecommerce rompe “solo lectura” e “intacta”.
- Replicar el ERP (opción 4) duplica datos y el modelo.
- Credenciales de la BD cliente viven en **nuestra** BD (`client_company`), no en ecommerce.

## Consequences

- Dos conexiones: producto (ORM nuestro) y cliente (puerto `ClientQuery`).
- ORM sustituible **en la nuestra**; el cliente puede ser otro motor vía ACL (`ADR-005`).
- Si el cliente cae, login/audit pueden seguir; el chat de datos no (`ADR-009`).
- No hay transacciones que crucen producto + cliente.

## Alternatives rejected

- **Audit en ecommerce:** escribe en el cliente; mezcla producto y ERP.
- **Doble escritura:** complejidad y divergencia.
- **Réplica del cliente:** no pedida; viola intacta.
