import type { IntentModule } from "@/query-agent/domain/intent-module";
import { SALES_ORDER_HEADER_INTENTS } from "@/query-agent/domain/tables/salesorderheader/intents";
import {
  classifySalesOrderHeaderHeuristic,
  normalizeSalesOrderHeaderFilters,
} from "@/query-agent/domain/tables/salesorderheader/heuristic";
import { SALES_ORDER_HEADER_LLM_PROMPT } from "@/query-agent/domain/tables/salesorderheader/prompt";
import { buildSalesOrderHeaderQuery } from "@/query-agent/domain/tables/salesorderheader/sql";
import { formatSalesOrderHeaderAnswer } from "@/query-agent/domain/tables/salesorderheader/format";
import { SALES_ORDER_HEADER_SEMANTICS } from "@/query-agent/domain/tables/salesorderheader/semantics";

export { SALES_ORDER_HEADER_INTENTS } from "@/query-agent/domain/tables/salesorderheader/intents";
export type { SalesOrderHeaderIntent } from "@/query-agent/domain/tables/salesorderheader/intents";
export { SALES_ORDER_HEADER_SEMANTICS } from "@/query-agent/domain/tables/salesorderheader/semantics";

/** Wired salesorderheader entity module (order-level sales). */
export const salesOrderHeaderIntentModule: IntentModule = {
  table: "salesorderheader",
  intents: SALES_ORDER_HEADER_INTENTS,
  preferHeuristic: SALES_ORDER_HEADER_INTENTS,
  classifyHeuristic: classifySalesOrderHeaderHeuristic,
  normalizeFilters: normalizeSalesOrderHeaderFilters,
  llmPromptSection: SALES_ORDER_HEADER_LLM_PROMPT,
  build: buildSalesOrderHeaderQuery,
  format: formatSalesOrderHeaderAnswer,
  semantics: SALES_ORDER_HEADER_SEMANTICS,
};
