import type {
  ClinicConfig,
  ClinicConfigV2,
  ContentApproval,
  ContentReleaseManifest,
  ContentStatusTransition,
  EducationalModule,
  KnowledgeObject,
  Source,
} from "@ariad/contracts";
import { PREVIEW_ACKNOWLEDGEMENT } from "@ariad/contracts";
import { describe, expect, it } from "vitest";
import type { KnowledgeRepository } from "./repository";
import { validateReleaseInclusion, validateRepository } from "./validation";

const draftClinic = {
  kind: "clinic_config",
  id: "test-clinic",
  version: "2.0.0",
  status: "draft",
  review: {
    reviewer: null,
    reviewed_at: null,
    review_due: null,
    approval_id: null,
  },
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
  operational_source_ids: ["test-source"],
} satisfies ClinicConfigV2;

const testSource: Source = {
  kind: "source",
  id: "test-source",
  version: "1.0.0",
  title: "Synthetic governance test source",
  organization: "Test organization",
  canonical_url: "https://example.com/governance-test",
  source_type: "safety_information",
  jurisdiction: "Canada",
  publication_or_revision_date: "2026-07-01",
  accessed_date: "2026-07-18",
  source_version: "Synthetic fixture",
  permitted_excerpt: null,
  notes: ["Test-only source record"],
  verification_status: "verified",
};

const draftPolicyModule = {
  kind: "educational_module",
  id: "clinic-policy-module",
  version: "1.0.0",
  status: "draft",
  review: { reviewer: null, reviewed_at: null, review_due: null, approval_id: null },
  supersedes: null,
  superseded_by: null,
  audience: "patient",
  jurisdiction: "Canada",
  section: "contact_team",
  title: "Contacting the cancer team",
  paragraphs: ["Use the contact details supplied by the cancer centre."],
  bullets: [],
  applicability: { treatment_ids: [], symptom_ids: [] },
  priority_tags: [],
  source_ids: ["test-source"],
  claim_ids: ["test-policy-claim"],
  placeholders: [],
  review_due: null,
} satisfies EducationalModule;

function transition(
  from_status: ContentStatusTransition["from_status"],
  to_status: ContentStatusTransition["to_status"],
  transitioned_at: string,
): ContentStatusTransition {
  return {
    from_status,
    to_status,
    transitioned_at,
    transitioned_by: "Test reviewer",
    reason: "Governance regression fixture",
  };
}

function repositoryWith(...objects: KnowledgeObject[]): KnowledgeRepository {
  const repositoryObjects = objects.some(
    (object) => object.kind === "source" && object.id === testSource.id,
  )
    ? objects
    : [...objects, testSource];
  return {
    objects: repositoryObjects,
    releases: [],
    contentApprovals: [],
    releaseApprovals: [
      {
        kind: "release_approval",
        id: "test-release-approval",
        release_id: "test-published-release",
        candidate_payload_hash: "0".repeat(64),
        decision: "approved_for_publication",
        reviewer: "Test reviewer",
        reviewed_at: "2026-07-17T16:00:00.000Z",
      },
    ],
    filesByKey: new Map([
      ...repositoryObjects.map(
        (object) =>
          [`${object.kind}:${object.id}@${object.version}`, "test-fixture"] as const,
      ),
    ]),
  };
}

function clinicWithPolicyModule(
  moduleVersion = draftPolicyModule.version,
): ClinicConfigV2 {
  const moduleRef = {
    kind: "educational_module" as const,
    id: draftPolicyModule.id,
    version: moduleVersion,
  };
  return {
    ...draftClinic,
    clinical_policy_bindings: {
      fever: {
        state: "configured",
        module_ref: moduleRef,
        destination_contact_ids: ["daytime-team", "after-hours-team"],
        unresolved_reason: null,
      },
      supportive_care: {
        state: "delegated_to_team",
        module_ref: moduleRef,
        destination_contact_ids: ["daytime-team"],
        unresolved_reason: null,
      },
    },
  };
}

