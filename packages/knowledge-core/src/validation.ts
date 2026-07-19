import {
  PREVIEW_ACKNOWLEDGEMENT,
  type ClinicConfig,
  type ContentStatus,
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
  calendarDateInTimeZone,
} from "@ariad/contracts";
import { objectKey, type KnowledgeRepository } from "./repository";
import { scanClinicConfigSafety, scanModuleSafety, type SafetyFinding } from "./safety";
import { canonicalJson, sha256 } from "./canonical";

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

interface ObjectDependency {
  kinds: KnowledgeObject["kind"][];
  id: string;
  label: string;
  version?: string;
}

function dependenciesForObject(object: KnowledgeObject): ObjectDependency[] {
  const dependencies: ObjectDependency[] = [];
  const add = (kinds: KnowledgeObject["kind"][], ids: string[], label: string) => {
    ids.forEach((id) => dependencies.push({ kinds, id, label }));
  };
  const sources = (sourceIds: string[]) => add(["source"], sourceIds, "source_ids");
  const exact = (reference: VersionedRef, label: string) =>
    dependencies.push({
      kinds: [reference.kind],
      id: reference.id,
      label,
      version: reference.version,
    });

  switch (object.kind) {
    case "treatment_class":
      add(["treatment_class"], object.parent_class_ids, "parent_class_ids");
      add(["educational_module"], object.description_module_ids, "description_module_ids");
      sources(object.source_ids);
      break;
    case "drug":
      add(["treatment_class"], object.class_ids, "class_ids");
      sources(object.source_ids);
      break;
    case "regimen":
      add(["drug"], object.component_drug_ids, "component_drug_ids");
      add(["treatment_class"], object.class_ids, "class_ids");
      sources(object.source_ids);
      break;
    case "symptom":
      add(["observable_feature"], object.observable_feature_ids, "observable_feature_ids");
      add(["educational_module"], object.general_module_ids, "general_module_ids");
      sources(object.source_ids);
      break;
    case "observable_feature":
      sources(object.source_ids);
      break;
    case "question":
      add(["symptom"], object.symptom_ids, "symptom_ids");
      add(["observable_feature"], [object.feature_id], "feature_id");
      sources(object.source_ids);
      break;
    case "educational_module":
      add(
        ["treatment_class", "drug", "regimen"],
        object.applicability.treatment_ids,
        "applicability.treatment_ids",
      );
      add(["symptom"], object.applicability.symptom_ids, "applicability.symptom_ids");
      sources(object.source_ids);
      break;
    case "treatment_toxicity_relationship":
      add([object.treatment_kind], [object.treatment_id], "treatment_id");
      add(["symptom"], [object.symptom_id], "symptom_id");
      if (object.modules) {
        add(["educational_module"], Object.values(object.modules).flat(), "modules");
      }
      add(["question"], object.question_ids, "question_ids");
      sources(object.source_ids);
      break;
    case "clinic_config":
      if ("mode" in object) {
        add(["source"], object.operational_source_ids, "operational_source_ids");
        for (const [policyName, policy] of Object.entries(object.clinical_policy_bindings)) {
          if (policy.module_ref) {
            exact(policy.module_ref, `clinical_policy_bindings.${policyName}.module_ref`);
          }
        }
      } else {
        sources(object.source_ids);
      }
      break;
    case "source":
      break;
  }
  return dependencies;
}

