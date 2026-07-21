# Content governance

## Current state: draft preview only

The repository contains no clinician-approved or published clinical content.

- The active release contains 190 governed objects, all `draft`.
- The repository review queue contains 218 governed object versions: 190 active
  release objects, the retained v1 clinic configuration, and 27 private draft
  toxicity-evidence records. The active release pins neither the v1 clinic
  object nor the private evidence payloads.
- 22 patient-facing modules are `draft`.
- Approved patient-facing modules: **0**.
- Reviewer identities: **none recorded**.
- Clinical review dates: **none recorded**.
- Content/release approval records: **none**.
- Two modules retain unresolved fever placeholders, and the v2 clinic's fever
  and supportive-care policy bindings remain `unresolved`.
- The active release is `preview`, `publication_status: draft`, and
  `clinical_use: false`.
- The active release is `build-week-preview-2026-07-18@0.7.0`, with content hash
  `1b112e16129cffb14528ecd727a57a8aa19e79fa8c9bc8fe1745703e9144c43c`.
- Twenty-six FDA-based drug records are `event_mapped`; 26 remain
  `source_indexed`. Carboplatin has a separate cross-indication FDA single-agent
  evidence map; cyclophosphamide has a non-numerical FDA label-category map.
- The release contains 27 patient-safe drug presentations whose exact evidence
  references and payload hashes are validated at build time. None has been
  clinically reviewed or approved. Numerical frequencies, severity values,
  laboratory cut-offs, and dose context are excluded from the browser release.

The generated [review report](../content/review-report.md) is the current review
queue. Generating the report, validating content, or compiling a preview does
not approve anything. The structured clinic schema and its operational
verification fields likewise do not establish clinical review or approval.

The existing [clinician review brief](./clinical-review-brief.md) and
[review record](./reviews/ARIAD-CRR-2026-001.md) remain immutably bound to the
older `0.2.0` release and do not review or approve `0.7.0`. Freeze a new commit,
tree, release hash, compiled-file hash, and exact inventory before beginning any
review of the current release. Use the snapshot-neutral [review record
template](./templates/clinician-review-record-template.md) without conflating
clinical review with release or testing authorization.

## Lifecycle

```text
Draft → Clinical review → Approved → Included in exact release → Published
```

Status transitions are human governance decisions. GPT-5.6 and the compiler
have no authority to review or approve content. Reviewer identity, decision
time, and approval evidence must reflect a real action by the named clinician
owner; they may never be invented to make a build pass.

The longer-term Nyx lifecycle adds assigned review, safety review,
surveillance, change request, supersession, and retirement. Those workflows are
preserved as seams, not implemented as a Build Week admin system.

## Repository review workflow

1. **Draft or edit a new version.** Keep patient wording, applicability,
   jurisdiction, sources, claim IDs, and known placeholders diff-friendly in
   `content/`.
2. **Validate mechanically.** Run `pnpm content:validate`,
   `pnpm safety:scan`, `pnpm content:report`, and the relevant golden tests.
3. **Review the evidence.** The clinician owner checks every claim against its
   linked source, jurisdiction, date/version, selected wording, and any
   discrepancy notes.
4. **Edit or reject.** Clinical wording is changed in source YAML, not in the
   compiled release. Re-run validation and inspect the diff.
5. **Record a genuine content decision.** Only after review, create approval
   evidence with the real reviewer, timestamp, exact subject version, and
   payload hash; update the object's review metadata and status prospectively.
6. **Prepare an exact release candidate.** Pin approved object versions and a
   verified source inventory. Resolve all placeholders and known gaps that
   block publication.
7. **Record a genuine release decision.** The owner reviews the complete
   candidate and records release-approval evidence for that exact payload.
8. **Compile and verify.** Use the ordinary production command, verify the
   content hash, run all golden/safety/UI checks, and retain the artifact and
   approval evidence.

Before a first clinical release, strengthen and independently verify the full
approval-record/hash binding and release rollback procedure. The current
schemas reserve payload hashes and the compiler enforces preview/published
content gates, but the Build Week artifact has deliberately exercised only the
draft-preview path.

