import type {
  SymptomSummaryRequest,
  SymptomSummaryResult,
} from "@ariad/contracts";
import { prohibitedRecommendationLanguage } from "./safety";

const UNTRUSTED_INSTRUCTION_PATTERN =
  /\b(?:ignore (?:all |any )?(?:previous |prior )?instructions?|system prompt|developer message|you should|we recommend|stop taking|hold (?:the |your )?(?:dose|medication|treatment)|reduce (?:the |your )?dose)\b/iu;

const UNTRUSTED_CLINICAL_INTERPRETATION_PATTERN =
  /\b(?:grade(?:d)?(?:\s*[0-5])?|diagnos(?:e|ed|is)|toxicit(?:y|ies)|caused by|due to|because of|i (?:have|had|am)|this (?:is|was)|it (?:is|was))\b/iu;

export function isSafeSummaryFactValue(value: string): boolean {
  return (
    !prohibitedRecommendationLanguage(value) &&
    !UNTRUSTED_INSTRUCTION_PATTERN.test(value) &&
    !UNTRUSTED_CLINICAL_INTERPRETATION_PATTERN.test(value) &&
    !/[<>\u0000-\u0008\u000B\u000C\u000E-\u001F]/u.test(value)
  );
}

export function deterministicSummary(request: SymptomSummaryRequest): SymptomSummaryResult {
  const safeFacts = request.facts.filter((fact) => isSafeSummaryFactValue(fact.value));
  const omittedFacts = request.facts.filter((fact) => !isSafeSummaryFactValue(fact.value));
  return {
    title: `${request.symptomLabel} summary`,
    summaryItems:
      safeFacts.length > 0
        ? safeFacts.map((fact) => ({
            text: `${fact.label}: ${fact.value}.`,
            sourceFieldIds: [fact.id],
          }))
        : omittedFacts.map((fact) => ({
            text: `${fact.label}: A patient-entered response was omitted because it could not be restated safely.`,
            sourceFieldIds: [fact.id],
          })),
    patientQuestions: [],
    omittedUncertainItems: omittedFacts.map((fact) => fact.label),
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
