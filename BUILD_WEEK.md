# Ariad: Breast — Build Week evidence log

## 2026-07-18 — Primary Codex build thread

### Starting state

- Target repository `KesisMeasurementSisters/ariad-breast-toxicity-companion`
  was verified to exist with no refs or commits.
- The supplied `ariad` directory was empty and initially resolved to a dirty
  parent `kesis-ops` repository. Codex isolated it as its own Git repository so
  no parent changes are touched.
- Work began on branch `Codex/p0-foundation-2026-07-18`.
- OpenAI Build Week rules and FAQ were checked on 2026-07-18; the recorded
  deadline remains 2026-07-21 at 5:00 PM Pacific.

### Human-locked product and clinical decisions

- Adults receiving systemic therapy for breast cancer; prototype only.
- Deterministic, versioned, source-controlled clinical guidance.
- GPT-5.6 is limited to controlled symptom navigation and neutral summaries.
- No diagnosis, grading, causal inference, personalized triage, prescribing,
  or anticancer treatment-change advice.
- Draft clinical content cannot be approved without explicit clinician review.

### Codex work

- Created the isolated repository and protected feature branch.
- Established the initial pnpm/Next.js monorepo contract, strict TypeScript,
  quality commands, repository instructions, and credential boundary.
- Implemented strict Zod contracts for all first-class knowledge objects,
  review evidence, immutable releases, guidance assembly, and bounded AI data.
- Built a deterministic YAML loader, graph/reference validation, safety scan,
  search indexes, exact-version compiler, content hash, and fail-closed release
  policies.
- Curated 144 pinned preview objects: 23 drugs, five regimens, ten treatment
  classes, 28 patient-observable symptom concepts, 19 observable features, 19
  questions, 22 draft patient modules, three gold relationships, 14 sources,
  and one synthetic clinic configuration.
- Added three structured golden fixtures plus a complete weekly-paclitaxel
  preparation pathway. All clinical modules remain draft.
- Built the complete mobile-first patient interface: dual entry, deterministic
  treatment and symptom search, required patient confirmation, observable
  question flows, guidance and source panels, education-only and unsupported
  states, local saved treatments, reset, and neutral copy/print/download
  summaries.
- Added bounded server routes for GPT-5.6 classification and neutral summary
  restatement using the official OpenAI SDK, Structured Outputs, `store: false`,
  no tools, input and timeout limits, same-origin checks, rate limiting, and
  deterministic fail-closed fallbacks.
- Added governance validation for status histories, allowed transitions,
  supersession integrity, dependency closure, approval hashes, expiry and
  review dates, and exact source inventory equality.
- Added unit, golden, adversarial AI, accessibility, responsive, keyboard, and
  end-to-end browser coverage, plus a reproducible screenshot harness.
- Added CI, a standalone Docker preview, architecture and safety documentation,
  six ADRs, a demo script, submission gates, and the generated review report.

### Delivered architecture

- **Build time:** versioned YAML → strict schemas → governance/reference/safety
  validation → deterministic compiler → immutable JSON + SHA-256.
- **Runtime:** the client reads one exact compiled release and pure query
  functions assemble guidance. No model can author, alter, or rank clinical
  instructions.
- **Bounded AI:** GPT-5.6 may return controlled symptom IDs or restate an exact
  finite set of supplied facts. Provider, schema, provenance, or safety failure
  returns a deterministic result.
- **Data boundary:** no accounts, database, server symptom history, analytics,
  uploads, or patient record. Only treatment IDs and a notice flag may persist
  locally.

### Commands and checks

- `git ls-remote --symref ... HEAD` — confirmed empty target remote.
- `git fetch --all` — completed after repository initialization.
- `node --version` — v25.2.1.
- `pnpm --version` — 11.9.0.
- Package versions checked against the npm registry before pinning.
- `pnpm content:validate` — 144 objects, zero errors and zero warnings.
- `pnpm content:build` — correctly failed closed without the explicit preview
  acknowledgement.
- `pnpm content:build:preview` — compiled immutable preview hash
  `d538f6870ef8f5c15349120d7e8a2f1e95aa4519ed5f8d0915dc4b1094760cbf`
  for the historical `0.1.1` release recorded on 2026-07-18.
- `pnpm safety:scan` — zero prohibited-language findings.
- `pnpm test` — 80 tests passed, including golden pathways, hash
  reproducibility, governance invariants, adversarial AI validation, HTTP
  controls, local-storage migration, and deterministic recognition.
- `pnpm lint` and `pnpm typecheck` — passed.
- `pnpm build:preview` — passed with Next.js 16.2.10's Webpack path; the preview
  includes the static patient interface and three bounded dynamic API routes.
