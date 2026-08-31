import type { IntentModule } from "@/query-agent/domain/intent-module";
import { MIXED_INTENTS } from "@/query-agent/domain/tables/mixed/intents";
import {
  classifyMixedHeuristic,
  normalizeMixedFilters,
} from "@/query-agent/domain/tables/mixed/heuristic";
import { MIXED_LLM_PROMPT } from "@/query-agent/domain/tables/mixed/prompt";
import { buildMixedQuery } from "@/query-agent/domain/tables/mixed/sql";
import { formatMixedAnswer } from "@/query-agent/domain/tables/mixed/format";
import { MIXED_SEMANTICS } from "@/query-agent/domain/tables/mixed/semantics";

export { MIXED_INTENTS } from "@/query-agent/domain/tables/mixed/intents";
export type { MixedIntent } from "@/query-agent/domain/tables/mixed/intents";
export { MIXED_SEMANTICS } from "@/query-agent/domain/tables/mixed/semantics";

/** Cross-table join module — register before single-entity modules. */
export const mixedIntentModule: IntentModule = {
  table: "mixed",
  intents: MIXED_INTENTS,
  preferHeuristic: MIXED_INTENTS,
  classifyHeuristic: classifyMixedHeuristic,
  normalizeFilters: normalizeMixedFilters,
  llmPromptSection: MIXED_LLM_PROMPT,
  build: buildMixedQuery,
  format: formatMixedAnswer,
  semantics: MIXED_SEMANTICS,
};
