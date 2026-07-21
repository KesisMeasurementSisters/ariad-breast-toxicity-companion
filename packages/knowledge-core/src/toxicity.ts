import type {
  CompiledRelease,
  Drug,
  DrugToxicityPresentation,
} from "@ariad/contracts";
import { regimenComponentDrugs } from "./search";

export interface RegimenDrugToxicityItem {
  drug: Drug;
  presentation: DrugToxicityPresentation | null;
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
