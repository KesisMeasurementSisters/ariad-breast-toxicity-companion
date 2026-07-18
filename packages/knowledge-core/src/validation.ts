import {
  PREVIEW_ACKNOWLEDGEMENT,
  type ClinicConfig,
  type ContentReleaseManifest,
  type Drug,
  type EducationalModule,
  type KnowledgeObject,
  type ObservableFeature,
  type Question,
  type Regimen,
  type Source,
  type Symptom,
  type TreatmentClass,
  type TreatmentToxicityRelationship,
  type VersionedRef,
} from "@ariad/contracts";
import { objectKey, type KnowledgeRepository } from "./repository";
import { scanModuleSafety, type SafetyFinding } from "./safety";

export interface ValidationIssue {
  severity: "error" | "warning";
  code: string;
  objectId: string;
  message: string;
}

export interface ValidationReport {
  issues: ValidationIssue[];
  safetyFindings: SafetyFinding[];
  counts: Record<string, number>;
  errors: number;
  warnings: number;
}

function refKey(reference: VersionedRef): string {
  return `${reference.kind}:${reference.id}@${reference.version}`;
}

function idExists(objects: KnowledgeObject[], kinds: KnowledgeObject["kind"][], id: string): boolean {
  return objects.some((object) => kinds.includes(object.kind) && object.id === id);
}

function collectReferenceIssues(objects: KnowledgeObject[]): ValidationIssue[] {
  const issues: ValidationIssue[] = [];
  const exists = (kinds: KnowledgeObject["kind"][], id: string, owner: string, label: string) => {
    if (!idExists(objects, kinds, id)) {
      issues.push({
        severity: "error",
        code: "broken-reference",
        objectId: owner,
        message: `${label} references missing ${kinds.join("/")} '${id}'`,
      });
    }
  };
  const source = (owner: string, sourceIds: string[]) =>
    sourceIds.forEach((id) => exists(["source"], id, owner, "source_ids"));

  for (const object of objects) {
    switch (object.kind) {
      case "treatment_class": {
        const item = object as TreatmentClass;
        item.parent_class_ids.forEach((id) => exists(["treatment_class"], id, item.id, "parent_class_ids"));
        item.description_module_ids.forEach((id) =>
          exists(["educational_module"], id, item.id, "description_module_ids"),
        );
        source(item.id, item.source_ids);
        break;
      }
      case "drug": {
        const item = object as Drug;
        item.class_ids.forEach((id) => exists(["treatment_class"], id, item.id, "class_ids"));
        source(item.id, item.source_ids);
        break;
      }
      case "regimen": {
        const item = object as Regimen;
        item.component_drug_ids.forEach((id) => exists(["drug"], id, item.id, "component_drug_ids"));
        item.class_ids.forEach((id) => exists(["treatment_class"], id, item.id, "class_ids"));
        source(item.id, item.source_ids);
        break;
      }
      case "symptom": {
        const item = object as Symptom;
        item.observable_feature_ids.forEach((id) =>
          exists(["observable_feature"], id, item.id, "observable_feature_ids"),
        );
        item.general_module_ids.forEach((id) =>
          exists(["educational_module"], id, item.id, "general_module_ids"),
        );
        source(item.id, item.source_ids);
        break;
      }
      case "observable_feature": {
        source(object.id, (object as ObservableFeature).source_ids);
        break;
      }
      case "question": {
        const item = object as Question;
        item.symptom_ids.forEach((id) => exists(["symptom"], id, item.id, "symptom_ids"));
        exists(["observable_feature"], item.feature_id, item.id, "feature_id");
        source(item.id, item.source_ids);
        break;
      }
      case "educational_module": {
        const item = object as EducationalModule;
        item.applicability.treatment_ids.forEach((id) =>
          exists(["treatment_class", "drug", "regimen"], id, item.id, "applicability.treatment_ids"),
        );
        item.applicability.symptom_ids.forEach((id) =>
          exists(["symptom"], id, item.id, "applicability.symptom_ids"),
        );
        source(item.id, item.source_ids);
        break;
      }
      case "treatment_toxicity_relationship": {
        const item = object as TreatmentToxicityRelationship;
        exists([item.treatment_kind], item.treatment_id, item.id, "treatment_id");
        exists(["symptom"], item.symptom_id, item.id, "symptom_id");
        if (item.modules) {
          Object.values(item.modules)
            .flat()
            .forEach((id) => exists(["educational_module"], id, item.id, "modules"));
        }
        item.question_ids.forEach((id) => exists(["question"], id, item.id, "question_ids"));
        source(item.id, item.source_ids);
        break;
      }
      case "clinic_config": {
        source(object.id, (object as ClinicConfig).source_ids);
        break;
      }
      case "source":
        break;
    }
  }

  return issues;
}

function collectClassCycleIssues(objects: KnowledgeObject[]): ValidationIssue[] {
  const classes = objects.filter((object): object is TreatmentClass => object.kind === "treatment_class");
  const parents = new Map(classes.map((item) => [item.id, item.parent_class_ids]));
  const issues: ValidationIssue[] = [];

  const visit = (id: string, path: string[]) => {
    if (path.includes(id)) {
      issues.push({
        severity: "error",
        code: "class-cycle",
        objectId: id,
        message: `Treatment class cycle: ${[...path, id].join(" -> ")}`,
      });
      return;
    }
    for (const parent of parents.get(id) ?? []) visit(parent, [...path, id]);
  };

  classes.forEach((item) => visit(item.id, []));
  return issues;
}