function institutionalClinic(
  verificationStatus: "verified" | "unverified" = "verified",
  verificationReviewDue = "2027-07-17",
): ClinicConfigV2 {
  const verification =
    verificationStatus === "verified"
      ? {
          status: "verified" as const,
          method: "Verified against synthetic test evidence",
          verified_by: "Test reviewer",
          verified_at: "2026-07-17T13:00:00.000Z",
          review_due: verificationReviewDue,
        }
      : {
          status: "unverified" as const,
          method: null,
          verified_by: null,
          verified_at: null,
          review_due: null,
        };
  const configuredClinic = clinicWithPolicyModule();
  return {
    ...configuredClinic,
    mode: "institutional",
    contact_routes: configuredClinic.contact_routes.map((contact) => ({
      ...contact,
      verification,
    })),
  };
}

function previewManifest(
  clinic: ClinicConfig,
  includedObjects: ContentReleaseManifest["included_objects"],
): ContentReleaseManifest {
  return {
    release_id: "test-preview-release",
    version: "2.0.0",
    channel: "preview",
    publication_status: "draft",
    clinical_use: false,
    generated_at: "2026-07-19T16:00:00.000Z",
    included_objects: includedObjects,
    clinic_config: { kind: "clinic_config", id: clinic.id, version: clinic.version },
    source_inventory: [testSource.id],
    reviewer_metadata: { reviewer: null, reviewed_at: null, release_approval_id: null },
    known_gaps: ["Synthetic test fixture"],
    release_notes: ["Clinic validation regression fixture"],
  };
}

function publishedManifest(clinic: ClinicConfig): ContentReleaseManifest {
  return {
    release_id: "test-published-release",
    version: "2.0.0",
    channel: "published",
    publication_status: "published",
    clinical_use: true,
    generated_at: "2026-07-19T16:00:00.000Z",
    included_objects: [
      { kind: "clinic_config", id: clinic.id, version: clinic.version },
      {
        kind: "educational_module",
        id: draftPolicyModule.id,
        version: draftPolicyModule.version,
      },
      { kind: "source", id: testSource.id, version: testSource.version },
    ],
    clinic_config: { kind: "clinic_config", id: clinic.id, version: clinic.version },
    source_inventory: [testSource.id],
    reviewer_metadata: {
      reviewer: "Test reviewer",
      reviewed_at: "2026-07-18T16:00:00.000Z",
      release_approval_id: "test-release-approval",
    },
    known_gaps: [],
    release_notes: ["Published clinic validation regression fixture"],
  };
}

describe("release object identity", () => {
  it("rejects duplicate exact object references", () => {
    const moduleRef = {
      kind: "educational_module" as const,
      id: draftPolicyModule.id,
      version: draftPolicyModule.version,
    };
    const manifest = previewManifest(draftClinic, [
      { kind: "clinic_config", id: draftClinic.id, version: draftClinic.version },
      moduleRef,
      moduleRef,
      { kind: "source", id: testSource.id, version: testSource.version },
    ]);

    const issues = validateReleaseInclusion(
      repositoryWith(draftClinic, draftPolicyModule),
      manifest,
      PREVIEW_ACKNOWLEDGEMENT,
    );

    expect(issues).toContainEqual(
      expect.objectContaining({
        code: "duplicate-release-object-reference",
        objectId: manifest.release_id,
      }),
    );
  });

  it("rejects multiple versions of one object identity", () => {
    const newerModule = { ...draftPolicyModule, version: "2.0.0" };
    const manifest = previewManifest(draftClinic, [
      { kind: "clinic_config", id: draftClinic.id, version: draftClinic.version },
      {
        kind: "educational_module",
        id: draftPolicyModule.id,
        version: draftPolicyModule.version,
      },
      {
        kind: "educational_module",
        id: newerModule.id,
        version: newerModule.version,
      },
      { kind: "source", id: testSource.id, version: testSource.version },
    ]);

    const issues = validateReleaseInclusion(
      repositoryWith(draftClinic, draftPolicyModule, newerModule),
      manifest,
      PREVIEW_ACKNOWLEDGEMENT,
    );

    expect(issues).toContainEqual(
      expect.objectContaining({
        code: "multiple-object-versions-in-release",
        objectId: manifest.release_id,
      }),
    );
  });
});

