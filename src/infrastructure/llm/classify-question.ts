import { env } from "@/shared/env";
import type { QueryPlan } from "@/query-agent/domain/tables";
import {
  buildLlmSystemPrompt,
  heuristicClassify,
  parseClassificationJson,
  preferHeuristicIntent,
} from "@/query-agent/domain/tables";

export type Classification = {
  plan: QueryPlan;
  source: "llm" | "heuristic";
  classifyMs: number;
  llmMs: number | null;
  model: string;
};

const classifyWithOllama = async (text: string): Promise<{
  plan: QueryPlan | null;
  llmMs: number;
}> => {
  const started = Date.now();
  const res = await fetch(env.llmGenerateUrl, {
    method: "POST",
    headers: { "Content-Type": "application/json" },
    signal: AbortSignal.timeout(60_000),
    body: JSON.stringify({
      model: env.llmModel,
      stream: false,
      prompt: `${buildLlmSystemPrompt()}\n\nUser question:\n${text}\n\nJSON:`,
      options: { temperature: 0 },
    }),
  });
  const llmMs = Date.now() - started;
  if (!res.ok) {
    throw new Error(`LLM HTTP ${res.status}`);
  }
  const body = (await res.json()) as { response?: string };
  const plan = parseClassificationJson(body.response ?? "");
  return { plan, llmMs };
}

/** Prefer clear heuristic matches; otherwise LLM; else heuristic / no_match. */
export const classifyQuestion = async (text: string): Promise<Classification> => {
  const started = Date.now();
  const heuristic = heuristicClassify(text);

  if (heuristic && preferHeuristicIntent(heuristic.intent)) {
    return {
      plan: heuristic,
      source: "heuristic",
      classifyMs: Date.now() - started,
      llmMs: null,
      model: "heuristic",
    };
  }

  try {
    const { plan, llmMs } = await classifyWithOllama(text);
    if (plan) {
      return {
        plan,
        source: "llm",
        classifyMs: Date.now() - started,
        llmMs,
        model: env.llmModel,
      };
    }
  } catch {
    // fall through
  }

  if (heuristic) {
    return {
      plan: heuristic,
      source: "heuristic",
      classifyMs: Date.now() - started,
      llmMs: null,
      model: "heuristic",
    };
  }

  return {
    plan: { intent: "no_match", filters: {} },
    source: "heuristic",
    classifyMs: Date.now() - started,
    llmMs: null,
    model: "heuristic",
  };
}
