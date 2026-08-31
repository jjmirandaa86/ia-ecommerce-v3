# ADR-007 — Tenancy (host / subdominio)

Estado: Aceptada  
Fecha: 2026-08-25

## Context

Producto comercial multi-empresa. Cada empresa solo ve su BD. Visión: `a.acertijo.dev` vs `b.acertijo.dev`. Piloto: un usuario. El PRD original decía un host en MVP y subdominio en v1.1; el diseño posterior lo subió a **versión 1**.

## Problem

¿Cómo se sabe a qué empresa (y qué BD) pertenece la sesión? ¿Header, path, subdominio, o solo el usuario?

## Options considered

1. **Host/subdominio → `ClientCompany` → `system_type` + conexión;** el usuario de esa empresa hace login; 1 usuario = 1 BD.
2. Solo el usuario (un host; la empresa está en la fila `app_user`).
3. Path (`/t/acme/chat`).
4. Un deploy Next **distinto** por cliente desde el día 1.

## Decision

**Opción 1** en el **modelo de código v1**. Identity resuelve `HostName` → empresa. Login valida que el usuario pertenece a esa empresa. Un binario; no un proceso por tenant. El piloto puede tener un solo DNS, pero el código no asume “siempre localhost sin tenant”.

## Why we chose it

- El fundador: subdominio en versión 1; volumen/rendimiento por cliente a futuro.
- La BD la define el login + empresa, no un string en el frontend.
- Deploys separados por cliente (opción 4) son ops posterior, no arquitectura de módulos.

## Consequences

- `client_company` guarda la clave de host.
- Cookie/JWT deben acotar path/host para no cruzar tenants.
- `AskQuestion` recibe `TenantRef` ya resuelto; no elige la BD a mano.
- Choca con US-1 del PRD (“MVP un solo host”): **gana este ADR**; conviene alinear el PRD.

## Alternatives rejected

- **Solo usuario, un host para siempre:** no prepara v1 comercial.
- **Path `/t/acme`:** no era el modelo (dominio/subdominio).
- **Un Next por cliente ya:** coste de ops; contradice un operador y un repo.
