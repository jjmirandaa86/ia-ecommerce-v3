import { prisma } from "@/infrastructure/db/prisma";
import type { AuthedSession } from "@/infrastructure/auth/require-session";
import { classifyQuestion } from "@/infrastructure/llm/classify-question";
import {
  buildEcommerceQuery,
  formatEcommerceAnswer,
} from "@/client-acl/ecommerce/build-query";
import { executeClientSelect } from "@/client-acl/ecommerce/execute";
import {
  detectQuestionScope,
  messageForRefusal,
  type RefusalReason,
} from "@/query-agent/domain/scope";

export type AskQuestionResult =
  | {
      status: "matched";
      answer: string;
      intentName: string;
      intentJson: Record<string, unknown>;
      columns: string[];
      rows: Record<string, unknown>[];
      chart: null;
      sql: string;
      meta: {
        rowCount: number;
        durationMs: number;
        auditId: string;
        classifySource: string;
      };
    }
  | {
      status: "no_match";
      answer: string;
      suggestions: Array<{ topic: string; text: string }>;
      meta: {
        auditId: string;
        durationMs: number;
        reason: RefusalReason | "unsupported_system";
      };
    };

const calendarDayUtc = (): Date => {
  const now = new Date();
  return new Date(
    Date.UTC(now.getUTCFullYear(), now.getUTCMonth(), now.getUTCDate()),
  );
};

const loadClientDb = async (companyId: bigint) => {
  const company = await prisma.clientCompany.findUnique({
    where: { id: companyId },
    include: { connection: { include: { server: true } } },
  });
  const conn = company?.connection;
  const server = conn?.server;
  if (!conn?.isActive || !server?.isActive) return null;
  return {
    engine: server.engine,
    host: server.host,
    port: server.port,
    databaseName: conn.databaseName,
    username: conn.username,
    passwordEncrypted: conn.passwordEncrypted,
    sslEnabled: server.sslEnabled,
  };
};

const ensureConversation = async (session: AuthedSession) => {
  const day = calendarDayUtc();
  return prisma.conversation.upsert({
    where: {
      appUserId_calendarDay: {
        appUserId: BigInt(session.userId),
        calendarDay: day,
      },
    },
    update: {},
    create: {
      appUserId: BigInt(session.userId),
      clientCompanyId: BigInt(session.companyId),
      calendarDay: day,
    },
  });
};

const loadSuggestions = async (systemTypeId: bigint, topicHint?: string) => {
  const rows = await prisma.suggestionExample.findMany({
    where: {
      systemTypeId,
      isActive: true,
      ...(topicHint ? { topic: topicHint } : {}),
    },
    orderBy: [{ sortOrder: "asc" }],
    take: 5,
  });
  if (rows.length === 0 && topicHint) {
    return loadSuggestions(systemTypeId);
  }
  return rows.map((r) => ({ topic: r.topic, text: r.exampleText }));
};

const topicHintForReason = (reason: RefusalReason): string | undefined => {
  if (reason === "unmapped_read") return "product";
  return undefined;
};

type RefuseArgs = {
  session: AuthedSession;
  conversationId: bigint;
  message: string;
  reason: RefusalReason;
  started: number;
  classifyMs?: number;
  llmMs?: number | null;
  intentJson?: Record<string, unknown>;
};

const refuseWithScope = async ({
  session,
  conversationId,
  message,
  reason,
  started,
  classifyMs,
  llmMs,
  intentJson,
}: RefuseArgs): Promise<Extract<AskQuestionResult, { status: "no_match" }>> => {
  const answer = messageForRefusal(reason);
  const suggestions = await loadSuggestions(
    session.systemTypeId,
    topicHintForReason(reason),
  );
  const audit = await prisma.aiQueryAuditLog.create({
    data: {
      appUserId: BigInt(session.userId),
      clientCompanyId: BigInt(session.companyId),
      systemTypeId: session.systemTypeId,
      conversationId,
      userQuestion: message,
      classificationStatus: "no_match",
      intentName: reason,
      intentJson: intentJson ?? { intent: reason, filters: {} },
      classifyMs: classifyMs || undefined,
      llmMs: llmMs ?? undefined,
      durationMs: Date.now() - started,
    },
  });
  await prisma.message.create({
    data: {
      conversationId,
      role: "assistant",
      content: answer,
      aiQueryAuditLogId: audit.id,
    },
  });
  return {
    status: "no_match",
    answer,
    suggestions,
    meta: {
      auditId: audit.id.toString(),
      durationMs: Date.now() - started,
      reason,
    },
  };
};

/**
 * AskQuestion (QueryAgent):
 * scope gate → classify → IntentCatalog → ClientAcl SELECT → audit.
 */
