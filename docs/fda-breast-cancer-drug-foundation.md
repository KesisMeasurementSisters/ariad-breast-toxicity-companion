# FDA breast-cancer drug foundation

Snapshot date: 2026-07-20

This document defines the drug identities that Ariad may expose in treatment
search. It does not approve patient-facing clinical guidance.

## Inclusion rule

A canonical drug is included with
`catalogue_basis: fda_breast_cancer_treatment` when an exact current U.S. Food
and Drug Administration prescription label contains a breast-cancer treatment
indication in `indications_and_usage`.

The rule includes indication-specific restrictions such as disease stage,
biomarker, treatment setting, prior therapy, or required combination. Those
restrictions remain part of the source evidence and must not be generalized.
An FDA label in this catalogue establishes regulatory scope; it does not imply
that the treatment is suitable for a particular patient or preferred in a
current clinical guideline.

The initial snapshot excludes:

- supportive medicines without their own breast-cancer treatment indication;
- prevention-only or risk-reduction-only products without a treatment indication;
- diagnostic, imaging, and localization products;
- therapies whose only relevant approval is tumour-agnostic;
- discontinued-only products.

Current labels for older palliative breast-cancer treatments remain in scope.

## Canonical identity rule

Search returns one canonical drug identity for its generic name, brand names,
and governed aliases. Dosage forms, strengths, routes, applications, and label
versions are provenance, not separate search results.

- Biosimilars collapse into the canonical reference biologic and remain searchable
  through their brand and non-proprietary aliases.
- A fixed-dose multi-ingredient product is one canonical drug.
- A separately approved formulation may remain separate only when its formulation
  and safety context are materially distinct.
- Historical brand names may remain aliases when the canonical drug is otherwise
  in scope.

Carboplatin is the sole initial
`catalogue_basis: breast_regimen_component` entry. It is retained because it is
an explicit component of source-verified breast regimens, but it does not claim
an FDA breast-cancer treatment indication.

## Exact source and safety contract

Every FDA-based drug pins:

- application number;
- Structured Product Label set ID and effective date;
- current prescription marketing status;
- exact FDA product names, dosage forms, and routes;
- the `indications_and_usage` locator;
- the safety sections present in that exact label; and
- a governed source record linked to an exact official label or Drugs@FDA
  application record.

Twenty-seven FDA-based entries remain `source_indexed`; 25 are `event_mapped`.
Each private draft evidence object preserves the exact breast-cancer population,
single-drug context, denominator, dose, comparator, source table, event names,
and numerical measures. Combination-arm observations must not be attributed to
one component drug. The eligibility decisions and 28 intentional gaps are in
the [single-drug coverage ledger](./fda-single-drug-toxicity-coverage.md).

Each patient presentation is bound to its exact evidence payload by version and
hash. Build validation checks each qualitative group against the matching
all-grade source value. The browser release excludes the raw numerical evidence,
severity values, laboratory cut-offs, and dose context. All evidence and patient
wording remain unreviewed drafts.

## Search behavior

- Search begins after two characters and shows at most three live results.
- A generic or brand match resolves to one canonical drug result.
- Source-verified multi-drug regimens containing that exact drug may follow it.
- Single-drug regimen aliases are excluded because they duplicate the drug result.
- Regimen abbreviations and full component names are searchable.
- A selected regimen opens ordered, separate cards for every component drug.
- A source-indexed drug without approved presentation content opens a clear
  information-in-preparation fallback.
- Selecting any of the 25 event-mapped drugs alone opens its draft patient-only
  side-effect presentation. Selecting a regimen does not reuse a single-drug
  presentation as combination evidence.
