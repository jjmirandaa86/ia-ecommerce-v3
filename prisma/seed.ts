import "dotenv/config";
import { PrismaClient } from "@prisma/client";
import bcrypt from "bcryptjs";
import { createCipheriv, randomBytes, scryptSync } from "crypto";
import {
  applyProductDatabaseUrl,
  readProductMysqlFromEnv,
} from "../src/shared/mysql-url";
import { PILOT_SEED } from "./seed-data";

applyProductDatabaseUrl();

const prisma = new PrismaClient();

const required = (name: string): string => {
  const v = process.env[name];
  if (!v) throw new Error(`Missing env for seed: ${name}`);
  return v;
}

const encryptSecret = (plain: string, secretKey: string): string => {
  const key = scryptSync(secretKey, "ia-ecommerce-v3-salt", 32);
  const iv = randomBytes(12);
  const cipher = createCipheriv("aes-256-gcm", key, iv);
  const enc = Buffer.concat([cipher.update(plain, "utf8"), cipher.final()]);
  const tag = cipher.getAuthTag();
  return `v1:${iv.toString("base64")}:${tag.toString("base64")}:${enc.toString("base64")}`;
}

const main = async () => {
  const clientDbSecret = required("CLIENT_DB_SECRET_KEY");
  const productMysql = readProductMysqlFromEnv();
  const seed = PILOT_SEED;

  const ecommerce = await prisma.systemType.upsert({
    where: { code: "ecommerce" },
    update: { name: "Ecommerce", isActive: true },
    create: { code: "ecommerce", name: "Ecommerce", isActive: true },
  });

  await prisma.systemType.upsert({
    where: { code: "sap" },
    update: { name: "SAP", isActive: false },
    create: { code: "sap", name: "SAP", isActive: false },
  });

  await prisma.systemType.upsert({
    where: { code: "xerox" },
    update: { name: "Xerox CRM", isActive: false },
    create: { code: "xerox", name: "Xerox CRM", isActive: false },
  });

  const owner = await prisma.role.upsert({
    where: { code: "owner" },
    update: { name: "Owner" },
    create: {
      code: "owner",
      name: "Owner",
      description: "Full access within company (permissions not enforced in v1)",
    },
  });

  // Pilot: client DB runs on the same MySQL host as the product DB (DB_*).
  // database_name comes from seed-data (stored in client_db_connection).
  let server = await prisma.clientDbServer.findFirst({
    where: {
      engine: productMysql.engine,
      host: productMysql.host,
      port: productMysql.port,
    },
  });
  if (server) {
    server = await prisma.clientDbServer.update({
      where: { id: server.id },
      data: {
        name: "Pilot MySQL",
        sslEnabled: productMysql.ssl,
        isActive: true,
      },
    });
  } else {
    server = await prisma.clientDbServer.create({
      data: {
        name: "Pilot MySQL",
        engine: productMysql.engine,
        host: productMysql.host,
        port: productMysql.port,
        sslEnabled: productMysql.ssl,
        isActive: true,
      },
    });
  }

  const company = await prisma.clientCompany.upsert({
    where: { hostKey: seed.hostKey },
    update: {
      name: seed.companyName,
      systemTypeId: ecommerce.id,
      isActive: true,
    },
    create: {
      name: seed.companyName,
      hostKey: seed.hostKey,
      systemTypeId: ecommerce.id,
      isActive: true,
    },
  });

  const passwordEncrypted = encryptSecret(
    productMysql.password,
    clientDbSecret,
  );

  await prisma.clientDbConnection.upsert({
    where: { clientCompanyId: company.id },
    update: {
      clientDbServerId: server.id,
      databaseName: seed.clientDatabaseName,
      username: productMysql.user,
      passwordEncrypted,
      isActive: true,
    },
    create: {
      clientCompanyId: company.id,
      clientDbServerId: server.id,
      databaseName: seed.clientDatabaseName,
      username: productMysql.user,
      passwordEncrypted,
      isActive: true,
    },
  });

  const passwordHash = await bcrypt.hash(seed.user.password, 12);

  const user = await prisma.appUser.upsert({
    where: {
      clientCompanyId_username: {
        clientCompanyId: company.id,
        username: seed.user.username,
      },
    },
    update: {
      passwordHash,
      displayName: seed.user.displayName,
      department: seed.user.department,
      isActive: true,
    },
    create: {
      clientCompanyId: company.id,
      username: seed.user.username,
      passwordHash,
      displayName: seed.user.displayName,
      department: seed.user.department,
      isActive: true,
    },
  });

  await prisma.userRole.upsert({
    where: {
      appUserId_roleId: { appUserId: user.id, roleId: owner.id },
    },
    update: {},
    create: { appUserId: user.id, roleId: owner.id },
  });

  const suggestions: { topic: string; exampleText: string; sortOrder: number }[] =
    [
      {
        topic: "product",
        exampleText: "How many products are there?",
        sortOrder: 1,
      },
      {
        topic: "product",
        exampleText: "How many products are there per category?",
        sortOrder: 2,
      },
      {
        topic: "product",
        exampleText: "How many products are there per subcategory?",
        sortOrder: 3,
      },
      {
        topic: "product",
        exampleText: "What are the top 10 most expensive products?",
        sortOrder: 4,
      },
      {
        topic: "product",
        exampleText: "What are the cheapest products under $50?",
        sortOrder: 5,
      },
      {
        topic: "product",
        exampleText: "How many products have no subcategory?",
        sortOrder: 6,
      },
      {
        topic: "product",
        exampleText: "List products by color",
        sortOrder: 7,
      },
      {
        topic: "product",
        exampleText: "What is the average list price by category?",
        sortOrder: 8,
      },
      {
        topic: "review",
        exampleText: "How many products have reviews?",
        sortOrder: 1,
      },
      {
        topic: "review",
        exampleText: "How many reviews are there?",
        sortOrder: 2,
      },
      {
        topic: "review",
        exampleText: "What is the average product rating?",
        sortOrder: 3,
      },
      {
        topic: "review",
        exampleText: "Which products have the highest average rating?",
        sortOrder: 4,
      },
      {
        topic: "review",
        exampleText: "Which products have the lowest average rating?",
        sortOrder: 5,
      },
      {
        topic: "review",
        exampleText: "What is the worst product review?",
        sortOrder: 6,
      },
      {
        topic: "review",
        exampleText: "Show the latest product reviews",
        sortOrder: 7,
      },
      {
        topic: "review",
        exampleText: "How many reviews have a 5-star rating?",
        sortOrder: 8,
      },
      {
        topic: "sales",
        exampleText: "What was the last sale?",
        sortOrder: 20,
      },
      {
        topic: "sales",
        exampleText: "What was the most recent order?",
        sortOrder: 21,
      },
      {
        topic: "sales",
        exampleText: "How many sales orders are there?",
        sortOrder: 22,
      },
      {
        topic: "sales",
        exampleText: "What was the sales value over the last 3 months?",
        sortOrder: 23,
      },
      {
        topic: "sales",
        exampleText: "Sales value over the last 6 months",
        sortOrder: 24,
      },
      {
        topic: "sales",
        exampleText: "What is the average order value?",
        sortOrder: 25,
      },
      {
        topic: "sales",
        exampleText: "What is the minimum order value?",
        sortOrder: 26,
      },
      {
        topic: "sales",
        exampleText: "What is the maximum order value?",
        sortOrder: 27,
      },
      {
        topic: "sales",
        exampleText: "Sales orders by year",
        sortOrder: 28,
      },
      {
        topic: "sales",
        exampleText: "Sales orders by year order by orderCount",
        sortOrder: 29,
      },
      {
        topic: "customer",
        exampleText: "How many customers do I have?",
        sortOrder: 40,
      },
      {
        topic: "customer",
        exampleText: "Show the top 10 customers by sales",
        sortOrder: 41,
      },
      {
        topic: "customer",
        exampleText: "Which customers spend the most in category Bikes?",
        sortOrder: 42,
      },
      {
        topic: "customer",
        exampleText: "How many customers have no orders?",
        sortOrder: 43,
      },
      {
        topic: "customer",
        exampleText: "What is the average customer spend?",
        sortOrder: 44,
      },
      {
        topic: "inventory",
        exampleText: "What is the total stock?",
        sortOrder: 50,
      },
    ];

  await prisma.suggestionExample.deleteMany({
    where: { systemTypeId: ecommerce.id },
  });
  await prisma.suggestionExample.createMany({
    data: suggestions.map((s) => ({
      systemTypeId: ecommerce.id,
      topic: s.topic,
      exampleText: s.exampleText,
      sortOrder: s.sortOrder,
      isActive: true,
    })),
  });

  console.log("Seed OK → ia_ecommerce_db");
  console.log(`  company: ${seed.companyName} (host_key=${seed.hostKey})`);
  console.log(`  user: ${seed.user.username} / ${seed.user.password}`);
  console.log(
    `  client_db_connection.database_name: ${seed.clientDatabaseName}`,
  );
  console.log(
    `  client server: ${productMysql.host}:${productMysql.port} (from DB_*)`,
  );
}

main()
  .catch((e) => {
    console.error(e);
    process.exit(1);
  })
  .finally(async () => {
    await prisma.$disconnect();
  });
