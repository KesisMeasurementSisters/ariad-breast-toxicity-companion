import type {
  CompiledRelease,
  Drug,
  DrugToxicityPresentation,
  PatientToxicityEffect,
  TreatmentToxicityRelationship,
} from "@ariad/contracts";
import { regimenComponentDrugs } from "./search";

export interface RegimenDrugToxicityItem {
  drug: Drug;
  presentation: DrugToxicityPresentation | null;
}

export interface DrugSymptomListing {
  drug: Drug;
  presentation: DrugToxicityPresentation;
  effects: PatientToxicityEffect[];
  relationship: TreatmentToxicityRelationship;
}

export function toxicityPresentationForDrug(
  release: CompiledRelease,
  drugId: string,
): DrugToxicityPresentation | null {
  return release.objects.find(
    (object): object is DrugToxicityPresentation =>
      object.kind === "drug_toxicity_presentation" && object.drug_id === drugId,
  ) ?? null;
}

/**
 * Return source-controlled drug pages that explicitly map one or more of their
 * patient effect rows to a symptom concept. Schedule and regimen relationships
 * are intentionally excluded so a drug listing is never treated as evidence
 * about a particular treatment plan.
 */
export function drugSymptomListings(
  release: CompiledRelease,
  symptomId: string,
): DrugSymptomListing[] {
  const drugs = new Map(
    release.objects
      .filter((object): object is Drug => object.kind === "drug")
      .map((drug) => [drug.id, drug]),
  );
  const presentations = new Map(
    release.objects
      .filter(
        (object): object is DrugToxicityPresentation =>
          object.kind === "drug_toxicity_presentation",
      )
      .map((presentation) => [
        `${presentation.kind}:${presentation.id}@${presentation.version}`,
        presentation,
      ]),
  );

  return release.objects
    .filter(
      (object): object is TreatmentToxicityRelationship =>
        object.kind === "treatment_toxicity_relationship" &&
        object.symptom_id === symptomId &&
        object.treatment_kind === "drug" &&
        object.relationship_type === "associated_with" &&
        object.support_status === "education_only" &&
        object.toxicity_presentation_ref !== null &&
        object.presentation_effect_ids.length > 0,
    )
    .flatMap((relationship) => {
      const drug = drugs.get(relationship.treatment_id);
      const reference = relationship.toxicity_presentation_ref;
      if (!drug || !reference) return [];
      const presentation = presentations.get(
        `${reference.kind}:${reference.id}@${reference.version}`,
      );
      if (!presentation || presentation.drug_id !== drug.id) return [];
      const effectIds = new Set(relationship.presentation_effect_ids);
      const effects = presentation.effects.filter((effect) => effectIds.has(effect.id));
      if (effects.length !== effectIds.size) return [];
      return [{ drug, presentation, effects, relationship }];
    })
    .sort(
      (left, right) =>
        left.drug.generic_name.localeCompare(right.drug.generic_name, "en-CA") ||
        left.drug.id.localeCompare(right.drug.id),
    );
}

/**
 * Compose a regimen from independent, source-bound single-drug presentations.
 * A missing presentation remains an explicit null rather than borrowing data
 * from another component or from a combination arm.
 */
export function regimenDrugToxicityItems(
  release: CompiledRelease,
  regimenId: string,
): RegimenDrugToxicityItem[] {
  return regimenComponentDrugs(release, regimenId).map((drug) => ({
    drug,
    presentation: toxicityPresentationForDrug(release, drug.id),
  }));
}
