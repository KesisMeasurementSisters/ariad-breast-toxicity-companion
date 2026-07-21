import { afterEach, describe, expect, it, vi } from "vitest";

async function treatmentSavingFlag(value: string | undefined): Promise<boolean> {
  vi.resetModules();
  if (value === undefined) {
    vi.unstubAllEnvs();
    delete process.env.NEXT_PUBLIC_ENABLE_TREATMENT_SAVING;
  } else {
    vi.stubEnv("NEXT_PUBLIC_ENABLE_TREATMENT_SAVING", value);
  }
  return (await import("./features")).TREATMENT_SAVING_ENABLED;
}

afterEach(() => {
  vi.unstubAllEnvs();
  vi.resetModules();
});

describe("competition feature flags", () => {
  it("keeps treatment saving off unless it is explicitly enabled", async () => {
    await expect(treatmentSavingFlag(undefined)).resolves.toBe(false);
    await expect(treatmentSavingFlag("false")).resolves.toBe(false);
    await expect(treatmentSavingFlag("TRUE")).resolves.toBe(false);
    await expect(treatmentSavingFlag("true")).resolves.toBe(true);
  });
});
