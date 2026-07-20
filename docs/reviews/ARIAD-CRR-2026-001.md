# Ariad: Breast clinician review record — ARIAD-CRR-2026-001

> This record documents clinician-led review of an exact frozen draft. Do not
> include patient information. Completion records clinical review only; it does
> not authorize publication, deployment, patient testing, clinical use, or a
> change to intended use.

## 1. Record control

| Field | Reviewer entry |
|---|---|
| Review record ID | `ARIAD-CRR-2026-001` |
| Record version | `1.0.0` |
| Review brief | `ARIAD-CRB-001@1.0.0` |
| Status | `open` |
| Review started | `2026-07-20T09:16:42-04:00` |
| Review completed | `pending` |
| Reviewer full name | `Henry Conter` |
| Credentials/specialty | `BESc MD MSF MSc FRCPC, Medical Oncology` |
| Professional role | `Clinician owner and primary clinical reviewer` |
| Jurisdiction | `not applicable` |
| Professional-standing verification | `not applicable` |
| Conflict declaration | `none` |
| Independent second reviewer | `not used` |

## 2. Frozen baseline

| Field | Recorded value | Independently confirmed? |
|---|---|---|
| Git commit | `a73de792a20da8a68d91081ccd1de3201b0c7df3` | `yes` |
| Git tree | `fe05bd2daf313e2b7bbdb26ff8ef460a7a31c05a` | `yes` |
| Release | `build-week-preview-2026-07-18@0.2.0` | `yes` |
| Compiled content hash | `80656c44ab5ab0707ae3417234c10415455e852fbd361e1ac05cd43363dafd4b` | `yes` |
| Compiled JSON file SHA-256 | `22bdf0f9d69453747cbda3444b14843d05ef8096b6b2c681b878159aabee9c86` | `yes` |
| LLM state | `disabled` | `yes; repository baseline is deterministic-only` |
| Rendered environment | `pending; no patient data permitted` | `pending` |
| Browser/device | `pending` | `pending` |

## 3. Declared scope

- [ ] Weekly paclitaxel preparation only
- [ ] Weekly paclitaxel and peripheral neuropathy
- [ ] Capecitabine and diarrhea
- [ ] AC and fever/infection concern
- [x] Full current release — attach a disposition row for all 130 governed objects
- [ ] Other exact scope

The declared scope is the full current-release review of all 130 governed
objects plus all 14 source records.

Explicit exclusions:

Any item that remains unreviewed or receives a disposition of
`defer/external adjudication` or `not applicable` is excluded from any accepted
scope. This scope declaration does not authorize release, publication,
deployment, patient testing, clinical use, or use of a real clinic identity or
contact route.

Exact object inventory attachment or manifest:

`content/releases/build-week-preview.yaml`, release
`build-week-preview-2026-07-18@0.2.0`; compiled content hash
`80656c44ab5ab0707ae3417234c10415455e852fbd361e1ac05cd43363dafd4b`;
compiled JSON SHA-256
`22bdf0f9d69453747cbda3444b14843d05ef8096b6b2c681b878159aabee9c86`.

### Prospective review-method clarification — 2026-07-20

> Clinical review covers patient-facing clinical content, clinically meaningful
> structured values, applicability, relationships, omissions, escalation
> language, and rendered clinical interpretation. Source records are verified
> as evidence inputs. Bibliographic and repository metadata are subject to
> engineering provenance QA and are not independently accepted as clinical
> content.

The 14 sources remain within the evidence-verification scope. They are not 14
independent clinical-approval decisions. This clarification is prospective and
does not alter the declared review scope or any preceding record commit.

## 4. Source verification log

Add one row for every source relied upon. `Repository verified` is not an
acceptable clinician decision.

| Source ID/version | Official URL | Title/issuer confirmed | Jurisdiction | Revision/version and access date | Exact locator(s) used | Supersession check | Applicability decision and rationale | Clinician disposition |
|---|---|---|---|---|---|---|---|---|
| `<source-id>@<version>` | `<URL>` | `<yes/no + correction>` | `<value>` | `<version>; accessed YYYY-MM-DD>` | `<page/section/heading>` | `<current/superseded/unclear>` | `<applicable/qualified/not applicable + why>` | `<accept/change/reject/defer>` |

## 5. Claim and object disposition matrix

Use one row for each sentence, bullet, structured clinical value, question,
answer option group, summary mapping, applicability field, support label, or
relationship mapping. Repeat rows as needed. Acceptance must be reproducible.

| Row ID | Exact object | File and field | Exact text/value | Claim ID | Source ID/version and locator | Support | Jurisdiction/regimen/population assessment | Omission or interpretation risk | Severity | Disposition | Requested change/rationale | Re-review exact version/hash | Final state |
|---|---|---|---|---|---|---|---|---|---|---|---|---|---|
| `CRB-001-R001` | `<kind:id@version>` | `<path; field>` | `<text or structured value>` | `<claim-id or none>` | `<source@version; page/heading>` | `<direct/partial/context/conflicting/not supported>` | `<assessment>` | `<assessment>` | `<blocker/major/minor/editorial/none>` | `<accept/change/reject/defer/not applicable>` | `<action and rationale>` | `<new exact ref/hash or n/a>` | `<open/closed-verified>` |

## 6. Rendered-path verification

