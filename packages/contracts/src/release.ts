import { z } from "zod";
import { ClinicConfigRefSchema, KnowledgeObjectSchema } from "./objects";
import { IsoDateTimeSchema, SemVerSchema, StableIdSchema, VersionedRefSchema } from "./primitives";

export const PREVIEW_ACKNOWLEDGEMENT = "ARIAD_EXPLICIT_UNREVIEWED_PREVIEW" as const;
export const PREVIEW_NOTICE = "Unreviewed prototype content — not for clinical use" as const;

export const ContentReleaseManifestSchema = z
  .object({
    release_id: StableIdSchema,
    version: SemVerSchema,
    channel: z.enum(["preview", "published"]),
    publication_status: z.enum(["draft", "approved", "published"]),
    clinical_use: z.boolean(),
    generated_at: IsoDateTimeSchema,
    included_objects: z.array(VersionedRefSchema).min(1),
    clinic_config: ClinicConfigRefSchema,
    source_inventory: z.array(StableIdSchema).min(1),
    reviewer_metadata: z
      .object({
        reviewer: z.string().min(2).nullable(),
        reviewed_at: IsoDateTimeSchema.nullable(),
        release_approval_id: StableIdSchema.nullable(),
      })
      .strict(),
    known_gaps: z.array(z.string().min(1)),
    release_notes: z.array(z.string().min(1)),
  })
  .strict();

export const SearchRecordSchema = z
  .object({
    id: StableIdSchema,
    kind: z.enum(["treatment_class", "drug", "regimen", "symptom"]),
    display_name: z.string().min(1),
    normalized_name: z.string(),
    aliases: z.array(z.string()),
    normalized_aliases: z.array(z.string()),
    support_status: z.enum(["full_guidance", "education_only", "catalogued", "unsupported"]),
  })
  .strict();

export const CompiledReleaseSchema = z
  .object({
    schema_version: SemVerSchema,
    compiler_version: SemVerSchema,
    safety_ruleset_version: SemVerSchema,
    release_id: StableIdSchema,
    release_version: SemVerSchema,
    channel: z.enum(["preview", "published"]),
    clinical_use: z.boolean(),
    contains_unapproved_content: z.boolean(),
    mandatory_notice: z.string().min(1).nullable(),
    generated_at: IsoDateTimeSchema,
    content_hash: z.string().regex(/^[a-f0-9]{64}$/),
    approval_summary: z
      .object({
        draft: z.number().int().nonnegative(),
        in_review: z.number().int().nonnegative(),
        approved: z.number().int().nonnegative(),
        retired: z.number().int().nonnegative(),
      })
      .strict(),
    objects: z.array(KnowledgeObjectSchema),
    clinic_config: ClinicConfigRefSchema,
    indexes: z
      .object({
        treatments: z.array(SearchRecordSchema),
        symptoms: z.array(SearchRecordSchema),
        relationships_by_treatment: z.record(z.string(), z.array(StableIdSchema)),
        relationships_by_symptom: z.record(z.string(), z.array(StableIdSchema)),
      })
      .strict(),
    source_inventory: z.array(StableIdSchema),
    known_gaps: z.array(z.string()),
    release_notes: z.array(z.string()),
  })
  .strict();

export type ContentReleaseManifest = z.infer<typeof ContentReleaseManifestSchema>;
export type CompiledRelease = z.infer<typeof CompiledReleaseSchema>;
export type SearchRecord = z.infer<typeof SearchRecordSchema>;
