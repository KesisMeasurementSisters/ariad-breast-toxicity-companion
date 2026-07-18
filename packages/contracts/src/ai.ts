import { z } from "zod";
import { StableIdSchema } from "./primitives";

export const SymptomClassifierRequestSchema = z
  .object({
    text: z.string().trim().min(2).max(500),
  })
  .strict();

export const SymptomCandidateSchema = z
  .object({
    symptomId: StableIdSchema,
    confidence: z.number().min(0).max(1),
    supportingPhrases: z.array(z.string().min(1).max(100)).max(4),
  })
  .strict();

export const SymptomClassifierResultSchema = z
  .object({
    candidates: z.array(SymptomCandidateSchema).max(3),
    needsClarification: z.boolean(),
    clarificationQuestion: z.string().min(1).max(180).optional(),
    outOfScope: z.boolean(),
    reasonCode: z.enum([
      "matched",
      "ambiguous",
      "unsupported",
      "non_symptom_request",
      "insufficient_information",
    ]),
  })
  .strict();

export const SummaryFactSchema = z
  .object({
    id: StableIdSchema,
    label: z.string().min(1).max(120),
    value: z.string().min(1).max(300),
  })
  .strict();

export const SymptomSummaryRequestSchema = z
  .object({
    symptomId: StableIdSchema,
    symptomLabel: z.string().min(1).max(120),
    treatmentId: StableIdSchema,
    treatmentLabel: z.string().min(1).max(160),
    facts: z.array(SummaryFactSchema).min(1).max(12),
  })
  .strict();

export const SymptomSummaryResultSchema = z
  .object({
    title: z.string().min(1).max(120),
    summaryItems: z
      .array(
        z
          .object({
            text: z.string().min(1).max(360),
            sourceFieldIds: z.array(StableIdSchema).min(1).max(6),
          })
          .strict(),
      )
      .min(1)
      .max(12),
    patientQuestions: z.array(z.string().min(1).max(240)).max(4),
    omittedUncertainItems: z.array(z.string().min(1).max(240)).max(8),
  })
  .strict();

export type SymptomClassifierRequest = z.infer<typeof SymptomClassifierRequestSchema>;
export type SymptomClassifierResult = z.infer<typeof SymptomClassifierResultSchema>;
export type SymptomSummaryRequest = z.infer<typeof SymptomSummaryRequestSchema>;
export type SymptomSummaryResult = z.infer<typeof SymptomSummaryResultSchema>;

