import { NextRequest, NextResponse } from "next/server";
import { prisma } from "@/infrastructure/db/prisma";
import { pingClientDatabase } from "@/infrastructure/db/client-db-ping";
import { env } from "@/shared/env";

const pingProductDb = async (): Promise<{
  status: "up" | "down";
  latencyMs?: number;
  detail?: string;
  engine?: string;
}> => {
  const start = Date.now();
  const expected = env.mysql.name;
  try {
    const rows = await prisma.$queryRaw<Array<{ db: string | null }>>`
      SELECT DATABASE() AS db
    `;
    const current = rows[0]?.db ?? null;
    if (!current) {
      return {
        status: "down",
        detail: "no database selected",
        engine: env.mysql.engine,
      };
    }
    if (current !== expected) {
      return {
        status: "down",
        latencyMs: Date.now() - start,
        detail: `connected to ${current}, expected ${expected}`,
        engine: env.mysql.engine,
      };
    }
    return {
      status: "up",
      latencyMs: Date.now() - start,
      detail: current,
      engine: env.mysql.engine,
    };
  } catch (e) {
    return {
      status: "down",
      detail: e instanceof Error ? e.message : "unknown",
      engine: env.mysql.engine,
    };
  }
}

const pingLlm = async (): Promise<{
  status: "up" | "down";
  latencyMs?: number;
  detail?: string;
}> => {
  const start = Date.now();
  try {
    const res = await fetch(`${env.llmBaseUrl}/api/tags`, {
      method: "GET",
      signal: AbortSignal.timeout(3000),
    });
    if (!res.ok) {
      return { status: "down", detail: `HTTP ${res.status}` };
    }
    const body = (await res.json()) as {
      models?: Array<{ name?: string }>;
    };
    const model = env.llmModel;
    const hasModel = (body.models ?? []).some(
      (m) => m.name === model || m.name?.startsWith(`${model}:`),
    );
    return {
      status: "up",
      latencyMs: Date.now() - start,
      detail: hasModel ? model : `up (model ${model} not pulled)`,
    };
  } catch (e) {
    return {
      status: "down",
      detail: e instanceof Error ? e.message : "unreachable",
    };
  }
}

export const GET = async (req: NextRequest) => {
  const [productDatabase, llm, clientDatabase] = await Promise.all([
    pingProductDb(),
    pingLlm(),
    pingClientDatabase(req),
  ]);

  return NextResponse.json({
    ok: true,
    data: {
      app: { status: "up" },
      productDatabase,
      llm,
      clientDatabase,
    },
  });
}
