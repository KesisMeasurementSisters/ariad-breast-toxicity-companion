# Ariad: Breast clinician review record template

> Copy this template to a new versioned review record. Do not overwrite the
> template. Do not include patient information. Completion records clinical
> review only; it does not authorize publication, deployment, patient testing,
> clinical use, or a change to intended use.

## 1. Record control

| Field | Reviewer entry |
|---|---|
| Review record ID | `ARIAD-CRR-YYYY-NNN` |
| Record version | `1.0.0` |
| Review brief | `<brief-id>@<version>` |
| Status | `open`, `changes-required`, `ready-for-final-sign-off`, or `signed` |
| Review started | `<ISO-8601 timestamp with offset>` |
| Review completed | `<ISO-8601 timestamp with offset or pending>` |
| Reviewer full name | `<real name>` |
| Credentials/specialty | `<credentials and relevant expertise>` |
| Professional role | `<role>` |
| Jurisdiction | `<province/country>` |
| Professional-standing verification | `<reference or not recorded; keep sensitive evidence outside public Git>` |
| Conflict declaration | `<none, or describe and manage>` |
| Independent second reviewer | `<name/credentials or not used>` |

## 2. Frozen baseline

| Field | Recorded value | Independently confirmed? |
|---|---|---|
| Git commit | `<full commit SHA>` | `<yes/no>` |
| Git tree | `<full tree SHA>` | `<yes/no>` |
| Release | `<release-id>@<version>` | `<yes/no>` |
| Compiled content hash | `<release content hash>` | `<yes/no>` |
| Compiled JSON file SHA-256 | `<file SHA-256>` | `<yes/no>` |
| LLM state | `<enabled/disabled and exact configuration boundary>` | `<yes/no>` |
| Rendered environment | `<local URL/deployment ID; no patient data>` | `<yes/no>` |
| Browser/device | `<browser, version, OS, viewport/device>` | `<recorded>` |

## 3. Declared scope

Select one:

- [ ] Weekly paclitaxel preparation only
- [ ] Weekly paclitaxel and peripheral neuropathy
- [ ] Capecitabine and diarrhea
- [ ] AC and fever/infection concern
- [ ] Full exact release — record the governed-object count and attach its exact inventory
- [ ] Other exact scope: `<describe>`

Explicit exclusions:

`<List all paths, objects, jurisdictions, or decisions not reviewed. Anything not explicitly included remains unreviewed.>`

Exact object inventory attachment or manifest:

`<Path/evidence ID and SHA-256. Do not rely only on a narrative scope label.>`

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
| `CRB-NNN-R001` | `<kind:id@version>` | `<path; field>` | `<text or structured value>` | `<claim-id or none>` | `<source@version; page/heading>` | `<direct/partial/context/conflicting/not supported>` | `<assessment>` | `<assessment>` | `<blocker/major/minor/editorial/none>` | `<accept/change/reject/defer/not applicable>` | `<action and rationale>` | `<new exact ref/hash or n/a>` | `<open/closed-verified>` |

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

Open blocker findings: `<count and IDs>`

Open major findings: `<count and IDs>`

Unresolved/deferred objects excluded from the accepted scope: `<exact list>`

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
