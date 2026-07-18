import type { EducationalModule } from "@ariad/contracts";
import { describe, expect, it } from "vitest";
import { prohibitedRecommendationLanguage, scanModuleSafety } from "./safety";

const baseModule: EducationalModule = {
  kind: "educational_module",
  id: "test-module",
  version: "1.0.0",
  status: "draft",
  review: { reviewer: null, reviewed_at: null, review_due: null, approval_id: null },
  supersedes: null,
  superseded_by: null,
  audience: "patient",
  jurisdiction: "Canada",
  section: "about",
  title: "About this symptom",
  paragraphs: ["Other conditions can cause similar symptoms."],
  bullets: [],
  applicability: { treatment_ids: [], symptom_ids: [] },
  priority_tags: [],
  source_ids: ["test-source"],
  claim_ids: ["test-claim"],
  placeholders: [],
  review_due: null,
};

describe("clinical-language backstop", () => {
  it.each([
    "You have grade 2 toxicity.",
    "This means you have neuropathy.",
    "Stop taking your treatment.",
    "Hold your treatment.",
    "Reduce your dose.",
    "You should go now.",
    "We recommend a medicine.",
    "This is definitely caused by treatment.",
  ])("blocks %s", (text) => {
    expect(prohibitedRecommendationLanguage(text)).toBe(true);
  });

  it("allows fixed, non-personalized warning headings", () => {
    expect(prohibitedRecommendationLanguage("Contact your cancer team if…")).toBe(false);
    expect(prohibitedRecommendationLanguage("Seek urgent medical attention if…")).toBe(false);
  });

  it("rejects an unapproved numeric fever threshold", () => {
    const clinicalModule = {
      ...baseModule,
      paragraphs: ["A temperature of 38.0°C is a fever."],
    };
    expect(scanModuleSafety(clinicalModule)).toEqual([
      expect.objectContaining({ ruleId: "unapproved-fever-threshold" }),
    ]);
  });
});
