# FDA single-drug toxicity coverage

Snapshot date: 2026-07-20

This is the coverage ledger for Ariad's patient-facing single-drug side-effect
pages. It documents evidence availability; it does not approve any clinical
content.

## Evidence rule

For each canonical drug, Ariad uses the current exact FDA Structured Product
Label and asks whether it contains a complete, breast-cancer-specific safety
population in which the drug is reported as a single agent. When more than one
eligible population exists, the selected context is the largest complete
population for a current labelled dose or formulation that can be attributed to
that drug alone.

The private evidence object retains the exact population, treatment arm,
denominator, comparator, dose and schedule, source locator, source event names,
and reported percentages. A separately hash-bound patient presentation contains
only qualitative frequency groups, Ariad-authored explanations and actions, the
cause limitation, an exact FDA source link, and the universal emergency
statement. Combination-arm rates are never attributed to an individual drug.

All evidence and patient presentations are `draft`. No reviewer identity,
review date, or approval has been recorded.

## Pages included in preview 0.5.0

Twenty-five of the 53 catalogue drugs meet the rule:

- abemaciclib, ado-trastuzumab emtansine, anastrozole, capecitabine,
  datopotamab deruxtecan;
- docetaxel, elacestrant, eribulin, exemestane, fulvestrant;
- goserelin, imlunestrant, ixabepilone, letrozole, neratinib;
- olaparib, conventional paclitaxel, protein-bound paclitaxel, sacituzumab
  govitecan, talazoparib;
- tamoxifen, toremifene, trastuzumab, trastuzumab deruxtecan, and vepdegestrant.

The exact population, denominator, dose, comparator, and FDA table or section
for each record are in the generated [review report](../content/review-report.md)
and the private source objects under `content/toxicity-evidence/`. The browser
release contains the 25 patient presentations but contains no
`drug_toxicity_evidence` objects.

Conventional paclitaxel and protein-bound paclitaxel remain separate. The
conventional product is bound to DailyMed SPL set
`ea28753a-8631-460a-bfdc-b101eb8ac84a`; the protein-bound formulation is bound
to `24d10449-2936-4cd3-b7db-a7683db721e4`.

## Intentional gaps

Twenty-eight catalogue drugs do not receive a patient page in this increment.
Their search result remains available, but the interface states that information
is being prepared.

Breast safety data in the selected FDA label are combination-only or do not
isolate the catalogue drug or formulation:

- alpelisib, capivasertib, epirubicin, everolimus, fluorouracil, gemcitabine,
  inavolisib, lapatinib;
- margetuximab, palbociclib, pembrolizumab,
  pembrolizumab–berahyaluronidase, pertuzumab, ribociclib,
  trastuzumab–hyaluronidase, and tucatinib.

The current FDA label does not provide a complete breast-specific single-agent
frequency table suitable for this transformation:

- conjugated estrogens, cyclophosphamide, doxorubicin, estradiol, megestrol
  acetate, methotrexate, methyltestosterone, testosterone enanthate, thiotepa,
  and vinblastine.

Additional exclusions:

- pertuzumab–trastuzumab–hyaluronidase is a fixed multi-ingredient product, not
  evidence for one component drug alone;
- carboplatin is retained only as a breast-regimen component and has no FDA
  breast-cancer treatment label.

These are evidence gaps, not claims that a drug has no side effects. A future
page requires a new, source-controlled evidence decision; it must not reuse a
combination rate or borrow a rate from another formulation.

## Release boundary

Preview `build-week-preview-2026-07-18@0.5.0` contains 258 objects and has
content hash
`e0de8058c3e9dd932c394bf56f252e7717506fdefd257ba61961862208b666d1`.
It is explicitly unreviewed, `clinical_use: false`, and not eligible for the
ordinary production build.
