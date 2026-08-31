import type { IntentModule } from "@/query-agent/domain/intent-module";
import { SALES_ORDER_DETAIL_INTENTS } from "@/query-agent/domain/tables/salesorderdetail/intents";
import {
  classifySalesOrderDetailHeuristic,
  normalizeSalesOrderDetailFilters,
} from "@/query-agent/domain/tables/salesorderdetail/heuristic";
import { SALES_ORDER_DETAIL_LLM_PROMPT } from "@/query-agent/domain/tables/salesorderdetail/prompt";
import { buildSalesOrderDetailQuery } from "@/query-agent/domain/tables/salesorderdetail/sql";
import { formatSalesOrderDetailAnswer } from "@/query-agent/domain/tables/salesorderdetail/format";
import { SALES_ORDER_DETAIL_SEMANTICS } from "@/query-agent/domain/tables/salesorderdetail/semantics";

export { SALES_ORDER_DETAIL_INTENTS } from "@/query-agent/domain/tables/salesorderdetail/intents";
export type { SalesOrderDetailIntent } from "@/query-agent/domain/tables/salesorderdetail/intents";
export { SALES_ORDER_DETAIL_SEMANTICS } from "@/query-agent/domain/tables/salesorderdetail/semantics";

/** Wired salesorderdetail entity module (line items / product sales). */
export const salesOrderDetailIntentModule: IntentModule = {
  table: "salesorderdetail",
  intents: SALES_ORDER_DETAIL_INTENTS,
  preferHeuristic: SALES_ORDER_DETAIL_INTENTS,
  classifyHeuristic: classifySalesOrderDetailHeuristic,
  normalizeFilters: normalizeSalesOrderDetailFilters,
  llmPromptSection: SALES_ORDER_DETAIL_LLM_PROMPT,
  build: buildSalesOrderDetailQuery,
  format: formatSalesOrderDetailAnswer,
  semantics: SALES_ORDER_DETAIL_SEMANTICS,
};
