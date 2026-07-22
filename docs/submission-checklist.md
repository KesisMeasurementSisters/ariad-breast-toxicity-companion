# OpenAI Build Week submission handoff

This document separates repository evidence from owner-controlled submission
actions. It contains no implied completion claims: technical facts are backed by
the repository, while external actions are identified explicitly and should be
recorded in Devpost rather than left as empty placeholders here.

## Submission identity

| Field | Value |
|---|---|
| Track | Apps for Your Life |
| Project | Ariad: Breast |
| Descriptor | A breast cancer treatment side-effect companion |
| Product line | A trusted thread through treatment |
| Live preview | [https://ariad.kesis.ca](https://ariad.kesis.ca) |

The preview is free to access, requires no account, and is explicitly labelled
as unreviewed and not for clinical use. The repository default keeps GPT-5.6
disabled; the competition deployment may enable bounded GPT-5.6 Luna for
controlled symptom matching and neutral restatement only.

## Repository evidence

- The active content release is
  `build-week-preview-2026-07-18@0.13.0`, contains 561 exact object versions,
  and has content hash
  `bee4e69e21b0c434f4d444477300501b9d9acea8eafae18028fbeaa510a5e0ad`.
- The release remains `preview`, `publication_status: draft`, and
  `clinical_use: false`; it contains no recorded clinical approvals.
- The application has no accounts, database, analytics, medical uploads, or
  server-side symptom history. Competition builds disable saved treatments.
- Clinical guidance is compiled from exact source-controlled objects. Runtime
  AI cannot author guidance, diagnose, grade, infer cause, calculate urgency,
  or recommend a treatment change.
- CI runs lint, typecheck, content validation, the safety scan, unit and golden
  tests, an explicitly labelled preview build, browser tests, and automated
  accessibility checks.
- [BUILD_WEEK.md](../BUILD_WEEK.md) records dated implementation, verification,
  deployment, and public smoke-test evidence. Historical entries remain bound
  to the release and commit named in each entry.
- The current Cloudflare deployment is manual. A successful GitHub push or CI
  run does not prove that the live Worker contains the latest branch commit.

## Owner-controlled submission evidence

These items occur outside the repository and must be confirmed in the final
Devpost submission or owner records:

- required Devpost fields, declarations, team details, repository access, and
  final submission confirmation;
- the public video URL, processed duration of three minutes or less, audible
  narration, and end-to-end playback check;
- any Codex feedback or session identifier required by the submission form;
- authorization to distribute repository assets and the chosen repository
  licence/access model;
- the exact deployed commit and a final live smoke test after the last manual
  Cloudflare deployment;
- native print-dialog, keyboard-only, and screen-reader smoke checks on the
  judging device.

The recording plan is in [demo-script.md](./demo-script.md). Use only synthetic
inputs, keep the prototype and emergency notices visible, and never present a
deterministic fallback as a successful model response.

## Post-judging operational action

Rotate or revoke the competition API key after the judging period, or
immediately if exposure is suspected. The key must remain in managed deployment
secrets and ignored local configuration; it must never be committed.

## Clinical governance beyond the prototype

The following are deliberate future clinical-release gates, not Build Week
software defects:

- freeze a new exact clinical-review baseline for release `0.13.0` or its
  successor; the existing brief and open review record remain bound to `0.2.0`;
- review all 159 patient-facing module versions, all 30 private FDA evidence
  records and patient presentations, and their claim/source mappings;
- resolve the synthetic clinic's fever and supportive-care policy decisions,
  the Ontario/eviQ diarrhea discrepancy, and the exact AC regimen variant;
- create genuine content approvals and a separate immutable published release.

Until those gates are completed, Ariad remains an unreviewed competition
preview and must not be represented as ready for patient care.
