# Demo video script — 2:58 target

This plan stays below the three-minute limit and uses only generic treatment
names and synthetic answers. Record in a mobile-width browser with audible
narration. Keep the preview banner and emergency boundary visible.

## Preflight

- Deploy or run the exact submission commit and preview release.
- Confirm `ENABLE_GPT56=true`, a valid server-side key, and `gpt-5.6`.
- Confirm `/api/health` reports the expected release and configured AI state.
  This checks configuration, not provider quota or successful inference.
- Run the sample neuropathy wording once. The confirmation screen should say
  GPT-5.6 performed the controlled-catalogue match; if it shows a deterministic
  fallback, fix configuration before recording.
- Reset the demo and clear saved treatments.
- Close notifications and unrelated tabs; use no real patient information.
- Record at 1080p or higher with clear audio. Do not add unlicensed music,
  trademarks, logos, or third-party creative assets.

## Timed recording

### 0:00–0:18 — Problem and product

**On screen:** Home, showing Ariad: Breast, prototype banner, and dual entry.

**Narration:**

> Breast-cancer treatment information is usually organized by medication, but
> patients often begin with a symptom and a practical question. Ariad: Breast
> creates one calm path from either treatment or symptom to source-controlled
> education. This is an unreviewed prototype, not for clinical use.

### 0:18–0:34 — Two entries, one knowledge source

**Action:** Point to “I’m starting treatment” and “I’m having a symptom,” then
scroll to the sample paths.

**Narration:**

> Both entries use the same versioned knowledge release. Coverage is explicit,
> and unsupported combinations fail safely rather than borrowing more specific
> guidance than the evidence allows.

### 0:34–0:58 — Visible GPT-5.6 symptom navigation

**Action:** Choose sample 01. Submit the prefilled sentence: “My fingertips feel
buzzy and small things keep slipping from my hand.”

**Narration:**

> The wording is deliberately unlike a clinical label. Ariad tries controlled
> aliases first; when confidence is insufficient, GPT-5.6 can select only from
> symptom IDs in the active release. It cannot diagnose or write advice.

**Action:** On the candidate screen, pause on the GPT-5.6 explanation, then
choose “Tingling, numbness, or burning.”

**Narration:**

> The patient must confirm the category before any guidance appears.

### 0:58–1:28 — Observable questions

**Action:** Rapidly answer the six neuropathy questions with synthetic values:
fingers; past week; getting stronger or spreading; small objects; no walking or
balance effect; no new weakness.

**Narration:**

> Questions ask only what a patient can observe—location, change, daily tasks,
> walking, and weakness. Answers can emphasize already authored sections and
> later become reportable facts. They never calculate a grade, cause, personal
> urgency, or treatment change.

### 1:28–1:57 — Deterministic guidance and sources

**Action:** Open “What you can generally do at home,” then “Contact your cancer
team if…”. Expand “Sources and review status.”

**Narration:**

> Every clinical paragraph and warning comes from fixed modules in this exact
> content release—not from GPT-5.6. The interface keeps the cause and emergency
> boundaries visible. Sources preserve organization and jurisdiction, and the
> panel honestly shows that no clinician review or approval date is recorded.

### 1:57–2:22 — Neutral summary

**Action:** Select “Create a summary for my cancer team.” Pause on the method
label and summary, then show copy/print/download.

**Narration:**

> GPT-5.6 may restate only the facts supplied in those questions. Each item must
> point back to valid source fields, and recommendation language is rejected.
> If the model is unavailable or validation fails, Ariad uses a deterministic
> template. The summary is not stored server-side.

### 2:22–2:38 — Coverage and local-only state

**Action:** Return home, briefly show treatment search and the code
`THREAD-PAC-01`, or select a catalogued-only treatment to show the coverage
boundary.

**Narration:**

> Treatment codes contain no personal information. Saved treatment IDs stay in
> versioned browser storage; Ariad has no accounts, database, analytics, or
> symptom history.

### 2:38–2:55 — Architecture and Codex contribution

**On screen:** README architecture diagram or a split view of `content/`, the
compiled release hash, and the app.

**Narration:**

> Codex built the mobile interface, strict schemas, deterministic compiler,
> safety checks, golden pathways, bounded server adapters, and documentation in
> the primary Build Week thread. The key safety separation is simple: GPT-5.6
> handles language ambiguity and communication; governed deterministic content
> handles clinical education and warnings.

### 2:55–2:58 — Close

**On screen:** Ariad wordmark and thread motif.

**Narration:**

> Ariad: Breast—a trusted thread through treatment.

## Recording integrity checklist

- Keep the final cut at or below 3:00; target 2:58.
- Include audible narration.
- Do not call draft content approved or ready for patients.
- Do not imply that a displayed fixed warning is a personal triage result.
- Show GPT-5.6 actually running; do not label a fallback as a model response.
- Show the persistent prototype notice at least twice.
- Avoid real clinic information and real patient answers.
- Export captions if the platform supports them; verify readability on mobile.
- Upload publicly to YouTube and watch the processed upload end to end.
