import {
  CompiledReleaseSchema,
  type ClinicConfig,
  type CompiledRelease,
  type Drug,
  type EducationalModule,
  type KnowledgeObject,
  type Question,
  type Regimen,
  type Source,
  type Symptom,
  type TreatmentClass,
  type TreatmentToxicityRelationship,
} from "@ariad/contracts";
import rawRelease from "@/generated/release.json";

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

export const clinicConfig = activeRelease.objects.find(
  (object): object is ClinicConfig => object.kind === "clinic_config",
);

if (activeRelease.channel === "preview" && !activeRelease.mandatory_notice) {
  throw new Error("Preview release is missing its mandatory prototype notice");
}