- `pnpm test:e2e` — 14 tests passed on Pixel 7 and desktop Chromium, including
  all three gold scenarios, preparation and education-only paths, axe checks,
  a 320 px overflow check, and keyboard focus/skip-link behavior.
- `pnpm screenshots` — regenerated four 390 px production-preview captures;
  the harness uses deterministic fixtures and makes no live-model claim.

### OpenAI runtime verification

- The competition key is stored only in the ignored root `.env.local` and is
  loaded server-side by the monorepo web app. No credential value is logged or
  tracked.
- With GPT-5.6 enabled, `/api/health` reported that the configured model path
  was ready.
- A synthetic live request reached the OpenAI API and returned a sanitized
  `429 insufficient_quota`. Ariad returned its deterministic fallback without
  exposing provider details.
- A successful live GPT-5.6 response is therefore **not** claimed. Project
  quota/billing must be enabled, then the live path must be rerun before the
  demo and submission gates can be checked.

### Evidence commits

- `6c27f30` — Establish Ariad safety-first Build Week foundation.
- `d4627fe` — Build governed draft knowledge release and golden pathways.
- `0d56f28` — Build patient experience and bounded AI runtime.
- Final deployed submission commit — pending owner deployment decision and the
  remaining external submission gates.

### Clinical review required

- All patient-facing clinical modules and warning criteria.
- Every claim-to-source mapping and selected jurisdictional wording.
- Any clinic-specific fever or supportive-care wording.
- Approval and publication of an immutable production content release.

### Known limitations / next work

- No content is approved or published; the ordinary production build remains
  intentionally blocked.
- GPT-5.6 is intentionally disabled by owner decision while work focuses on
  deterministic behavior and clinic data. The earlier quota result remains
  recorded evidence, not an active implementation priority.
- No public deployment or video is claimed.
- Manual screen-reader smoke testing and final cross-browser/device review
  remain submission gates.
- `/feedback` Codex Session ID: **TODO before submission**.

## 2026-07-19 — Deterministic and clinic-data focus

### Human-locked decision

- Disable all LLM provider calls at this time.
- Preserve the bounded adapter and locally stored key for possible later
  reactivation; do not delete or broaden them.
- Prioritize deterministic behavior, governed clinical content, and clinic
  configuration data.

### Implementation

- Set the ignored local runtime and tracked example to `ENABLE_GPT56=false`.
- Kept the server feature gate fail-closed: only the exact string `true` can
  enable provider calls.
- Added a regression test proving that an absent flag remains disabled even
  when a key and model are configured.
- Updated current-state documentation and deferred the live-model demo script.

### Verification

- `pnpm lint` — passed.
- `pnpm typecheck` — passed across all three workspace packages.
- `pnpm test` — 80 tests passed across eight files.
- Local `/api/health` — `ai.enabled: false`, `ai.reason: disabled`, preview
  release `0.1.1`, and `clinicalUse: false` at this initial checkpoint. The
  active preview was subsequently superseded by `0.2.0` below.

## 2026-07-19 — Clinic-configuration v2

### Human-locked boundary

- Treat clinic configuration as exact-version operational deployment data, not
  as a second clinical-content store.
- Keep patient-facing fever and supportive-care instructions in separately
  governed educational modules.
- Keep the universal emergency statement application-owned and
  non-overridable by a clinic.
- Continue deterministic-only runtime operation with all LLM calls disabled.
- Do not infer a reviewer, approval, publication decision, or real institution
  from the new schema, validators, or preview artifact.

### Implementation

- Added a strict v2 clinic schema for identity, jurisdiction, timezone, locale,
  care scope, structured daytime/after-hours contact routes, operational
  verification, and exact clinical-policy bindings.
- Preserved the v1 synthetic object and historical content-addressed release;
  created v2 prospectively and made the active manifest pin it by kind, ID, and
  exact version.
- Kept all patient-facing clinical instruction prose out of clinic
  configuration. The fever and supportive-care bindings remain explicitly
  `unresolved` with no educational-module reference or selected destination.
- Rendered synthetic contact values as fictional, non-actionable display data
  and added deterministic unresolved-policy messaging.
- Added validation and publication gates for exact clinic/module references,
  synthetic mode, contact verification freshness, and unresolved policy
  bindings. Configured/delegated policy publication also fails closed until a
  governed purpose-compatibility contract and exact runtime rendering exist.

### Release evidence

- Active preview: `build-week-preview-2026-07-18@0.2.0`.
- Content hash:
  `80656c44ab5ab0707ae3417234c10415455e852fbd361e1ac05cd43363dafd4b`.
- The release still pins 144 exact object versions: 130 governed draft objects
  and 14 source records. The repository review queue contains 131 governed
  versions because both v1 and v2 clinic objects are retained, while the active
  release pins only v2.
- Patient-facing module approvals remain **0**. The clinic object is a synthetic
  fixture; no real contact, clinician review, approval, or publication is
  claimed.

