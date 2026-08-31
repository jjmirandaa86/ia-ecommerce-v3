#!/usr/bin/env node
/**
 * CREATE DATABASE IF NOT EXISTS for DB_NAME, then prisma db push + seed.
 */
const { spawnSync } = require("child_process");
const path = require("path");
const { PrismaClient } = require("@prisma/client");

require("dotenv").config({ path: path.join(__dirname, "..", ".env") });

const buildUrl = (database) => {
  const user = encodeURIComponent(process.env.DB_USER ?? "root");
  const password = encodeURIComponent(process.env.DB_PASSWORD ?? "");
  const host = process.env.DB_HOST ?? "127.0.0.1";
  const port = process.env.DB_PORT ?? "3307";
  return `mysql://${user}:${password}@${host}:${port}/${database}`;
};

const ensureDatabase = async () => {
  const dbName = process.env.DB_NAME ?? "ia_ecommerce_db";
  process.env.DATABASE_URL = buildUrl("mysql");
  const prisma = new PrismaClient();
  try {
    const safe = dbName.replace(/[^a-zA-Z0-9_]/g, "");
    await prisma.$executeRawUnsafe(
      `CREATE DATABASE IF NOT EXISTS \`${safe}\` CHARACTER SET utf8mb4 COLLATE utf8mb4_unicode_ci`,
    );
    console.log(`Database ready: ${safe}`);
  } finally {
    await prisma.$disconnect();
  }
  process.env.DATABASE_URL = buildUrl(dbName);
};

const run = (cmd, args) => {
  const result = spawnSync(cmd, args, {
    stdio: "inherit",
    env: process.env,
    shell: process.platform === "win32",
    cwd: path.join(__dirname, ".."),
  });
  if ((result.status ?? 1) !== 0) {
    process.exit(result.status ?? 1);
  }
};

const main = async () => {
  await ensureDatabase();
  run("node", ["scripts/prisma-with-env.cjs", "db", "push"]);
  run("npx", ["tsx", "prisma/seed.ts"]);
  console.log("Setup complete: schema + pilot user seeded.");
};

main().catch((e) => {
  console.error(e);
  process.exit(1);
});