describe("content status-transition governance", () => {
  it.each([
    {
      name: "skips review before approval",
      status: "approved" as const,
      history: [transition("draft", "approved", "2026-07-18T13:00:00.000Z")],
    },
    {
      name: "revives retired content",
      status: "in_review" as const,
      history: [
        transition("draft", "in_review", "2026-07-18T13:00:00.000Z"),
        transition("in_review", "approved", "2026-07-18T14:00:00.000Z"),
        transition("approved", "retired", "2026-07-18T15:00:00.000Z"),
        transition("retired", "in_review", "2026-07-18T16:00:00.000Z"),
      ],
    },
  ])("rejects an invalid transition that $name", ({ status, history }) => {
    const object: ClinicConfig = { ...draftClinic, status, status_history: history };
    const report = validateRepository(repositoryWith(object));

    expect(report.issues).toEqual(
      expect.arrayContaining([
        expect.objectContaining({
          code: "invalid-status-transition",
          objectId: draftClinic.id,
        }),
      ]),
    );
  });

  it("requires non-draft content to retain its transition history", () => {
    const object: ClinicConfig = { ...draftClinic, status: "in_review" };
    const report = validateRepository(repositoryWith(object));

    expect(report.issues).toContainEqual(
      expect.objectContaining({
        code: "status-history-missing",
        objectId: draftClinic.id,
      }),
    );
  });

  it("allows an in-review item to return to draft for revision", () => {
    const object: ClinicConfig = {
      ...draftClinic,
      status: "in_review",
      status_history: [
        transition("draft", "in_review", "2026-07-18T13:00:00.000Z"),
        transition("in_review", "draft", "2026-07-18T14:00:00.000Z"),
        transition("draft", "in_review", "2026-07-18T15:00:00.000Z"),
      ],
    };
    const report = validateRepository(repositoryWith(object));

    expect(report.issues.filter((issue) => issue.code.startsWith("status-"))).toEqual([]);
  });
});

describe("content supersession governance", () => {
  const earlierReference = {
    kind: "clinic_config" as const,
    id: "test-clinic",
    version: "2.0.0-alpha",
  };
  const currentReference = {
    kind: "clinic_config" as const,
    id: "test-clinic",
    version: "2.0.0",
  };

  it("resolves supersession references by exact kind, ID, and version", () => {
    const current: ClinicConfig = { ...draftClinic, supersedes: earlierReference };
    const report = validateRepository(repositoryWith(current));

    expect(report.issues).toContainEqual(
      expect.objectContaining({
        code: "supersession-target-missing",
        objectId: current.id,
      }),
    );
  });

  it("rejects a supersession self-link", () => {
    const current: ClinicConfig = { ...draftClinic, supersedes: currentReference };
    const report = validateRepository(repositoryWith(current));

    expect(report.issues).toContainEqual(
      expect.objectContaining({
        code: "supersession-self-reference",
        objectId: current.id,
      }),
    );
  });

  it("requires the referenced object to carry the exact reciprocal link", () => {
    const earlier: ClinicConfig = { ...draftClinic, version: "2.0.0-alpha" };
    const current: ClinicConfig = { ...draftClinic, supersedes: earlierReference };
    const report = validateRepository(repositoryWith(earlier, current));

    expect(report.issues).toContainEqual(
      expect.objectContaining({
        code: "supersession-reciprocal-missing",
        objectId: current.id,
      }),
    );
  });

  it("rejects a reciprocal link to a different version", () => {
    const earlier: ClinicConfig = {
      ...draftClinic,
      version: "2.0.0-alpha",
      superseded_by: { ...currentReference, version: "2.1.0" },
    };
    const current: ClinicConfig = { ...draftClinic, supersedes: earlierReference };
    const report = validateRepository(repositoryWith(earlier, current));

    expect(report.issues).toContainEqual(
      expect.objectContaining({
        code: "supersession-reciprocal-mismatch",
        objectId: current.id,
      }),
    );
  });

  it("accepts a reciprocal, exactly versioned supersession pair", () => {
    const earlier: ClinicConfig = {
      ...draftClinic,
      version: "2.0.0-alpha",
      superseded_by: currentReference,
    };
    const current: ClinicConfig = { ...draftClinic, supersedes: earlierReference };
    const report = validateRepository(repositoryWith(earlier, current));

    expect(report.issues.filter((issue) => issue.code.startsWith("supersession-"))).toEqual([]);
  });
});