### Verification

- `pnpm test` — 123 tests passed across 11 files.
- `pnpm lint` and `pnpm typecheck` — passed across the workspace.
- `pnpm content:validate` — 146 repository objects, 0 errors, 0 warnings.
- `pnpm safety:scan` — 0 findings across source content, compiled content, and
  summary fixtures.
- `pnpm test:e2e` — 14 mobile/desktop journey and accessibility checks passed.
- `pnpm build:preview` — production-style preview build passed at the exact
  `80656c44ab5ab0707ae3417234c10415455e852fbd361e1ac05cd43363dafd4b`
  content hash.
- `pnpm build` — correctly failed closed without the explicit unreviewed-preview
  acknowledgement.
- Local `/api/health` — `ai.enabled: false`, `ai.reason: disabled`, release
  `0.2.0`, `clinicalUse: false`, and the exact hash above.
- Four 390 px screenshots were regenerated from the final production-style
  preview and visually inspected.

## 2026-07-20 — FDA drug-search foundation and documentation reconciliation

### Human-locked boundary

- The expanded treatment search establishes canonical drug identity and source
  provenance only. It does not create or approve drug-to-toxicity claims,
  frequency groups, home-management content, escalation language, or
  single-drug recommendations.
- Combination-arm evidence must not be attributed to one component drug.
- The version-bound clinician brief and open review record remain attached to
  release `0.2.0`; they do not extend to or approve the new release.

### Release 0.3.0 checkpoint evidence

- Preview at this checkpoint: `build-week-preview-2026-07-18@0.3.0`.
- Content hash:
  `02f438c5490fae1d8dc00f82234f7ee05d5e9c9c89c90333286f32c68367dd0b`.
- Compiled JSON file SHA-256:
  `3d2d230275b5e0b2f0e90ebcb5ed0bfa401edd5afe8cb10021d21b8a28e79dcd`.
- The release pins 233 exact object versions: 163 governed draft objects and
  70 source records.
- Search covers 53 canonical drug records, eight regimens, ten treatment
  classes, and 28 symptom concepts. Fifty-two drug records pin exact FDA label
  provenance and remain `source_indexed`; carboplatin is retained as a
  source-verified breast-regimen component.
- The three complete draft treatment-toxicity relationships are unchanged and
  remain regimen-level. There is no complete `treatment_kind: drug`
  relationship or populated single-drug toxicity evidence set.
- Clinical approvals remain **0**; the release is `preview`,
  `clinical_use: false`, and contains unapproved content.

### Verification

- `pnpm content:validate` — 234 repository objects, including both clinic
  configuration versions; 0 errors and 0 warnings.
- The living README, product scope, knowledge model, and governance documents
  were reconciled to the exact `0.3.0` release. Historical `0.1.1` and `0.2.0`
  evidence entries and snapshot-bound clinical review records were preserved.

## 2026-07-20 — first single-drug toxicity preview: docetaxel

### Scope and safety boundary

- This increment covers docetaxel alone. It does not populate any other drug and
  does not reuse the single-drug evidence inside a combination regimen.
- The private evidence object uses the FDA Table 3 breast-cancer column for
  docetaxel 100 mg/m² monotherapy, with the full source population, denominator,
  event names, and numerical measures retained for audit.
- The patient release contains only Ariad-authored plain-language copy, three
  qualitative frequency groups, monitoring information, source/review status,
  and a final escalation summary. Numerical frequencies, severity values,
  laboratory cut-offs, dose context, and treatment-change rules are absent from
  the browser payload.
- The evidence record and patient presentation are both `draft`. Reviewer,
  review date, and approval fields remain null.

### Current release evidence

- Active preview: `build-week-preview-2026-07-18@0.4.0`.
- Content hash:
  `76319c7e1420c0a57841e0f266c042045d5c69348a3d85f9c594da798672ee5a`.
- Compiled JSON file SHA-256:
  `d0b89ef7a2a904a904afcada5272bd557bcf657bf42816241cf50970eba3a615`.
- Private docetaxel evidence clinical-payload hash:
  `046afabefb69ae05397977f33e76835a28f310b2d03af6201e6337cc0ffa3fcb`.
- The release pins 234 exact object versions: 164 governed draft objects and
  70 source records. The private numerical evidence object remains outside the
  browser release and is bound to the presentation by exact version and hash.
- The docetaxel page has 17 expandable patient rows across three qualitative
  frequency groups and one monitoring section. All 23 FDA Table 3 evidence rows
  are mapped or carry an explicit omission rationale.
- Clinical approvals remain **0**; the release is `preview`,
  `clinical_use: false`, and contains unapproved content.

### Verification

