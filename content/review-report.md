# Ariad content review report

> Generated from repository content. Generation does not approve any content.

## Review summary

- Draft governed objects: 164
- Patient-facing modules: 22
- Approved patient-facing modules: 0
- Modules missing sources: 0
- Modules with unresolved placeholders: 2
- Source records: 70
- Clinic configuration versions: 2
- Structured clinic configuration v2 objects: 1
- Unresolved clinic policy bindings: 2

## Clinic configuration

| Clinic | Version | Mode | Status | Contacts | Fever policy | Supportive-care policy |
|---|---:|---|---|---:|---|---|
| build-week-demo-clinic | 1.0.0 | legacy_v1 | draft | legacy flat fields | retained history | retained history |
| build-week-demo-clinic | 2.0.0 | synthetic_demo | draft | 2 | unresolved | unresolved |

## Patient-facing modules

| Module | Version | Section | Status | Reviewer | Sources | Placeholders |
|---|---:|---|---|---|---:|---|
| ac-fever-infection-context | 1.0.0 | treatment_context | draft | — | 2 | — |
| capecitabine-diarrhea-context | 1.0.0 | treatment_context | draft | — | 3 | — |
| diarrhea-about | 1.0.0 | about | draft | — | 2 | — |
| diarrhea-contact-team | 1.0.0 | contact_team | draft | — | 2 | — |
| diarrhea-home-management | 1.0.0 | home_management | draft | — | 2 | — |
| diarrhea-reporting-checklist | 1.0.0 | reporting_checklist | draft | — | 2 | — |
| diarrhea-urgent-attention | 1.0.0 | urgent_attention | draft | — | 2 | clinic-specific fever threshold pending clinician review |
| fever-infection-about | 1.0.0 | about | draft | — | 2 | — |
| infection-contact-team | 1.0.0 | contact_team | draft | — | 2 | — |
| infection-home-preparation | 1.0.0 | home_management | draft | — | 2 | — |
| infection-reporting-checklist | 1.0.0 | reporting_checklist | draft | — | 3 | — |
| infection-urgent-attention | 1.0.0 | urgent_attention | draft | — | 3 | clinic-specific fever threshold and destination pending clinician review |
| neuropathy-about | 1.0.0 | about | draft | — | 3 | — |
| neuropathy-contact-team | 1.0.0 | contact_team | draft | — | 3 | — |
| neuropathy-home-safety | 1.0.0 | home_management | draft | — | 2 | — |
| neuropathy-reporting-checklist | 1.0.0 | reporting_checklist | draft | — | 2 | — |
| neuropathy-urgent-neurological-signs | 1.0.0 | urgent_attention | draft | — | 1 | — |
| paclitaxel-neuropathy-context | 1.0.0 | treatment_context | draft | — | 2 | — |
| weekly-paclitaxel-prep-overview | 1.0.0 | preparation | draft | — | 2 | — |
| weekly-paclitaxel-prep-possible-effects | 1.0.0 | preparation | draft | — | 2 | — |
| weekly-paclitaxel-prep-practical | 1.0.0 | preparation | draft | — | 2 | — |
| weekly-paclitaxel-prep-warning-boundary | 1.0.0 | preparation | draft | — | 2 | — |

## Source inventory

