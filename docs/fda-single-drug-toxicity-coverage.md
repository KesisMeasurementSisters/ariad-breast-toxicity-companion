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
that drug alone. If no breast-specific single-agent population exists, a separate
source-controlled decision may use a coherent FDA single-agent population from
another indication. That exception must remain explicit in provenance and must
not be described as breast-specific or regimen-specific evidence.

The private evidence object retains the exact population, treatment arm,
denominator status, comparator, dose and schedule, source locator, source event
names, and reported percentages or categorical label terms. A separately
hash-bound patient presentation contains only patient-safe group labels,
Ariad-authored explanations and actions, the cause limitation, an exact FDA
source link, and the universal emergency statement. Study population,
indication, denominator, dose, table mapping, and exact percentages remain
citation and provenance data rather than patient-facing copy. Combination-arm
rates are never attributed to an individual drug.

When the FDA label provides no usable numerical single-agent population but
does explicitly identify the most common reactions and serious warnings, Ariad
may preserve those two FDA categories without inventing percentages or applying
the numerical frequency method. The private record must mark the denominator as
unavailable and must not claim that the evidence came from monotherapy.

All evidence and patient presentations are `draft`. No reviewer identity,
review date, or approval has been recorded.

## Pages included in preview 0.7.0

Twenty-seven of the 53 catalogue drugs have a governed patient page:

- abemaciclib, ado-trastuzumab emtansine, anastrozole, capecitabine,
  datopotamab deruxtecan;
- carboplatin, cyclophosphamide, docetaxel, elacestrant, eribulin, exemestane,
  fulvestrant;
- goserelin, imlunestrant, ixabepilone, letrozole, neratinib;
- olaparib, conventional paclitaxel, protein-bound paclitaxel, sacituzumab
  govitecan, talazoparib;
- tamoxifen, toremifene, trastuzumab, trastuzumab deruxtecan, and vepdegestrant.

The exact population, denominator, dose, comparator, and FDA table or section
for each record are in the generated [review report](../content/review-report.md)
and the private source objects under `content/toxicity-evidence/`. The browser
release contains the 27 patient presentations but contains no
`drug_toxicity_evidence` objects.

Carboplatin is the cross-indication exception. Its private record uses the
coherent 553-patient second-line single-agent population in FDA Tables 7 and 8.
The patient presentation does not expose the ovarian-cancer population,
denominator, dose context, table locators, or exact percentages, and it does not
claim that the values describe TCH or TCHP.

Cyclophosphamide is the categorical-label exception. The FDA label calls seven
reactions most common and separately identifies serious warnings, but provides
no percentages, usable denominator, or single-agent safety population. Its page
therefore shows only “Common effects” and “Serious effects.” The private record
stores `denominator_status: unavailable`, preserves unreported frequencies as
unavailable, and does not claim monotherapy evidence.

Conventional paclitaxel and protein-bound paclitaxel remain separate. The
conventional product is bound to DailyMed SPL set
`ea28753a-8631-460a-bfdc-b101eb8ac84a`; the protein-bound formulation is bound
to `24d10449-2936-4cd3-b7db-a7683db721e4`.

## Intentional gaps

Twenty-six catalogue drugs do not receive a patient page in this increment.
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

- conjugated estrogens, doxorubicin, estradiol, megestrol
  acetate, methotrexate, methyltestosterone, testosterone enanthate, thiotepa,
  and vinblastine.

Additional exclusion:

- pertuzumab–trastuzumab–hyaluronidase is a fixed multi-ingredient product, not
  evidence for one component drug alone.

These are evidence gaps, not claims that a drug has no side effects. A future
page requires a new, source-controlled evidence decision; it must not reuse a
combination rate or borrow a rate from another formulation.

## Release boundary

Preview `build-week-preview-2026-07-18@0.7.0` contains 261 objects and has
content hash
`1b112e16129cffb14528ecd727a57a8aa19e79fa8c9bc8fe1745703e9144c43c`.
It is explicitly unreviewed, `clinical_use: false`, and not eligible for the
ordinary production build.
