# ADR-0003: Immutable, fail-closed content releases

- Status: Accepted
- Date: 2026-07-18

## Context

Clinical wording must be reproducible and must not enter a patient surface just
because a draft file exists. Build Week also needs a way to demonstrate draft
content without implying publication.

## Decision

Require a manifest that pins every object by kind, ID, and semantic version.
Canonicalize and hash the compiled payload. Ordinary published builds reject
unapproved content, unverified sources, unresolved placeholders, and missing
release approval metadata. Draft compilation requires the exact acknowledgement
`ARIAD_EXPLICIT_UNREVIEWED_PREVIEW`, sets `clinical_use: false`, and embeds a
mandatory notice.

## Consequences

- A generated artifact is reproducible and traceable to a release hash.
- Development cannot silently convert draft content into a production build.
- The current ordinary build intentionally fails because there is no approved
  release.
- Immutability proves artifact identity, not clinical validity; human approval
  remains a separate gate.
