import { z } from "zod";
import { afterEach, beforeAll, beforeEach, describe, expect, it, vi } from "vitest";

vi.mock("server-only", () => ({}));

const openAiMock = vi.hoisted(() => ({
  construct: vi.fn(),
  parse: vi.fn(),
}));

vi.mock("openai", () => ({
  default: class MockOpenAI {
    responses = { parse: openAiMock.parse };

    constructor(options: unknown) {
      openAiMock.construct(options);
    }
  },
}));

vi.mock("openai/helpers/zod", () => ({
  zodTextFormat: vi.fn(() => ({ type: "json_schema" })),
}));

let runtimeStatus: typeof import("./openai").openAiRuntimeStatus;
let executeStructuredOutput: typeof import("./openai").executeStructuredOutput;
const originalEnvironment = {
  enable: process.env.ENABLE_GPT56,
  apiKey: process.env.OPENAI_API_KEY,
  model: process.env.OPENAI_MODEL,
};

beforeAll(async () => {
  ({ openAiRuntimeStatus: runtimeStatus, executeStructuredOutput } = await import("./openai"));
});

beforeEach(() => vi.clearAllMocks());

afterEach(() => {
  if (originalEnvironment.enable === undefined) delete process.env.ENABLE_GPT56;
  else process.env.ENABLE_GPT56 = originalEnvironment.enable;
  if (originalEnvironment.apiKey === undefined) delete process.env.OPENAI_API_KEY;
  else process.env.OPENAI_API_KEY = originalEnvironment.apiKey;
  if (originalEnvironment.model === undefined) delete process.env.OPENAI_MODEL;
  else process.env.OPENAI_MODEL = originalEnvironment.model;
});

describe("GPT-5.6 runtime status", () => {
  it("defaults to deterministic-only mode when the feature flag is absent", () => {
    delete process.env.ENABLE_GPT56;
    process.env.OPENAI_API_KEY = "test-key";
    process.env.OPENAI_MODEL = "gpt-5.6";
    expect(runtimeStatus()).toEqual({ enabled: false, model: "gpt-5.6", reason: "disabled" });
    expect(openAiMock.construct).not.toHaveBeenCalled();
  });

  it("stays disabled unless explicitly enabled", () => {
    process.env.ENABLE_GPT56 = "false";
    process.env.OPENAI_API_KEY = "test-key";
    process.env.OPENAI_MODEL = "gpt-5.6";
    expect(runtimeStatus()).toEqual({ enabled: false, model: "gpt-5.6", reason: "disabled" });
  });

  it("uses the mocked official client with bounded, non-stored structured output", async () => {
    process.env.ENABLE_GPT56 = "true";
    process.env.OPENAI_API_KEY = "test-key";
    process.env.OPENAI_MODEL = "gpt-5.6";
    openAiMock.parse.mockResolvedValue({ output_parsed: { value: "controlled" } });

    await expect(
      executeStructuredOutput({
        schema: z.object({ value: z.literal("controlled") }).strict(),
        schemaName: "test_controlled_output",
        instructions: "Return the controlled value only.",
        input: { patientText: "synthetic input" },
        maxOutputTokens: 40,
      }),
    ).resolves.toEqual({ value: "controlled" });

    expect(openAiMock.construct).toHaveBeenCalledWith(
      expect.objectContaining({ apiKey: "test-key", maxRetries: 0, logLevel: "off" }),
    );
    expect(openAiMock.parse).toHaveBeenCalledWith(
      expect.objectContaining({
        model: "gpt-5.6",
        store: false,
        max_output_tokens: 40,
        truncation: "disabled",
      }),
      expect.objectContaining({ maxRetries: 0 }),
    );
  });

  it("fails closed when the API key is missing", () => {
    process.env.ENABLE_GPT56 = "true";
    delete process.env.OPENAI_API_KEY;
    process.env.OPENAI_MODEL = "gpt-5.6";
    expect(runtimeStatus()).toEqual({ enabled: false, model: "gpt-5.6", reason: "missing_key" });
  });

  it("accepts only the GPT-5.6 model family", () => {
    process.env.ENABLE_GPT56 = "true";
    process.env.OPENAI_API_KEY = "test-key";
    process.env.OPENAI_MODEL = "gpt-4.1";
    expect(runtimeStatus()).toEqual({ enabled: false, model: null, reason: "invalid_model" });
  });
});
