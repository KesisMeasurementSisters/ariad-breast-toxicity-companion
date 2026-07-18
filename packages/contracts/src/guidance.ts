import { z } from "zod";
import { ModuleSectionSchema } from "./objects";
import { StableIdSchema, SupportStatusSchema } from "./primitives";

export const GuidanceSectionSchema = z
  .object({
    section: ModuleSectionSchema,
    heading: z.string().min(2),
    module_ids: z.array(StableIdSchema),
    emphasized_module_ids: z.array(StableIdSchema),
    source_ids: z.array(StableIdSchema),
  })
  .strict();

export const AssembledGuidanceSchema = z
  .object({
    release_id: StableIdSchema,
    relationship_id: StableIdSchema,
    treatment_id: StableIdSchema,
    symptom_id: StableIdSchema,
    exact_treatment_support: SupportStatusSchema,
    guidance_basis: z.enum(["exact", "component", "class", "general"]),
    guidance_basis_label: z.string().min(1),
    fallback_reason: z.string().nullable(),
    question_ids: z.array(StableIdSchema),
    sections: z.array(GuidanceSectionSchema),
    source_ids: z.array(StableIdSchema),
  })
  .strict();

export type GuidanceSection = z.infer<typeof GuidanceSectionSchema>;
export type AssembledGuidance = z.infer<typeof AssembledGuidanceSchema>;

