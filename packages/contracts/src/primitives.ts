import { z } from "zod";

export function calendarDateInTimeZone(value: string, timeZone: string): string | null {
  const date = new Date(value);
  if (Number.isNaN(date.getTime())) return null;
  try {
    const parts = new Intl.DateTimeFormat("en-CA", {
      day: "2-digit",
      month: "2-digit",
      timeZone,
      year: "numeric",
    }).formatToParts(date);
    const part = (type: "year" | "month" | "day") =>
      parts.find((candidate) => candidate.type === type)?.value;
    const year = part("year");
    const month = part("month");
    const day = part("day");
    return year && month && day ? `${year}-${month}-${day}` : null;
  } catch {
    return null;
  }
}

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
  .regex(/^\d{4}-\d{2}-\d{2}$/, "Use YYYY-MM-DD dates")
  .refine(
    (value) => {
      const date = new Date(`${value}T00:00:00.000Z`);
      return !Number.isNaN(date.getTime()) && date.toISOString().slice(0, 10) === value;
    },
    "Use a real calendar date",
  );

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
  "drug_toxicity_evidence",
  "drug_toxicity_presentation",
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
export type ContentStatus = z.infer<typeof ContentStatusSchema>;
