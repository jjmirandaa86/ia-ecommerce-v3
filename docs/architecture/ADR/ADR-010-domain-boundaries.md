# ADR-010 — Frontera de dominio (nuestro vs ERP)

Estado: Aceptada  
Fecha: 2026-08-25

## Context

DDD estratégico: Identity, Conversation, QueryAgent. El ERP tiene productos, pedidos, stock. El producto **no** crea ni actualiza esos datos.

## Problem

¿Modelamos `Product`/`SalesOrder` como agregados nuestros, o el ERP queda detrás de un ACL y un `QueryResult`?

## Options considered

1. **Dominio = producto IA-ECOMMERCE.** ERP = filas vía `ClientQuery`. Shared kernel mínimo (`TenantRef`, IDs).
2. Un modelo único que incluye `Product`, `Order`, `Customer` de AdventureWorks.
3. DDD táctico completo (eventos, outbox, invariantes de pedido).

## Decision

**Opción 1.** Entidades: `AppUser`, `ClientCompany`, `SystemType`, `Conversation`, `Message`, `IntentDefinition`, `QueryAuditEntry`. Prohibido `model Product` en `query-agent/domain`. ClientAcl conoce nombres físicos de tablas; Domain conoce intents y `QueryPlan` lógico.

## Why we chose it

- Solo lectura del cliente: no hay invariante “pedido no vacío” que **nosotros** enforcemos.
- SAP/Xerox no caben en entidades ecommerce (`ADR-005`).
- Un modelo único filtra el ERP al chat y rompe “cliente intacto”.

## Consequences

- Nombre de cliente: join `customer`→`individual`→`contact` cuando existe; si no (p. ej. tienda), AccountNumber — no inventar entidad `Person`.
- Joins permitidos se documentan en el ACL ecommerce, no como relaciones ORM de dominio.
- QueryAgent Application puede usar **puertos** de Conversation, no la entidad `AppUser`.
- Roles e inventario bajo siguen fuera de v1 (PRD); cuando existan, serán políticas **nuestras**, no campos copiados del ERP sin puerto.

## Alternatives rejected

- **Agregados de ventas:** teatro; no escribimos pedidos.
- **Un solo bounded context “Ecommerce”:** mezcla login con `salesorderheader`.
