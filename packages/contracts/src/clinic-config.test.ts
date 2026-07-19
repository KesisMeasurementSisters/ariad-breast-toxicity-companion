import { describe, expect, it } from "vitest";
import {
  ClinicConfigRefSchema,
  ClinicConfigSchema,
  ClinicConfigV1Schema,
  ClinicConfigV2Schema,
  type ClinicConfigV2,
} from "./objects";
import { CompiledReleaseSchema, ContentReleaseManifestSchema } from "./release";

const makeValidSyntheticClinic = (): ClinicConfigV2 => ({
  kind: "clinic_config",
  id: "build-week-demo-clinic",
  version: "2.0.0",
  status: "draft",
  review: {
    reviewer: null,
    reviewed_at: null,
    review_due: null,
    approval_id: null,
  },
  supersedes: {
    kind: "clinic_config",
    id: "build-week-demo-clinic",
    version: "1.0.0",
  },
  superseded_by: null,
  mode: "synthetic_demo",
  identity: {
    display_name: "Threadline Demo Cancer Centre",
    jurisdiction: {
      country_code: "CA",
      subdivision_code: "CA-ON",
    },
    timezone: "America/Toronto",
    locales: ["en-CA"],
    care_scope: {
      tumour_site_ids: ["breast"],
      modality_ids: ["systemic-therapy"],
    },
  },
  contact_routes: [
    {
      id: "daytime-cancer-team",
      role: "daytime_team",
      channel: "phone",
      label: "Daytime cancer team",
      display_value: "416-555-0142",
      normalized_value: "+14165550142",
      availability: { state: "not_configured" },
      verification: {
        status: "synthetic_fixture",
        method: null,
        verified_by: null,
        verified_at: null,
        review_due: null,
      },
    },
    {
      id: "after-hours-cancer-team",
      role: "after_hours_team",
      channel: "phone",
      label: "After-hours cancer team",
      display_value: "416-555-0184",
      normalized_value: "+14165550184",
      availability: {
        state: "display_only",
        label: "Outside daytime clinic hours",
      },
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
      unresolved_reason: "Clinic-specific fever policy requires clinical review.",
    },
    supportive_care: {
      state: "unresolved",
      module_ref: null,
      destination_contact_ids: [],
      unresolved_reason: "Clinic-specific supportive-care policy requires clinical review.",
    },
  },
  operational_source_ids: [],
});

