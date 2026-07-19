# Intended use

## Locked intended-use statement

> Ariad: Breast is a patient-facing educational tool for adults receiving
> systemic therapy for breast cancer. It provides treatment-specific
> side-effect education, low-risk home-management measures, and
> clinician-approved escalation information based on a selected treatment and
> symptom. It does not diagnose a toxicity, determine its cause, assign a
> toxicity grade, calculate a personalized escalation level, recommend changing
> or stopping cancer treatment, prescribe therapy, or replace the treating
> cancer team.

This is the product boundary for user experience, clinical content, tests,
runtime AI, and submission language.

## Current preview status

The locked statement describes the intended governed product. The Build Week
artifact is an **unreviewed educational prototype** and is **not for clinical
use**:

- all patient-facing modules are `draft`;
- reviewer and reviewed-date fields are `null`;
- there are no content or release approvals;
- the compiled artifact is a `preview` with `clinical_use: false`;
- the fictional clinic and all answers are synthetic/demo data.

The preview therefore must not be described as clinician approved. It exists to
demonstrate the product and governance architecture before clinical review.

## Intended population and setting

- Adults receiving systemic therapy for breast cancer.
- Patient-facing use alongside, not instead of, teaching and instructions from
  the treating cancer team.
- Breast-specific v1 content over a disease-agnostic knowledge architecture.
- Public-information and synthetic-data competition prototype only.

## Permitted functions

Ariad may:

- search a controlled treatment and symptom catalogue;
- show clearly labelled support/coverage status;
- map patient wording to one to three controlled symptom candidates;
- require the patient to confirm the category;
- ask a small number of patient-observable questions;
- reorder or emphasize already authored modules;
- display fixed sections titled “Contact your cancer team if…” and “Seek
  urgent medical attention if…”;
- restate supplied facts in a neutral summary;
- let the user copy, print, or download that summary;
- save selected treatment IDs locally on the device.

## Prohibited functions

Ariad must not:

- diagnose a toxicity or another condition;
- state or infer what caused a symptom;
- assign a CTCAE or other grade;
- calculate a personalized urgency or triage category;
- say that the individual should contact the team now or seek urgent care;
- recommend starting, stopping, holding, delaying, or changing treatment;
- prescribe or select a medicine or dose;
- reassure the user that a symptom is “normal”;
- replace the cancer team or emergency services;
- create a longitudinal patient record.

## Required visible boundaries

Every symptom experience must state, in concise language, that Ariad cannot
determine the cause, grade the symptom, or make a personal treatment/triage
decision. This universal statement remains independent of all answers and model
output:

> If you think you may be experiencing a medical emergency, call 911 or your
> local emergency service.

The warning is universal, not model-triggered. Fixed warning sections are
educational content; patient answers never turn them into a personalized
instruction.

## Language standard

Use cautious formulations such as “can occur with,” “may be associated with,”
“other conditions can cause similar symptoms,” and “follow the instructions
provided by your cancer team.” Avoid causal certainty, diagnostic labels,
autonomous reassurance, individualized treatment instructions, and personal
risk estimates.

See also [clinical safety](./clinical-safety.md), [product
scope](./product-scope.md), and [content governance](./content-governance.md).
