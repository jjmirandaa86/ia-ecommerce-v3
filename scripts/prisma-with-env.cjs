#!/usr/bin/env node
/**
 * Load .env, build DATABASE_URL from DB_* (incl. DB_NAME), then run Prisma.
 * Usage: node scripts/prisma-with-env.cjs db push
 */
const { spawnSync } = require("child_process");
const path = require("path");

require("dotenv").config({ path: path.join(__dirname, "..", ".env") });

const buildProductDatabaseUrl = () => {
  const user = encodeURIComponent(process.env.DB_USER ?? "root");
  const password = encodeURIComponent(process.env.DB_PASSWORD ?? "");
  const host = process.env.DB_HOST ?? "127.0.0.1";
  const port = process.env.DB_PORT ?? "3307";
  const database = process.env.DB_NAME ?? "ia_ecommerce_db";
  return `mysql://${user}:${password}@${host}:${port}/${database}`;
};

process.env.DATABASE_URL = buildProductDatabaseUrl();

const args = process.argv.slice(2);
if (args.length === 0) {
  console.error("Usage: node scripts/prisma-with-env.cjs <prisma-args...>");
  process.exit(1);
}

const result = spawnSync("npx", ["prisma", ...args], {
  stdio: "inherit",
  env: process.env,
  shell: process.platform === "win32",
});

process.exit(result.status ?? 1);
