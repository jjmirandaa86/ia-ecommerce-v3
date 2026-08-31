import { describe, expect, it } from "vitest";
import {
  INTENT_MODULES,
  SEMANTIC_REGISTRY,
  getSemanticDef,
} from "@/query-agent/domain/tables";

describe("semantic layer coverage", () => {
  it("every module intent has a SemanticDef entry", () => {
    for (const mod of INTENT_MODULES) {
      for (const intent of mod.intents) {
        const def = mod.semantics[intent];
        expect(def, `${mod.table}: missing semantics for ${intent}`).toBeTruthy();
        expect(def.intent).toBe(intent);
        expect(def.entity).toBe(mod.table);
        expect(def.joins.length).toBeGreaterThan(0);
        expect(Array.isArray(def.filtersAllowed)).toBe(true);
      }
    }
  });

  it("merged registry has no duplicate intents and matches module maps", () => {
    const fromModules = new Set(
      INTENT_MODULES.flatMap((m) => [...m.intents]),
    );
    expect(Object.keys(SEMANTIC_REGISTRY).sort()).toEqual(
      [...fromModules].sort(),
    );
    for (const intent of fromModules) {
      expect(getSemanticDef(intent)?.intent).toBe(intent);
    }
  });

  it("no intent is registered in more than one module", () => {
    const seen = new Map<string, string>();
    for (const mod of INTENT_MODULES) {
      for (const intent of mod.intents) {
        const prev = seen.get(intent);
        expect(
          prev,
          `duplicate intent "${intent}" in ${prev} and ${mod.table}`,
        ).toBeUndefined();
        seen.set(intent, mod.table);
      }
    }
  });
});