## Compiler gates

Repository validation rejects malformed schemas, duplicate exact object keys,
broken references, treatment-class cycles, incomplete full-guidance
relationships, missing source links, invalid approval metadata, and safety-scan
findings. It also requires a single exact clinic-config reference, validates
contact-role and verification coherence, resolves any policy module by exact
version, scans clinic display fields for prohibited language, and exposes no v2
field for patient-facing clinical instructions.

Preview compilation additionally requires:

- `channel: preview`;
- `publication_status: draft`;
- `clinical_use: false`;
- exact acknowledgement
  `ALLOW_DRAFT_CONTENT=ARIAD_EXPLICIT_UNREVIEWED_PREVIEW`.

It produces the mandatory notice “Unreviewed prototype content — not for
clinical use.” The preview is content-addressed and immutable, but immutability
does not imply approval.

Published compilation additionally rejects:

- any governed object not marked `approved`;
- any source not marked `verified`;
- any patient module with an unresolved placeholder;
- a synthetic clinic configuration, an unresolved clinic policy binding, a
  missing exact policy-module reference, or an operational contact that is not
  verified for institutional use;
- a future-dated or expired contact verification, and—in P0—any configured or
  delegated clinic policy until purpose compatibility and exact runtime
  rendering are implemented;
- missing release-approval metadata;
- an envelope that is not `publication_status: published` and
  `clinical_use: true`.

The ordinary `pnpm content:build` therefore fails closed against the current
draft release. `pnpm content:build:preview` is the only authorized Build Week
preview path.

## Source strategy

Source roles are prioritized as:

1. exact current regulatory labels for drug identity, regulatory scope, and
   event-level safety extraction;
2. Ontario Health / Cancer Care Ontario for Canadian patient-facing drug,
   regimen, and symptom information;
3. Health Canada product monographs and safety information;
4. BC Cancer drug, regimen, and symptom resources;
5. eviQ for gaps and cross-checking;
6. professional guidance or primary literature when required for a specific
   claim or management recommendation.

The repository stores source metadata and reviewable paraphrases, not
wholesale copies. Every patient module has at least one source ID. A broad
catalogue source marked `link_only` can support discovery during drafting but
cannot enter a published release under the current policy.

When sources differ, preserve the jurisdictions, dates, alternatives, chosen
wording/rationale, and unresolved discrepancy. Do not silently harmonize them.

## Required owner decisions

- Review all 27 event-level evidence records, qualitative or categorical transformations,
  evidence-to-presentation mapping, patient wording, and FDA-supported action
  boundaries. The implemented draft contract is not clinical approval.
- Review and edit all 22 patient-facing modules and all claim-to-source
  mappings.
- Resolve the clinic's fever and supportive-care policy bindings. Any
  patient-facing wording must be source-linked in an educational module, not
  written into clinic configuration.
- Define a governed module-purpose discriminator and exact non-personalized
  rendering contract before authorizing configured/delegated policy
  publication; exact reference existence alone is insufficient.
- For any future institutional release, verify the exact clinic identity,
  service scope, daytime and after-hours contact routes, and verification
  evidence through a separately authorized onboarding.
- Resolve the Ontario/eviQ diarrhea-threshold discrepancy.
- Confirm the exact AC regimen variant before adding any cycle or nadir timing.
- Decide whether any team-directed over-the-counter medicine module is
  appropriate; none is approved here.
- Decide review-due dates and prospective change/supersession policy.
- Create content and release approval evidence only after the actual reviews.

The universal emergency statement is governed as an application safety
constant and cannot be overridden by clinic data.

## Supersession discipline

Published evidence is historical evidence. Corrections are prospective:

- create a new object version;
- link `supersedes` and `superseded_by` where appropriate;
- compile a new release with a new hash;
- retain the previous source object, release artifact, and decision record.

Never silently rewrite a published release for consistency.

See [clinical safety](./clinical-safety.md) and [knowledge
model](./knowledge-model.md).
