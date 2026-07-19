import { describe, expect, it } from "vitest";
import { IsoDateSchema } from "./primitives";

describe("ISO calendar dates", () => {
  it("accepts real dates, including leap days", () => {
    expect(IsoDateSchema.safeParse("2028-02-29").success).toBe(true);
  });

  it.each(["2026-99-99", "2026-02-31", "2026-02-29"])(
    "rejects impossible date %s",
    (value) => {
      expect(IsoDateSchema.safeParse(value).success).toBe(false);
    },
  );
});