describe("clinic configuration references", () => {
  it("validates operational source IDs", () => {
    const clinic: ClinicConfig = {
      ...draftClinic,
      operational_source_ids: ["missing-operational-source"],
    };

    const report = validateRepository(repositoryWith(clinic));

    expect(report.issues).toContainEqual(
      expect.objectContaining({
        code: "broken-reference",
        objectId: clinic.id,
        message: expect.stringContaining("operational_source_ids"),
      }),
    );
  });

  it("requires each policy module reference to resolve by exact version", () => {
    const clinic = clinicWithPolicyModule("2.0.0");

    const report = validateRepository(repositoryWith(clinic, draftPolicyModule));

    expect(report.issues).toContainEqual(
      expect.objectContaining({
        code: "clinic-policy-module-missing",
        objectId: clinic.id,
        message: expect.stringContaining("educational_module:clinic-policy-module@2.0.0"),
      }),
    );
  });

  it("accepts an exact policy module reference", () => {
    const clinic = clinicWithPolicyModule();

    const report = validateRepository(repositoryWith(clinic, draftPolicyModule));

    expect(report.issues.filter((issue) => issue.code === "clinic-policy-module-missing")).toEqual(
      [],
    );
  });
});

describe("clinic configuration release inclusion", () => {
  it("requires the manifest's exact clinic configuration to exist", () => {
    const manifest = previewManifest(draftClinic, [
      { kind: "clinic_config", id: draftClinic.id, version: draftClinic.version },
      { kind: "source", id: testSource.id, version: testSource.version },
    ]);

    const issues = validateReleaseInclusion(
      repositoryWith(draftPolicyModule),
      manifest,
      PREVIEW_ACKNOWLEDGEMENT,
    );

    expect(issues).toContainEqual(
      expect.objectContaining({
        code: "clinic-config-missing",
        objectId: manifest.release_id,
      }),
    );
  });

  it("requires the manifest's exact clinic configuration in included_objects", () => {
    const otherClinic: ClinicConfig = {
      ...draftClinic,
      id: "other-clinic",
    };
    const manifest = previewManifest(draftClinic, [
      { kind: "clinic_config", id: otherClinic.id, version: otherClinic.version },
      { kind: "source", id: testSource.id, version: testSource.version },
    ]);

    const issues = validateReleaseInclusion(
      repositoryWith(draftClinic, otherClinic),
      manifest,
      PREVIEW_ACKNOWLEDGEMENT,
    );

    expect(issues).toContainEqual(
      expect.objectContaining({
        code: "clinic-config-not-included",
        objectId: manifest.release_id,
      }),
    );
  });

  it("rejects more than one included clinic configuration", () => {
    const otherClinic: ClinicConfig = {
      ...draftClinic,
      id: "other-clinic",
    };
    const manifest = previewManifest(draftClinic, [
      { kind: "clinic_config", id: draftClinic.id, version: draftClinic.version },
      { kind: "clinic_config", id: otherClinic.id, version: otherClinic.version },
      { kind: "source", id: testSource.id, version: testSource.version },
    ]);

    const issues = validateReleaseInclusion(
      repositoryWith(draftClinic, otherClinic),
      manifest,
      PREVIEW_ACKNOWLEDGEMENT,
    );

    expect(issues).toContainEqual(
      expect.objectContaining({
        code: "multiple-clinic-configs-in-release",
        objectId: manifest.release_id,
      }),
    );
  });

  it("pins policy modules by exact version rather than ID alone", () => {
    const clinic = clinicWithPolicyModule();
    const otherModuleVersion: EducationalModule = {
      ...draftPolicyModule,
      version: "2.0.0",
    };
    const manifest = previewManifest(clinic, [
      { kind: "clinic_config", id: clinic.id, version: clinic.version },
      {
        kind: "educational_module",
        id: otherModuleVersion.id,
        version: otherModuleVersion.version,
      },
      { kind: "source", id: testSource.id, version: testSource.version },
    ]);

    const issues = validateReleaseInclusion(
      repositoryWith(clinic, draftPolicyModule, otherModuleVersion),
      manifest,
      PREVIEW_ACKNOWLEDGEMENT,
    );

    expect(issues).toContainEqual(
      expect.objectContaining({
        code: "release-exact-dependency-not-included",
        objectId: clinic.id,
        message: expect.stringContaining("educational_module:clinic-policy-module@1.0.0"),
      }),
    );
  });
});