- `pnpm content:validate` — 236 repository objects; 0 errors and 0 warnings.
- `pnpm typecheck` — all three workspace packages passed.
- `pnpm test` — 141 unit and golden tests passed.
- `pnpm lint` — passed.
- `pnpm safety:scan` — 0 findings.
- `pnpm build:preview` — production-style preview build passed.
- `pnpm test:e2e` — all 34 mobile and desktop browser tests passed, including
  the 320 px docetaxel layout and serious/critical axe scan.
- Desktop and mobile full-page captures were visually inspected. A seven-page
  A4 print preview confirmed that every disclosure and the source block expands
  for print and that prior disclosure state is restored afterward.

## 2026-07-20 — FDA single-drug toxicity expansion

### Scope and evidence boundary

- Expanded the docetaxel evidence-to-presentation pattern to 24 additional
  canonical drugs. The preview now contains 25 single-drug patient pages.
- Each private evidence record uses the largest complete breast-specific
  single-agent population available in the selected current FDA label for a
  defensible current dose or formulation. Exact percentages, dose, population,
  denominator, comparator, event names, and source locator remain private.
- The browser release contains only qualitative frequency groups,
  Ariad-authored patient explanations and actions, the cause limitation, exact
  FDA source links, and the universal emergency statement.
- Twenty-eight catalogue drugs remain intentional no-page gaps because their
  FDA breast safety data are combination-only, lack a suitable breast-specific
  single-agent frequency table, represent a fixed combination, or—in the case
  of carboplatin—lack an FDA breast-treatment label.
- Conventional paclitaxel was corrected to SPL set
  `ea28753a-8631-460a-bfdc-b101eb8ac84a` and remains distinct from
  protein-bound paclitaxel (`24d10449-2936-4cd3-b7db-a7683db721e4`).
- All 25 evidence records and all 25 patient presentations remain `draft` with
  no recorded reviewer, review date, or approval.

### Release evidence

- Active preview: `build-week-preview-2026-07-18@0.5.0`.
- Content hash:
  `e0de8058c3e9dd932c394bf56f252e7717506fdefd257ba61961862208b666d1`.
- Compiled JSON file SHA-256:
  `0a763b50bcf09f7b12d65a37652f3b4ed58dc0f64692948773bb8cea2a80e0d1`.
- The release pins 258 exact object versions: 188 governed draft objects and
  70 source records. All 25 private numerical evidence objects remain outside
  the browser release and are hash-bound to their patient presentations.
- The coverage decision and all intentional gaps are recorded in
  [docs/fda-single-drug-toxicity-coverage.md](./docs/fda-single-drug-toxicity-coverage.md).

### Verification

- `pnpm content:validate` — 284 repository objects; 0 errors and 0 warnings.
- `pnpm typecheck` — all three workspace packages passed.
- `pnpm test` — 143 unit and golden tests passed.
- `pnpm lint` — passed.
- `pnpm safety:scan` — 0 findings.
- `pnpm build:preview` — production-style preview build passed.
- `pnpm test:e2e` — all 38 mobile and desktop browser tests passed, including
  representative new drug pages, intentional evidence gaps, 320 px layout,
  print-state behaviour, and serious/critical axe scans.
- In-app browser checks confirmed direct pages for capecitabine, anastrozole,
  trastuzumab deruxtecan, both paclitaxel formulations, and goserelin; no page
  displayed a numerical frequency, and alpelisib retained the preparation
  fallback.

## 2026-07-20 — regimen composition from single-drug presentations

- Multi-drug regimen pages now resolve component drugs in their governed order
  and attach only the matching existing single-drug presentation.
- Each populated component remains an independent patient section with its own
  source context, cause limitation, disclosures, escalation summary, and
  emergency statement.
- Every populated component displays a boundary stating that its qualitative
  groups come from single-drug FDA information and do not describe frequencies
  for the full regimen.
- Missing components remain explicit information-in-preparation cards. TCH
  therefore shows docetaxel and trastuzumab presentations while carboplatin
  remains pending; no evidence is borrowed or inferred.
- Regimen printing expands disclosures in every populated drug section and
  restores the prior interactive state afterward. Presentation and escalation
  heading IDs are unique across the combined page.
- This is a presentation-composition change only. Preview release `0.5.0`, its
  258-object inventory, content hash, evidence records, and approval state are
  unchanged.

### Verification

- `pnpm content:validate` — 284 repository objects; 0 errors and 0 warnings.
- `pnpm typecheck` — all three workspace packages passed.
- `pnpm test` — 145 unit and golden tests passed.
- `pnpm lint` — passed.
- `pnpm safety:scan` — 0 findings.
- `pnpm build:preview` — production-style preview build passed with unchanged
  content hash
  `e0de8058c3e9dd932c394bf56f252e7717506fdefd257ba61961862208b666d1`.
