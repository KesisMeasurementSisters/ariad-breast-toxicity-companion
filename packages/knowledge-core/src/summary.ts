import type {
  SymptomSummaryRequest,
  SymptomSummaryResult,
} from "@ariad/contracts";
import { prohibitedRecommendationLanguage } from "./safety";

export function deterministicSummary(request: SymptomSummaryRequest): SymptomSummaryResult {
  return {
    title: `${request.symptomLabel} summary`,
    summaryItems: request.facts.map((fact) => ({
      text: `${fact.label}: ${fact.value}.`,
      sourceFieldIds: [fact.id],
    })),
    patientQuestions: [],
    omittedUncertainItems: [],
  };
}

export function validateSummaryProvenance(
  request: SymptomSummaryRequest,
  result: SymptomSummaryResult,
): { valid: true } | { valid: false; reason: string } {
  const fields = new Set(request.facts.map((fact) => fact.id));
  for (const item of result.summaryItems) {
    if (prohibitedRecommendationLanguage(item.text)) {
      return { valid: false, reason: "recommendation-language" };
    }
    if (item.sourceFieldIds.some((id) => !fields.has(id))) {
      return { valid: false, reason: "unknown-source-field" };
    }
  }
  return { valid: true };
}

