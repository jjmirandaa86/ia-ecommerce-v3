import type { IntentModule } from "@/query-agent/domain/intent-module";
import { CUSTOMER_INTENTS } from "@/query-agent/domain/tables/customer/intents";
import {
  classifyCustomerHeuristic,
  normalizeCustomerFilters,
} from "@/query-agent/domain/tables/customer/heuristic";
import { CUSTOMER_LLM_PROMPT } from "@/query-agent/domain/tables/customer/prompt";
import { buildCustomerQuery } from "@/query-agent/domain/tables/customer/sql";
import { formatCustomerAnswer } from "@/query-agent/domain/tables/customer/format";
import { CUSTOMER_SEMANTICS } from "@/query-agent/domain/tables/customer/semantics";

export { CUSTOMER_INTENTS } from "@/query-agent/domain/tables/customer/intents";
export type { CustomerIntent } from "@/query-agent/domain/tables/customer/intents";
export { CUSTOMER_SEMANTICS } from "@/query-agent/domain/tables/customer/semantics";

/** Wired customer entity module. */
export const customerIntentModule: IntentModule = {
  table: "customer",
  intents: CUSTOMER_INTENTS,
  preferHeuristic: CUSTOMER_INTENTS,
  classifyHeuristic: classifyCustomerHeuristic,
  normalizeFilters: normalizeCustomerFilters,
  llmPromptSection: CUSTOMER_LLM_PROMPT,
  build: buildCustomerQuery,
  format: formatCustomerAnswer,
  semantics: CUSTOMER_SEMANTICS,
};
