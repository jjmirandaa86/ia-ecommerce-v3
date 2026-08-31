import type { IntentModule } from "@/query-agent/domain/intent-module";
import { REVIEW_INTENTS } from "@/query-agent/domain/tables/review/intents";
import {
  classifyReviewHeuristic,
  normalizeReviewFilters,
} from "@/query-agent/domain/tables/review/heuristic";
import { REVIEW_LLM_PROMPT } from "@/query-agent/domain/tables/review/prompt";
import { buildReviewQuery } from "@/query-agent/domain/tables/review/sql";
import { formatReviewAnswer } from "@/query-agent/domain/tables/review/format";
import { REVIEW_SEMANTICS } from "@/query-agent/domain/tables/review/semantics";

export { REVIEW_INTENTS } from "@/query-agent/domain/tables/review/intents";
export type { ReviewIntent } from "@/query-agent/domain/tables/review/intents";
export { REVIEW_SEMANTICS } from "@/query-agent/domain/tables/review/semantics";

/** Wired review entity module for the intent registry. */
export const reviewIntentModule: IntentModule = {
  table: "review",
  intents: REVIEW_INTENTS,
  preferHeuristic: REVIEW_INTENTS,
  classifyHeuristic: classifyReviewHeuristic,
  normalizeFilters: normalizeReviewFilters,
  llmPromptSection: REVIEW_LLM_PROMPT,
  build: buildReviewQuery,
  format: formatReviewAnswer,
  semantics: REVIEW_SEMANTICS,
};