describe("published clinic configuration gates", () => {
  it("rejects a synthetic-demo clinic configuration", () => {
    const manifest = publishedManifest(draftClinic);

    const issues = validateReleaseInclusion(
      repositoryWith(draftClinic, draftPolicyModule),
      manifest,
      undefined,
    );

    expect(issues).toContainEqual(
      expect.objectContaining({
        code: "synthetic-clinic-in-published-release",
        objectId: draftClinic.id,
      }),
    );
  });

  it("rejects unresolved clinic policy bindings", () => {
    const clinic: ClinicConfig = {
      ...institutionalClinic(),
      clinical_policy_bindings: draftClinic.clinical_policy_bindings,
    };
    const manifest = publishedManifest(clinic);

    const issues = validateReleaseInclusion(
      repositoryWith(clinic, draftPolicyModule),
      manifest,
      undefined,
    );

    expect(issues).toEqual(
      expect.arrayContaining([
        expect.objectContaining({
          code: "unresolved-clinic-policy-in-published-release",
          objectId: clinic.id,
          message: expect.stringContaining("fever"),
        }),
        expect.objectContaining({
          code: "unresolved-clinic-policy-in-published-release",
          objectId: clinic.id,
          message: expect.stringContaining("supportive_care"),
        }),
      ]),
    );
  });

  it("rejects unverified institutional contacts", () => {
    const clinic = institutionalClinic("unverified");
    const manifest = publishedManifest(clinic);

    const issues = validateReleaseInclusion(
      repositoryWith(clinic, draftPolicyModule),
      manifest,
      undefined,
    );

    expect(
      issues.filter((issue) => issue.code === "unverified-clinic-contact-in-published-release"),
    ).toHaveLength(2);
  });

  it("rejects contact verification that expired before generated_at", () => {
    const clinic = institutionalClinic("verified", "2026-07-18");
    const manifest = publishedManifest(clinic);

    const issues = validateReleaseInclusion(
      repositoryWith(clinic, draftPolicyModule),
      manifest,
      undefined,
    );

    expect(issues).toContainEqual(
      expect.objectContaining({
        code: "expired-clinic-contact-verification",
        objectId: clinic.id,
      }),
    );
  });

  it("treats review_due as current through the clinic-local calendar date", () => {
    const clinic = institutionalClinic("verified", "2026-07-18");
    const manifest = {
      ...publishedManifest(clinic),
      generated_at: "2026-07-19T03:59:59.000Z",
    };

    const issues = validateReleaseInclusion(
      repositoryWith(clinic, draftPolicyModule),
      manifest,
      undefined,
    );

    expect(
      issues.some((issue) => issue.code === "expired-clinic-contact-verification"),
    ).toBe(false);
  });

  it("rejects contact verification recorded after generated_at", () => {
    const clinic = institutionalClinic();
    clinic.contact_routes = clinic.contact_routes.map((contact) => ({
      ...contact,
      verification: {
        status: "verified",
        method: "Verified against synthetic test evidence",
        verified_by: "Test reviewer",
        verified_at: "2026-07-20T13:00:00.000Z",
        review_due: "2027-07-20",
      },
    }));
    const manifest = publishedManifest(clinic);

    const issues = validateReleaseInclusion(
      repositoryWith(clinic, draftPolicyModule),
      manifest,
      undefined,
    );

    expect(issues).toContainEqual(
      expect.objectContaining({
        code: "future-clinic-contact-verification",
        objectId: clinic.id,
      }),
    );
  });

  it("blocks configured clinic policies until semantic compatibility and rendering exist", () => {
    const clinic = institutionalClinic();
    const manifest = publishedManifest(clinic);

    const issues = validateReleaseInclusion(
      repositoryWith(clinic, draftPolicyModule),
      manifest,
      undefined,
    );

    expect(
      issues.filter((issue) => issue.code === "clinic-policy-publication-not-supported"),
    ).toHaveLength(2);
  });

  it("treats contact verification as current through its review_due date", () => {
    const clinic = institutionalClinic("verified", "2026-07-19");
    const manifest = publishedManifest(clinic);

    const issues = validateReleaseInclusion(
      repositoryWith(clinic, draftPolicyModule),
      manifest,
      undefined,
    );

    expect(
      issues.some((issue) => issue.code === "expired-clinic-contact-verification"),
    ).toBe(false);
  });
});

