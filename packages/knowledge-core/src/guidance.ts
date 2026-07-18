import type {
  AssembledGuidance,
  CompiledRelease,
  EducationalModule,
  Question,
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
  const relationship = release.objects.find(
    (object): object is TreatmentToxicityRelationship =>
      object.kind === "treatment_toxicity_relationship" &&
      object.treatment_id === treatmentId &&
      object.symptom_id === symptomId,
  );
  if (!relationship || !relationship.modules) return null;

  const modules = byId(
    release.objects.filter((object): object is EducationalModule => object.kind === "educational_module"),
  );
  const priorityTags = answerPriorityTags(release, answers);
  const sections = SECTION_ORDER.map((section) => {
    const moduleIds = relationship.modules?.[section] ?? [];
    const sectionModules = moduleIds.map((id) => modules.get(id)).filter(Boolean) as EducationalModule[];
    return {
      section,
      heading: SECTION_HEADINGS[section],
      module_ids: moduleIds,
      emphasized_module_ids: sectionModules
        .filter((module) => module.priority_tags.some((tag) => priorityTags.has(tag)))
        .map((module) => module.id),
      source_ids: [...new Set(sectionModules.flatMap((module) => module.source_ids))].sort(),
    };
  });

  return {
    release_id: release.release_id,
    relationship_id: relationship.id,
    treatment_id: treatmentId,
    symptom_id: symptomId,
    exact_treatment_support: relationship.support_status,
    guidance_basis: "exact",
    guidance_basis_label: "Exact regimen guidance",
    fallback_reason: null,
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
