import type {
  ClinicConfig,
  ContentApproval,
  ContentReleaseManifest,
  ContentStatusTransition,
  Source,
} from "@ariad/contracts";
import { describe, expect, it } from "vitest";
import type { KnowledgeRepository } from "./repository";
import { validateReleaseInclusion, validateRepository } from "./validation";

const draftClinic: ClinicConfig = {
  kind: "clinic_config",
  id: "test-clinic",
  version: "1.0.0",
  status: "draft",
  review: {
    reviewer: null,
    reviewed_at: null,
    review_due: null,
    approval_id: null,
  },
  supersedes: null,
  superseded_by: null,
  clinic_name: "Synthetic test clinic",
  synthetic: true,
  daytime_contact: "Use the test clinic contact",
  after_hours_contact: "Use the test clinic after-hours contact",
  emergency_statement: "Call the local emergency service for an emergency",
  fever_instruction: "Follow the test clinic fever instruction",
  supportive_care_note: "Follow the test clinic supportive-care instruction",
  source_ids: ["test-source"],
};

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

function repositoryWith(...objects: ClinicConfig[]): KnowledgeRepository {
  return {
    objects: [...objects, testSource],
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
      ...objects.map(
        (object) =>
          [`clinic_config:${object.id}@${object.version}`, "test-fixture"] as const,
      ),
      [`source:${testSource.id}@${testSource.version}`, "test-fixture"],
    ]),
  };
}

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
    version: "0.9.0",
  };
  const currentReference = {
    kind: "clinic_config" as const,
    id: "test-clinic",
    version: "1.0.0",
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
    const earlier: ClinicConfig = { ...draftClinic, version: "0.9.0" };
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
      version: "0.9.0",
      superseded_by: { ...currentReference, version: "1.1.0" },
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
      version: "0.9.0",
      superseded_by: currentReference,
    };
    const current: ClinicConfig = { ...draftClinic, supersedes: earlierReference };
    const report = validateRepository(repositoryWith(earlier, current));

    expect(report.issues.filter((issue) => issue.code.startsWith("supersession-"))).toEqual([]);
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
      { kind: "clinic_config", id: "test-clinic", version: "1.0.0" },
      { kind: "source", id: "test-source", version: "1.0.0" },
    ],
    clinic_config: { kind: "clinic_config", id: "test-clinic", version: "1.0.0" },
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
      ...draftClinic,
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

  function contentApproval(reviewDue: string): ContentApproval {
    return {
      kind: "content_approval",
      id: "test-content-approval",
      subject: { kind: "clinic_config", id: "test-clinic", version: "1.0.0" },
      subject_payload_hash: "0".repeat(64),
      decision: "approved",
      reviewer: "Test reviewer",
      reviewed_at: "2026-07-17T13:00:00.000Z",
      review_due: reviewDue,
    };
  }

  it("rejects an object whose review expired before the publication date", () => {
    const repository = repositoryWith(approvedClinic("2026-07-17"));
    const issues = validateReleaseInclusion(repository, publishedManifest, undefined);

    expect(issues).toContainEqual(
      expect.objectContaining({
        code: "expired-review-in-published-release",
        objectId: draftClinic.id,
      }),
    );
  });

  it("treats a review as current through its due date", () => {
    const repository = repositoryWith(approvedClinic("2026-07-18"));
    const issues = validateReleaseInclusion(repository, publishedManifest, undefined);

    expect(issues.some((issue) => issue.code === "expired-review-in-published-release")).toBe(
      false,
    );
  });

  it("rejects an expired review date on the bound content approval", () => {
    const repository = repositoryWith(approvedClinic("2026-07-19"));
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
    const repository = repositoryWith(approvedClinic("2026-07-19"));
    repository.contentApprovals = [contentApproval("2026-07-18")];
    const issues = validateReleaseInclusion(repository, publishedManifest, undefined);

    expect(issues.some((issue) => issue.code === "expired-review-in-published-release")).toBe(
      false,
    );
  });
});
