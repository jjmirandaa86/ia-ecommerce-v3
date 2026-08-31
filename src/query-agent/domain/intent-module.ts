import type { SemanticDef } from "@/query-agent/domain/semantics/types";

export type QueryPlan = {
  intent: string;
  filters: Record<string, unknown>;
};

export type BuiltQuery = {
  sql: string;
  params: unknown[];
  columns: string[];
};

export type IntentModule = {
  /** Logical table / topic group for maintenance (e.g. product). */
  table: string;
  intents: readonly string[];
  /** Prefer heuristic over LLM when these match. */
  preferHeuristic?: readonly string[];
  classifyHeuristic: (q: string) => QueryPlan | null;
  normalizeFilters?: (
    intent: string,
    filters: Record<string, unknown>,
  ) => Record<string, unknown>;
  llmPromptSection: string;
  build: (plan: QueryPlan) => BuiltQuery | null;
  format: (plan: QueryPlan, rows: Record<string, unknown>[]) => string | null;
  /**
   * Semantic layer for this module (metric / grain / joins / filters).
   * Every intent in `intents` must have an entry.
   */
  semantics: Readonly<Record<string, SemanticDef>>;
};