| Scenario | Treatment/symptom | Synthetic answers and branches exercised | Modules/source panel correct | Emphasis remained non-triage | Boundary/emergency text correct | Summary neutral and accurate | Unsupported behavior correct | Findings |
|---|---|---|---|---|---|---|---|---|
| `<scenario-id>` | `<exact IDs>` | `<list>` | `<yes/no>` | `<yes/no>` | `<yes/no>` | `<yes/no>` | `<yes/no>` | `<finding IDs or none>` |

## 7. Mandatory adjudications

### Fever threshold, measurement, and destination

- Decision: `<accept a specific governed policy / retain no threshold and exclude path / defer>`
- Candidate sources and exact criteria: `<source/version/locator/context>`
- Selected criterion and measurement method: `<value or none>`
- Daytime destination: `<verified route or unresolved>`
- After-hours destination: `<verified route or unresolved>`
- Institution/jurisdiction: `<scope>`
- Rationale: `<clinical rationale>`
- Affected exact objects: `<list>`
- Independent/local-policy verification required: `<yes/no and owner>`

### Diarrhea discrepancy

- Ontario source/criterion/context: `<source/version/locator>`
- eviQ or other comparison source/criterion/context: `<source/version/locator>`
- Absolute count versus baseline decision: `<decision>`
- Duration/medicine qualifiers: `<decision>`
- Selected wording and rationale: `<decision>`
- Decision on `q-diarrhea-baseline-change`: `<include/remove/defer>`
- Affected exact objects: `<list>`

### Medicine and treatment-hold wording

- Team-directed OTC wording: `<accept/change/remove/defer>`
- Capecitabine hold/immediate-help omission: `<acceptable/not acceptable/defer + rationale>`
- Proposed governed location for any local instruction: `<module/policy binding/none>`

### Exact AC variant

- Variant/schedule: `<exact variant or unresolved>`
- Applicable source set: `<list>`
- Timing/nadir content permitted: `<none or exact approved wording>`
- Decision: `<narrow/keep timing-neutral/defer>`

### Neurological emergency wording

- Direct source support confirmed: `<yes/no + locators>`
- Placement in neuropathy pathway acceptable: `<yes/no + rationale>`
- Risk of diagnostic/grade confusion addressed: `<yes/no + rationale>`

### Cross-jurisdiction and source-age decisions

`<Record explicit decisions for eviQ, BC Cancer, 2015 fever guidance, legacy AC material, and any other aged or non-local source.>`

## 8. Findings log

| Finding ID | Exact object/field | Severity | Finding and harm/interpretation mechanism | Requested action | Engineering response | Revised exact object | Clinician closure | Status |
|---|---|---|---|---|---|---|---|---|
| `CRB-001-F001` | `<kind:id@version; field>` | `<blocker/major/minor/editorial>` | `<finding>` | `<action>` | `<accept/reject with rationale/clarification>` | `<kind:id@new-version or none>` | `<closed-verified by/date or pending>` | `<open/closed>` |

Open blocker findings: `pending`

Open major findings: `pending`

Unresolved/deferred objects excluded from the accepted scope: `pending`

## 9. Final accepted-object manifest

Populate only after remediation and exact re-review. Every accepted row must
ultimately receive a deterministic clinical payload hash before repository
content approval is created.

| Exact object | Clinical payload SHA-256 | Final disposition | Reviewer | Reviewed at | Review due/trigger | Approval scaffold generated? |
|---|---|---|---|---|---|---|
| `<kind:id@version>` | `<64-character hash; do not guess>` | `accept as written` | `<real name>` | `<ISO timestamp>` | `<date or trigger>` | `<yes/no>` |

## 10. Reviewer attestation

Complete only when all blocker and major findings in the stated scope are
closed and the accepted-object manifest is final.

> I, `<full name and credentials>`, reviewed the exact objects and source
> versions listed in Clinical Review Record `<ID/version>`. I verified each
> accepted statement against the documented source location, considered
> jurisdiction, regimen, population, and setting applicability, and assessed
> the wording and rendered context against Ariad's locked intended use and
> prohibited-function boundary. All blocking findings within my stated scope
> are closed. My acceptance applies only to the listed object versions and
> clinical payload hashes. It does not authorize release publication,
> deployment, patient testing, clinical use, or use outside the stated scope.
> Review due: `<date or explicit trigger-based policy>`.

| Signature field | Value |
|---|---|
| Reviewer name and credentials | `<value>` |
| Signed at | `<ISO-8601 timestamp with offset>` |
| Signature method | `<approved electronic signature / signed PDF / other>` |
| Evidence reference | `<secure evidence ID or path; no sensitive document in public Git>` |
| Evidence SHA-256 | `<hash or not applicable>` |
| Conflict declaration reaffirmed | `<yes/no>` |
| Explicit exclusions reaffirmed | `<list>` |

## 11. Handoff — not part of clinical sign-off

- [ ] Engineering generated deterministic per-object payload hashes and
      approval scaffolds.
- [ ] A second operator verified the hashes and exact object inventory.
- [ ] Content approvals were created only for accepted exact versions.
- [ ] A separate release candidate was built and verified.
- [ ] A separate release approval was requested/recorded.
- [ ] A separate research/testing authorization was requested/recorded.
- [ ] Publication, deployment, and clinical use remain unauthorized unless
      separately evidenced.
