# OpenAI Build Week submission checklist

Use the official Devpost [rules](https://openai.devpost.com/rules) and
[FAQ](https://openai.devpost.com/details/faqs) as the final source of truth.
This checklist records gates; unchecked items are not claims of completion.

Current owner decision (2026-07-19): GPT-5.6 is disabled while development
focuses on deterministic behavior and clinic data. Live-model and video checks
remain deferred until explicit reauthorization.

Recorded deadline: **Tuesday, July 21, 2026 at 5:00 PM Pacific / 8:00 PM
Toronto**. Reconfirm the deadline and eligibility on Devpost before submitting.

## Submission identity

- [ ] Track selected: **Apps for Your Life**.
- [ ] Project name: **Ariad: Breast**.
- [ ] Descriptor: **A breast cancer treatment side-effect companion**.
- [ ] Product line: **A trusted thread through treatment**.
- [ ] Team/company details are accurate.
- [ ] All required Devpost fields and declarations are complete.

## Working demo

- [ ] Deploy the exact final submission commit to a public URL.
- [ ] Keep the demo free and available through the judging period.
- [ ] Verify no login, payment, invitation, or restricted route is required.
- [ ] Verify mobile behavior at approximately 320, 375, 390, and 430 px.
- [ ] Run all three sample scenarios against the deployed URL.
- [ ] Verify the GPT-5.6 neuropathy path visibly reports an OpenAI result.
- [x] Verify deterministic behavior locally with `ENABLE_GPT56=false`.
- [x] Verify `/api/health` reports the intended release and configured AI state without
  exposing secrets.
- [ ] Verify the prototype notice, emergency boundary, About/limits, reset,
  sources, and unsupported path.
- [ ] Verify summary copy, print, and download.
- [x] Replace README screenshot placeholders with final local evidence images.
- [ ] Add the live URL to `README.md` and the Devpost submission.

## Video

- [ ] Follow [demo-script.md](./demo-script.md).
- [ ] Public YouTube video is **three minutes or less** and includes audio.
- [ ] Verify final processed duration and audio on desktop and mobile.
- [ ] Show the actual working demo, not only slides or mockups.
- [ ] Explain what Codex built and how the primary task was used.
- [ ] Show and explain the real GPT-5.6 integration.
- [ ] Explain why the model is separated from deterministic clinical guidance.
- [ ] State clearly that the content is unreviewed and not for clinical use.
- [ ] Use synthetic inputs and generic drug names where practical.
- [ ] Use no unauthorized trademarks, logos, music, footage, fonts, or other
  third-party creative assets.
- [ ] Add the public YouTube URL to `README.md` and Devpost.

## Repository and documentation

- [ ] Repository URL is correct and points to the submission history.
- [ ] If public, make and document an explicit open-source licence decision.
- [ ] If private, grant access to `testing@devpost.com` and
  `build-week-event@openai.com`, then verify access.
- [ ] README setup works from a clean clone.
- [x] README includes sample paths, architecture, intended use, GPT-5.6 use,
  Codex collaboration, privacy, limitations, and future direction.
- [ ] `BUILD_WEEK.md` contains final commits, checks, deployment evidence,
  limitations, and the primary `/feedback` Session ID.
- [ ] Documentation links and external source links resolve.
- [x] No `.env.local`, API key, token, private URL, or sensitive log is tracked.
- [ ] Repository contains only assets authorized for distribution.

## Verification

Record the exact final commit and results in `BUILD_WEEK.md` rather than
checking boxes from memory.

- [x] `pnpm install --frozen-lockfile`
- [x] `pnpm lint`
- [x] `pnpm typecheck`
- [x] `pnpm test`
- [x] `pnpm content:validate`
- [x] `pnpm safety:scan`
- [x] `pnpm content:report` and inspect the diff
- [x] `pnpm build:preview`
- [x] `pnpm test:e2e`
- [x] Automated accessibility check
- [ ] Manual keyboard-only smoke test with visible focus
- [ ] Manual screen-reader label/landmark smoke test
- [ ] Mobile visual QA and print-summary QA
- [ ] Clean `git status` at the submission commit

## Clinical-safety and governance gate

- [x] Confirm the locally verified release is still `preview`,
  `clinical_use: false`, and visibly unreviewed.
- [x] Confirm no patient-facing object was changed to `approved` or
  `published` without an explicit real clinical review.
- [x] Confirm reviewer/date/approval fields remain null unless genuine evidence
  was created by the owner.
- [x] Confirm the fictional clinic is labelled synthetic and no real contact
  data was introduced.
- [x] Confirm no local fever threshold or AC timing was invented.
- [x] Confirm answers only influence emphasis and summary facts.
- [x] Confirm all guidance is sourced from the compiled release, not the model.
- [x] Confirm no diagnosis, grade, causal certainty, personalized triage,
  prescription, or treatment-change language appears.
- [x] Confirm every symptom experience includes the cause boundary and universal
  emergency statement.
- [x] Confirm source/review panels disclose zero clinical approvals.

These checks do not authorize real clinical use. Full clinical-owner review is
a post-prototype governance gate.

## Privacy and security gate

- [x] Confirm no accounts, database, server symptom history, medical uploads,
  analytics, ads, or tracking pixels were added.
- [x] Confirm only saved treatment IDs/notice state persist locally.
- [x] Confirm raw symptom text and summaries are absent from application logs.
- [x] Confirm OpenAI requests use server-side credentials, structured output,
  input limits, timeout, no retries, `store: false`, same-origin protection, and
  rate limiting.
- [ ] Confirm security headers on the deployed URL.
- [x] Confirm the UI asks users not to enter identifying information.
- [ ] Rotate the competition key after the judging period or immediately on any
  suspected exposure.

## Codex evidence and final handoff

- [ ] Run `/feedback` in the **primary Codex build task**.
- [ ] Paste the returned Session ID into `BUILD_WEEK.md`, `README.md`, and the
  Devpost field.
- [ ] Ensure the Session ID corresponds to the primary build thread with the
  majority of core implementation.
- [ ] Add final deployment URL, video URL, commit SHA, and timestamp.
- [ ] Perform one final Devpost preview before submitting.
- [ ] Submit before the deadline; capture confirmation evidence.

## Current known clinical-review queue

Do not mark these resolved unless the owner actually completes the review:

- [ ] All 22 patient-facing modules and claim-to-source mappings.
- [ ] Fever threshold and destination decision for the synthetic clinic, or an
  explicit decision to retain no threshold.
- [ ] Ontario/eviQ diarrhea-threshold discrepancy.
- [ ] Exact AC regimen variant before any cycle/nadir timing.
- [ ] Team-directed over-the-counter medicine wording, if any.
- [ ] Genuine content approval evidence and an immutable production release.