describe("ClinicConfigV2Schema", () => {
  it("accepts a strict synthetic clinic deployment bundle", () => {
    expect(ClinicConfigV2Schema.parse(makeValidSyntheticClinic())).toEqual(
      makeValidSyntheticClinic(),
    );
  });

  it("accepts an exact module reference for a configured policy", () => {
    const clinic = makeValidSyntheticClinic();
    clinic.clinical_policy_bindings.supportive_care = {
      state: "configured",
      module_ref: {
        kind: "educational_module",
        id: "clinic-supportive-care-policy",
        version: "1.0.0",
      },
      destination_contact_ids: ["daytime-cancer-team"],
      unresolved_reason: null,
    };

    expect(ClinicConfigV2Schema.safeParse(clinic).success).toBe(true);
  });

  it("rejects duplicate contact route IDs", () => {
    const clinic = makeValidSyntheticClinic();
    clinic.contact_routes[1]!.id = clinic.contact_routes[0]!.id;

    expect(ClinicConfigV2Schema.safeParse(clinic).success).toBe(false);
  });

  it("requires exactly one daytime and one after-hours role", () => {
    const clinic = makeValidSyntheticClinic();
    clinic.contact_routes[1]!.role = "daytime_team";

    expect(ClinicConfigV2Schema.safeParse(clinic).success).toBe(false);
  });

  it("rejects a policy destination that is not a configured contact", () => {
    const clinic = makeValidSyntheticClinic();
    clinic.clinical_policy_bindings.fever = {
      state: "configured",
      module_ref: {
        kind: "educational_module",
        id: "clinic-fever-policy",
        version: "1.0.0",
      },
      destination_contact_ids: ["missing-contact"],
      unresolved_reason: null,
    };

    expect(ClinicConfigV2Schema.safeParse(clinic).success).toBe(false);
  });

  it("rejects duplicate policy destinations", () => {
    const clinic = makeValidSyntheticClinic();
    clinic.clinical_policy_bindings.fever = {
      state: "configured",
      module_ref: {
        kind: "educational_module",
        id: "clinic-fever-policy",
        version: "1.0.0",
      },
      destination_contact_ids: ["daytime-cancer-team", "daytime-cancer-team"],
      unresolved_reason: null,
    };

    expect(ClinicConfigV2Schema.safeParse(clinic).success).toBe(false);
  });

  it("enforces mode-specific verification status", () => {
    const institutional = makeValidSyntheticClinic();
    institutional.mode = "institutional";

    expect(ClinicConfigV2Schema.safeParse(institutional).success).toBe(false);

    const synthetic = makeValidSyntheticClinic();
    synthetic.contact_routes[0]!.verification.status = "unverified";

    expect(ClinicConfigV2Schema.safeParse(synthetic).success).toBe(false);
  });

  it("requires verification evidence only for verified contacts", () => {
    const syntheticWithEvidence = makeValidSyntheticClinic();
    syntheticWithEvidence.contact_routes[0]!.verification.method = "manual confirmation";
    expect(ClinicConfigV2Schema.safeParse(syntheticWithEvidence).success).toBe(false);

    const institutional = makeValidSyntheticClinic();
    institutional.mode = "institutional";
    for (const contact of institutional.contact_routes) {
      contact.verification = {
        status: "verified",
        method: "clinic owner confirmation",
        verified_by: "Clinic operations owner",
        verified_at: "2026-07-19T13:00:00.000Z",
        review_due: "2027-07-19",
      };
    }

    expect(ClinicConfigV2Schema.safeParse(institutional).success).toBe(true);

    institutional.contact_routes[0]!.verification.verified_at =
      "2026-07-20T03:30:00.000Z";
    institutional.contact_routes[0]!.verification.review_due = "2026-07-19";
    expect(ClinicConfigV2Schema.safeParse(institutional).success).toBe(true);

    institutional.contact_routes[0]!.verification.review_due = "2026-07-18";
    expect(ClinicConfigV2Schema.safeParse(institutional).success).toBe(false);
  });

  it("enforces coherent policy states", () => {
    const configuredWithoutModule = makeValidSyntheticClinic();
    configuredWithoutModule.clinical_policy_bindings.fever.state = "configured";
    configuredWithoutModule.clinical_policy_bindings.fever.unresolved_reason = null;
    expect(ClinicConfigV2Schema.safeParse(configuredWithoutModule).success).toBe(false);

    const unresolvedWithModule = makeValidSyntheticClinic();
    unresolvedWithModule.clinical_policy_bindings.fever.module_ref = {
      kind: "educational_module",
      id: "fever-policy",
      version: "1.0.0",
    };
    expect(ClinicConfigV2Schema.safeParse(unresolvedWithModule).success).toBe(false);
  });

  it("rejects invalid time zones and locales", () => {
    const invalidTimeZone = makeValidSyntheticClinic();
    invalidTimeZone.identity.timezone = "Toronto/Definitely-Not-A-Time-Zone";
    expect(ClinicConfigV2Schema.safeParse(invalidTimeZone).success).toBe(false);

    const invalidLocale = makeValidSyntheticClinic();
    invalidLocale.identity.locales = ["not_a_locale"];
    expect(ClinicConfigV2Schema.safeParse(invalidLocale).success).toBe(false);

    const nonCanonicalLocale = makeValidSyntheticClinic();
    nonCanonicalLocale.identity.locales = ["en-ca"];
    expect(ClinicConfigV2Schema.safeParse(nonCanonicalLocale).success).toBe(false);

    const valid = makeValidSyntheticClinic();
    const mismatchedSubdivision = {
      ...valid,
      identity: {
        ...valid.identity,
        jurisdiction: { country_code: "CA", subdivision_code: "US-NY" },
      },
    };
    expect(ClinicConfigV2Schema.safeParse(mismatchedSubdivision).success).toBe(false);

    const invalidCountry = {
      ...valid,
      identity: {
        ...valid.identity,
        jurisdiction: { country_code: "ZZ", subdivision_code: "ZZ-ABC" },
      },
    };
    expect(ClinicConfigV2Schema.safeParse(invalidCountry).success).toBe(false);

    const duplicateLocales = makeValidSyntheticClinic();
    duplicateLocales.identity.locales = ["en-CA", "en-CA"];
    expect(ClinicConfigV2Schema.safeParse(duplicateLocales).success).toBe(false);

    const duplicateScope = makeValidSyntheticClinic();
    duplicateScope.identity.care_scope.tumour_site_ids = ["breast", "breast"];
    expect(ClinicConfigV2Schema.safeParse(duplicateScope).success).toBe(false);
  });

  it("binds patient-visible telephone text to the normalized E.164 value", () => {
    const invalidPhone = makeValidSyntheticClinic();
    invalidPhone.contact_routes[0]!.normalized_value = "416-555-0142";
    expect(ClinicConfigV2Schema.safeParse(invalidPhone).success).toBe(false);

    const mismatchedDisplay = makeValidSyntheticClinic();
    mismatchedDisplay.contact_routes[0]!.display_value = "647-555-0100";
    expect(ClinicConfigV2Schema.safeParse(mismatchedDisplay).success).toBe(false);

    const proseDisplay = makeValidSyntheticClinic();
    proseDisplay.contact_routes[0]!.display_value = "Call your team now";
    expect(ClinicConfigV2Schema.safeParse(proseDisplay).success).toBe(false);
  });

  it("rejects non-v2 versions", () => {
    const invalidVersion = makeValidSyntheticClinic();
    invalidVersion.version = "1.1.0";
    expect(ClinicConfigV2Schema.safeParse(invalidVersion).success).toBe(false);
  });
});

