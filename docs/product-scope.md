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
- 139 active draft educational modules;
- three exact regimen–symptom relationships and 25 clearly labelled general
  symptom fallbacks, each with complete six-section draft guidance;
- preparation for all 53 drug choices and eight regimen choices: exact overlays
  for weekly paclitaxel, capecitabine monotherapy, and AC, plus a clearly
  labelled general fallback for every other choice;
- 30 draft single-drug patient side-effect presentations, each backed by a
  private exact FDA evidence record;
- 101 active source records and one exact-version structured synthetic clinic
  configuration;
- one exact-version 492-object active preview artifact,
  `build-week-preview-2026-07-18@0.12.0`, with content hash
  `e6e48a385d21e8ec8692642439a6fc4d272828b0e809f3e97e76d69a08f59e56`.

The exact treatment-and-symptom pathways are weekly paclitaxel/peripheral
neuropathy, capecitabine/diarrhea, and AC/fever or infection concern. The other
25 symptom journeys are general fallbacks. The three exact preparation overlays
use the same regimen IDs but remain a separate content purpose. No preparation
module claims that a selected treatment caused, is associated with, or changes
the urgency of a symptom.

The expanded drug catalogue is a search and source-provenance foundation. Of
the 53 canonical records, 52 point to exact FDA labels and identify their safety
sections. Twenty-five have a breast-specific draft event-level evidence record;
carboplatin has a separately governed cross-indication FDA single-agent record,
and cyclophosphamide, doxorubicin, and epirubicin have non-numerical FDA
label-category records. Pembrolizumab adds a cross-cancer FDA single-agent
label-category record. Together they support 30 patient-only presentations with
broad qualitative or categorical groups, while 23 drugs remain intentional
no-page gaps. The private
numerical evidence is not shipped in the browser release. The three complete symptom relationships remain regimen-level;
the drug pages are education-only and do not calculate urgency or provide a
treatment recommendation. See the [single-drug coverage ledger](./fda-single-drug-toxicity-coverage.md).

For a multi-drug regimen, Ariad composes the existing single-drug presentations
in the regimen's governed component order. Each drug remains an independent
section with its own source context and escalation summary. A visible boundary
states the evidence boundary for that individual drug and does not present its
groups as frequencies for the full regimen. Missing component evidence remains
an information-in-preparation card; Ariad does not borrow or infer a rate.

## Coverage hierarchy

The intended hierarchy is:

1. exact regimen;
2. individual drug;
3. clearly labelled treatment-class information;
4. general symptom-safety information.

The symptom-guidance resolver implements exact regimen/treatment → regimen
component → nearest treatment class → general safety order, and labels any
fallback basis plainly. Preparation uses a stricter resolver: exact treatment
modules win; otherwise only the authored `systemic-therapy` general set may be
used. It never borrows preparation from a component drug or treatment class.
If an eligible symptom relationship or preparation set is unavailable, the
interface displays a coverage boundary rather than inferring content from
catalogue membership alone.

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
- Help for people who do not know the treatment name. The competition build
  does not show or write a saved-treatment list.
- Preparation-first treatment pages that group the governed modules under three
  plain-language questions, followed by a separate safety note and side-effect
  education. The print action includes all of these sections.
- Structured fictional daytime/after-hours clinic contacts, rendered as
  non-actionable display data, plus explicit unresolved fever and
  supportive-care policy states.
- Reset action for the active demonstration.
- Summary copy, print, and plain-text download.

Treatment codes and the demo clinic contain no personal information and do not
represent a real institution. Clinic configuration contains no patient-facing
clinical instruction prose: any future local fever or supportive-care wording
must be an exact, separately governed educational-module version. The universal
emergency statement remains application-owned and cannot be changed by clinic
data.

The current runtime is deterministic only; all LLM calls are disabled. This
does not change the product boundary or confer any review or approval on the
391 governed draft objects in the active release. Configured/delegated local
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
