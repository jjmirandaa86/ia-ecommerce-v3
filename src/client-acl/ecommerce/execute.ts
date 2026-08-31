import { PrismaClient } from "@prisma/client";
import { decryptSecret } from "@/infrastructure/crypto/secret-box";
import { assertAllowlistedSql } from "@/client-acl/ecommerce/allowlist";
import type { BuiltQuery } from "@/client-acl/ecommerce/build-query";

export type ClientDbTarget = {
  engine: string;
  host: string;
  port: number;
  databaseName: string;
  username: string;
  passwordEncrypted: string;
  sslEnabled: boolean;
};

const buildMysqlUrl = (cfg: ClientDbTarget, password: string): string => {
  const user = encodeURIComponent(cfg.username);
  const pass = encodeURIComponent(password);
  const db = encodeURIComponent(cfg.databaseName);
  const ssl = cfg.sslEnabled ? "?sslaccept=strict" : "";
  return `mysql://${user}:${pass}@${cfg.host}:${cfg.port}/${db}${ssl}`;
}

const serializeRows = (
  rows: Record<string, unknown>[],
): Record<string, unknown>[] => {
  return rows.map((row) => {
    const out: Record<string, unknown> = {};
    for (const [k, v] of Object.entries(row)) {
      out[k] = typeof v === "bigint" ? Number(v) : v;
    }
    return out;
  });
}

/** Execute a pre-built SELECT against the tenant client DB (MySQL only in pilot). */
export const executeClientSelect = async (
  cfg: ClientDbTarget,
  query: BuiltQuery,
): Promise<{ rows: Record<string, unknown>[]; dbMs: number }> => {
  if (cfg.engine.toLowerCase() !== "mysql") {
    throw new Error(`Unsupported client engine: ${cfg.engine}`);
  }
  assertAllowlistedSql(query.sql);

  const password = decryptSecret(cfg.passwordEncrypted);
  const client = new PrismaClient({
    datasources: { db: { url: buildMysqlUrl(cfg, password) } },
  });

  const started = Date.now();
  try {
    const rows =
      query.params.length === 0
        ? await client.$queryRawUnsafe<Record<string, unknown>[]>(query.sql)
        : await client.$queryRawUnsafe<Record<string, unknown>[]>(
            query.sql,
            ...query.params,
          );
    return { rows: serializeRows(rows), dbMs: Date.now() - started };
  } finally {
    await client.$disconnect();
  }
}
