import { prisma } from "@/infrastructure/db/prisma";
import type { AuthedSession } from "@/infrastructure/auth/require-session";
import {
  buildDashboardStats,
  dashboardPeriodStart,
  type DashboardStats,
} from "@/query-agent/domain/dashboard-stats";

/**
 * GetDashboardStats: KPIs + chart series from `ai_query_audit_log`
 * for the authenticated company (default last 7 UTC days).
 */
export const getDashboardStats = async (
  session: AuthedSession,
  periodDays: number,
  now: Date = new Date(),
): Promise<DashboardStats> => {
  const from = dashboardPeriodStart(now, periodDays);
  const rows = await prisma.aiQueryAuditLog.findMany({
    where: {
      clientCompanyId: BigInt(session.companyId),
      createdAt: { gte: from },
    },
    select: {
      createdAt: true,
      classificationStatus: true,
      intentName: true,
      durationMs: true,
      classifyMs: true,
      llmMs: true,
      buildMs: true,
      dbMs: true,
      formatMs: true,
    },
  });

  return buildDashboardStats(rows, periodDays, now);
}