- `pnpm test:e2e` — all 42 mobile and desktop browser tests passed, including
  TCH evidence boundaries, the carboplatin gap, unique IDs, print-state
  restoration, 320 px layout, and serious/critical axe scans.
- In-app browser inspection confirmed two populated TCH presentations, one
  pending component, no visible numerical frequencies, no horizontal overflow,
  and no console errors or warnings.

## 2026-07-20 — carboplatin FDA single-agent page

### Scope and evidence boundary

- Added one private carboplatin evidence record from the current FDA KYXATA
  label, revised August 2025: Section 6.1, Tables 7 and 8, second-line
  single-agent therapy (`n=553`).
- Exact percentages, laboratory thresholds, denominator, ovarian-cancer
  population, dose context, and table locators remain private citation and
  provenance data. They are absent from the visible patient experience.
- Added a separately hash-bound, unreviewed patient presentation with broad
  qualitative groups, plain-language effects, FDA-supported warning signs, its
  own escalation summary, the cause limitation, and the universal emergency
  statement.
- Carboplatin remains catalogued as a breast-regimen component. The evidence
  record does not claim an FDA breast-cancer indication and does not claim that
  its frequencies describe TCH or TCHP.
- TCH now composes independent docetaxel, carboplatin, and trastuzumab sections.
  TCHP composes those same three independent sections and keeps pertuzumab as an
  explicit information-in-preparation component.
- All 26 evidence records and all 26 patient presentations remain `draft` with
  no recorded reviewer, review date, or approval.

### Release evidence

- Active preview: `build-week-preview-2026-07-18@0.6.0`.
- Content hash:
  `03e0d0b181ef357754faa9ea5b5aaf5327323a33ba99d11b5d508664e0035c3e`.
- Compiled JSON file SHA-256:
  `eefe178ffac743cf7deff10596f7e2240f2f50564e98a2abffbb0fd59000d020`.
- The release pins 260 exact object versions: 189 governed draft objects and
  71 source records. All 26 private numerical evidence objects remain outside
  the browser release and are hash-bound to their patient presentations.

### Verification

- `pnpm content:validate` — 287 repository objects; 0 errors and 0 warnings.
- `pnpm typecheck` — all three workspace packages passed.
- `pnpm test` — 146 unit and golden tests passed.
- `pnpm lint` — passed.
- `pnpm safety:scan` — 0 findings.
- `pnpm build:preview` — production-style preview build passed.
- `pnpm test:e2e` — all 44 mobile and desktop browser tests passed, including
  the direct carboplatin page, three populated TCH components, 320 px layout,
  print-state behaviour, and serious/critical axe scans.
- The carboplatin browser assertion confirms that ovarian-cancer wording,
  denominator, table numbers, percentages, grades, and dose context are absent
  from the visible patient experience.

## 2026-07-20 — cyclophosphamide FDA categorical page

### Scope and evidence boundary

- Added one private cyclophosphamide record from FDA label Reference ID
  `5546956`, revised March 2025. Section 6.1 identifies seven reactions as most
  common; Sections 4 and 5 provide the serious safety warnings.
- The FDA label supplies no percentages, usable denominator, or isolated
  single-agent safety population. The evidence record therefore stores the
  denominator as unavailable, preserves most-common as a source category, and
  keeps warning status separate from frequency.
- The patient page retains the existing disclosure, plain-language action,
  source, escalation, print, and emergency structure, but uses only “Common
  effects” and “Serious effects.” It displays no numerical frequency groups.
- TC and other regimen pages use the same independent cyclophosphamide card with
  a label-level evidence boundary; they do not describe its groups as regimen
  frequencies.
- All 27 evidence records and all 27 patient presentations remain `draft`, with
  no recorded reviewer, review date, or approval.

### Release evidence

- Active preview: `build-week-preview-2026-07-18@0.7.0`.
- Content hash:
  `1b112e16129cffb14528ecd727a57a8aa19e79fa8c9bc8fe1745703e9144c43c`.
- Compiled JSON file SHA-256:
  `7b9d27f046f260ecfcbda4ca626946a252adbac7cf27d8177a8a1bb874778b76`.
- The release pins 261 exact object versions: 190 governed draft objects and 71
  source records. All 27 private evidence objects remain outside the browser
  release and are hash-bound to their patient presentations.

### Verification

- `pnpm content:validate` — 289 repository objects; 0 errors and 0 warnings.
- `pnpm test` — 147 unit and golden tests passed.
- `pnpm lint` — passed.
- `pnpm typecheck` — all three workspace packages passed.
- `pnpm safety:scan` — 0 findings.
- `pnpm build:preview` — production-style preview build passed.
- `pnpm test:e2e` — all 46 mobile and desktop browser tests passed, including
  the standalone cyclophosphamide page and its independent TC regimen card.

## 2026-07-21 — treatment preparation for every treatment choice