export const askQuestion = async (
  session: AuthedSession,
  message: string,
): Promise<AskQuestionResult> => {
  const started = Date.now();
  const conversation = await ensureConversation(session);

  await prisma.message.create({
    data: {
      conversationId: conversation.id,
      role: "user",
      content: message,
    },
  });

  if (session.systemType !== "ecommerce") {
    const audit = await prisma.aiQueryAuditLog.create({
      data: {
        appUserId: BigInt(session.userId),
        clientCompanyId: BigInt(session.companyId),
        systemTypeId: session.systemTypeId,
        conversationId: conversation.id,
        userQuestion: message,
        classificationStatus: "error",
        errorMessage: `Unsupported system_type: ${session.systemType}`,
        durationMs: Date.now() - started,
      },
    });
    const answer =
      "This company system type is not supported for queries yet.";
    await prisma.message.create({
      data: {
        conversationId: conversation.id,
        role: "assistant",
        content: answer,
        aiQueryAuditLogId: audit.id,
      },
    });
    return {
      status: "no_match",
      answer,
      suggestions: await loadSuggestions(session.systemTypeId),
      meta: {
        auditId: audit.id.toString(),
        durationMs: Date.now() - started,
        reason: "unsupported_system",
      },
    };
  }

  // Scope gate: writes and clear off-topic never reach SQL builders.
  const scope = detectQuestionScope(message);
  if (scope.reason === "write_blocked" || scope.reason === "out_of_scope") {
    return refuseWithScope({
      session,
      conversationId: conversation.id,
      message,
      reason: scope.reason,
      started,
    });
  }

  let classifyMs = 0;
  let llmMs: number | null = null;
  let buildMs = 0;
  let dbMs = 0;
  let formatMs = 0;

  try {
    const classified = await classifyQuestion(message);
    classifyMs = classified.classifyMs;
    llmMs = classified.llmMs;

    if (classified.plan.intent === "no_match") {
      return refuseWithScope({
        session,
        conversationId: conversation.id,
        message,
        reason: "unmapped_read",
        started,
        classifyMs,
        llmMs,
        intentJson: classified.plan,
      });
    }

    const buildStarted = Date.now();
    const built = buildEcommerceQuery(classified.plan);
    buildMs = Date.now() - buildStarted;
    if (!built) {
      throw new Error("No SQL template for intent");
    }

    const clientDb = await loadClientDb(BigInt(session.companyId));
    if (!clientDb) {
      throw new Error("Client database is not configured");
    }

    const exec = await executeClientSelect(clientDb, built);
    dbMs = exec.dbMs;

    const formatStarted = Date.now();
    const answer = formatEcommerceAnswer(classified.plan, exec.rows);
    formatMs = Date.now() - formatStarted;

    const audit = await prisma.aiQueryAuditLog.create({
      data: {
        appUserId: BigInt(session.userId),
        clientCompanyId: BigInt(session.companyId),
        systemTypeId: session.systemTypeId,
        conversationId: conversation.id,
        userQuestion: message,
        classificationStatus: "matched",
        intentName: classified.plan.intent,
        intentJson: classified.plan,
        executedSql: built.sql,
        rowCount: exec.rows.length,
        durationMs: Date.now() - started,
        classifyMs,
        llmMs: llmMs ?? undefined,
        buildMs,
        dbMs,
        formatMs,
        hadChart: false,
      },
    });

    await prisma.message.create({
      data: {
        conversationId: conversation.id,
        role: "assistant",
        content: answer,
        aiQueryAuditLogId: audit.id,
      },
    });

    return {
      status: "matched",
      answer,
      intentName: classified.plan.intent,
      intentJson: classified.plan,
      columns: built.columns,
      rows: exec.rows,
      chart: null,
      sql: built.sql,
      meta: {
        rowCount: exec.rows.length,
        durationMs: Date.now() - started,
        auditId: audit.id.toString(),
        classifySource: classified.source,
      },
    };
  } catch (e) {
    const msg = e instanceof Error ? e.message : "Unexpected error";
    const audit = await prisma.aiQueryAuditLog.create({
      data: {
        appUserId: BigInt(session.userId),
        clientCompanyId: BigInt(session.companyId),
        systemTypeId: session.systemTypeId,
        conversationId: conversation.id,
        userQuestion: message,
        classificationStatus: "error",
        errorMessage: msg,
        durationMs: Date.now() - started,
        classifyMs: classifyMs || undefined,
        llmMs: llmMs ?? undefined,
        buildMs: buildMs || undefined,
        dbMs: dbMs || undefined,
        formatMs: formatMs || undefined,
      },
    });
    const answer =
      "I could not complete that query. Please try again or check Health.";
    await prisma.message.create({
      data: {
        conversationId: conversation.id,
        role: "assistant",
        content: answer,
        aiQueryAuditLogId: audit.id,
      },
    });
    throw Object.assign(new Error(msg), { auditId: audit.id.toString() });
  }
};
