import {
  CompiledReleaseSchema,
  PREVIEW_NOTICE,
  type CompiledRelease,
  type ContentReleaseManifest,
  type Drug,
  type Regimen,
  type SearchRecord,
  type Symptom,
  type TreatmentClass,
  type TreatmentToxicityRelationship,
} from "@ariad/contracts";
import { canonicalJson, sha256 } from "./canonical";
import { objectKey, type KnowledgeRepository } from "./repository";
import { normalizeSearchText } from "./search";
import { validateReleaseInclusion, validateRepository } from "./validation";

export const COMPILER_VERSION = "0.1.1" as const;
export const SCHEMA_VERSION = "0.1.0" as const;
export const SAFETY_RULESET_VERSION = "0.1.0" as const;

function refKey(reference: ContentReleaseManifest["included_objects"][number]): string {
  return `${reference.kind}:${reference.id}@${reference.version}`;
}

function displayName(object: TreatmentClass | Drug | Regimen | Symptom): string {
  if (object.kind === "drug") return object.generic_name;
  if (object.kind === "symptom") return object.patient_label;
  return object.display_name;
}

function aliases(object: TreatmentClass | Drug | Regimen | Symptom): string[] {
  switch (object.kind) {
    case "drug":
      return [...object.brand_names, ...object.aliases];
    case "symptom":
      return [...object.synonyms, ...object.navigation_terms];
    case "regimen":
      return [object.abbreviation ?? "", ...object.aliases].filter(Boolean);
    case "treatment_class":
      return object.aliases;
  }
}

function toSearchRecord(object: TreatmentClass | Drug | Regimen | Symptom): SearchRecord {
  const authoredAliases = aliases(object);
  return {
    id: object.id,
    kind: object.kind,
    display_name: displayName(object),
    normalized_name: normalizeSearchText(displayName(object)),
    aliases: authoredAliases,
    normalized_aliases: authoredAliases.map(normalizeSearchText),
    support_status: "support_status" in object ? object.support_status : "catalogued",
  };
}

function sortedRecord<T extends Record<string, string[]>>(record: T): T {
  return Object.fromEntries(
    Object.entries(record)
      .sort(([left], [right]) => left.localeCompare(right))
      .map(([key, values]) => [key, [...values].sort()]),
  ) as T;
}

export function compileRelease(
  repository: KnowledgeRepository,
  manifest: ContentReleaseManifest,
  acknowledgement?: string,
): { release: CompiledRelease; json: string } {
  const repositoryReport = validateRepository(repository);
  const issues = [
    ...repositoryReport.issues,
    ...validateReleaseInclusion(repository, manifest, acknowledgement),
  ];
  const errors = issues.filter((issue) => issue.severity === "error");
  if (errors.length > 0) {
    throw new Error(
      `Content compilation failed:\n${errors
        .map((issue) => `- [${issue.code}] ${issue.objectId}: ${issue.message}`)
        .join("\n")}`,
    );
  }

  const objectsByKey = new Map(repository.objects.map((object) => [objectKey(object), object]));
  const includedObjects = manifest.included_objects.map((reference) => {
    const object = objectsByKey.get(refKey(reference));
    if (!object) throw new Error(`Missing release object '${refKey(reference)}'`);
    return object;
  });
  const sortedObjects = [...includedObjects].sort((left, right) =>
    objectKey(left).localeCompare(objectKey(right)),
  );
  const relationships = sortedObjects.filter(
    (object): object is TreatmentToxicityRelationship =>
      object.kind === "treatment_toxicity_relationship",
  );
  const relationshipsByTreatment: Record<string, string[]> = {};
  const relationshipsBySymptom: Record<string, string[]> = {};
  relationships.forEach((relationship) => {
    (relationshipsByTreatment[relationship.treatment_id] ??= []).push(relationship.id);
    (relationshipsBySymptom[relationship.symptom_id] ??= []).push(relationship.id);
  });

  const treatments = sortedObjects
    .filter(
      (object): object is TreatmentClass | Drug | Regimen =>
        object.kind === "treatment_class" || object.kind === "drug" || object.kind === "regimen",
    )
    .map(toSearchRecord)
    .sort((left, right) => left.display_name.localeCompare(right.display_name) || left.id.localeCompare(right.id));
  const symptoms = sortedObjects
    .filter((object): object is Symptom => object.kind === "symptom" && object.concept_kind === "patient_observable")
    .map(toSearchRecord)
    .sort((left, right) => left.display_name.localeCompare(right.display_name) || left.id.localeCompare(right.id));

  const approvalSummary = { draft: 0, in_review: 0, approved: 0, retired: 0 };
  for (const object of sortedObjects) {
    if (object.kind !== "source") approvalSummary[object.status] += 1;
  }
  const base = {
    schema_version: SCHEMA_VERSION,
    compiler_version: COMPILER_VERSION,
    safety_ruleset_version: SAFETY_RULESET_VERSION,
    release_id: manifest.release_id,
    release_version: manifest.version,
    channel: manifest.channel,
    clinical_use: manifest.clinical_use,
    contains_unapproved_content: approvalSummary.draft + approvalSummary.in_review > 0,
    mandatory_notice: manifest.channel === "preview" ? PREVIEW_NOTICE : null,
    generated_at: manifest.generated_at,
    approval_summary: approvalSummary,
    objects: sortedObjects,
    indexes: {
      treatments,
      symptoms,
      relationships_by_treatment: sortedRecord(relationshipsByTreatment),
      relationships_by_symptom: sortedRecord(relationshipsBySymptom),
    },
    source_inventory: [...manifest.source_inventory].sort(),
    known_gaps: manifest.known_gaps,
    release_notes: manifest.release_notes,
  };
  const contentHash = sha256(canonicalJson(base));
  if (manifest.channel === "published") {
    const approval = repository.releaseApprovals.find(
      (candidate) => candidate.id === manifest.reviewer_metadata.release_approval_id,
    );
    if (!approval || approval.candidate_payload_hash !== contentHash) {
      throw new Error(
        "Content compilation failed:\n- [release-approval-payload-mismatch] " +
          `${manifest.release_id}: release approval does not match candidate payload '${contentHash}'`,
      );
    }
  }
  const release = CompiledReleaseSchema.parse({ ...base, content_hash: contentHash });
  return { release, json: canonicalJson(release) };
}

export function findReleaseManifest(
  repository: KnowledgeRepository,
  releaseId: string | undefined,
): ContentReleaseManifest {
  const selected = releaseId
    ? repository.releases.find((release) => release.release_id === releaseId)
    : repository.releases.length === 1
      ? repository.releases[0]
      : undefined;
  if (!selected) {
    throw new Error(
      releaseId
        ? `Content release '${releaseId}' was not found`
        : "Set CONTENT_RELEASE_ID when more than one release manifest exists",
    );
  }
  return selected;
}