### Patient experience

- Every one of the 53 drug choices and eight regimen choices now resolves a
  preparation guide. Weekly paclitaxel, capecitabine monotherapy, and AC use
  exact treatment overlays; the other 58 choices use one clearly labelled
  general systemic-treatment guide.
- Preparation appears before side-effect education. Exact preparation replaces
  the general fallback, while side-effect cards remain additive and preserve
  their individual-drug evidence boundaries.
- Weekly paclitaxel and the CAPE one-drug plan are searchable as treatment
  plans. `THREAD-CAPE-02` renders exact capecitabine preparation and its
  capecitabine side-effect card rather than a generic pending page.
- Preparation pages can be printed. Saved treatment IDs appear on the home
  screen and reopen the corresponding treatment page. “I don’t know my
  treatment” now provides practical next steps without asking the patient to
  guess.
- Missing side-effect evidence is labelled only as a side-effect gap; it no
  longer implies that preparation is unavailable.

### Content and safety boundary

- Added 15 new draft preparation modules, four draft weekly-paclitaxel
  successor modules, three new Canadian source records, and three directly
  rechecked CCO source versions.
- The resolver uses exact treatment modules first and only the explicitly
  authored `systemic-therapy` set as fallback. It never infers preparation from
  a regimen component or treatment class and fails closed on missing or
  duplicate authored order values.
- Active preparation copy excludes dose, schedule, food, fasting, transport,
  thermometer, medicine-change, fever-threshold, personalized-urgency, and
  local-policy instructions. An automated Flesch-Kincaid estimate keeps all
  four active preparation sets at or below grade 8.
- Every new or revised patient module remains `draft`; no reviewer, review date,
  approval, or clinical-use authorization was added.

### Release evidence

- Active preview: `build-week-preview-2026-07-18@0.12.0`.
- Content hash:
  `e6e48a385d21e8ec8692642439a6fc4d272828b0e809f3e97e76d69a08f59e56`.
- Compiled JSON file SHA-256:
  `ce235c2ca09c972315f4ef7781e37efef67a3c09f333b3c6e416efe11323542f`.
- The release pins 492 exact object versions: 391 governed draft objects and
  101 source records, including 139 active educational modules.

### Verification

- Content validation — 0 errors and 0 warnings across 555 repository objects.
- `pnpm test` — 170 unit and golden tests passed.
- `pnpm lint` — passed.
- `pnpm typecheck` — all three workspace packages passed.
- Safety scan — 0 findings across source content, compiled content, and summary
  fixtures.
- Production web build — passed with all application and API routes compiled.
- `pnpm test:e2e` — all 58 mobile and desktop browser/accessibility tests
  passed, including the preparation, treatment search, print, saved-treatment,
  320 px layout, and serious/critical axe checks.

## 2026-07-21 — three-question treatment preparation layout

### Patient experience

- Preparation is now organized around three questions: “What is this
  treatment?”, “What should I do before treatment?”, and “What should I have
  ready?”
- The questions form one numbered three-step list. The source-linked cause and
  emergency boundary remains visible as a separate safety note instead of
  appearing to be another preparation task.
- Exact-treatment and general-guide labels remain visible. Source links,
  printing, saved-treatment reopening, and the side-effect information below
  preparation are unchanged.
- The page uses semantic headings, an ordered list, restrained Kesis colours,
  and print-safe cards that fit at 320 px without horizontal scrolling.

### Content and safety boundary

- A pure display grouper reorganizes the already authored modules without
  changing, adding, or removing their patient guidance. It preserves their
  authored order and does not change the clinical resolver.
- Automated checks confirm that every module appears once, the source-linked
  boundary remains separate, and the three patient questions are populated for
  representative exact and general guides.
- All active preparation copy and the new interface copy have an automated
  Flesch-Kincaid estimate at or below grade 8. Technical navigation terms are
  rejected by a focused language guardrail.
- This is a presentation-only change. No clinical content, source record,
  reviewer, approval, release version, or content hash changed. All governed
  preparation modules remain `draft`.

### Release and verification evidence

- Active preview remains `build-week-preview-2026-07-18@0.12.0` with content
  hash
  `e6e48a385d21e8ec8692642439a6fc4d272828b0e809f3e97e76d69a08f59e56`.
- Content validation — 0 errors and 0 warnings; the 492-object active release
  and its 139 educational modules are unchanged.
- `pnpm test` — 172 unit and golden tests passed, including display grouping,
  ordering, boundary, completeness, and grade-level contracts.
- `pnpm lint` — passed.
- `pnpm typecheck` — all three workspace packages passed.
- Safety scan — 0 findings.
- Production web build — passed with all application and API routes compiled.
- `pnpm test:e2e` — all 58 mobile and desktop browser/accessibility tests
  passed in 18.8 seconds.

