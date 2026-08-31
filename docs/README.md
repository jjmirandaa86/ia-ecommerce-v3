# Docs index — IA-ECOMMERCE v3

Pipeline de producto → listo para Implementation.

## Producto

| Doc | Estado |
|---|---|
| [product/PRD.md](product/PRD.md) | Hecho |

## Arquitectura

| Doc | Estado |
|---|---|
| [architecture/ARCHITECTURE.md](architecture/ARCHITECTURE.md) | Hecho |
| [architecture/MODULES.md](architecture/MODULES.md) | Hecho |
| [architecture/DEPENDENCIES.md](architecture/DEPENDENCIES.md) | Hecho |
| [architecture/DATABASE.md](architecture/DATABASE.md) | Hecho |
| [architecture/API.md](architecture/API.md) | Hecho |
| [architecture/SECURITY.md](architecture/SECURITY.md) | Hecho |
| [architecture/TESTING.md](architecture/TESTING.md) | Hecho |
| [architecture/CODE-REVIEW.md](architecture/CODE-REVIEW.md) | Hecho |
| [architecture/UI.md](architecture/UI.md) | Hecho (pantallas + gaps) |
| [architecture/ADR/](architecture/ADR/) | ADR-001 … ADR-010 |

## Siguiente

Ver [PENDING.md](PENDING.md) (engines multi-DB, agent, dashboard, auth wiring).

**Scaffold creado** en la raíz de `ia-ecommerce-v3`.

En tu máquina:

```bash
cd ia-ecommerce-v3
# edita .env (ya hay .env.example; alinear DATABASE_URL con tu MySQL)
npx prisma generate
# crear DB: CREATE DATABASE ia_ecommerce_db;
npx prisma db push
npm run db:seed
npm run dev
```

Login: **founder** / **founder123** (`prisma/seed-data.ts`) con Host = `localhost:3000`.
