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
  `d538f6870ef8f5c15349120d7e8a2f1e95aa4519ed5f8d0915dc4b1094760cbf`.
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
  release `0.1.1`, and `clinicalUse: false`.