## 2026-07-21 — competition safety and treatment-page usability

### Patient experience

- The universal emergency statement is now a sticky, normal-body-size notice.
  Symptom pages state once, in plain language, that Ariad cannot determine the
  cause. Contact and urgent-help sections are always open and do not imply that
  Ariad calculated personal urgency.
- The competition build no longer shows saved-treatment controls. It removes
  the old Ariad treatment preference from the browser while keeping treatment
  codes, direct links, and printing available.
- Multi-drug regimens now use one closed whole-drug accordion per component in
  governed order. Opening an accordion shows that drug's complete presentation,
  evidence boundary, sources, and action information. A component without an
  eligible guide has its own clear not-ready state.
- Meaningful patient copy has a 16 px minimum in the web interface. Metadata may
  remain smaller. A patient-visible language guard rejects selected US spellings
  across the released patient content and interface source.
- The doxorubicin browser path now targets the stable drug-result control and
  checks the exact doxorubicin presentation instead of relying on stale copy.

### Safety and implementation boundary

- Regimen accordions compose only the already released single-drug pages. They
  do not combine frequencies, infer missing evidence, or create regimen-level
  guidance. Printing temporarily expands nested disclosures and restores the
  patient's open and closed state afterward.
- Treatment saving remains dormant behind an exact, default-off build flag.
  Preview, Docker, continuous-integration, and browser-test competition builds
  force it off.
- The safety hierarchy and interface changes do not alter governed clinical
  content, sources, reviewer records, approvals, release membership, or the
  clinical-use boundary. All governed patient content remains `draft`.

### Release evidence

- Active preview remains `build-week-preview-2026-07-18@0.12.0` with content
  hash
  `e6e48a385d21e8ec8692642439a6fc4d272828b0e809f3e97e76d69a08f59e56`.
- The active release remains 492 exact object versions with 139 educational
  modules; this work changes only application presentation, configuration,
  automated checks, and documentation.

### Verification

- `pnpm content:validate` — 555 repository objects; 0 errors and 0 warnings.
- `pnpm test` — all 174 unit and golden tests passed.
- `pnpm lint` — passed.
- `pnpm typecheck` — all three workspace packages passed.
- `pnpm safety:scan` — 0 findings across source content, compiled content, and
  summary fixtures.
- `pnpm build:preview` — passed with saving forced off and all application and
  API routes compiled; the release hash remained unchanged.
- `pnpm test:e2e` — all 62 mobile and desktop browser/accessibility tests
  passed, including safety hierarchy, saving removal, whole-drug accordion,
  print-state, 320 px, 16 px patient-copy, and doxorubicin checks.

## 2026-07-21 — bounded GPT-5.6 competition reauthorization

### Human-locked decision

- Reauthorize the existing bounded OpenAI paths for the competition preview.
- Use `gpt-5.6-luna` because Ariad's model tasks are small controlled-ID
  classification and neutral structured restatement, not clinical reasoning.
- Keep model use optional and fail closed. The repository default remains off;
  only the competition deployment may set `ENABLE_GPT56=true`.
- Keep all clinical guidance deterministic and release-controlled. Model output
  cannot diagnose, determine a cause, set urgency, or write treatment advice.

### Cost and access controls

- The competition key is scoped to the Ariad OpenAI project and remains only in
  ignored local storage and managed deployment secrets.
- The project has a $10 monthly budget with alerts at 50%, 80%, and 100%.
  The separate $10 prepaid balance with automatic recharge off is the spending
  backstop; the project budget itself should not be treated as a guaranteed
  hard stop.
- Luna project limits are 10,000 tokens per minute and three requests per
  minute. Ariad also limits input, output, request time, retries, and route use.
- The prepaid balance is $10 and automatic recharge is off.

### Controlled live verification

- A local production-style preview reported release
  `build-week-preview-2026-07-18@0.12.0`, content hash
  `e6e48a385d21e8ec8692642439a6fc4d272828b0e809f3e97e76d69a08f59e56`,
  and a ready `gpt-5.6-luna` runtime.
- One synthetic neuropathy classifier request returned HTTP 200 with
  `generationMode: openai`, selected the controlled
  `peripheral-neuropathy` ID, and supplied supporting phrases. No real patient
  information was used.
- The bounded provider timeout is 15 seconds, route duration is 20 seconds,
  retries remain off, structured output is required, and requests use
  `store: false`.
- The recorded demo remains a separate pending gate.

## 2026-07-21 — Cloudflare competition deployment

### Deployment boundary

