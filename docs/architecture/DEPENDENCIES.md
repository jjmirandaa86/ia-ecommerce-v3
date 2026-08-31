# Dependencias — IA-ECOMMERCE

Dirección de imports. Nada apunta hacia afuera. Decisiones: [ADR-001](ADR/ADR-001-architecture.md), [ADR-010](ADR/ADR-010-domain-boundaries.md).

---

## Capas

```text
Domain
  ↓
NO puede depender de Infrastructure

Application
  ↓
puede depender de Domain

Infrastructure
  ↓
puede implementar interfaces definidas por Domain (y Application)

Presentation
  ↓
utiliza Application
```

## Imports permitidos

```text
Presentation     → Application (casos de uso + DTO)
Application      → Domain (mismo contexto)
Application      → interfaces (puertos) de otro contexto
Domain           → Domain del mismo contexto
Domain           → shared/domain (TenantRef, IDs)
Infrastructure   → Domain (para implementar puertos)
Wiring           → Application + Adapters (única excepción)
```

## Imports prohibidos

```text
Domain           ✗ Application, Infrastructure, Adapters, Presentation
Domain           ✗ Next, ORM, Ollama, Recharts, SQL de un motor
Application      ✗ Infrastructure, Adapters, Presentation, Next, ORM, Ollama
Presentation     ✗ Domain (salvo DTO/VO de frontera), Infrastructure, Adapters, ORM
Presentation     ✗ client-acl
ClientAcl        ✗ casos de uso
Identity         ✗ QueryAgent
QueryAgent Domain ✗ entidades de Identity o Conversation
```

## Entre módulos

```text
Identity ── TenantRef (shared) ──▶ QueryAgent, Conversation
QueryAgent Application ── ConversationRepository (puerto) ──▶ Conversation
QueryAgent Application ── ClientQuery (puerto) ──▶ ClientAcl
Ops ── HealthChecks ──▶ MySQL producto, LLM, BD cliente
```

El tenant **no** se obtiene importando `AppUser` en QueryAgent: llega en el request como `TenantRef` (sesión ya autenticada).

## Composition root

`src/infrastructure` es lo único que instancia un caso de uso **y** sus adaptadores. Los route handlers piden el caso de uso ya cableado; no hacen `new PrismaClient()` ni `new Ollama()`.

## Checklist

Un cambio viola este documento si:

1. `domain/**` importa Next, ORM, `fetch` al LLM, o `client-acl`.
2. Un caso de uso instancia Prisma/Ollama.
3. Un hook o page importa un repositorio.
4. El LLM devuelve SQL y Application lo ejecuta.
5. ClientAcl elige la intención.
