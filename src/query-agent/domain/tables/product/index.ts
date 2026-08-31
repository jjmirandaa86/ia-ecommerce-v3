import type { IntentModule } from "@/query-agent/domain/intent-module";
import { PRODUCT_INTENTS } from "@/query-agent/domain/tables/product/intents";
import {
  classifyProductHeuristic,
  normalizeProductFilters,
} from "@/query-agent/domain/tables/product/heuristic";
import { PRODUCT_LLM_PROMPT } from "@/query-agent/domain/tables/product/prompt";
import { buildProductQuery } from "@/query-agent/domain/tables/product/sql";
import { formatProductAnswer } from "@/query-agent/domain/tables/product/format";
import { PRODUCT_SEMANTICS } from "@/query-agent/domain/tables/product/semantics";

export { PRODUCT_INTENTS } from "@/query-agent/domain/tables/product/intents";
export type { ProductIntent } from "@/query-agent/domain/tables/product/intents";
export { PRODUCT_SEMANTICS } from "@/query-agent/domain/tables/product/semantics";

/** Wired product entity module for the intent registry. */
export const productIntentModule: IntentModule = {
  table: "product",
  intents: PRODUCT_INTENTS,
  preferHeuristic: PRODUCT_INTENTS,
  classifyHeuristic: classifyProductHeuristic,
  normalizeFilters: normalizeProductFilters,
  llmPromptSection: PRODUCT_LLM_PROMPT,
  build: buildProductQuery,
  format: formatProductAnswer,
  semantics: PRODUCT_SEMANTICS,
};
