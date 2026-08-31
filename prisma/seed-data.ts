/**
 * Pilot data written into `ia_ecommerce_db` by `prisma/seed.ts`.
 * Not read from `.env` — tenant / user / client DB name live in product tables.
 */
export const PILOT_SEED = {
  hostKey: "localhost:3000",
  companyName: "Pilot Company",
  systemTypeCode: "ecommerce" as const,
  user: {
    username: "founder",
    /** Login password for the pilot user (bcrypt-hashed in seed). */
    password: "founder123",
    displayName: "Jeff Miranda",
    department: "Engineers - IT",
  },
  /** Stored in client_db_connection.database_name (not in .env). */
  clientDatabaseName: "ecommerce",
} as const;