function collectReferenceIssues(objects: KnowledgeObject[]): ValidationIssue[] {
  const issues: ValidationIssue[] = [];
  const objectsByKey = new Map(objects.map((object) => [objectKey(object), object]));
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
  const source = (owner: string, sourceIds: string[], label = "source_ids") =>
    sourceIds.forEach((id) => exists(["source"], id, owner, label));

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
        const item = object as ClinicConfig;
        if ("mode" in item) {
          source(item.id, item.operational_source_ids, "operational_source_ids");
          for (const [policyName, policy] of Object.entries(item.clinical_policy_bindings)) {
            if (!policy.module_ref) continue;
            const target = objectsByKey.get(refKey(policy.module_ref));
            if (!target) {
              issues.push({
                severity: "error",
                code: "clinic-policy-module-missing",
                objectId: item.id,
                message: `clinical_policy_bindings.${policyName}.module_ref references missing educational module '${refKey(policy.module_ref)}'`,
              });
            } else if (target.kind !== "educational_module") {
              issues.push({
                severity: "error",
                code: "clinic-policy-module-kind-invalid",
                objectId: item.id,
                message: `clinical_policy_bindings.${policyName}.module_ref must reference an educational module`,
              });
            }
          }
        } else {
          source(item.id, item.source_ids);
        }
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

function collectRelationshipSemanticIssues(objects: KnowledgeObject[]): ValidationIssue[] {
  const issues: ValidationIssue[] = [];
  const modules = new Map(
    objects
      .filter((object): object is EducationalModule => object.kind === "educational_module")
      .map((module) => [module.id, module]),
  );
  const questions = new Map(
    objects
      .filter((object): object is Question => object.kind === "question")
      .map((question) => [question.id, question]),
  );

  for (const relationship of objects.filter(
    (object): object is TreatmentToxicityRelationship =>
      object.kind === "treatment_toxicity_relationship",
  )) {
    if (relationship.modules) {
      for (const [section, moduleIds] of Object.entries(relationship.modules)) {
        for (const moduleId of moduleIds) {
          const educationalModule = modules.get(moduleId);
          if (!educationalModule) continue;
          if (educationalModule.section !== section) {
            issues.push({
              severity: "error",
              code: "relationship-module-section-mismatch",
              objectId: relationship.id,
              message: `Slot '${section}' references module '${moduleId}' with section '${educationalModule.section}'`,
            });
          }
          if (!educationalModule.applicability.treatment_ids.includes(relationship.treatment_id)) {
            issues.push({
              severity: "error",
              code: "relationship-module-treatment-mismatch",
              objectId: relationship.id,
              message: `Module '${moduleId}' does not apply to treatment '${relationship.treatment_id}'`,
            });
          }
          if (!educationalModule.applicability.symptom_ids.includes(relationship.symptom_id)) {
            issues.push({
              severity: "error",
              code: "relationship-module-symptom-mismatch",
              objectId: relationship.id,
              message: `Module '${moduleId}' does not apply to symptom '${relationship.symptom_id}'`,
            });
          }
        }
      }
    }
    for (const questionId of relationship.question_ids) {
      const question = questions.get(questionId);
      if (question && !question.symptom_ids.includes(relationship.symptom_id)) {
        issues.push({
          severity: "error",
          code: "relationship-question-symptom-mismatch",
          objectId: relationship.id,
          message: `Question '${questionId}' does not apply to symptom '${relationship.symptom_id}'`,
        });
      }
    }
  }
  return issues;
}

function clinicalPayloadHash(object: KnowledgeObject): string {
  const payload = { ...object } as Record<string, unknown>;
  delete payload.status;
  delete payload.status_history;
  delete payload.review;
  delete payload.supersedes;
  delete payload.superseded_by;
  return sha256(canonicalJson(payload));
}

const ALLOWED_STATUS_TRANSITIONS: Readonly<Record<ContentStatus, readonly ContentStatus[]>> = {
  draft: ["in_review"],
  in_review: ["draft", "approved"],
  approved: ["retired"],
  retired: [],
};

function collectStatusHistoryIssues(object: Exclude<KnowledgeObject, Source>): ValidationIssue[] {
  const issues: ValidationIssue[] = [];
  const history = object.status_history;

  if (!history || history.length === 0) {
    if (object.status !== "draft") {
      issues.push({
        severity: "error",
        code: "status-history-missing",
        objectId: object.id,
        message: `Content with status '${object.status}' requires status-transition history`,
      });
    }
    return issues;
  }

  let expectedStatus: ContentStatus = "draft";
  let previousTransitionTime: string | null = null;

  for (const transition of history) {
    if (transition.from_status !== expectedStatus) {
      issues.push({
        severity: "error",
        code: "status-history-discontinuity",
        objectId: object.id,
        message: `Transition from '${transition.from_status}' does not continue from '${expectedStatus}'`,
      });
    }

    if (!ALLOWED_STATUS_TRANSITIONS[transition.from_status].includes(transition.to_status)) {
      issues.push({
        severity: "error",
        code: "invalid-status-transition",
        objectId: object.id,
        message: `Status transition '${transition.from_status}' to '${transition.to_status}' is not allowed`,
      });
    }

    if (previousTransitionTime && transition.transitioned_at <= previousTransitionTime) {
      issues.push({
        severity: "error",
        code: "status-history-not-chronological",
        objectId: object.id,
        message: "Status-transition timestamps must be strictly chronological",
      });
    }

    expectedStatus = transition.to_status;
    previousTransitionTime = transition.transitioned_at;
  }

  if (expectedStatus !== object.status) {
    issues.push({
      severity: "error",
      code: "status-history-current-status-mismatch",
      objectId: object.id,
      message: `Status history ends at '${expectedStatus}', but the object declares '${object.status}'`,
    });
  }

  return issues;
}

type GovernedKnowledgeObject = Exclude<KnowledgeObject, Source>;
type SupersessionField = "supersedes" | "superseded_by";

function collectSupersessionIssues(objects: KnowledgeObject[]): ValidationIssue[] {
  const issues: ValidationIssue[] = [];
  const objectsByKey = new Map(objects.map((object) => [objectKey(object), object]));

  function validateLink(
    object: GovernedKnowledgeObject,
    field: SupersessionField,
    reciprocalField: SupersessionField,
  ): void {
    const reference = object[field];
    if (!reference) return;

    const ownerKey = objectKey(object);
    const targetKey = refKey(reference);
    if (targetKey === ownerKey) {
      issues.push({
        severity: "error",
        code: "supersession-self-reference",
        objectId: object.id,
        message: `'${field}' cannot reference the object itself`,
      });
      return;
    }

    const target = objectsByKey.get(targetKey);
    if (!target) {
      issues.push({
        severity: "error",
        code: "supersession-target-missing",
        objectId: object.id,
        message: `'${field}' references missing object '${targetKey}'`,
      });
      return;
    }
    if (target.kind === "source") {
      issues.push({
        severity: "error",
        code: "supersession-target-not-governed",
        objectId: object.id,
        message: `'${field}' cannot reference non-governed source '${targetKey}'`,
      });
      return;
    }

    const reciprocal = target[reciprocalField];
    if (!reciprocal) {
      issues.push({
        severity: "error",
        code: "supersession-reciprocal-missing",
        objectId: object.id,
        message: `'${field}' target '${targetKey}' must set '${reciprocalField}' to '${ownerKey}'`,
      });
    } else if (refKey(reciprocal) !== ownerKey) {
      issues.push({
        severity: "error",
        code: "supersession-reciprocal-mismatch",
        objectId: object.id,
        message: `'${field}' target '${targetKey}' points '${reciprocalField}' to '${refKey(reciprocal)}' instead of '${ownerKey}'`,
      });
    }
  }

  for (const object of objects) {
    if (object.kind === "source") continue;
    validateLink(object, "supersedes", "superseded_by");
    validateLink(object, "superseded_by", "supersedes");
  }

  return issues;
}

function collectGovernanceIssues(repository: KnowledgeRepository): ValidationIssue[] {
  const issues: ValidationIssue[] = [];
  for (const object of repository.objects) {
    if (object.kind === "source") continue;
    issues.push(...collectStatusHistoryIssues(object));
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
      } else {
        const approval = repository.contentApprovals.find(
          (candidate) => candidate.id === object.review.approval_id,
        );
        if (approval && refKey(approval.subject) !== objectKey(object)) {
          issues.push({
            severity: "error",
            code: "approval-subject-mismatch",
            objectId: object.id,
            message: `Approval '${approval.id}' is bound to '${refKey(approval.subject)}'`,
          });
        } else if (approval && approval.subject_payload_hash !== clinicalPayloadHash(object)) {
          issues.push({
            severity: "error",
            code: "approval-payload-mismatch",
            objectId: object.id,
            message: `Approval '${approval.id}' does not match the current clinical payload`,
          });
        }
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
  issues.push(...collectRelationshipSemanticIssues(repository.objects));
  issues.push(...collectSupersessionIssues(repository.objects));
  issues.push(...collectGovernanceIssues(repository));

  const safetyFindings = repository.objects.flatMap((object) => {
    if (object.kind === "educational_module") return scanModuleSafety(object);
    if (object.kind === "clinic_config") return scanClinicConfigSafety(object);
    return [];
  });
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
  const includedKeys = new Set(release.included_objects.map(refKey));
  const clinicKey = refKey(release.clinic_config);
  const clinicCandidate = objectsByKey.get(clinicKey);
  const clinicConfig = clinicCandidate?.kind === "clinic_config" ? clinicCandidate : undefined;

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

  if (!clinicConfig) {
    issues.push({
      severity: "error",
      code: "clinic-config-missing",
      objectId: release.release_id,
      message: `Release clinic_config references missing clinic configuration '${clinicKey}'`,
    });
  }

  if (!includedKeys.has(clinicKey)) {
    issues.push({
      severity: "error",
      code: "clinic-config-not-included",
      objectId: release.release_id,
      message: `Clinic config '${clinicKey}' must be included in the release object list`,
    });
  }

  const includedClinicConfigs = included.filter(
    (object): object is ClinicConfig => object?.kind === "clinic_config",
  );
  if (includedClinicConfigs.length > 1) {
    issues.push({
      severity: "error",
      code: "multiple-clinic-configs-in-release",
      objectId: release.release_id,
      message: `Release includes ${includedClinicConfigs.length} clinic configurations; exactly one is allowed`,
    });
  }

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

    if (clinicConfig) {
      if (!("mode" in clinicConfig) || clinicConfig.mode === "synthetic_demo") {
        issues.push({
          severity: "error",
          code: "synthetic-clinic-in-published-release",
          objectId: clinicConfig.id,
          message: "Published releases require an institutional clinic configuration",
        });
      } else {
        for (const [policyName, policy] of Object.entries(
          clinicConfig.clinical_policy_bindings,
        )) {
          if (policy.state === "unresolved") {
            issues.push({
              severity: "error",
              code: "unresolved-clinic-policy-in-published-release",
              objectId: clinicConfig.id,
              message: `Published release cannot include unresolved clinic policy '${policyName}'`,
            });
          } else {
            issues.push({
              severity: "error",
              code: "clinic-policy-publication-not-supported",
              objectId: clinicConfig.id,
              message: `Clinic policy '${policyName}' cannot be published until purpose compatibility and exact runtime rendering are implemented`,
            });
          }
        }

        if (clinicConfig.mode === "institutional") {
          const releaseDate = calendarDateInTimeZone(
            release.generated_at,
            clinicConfig.identity.timezone,
          );
          const releaseTimestamp = Date.parse(release.generated_at);
          if (releaseDate === null) {
            issues.push({
              severity: "error",
              code: "clinic-release-date-resolution-failed",
              objectId: clinicConfig.id,
              message: "Release time could not be resolved in the clinic timezone",
            });
          }
          for (const contact of clinicConfig.contact_routes) {
            if (contact.verification.status !== "verified") {
              issues.push({
                severity: "error",
                code: "unverified-clinic-contact-in-published-release",
                objectId: clinicConfig.id,
                message: `Institutional contact '${contact.id}' is not verified`,
              });
            } else {
              if (
                contact.verification.verified_at &&
                Date.parse(contact.verification.verified_at) > releaseTimestamp
              ) {
                issues.push({
                  severity: "error",
                  code: "future-clinic-contact-verification",
                  objectId: clinicConfig.id,
                  message: `Contact '${contact.id}' was verified after the release generation time`,
                });
              }
              if (
                contact.verification.review_due &&
                releaseDate !== null &&
                contact.verification.review_due < releaseDate
              ) {
                issues.push({
                  severity: "error",
                  code: "expired-clinic-contact-verification",
                  objectId: clinicConfig.id,
                  message: `Contact '${contact.id}' verification expired before release date ${releaseDate}`,
                });
              }
            }
          }
        }
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

  const includedObjects = included.filter(Boolean) as KnowledgeObject[];
  const includedKindIds = new Set(
    includedObjects.map((object) => `${object.kind}:${object.id}`),
  );
  for (const object of includedObjects) {
    for (const dependency of dependenciesForObject(object)) {
      const dependencyIncluded = dependency.version
        ? dependency.kinds.some((kind) =>
            includedKeys.has(`${kind}:${dependency.id}@${dependency.version}`),
          )
        : dependency.kinds.some((kind) => includedKindIds.has(`${kind}:${dependency.id}`));
      if (!dependencyIncluded) {
        issues.push({
          severity: "error",
          code: dependency.version
            ? "release-exact-dependency-not-included"
            : "release-dependency-not-included",
          objectId: object.id,
          message: dependency.version
            ? `${dependency.label} dependency '${dependency.kinds[0]}:${dependency.id}@${dependency.version}' is not exactly pinned in the release`
            : `${dependency.label} dependency '${dependency.id}' is not pinned in the release`,
        });
      }
    }
  }

  const includedSourceIds = new Set(
    includedObjects
      .filter((object): object is Source => object.kind === "source")
      .map((source) => source.id),
  );
  const inventoryIds = new Set(release.source_inventory);
  for (const sourceId of includedSourceIds) {
    if (!inventoryIds.has(sourceId)) {
      issues.push({
        severity: "error",
        code: "source-inventory-missing-entry",
        objectId: release.release_id,
        message: `Included source '${sourceId}' is missing from source_inventory`,
      });
    }
  }
  for (const sourceId of inventoryIds) {
    if (!includedSourceIds.has(sourceId)) {
      issues.push({
        severity: "error",
        code: "source-inventory-object-missing",
        objectId: release.release_id,
        message: `source_inventory entry '${sourceId}' is not pinned as a source object`,
      });
    }
  }

  if (release.channel === "published") {
    const releaseDate = release.generated_at.slice(0, 10);
    for (const object of includedObjects) {
      if (object.kind === "source") continue;
      const boundApproval = repository.contentApprovals.find(
        (approval) =>
          approval.id === object.review.approval_id &&
          refKey(approval.subject) === objectKey(object),
      );
      const dueDates = [
        object.review.review_due,
        object.kind === "educational_module" ? object.review_due : null,
        boundApproval?.review_due ?? null,
      ].filter((value): value is string => Boolean(value));
      if (dueDates.some((dueDate) => dueDate < releaseDate)) {
        issues.push({
          severity: "error",
          code: "expired-review-in-published-release",
          objectId: object.id,
          message: `Review or bound approval evidence expired before release date ${releaseDate}`,
        });
      }
    }

    const releaseApprovalId = release.reviewer_metadata.release_approval_id;
    const releaseApproval = repository.releaseApprovals.find(
      (approval) => approval.id === releaseApprovalId,
    );
    if (releaseApprovalId && !releaseApproval) {
      issues.push({
        severity: "error",
        code: "release-approval-evidence-missing",
        objectId: release.release_id,
        message: `Release approval '${releaseApprovalId}' is missing`,
      });
    } else if (releaseApproval && releaseApproval.release_id !== release.release_id) {
      issues.push({
        severity: "error",
        code: "release-approval-subject-mismatch",
        objectId: release.release_id,
        message: `Release approval '${releaseApproval.id}' is for '${releaseApproval.release_id}'`,
      });
    }
  }

  return issues;
}
