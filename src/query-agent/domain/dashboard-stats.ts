/**
 * Dashboard stats DTO + aggregation from audit rows (no Prisma).
 * Source of truth: `ai_query_audit_log`. successRate = matched / total * 100.
 */
import { entityForIntent } from "@/query-agent/domain/tables";

export const LATENCY_SERVICES = [
  "Classify",
  "LLM",
  "Build SQL",
  "Database",
  "Format",
] as const;

export type LatencyService = (typeof LATENCY_SERVICES)[number];

export type AuditTimingRow = {
  createdAt: Date;
  classificationStatus: "matched" | "no_match" | "error";
  intentName: string | null;
  durationMs: number | null;
  classifyMs: number | null;
  llmMs: number | null;
  buildMs: number | null;
  dbMs: number | null;
  formatMs: number | null;
};

export type DashboardStats = {
  periodDays: number;
  kpis: {
    totalQueries: number;
    successRate: number;
    avgResponseMs: number;
    avgLlmMs: number;
    avgDbMs: number;
  };
  queriesOverTime: Array<{ date: string; count: number }>;
  latencyByService: Array<{ service: LatencyService; avgMs: number }>;
  queriesByEntity: Array<{ entity: string; count: number }>;
  queriesByCost: CostTreemapNode[];
};

export type CostTreemapNode = {
  name: string;
  value: number;
  count: number;
  avgMs: number;
  children?: CostTreemapNode[];
};

export const startOfUtcDay = (value: Date): Date => {
  return new Date(
    Date.UTC(value.getUTCFullYear(), value.getUTCMonth(), value.getUTCDate()),
  );
}

/** Inclusive window: today UTC minus (periodDays - 1) calendar days. */
export const dashboardPeriodStart = (now: Date, periodDays: number): Date => {
  const today = startOfUtcDay(now);
  return new Date(today.getTime() - (periodDays - 1) * 24 * 60 * 60 * 1000);
}

const utcDateKey = (value: Date): string => {
  return value.toISOString().slice(0, 10);
}

const isFiniteNumber = (value: number | null | undefined): value is number => {
  return typeof value === "number" && Number.isFinite(value);
};

const average = (values: number[]): number => {
  if (values.length === 0) return 0;
  return Math.round(values.reduce((sum, n) => sum + n, 0) / values.length);
}

type CostBucket = { totalMs: number; count: number };

const emptyBucket = (): CostBucket => {
  return { totalMs: 0, count: 0 };
}

const addDuration = (bucket: CostBucket, durationMs: number | null): void => {
  bucket.count += 1;
  bucket.totalMs += isFiniteNumber(durationMs) ? durationMs : 0;
}

const nodeFromBucket = (
  name: string,
  bucket: CostBucket,
  children?: CostTreemapNode[],
): CostTreemapNode => {
  const liveChildren = children?.filter((c) => c.count > 0);
  return {
    name,
    value: bucket.totalMs,
    count: bucket.count,
    avgMs:
      bucket.count > 0 ? Math.round(bucket.totalMs / bucket.count) : 0,
    ...(liveChildren && liveChildren.length > 0
      ? { children: liveChildren.sort((a, b) => b.value - a.value) }
      : {}),
  };
}

/**
 * Nested cost tree: entity → intent → classify source (heuristic | llm).
 * `value` is sum of `duration_ms` so slow/frequent tiles are larger.
 */
export const buildCostTreemap = (rows: AuditTimingRow[]): CostTreemapNode[] => {
  const tree = new Map<
    string,
    Map<string, { heuristic: CostBucket; llm: CostBucket }>
  >();

  for (const row of rows) {
    const entity = entityForIntent(row.intentName);
    const intent = row.intentName?.trim() || "unknown";
    const source = isFiniteNumber(row.llmMs) ? "llm" : "heuristic";
    let intents = tree.get(entity);
    if (!intents) {
      intents = new Map();
      tree.set(entity, intents);
    }
    let sources = intents.get(intent);
    if (!sources) {
      sources = { heuristic: emptyBucket(), llm: emptyBucket() };
      intents.set(intent, sources);
    }
    addDuration(sources[source], row.durationMs);
  }

  const entities: CostTreemapNode[] = [];
  for (const [entity, intents] of tree) {
    const entityBucket = emptyBucket();
    const intentNodes: CostTreemapNode[] = [];
    for (const [intent, sources] of intents) {
      const intentBucket = emptyBucket();
      intentBucket.count = sources.heuristic.count + sources.llm.count;
      intentBucket.totalMs = sources.heuristic.totalMs + sources.llm.totalMs;
      intentNodes.push(
        nodeFromBucket(intent, intentBucket, [
          nodeFromBucket("heuristic", sources.heuristic),
          nodeFromBucket("llm", sources.llm),
        ]),
      );
      entityBucket.count += intentBucket.count;
      entityBucket.totalMs += intentBucket.totalMs;
    }
    entities.push(nodeFromBucket(entity, entityBucket, intentNodes));
  }

  return entities.sort((a, b) => b.value - a.value);
}

export const buildDashboardStats = (
  rows: AuditTimingRow[],
  periodDays: number,
  now: Date = new Date(),
): DashboardStats => {
  const totalQueries = rows.length;
  const matched = rows.filter((r) => r.classificationStatus === "matched")
    .length;
  const successRate =
    totalQueries > 0
      ? Number(((matched / totalQueries) * 100).toFixed(1))
      : 0;

  const from = dashboardPeriodStart(now, periodDays);
  const queriesOverTime: Array<{ date: string; count: number }> = [];
  for (let i = 0; i < periodDays; i += 1) {
    const day = new Date(from.getTime() + i * 24 * 60 * 60 * 1000);
    const date = utcDateKey(day);
    queriesOverTime.push({
      date,
      count: rows.filter((r) => utcDateKey(r.createdAt) === date).length,
    });
  }

  const entityCounts = new Map<string, number>();
  for (const row of rows) {
    const entity = entityForIntent(row.intentName);
    entityCounts.set(entity, (entityCounts.get(entity) ?? 0) + 1);
  }
  const queriesByEntity = [...entityCounts.entries()]
    .map(([entity, count]) => ({ entity, count }))
    .sort((a, b) => b.count - a.count || a.entity.localeCompare(b.entity));

  return {
    periodDays,
    kpis: {
      totalQueries,
      successRate,
      avgResponseMs: average(
        rows.map((r) => r.durationMs).filter(isFiniteNumber),
      ),
      avgLlmMs: average(rows.map((r) => r.llmMs).filter(isFiniteNumber)),
      avgDbMs: average(rows.map((r) => r.dbMs).filter(isFiniteNumber)),
    },
    queriesOverTime,
    latencyByService: [
      {
        service: "Classify",
        avgMs: average(rows.map((r) => r.classifyMs).filter(isFiniteNumber)),
      },
      {
        service: "LLM",
        avgMs: average(rows.map((r) => r.llmMs).filter(isFiniteNumber)),
      },
      {
        service: "Build SQL",
        avgMs: average(rows.map((r) => r.buildMs).filter(isFiniteNumber)),
      },
      {
        service: "Database",
        avgMs: average(rows.map((r) => r.dbMs).filter(isFiniteNumber)),
      },
      {
        service: "Format",
        avgMs: average(rows.map((r) => r.formatMs).filter(isFiniteNumber)),
      },
    ],
    queriesByEntity,
    queriesByCost: buildCostTreemap(rows),
  };
}
