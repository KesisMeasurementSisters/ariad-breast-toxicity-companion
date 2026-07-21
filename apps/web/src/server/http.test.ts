import { afterEach, beforeAll, describe, expect, it, vi } from "vitest";

vi.mock("server-only", () => ({}));

let http: typeof import("./http");
const originalMaxInput = process.env.AI_MAX_INPUT_CHARS;

beforeAll(async () => {
  http = await import("./http");
});

afterEach(() => {
  if (originalMaxInput === undefined) delete process.env.AI_MAX_INPUT_CHARS;
  else process.env.AI_MAX_INPUT_CHARS = originalMaxInput;
});

function request(headers: Record<string, string> = {}): Request {
  return new Request("https://ariad.example/api/ai/classify-symptom", {
    method: "POST",
    headers: {
      "content-type": "application/json",
      origin: "https://ariad.example",
      ...headers,
    },
    body: JSON.stringify({ text: "tingling" }),
  });
}

describe("AI request guards", () => {
  it("accepts a same-origin JSON POST", () => {
    expect(http.guardAiPost(request())).toBeNull();
  });

  it("rejects a cross-origin POST", () => {
    const blocked = http.guardAiPost(request({ origin: "https://untrusted.example" }));
    expect(blocked?.status).toBe(403);
  });

  it("rejects a non-JSON POST", () => {
    const blocked = http.guardAiPost(request({ "content-type": "text/plain" }));
    expect(blocked?.status).toBe(415);
  });

  it("rejects a body larger than the endpoint allowance", async () => {
    const oversized = new Request("https://ariad.example/api/ai/classify-symptom", {
      method: "POST",
      headers: { "content-type": "application/json", origin: "https://ariad.example" },
      body: JSON.stringify({ text: "x".repeat(100) }),
    });
    await expect(http.readBoundedJson(oversized, 32)).rejects.toMatchObject({ status: 413 });
  });

  it("clamps the optional text limit to the schema-safe range", () => {
    process.env.AI_MAX_INPUT_CHARS = "240";
    expect(http.configuredAiMaxInputChars()).toBe(240);
    process.env.AI_MAX_INPUT_CHARS = "900";
    expect(http.configuredAiMaxInputChars()).toBe(500);
    process.env.AI_MAX_INPUT_CHARS = "5";
    expect(http.configuredAiMaxInputChars()).toBe(50);
  });

  it("bounds rate-limit state while retaining existing buckets", () => {
    const now = Date.now();
    for (let index = 0; index < 999; index += 1) {
      expect(
        http.withinRateLimit(
          request({ "x-forwarded-for": `203.0.113.${index}` }),
          now,
        ),
      ).toBe(true);
    }

    expect(
      http.withinRateLimit(request({ "x-forwarded-for": "198.51.100.1" }), now),
    ).toBe(false);
    expect(
      http.withinRateLimit(request({ "x-forwarded-for": "203.0.113.0" }), now),
    ).toBe(true);
    expect(
      http.withinRateLimit(
        request({ "x-forwarded-for": "198.51.100.1" }),
        now + 60_000,
      ),
    ).toBe(true);
  });
});
