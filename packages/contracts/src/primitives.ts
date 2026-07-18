import { z } from "zod";

export const StableIdSchema = z
  .string()
  .min(2)
  .max(120)
  .regex(/^[a-z0-9]+(?:-[a-z0-9]+)*$/, "Use lowercase kebab-case IDs");

export const SemVerSchema = z
  .string()
  .regex(/^\d+\.\d+\.\d+(?:-[0-9A-Za-z.-]+)?$/, "Use semantic versions");

export const IsoDateSchema = z
  .string()
  .regex(/^\d{4}-\d{2}-\d{2}$/, "Use YYYY-MM-DD dates");

export const IsoDateTimeSchema = z.string().datetime({ offset: true });

export const ObjectKindSchema = z.enum([
  "treatment_class",
  "drug",
  "regimen",
  "symptom",
  "observable_feature",
  "question",
  "educational_module",
  "treatment_toxicity_relationship",
  "source",
  "clinic_config",
]);

export const VersionedRefSchema = z
  .object({
    kind: ObjectKindSchema,
    id: StableIdSchema,
    version: SemVerSchema,
  })
  .strict();

export const SupportStatusSchema = z.enum([
  "full_guidance",
  "education_only",
  "catalogued",
  "unsupported",
]);

export const ContentStatusSchema = z.enum([
  "draft",
  "in_review",
  "approved",
  "retired",
]);

export type StableId = z.infer<typeof StableIdSchema>;
export type VersionedRef = z.infer<typeof VersionedRefSchema>;
export type SupportStatus = z.infer<typeof SupportStatusSchema>;
export type ObjectKind = z.infer<typeof ObjectKindSchema>;
