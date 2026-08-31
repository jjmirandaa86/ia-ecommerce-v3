/**
 * Build MySQL URL for the **product** DB (`ia_ecommerce_db`).
 * Client DB name/host for chat live in product tables — not here.
 */

export type MysqlConnectionParts = {
  user: string;
  password: string;
  host: string;
  port: number;
  database: string;
};

export const buildMysqlUrl = (parts: MysqlConnectionParts): string => {
  const user = encodeURIComponent(parts.user);
  const password = encodeURIComponent(parts.password);
  return `mysql://${user}:${password}@${parts.host}:${parts.port}/${parts.database}`;
}

export const readProductMysqlFromEnv = (): {
  engine: string;
  host: string;
  port: number;
  user: string;
  password: string;
  ssl: boolean;
  name: string;
} => {
  const port = Number(process.env.DB_PORT ?? "3307");
  return {
    engine: process.env.DB_ENGINE ?? "mysql",
    host: process.env.DB_HOST ?? "127.0.0.1",
    port: Number.isFinite(port) ? port : 3307,
    user: process.env.DB_USER ?? "root",
    password: process.env.DB_PASSWORD ?? "",
    ssl: ["1", "true", "yes", "on"].includes(
      (process.env.DB_SSL ?? "false").toLowerCase(),
    ),
    name: process.env.DB_NAME ?? "ia_ecommerce_db",
  };
}

/** Sets process.env.DATABASE_URL for Prisma CLI / PrismaClient. */
export const applyProductDatabaseUrl = (): string => {
  const p = readProductMysqlFromEnv();
  const url = buildMysqlUrl({
    user: p.user,
    password: p.password,
    host: p.host,
    port: p.port,
    database: p.name,
  });
  process.env.DATABASE_URL = url;
  return url;
}
