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
- Installed the official OpenAI Developer Docs MCP for subsequent sessions and
  used official OpenAI web documentation as the current-session fallback.
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
  `b3e8b481b45e0004f01d68ea8c5150e6f0ad4a1dc0ab62291bbd2e9efe630ad5`.
- `pnpm safety:scan` — zero prohibited-language findings.
- `pnpm test` — 19 tests passed, including golden pathways, hash
  reproducibility, safety invariants, and deterministic recognition.

### Clinical review required

- All patient-facing clinical modules and warning criteria.
- Every claim-to-source mapping and selected jurisdictional wording.
- Any clinic-specific fever or supportive-care wording.
- Approval and publication of an immutable production content release.

### Known limitations / next work

- Foundation in progress; no content is approved or published.
- `/feedback` Codex Session ID: **TODO before submission**.
