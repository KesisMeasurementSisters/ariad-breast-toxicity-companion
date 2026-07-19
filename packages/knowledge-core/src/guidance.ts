import type {
  AssembledGuidance,
  CompiledRelease,
  Drug,
  EducationalModule,
  Question,
  Regimen,
  TreatmentClass,
  TreatmentToxicityRelationship,
} from "@ariad/contracts";

const SECTION_ORDER = [
  "about",
  "treatment_context",
  "home_management",
  "contact_team",
  "urgent_attention",
  "reporting_checklist",
] as const;

const SECTION_HEADINGS: Record<(typeof SECTION_ORDER)[number], string> = {
  about: "About this symptom",
  treatment_context: "Why it matters with this treatment",
  home_management: "What you can generally do at home",
  contact_team: "Contact your cancer team if…",
  urgent_attention: "Seek urgent medical attention if…",
  reporting_checklist: "What information to have ready",
};

export interface AnswerValue {
  questionId: string;
  value: string | string[];
}

function byId<T extends { id: string }>(items: T[]): Map<string, T> {
  return new Map(items.map((item) => [item.id, item]));
}

type GuidanceBasis = AssembledGuidance["guidance_basis"];

export interface GuidanceResolution {
  relationship: TreatmentToxicityRelationship;
  basis: GuidanceBasis;
  basisLabel: string;
  fallbackReason: string | null;
}

function eligibleRelationships(
  release: CompiledRelease,
  symptomId: string,
): TreatmentToxicityRelationship[] {
  return release.objects
    .filter(
      (object): object is TreatmentToxicityRelationship =>
        object.kind === "treatment_toxicity_relationship" &&
        object.symptom_id === symptomId &&
        object.support_status === "full_guidance" &&
        object.modules !== null,
    )
    .sort((left, right) => left.id.localeCompare(right.id));
}

function classDistanceOrder(
  release: CompiledRelease,
  startingClassIds: string[],
): string[] {
  const classes = byId(
    release.objects.filter(
      (object): object is TreatmentClass => object.kind === "treatment_class",
    ),
  );
  const ordered: string[] = [];
  const visited = new Set<string>();
  let frontier = [...startingClassIds];

  while (frontier.length > 0) {
    const next: string[] = [];
    for (const id of frontier) {
      if (visited.has(id)) continue;
      visited.add(id);
      ordered.push(id);
      next.push(...(classes.get(id)?.parent_class_ids ?? []));
    }
    frontier = next;
  }
  return ordered;
}

/**
 * Resolve the most specific complete pathway without relabelling fallback
 * material as treatment-specific guidance.
 */
export function resolveGuidanceRelationship(
  release: CompiledRelease,
  treatmentId: string,
  symptomId: string,
): GuidanceResolution | null {
  const relationships = eligibleRelationships(release, symptomId);
  const exact = relationships.find((item) => item.treatment_id === treatmentId);
  if (exact) {
    return {
      relationship: exact,
      basis: "exact",
      basisLabel: exact.treatment_kind === "regimen" ? "Exact regimen guidance" : "Exact treatment guidance",
      fallbackReason: null,
    };
  }

  const treatment = release.objects.find(
    (object): object is Drug | Regimen | TreatmentClass =>
      object.id === treatmentId &&
      (object.kind === "drug" || object.kind === "regimen" || object.kind === "treatment_class"),
  );
  if (!treatment) return null;

  if (treatment.kind === "regimen") {
    for (const componentId of treatment.component_drug_ids) {
      const component = relationships.find(
        (item) => item.treatment_kind === "drug" && item.treatment_id === componentId,
      );
      if (component) {
        const drug = release.objects.find(
          (object): object is Drug => object.kind === "drug" && object.id === componentId,
        );
        return {
          relationship: component,
          basis: "component",
          basisLabel: `Component guidance: ${drug?.generic_name ?? componentId}`,
          fallbackReason: `No complete pathway exists for the exact regimen; this pathway is for one listed component, ${drug?.generic_name ?? componentId}.`,
        };
      }
    }
  }

  const startingClassIds = treatment.kind === "treatment_class" ? [treatment.id] : treatment.class_ids;
  for (const classId of classDistanceOrder(release, startingClassIds)) {
    const classRelationship = relationships.find(
      (item) => item.treatment_kind === "treatment_class" && item.treatment_id === classId,
    );
    if (classRelationship) {
      const treatmentClass = release.objects.find(
        (object): object is TreatmentClass =>
          object.kind === "treatment_class" && object.id === classId,
      );
      return {
        relationship: classRelationship,
        basis: "class",
        basisLabel: `Treatment-class guidance: ${treatmentClass?.display_name ?? classId}`,
        fallbackReason: `No complete pathway exists for the exact selection; this is broader ${treatmentClass?.display_name ?? classId} information.`,
      };
    }
  }

  const general = relationships.find((item) => item.relationship_type === "general_safety");
  if (general) {
    return {
      relationship: general,
      basis: "general",
      basisLabel: "General symptom information",
      fallbackReason: "No complete treatment-specific, component, or treatment-class pathway exists.",
    };
  }
  return null;
}

