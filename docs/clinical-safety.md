# Clinical safety

## Safety claim for this prototype

Ariad reduces the authority of runtime software by construction. The language
model may help a user locate a controlled symptom or restate facts. The
deterministic knowledge layer chooses every clinical module and fixed warning
section. Neither path is permitted to diagnose, grade, infer causation, perform
personalized triage, prescribe, or recommend a cancer-treatment change.

The repository default disables all LLM calls. The competition deployment may
explicitly enable bounded GPT-5.6 Luna symptom matching and neutral
restatement. Deterministic matching, release assembly, clinic-data display, and
neutral summary fallback remain available without sending input to a model
provider.

This is an architectural safety claim, not evidence that the draft clinical
wording is approved. **All patient-facing modules remain unreviewed drafts.**

## Authority matrix

| Function | Deterministic application | GPT-5.6 | Patient | Clinician owner |
|---|---:|---:|---:|---:|
| Search authored aliases | Yes | No | Supplies query | Reviews catalogue/content |
| Select candidate symptom IDs | Yes | Bounded fallback, active-release IDs only | Must confirm | Governs catalogue |
| Select clinical modules | Yes, exact release relationships | Never | No | Reviews and approves content |
| Reorder/emphasize fixed modules | Yes, authored tags only | Never | Answers observable questions | Reviews rules and wording |
| Diagnose, grade, infer cause | Never | Never | — | Outside Ariad |
| Make a personalized triage decision | Never | Never | — | Outside Ariad |
| Recommend treatment/medicine changes | Never | Never | — | Outside Ariad |
| Restate supplied facts | Deterministic fallback | Yes, provenance constrained | Reviews before sharing | May receive summary |
| Publish clinical content | Compiler enforces gates | Never | No | Explicit human decision required |

## Fixed guidance versus personalized advice

The complete guidance object always contains the same six authored sections in
the same semantic order:

1. About this symptom.
2. Why it matters with this treatment.
3. What you can generally do at home.
4. Contact your cancer team if…
5. Seek urgent medical attention if…
6. What information to have ready.

Answers can activate authored priority tags and cause related modules to be
emphasized or initially expanded. They do not add, remove, edit, or interpret
clinical statements. Ariad does not produce “you should contact your team now,”
“you need urgent care,” a toxicity grade, or a treatment instruction.

## Runtime model controls

### Symptom navigation

- Deterministic matching runs first.
- The model is called only when confidence is insufficient.
- Structured output permits at most three controlled IDs.
- Returned IDs are validated against the active release.
- The model may abstain or request clarification.
- Patient text cannot grant tools or change the contract.
- The patient must confirm the category before guidance.
- Failure returns the deterministic controlled-catalogue result.

### Neutral summary

- Input is limited to the selected treatment/symptom and rendered observable
  answers.
- Every output item must cite one or more request field IDs.
- Unknown provenance, invalid structure, or prohibited recommendation language
  causes rejection.
- The fallback is a direct deterministic label/value template.
- The patient is told to review the summary before sharing.
- No summary is stored server-side.

## Content and release controls

- Strict Zod schemas reject unknown fields and malformed values.
- Repository validation checks versioned references, duplicate objects, class
  cycles, sources, approval metadata, and relationship completeness.
- Full-guidance relationships require all six module slots and 3–7 questions.
- A safety scan blocks example diagnosis, grade, treatment-change, personalized
  urgency, recommendation, and causal-certainty phrases.
- An unapproved numeric Celsius fever threshold is rejected.
- Preview compilation requires the exact acknowledgement
  `ARIAD_EXPLICIT_UNREVIEWED_PREVIEW`, enforces `clinical_use: false`, and adds
  a mandatory notice.
- A published channel rejects unapproved governed objects, unverified sources,
  unresolved placeholders or clinic policy bindings, synthetic clinic data,
  unverified or expired institutional contacts, future-dated verification, and
  missing release-approval metadata. P0 also rejects non-unresolved clinic
  policies until semantic compatibility and exact rendering are implemented.
- Generated output is canonicalized and content-addressed; the web app parses
  it against the compiled-release schema at startup.

Automated checks are backstops. They do not substitute for clinical review,
source adjudication, usability testing, hazard analysis, or release approval.

## High-stakes content intentionally unresolved

The current preview does not choose a local fever threshold or destination.
Ontario Health/Cancer Care Ontario and eviQ sources use differing fever wording;
the structured fictional clinic configuration records the fever and
supportive-care policy bindings as unresolved. It contains no patient-facing
clinical instruction prose and no module reference for either unresolved
binding. Four urgent module versions visibly retain the fever owner-decision
placeholder.

## Clinic configuration safety boundary

- A release pins one clinic configuration by kind, ID, and exact version.
- Clinic data may carry identity, jurisdiction, care scope, structured contact
  routes, operational verification, and policy bindings only.
- Patient-facing fever and supportive-care instructions belong in separately
  governed, source-linked educational modules.
- The current configuration is `synthetic_demo`; its fictional telephone values
  are display-only and never actionable `tel:` links.
- Unresolved policies carry neither a clinical module nor a destination; the
  schema cannot silently turn candidate contacts into a local routing decision.
- Future institutional contact values stay hidden unless their verification is
  current at viewing time; expiry is rechecked while the page is open.
- The runtime does not calculate whether a contact route is open, select a
  destination from patient answers, or turn a policy binding into personalized
  advice.
- An unresolved binding blocks a clinical-use publication. A real institutional
  configuration requires verified contacts and genuinely approved referenced
  modules; changing a mode field is not approval. P0 additionally blocks
  configured/delegated policy publication because exact reference existence is
  not proof that a module matches the policy purpose or that the renderer uses
  it safely.

Clinical-owner review is also required to:

- review every patient-facing module and claim-to-source mapping;
- resolve the Ontario/eviQ diarrhea-threshold discrepancy;
- confirm the exact AC regimen variant before any schedule/nadir statement;
- decide whether any team-directed over-the-counter medicine wording is
  appropriate;
- create genuine content and release approval evidence.

No reviewer identity, review date, approval, or publication status may be
invented to make a build pass.

## Universal safety language

Every symptom experience must explain that Ariad cannot determine the cause,
grade the symptom, or make a personal treatment/triage decision. This statement
is persistent, never triggered by model inference, and cannot be replaced,
suppressed, or edited by clinic configuration:

> If you think this is a medical emergency, call 911 or your local emergency
> service now.

## Before any real-world use

At minimum: clinical-owner review and approval; jurisdictional reconciliation;
formal hazard analysis and safety case; human-factors and accessibility testing;
privacy/security assessments; incident and surveillance processes; release
approval and rollback; appropriate legal/regulatory review; institutional
contact/configuration validation; and validation in the intended environment.

See [intended use](./intended-use.md), [content
governance](./content-governance.md), and [threat model](./threat-model.md).
