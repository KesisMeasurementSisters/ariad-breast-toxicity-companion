import { z } from "zod";
import {
  ContentStatusSchema,
  IsoDateSchema,
  IsoDateTimeSchema,
  StableIdSchema,
  VersionedRefSchema,
} from "./primitives";

export const ReviewMetadataSchema = z
  .object({
    reviewer: z.string().min(2).nullable(),
    reviewed_at: IsoDateTimeSchema.nullable(),
    review_due: IsoDateSchema.nullable(),
    approval_id: StableIdSchema.nullable().default(null),
  })
  .strict();

export const GovernedMetadataSchema = z
  .object({
    status: ContentStatusSchema,
    review: ReviewMetadataSchema,
    supersedes: VersionedRefSchema.nullable().default(null),
    superseded_by: VersionedRefSchema.nullable().default(null),
  })
  .strict();

export const ContentApprovalSchema = z
  .object({
    kind: z.literal("content_approval"),
    id: StableIdSchema,
    subject: VersionedRefSchema,
    subject_payload_hash: z.string().regex(/^[a-f0-9]{64}$/),
    decision: z.literal("approved"),
    reviewer: z.string().min(2),
    reviewed_at: IsoDateTimeSchema,
    review_due: IsoDateSchema.nullable(),
  })
  .strict();

export const ReleaseApprovalSchema = z
  .object({
    kind: z.literal("release_approval"),
    id: StableIdSchema,
    release_id: StableIdSchema,
    candidate_payload_hash: z.string().regex(/^[a-f0-9]{64}$/),
    decision: z.literal("approved_for_publication"),
    reviewer: z.string().min(2),
    reviewed_at: IsoDateTimeSchema,
  })
  .strict();

export type ReviewMetadata = z.infer<typeof ReviewMetadataSchema>;
export type ContentApproval = z.infer<typeof ContentApprovalSchema>;
export type ReleaseApproval = z.infer<typeof ReleaseApprovalSchema>;

