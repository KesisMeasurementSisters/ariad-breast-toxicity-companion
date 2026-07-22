import { describe, expect, it } from "vitest";
import { patientFrequencyBandFromPercentage } from "./frequency";

describe("patientFrequencyBandFromPercentage", () => {
  it("uses the documented all-grade boundaries", () => {
    expect(patientFrequencyBandFromPercentage(100)).toBe("many_people");
    expect(patientFrequencyBandFromPercentage(30)).toBe("many_people");
    expect(patientFrequencyBandFromPercentage(29.9)).toBe("some_people");
    expect(patientFrequencyBandFromPercentage(10)).toBe("some_people");
    expect(patientFrequencyBandFromPercentage(9.9)).toBe("fewer_people");
    expect(patientFrequencyBandFromPercentage(0)).toBe("fewer_people");
  });
});
