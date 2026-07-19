import type { ClinicConfig, ClinicConfigV2, EducationalModule } from "@ariad/contracts";
import { describe, expect, it } from "vitest";
import {
  prohibitedRecommendationLanguage,
  scanClinicConfigSafety,
  scanModuleSafety,
} from "./safety";

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

const baseClinic = {
  kind: "clinic_config",
  id: "test-clinic",
  version: "2.0.0",
  status: "draft",
  review: { reviewer: null, reviewed_at: null, review_due: null, approval_id: null },
  supersedes: null,
  superseded_by: null,
  mode: "synthetic_demo",
  identity: {
    display_name: "Synthetic test clinic",
    jurisdiction: { country_code: "CA", subdivision_code: "CA-ON" },
    timezone: "America/Toronto",
    locales: ["en-CA"],
    care_scope: { tumour_site_ids: ["breast"], modality_ids: ["systemic-therapy"] },
  },
  contact_routes: [
    {
      id: "daytime-team",
      role: "daytime_team",
      channel: "phone",
      label: "Cancer centre daytime line",
      display_value: "416-555-0142",
      normalized_value: "+14165550142",
      availability: { state: "display_only", label: "Weekdays during clinic hours" },
      verification: {
        status: "synthetic_fixture",
        method: null,
        verified_by: null,
        verified_at: null,
        review_due: null,
      },
    },
    {
      id: "after-hours-team",
      role: "after_hours_team",
      channel: "phone",
      label: "Cancer centre after-hours line",
      display_value: "416-555-0184",
      normalized_value: "+14165550184",
      availability: { state: "not_configured" },
      verification: {
        status: "synthetic_fixture",
        method: null,
        verified_by: null,
        verified_at: null,
        review_due: null,
      },
    },
  ],
  clinical_policy_bindings: {
    fever: {
      state: "unresolved",
      module_ref: null,
      destination_contact_ids: [],
      unresolved_reason: "Clinical-owner decision pending",
    },
    supportive_care: {
      state: "unresolved",
      module_ref: null,
      destination_contact_ids: [],
      unresolved_reason: "Clinical-owner decision pending",
    },
  },
  operational_source_ids: [],
} satisfies ClinicConfigV2;

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

  it("scans patient-visible clinic contact labels", () => {
    const clinic: ClinicConfig = {
      ...baseClinic,
      contact_routes: baseClinic.contact_routes.map((contact, index) =>
        index === 0 ? { ...contact, label: "We recommend this daytime line" } : contact,
      ),
    };

    expect(scanClinicConfigSafety(clinic)).toContainEqual(
      expect.objectContaining({
        ruleId: "recommendation-framing",
        field: "contact_routes.daytime-team.label",
      }),
    );
  });

  it("scans patient-visible clinic contact values", () => {
    const clinic = {
      ...baseClinic,
      contact_routes: baseClinic.contact_routes.map((contact, index) =>
        index === 0 ? { ...contact, display_value: "We recommend this number" } : contact,
      ),
    } as ClinicConfig;

    expect(scanClinicConfigSafety(clinic)).toContainEqual(
      expect.objectContaining({
        ruleId: "recommendation-framing",
        field: "contact_routes.daytime-team.display_value",
      }),
    );
  });

  it("scans display-only clinic availability labels", () => {
    const clinic: ClinicConfig = {
      ...baseClinic,
      contact_routes: baseClinic.contact_routes.map((contact, index) =>
        index === 0
          ? {
              ...contact,
              availability: {
                state: "display_only",
                label: "You need urgent care after hours",
              },
            }
          : contact,
      ),
    };

    expect(scanClinicConfigSafety(clinic)).toContainEqual(
      expect.objectContaining({
        ruleId: "personalized-need-urgent",
        field: "contact_routes.daytime-team.availability.label",
      }),
    );
  });
});