- Deployed the explicitly unreviewed preview to Cloudflare Workers through
  OpenNext at [https://ariad.kesis.ca](https://ariad.kesis.ca).
- The first public application upload used commit
  `30692fefd757f407288fe8a684d011cb90e7d060` and Worker version
  `15fae213-1a82-4a5e-8b06-88ada103c048`.
- Adding the managed `OPENAI_API_KEY` secret created Worker version
  `5185c3bd-d089-48c6-b746-ce4c1de32870`. The secret value was not printed,
  committed, or added to a client-visible variable.
- The active public release remains the draft preview
  `build-week-preview-2026-07-18@0.12.0`, content hash
  `e6e48a385d21e8ec8692642439a6fc4d272828b0e809f3e97e76d69a08f59e56`,
  with `clinicalUse: false` and `containsUnapprovedContent: true`.

### Secret-safe build evidence

- A predeployment inspection found that the adapter could copy the root
  `.env.local` into its generated server environment file. That artifact was
  never deployed.
- The Cloudflare command wrapper now holds `.env.local` outside the adapter's
  input during build, removes `OPENAI_API_KEY` from the child environment, and
  restores the ignored local file in a `finally` path.
- A fresh generated artifact was searched for the exact local key value before
  deployment and contained no match. The compressed Worker bundle was
  1,269.46 KiB.

### Public verification

- The public home page loaded without an account, payment, invitation, or
  restricted route and visibly showed the unreviewed-prototype notice, the
  universal emergency statement, the cause boundary, and all three sample
  entry cards.
- Public `/api/health` returned HTTP 200 with the intended release and content
  hash, `gpt-5.6-luna` enabled, and a ready model status without exposing a
  secret. The response included the intended security headers.
- One synthetic public neuropathy request returned an OpenAI result and the
  controlled `peripheral-neuropathy` match. The patient interface visibly
  explained that AI only matched the supplied words to Ariad's symptom list
  and did not decide what was wrong or write medical advice.
- The stale viewport assertion that failed GitHub CI was replaced with a
  patient-centred overflow and reachability check. The focused Playwright check
  passed on mobile and desktop. Full local lint, typecheck, content validation,
  safety scan, 175 unit/golden tests, Cloudflare build, and Workers-runtime
  preview also passed.
- GitHub's connected workflow view does not expose push-only runs for this
  private branch, so the fresh remote CI result remains an explicit item to
  confirm in GitHub rather than an inferred pass.

### Credential closure

- The new project-scoped key is active and powers the verified public path.
- The owner revoked the older `Codex` key after the public path was proven.
  The OpenAI Platform then showed one active key: `Ariad OpenAI Buildweek`.
  No secret value was recorded in this evidence.

## 2026-07-21 — final public demo smoke test

### Deployed journeys

- Ran all three sample paths end to end at
  [https://ariad.kesis.ca](https://ariad.kesis.ca):
  - weekly paclitaxel with tingling, numbness, or burning;
  - capecitabine with diarrhea; and
  - AC chemotherapy with fever, chills, or feeling unwell.
- The neuropathy path visibly used AI only to match the synthetic wording to
  the controlled symptom list. It then completed all six questions and showed
  the fixed home, cancer-team contact, urgent-help, source, and summary modules.
- The diarrhea path completed all seven questions and kept the unresolved
  clinic fever instruction visible instead of inventing a threshold.
- The AC path completed all five questions and kept both the unresolved fever
  instruction and made-up clinic-contact warning visible.

### Public controls and safety boundaries

- The public home, About and limits page, Reset demo action, source panel, and
  unsupported-symptom path all worked. The prototype notice, emergency
  statement, cause boundary, treatment-change boundary, and synthetic-clinic
  warning remained visible where required.
- The neuropathy source panel listed three linked sources with organization,
  jurisdiction, and checked dates.
- The neutral neuropathy summary used only the synthetic answers and retained
  both the cause/seriousness boundary and universal emergency statement.
- Copy changed visibly to `Copied`. Download created
  `ariad-symptom-summary.txt` with the expected synthetic facts and both safety
  statements. The automated browser did not surface its download event, so the
  file's timestamp and contents were checked directly in the Downloads folder.
- The deployed Print action is present, and the exact-final GitHub CI run passed
  its print-state checks. Opening and closing the native print preview on the
  judging device remains a short manual check because the controlled browser
  does not expose that operating-system dialog.

### Mobile verification

- Tested the public home plus representative patient screens at 320, 375, 390,
  and 430 CSS pixels. At each size, the document width equalled the viewport
  width and no visible link, button, input, or text area crossed the viewport.
- Representative screens were the neuropathy symptom entry at 320 px,
  diarrhea question flow at 375 px, fever question flow at 390 px, and
  treatment entry at 430 px.
- At 320 px, the emergency bar remained pinned at the top after scrolling and
  the page still had no horizontal overflow.
- Manual keyboard-only and screen-reader smoke tests remain unchecked. The
  exact-final automated accessibility suite is green, but that is not recorded
  as a substitute for assistive-technology testing by a person.
