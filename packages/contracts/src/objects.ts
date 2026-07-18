import { z } from "zod";
import { ReviewMetadataSchema } from "./governance";
import {
  ContentStatusSchema,
  IsoDateSchema,
  SemVerSchema,
  StableIdSchema,
  SupportStatusSchema,
  VersionedRefSchema,
} from "./primitives";

const SourceIdsSchema = z.array(StableIdSchema).min(1);
const AliasListSchema = z.array(z.string().min(1)).default([]);

const governedFields = {
  id: StableIdSchema,
  version: SemVerSchema,
  status: ContentStatusSchema,
  review: ReviewMetadataSchema,
  supersedes: VersionedRefSchema.nullable().default(null),
  superseded_by: VersionedRefSchema.nullable().default(null),
};

export const TreatmentClassSchema = z
  .object({
    kind: z.literal("treatment_class"),
    ...governedFields,
    display_name: z.string().min(2),
    aliases: AliasListSchema,
    parent_class_ids: z.array(StableIdSchema).default([]),
    description_module_ids: z.array(StableIdSchema).default([]),
    source_ids: SourceIdsSchema,
  })
  .strict();

export const DrugSchema = z
  .object({
    kind: z.literal("drug"),
    ...governedFields,
    generic_name: z.string().min(2),
    brand_names: AliasListSchema,
    aliases: AliasListSchema,
    class_ids: z.array(StableIdSchema).min(1),
    routes: z.array(z.enum(["oral", "intravenous", "subcutaneous", "intramuscular"])).min(1),
    source_ids: SourceIdsSchema,
    support_status: SupportStatusSchema,
  })
  .strict();

export const RegimenSchema = z
  .object({
    kind: z.literal("regimen"),
    ...governedFields,
    display_name: z.string().min(2),
    abbreviation: z.string().min(1).nullable(),
    aliases: AliasListSchema,
    component_drug_ids: z.array(StableIdSchema).min(1),
    class_ids: z.array(StableIdSchema).min(1),
    context_tags: z.array(z.string().min(1)).min(1),
    source_ids: SourceIdsSchema,
    support_status: SupportStatusSchema,
  })
  .strict();

export const SymptomSchema = z
  .object({
    kind: z.literal("symptom"),
    ...governedFields,
    patient_label: z.string().min(2),
    clinical_label: z.string().min(2),
    synonyms: AliasListSchema,
    navigation_terms: AliasListSchema,
    body_system_tags: z.array(z.string().min(1)).min(1),
    observable_feature_ids: z.array(StableIdSchema).default([]),
    general_module_ids: z.array(StableIdSchema).default([]),
    source_ids: SourceIdsSchema,
    concept_kind: z.enum(["patient_observable", "laboratory", "clinician_only"]),
    support_status: SupportStatusSchema,
  })
  .strict();

export const AnswerOptionSchema = z
  .object({
    value: z.string().min(1).max(80),
    label: z.string().min(1).max(160),
    summary_text: z.string().min(1).max(240),
    priority_tags: z.array(z.string().min(1)).default([]),
  })
  .strict();

export const ObservableFeatureSchema = z
  .object({
    kind: z.literal("observable_feature"),
    ...governedFields,
    patient_wording: z.string().min(2),
    answer_type: z.enum(["single_choice", "multi_choice", "boolean", "number", "short_text"]),
    options: z.array(AnswerOptionSchema).default([]),
    summary_field: z.string().min(1),
    relevance_tags: z.array(z.string().min(1)).default([]),
    source_ids: z.array(StableIdSchema).default([]),
  })
  .strict();

export const QuestionSchema = z
  .object({
    kind: z.literal("question"),
    ...governedFields,
    symptom_ids: z.array(StableIdSchema).min(1),
    feature_id: StableIdSchema,
    prompt: z.string().min(4),
    help_text: z.string().max(360).nullable(),
    answer_type: z.enum(["single_choice", "multi_choice", "boolean", "number", "short_text"]),
    options: z.array(AnswerOptionSchema).default([]),
    optional: z.boolean().default(false),
    summary_label: z.string().min(1),
    priority_tags: z.array(z.string().min(1)).default([]),
    prohibited_interpretation_notes: z.array(z.string().min(1)).min(1),
    source_ids: z.array(StableIdSchema).default([]),
  })
  .strict();

export const ModuleSectionSchema = z.enum([
  "about",
  "treatment_context",
  "home_management",
  "contact_team",
  "urgent_attention",
  "reporting_checklist",
  "preparation",
  "terminology",
  "unsupported_fallback",
]);

