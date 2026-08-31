import { describe, expect, it } from "vitest";
import {
  heuristicClassify,
  isKnownIntent,
} from "@/query-agent/domain/tables";
import {
  CUSTOMER_QUESTION_CASES,
  customerQuestionStats,
} from "../../fixtures/customer-questions";

describe("customer question catalog", () => {
  it("contains exactly 100 cases with unique ids and unique questions", () => {
    expect(CUSTOMER_QUESTION_CASES).toHaveLength(100);
    const ids = CUSTOMER_QUESTION_CASES.map((c) => c.id);
    expect(new Set(ids).size).toBe(100);
    const questions = CUSTOMER_QUESTION_CASES.map((c) => c.question.toLowerCase());
    expect(new Set(questions).size).toBe(100);
  });

  it("reports implemented vs backlog counts", () => {
    const stats = customerQuestionStats();
    expect(stats.total).toBe(100);
    expect(stats.implemented + stats.backlog).toBe(100);
    expect(stats.implemented).toBe(100);
  });

  it("every implemented case (except no_match) uses a known intent", () => {
    for (const c of CUSTOMER_QUESTION_CASES.filter((x) => x.implemented)) {
      if (c.expectedIntent === "no_match") continue;
      expect(
        isKnownIntent(c.expectedIntent),
        `${c.id} unknown intent ${c.expectedIntent}`,
      ).toBe(true);
    }
  });
});

describe("customer heuristic — implemented (must pass)", () => {
  for (const c of CUSTOMER_QUESTION_CASES.filter((x) => x.implemented)) {
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
