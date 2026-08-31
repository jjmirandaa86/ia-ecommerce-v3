import { describe, expect, it } from "vitest";
import {
  heuristicClassify,
  isKnownIntent,
} from "@/query-agent/domain/tables";
import {
  MIXED_JOIN_QUESTION_CASES,
  mixedJoinQuestionStats,
} from "../../fixtures/mixed-join-questions";

describe("mixed-join question catalog", () => {
  it("contains exactly 500 cases with unique ids and unique questions", () => {
    expect(MIXED_JOIN_QUESTION_CASES).toHaveLength(500);
    const ids = MIXED_JOIN_QUESTION_CASES.map((c) => c.id);
    expect(new Set(ids).size).toBe(500);
    const questions = MIXED_JOIN_QUESTION_CASES.map((c) => c.question.toLowerCase());
    expect(new Set(questions).size).toBe(500);
  });

  it("every case lists at least two join tables", () => {
    for (const c of MIXED_JOIN_QUESTION_CASES) {
      expect(c.joinTables.length, c.id).toBeGreaterThanOrEqual(2);
    }
  });

  it("reports implemented vs backlog and multiple join families", () => {
    const stats = mixedJoinQuestionStats();
    expect(stats.total).toBe(500);
    expect(stats.implemented + stats.backlog).toBe(500);
    expect(Object.keys(stats.byFamily).length).toBeGreaterThanOrEqual(8);
  });

  it("every implemented case (except no_match) uses a known intent", () => {
    for (const c of MIXED_JOIN_QUESTION_CASES.filter((x) => x.implemented)) {
      if (c.expectedIntent === "no_match") continue;
      expect(
        isKnownIntent(c.expectedIntent),
        `${c.id} unknown intent ${c.expectedIntent}`,
      ).toBe(true);
    }
  });
});

describe("mixed-join heuristic — implemented (must pass)", () => {
  for (const c of MIXED_JOIN_QUESTION_CASES.filter((x) => x.implemented)) {
    it(`${c.id}: ${c.question}`, () => {
      const plan = heuristicClassify(c.question);
      const intent = plan?.intent ?? "no_match";
      expect(intent).toBe(c.expectedIntent);
      if (c.expectedFilters && plan) {
        for (const [key, value] of Object.entries(c.expectedFilters)) {
          expect(plan.filters[key], `${c.id} filter ${key}`).toEqual(value);
        }
      }
    });
  }
});
