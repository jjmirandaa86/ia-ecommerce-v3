import { describe, expect, it } from "vitest";
import {
  INTENT_MODULES,
  buildEcommerceQuery,
} from "@/query-agent/domain/tables";
import { SemanticValidationError } from "@/query-agent/domain/semantics/validate";

/**
 * Smoke: build every intent with empty filters. null is OK (needs filters);
 * SemanticValidationError must never fire (joins ⊆ SemanticDef).
 */
describe("semantic layer — build join assert", () => {
  for (const mod of INTENT_MODULES) {
    for (const intent of mod.intents) {
      it(`${mod.table}/${intent} builds without semantic join errors`, () => {
        try {
          const built = buildEcommerceQuery({ intent, filters: {} });
          if (built) {
            expect(built.sql.toLowerCase()).toMatch(/\bselect\b/);
          }
        } catch (err) {
          expect(err).not.toBeInstanceOf(SemanticValidationError);
          throw err;
        }
      });
    }
  }
});
