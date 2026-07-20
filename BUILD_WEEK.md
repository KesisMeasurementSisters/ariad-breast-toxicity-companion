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