| Source | Organization | Jurisdiction | Verification | Link |
|---|---|---|---|---|
| bc-cancer-peripheral-neuropathy-handout | BC Cancer | British Columbia, Canada | verified | [Open](https://www.bccancer.bc.ca/managing-symptoms-site/Documents/Peripheral-Neuropathy.pdf) |
| cco-ac-breast-patient-information | Ontario Health (Cancer Care Ontario) | Ontario, Canada | verified | [Open](https://www.cancercareontario.ca/en/drugformulary/regimens/infosheet/46111) |
| cco-capecitabine-patient-information | Ontario Health (Cancer Care Ontario) | Ontario, Canada | verified | [Open](https://www.cancercareontario.ca/en/drugformulary/regimens/infosheet/45016) |
| cco-capedoce-breast-regimen | Ontario Health (Cancer Care Ontario) | Ontario, Canada | verified | [Open](https://www.cancercareontario.ca/en/drugformulary/regimens/monograph/45926) |
| cco-capetuca-tras-breast-regimen | Ontario Health (Cancer Care Ontario) | Ontario, Canada | verified | [Open](https://www.cancercareontario.ca/en/drugformulary/regimens/monograph/67556) |
| cco-fever-assessment-guideline | Ontario Health (Cancer Care Ontario) | Ontario, Canada | verified | [Open](https://www.cancercareontario.ca/en/guidelines-advice/types-of-cancer/1376) |
| cco-fever-patient-guide | Ontario Health (Cancer Care Ontario) | Ontario, Canada | verified | [Open](https://www.cancercareontario.ca/system/files_force/symptoms/CCOFeverPostcard.pdf?download=1) |
| cco-manage-diarrhea | Ontario Health (Cancer Care Ontario) | Ontario, Canada | verified | [Open](https://www.cancercareontario.ca/en/guidelines-advice/symptom-management/diarrhea/how-to-manage-diarrhea) |
| cco-paclitaxel-patient-information | Ontario Health (Cancer Care Ontario) | Ontario, Canada | verified | [Open](https://www.cancercareontario.ca/en/drugformulary/drugs/infosheet/44151) |
| cco-symptom-management-directory | Ontario Health (Cancer Care Ontario) | Ontario, Canada | link_only | [Open](https://www.cancercareontario.ca/en/symptom-management) |
| cco-systemic-treatment-information | Ontario Health (Cancer Care Ontario) | Ontario, Canada | link_only | [Open](https://www.cancercareontario.ca/en/drugformulary) |
| cco-tch-breast-regimen | Ontario Health (Cancer Care Ontario) | Ontario, Canada | verified | [Open](https://www.cancercareontario.ca/en/drugformulary/regimens/monograph/45506) |
| cco-tchp-breast-regimen | Ontario Health (Cancer Care Ontario) | Ontario, Canada | verified | [Open](https://www.cancercareontario.ca/en/drugformulary/regimens/monograph/62161) |
| eviq-dose-dense-ac-breast-patient-information | eviQ Cancer Treatments Online | Australia | verified | [Open](https://www.eviq.org.au/medical-oncology/breast/neoadjuvant-adjuvant/4102-breast-neoadjuvant-adjuvant-ac-doxorubicin-a/patient-information) |
| eviq-infection-during-cancer-treatment | eviQ Cancer Treatments Online | Australia | verified | [Open](https://www.eviq.org.au/getmedia/474a3ca7-e4da-4e2b-95ee-e026cd10028a/eviQ-PI-3098-Infection-during-cancer-treatment-V5-02.pdf.aspx?ext=.pdf) |
| eviq-weekly-paclitaxel-breast-patient-information | eviQ Cancer Treatments Online | Australia | verified | [Open](https://www.eviq.org.au/medical-oncology/breast/neoadjuvant-adjuvant/4103-breast-neoadjuvant-adjuvant-paclitaxel-weekly/patient-information) |
| fda-label-abemaciclib | U.S. Food and Drug Administration | United States | verified | [Open](https://www.accessdata.fda.gov/scripts/cder/daf/index.cfm?event=overview.process&ApplNo=208716) |
| fda-label-ado-trastuzumab-emtansine | U.S. Food and Drug Administration | United States | verified | [Open](https://www.accessdata.fda.gov/scripts/cder/daf/index.cfm?event=overview.process&ApplNo=125427) |
| fda-label-alpelisib | U.S. Food and Drug Administration | United States | verified | [Open](https://www.accessdata.fda.gov/scripts/cder/daf/index.cfm?event=overview.process&ApplNo=212526) |
| fda-label-anastrozole | U.S. Food and Drug Administration | United States | verified | [Open](https://www.accessdata.fda.gov/scripts/cder/daf/index.cfm?event=overview.process&ApplNo=020541) |
| fda-label-capecitabine | U.S. Food and Drug Administration | United States | verified | [Open](https://www.accessdata.fda.gov/scripts/cder/daf/index.cfm?event=overview.process&ApplNo=207652) |
| fda-label-capivasertib | U.S. Food and Drug Administration | United States | verified | [Open](https://www.accessdata.fda.gov/scripts/cder/daf/index.cfm?event=overview.process&ApplNo=218197) |
| fda-label-conjugated-estrogens | U.S. Food and Drug Administration | United States | verified | [Open](https://www.accessdata.fda.gov/scripts/cder/daf/index.cfm?event=overview.process&ApplNo=004782) |
| fda-label-cyclophosphamide | U.S. Food and Drug Administration | United States | verified | [Open](https://www.accessdata.fda.gov/scripts/cder/daf/index.cfm?event=overview.process&ApplNo=212501) |
| fda-label-datopotamab-deruxtecan | U.S. Food and Drug Administration | United States | verified | [Open](https://www.accessdata.fda.gov/scripts/cder/daf/index.cfm?event=overview.process&ApplNo=761394) |
| fda-label-docetaxel | U.S. Food and Drug Administration | United States | verified | [Open](https://www.accessdata.fda.gov/scripts/cder/daf/index.cfm?event=overview.process&ApplNo=022234) |
| fda-label-doxorubicin | U.S. Food and Drug Administration | United States | verified | [Open](https://www.accessdata.fda.gov/scripts/cder/daf/index.cfm?event=overview.process&ApplNo=050629) |
| fda-label-elacestrant | U.S. Food and Drug Administration | United States | verified | [Open](https://www.accessdata.fda.gov/scripts/cder/daf/index.cfm?event=overview.process&ApplNo=217639) |
| fda-label-epirubicin | U.S. Food and Drug Administration | United States | verified | [Open](https://www.accessdata.fda.gov/scripts/cder/daf/index.cfm?event=overview.process&ApplNo=050778) |
| fda-label-eribulin | U.S. Food and Drug Administration | United States | verified | [Open](https://www.accessdata.fda.gov/scripts/cder/daf/index.cfm?event=overview.process&ApplNo=201532) |
| fda-label-estradiol | U.S. Food and Drug Administration | United States | verified | [Open](https://www.accessdata.fda.gov/scripts/cder/daf/index.cfm?event=overview.process&ApplNo=040275) |
| fda-label-everolimus | U.S. Food and Drug Administration | United States | verified | [Open](https://www.accessdata.fda.gov/scripts/cder/daf/index.cfm?event=overview.process&ApplNo=022334) |
| fda-label-exemestane | U.S. Food and Drug Administration | United States | verified | [Open](https://www.accessdata.fda.gov/scripts/cder/daf/index.cfm?event=overview.process&ApplNo=020753) |
| fda-label-fluorouracil | U.S. Food and Drug Administration | United States | verified | [Open](https://www.accessdata.fda.gov/scripts/cder/daf/index.cfm?event=overview.process&ApplNo=040278) |
| fda-label-fulvestrant | U.S. Food and Drug Administration | United States | verified | [Open](https://www.accessdata.fda.gov/scripts/cder/daf/index.cfm?event=overview.process&ApplNo=210063) |
| fda-label-gemcitabine | U.S. Food and Drug Administration | United States | verified | [Open](https://www.accessdata.fda.gov/scripts/cder/daf/index.cfm?event=overview.process&ApplNo=200795) |
| fda-label-goserelin | U.S. Food and Drug Administration | United States | verified | [Open](https://www.accessdata.fda.gov/scripts/cder/daf/index.cfm?event=overview.process&ApplNo=019726) |
| fda-label-imlunestrant | U.S. Food and Drug Administration | United States | verified | [Open](https://www.accessdata.fda.gov/scripts/cder/daf/index.cfm?event=overview.process&ApplNo=218881) |
| fda-label-inavolisib | U.S. Food and Drug Administration | United States | verified | [Open](https://www.accessdata.fda.gov/scripts/cder/daf/index.cfm?event=overview.process&ApplNo=219249) |
| fda-label-ixabepilone | U.S. Food and Drug Administration | United States | verified | [Open](https://www.accessdata.fda.gov/scripts/cder/daf/index.cfm?event=overview.process&ApplNo=022065) |
| fda-label-lapatinib | U.S. Food and Drug Administration | United States | verified | [Open](https://www.accessdata.fda.gov/scripts/cder/daf/index.cfm?event=overview.process&ApplNo=022059) |
| fda-label-letrozole | U.S. Food and Drug Administration | United States | verified | [Open](https://www.accessdata.fda.gov/scripts/cder/daf/index.cfm?event=overview.process&ApplNo=020726) |
| fda-label-margetuximab | U.S. Food and Drug Administration | United States | verified | [Open](https://www.accessdata.fda.gov/scripts/cder/daf/index.cfm?event=overview.process&ApplNo=761150) |
| fda-label-megestrol-acetate | U.S. Food and Drug Administration | United States | verified | [Open](https://www.accessdata.fda.gov/scripts/cder/daf/index.cfm?event=overview.process&ApplNo=072423) |
| fda-label-methotrexate | U.S. Food and Drug Administration | United States | verified | [Open](https://www.accessdata.fda.gov/scripts/cder/daf/index.cfm?event=overview.process&ApplNo=011719) |
| fda-label-methyltestosterone | U.S. Food and Drug Administration | United States | verified | [Open](https://www.accessdata.fda.gov/scripts/cder/daf/index.cfm?event=overview.process&ApplNo=204851) |
| fda-label-neratinib | U.S. Food and Drug Administration | United States | verified | [Open](https://www.accessdata.fda.gov/scripts/cder/daf/index.cfm?event=overview.process&ApplNo=208051) |
| fda-label-olaparib | U.S. Food and Drug Administration | United States | verified | [Open](https://www.accessdata.fda.gov/scripts/cder/daf/index.cfm?event=overview.process&ApplNo=208558) |
| fda-label-paclitaxel | U.S. Food and Drug Administration | United States | verified | [Open](https://www.accessdata.fda.gov/scripts/cder/daf/index.cfm?event=overview.process&ApplNo=217877) |
| fda-label-paclitaxel-protein-bound | U.S. Food and Drug Administration | United States | verified | [Open](https://www.accessdata.fda.gov/scripts/cder/daf/index.cfm?event=overview.process&ApplNo=021660) |
| fda-label-palbociclib | U.S. Food and Drug Administration | United States | verified | [Open](https://www.accessdata.fda.gov/scripts/cder/daf/index.cfm?event=overview.process&ApplNo=212436) |
| fda-label-pembrolizumab | U.S. Food and Drug Administration | United States | verified | [Open](https://www.accessdata.fda.gov/scripts/cder/daf/index.cfm?event=overview.process&ApplNo=125514) |
| fda-label-pembrolizumab-berahyaluronidase | U.S. Food and Drug Administration | United States | verified | [Open](https://www.accessdata.fda.gov/scripts/cder/daf/index.cfm?event=overview.process&ApplNo=761467) |
| fda-label-pertuzumab | U.S. Food and Drug Administration | United States | verified | [Open](https://www.accessdata.fda.gov/scripts/cder/daf/index.cfm?event=overview.process&ApplNo=125409) |
| fda-label-pertuzumab-trastuzumab-hyaluronidase | U.S. Food and Drug Administration | United States | verified | [Open](https://www.accessdata.fda.gov/scripts/cder/daf/index.cfm?event=overview.process&ApplNo=761170) |
| fda-label-ribociclib | U.S. Food and Drug Administration | United States | verified | [Open](https://www.accessdata.fda.gov/scripts/cder/daf/index.cfm?event=overview.process&ApplNo=209092) |
| fda-label-sacituzumab-govitecan | U.S. Food and Drug Administration | United States | verified | [Open](https://www.accessdata.fda.gov/scripts/cder/daf/index.cfm?event=overview.process&ApplNo=761115) |
| fda-label-talazoparib | U.S. Food and Drug Administration | United States | verified | [Open](https://www.accessdata.fda.gov/scripts/cder/daf/index.cfm?event=overview.process&ApplNo=217439) |
| fda-label-tamoxifen | U.S. Food and Drug Administration | United States | verified | [Open](https://www.accessdata.fda.gov/scripts/cder/daf/index.cfm?event=overview.process&ApplNo=021807) |
| fda-label-testosterone-enanthate | U.S. Food and Drug Administration | United States | verified | [Open](https://www.accessdata.fda.gov/scripts/cder/daf/index.cfm?event=overview.process&ApplNo=212659) |
| fda-label-thiotepa | U.S. Food and Drug Administration | United States | verified | [Open](https://www.accessdata.fda.gov/scripts/cder/daf/index.cfm?event=overview.process&ApplNo=208264) |
| fda-label-toremifene | U.S. Food and Drug Administration | United States | verified | [Open](https://www.accessdata.fda.gov/scripts/cder/daf/index.cfm?event=overview.process&ApplNo=212818) |
| fda-label-trastuzumab | U.S. Food and Drug Administration | United States | verified | [Open](https://www.accessdata.fda.gov/scripts/cder/daf/index.cfm?event=overview.process&ApplNo=103792) |
| fda-label-trastuzumab-deruxtecan | U.S. Food and Drug Administration | United States | verified | [Open](https://www.accessdata.fda.gov/scripts/cder/daf/index.cfm?event=overview.process&ApplNo=761139) |
| fda-label-trastuzumab-hyaluronidase | U.S. Food and Drug Administration | United States | verified | [Open](https://www.accessdata.fda.gov/scripts/cder/daf/index.cfm?event=overview.process&ApplNo=761106) |
| fda-label-tucatinib | U.S. Food and Drug Administration | United States | verified | [Open](https://www.accessdata.fda.gov/scripts/cder/daf/index.cfm?event=overview.process&ApplNo=213411) |
| fda-label-vepdegestrant | U.S. Food and Drug Administration | United States | verified | [Open](https://www.accessdata.fda.gov/scripts/cder/daf/index.cfm?event=overview.process&ApplNo=219835) |
| fda-label-vinblastine | U.S. Food and Drug Administration | United States | verified | [Open](https://www.accessdata.fda.gov/scripts/cder/daf/index.cfm?event=overview.process&ApplNo=089515) |
| health-canada-capecitabine-product-record | Health Canada | Canada | verified | [Open](https://health-products.canada.ca/dpd-bdpp/info?code=100911&lang=eng) |
| health-canada-fluoropyrimidine-infowatch | Health Canada | Canada | verified | [Open](https://www.canada.ca/en/health-canada/services/drugs-health-products/medeffect-canada/health-product-infowatch/march-2025.html) |

## Required clinical-owner decisions

- Review and edit every patient-facing module and its claim-to-source mapping.
- Replace synthetic identity and contact fixtures with verified institutional data before any published release.
- Define governed policy-purpose compatibility and exact runtime rendering, then resolve fever and supportive-care through approved module references; exact references alone are not publishable in P0.
- Resolve the Ontario/eviQ diarrhea-threshold discrepancy.
- Confirm the exact AC regimen variant before any cycle-timing statement is introduced.
- Decide whether any team-directed over-the-counter medicine module is appropriate; none is approved here.
- Create content and release approval evidence only after review. The compiler never approves content.
