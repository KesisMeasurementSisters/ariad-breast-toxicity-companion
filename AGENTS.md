# Ariad: Breast — repository instructions

## Product boundary

Ariad: Breast is a patient-facing educational prototype for adults receiving
systemic therapy for breast cancer. It may present fixed, source-controlled
home-management and escalation information. It must never diagnose, assign a
toxicity grade, infer causation, calculate personalized urgency, recommend a
treatment change, or replace the treating cancer team.

Every symptom experience must visibly state that the tool cannot determine the
cause and must include the universal emergency statement. Patient answers may
only reorder approved modules and create a neutral fact summary.

## Architecture boundaries

- `apps/web`: Next.js patient interface and bounded server routes.
- `packages/contracts`: shared Zod schemas and public types.
- `packages/knowledge-core`: pure content loading, validation, compilation,
  deterministic search, and guidance assembly.
- `content`: diff-friendly source objects with provenance and review metadata.
- `apps/web/src/generated`: immutable compiler output; never hand-edit it.
- Runtime AI handles language ambiguity and neutral communication only. It may
  select controlled IDs or restate supplied facts. It never authors guidance.
- No database, accounts, PHI, runtime web search, RAG, general chat, analytics,
  medical uploads, or server-side symptom history.

## Content governance

- Model-drafted clinical content remains `draft` until the clinician owner
  explicitly reviews and approves it.
- Never invent reviewer identity, review date, source, clinical fact, or local
  policy.
- A draft preview release requires
  `ALLOW_DRAFT_CONTENT=ARIAD_EXPLICIT_UNREVIEWED_PREVIEW` and must display
  an unreviewed-prototype notice. A production release may include only exact
  approved object versions and must fail closed otherwise.
- Preserve source jurisdiction, revision date, link, claim mapping, and known
  discrepancies. Do not copy authoritative documents wholesale.
- Methodology and releases are versioned. Supersession is prospective; do not
  silently rewrite published evidence.

## Commands

```bash
pnpm install
pnpm dev
pnpm lint
pnpm typecheck
pnpm test
pnpm test:e2e
pnpm content:validate
pnpm content:build
pnpm build
```

For the explicitly labelled unreviewed Build Week preview:

```bash
pnpm content:build:preview
pnpm build:preview
```

Before finishing a change, run the smallest relevant unit and golden tests,
then lint, typecheck, content validation, safety scan, and a preview build when
the affected surface warrants it.

## Git and safety

Follow the parent Kesis & Sisters git protocol. Never commit directly to
`main`; use `Codex/<short-slug>-YYYY-MM-DD`. Never force-push or auto-resolve a
rebase conflict. Do not expose `.env.local` or `OPENAI_API_KEY`. Do not approve
clinical content merely to make a build pass.
