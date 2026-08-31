import { applyProductDatabaseUrl } from "@/shared/mysql-url";
import { PrismaClient } from "@prisma/client";

applyProductDatabaseUrl();

const globalForPrisma = globalThis as unknown as { prisma?: PrismaClient };

/** Product DB client (`ia_ecommerce_db` — login, dashboard, audit, tenant links). */
export const prisma =
  globalForPrisma.prisma ??
  new PrismaClient({
    log: process.env.NODE_ENV === "development" ? ["error", "warn"] : ["error"],
  });

if (process.env.NODE_ENV !== "production") {
  globalForPrisma.prisma = prisma;
}