describe("clinic configuration compatibility and exact references", () => {
  it("retains the strict v1 clinic shape for historical releases", () => {
    const v1 = {
      kind: "clinic_config",
      id: "build-week-demo-clinic",
      version: "1.0.0",
      status: "draft",
      review: {
        reviewer: null,
        reviewed_at: null,
        review_due: null,
        approval_id: null,
      },
      supersedes: null,
      superseded_by: {
        kind: "clinic_config",
        id: "build-week-demo-clinic",
        version: "2.0.0",
      },
      clinic_name: "Threadline Demo Cancer Centre",
      synthetic: true,
      daytime_contact: "416-555-0142",
      after_hours_contact: "416-555-0184",
      emergency_statement: "Historical fixed emergency statement.",
      fever_instruction: "Historical unresolved fever instruction.",
      supportive_care_note: "Historical supportive-care note.",
      source_ids: [],
    };

    expect(ClinicConfigV1Schema.safeParse(v1).success).toBe(true);
    expect(ClinicConfigSchema.safeParse(v1).success).toBe(true);
  });

  it("accepts only exact clinic_config references", () => {
    expect(
      ClinicConfigRefSchema.safeParse({
        kind: "clinic_config",
        id: "build-week-demo-clinic",
        version: "2.0.0",
      }).success,
    ).toBe(true);
    expect(
      ClinicConfigRefSchema.safeParse({
        kind: "drug",
        id: "build-week-demo-clinic",
        version: "2.0.0",
      }).success,
    ).toBe(false);
  });

  it("enforces the exact clinic reference in manifests and compiled releases", () => {
    const incorrectRef = {
      kind: "drug",
      id: "build-week-demo-clinic",
      version: "2.0.0",
    };

    expect(
      ContentReleaseManifestSchema.safeParse({
        release_id: "preview-release",
        version: "1.0.0",
        channel: "preview",
        publication_status: "draft",
        clinical_use: false,
        generated_at: "2026-07-19T13:00:00.000Z",
        included_objects: [
          { kind: "clinic_config", id: "build-week-demo-clinic", version: "2.0.0" },
        ],
        clinic_config: incorrectRef,
        source_inventory: ["operational-source"],
        reviewer_metadata: {
          reviewer: null,
          reviewed_at: null,
          release_approval_id: null,
        },
        known_gaps: [],
        release_notes: [],
      }).success,
    ).toBe(false);

    expect(
      CompiledReleaseSchema.safeParse({
        schema_version: "1.0.0",
        compiler_version: "1.0.0",
        safety_ruleset_version: "1.0.0",
        release_id: "preview-release",
        release_version: "1.0.0",
        channel: "preview",
        clinical_use: false,
        contains_unapproved_content: true,
        mandatory_notice: "Unreviewed prototype content — not for clinical use",
        generated_at: "2026-07-19T13:00:00.000Z",
        content_hash: "0".repeat(64),
        approval_summary: { draft: 0, in_review: 0, approved: 0, retired: 0 },
        objects: [],
        clinic_config: incorrectRef,
        indexes: {
          treatments: [],
          symptoms: [],
          relationships_by_treatment: {},
          relationships_by_symptom: {},
        },
        source_inventory: [],
        known_gaps: [],
        release_notes: [],
      }).success,
    ).toBe(false);
  });
});