describe("published-release review expiry", () => {
  const publishedManifest: ContentReleaseManifest = {
    release_id: "test-published-release",
    version: "1.0.0",
    channel: "published",
    publication_status: "published",
    clinical_use: true,
    generated_at: "2026-07-18T16:00:00.000Z",
    included_objects: [
      { kind: "clinic_config", id: "test-clinic", version: "2.0.0" },
      { kind: "educational_module", id: "clinic-policy-module", version: "1.0.0" },
      { kind: "source", id: "test-source", version: "1.0.0" },
    ],
    clinic_config: { kind: "clinic_config", id: "test-clinic", version: "2.0.0" },
    source_inventory: ["test-source"],
    reviewer_metadata: {
      reviewer: "Test reviewer",
      reviewed_at: "2026-07-17T16:00:00.000Z",
      release_approval_id: "test-release-approval",
    },
    known_gaps: [],
    release_notes: ["Governance regression fixture"],
  };

  function approvedClinic(reviewDue: string): ClinicConfig {
    return {
      ...institutionalClinic(),
      status: "approved",
      status_history: [
        transition("draft", "in_review", "2026-07-16T13:00:00.000Z"),
        transition("in_review", "approved", "2026-07-17T13:00:00.000Z"),
      ],
      review: {
        reviewer: "Test reviewer",
        reviewed_at: "2026-07-17T13:00:00.000Z",
        review_due: reviewDue,
        approval_id: "test-content-approval",
      },
    };
  }

  const approvedPolicyModule: EducationalModule = {
    ...draftPolicyModule,
    status: "approved",
    status_history: [
      transition("draft", "in_review", "2026-07-16T13:00:00.000Z"),
      transition("in_review", "approved", "2026-07-17T13:00:00.000Z"),
    ],
    review: {
      reviewer: "Test reviewer",
      reviewed_at: "2026-07-17T13:00:00.000Z",
      review_due: "2027-07-17",
      approval_id: "test-module-approval",
    },
    review_due: "2027-07-17",
  };

  function contentApproval(reviewDue: string): ContentApproval {
    return {
      kind: "content_approval",
      id: "test-content-approval",
      subject: { kind: "clinic_config", id: "test-clinic", version: "2.0.0" },
      subject_payload_hash: "0".repeat(64),
      decision: "approved",
      reviewer: "Test reviewer",
      reviewed_at: "2026-07-17T13:00:00.000Z",
      review_due: reviewDue,
    };
  }

  it("rejects an object whose review expired before the publication date", () => {
    const repository = repositoryWith(approvedClinic("2026-07-17"), approvedPolicyModule);
    const issues = validateReleaseInclusion(repository, publishedManifest, undefined);

    expect(issues).toContainEqual(
      expect.objectContaining({
        code: "expired-review-in-published-release",
        objectId: draftClinic.id,
      }),
    );
  });

  it("treats a review as current through its due date", () => {
    const repository = repositoryWith(approvedClinic("2026-07-18"), approvedPolicyModule);
    const issues = validateReleaseInclusion(repository, publishedManifest, undefined);

    expect(issues.some((issue) => issue.code === "expired-review-in-published-release")).toBe(
      false,
    );
  });

  it("rejects an expired review date on the bound content approval", () => {
    const repository = repositoryWith(approvedClinic("2026-07-19"), approvedPolicyModule);
    repository.contentApprovals = [contentApproval("2026-07-17")];
    const issues = validateReleaseInclusion(repository, publishedManifest, undefined);

    expect(issues).toContainEqual(
      expect.objectContaining({
        code: "expired-review-in-published-release",
        objectId: draftClinic.id,
        message: expect.stringContaining("bound approval evidence"),
      }),
    );
  });

  it("treats a bound content approval as current through its due date", () => {
    const repository = repositoryWith(approvedClinic("2026-07-19"), approvedPolicyModule);
    repository.contentApprovals = [contentApproval("2026-07-18")];
    const issues = validateReleaseInclusion(repository, publishedManifest, undefined);

    expect(issues.some((issue) => issue.code === "expired-review-in-published-release")).toBe(
      false,
    );
  });
});
