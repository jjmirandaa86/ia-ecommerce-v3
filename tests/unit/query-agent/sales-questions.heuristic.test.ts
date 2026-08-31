import { describe, expect, it } from "vitest";
import {
  heuristicClassify,
  isKnownIntent,
} from "@/query-agent/domain/tables";
import {
  SALES_ORDER_HEADER_QUESTION_CASES,
  salesOrderHeaderQuestionStats,
} from "../../fixtures/salesorderheader-questions";
import {
  SALES_ORDER_DETAIL_QUESTION_CASES,
  salesOrderDetailQuestionStats,
} from "../../fixtures/salesorderdetail-questions";

describe("salesorderheader question catalog", () => {
  it("contains exactly 100 cases with unique ids", () => {
    expect(SALES_ORDER_HEADER_QUESTION_CASES).toHaveLength(100);
    const ids = SALES_ORDER_HEADER_QUESTION_CASES.map((c) => c.id);
    expect(new Set(ids).size).toBe(100);
  });

  it("reports implemented vs backlog counts", () => {
    const stats = salesOrderHeaderQuestionStats();
    expect(stats.total).toBe(100);
    expect(stats.implemented + stats.backlog).toBe(100);
    expect(stats.implemented).toBeGreaterThan(0);
  });

  it("every implemented case (except no_match) uses a known intent", () => {
    for (const c of SALES_ORDER_HEADER_QUESTION_CASES.filter((x) => x.implemented)) {
      if (c.expectedIntent === "no_match") continue;
      expect(
        isKnownIntent(c.expectedIntent),
        `${c.id} unknown intent ${c.expectedIntent}`,
      ).toBe(true);
    }
  });
});

describe("salesorderheader heuristic — implemented (must pass)", () => {
  for (const c of SALES_ORDER_HEADER_QUESTION_CASES.filter((x) => x.implemented)) {
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

describe("salesorderheader heuristic — backlog (skipped until implemented: true)", () => {
  const cases = SALES_ORDER_HEADER_QUESTION_CASES.filter((c) => !c.implemented);
  if (cases.length === 0) {
    it("no backlog cases", () => {
      expect(cases).toHaveLength(0);
    });
    return;
  }
  for (const c of cases) {
    it.skip(`${c.id}: ${c.question} → ${c.expectedIntent}`, () => {
      const plan = heuristicClassify(c.question);
      expect(plan?.intent ?? "no_match").toBe(c.expectedIntent);
    });
  }
});

describe("salesorderheader heuristic — backlog guard", () => {
  const cases = SALES_ORDER_HEADER_QUESTION_CASES.filter((c) => !c.implemented);
  if (cases.length === 0) {
    it("no backlog to guard", () => {
      expect(cases).toHaveLength(0);
    });
    return;
  }
  for (const c of cases) {
    it(`${c.id} not fully matching target yet`, () => {
      const plan = heuristicClassify(c.question);
      const intent = plan?.intent ?? "no_match";
      if (intent !== c.expectedIntent) return;
      const filters = c.expectedFilters;
      if (!filters || Object.keys(filters).length === 0) {
        expect.fail(
          `Already matches ${c.expectedIntent}. Set implemented: true on ${c.id}.`,
        );
      }
      const allFiltersMatch = Object.entries(filters).every(([key, value]) => {
        return plan != null && Object.is(plan.filters[key], value);
      });
      if (allFiltersMatch) {
        expect.fail(
          `Already matches ${c.expectedIntent} + filters. Set implemented: true on ${c.id}.`,
        );
      }
    });
  }
});

describe("salesorderdetail question catalog", () => {
  it("contains exactly 100 cases with unique ids", () => {
    expect(SALES_ORDER_DETAIL_QUESTION_CASES).toHaveLength(100);
    const ids = SALES_ORDER_DETAIL_QUESTION_CASES.map((c) => c.id);
    expect(new Set(ids).size).toBe(100);
  });

  it("reports implemented vs backlog counts", () => {
    const stats = salesOrderDetailQuestionStats();
    expect(stats.total).toBe(100);
    expect(stats.implemented + stats.backlog).toBe(100);
    expect(stats.implemented).toBeGreaterThan(0);
  });

  it("every implemented case (except no_match) uses a known intent", () => {
    for (const c of SALES_ORDER_DETAIL_QUESTION_CASES.filter((x) => x.implemented)) {
      if (c.expectedIntent === "no_match") continue;
      expect(
        isKnownIntent(c.expectedIntent),
        `${c.id} unknown intent ${c.expectedIntent}`,
      ).toBe(true);
    }
  });
});

describe("salesorderdetail heuristic — implemented (must pass)", () => {
  for (const c of SALES_ORDER_DETAIL_QUESTION_CASES.filter((x) => x.implemented)) {
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

describe("salesorderdetail heuristic — backlog (skipped until implemented: true)", () => {
  const cases = SALES_ORDER_DETAIL_QUESTION_CASES.filter((c) => !c.implemented);
  if (cases.length === 0) {
    it("no backlog cases", () => {
      expect(cases).toHaveLength(0);
    });
    return;
  }
  for (const c of cases) {
    it.skip(`${c.id}: ${c.question} → ${c.expectedIntent}`, () => {
      const plan = heuristicClassify(c.question);
      expect(plan?.intent ?? "no_match").toBe(c.expectedIntent);
    });
  }
});

describe("salesorderdetail heuristic — backlog guard", () => {
  const cases = SALES_ORDER_DETAIL_QUESTION_CASES.filter((c) => !c.implemented);
  if (cases.length === 0) {
    it("no backlog to guard", () => {
      expect(cases).toHaveLength(0);
    });
    return;
  }
  for (const c of cases) {
    it(`${c.id} not fully matching target yet`, () => {
      const plan = heuristicClassify(c.question);
      const intent = plan?.intent ?? "no_match";
      if (intent !== c.expectedIntent) return;
      const filters = c.expectedFilters;
      if (!filters || Object.keys(filters).length === 0) {
        expect.fail(
          `Already matches ${c.expectedIntent}. Set implemented: true on ${c.id}.`,
        );
      }
      const allFiltersMatch = Object.entries(filters).every(([key, value]) => {
        return plan != null && Object.is(plan.filters[key], value);
      });
      if (allFiltersMatch) {
        expect.fail(
          `Already matches ${c.expectedIntent} + filters. Set implemented: true on ${c.id}.`,
        );
      }
    });
  }
});
