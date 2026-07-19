import { z } from "zod";
import { ContentStatusTransitionSchema, ReviewMetadataSchema } from "./governance";
import {
  ContentStatusSchema,
  IsoDateSchema,
  IsoDateTimeSchema,
  SemVerSchema,
  StableIdSchema,
  SupportStatusSchema,
  VersionedRefSchema,
  calendarDateInTimeZone,
} from "./primitives";

const SourceIdsSchema = z.array(StableIdSchema).min(1);
const AliasListSchema = z.array(z.string().min(1)).default([]);

const governedFields = {
  id: StableIdSchema,
  version: SemVerSchema,
  status: ContentStatusSchema,
  status_history: z.array(ContentStatusTransitionSchema).optional(),
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

export const EducationalModuleRefSchema = z
  .object({
    kind: z.literal("educational_module"),
    id: StableIdSchema,
    version: SemVerSchema,
  })
  .strict();

export const ClinicConfigRefSchema = z
  .object({
    kind: z.literal("clinic_config"),
    id: StableIdSchema,
    version: SemVerSchema,
  })
  .strict();

export const ClinicModeSchema = z.enum(["synthetic_demo", "institutional"]);

export const ClinicJurisdictionSchema = z
  .object({
    country_code: z.literal("CA"),
    subdivision_code: z
      .enum([
        "CA-AB",
        "CA-BC",
        "CA-MB",
        "CA-NB",
        "CA-NL",
        "CA-NS",
        "CA-NT",
        "CA-NU",
        "CA-ON",
        "CA-PE",
        "CA-QC",
        "CA-SK",
        "CA-YT",
      ])
      .nullable(),
  })
  .strict();

const IanaTimeZoneSchema = z.string().min(1).refine(
  (timeZone) => {
    try {
      new Intl.DateTimeFormat("en-CA", { timeZone }).format();
      return true;
    } catch {
      return false;
    }
  },
  { message: "Use a valid IANA time zone" },
);

const Bcp47LocaleSchema = z.string().min(2).refine(
  (locale) => {
    try {
      const canonical = Intl.getCanonicalLocales(locale);
      return canonical.length === 1 && canonical[0] === locale;
    } catch {
      return false;
    }
  },
  { message: "Use a valid BCP 47 locale" },
);

export const ClinicCareScopeSchema = z
  .object({
    tumour_site_ids: z.array(StableIdSchema).min(1),
    modality_ids: z.array(StableIdSchema).min(1),
  })
  .strict()
  .superRefine((scope, context) => {
    for (const field of ["tumour_site_ids", "modality_ids"] as const) {
      if (new Set(scope[field]).size !== scope[field].length) {
        context.addIssue({
          code: "custom",
          path: [field],
          message: `${field} values must be unique`,
        });
      }
    }
  });

export const ClinicIdentitySchema = z
  .object({
    display_name: z.string().min(2),
    jurisdiction: ClinicJurisdictionSchema,
    timezone: IanaTimeZoneSchema,
    locales: z.array(Bcp47LocaleSchema).min(1),
    care_scope: ClinicCareScopeSchema,
  })
  .strict()
  .superRefine((identity, context) => {
    if (new Set(identity.locales).size !== identity.locales.length) {
      context.addIssue({
        code: "custom",
        path: ["locales"],
        message: "Clinic locales must be unique",
      });
    }
  });

export const ClinicContactAvailabilitySchema = z.discriminatedUnion("state", [
  z.object({ state: z.literal("not_configured") }).strict(),
  z
    .object({
      state: z.literal("display_only"),
      label: z.string().min(2).max(160),
    })
    .strict(),
]);

export const ClinicContactVerificationSchema = z
  .object({
    status: z.enum(["synthetic_fixture", "unverified", "verified"]),
    method: z.string().min(2).max(160).nullable(),
    verified_by: z.string().min(2).max(160).nullable(),
    verified_at: IsoDateTimeSchema.nullable(),
    review_due: IsoDateSchema.nullable(),
  })
  .strict()
  .superRefine((verification, context) => {
    const evidenceFields = [
      ["method", verification.method],
      ["verified_by", verification.verified_by],
      ["verified_at", verification.verified_at],
      ["review_due", verification.review_due],
    ] as const;

    if (verification.status === "verified") {
      for (const [field, value] of evidenceFields) {
        if (value === null) {
          context.addIssue({
            code: "custom",
            path: [field],
            message: "Verified contact data requires complete verification evidence",
          });
        }
      }
    } else {
      for (const [field, value] of evidenceFields) {
        if (value !== null) {
          context.addIssue({
            code: "custom",
            path: [field],
            message: `${verification.status} contact data cannot carry verification evidence`,
          });
        }
      }
    }
  });

export const ClinicContactRouteSchema = z
  .object({
    id: StableIdSchema,
    role: z.enum(["daytime_team", "after_hours_team"]),
    channel: z.literal("phone"),
    label: z.string().min(2).max(160),
    display_value: z
      .string()
      .min(7)
      .max(80)
      .regex(/^\+?[0-9][0-9 .()-]*$/, "Use telephone-number characters only"),
    normalized_value: z
      .string()
      .regex(/^\+[1-9]\d{1,14}$/, "Use an E.164 telephone number"),
    availability: ClinicContactAvailabilitySchema,
    verification: ClinicContactVerificationSchema,
  })
  .strict();

export const ClinicPolicyBindingSchema = z
  .object({
    state: z.enum(["unresolved", "delegated_to_team", "configured"]),
    module_ref: EducationalModuleRefSchema.nullable(),
    destination_contact_ids: z.array(StableIdSchema),
    unresolved_reason: z.string().min(2).max(360).nullable(),
  })
  .strict()
  .superRefine((binding, context) => {
    if (binding.state === "unresolved") {
      if (binding.module_ref !== null) {
        context.addIssue({
          code: "custom",
          path: ["module_ref"],
          message: "An unresolved policy cannot reference an educational module",
        });
      }
      if (binding.unresolved_reason === null) {
        context.addIssue({
          code: "custom",
          path: ["unresolved_reason"],
          message: "An unresolved policy requires an unresolved_reason",
        });
      }
      if (binding.destination_contact_ids.length > 0) {
        context.addIssue({
          code: "custom",
          path: ["destination_contact_ids"],
          message: "An unresolved policy cannot select contact destinations",
        });
      }
    } else {
      if (binding.module_ref === null) {
        context.addIssue({
          code: "custom",
          path: ["module_ref"],
          message: `${binding.state} policy requires an exact educational-module reference`,
        });
      }
      if (binding.unresolved_reason !== null) {
        context.addIssue({
          code: "custom",
          path: ["unresolved_reason"],
          message: `${binding.state} policy cannot carry an unresolved_reason`,
        });
      }
      if (binding.destination_contact_ids.length === 0) {
        context.addIssue({
          code: "custom",
          path: ["destination_contact_ids"],
          message: `${binding.state} policy requires at least one contact destination`,
        });
      }
    }
  });

export const ClinicClinicalPolicyBindingsSchema = z
  .object({
    fever: ClinicPolicyBindingSchema,
    supportive_care: ClinicPolicyBindingSchema,
  })
  .strict();

const ClinicConfigV1VersionSchema = SemVerSchema.refine((version) => version.startsWith("1."), {
  message: "ClinicConfigV1 requires a 1.x semantic version",
});

const ClinicConfigV2VersionSchema = SemVerSchema.refine((version) => version.startsWith("2."), {
  message: "ClinicConfigV2 requires a 2.x semantic version",
});

export const ClinicConfigV1Schema = z
  .object({
    kind: z.literal("clinic_config"),
    ...governedFields,
    version: ClinicConfigV1VersionSchema,
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

export const ClinicConfigV2Schema = z
  .object({
    kind: z.literal("clinic_config"),
    ...governedFields,
    version: ClinicConfigV2VersionSchema,
    mode: ClinicModeSchema,
    identity: ClinicIdentitySchema,
    contact_routes: z.array(ClinicContactRouteSchema).min(2),
    clinical_policy_bindings: ClinicClinicalPolicyBindingsSchema,
    operational_source_ids: z.array(StableIdSchema),
  })
  .strict()
  .superRefine((clinic, context) => {
    const contactIds = new Set<string>();

    clinic.contact_routes.forEach((contact, index) => {
      if (contactIds.has(contact.id)) {
        context.addIssue({
          code: "custom",
          path: ["contact_routes", index, "id"],
          message: `Duplicate clinic contact route id: ${contact.id}`,
        });
      }
      contactIds.add(contact.id);

      const displayDigits = contact.display_value.replace(/\D/gu, "");
      const normalizedDigits = contact.normalized_value.slice(1);
      const nationalDigits =
        clinic.identity.jurisdiction.country_code === "CA" && normalizedDigits.startsWith("1")
          ? normalizedDigits.slice(1)
          : normalizedDigits;
      if (displayDigits !== normalizedDigits && displayDigits !== nationalDigits) {
        context.addIssue({
          code: "custom",
          path: ["contact_routes", index, "display_value"],
          message: "Displayed telephone number must match the normalized E.164 value",
        });
      }

      if (
        clinic.mode === "synthetic_demo" &&
        contact.verification.status !== "synthetic_fixture"
      ) {
        context.addIssue({
          code: "custom",
          path: ["contact_routes", index, "verification", "status"],
          message: "Synthetic-demo contacts must be marked synthetic_fixture",
        });
      }
      if (
        clinic.mode === "institutional" &&
        contact.verification.status === "synthetic_fixture"
      ) {
        context.addIssue({
          code: "custom",
          path: ["contact_routes", index, "verification", "status"],
          message: "Institutional contacts cannot be marked synthetic_fixture",
        });
      }

      if (
        contact.verification.status === "verified" &&
        contact.verification.verified_at !== null &&
        contact.verification.review_due !== null
      ) {
        const verifiedDate = calendarDateInTimeZone(
          contact.verification.verified_at,
          clinic.identity.timezone,
        );
        if (
          verifiedDate === null ||
          contact.verification.review_due < verifiedDate
        ) {
          context.addIssue({
            code: "custom",
            path: ["contact_routes", index, "verification", "review_due"],
            message: "Contact review_due cannot precede the clinic-local verification date",
          });
        }
      }
    });

    for (const role of ["daytime_team", "after_hours_team"] as const) {
      if (clinic.contact_routes.filter((contact) => contact.role === role).length !== 1) {
        context.addIssue({
          code: "custom",
          path: ["contact_routes"],
          message: `Clinic configuration requires exactly one ${role} contact`,
        });
      }
    }

    for (const [policyName, binding] of Object.entries(clinic.clinical_policy_bindings)) {
      if (new Set(binding.destination_contact_ids).size !== binding.destination_contact_ids.length) {
        context.addIssue({
          code: "custom",
          path: ["clinical_policy_bindings", policyName, "destination_contact_ids"],
          message: "Clinic policy destinations must be unique",
        });
      }
      binding.destination_contact_ids.forEach((contactId, index) => {
        if (!contactIds.has(contactId)) {
          context.addIssue({
            code: "custom",
            path: [
              "clinical_policy_bindings",
              policyName,
              "destination_contact_ids",
              index,
            ],
            message: `Unknown clinic contact route id: ${contactId}`,
          });
        }
      });
    }
  });

export const ClinicConfigSchema = z.union([ClinicConfigV2Schema, ClinicConfigV1Schema]);

export const KnowledgeObjectSchema = z.union([
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
export type EducationalModuleRef = z.infer<typeof EducationalModuleRefSchema>;
export type ClinicConfigRef = z.infer<typeof ClinicConfigRefSchema>;
export type ClinicMode = z.infer<typeof ClinicModeSchema>;
export type ClinicJurisdiction = z.infer<typeof ClinicJurisdictionSchema>;
export type ClinicCareScope = z.infer<typeof ClinicCareScopeSchema>;
export type ClinicIdentity = z.infer<typeof ClinicIdentitySchema>;
export type ClinicContactAvailability = z.infer<typeof ClinicContactAvailabilitySchema>;
export type ClinicContactVerification = z.infer<typeof ClinicContactVerificationSchema>;
export type ClinicContactRoute = z.infer<typeof ClinicContactRouteSchema>;
export type ClinicPolicyBinding = z.infer<typeof ClinicPolicyBindingSchema>;
export type ClinicClinicalPolicyBindings = z.infer<
  typeof ClinicClinicalPolicyBindingsSchema
>;
export type ClinicConfigV1 = z.infer<typeof ClinicConfigV1Schema>;
export type ClinicConfigV2 = z.infer<typeof ClinicConfigV2Schema>;
export type ClinicConfig = z.infer<typeof ClinicConfigSchema>;
export type KnowledgeObject = z.infer<typeof KnowledgeObjectSchema>;
