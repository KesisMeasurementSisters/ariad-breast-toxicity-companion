# Product scope

## Product thesis

Treatment handouts are usually organized by drug or regimen, while a patient's
immediate question is often symptom-oriented: What am I noticing? What general
information applies? What warning signs did my team ask me to know? What facts
should I have ready when I call?

Ariad provides two equal ways into one governed knowledge source:

1. **I’m starting treatment** — search or enter a treatment code, review a
   preparation path, and optionally save the treatment ID on the device.
2. **I’m having a symptom** — use a controlled catalogue or free-text
   navigation, confirm a symptom category, add treatment context, answer
   observable questions, view fixed education, and prepare a neutral summary.

## Current vertical slice

The Build Week preview contains:

- 53 canonical drug records, eight regimens, and ten treatment classes;
- 28 patient-observable symptom concepts;
- 19 observable features and 19 questions;
- 22 draft educational modules;
- three exact regimen–symptom relationships with complete six-section draft
  guidance;
- one weekly-paclitaxel preparation pathway;
- 25 draft single-drug patient side-effect presentations, each backed by a
  private exact FDA evidence record;
- 70 source records and one exact-version structured synthetic clinic
  configuration;
- one immutable 258-object preview release,
  `build-week-preview-2026-07-18@0.5.0`, with content hash
  `e0de8058c3e9dd932c394bf56f252e7717506fdefd257ba61961862208b666d1`.

The polished pathways are weekly paclitaxel/peripheral neuropathy,
capecitabine/diarrhea, and AC/fever or infection concern. Catalogue breadth is a
navigation capability, not a claim that every treatment–symptom combination is
supported.

The expanded drug catalogue is a search and source-provenance foundation. Of
the 53 canonical records, 52 point to exact FDA labels and identify their safety
sections. Twenty-five have a draft event-level evidence record and separate
patient-only presentation with broad qualitative frequency groups; 28 remain
intentional no-page gaps. The private numerical evidence is not shipped in the
browser release. The three complete symptom relationships remain regimen-level;
the drug pages are education-only and do not calculate urgency or provide a
treatment recommendation. See the [single-drug coverage ledger](./fda-single-drug-toxicity-coverage.md).

## Coverage hierarchy

The intended hierarchy is:

1. exact regimen;
2. individual drug;
3. clearly labelled treatment-class information;
4. general symptom-safety information.

The guidance resolver implements exact regimen/treatment → regimen component →
nearest treatment class → general safety order, and labels any fallback basis
plainly. The active release contains complete relationships only for its three
exact demo combinations. If no eligible complete relationship or preparation
path exists, the interface displays a coverage boundary rather than inferring
content from catalogue membership alone.

Support labels mean:

| Status | Meaning |
|---|---|
| `full_guidance` | A complete pathway exists in the active release. In this preview, its content is still unreviewed draft content. |
| `education_only` | Some education may exist, but not a complete management pathway. |
| `catalogued` | Search/identification only; no complete guidance implied. |
| `unsupported` | Ariad cannot safely provide treatment-specific content. |

## Included demonstration affordances

- Manual treatment search by generic name, brand name, abbreviation, or alias.
- Controlled symptom catalogue plus free-text navigation.
- Required patient confirmation after language matching.
- Three home-screen sample scenarios.
- Treatment codes `THREAD-PAC-01`, `THREAD-CAPE-02`, and `THREAD-AC-03`.
- Query-string code resolution through `?code=THREAD-PAC-01`.
- Direct treatment-preview resolution through `?treatment=<canonical-drug-id>`.
- Structured fictional daytime/after-hours clinic contacts, rendered as
  non-actionable display data, plus explicit unresolved fever and
  supportive-care policy states.
- Reset and clear-saved-treatment action.
- Summary copy, print, and plain-text download.

Treatment codes and the demo clinic contain no personal information and do not
represent a real institution. Clinic configuration contains no patient-facing
clinical instruction prose: any future local fever or supportive-care wording
must be an exact, separately governed educational-module version. The universal
emergency statement remains application-owned and cannot be changed by clinic
data.

The current runtime is deterministic only; all LLM calls are disabled. This
does not change the product boundary or confer any review or approval on the
188 governed draft objects in the active release. Configured/delegated local
policies are a future schema seam only: P0 blocks their publication until
purpose compatibility and exact runtime rendering exist.

## Explicit non-goals

The current project does not include:

- real patient use or clinical deployment;
- diagnosis, toxicity grading, causal inference, autonomous triage, prescribing,
  or treatment-change advice;
- accounts, identity, PHI, a database, a diary, or server-side symptom history;
- analytics, advertising, tracking pixels, or behavioral profiling;
- medical uploads, electronic medical-record integration, or patient-portal
  integration;
- live web search, RAG, vector search, a general chatbot, or autonomous patient
  agents;
- a content-management/admin interface or full institutional configuration;
- exhaustive breast-cancer treatment-toxicity coverage;
- full Nyx governance, safety-case, surveillance, or dual-review workflows.

## Future direction

The versioned objects, provenance, compiler, and release boundaries are designed
to move into Nyx. Chloe can support evidence extraction/drafting, Kesis can
measure and assemble, and Atro can govern review, publication, supersession,
retirement, and surveillance. Ariad remains a downstream renderer that can
expand to other tumour sites, languages, institutional releases, print, portal,
and voice delivery only after the required governance is in place.
