import { describe, expect, it } from "vitest";
import {
  buildDashboardStats,
  dashboardPeriodStart,
  type AuditTimingRow,
} from "@/query-agent/domain/dashboard-stats";

const NOW = new Date("2026-08-25T15:00:00.000Z");

const row = (
  partial: Partial<AuditTimingRow> & Pick<AuditTimingRow, "createdAt">,
): AuditTimingRow => {
  return {
    classificationStatus: "matched",
    intentName: "count_products",
    durationMs: 100,
    classifyMs: 10,
    llmMs: 80,
    buildMs: 1,
    dbMs: 8,
    formatMs: 1,
    ...partial,
  };
}

describe("buildDashboardStats", () => {
  it("fills every UTC day in the window with zeros when there are no rows", () => {
    const stats = buildDashboardStats([], 7, NOW);
    expect(stats.kpis.totalQueries).toBe(0);
    expect(stats.kpis.successRate).toBe(0);
    expect(stats.queriesOverTime).toHaveLength(7);
    expect(stats.queriesOverTime[0]?.date).toBe("2026-08-19");
    expect(stats.queriesOverTime[6]?.date).toBe("2026-08-25");
    expect(stats.queriesOverTime.every((d) => d.count === 0)).toBe(true);
    expect(stats.latencyByService.map((s) => s.service)).toEqual([
      "Classify",
      "LLM",
      "Build SQL",
      "Database",
      "Format",
    ]);
  });

  it("counts success rate as matched / total and ignores null timings", () => {
    const stats = buildDashboardStats(
      [
        row({
          createdAt: new Date("2026-08-25T10:00:00.000Z"),
          classificationStatus: "matched",
          durationMs: 200,
          llmMs: 100,
          dbMs: 20,
        }),
        row({
          createdAt: new Date("2026-08-25T11:00:00.000Z"),
          classificationStatus: "no_match",
          intentName: "no_match",
          durationMs: 800,
          llmMs: null,
          dbMs: null,
          buildMs: null,
          formatMs: null,
        }),
      ],
      7,
      NOW,
    );

    expect(stats.kpis.totalQueries).toBe(2);
    expect(stats.kpis.successRate).toBe(50);
    expect(stats.kpis.avgResponseMs).toBe(500);
    expect(stats.kpis.avgLlmMs).toBe(100);
    expect(stats.kpis.avgDbMs).toBe(20);
    expect(stats.queriesOverTime.find((d) => d.date === "2026-08-25")?.count).toBe(
      2,
    );
    expect(stats.queriesByEntity).toEqual([
      { entity: "no_match", count: 1 },
      { entity: "product", count: 1 },
    ]);
  });

  it("groups intents by catalog entity (product vs review)", () => {
    const stats = buildDashboardStats(
      [
        row({
          createdAt: new Date("2026-08-25T10:00:00.000Z"),
          intentName: "count_products",
        }),
        row({
          createdAt: new Date("2026-08-25T10:01:00.000Z"),
          intentName: "list_products",
        }),
        row({
          createdAt: new Date("2026-08-25T10:02:00.000Z"),
          intentName: "count_reviews",
        }),
      ],
      7,
      NOW,
    );
    expect(stats.queriesByEntity).toEqual([
      { entity: "product", count: 2 },
      { entity: "review", count: 1 },
    ]);
  });

  it("starts the window at the beginning of the first UTC day", () => {
    const from = dashboardPeriodStart(NOW, 7);
    expect(from.toISOString()).toBe("2026-08-19T00:00:00.000Z");
  });

  it("nests query cost by entity → intent → heuristic vs llm", () => {
    const stats = buildDashboardStats(
      [
        row({
          createdAt: new Date("2026-08-25T10:00:00.000Z"),
          intentName: "count_products",
          durationMs: 80,
          llmMs: null,
        }),
        row({
          createdAt: new Date("2026-08-25T10:01:00.000Z"),
          intentName: "count_products",
          durationMs: 7000,
          llmMs: 6900,
        }),
        row({
          createdAt: new Date("2026-08-25T10:02:00.000Z"),
          intentName: "count_reviews",
          durationMs: 90,
          llmMs: null,
        }),
      ],
      7,
      NOW,
    );

    expect(stats.queriesByCost).toEqual([
      {
        name: "product",
        value: 7080,
        count: 2,
        avgMs: 3540,
        children: [
          {
            name: "count_products",
            value: 7080,
            count: 2,
            avgMs: 3540,
            children: [
              {
                name: "llm",
                value: 7000,
                count: 1,
                avgMs: 7000,
              },
              {
                name: "heuristic",
                value: 80,
                count: 1,
                avgMs: 80,
              },
            ],
          },
        ],
      },
      {
        name: "review",
        value: 90,
        count: 1,
        avgMs: 90,
        children: [
          {
            name: "count_reviews",
            value: 90,
            count: 1,
            avgMs: 90,
            children: [
              {
                name: "heuristic",
                value: 90,
                count: 1,
                avgMs: 90,
              },
            ],
          },
        ],
      },
    ]);
  });
});
