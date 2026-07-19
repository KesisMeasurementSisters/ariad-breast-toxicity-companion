# ADR-0004: Local-only minimal persistence

- Status: Accepted
- Date: 2026-07-18

## Context

The demo benefits from remembering a treatment, but accounts, longitudinal
symptom history, and patient records add privacy, security, and regulatory
scope without improving the core Build Week demonstration.

## Decision

Persist only a versioned, capped list of saved treatment IDs and notice state
in browser local storage. Keep symptom wording, answers, matches, and summaries
in active React state. Provide an explicit reset and user-initiated
copy/print/download. Add no database, accounts, analytics, or server history.

## Consequences

- The application has a small data footprint and no patient backend.
- The user controls whether a summary leaves the session.
- Saved treatment IDs may still be sensitive on a shared device, so reset and
  privacy language remain necessary.
- There is no diary, cross-device sync, or recovery of a closed session.
