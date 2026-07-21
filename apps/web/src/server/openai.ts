import "server-only";

import OpenAI from "openai";
import { zodTextFormat } from "openai/helpers/zod";
import type { z } from "zod";

const DEFAULT_MODEL = "gpt-5.6";
const DEFAULT_TIMEOUT_MS = 15_000;
const MIN_TIMEOUT_MS = 2_000;
const MAX_TIMEOUT_MS = 20_000;

export interface StructuredOutputRequest<T> {
  schema: z.ZodType<T>;
  schemaName: string;
  instructions: string;
  input: unknown;
  maxOutputTokens: number;
}

export type StructuredOutputExecutor = <T>(
  request: StructuredOutputRequest<T>,
) => Promise<T>;

function configuredModel(): string | null {
  const model = process.env.OPENAI_MODEL?.trim() || DEFAULT_MODEL;
  return /^gpt-5\.6(?:-[a-z0-9.-]+)?$/u.test(model) ? model : null;
}

function configuredTimeout(): number {
  const parsed = Number.parseInt(process.env.AI_REQUEST_TIMEOUT_MS ?? "", 10);
  if (!Number.isFinite(parsed)) return DEFAULT_TIMEOUT_MS;
  return Math.min(MAX_TIMEOUT_MS, Math.max(MIN_TIMEOUT_MS, parsed));
}

export function openAiRuntimeStatus(): {
  enabled: boolean;
  model: string | null;
  reason: "ready" | "disabled" | "missing_key" | "invalid_model";
} {
  if (process.env.ENABLE_GPT56 !== "true") {
    return { enabled: false, model: configuredModel(), reason: "disabled" };
  }
  if (!process.env.OPENAI_API_KEY?.trim()) {
    return { enabled: false, model: configuredModel(), reason: "missing_key" };
  }
  const model = configuredModel();
  if (!model) return { enabled: false, model: null, reason: "invalid_model" };
  return { enabled: true, model, reason: "ready" };
}

export const executeStructuredOutput: StructuredOutputExecutor = async <T>(
  request: StructuredOutputRequest<T>,
): Promise<T> => {
  const status = openAiRuntimeStatus();
  if (!status.enabled || !status.model) {
    throw new Error("GPT-5.6 is not available");
  }

  const timeout = configuredTimeout();
  const client = new OpenAI({
    apiKey: process.env.OPENAI_API_KEY,
    timeout,
    maxRetries: 0,
    logLevel: "off",
  });
  const response = await client.responses.parse(
    {
      model: status.model,
      instructions: request.instructions,
      input: JSON.stringify(request.input),
      text: {
        format: zodTextFormat(request.schema, request.schemaName),
        verbosity: "low",
      },
      reasoning: { effort: "none" },
      max_output_tokens: request.maxOutputTokens,
      store: false,
      truncation: "disabled",
    },
    { timeout, maxRetries: 0 },
  );

  const parsed = request.schema.safeParse(response.output_parsed);
  if (!parsed.success) throw new Error("GPT-5.6 returned an invalid structured result");
  return parsed.data;
};
