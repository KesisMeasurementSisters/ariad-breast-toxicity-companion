# ADR-0002: File-backed, versioned knowledge graph

- Status: Accepted
- Date: 2026-07-18

## Context

The competition needs transparent, reviewable content and a portable knowledge
subsystem, not operational graph infrastructure. Clinician review benefits from
readable diffs and exact source/version references.

## Decision

Represent first-class objects in typed YAML/JSON, validate them with strict Zod
schemas, and express graph edges as stable IDs. Keep loading and compilation in
`packages/knowledge-core`; do not add a graph database, CMS, vector store, or
runtime content service.

## Consequences

- Content changes are inspectable in Git and can carry review metadata.
- The compiler can later move into Nyx independently of the patient interface.
- Runtime queries are simple in-memory lookups over a small release.
- Repository files are not a concurrent authoring system; institutional scale
  will require governed workflow tooling later.
