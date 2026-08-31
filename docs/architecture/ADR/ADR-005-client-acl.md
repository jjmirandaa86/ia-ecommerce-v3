# ADR-005 — Client ACL por tipo de sistema

Estado: Aceptada  
Fecha: 2026-08-25

## Context

Al login, la empresa tiene un `system_type` (ecommerce, sap, xerox, …) y una BD (MySQL, Oracle, u otra). Intents y sugerencias **distintos** por sistema. El núcleo no debe conocer `salesorderdetail` ni tablas SAP.

## Problem

¿Un SQL genérico para cualquier esquema, un adaptador por sistema, o un producto distinto por ERP?

## Options considered

1. **Un `ClientQuery` + un adaptador (ACL) por `system_type`:** ecommerce ahora; sap/xerox después.
2. El LLM inspecciona el esquema y genera SQL para “cualquier” BD.
3. Un fork del producto por cliente.
4. Un único builder SQL con if/else de 200 tablas.

## Decision

**Opción 1.** `AskQuestion` habla `QueryPlan` lógico. `src/client-acl/ecommerce` mapea a las 10 tablas del piloto. SAP/Xerox: módulos vacíos o stub hasta v2. “Otra” BD = **nuevo** `system_type` + catálogo + ACL, no auto-descubrimiento.

## Why we chose it

- El fundador: una mejora SAP debe aplicar a todos los clientes SAP.
- El núcleo no es AdventureWorks (`ADR-010`).
- Auto-SQL contradice `ADR-004`.
- Un fork por cliente impide el producto comercial.

## Consequences

- Piloto: solo ACL ecommerce es real.
- Oracle es otro **adaptador de lectura**, no un cambio de `AskQuestion`.
- Allowlist y joins viven junto al ACL de ese sistema (80/20).
- Sin ACL, no hay consultas a esa empresa (health de BD cliente DOWN o no configurada).

## Alternatives rejected

- **Text-to-schema:** el LLM elige tablas; mezclaría SAP y ecommerce.
- **Forks:** no es un producto.
- **Un mega-builder:** acopla todos los ERPs al mismo archivo.