function collectGovernanceIssues(repository: KnowledgeRepository): ValidationIssue[] {
  const issues: ValidationIssue[] = [];
  for (const object of repository.objects) {
    if (object.kind === "source") continue;
    if (object.status === "approved") {
      if (!object.review.reviewer || !object.review.reviewed_at || !object.review.approval_id) {
        issues.push({
          severity: "error",
          code: "approval-metadata-missing",
          objectId: object.id,
          message: "Approved content requires reviewer, review time, and approval ID",
        });
      } else if (!repository.contentApprovals.some((approval) => approval.id === object.review.approval_id)) {
        issues.push({
          severity: "error",
          code: "approval-evidence-missing",
          objectId: object.id,
          message: `Approval record '${object.review.approval_id}' is missing`,
        });
      }
    }
  }
  return issues;
}

export function validateRepository(repository: KnowledgeRepository): ValidationReport {
  const issues: ValidationIssue[] = [];
  const seen = new Map<string, string>();
  const counts: Record<string, number> = {};

  for (const object of repository.objects) {
    const key = objectKey(object);
    counts[object.kind] = (counts[object.kind] ?? 0) + 1;
    if (seen.has(key)) {
      issues.push({
        severity: "error",
        code: "duplicate-object",
        objectId: object.id,
        message: `Duplicate object '${key}' in ${seen.get(key)} and ${repository.filesByKey.get(key)}`,
      });
    }
    seen.set(key, repository.filesByKey.get(key) ?? "unknown");
  }

  const releaseIds = new Set<string>();
  for (const release of repository.releases) {
    const key = `${release.release_id}@${release.version}`;
    if (releaseIds.has(key)) {
      issues.push({
        severity: "error",
        code: "duplicate-release",
        objectId: release.release_id,
        message: `Duplicate release '${key}'`,
      });
    }
    releaseIds.add(key);
  }

  issues.push(...collectReferenceIssues(repository.objects));
  issues.push(...collectClassCycleIssues(repository.objects));
  issues.push(...collectGovernanceIssues(repository));

  const safetyFindings = repository.objects
    .filter((object): object is EducationalModule => object.kind === "educational_module")
    .flatMap(scanModuleSafety);
  issues.push(
    ...safetyFindings.map((finding) => ({
      severity: finding.severity,
      code: finding.ruleId,
      objectId: finding.objectId,
      message: `${finding.field}: ${finding.excerpt}`,
    })),
  );

  return {
    issues,
    safetyFindings,
    counts,
    errors: issues.filter((issue) => issue.severity === "error").length,
    warnings: issues.filter((issue) => issue.severity === "warning").length,
  };
}

export function validateReleaseInclusion(
  repository: KnowledgeRepository,
  release: ContentReleaseManifest,
  acknowledgement: string | undefined,
): ValidationIssue[] {
  const issues: ValidationIssue[] = [];
  const objectsByKey = new Map(repository.objects.map((object) => [objectKey(object), object]));
  const included = release.included_objects.map((reference) => objectsByKey.get(refKey(reference)));

  release.included_objects.forEach((reference, index) => {
    if (!included[index]) {
      issues.push({
        severity: "error",
        code: "release-object-missing",
        objectId: release.release_id,
        message: `Release includes missing object '${refKey(reference)}'`,
      });
    }
  });

  if (release.channel === "preview") {
    if (release.clinical_use || release.publication_status !== "draft") {
      issues.push({
        severity: "error",
        code: "invalid-preview-envelope",
        objectId: release.release_id,
        message: "Preview releases must be draft and clinical_use=false",
      });
    }
    if (acknowledgement !== PREVIEW_ACKNOWLEDGEMENT) {
      issues.push({
        severity: "error",
        code: "preview-acknowledgement-required",
        objectId: release.release_id,
        message: `Set ALLOW_DRAFT_CONTENT=${PREVIEW_ACKNOWLEDGEMENT} to compile the unreviewed preview`,
      });
    }
  } else {
    if (!release.clinical_use || release.publication_status !== "published") {
      issues.push({
        severity: "error",
        code: "invalid-published-envelope",
        objectId: release.release_id,
        message: "Published releases must have publication_status=published and clinical_use=true",
      });
    }
    for (const object of included.filter(Boolean) as KnowledgeObject[]) {
      if (object.kind !== "source" && object.status !== "approved") {
        issues.push({
          severity: "error",
          code: "unapproved-object-in-published-release",
          objectId: object.id,
          message: `Published release includes '${object.status}' content`,
        });
      }
      if (object.kind === "source" && (object as Source).verification_status !== "verified") {
        issues.push({
          severity: "error",
          code: "unverified-source-in-published-release",
          objectId: object.id,
          message: "Published release includes a source that is not verified",
        });
      }
      if (object.kind === "educational_module" && object.placeholders.length > 0) {
        issues.push({
          severity: "error",
          code: "placeholder-in-published-release",
          objectId: object.id,
          message: `Published module has unresolved placeholders: ${object.placeholders.join(", ")}`,
        });
      }
    }
    if (!release.reviewer_metadata.release_approval_id) {
      issues.push({
        severity: "error",
        code: "release-approval-missing",
        objectId: release.release_id,
        message: "Published release requires a release approval record",
      });
    }
  }

  const includedKeys = new Set(release.included_objects.map(refKey));
  const clinicKey = refKey(release.clinic_config);
  if (!includedKeys.has(clinicKey)) {
    issues.push({
      severity: "error",
      code: "clinic-config-not-included",
      objectId: release.release_id,
      message: `Clinic config '${clinicKey}' must be included in the release object list`,
    });
  }

  return issues;
}

