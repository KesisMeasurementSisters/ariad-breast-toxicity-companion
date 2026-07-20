import {
  CompiledReleaseSchema,
  ClinicConfigV2Schema,
  calendarDateInTimeZone,
  type ClinicContactRoute,
  type ClinicConfigV2,
  type CompiledRelease,
  type Drug,
  type DrugToxicityPresentation,
  type EducationalModule,
  type KnowledgeObject,
  type Question,
  type Regimen,
  type Source,
  type Symptom,
  type TreatmentClass,
  type TreatmentToxicityRelationship,
} from "@ariad/contracts";
import rawRelease from "../generated/release.json";

export const activeRelease: CompiledRelease = CompiledReleaseSchema.parse(rawRelease);

const objects = new Map(activeRelease.objects.map((object) => [object.id, object]));

export function objectById<T extends KnowledgeObject = KnowledgeObject>(id: string): T | undefined {
  return objects.get(id) as T | undefined;
}

export function treatmentById(
  id: string,
): TreatmentClass | Drug | Regimen | undefined {
  const object = objects.get(id);
  if (
    object?.kind === "treatment_class" ||
    object?.kind === "drug" ||
    object?.kind === "regimen"
  ) {
    return object;
  }
  return undefined;
}

export function treatmentName(id: string): string {
  const treatment = treatmentById(id);
  if (!treatment) return id;
  if (treatment.kind === "drug") return treatment.generic_name;
  return treatment.display_name;
}

export function symptomById(id: string): Symptom | undefined {
  const object = objects.get(id);
  return object?.kind === "symptom" ? object : undefined;
}

export function moduleById(id: string): EducationalModule | undefined {
  const object = objects.get(id);
  return object?.kind === "educational_module" ? object : undefined;
}

export function drugToxicityPresentationForDrug(
  drugId: string,
): DrugToxicityPresentation | undefined {
  return activeRelease.objects.find(
    (object): object is DrugToxicityPresentation =>
      object.kind === "drug_toxicity_presentation" && object.drug_id === drugId,
  );
}

export function questionById(id: string): Question | undefined {
  const object = objects.get(id);
  return object?.kind === "question" ? object : undefined;
}

export function sourceById(id: string): Source | undefined {
  const object = objects.get(id);
  return object?.kind === "source" ? object : undefined;
}

export function relationshipFor(
  treatmentId: string,
  symptomId: string,
): TreatmentToxicityRelationship | undefined {
  return activeRelease.objects.find(
    (object): object is TreatmentToxicityRelationship =>
      object.kind === "treatment_toxicity_relationship" &&
      object.treatment_id === treatmentId &&
      object.symptom_id === symptomId,
  );
}

export function resolveClinicConfig(release: CompiledRelease): ClinicConfigV2 {
  const reference = release.clinic_config;
  const exactMatches = release.objects.filter(
    (object) =>
      object.kind === reference.kind &&
      object.id === reference.id &&
      object.version === reference.version,
  );

  if (exactMatches.length !== 1) {
    throw new Error(
      `Clinic configuration ${reference.id}@${reference.version} must resolve exactly once`,
    );
  }

  const parsed = ClinicConfigV2Schema.safeParse(exactMatches[0]);
  if (!parsed.success) {
    throw new Error(
      `Active clinic configuration ${reference.id}@${reference.version} is not a v2 configuration`,
    );
  }
  return parsed.data;
}

export const clinicConfig = resolveClinicConfig(activeRelease);

export function clinicContactHref(
  config: ClinicConfigV2,
  route: ClinicContactRoute,
  actionabilityCheckedAt: string,
): string | null {
  const currentDate = calendarDateInTimeZone(
    actionabilityCheckedAt,
    config.identity.timezone,
  );
  const checkedTimestamp = Date.parse(actionabilityCheckedAt);
  if (
    config.mode !== "institutional" ||
    route.verification.status !== "verified" ||
    route.verification.verified_at === null ||
    route.verification.review_due === null ||
    currentDate === null ||
    Number.isNaN(checkedTimestamp) ||
    Date.parse(route.verification.verified_at) > checkedTimestamp ||
    route.verification.review_due < currentDate
  ) {
    return null;
  }
  return `tel:${route.normalized_value}`;
}

if (activeRelease.channel === "preview" && !activeRelease.mandatory_notice) {
  throw new Error("Preview release is missing its mandatory prototype notice");
}