export const EducationalModuleSchema = z
  .object({
    kind: z.literal("educational_module"),
    ...governedFields,
    audience: z.literal("patient"),
    jurisdiction: z.string().min(2),
    section: ModuleSectionSchema,
    title: z.string().min(2),
    paragraphs: z.array(z.string().min(2)).default([]),
    bullets: z.array(z.string().min(2)).default([]),
    applicability: z
      .object({
        treatment_ids: z.array(StableIdSchema).default([]),
        symptom_ids: z.array(StableIdSchema).default([]),
      })
      .strict(),
    priority_tags: z.array(z.string().min(1)).default([]),
    source_ids: SourceIdsSchema,
    claim_ids: z.array(StableIdSchema).min(1),
    placeholders: z.array(z.string().min(1)).default([]),
    review_due: IsoDateSchema.nullable(),
  })
  .strict()
  .refine((module) => module.paragraphs.length + module.bullets.length > 0, {
    message: "A patient-facing module must contain at least one paragraph or bullet",
  });

export const RelationshipModuleSlotsSchema = z
  .object({
    about: z.array(StableIdSchema).min(1),
    treatment_context: z.array(StableIdSchema).min(1),
    home_management: z.array(StableIdSchema).min(1),
    contact_team: z.array(StableIdSchema).min(1),
    urgent_attention: z.array(StableIdSchema).min(1),
    reporting_checklist: z.array(StableIdSchema).min(1),
  })
  .strict();

export const TreatmentToxicityRelationshipSchema = z
  .object({
    kind: z.literal("treatment_toxicity_relationship"),
    ...governedFields,
    treatment_kind: z.enum(["treatment_class", "drug", "regimen"]),
    treatment_id: StableIdSchema,
    symptom_id: StableIdSchema,
    relationship_type: z.enum(["associated_with", "class_general", "general_safety"]),
    support_status: SupportStatusSchema,
    frequency_band: z.string().min(1).nullable(),
    seriousness_flags: z.array(z.string().min(1)).default([]),
    timing: z.string().min(1).nullable(),
    modules: RelationshipModuleSlotsSchema.nullable(),
    question_ids: z.array(StableIdSchema).default([]),
    source_ids: SourceIdsSchema,
  })
  .strict()
  .superRefine((relationship, context) => {
    if (relationship.support_status === "full_guidance") {
      if (!relationship.modules) {
        context.addIssue({ code: "custom", message: "Full guidance requires all module slots" });
      }
      if (relationship.question_ids.length < 3 || relationship.question_ids.length > 7) {
        context.addIssue({ code: "custom", message: "Full guidance requires 3–7 questions" });
      }
    } else if (relationship.modules) {
      context.addIssue({
        code: "custom",
        message: "Only full-guidance relationships may define complete guidance slots",
      });
    }
  });

export const SourceSchema = z
  .object({
    kind: z.literal("source"),
    id: StableIdSchema,
    version: SemVerSchema,
    title: z.string().min(2),
    organization: z.string().min(2),
    canonical_url: z.string().url().refine((url) => url.startsWith("https://"), {
      message: "Source links must use HTTPS",
    }),
    source_type: z.enum([
      "patient_information",
      "product_monograph",
      "clinical_guidance",
      "regimen_information",
      "safety_information",
    ]),
    jurisdiction: z.string().min(2),
    publication_or_revision_date: IsoDateSchema.nullable(),
    accessed_date: IsoDateSchema,
    source_version: z.string().min(1).nullable(),
    permitted_excerpt: z.string().max(280).nullable(),
    notes: z.array(z.string().min(1)).default([]),
    verification_status: z.enum(["verified", "link_only", "unavailable", "retired"]),
  })
  .strict();

export const ClinicConfigSchema = z
  .object({
    kind: z.literal("clinic_config"),
    ...governedFields,
    clinic_name: z.string().min(2),
    synthetic: z.literal(true),
    daytime_contact: z.string().min(2),
    after_hours_contact: z.string().min(2),
    emergency_statement: z.string().min(2),
    fever_instruction: z.string().min(2),
    supportive_care_note: z.string().min(2),
    source_ids: z.array(StableIdSchema).default([]),
  })
  .strict();

export const KnowledgeObjectSchema = z.discriminatedUnion("kind", [
  TreatmentClassSchema,
  DrugSchema,
  RegimenSchema,
  SymptomSchema,
  ObservableFeatureSchema,
  QuestionSchema,
  EducationalModuleSchema,
  TreatmentToxicityRelationshipSchema,
  SourceSchema,
  ClinicConfigSchema,
]);

export type TreatmentClass = z.infer<typeof TreatmentClassSchema>;
export type Drug = z.infer<typeof DrugSchema>;
export type Regimen = z.infer<typeof RegimenSchema>;
export type Symptom = z.infer<typeof SymptomSchema>;
export type ObservableFeature = z.infer<typeof ObservableFeatureSchema>;
export type Question = z.infer<typeof QuestionSchema>;
export type EducationalModule = z.infer<typeof EducationalModuleSchema>;
export type TreatmentToxicityRelationship = z.infer<
  typeof TreatmentToxicityRelationshipSchema
>;
export type Source = z.infer<typeof SourceSchema>;
export type ClinicConfig = z.infer<typeof ClinicConfigSchema>;
export type KnowledgeObject = z.infer<typeof KnowledgeObjectSchema>;

