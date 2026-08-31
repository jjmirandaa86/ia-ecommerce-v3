import { PrismaClient } from "@prisma/client";
import type { NextRequest } from "next/server";
import { prisma } from "@/infrastructure/db/prisma";
import { decryptSecret } from "@/infrastructure/crypto/secret-box";
import { verifyToken } from "@/infrastructure/auth/jwt";
import { env } from "@/shared/env";

export type ServiceCheck = {
  status: "up" | "down" | "n/a";
  latencyMs?: number;
  detail?: string;
  engine?: string;
};

type ResolvedClientDb = {
  engine: string;
  host: string;
  port: number;
  databaseName: string;
  username: string;
  passwordEncrypted: string;
  sslEnabled: boolean;
  source: "session" | "host";
};

const loadConnectionByCompanyId = async (
  companyId: bigint,
): Promise<Omit<ResolvedClientDb, "source"> | null> => {
  const company = await prisma.clientCompany.findUnique({
    where: { id: companyId },
    include: {
      connection: { include: { server: true } },
    },
  });
  const conn = company?.connection;
  const server = conn?.server;
  if (!company?.isActive || !conn?.isActive || !server?.isActive) return null;
  return {
    engine: server.engine,
    host: server.host,
    port: server.port,
    databaseName: conn.databaseName,
    username: conn.username,
    passwordEncrypted: conn.passwordEncrypted,
    sslEnabled: server.sslEnabled,
  };
}

/** Resolve tenant client DB from session cookie, else Host → company.host_key. */
export const resolveClientDb = async (
  req: NextRequest,
): Promise<ResolvedClientDb | null> => {
  const token = req.cookies.get(env.authCookieName)?.value;
  if (token) {
    try {
      const claims = await verifyToken(token);
      const loaded = await loadConnectionByCompanyId(BigInt(claims.companyId));
      if (loaded) return { ...loaded, source: "session" };
    } catch {
      // fall through to host
    }
  }

  const host = (req.headers.get("host") ?? "").toLowerCase();
  if (!host) return null;

  const company = await prisma.clientCompany.findUnique({
    where: { hostKey: host },
    include: { connection: { include: { server: true } } },
  });
  const conn = company?.connection;
  const server = conn?.server;
  if (!company?.isActive || !conn?.isActive || !server?.isActive) return null;

  return {
    engine: server.engine,
    host: server.host,
    port: server.port,
    databaseName: conn.databaseName,
    username: conn.username,
    passwordEncrypted: conn.passwordEncrypted,
    sslEnabled: server.sslEnabled,
    source: "host",
  };
}

const buildMysqlUrl = (cfg: ResolvedClientDb, password: string): string => {
  const user = encodeURIComponent(cfg.username);
  const pass = encodeURIComponent(password);
  const db = encodeURIComponent(cfg.databaseName);
  const ssl = cfg.sslEnabled ? "?sslaccept=strict" : "";
  return `mysql://${user}:${pass}@${cfg.host}:${cfg.port}/${db}${ssl}`;
}

const pingMysql = async (cfg: ResolvedClientDb): Promise<ServiceCheck> => {
  const start = Date.now();
  let password: string;
  try {
    password = decryptSecret(cfg.passwordEncrypted);
  } catch (e) {
    return {
      status: "down",
      engine: cfg.engine,
      detail: e instanceof Error ? e.message : "decrypt failed",
    };
  }

  const client = new PrismaClient({
    datasources: { db: { url: buildMysqlUrl(cfg, password) } },
  });

  try {
    const rows = await client.$queryRaw<Array<{ db: string | null }>>`
      SELECT DATABASE() AS db
    `;
    const current = rows[0]?.db ?? null;
    if (current !== cfg.databaseName) {
      return {
        status: "down",
        latencyMs: Date.now() - start,
        engine: cfg.engine,
        detail: current
          ? `connected to ${current}, expected ${cfg.databaseName}`
          : "no database selected",
      };
    }
    return {
      status: "up",
      latencyMs: Date.now() - start,
      engine: cfg.engine,
      detail: `${cfg.databaseName} (${cfg.source})`,
    };
  } catch (e) {
    return {
      status: "down",
      engine: cfg.engine,
      detail: e instanceof Error ? e.message : "unreachable",
    };
  } finally {
    await client.$disconnect();
  }
}

/** Probe the tenant client database using engine from client_db_server. */
export const pingClientDatabase = async (
  req: NextRequest,
): Promise<ServiceCheck> => {
  const cfg = await resolveClientDb(req);
  if (!cfg) {
    return { status: "n/a", detail: "no tenant context" };
  }

  const engine = cfg.engine.toLowerCase();
  if (engine === "mysql") {
    return pingMysql(cfg);
  }

  return {
    status: "down",
    engine: cfg.engine,
    detail: `unsupported engine: ${cfg.engine}`,
  };
}