export function answerPriorityTags(release: CompiledRelease, answers: AnswerValue[]): Set<string> {
  const questions = byId(
    release.objects.filter((object): object is Question => object.kind === "question"),
  );
  const tags = new Set<string>();
  for (const answer of answers) {
    const question = questions.get(answer.questionId);
    const values = Array.isArray(answer.value) ? answer.value : [answer.value];
    for (const option of question?.options ?? []) {
      if (values.includes(option.value)) option.priority_tags.forEach((tag) => tags.add(tag));
    }
  }
  return tags;
}

export function assembleGuidance(
  release: CompiledRelease,
  treatmentId: string,
  symptomId: string,
  answers: AnswerValue[] = [],
): AssembledGuidance | null {
  const resolution = resolveGuidanceRelationship(release, treatmentId, symptomId);
  if (!resolution) return null;
  const { relationship } = resolution;

  const modules = byId(
    release.objects.filter((object): object is EducationalModule => object.kind === "educational_module"),
  );
  const priorityTags = answerPriorityTags(release, answers);
  const sections = SECTION_ORDER.map((section) => {
    const moduleIds = relationship.modules?.[section] ?? [];
    const sectionModules = moduleIds.map((id) => modules.get(id)).filter(Boolean) as EducationalModule[];
    const emphasizedModuleIds = sectionModules
      .filter((module) => module.priority_tags.some((tag) => priorityTags.has(tag)))
      .map((module) => module.id);
    const emphasized = new Set(emphasizedModuleIds);
    return {
      section,
      heading: SECTION_HEADINGS[section],
      module_ids: [
        ...emphasizedModuleIds,
        ...moduleIds.filter((id) => !emphasized.has(id)),
      ],
      emphasized_module_ids: emphasizedModuleIds,
      source_ids: [...new Set(sectionModules.flatMap((module) => module.source_ids))].sort(),
    };
  });

  const selectedTreatmentSupport = release.indexes.treatments.find(
    (record) => record.id === treatmentId,
  )?.support_status;

  return {
    release_id: release.release_id,
    relationship_id: relationship.id,
    treatment_id: treatmentId,
    symptom_id: symptomId,
    exact_treatment_support: selectedTreatmentSupport ?? relationship.support_status,
    guidance_basis: resolution.basis,
    guidance_basis_label: resolution.basisLabel,
    fallback_reason: resolution.fallbackReason,
    question_ids: relationship.question_ids,
    sections,
    source_ids: [
      ...new Set([
        ...relationship.source_ids,
        ...sections.flatMap((section) => section.source_ids),
      ]),
    ].sort(),
  };
}

export function preparationModules(
  release: CompiledRelease,
  treatmentId: string,
): EducationalModule[] {
  return release.objects.filter(
    (object): object is EducationalModule =>
      object.kind === "educational_module" &&
      object.section === "preparation" &&
      object.applicability.treatment_ids.includes(treatmentId),
  );
}
