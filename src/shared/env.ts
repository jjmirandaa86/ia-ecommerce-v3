/**
 * Typed env for Node / API (not Edge middleware).
 * `.env` = product MySQL + secrets + LLM only.
 * Tenant, users, and client DB connection live in `ia_ecommerce_db` tables.
 */

import {
  applyProductDatabaseUrl,
  readProductMysqlFromEnv,
} from "@/shared/mysql-url";

const required = (name: string): string => {
  const value = process.env[name];
  if (!value) throw new Error(`Missing env: ${name}`);
  return value;
}

const intEnv = (name: string, fallback: number): number => {
  const raw = process.env[name];
  if (!raw) return fallback;
  const n = Number(raw);
  return Number.isFinite(n) ? n : fallback;
}

const mysql = readProductMysqlFromEnv();

/** Ensure Prisma sees DATABASE_URL when the app boots. */
applyProductDatabaseUrl();

export const env = {
  get databaseUrl() {
    return applyProductDatabaseUrl();
  },

  /** Connection to product DB only (`ia_ecommerce_db`). */
  mysql: {
    engine: mysql.engine,
    host: mysql.host,
    port: mysql.port,
    user: mysql.user,
    password: mysql.password,
    ssl: mysql.ssl,
    name: mysql.name,
  },

  get jwtSecret() {
    return required("JWT_SECRET");
  },
  jwtExpiresIn: process.env.JWT_EXPIRES_IN ?? "8h",
  jwtExpiresInRemember: process.env.JWT_EXPIRES_IN_REMEMBER ?? "30d",
  authCookieName: process.env.AUTH_COOKIE_NAME ?? "ia_ecommerce_session",

  get clientDbSecretKey() {
    return required("CLIENT_DB_SECRET_KEY");
  },

  rateLimitLoginMax: intEnv("RATE_LIMIT_LOGIN_MAX", 5),
  rateLimitLoginWindowMs: intEnv("RATE_LIMIT_LOGIN_WINDOW_MS", 900_000),
  rateLimitApiMax: intEnv("RATE_LIMIT_API_MAX", 120),
  rateLimitApiWindowMs: intEnv("RATE_LIMIT_API_WINDOW_MS", 60_000),

  llmBaseUrl: process.env.LLM_BASE_URL ?? "http://localhost:11434",
  llmGenerateUrl:
    process.env.LLM_GENERATE_URL ?? "http://localhost:11434/api/generate",
  llmModel: process.env.LLM_MODEL ?? "qwen2.5:7b",
};
