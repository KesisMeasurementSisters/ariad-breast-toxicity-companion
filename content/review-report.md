# Ariad content review report

> Generated from repository content. Generation does not approve any content.

## Review summary

- Draft governed objects: 520
- Patient-facing modules: 159
- Approved patient-facing modules: 0
- Private drug toxicity evidence records: 30
- Patient drug toxicity presentations: 30
- Approved patient drug toxicity presentations: 0
- Modules missing sources: 0
- Modules with unresolved placeholders: 4
- Source records: 104
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
| ac-prep-boundary | 1.0.0 | preparation | draft | — | 1 | — |
| ac-prep-medicine-list | 1.0.0 | preparation | draft | — | 2 | — |
| ac-prep-overview | 1.0.0 | preparation | draft | — | 1 | — |
| ac-prep-questions | 1.0.0 | preparation | draft | — | 2 | — |
| ac-prep-tests | 1.0.0 | preparation | draft | — | 2 | — |
| appetite-taste-about | 1.0.0 | about | draft | — | 1 | — |
| appetite-taste-contact-team | 1.0.0 | contact_team | draft | — | 1 | — |
| appetite-taste-home-management | 1.0.0 | home_management | draft | — | 1 | — |
| appetite-taste-urgent-attention | 1.0.0 | urgent_attention | draft | — | 2 | — |
| bleeding-bruising-about | 1.0.0 | about | draft | — | 2 | — |
| bleeding-bruising-contact-team | 1.0.0 | contact_team | draft | — | 2 | — |
| bleeding-bruising-home-management | 1.0.0 | home_management | draft | — | 2 | — |
| bleeding-bruising-urgent-attention | 1.0.0 | urgent_attention | draft | — | 3 | — |
| blood-clot-warning-about | 1.0.0 | about | draft | — | 1 | — |
| blood-clot-warning-contact-team | 1.0.0 | contact_team | draft | — | 1 | — |
| blood-clot-warning-home-management | 1.0.0 | home_management | draft | — | 1 | — |
| blood-clot-warning-urgent-attention | 1.0.0 | urgent_attention | draft | — | 1 | — |
| capecitabine-diarrhea-context | 1.0.0 | treatment_context | draft | — | 3 | — |
| capecitabine-prep-boundary | 1.0.0 | preparation | draft | — | 1 | — |
| capecitabine-prep-medicine-list | 1.0.0 | preparation | draft | — | 2 | — |
| capecitabine-prep-overview | 1.0.0 | preparation | draft | — | 1 | — |
| capecitabine-prep-questions | 1.0.0 | preparation | draft | — | 2 | — |
| capecitabine-prep-tests | 1.0.0 | preparation | draft | — | 2 | — |
| chest-symptoms-about | 1.0.0 | about | draft | — | 1 | — |
| chest-symptoms-contact-team | 1.0.0 | contact_team | draft | — | 1 | — |
| chest-symptoms-home-management | 1.0.0 | home_management | draft | — | 1 | — |
| chest-symptoms-urgent-attention | 1.0.0 | urgent_attention | draft | — | 1 | — |
| constipation-about | 1.0.0 | about | draft | — | 1 | — |
| constipation-contact-team | 1.0.0 | contact_team | draft | — | 1 | — |
| constipation-home-management | 1.0.0 | home_management | draft | — | 1 | — |
| constipation-urgent-attention | 1.0.0 | urgent_attention | draft | — | 1 | — |
| diarrhea-about | 1.0.0 | about | draft | — | 2 | — |
| diarrhea-contact-team | 1.0.0 | contact_team | draft | — | 2 | — |
| diarrhea-home-management | 1.0.0 | home_management | draft | — | 2 | — |
| diarrhea-reporting-checklist | 1.0.0 | reporting_checklist | draft | — | 2 | — |
| diarrhea-urgent-attention | 1.0.0 | urgent_attention | draft | — | 2 | clinic-specific fever threshold pending clinician review |
| dizziness-about | 1.0.0 | about | draft | — | 2 | — |
| dizziness-contact-team | 1.0.0 | contact_team | draft | — | 2 | — |
| dizziness-home-management | 1.0.0 | home_management | draft | — | 2 | — |
| dizziness-urgent-attention | 1.0.0 | urgent_attention | draft | — | 3 | — |
| edema-swelling-about | 1.0.0 | about | draft | — | 2 | — |
| edema-swelling-contact-team | 1.0.0 | contact_team | draft | — | 2 | — |
| edema-swelling-home-management | 1.0.0 | home_management | draft | — | 2 | — |
| edema-swelling-urgent-attention | 1.0.0 | urgent_attention | draft | — | 3 | — |
| eye-vision-about | 1.0.0 | about | draft | — | 1 | — |
| eye-vision-contact-team | 1.0.0 | contact_team | draft | — | 1 | — |
| eye-vision-home-management | 1.0.0 | home_management | draft | — | 1 | — |
| eye-vision-urgent-attention | 1.0.0 | urgent_attention | draft | — | 2 | — |
| fatigue-about | 1.0.0 | about | draft | — | 1 | — |
| fatigue-contact-team | 1.0.0 | contact_team | draft | — | 1 | — |
| fatigue-home-management | 1.0.0 | home_management | draft | — | 1 | — |
| fatigue-urgent-attention | 1.0.0 | urgent_attention | draft | — | 3 | — |
| fever-infection-about | 1.0.0 | about | draft | — | 2 | — |
| general-demo-symptom-treatment-context | 1.0.0 | treatment_context | draft | — | 1 | — |
| general-diarrhea-about | 1.0.0 | about | draft | — | 1 | — |
| general-diarrhea-contact-team | 1.0.0 | contact_team | draft | — | 1 | — |
| general-diarrhea-home-management | 1.0.0 | home_management | draft | — | 1 | — |
| general-diarrhea-reporting-checklist | 1.0.0 | reporting_checklist | draft | — | 1 | — |
| general-diarrhea-urgent-attention | 1.0.0 | urgent_attention | draft | — | 2 | clinic-specific fever threshold pending clinician review |
| general-fever-infection-about | 1.0.0 | about | draft | — | 2 | — |
| general-infection-contact-team | 1.0.0 | contact_team | draft | — | 2 | — |
| general-infection-home-preparation | 1.0.0 | home_management | draft | — | 2 | — |
| general-infection-reporting-checklist | 1.0.0 | reporting_checklist | draft | — | 2 | — |
| general-infection-urgent-attention | 1.0.0 | urgent_attention | draft | — | 3 | clinic-specific fever threshold and destination pending clinician review |
| general-neuropathy-about | 1.0.0 | about | draft | — | 1 | — |
| general-neuropathy-contact-team | 1.0.0 | contact_team | draft | — | 1 | — |
| general-neuropathy-home-safety | 1.0.0 | home_management | draft | — | 1 | — |
| general-neuropathy-reporting-checklist | 1.0.0 | reporting_checklist | draft | — | 1 | — |
| general-neuropathy-urgent-neurological-signs | 1.0.0 | urgent_attention | draft | — | 1 | — |
| general-symptom-reporting-checklist | 1.0.0 | reporting_checklist | draft | — | 1 | — |
| general-systemic-prep-boundary | 1.0.0 | preparation | draft | — | 1 | — |
| general-systemic-prep-medicine-list | 1.0.0 | preparation | draft | — | 1 | — |
| general-systemic-prep-overview | 1.0.0 | preparation | draft | — | 1 | — |
| general-systemic-prep-questions | 1.0.0 | preparation | draft | — | 1 | — |
| general-systemic-prep-tests-and-appointments | 1.0.0 | preparation | draft | — | 1 | — |
| general-systemic-symptom-context | 1.0.0 | treatment_context | draft | — | 1 | — |
| hand-foot-about | 1.0.0 | about | draft | — | 1 | — |
| hand-foot-contact-team | 1.0.0 | contact_team | draft | — | 1 | — |
| hand-foot-home-management | 1.0.0 | home_management | draft | — | 1 | — |
| hand-foot-urgent-attention | 1.0.0 | urgent_attention | draft | — | 2 | — |
| headache-about | 1.0.0 | about | draft | — | 1 | — |
| headache-contact-team | 1.0.0 | contact_team | draft | — | 1 | — |
| headache-home-management | 1.0.0 | home_management | draft | — | 1 | — |
| headache-urgent-attention | 1.0.0 | urgent_attention | draft | — | 2 | — |
| hot-flashes-about | 1.0.0 | about | draft | — | 2 | — |
| hot-flashes-contact-team | 1.0.0 | contact_team | draft | — | 2 | — |
| hot-flashes-home-management | 1.0.0 | home_management | draft | — | 2 | — |
| hot-flashes-urgent-attention | 1.0.0 | urgent_attention | draft | — | 2 | — |
| infection-contact-team | 1.0.0 | contact_team | draft | — | 2 | — |
| infection-home-preparation | 1.0.0 | home_management | draft | — | 2 | — |
| infection-reporting-checklist | 1.0.0 | reporting_checklist | draft | — | 3 | — |
| infection-urgent-attention | 1.0.0 | urgent_attention | draft | — | 3 | clinic-specific fever threshold and destination pending clinician review |
| infusion-allergic-about | 1.0.0 | about | draft | — | 2 | — |
| infusion-allergic-contact-team | 1.0.0 | contact_team | draft | — | 2 | — |
| infusion-allergic-home-management | 1.0.0 | home_management | draft | — | 2 | — |
| infusion-allergic-urgent-attention | 1.0.0 | urgent_attention | draft | — | 2 | — |
| joint-muscle-about | 1.0.0 | about | draft | — | 1 | — |
| joint-muscle-contact-team | 1.0.0 | contact_team | draft | — | 1 | — |
| joint-muscle-home-management | 1.0.0 | home_management | draft | — | 1 | — |
| joint-muscle-urgent-attention | 1.0.0 | urgent_attention | draft | — | 3 | — |
| mood-cognitive-about | 1.0.0 | about | draft | — | 3 | — |
| mood-cognitive-contact-team | 1.0.0 | contact_team | draft | — | 3 | — |
| mood-cognitive-home-management | 1.0.0 | home_management | draft | — | 3 | — |
| mood-cognitive-urgent-attention | 1.0.0 | urgent_attention | draft | — | 3 | — |
| mouth-soreness-about | 1.0.0 | about | draft | — | 1 | — |
| mouth-soreness-contact-team | 1.0.0 | contact_team | draft | — | 1 | — |
| mouth-soreness-home-management | 1.0.0 | home_management | draft | — | 1 | — |
| mouth-soreness-urgent-attention | 1.0.0 | urgent_attention | draft | — | 2 | — |
| nail-hair-about | 1.0.0 | about | draft | — | 2 | — |
| nail-hair-contact-team | 1.0.0 | contact_team | draft | — | 2 | — |
| nail-hair-home-management | 1.0.0 | home_management | draft | — | 2 | — |
| nail-hair-urgent-attention | 1.0.0 | urgent_attention | draft | — | 2 | — |
| nausea-about | 1.0.0 | about | draft | — | 2 | — |
| nausea-contact-team | 1.0.0 | contact_team | draft | — | 2 | — |
| nausea-home-management | 1.0.0 | home_management | draft | — | 2 | — |
| nausea-urgent-attention | 1.0.0 | urgent_attention | draft | — | 3 | — |
| neuropathy-about | 1.0.0 | about | draft | — | 3 | — |
| neuropathy-contact-team | 1.0.0 | contact_team | draft | — | 3 | — |
| neuropathy-home-safety | 1.0.0 | home_management | draft | — | 2 | — |
| neuropathy-reporting-checklist | 1.0.0 | reporting_checklist | draft | — | 2 | — |
| neuropathy-urgent-neurological-signs | 1.0.0 | urgent_attention | draft | — | 1 | — |
| paclitaxel-neuropathy-context | 1.0.0 | treatment_context | draft | — | 2 | — |
| pain-about | 1.0.0 | about | draft | — | 1 | — |
| pain-contact-team | 1.0.0 | contact_team | draft | — | 1 | — |
| pain-home-management | 1.0.0 | home_management | draft | — | 1 | — |
| pain-urgent-attention | 1.0.0 | urgent_attention | draft | — | 3 | — |
| palpitations-about | 1.0.0 | about | draft | — | 1 | — |
| palpitations-contact-team | 1.0.0 | contact_team | draft | — | 1 | — |
| palpitations-home-management | 1.0.0 | home_management | draft | — | 1 | — |
| palpitations-urgent-attention | 1.0.0 | urgent_attention | draft | — | 2 | — |
| rash-itching-about | 1.0.0 | about | draft | — | 1 | — |
| rash-itching-contact-team | 1.0.0 | contact_team | draft | — | 1 | — |
| rash-itching-home-management | 1.0.0 | home_management | draft | — | 1 | — |
| rash-itching-urgent-attention | 1.0.0 | urgent_attention | draft | — | 2 | — |
| shortness-of-breath-cough-about | 1.0.0 | about | draft | — | 1 | — |
| shortness-of-breath-cough-contact-team | 1.0.0 | contact_team | draft | — | 1 | — |
| shortness-of-breath-cough-home-management | 1.0.0 | home_management | draft | — | 1 | — |
| shortness-of-breath-cough-urgent-attention | 1.0.0 | urgent_attention | draft | — | 3 | — |
| sleep-concerns-about | 1.0.0 | about | draft | — | 1 | — |
| sleep-concerns-contact-team | 1.0.0 | contact_team | draft | — | 1 | — |
| sleep-concerns-home-management | 1.0.0 | home_management | draft | — | 1 | — |
| sleep-concerns-urgent-attention | 1.0.0 | urgent_attention | draft | — | 3 | — |
| vaginal-genitourinary-about | 1.0.0 | about | draft | — | 2 | — |
| vaginal-genitourinary-contact-team | 1.0.0 | contact_team | draft | — | 2 | — |
| vaginal-genitourinary-home-management | 1.0.0 | home_management | draft | — | 2 | — |
| vaginal-genitourinary-urgent-attention | 1.0.0 | urgent_attention | draft | — | 2 | — |
| vomiting-about | 1.0.0 | about | draft | — | 2 | — |
| vomiting-contact-team | 1.0.0 | contact_team | draft | — | 2 | — |
| vomiting-home-management | 1.0.0 | home_management | draft | — | 2 | — |
| vomiting-urgent-attention | 1.0.0 | urgent_attention | draft | — | 3 | — |
| weekly-paclitaxel-prep-overview | 1.0.0 | preparation | draft | — | 2 | — |
| weekly-paclitaxel-prep-overview | 1.1.0 | preparation | draft | — | 1 | — |
| weekly-paclitaxel-prep-possible-effects | 1.0.0 | preparation | draft | — | 2 | — |
| weekly-paclitaxel-prep-possible-effects | 1.1.0 | preparation | draft | — | 2 | — |
| weekly-paclitaxel-prep-practical | 1.0.0 | preparation | draft | — | 2 | — |
| weekly-paclitaxel-prep-practical | 1.1.0 | preparation | draft | — | 3 | — |
| weekly-paclitaxel-prep-warning-boundary | 1.0.0 | preparation | draft | — | 2 | — |
| weekly-paclitaxel-prep-warning-boundary | 1.1.0 | preparation | draft | — | 1 | — |

## Single-drug toxicity evidence

| Evidence | Drug | Version | Status | Monotherapy | Population | Denominator | Dose | Source locator | Reviewer |
|---|---|---:|---|---|---|---:|---:|---|---|
| abemaciclib-fda-largest-single-agent-breast | abemaciclib | 1.0.0 | draft | yes | Patients in MONARCH 1 who received abemaciclib as a single agent after prior endocrine therapy and chemotherapy in the metastatic setting. | 132 | 200 mg orally twice daily | Section 6.1, Table 14, MONARCH 1 VERZENIO column (N=132) | — |
| ado-trastuzumab-emtansine-fda-largest-single-agent-breast | ado-trastuzumab-emtansine | 1.0.0 | draft | yes | Patients in KATHERINE who received ado-trastuzumab emtansine after surgery for residual invasive HER2-positive early breast cancer. | 740 | 3.6 mg/kg by intravenous infusion | Section 6.1, Table 5, KATHERINE KADCYLA column (n=740) | — |
| anastrozole-fda-largest-single-agent-breast | anastrozole | 1.0.0 | draft | yes | Postmenopausal women in the ATAC trial who received anastrozole alone for adjuvant treatment of early breast cancer. | 3092 | 1 mg orally once daily | Section 6.1, Table 1, ATAC ARIMIDEX 1 mg column (N=3092) | — |
| capecitabine-fda-largest-single-agent-breast | capecitabine | 1.0.0 | draft | yes | Patients in Study SO14697 who received capecitabine as a single agent for metastatic breast cancer. | 162 | 1,250 mg/m² orally twice daily on days 1 through 14 | Section 6.1, Table 7, Study SO14697 capecitabine column (n=162) | — |
| carboplatin-single-agent-ovarian-tables-7-8 | carboplatin | 1.0.0 | draft | yes | Patients with previously treated ovarian carcinoma who received carboplatin alone in two prospective, randomized controlled studies. | 553 | Study-specific single-agent dosing; exact dose is not stated in Tables 7 and 8 | Section 6.1, Tables 7 and 8, Carboplatin as a Second Line Single-Agent Therapy columns (n=553) | — |
| cyclophosphamide-fda-label-categorical-safety | cyclophosphamide | 1.0.0 | draft | no | People exposed to cyclophosphamide in clinical studies or postmarketing reports. The source population is of uncertain size and is not limited to single-agent treatment. | null | Not tied to one dose; the FDA label combines clinical-study and postmarketing reports | Highlights; Sections 5.1 through 5.11; Section 6.1; and Section 17, Patient Counseling Information | — |
| datopotamab-deruxtecan-fda-largest-single-agent-breast | datopotamab-deruxtecan | 1.0.0 | draft | yes | Patients in TROPION-Breast01 who received datopotamab deruxtecan after prior endocrine therapy and chemotherapy for unresectable or metastatic disease. | 360 | 6 mg/kg by intravenous infusion | Section 6.1, Table 8, TROPION-Breast01 DATROWAY column (N=360) | — |
| docetaxel-100mg-breast-table-3 | docetaxel | 1.0.0 | draft | yes | Patients with locally advanced or metastatic breast cancer, both previously treated and untreated with chemotherapy, with normal baseline liver function tests. | 965 | 100 mg/m² | Section 6.1, Table 3, Breast Cancer Normal LFTs column (n=965) | — |
| doxorubicin-fda-label-categorical-safety | doxorubicin | 1.0.0 | draft | no | People described across the doxorubicin FDA label. The label identifies three most-common reactions without event-specific doxorubicin-alone rates. Its numerical breast-cancer safety table reports the AC combination and is excluded from individual-drug frequency mapping. | null | Not tied to one dose; the FDA label's numerical breast-cancer safety table reports doxorubicin with cyclophosphamide and cannot be attributed to doxorubicin alone | Highlights, Adverse Reactions; Boxed Warning; Sections 5.1 through 5.4; Section 6.1, Table 2; Section 17; and FDA-approved Patient Information | — |
| elacestrant-fda-largest-single-agent-breast | elacestrant | 1.0.0 | draft | yes | Patients in EMERALD who received elacestrant after prior endocrine therapy including a CDK4/6 inhibitor. | 237 | 345 mg orally once daily with food | Section 6.1, Table 3, EMERALD ORSERDU column (n=237) | — |
| epirubicin-fda-label-categorical-safety | epirubicin | 1.0.0 | draft | no | People described across the epirubicin FDA label. The label identifies fourteen most-common reaction categories without event-specific epirubicin-alone rates. Its numerical breast-cancer safety table reports FEC and CEF combination regimens and is excluded from individual-drug frequency mapping. | null | Not tied to one dose; the FDA label's numerical breast-cancer safety table reports FEC and CEF combination regimens and cannot be attributed to epirubicin alone | Highlights, Adverse Reactions; Boxed Warning; Sections 5.1 through 5.4; Section 6.1, Table 1; Section 14.1; and Section 17 | — |
| eribulin-fda-largest-single-agent-breast | eribulin | 1.0.0 | draft | yes | Patients in Study 1 who received eribulin for metastatic breast cancer after at least two prior chemotherapy regimens. | 503 | 1.4 mg/m² by intravenous injection | Section 6.1, Table 2, Study 1 HALAVEN column (n=503) | — |
| exemestane-fda-largest-single-agent-breast | exemestane | 1.0.0 | draft | yes | Postmenopausal women in Study IES who switched to exemestane after 2 to 3 years of tamoxifen. | 2252 | 25 mg orally once daily after a meal | Section 6.1, Table 2, Study IES AROMASIN column (N=2252) | — |
| fulvestrant-fda-largest-single-agent-breast | fulvestrant | 1.0.0 | draft | yes | Patients in CONFIRM who received the current 500 mg fulvestrant regimen as monotherapy. | 361 | 500 mg by intramuscular injection | Section 6.1, Table 1, CONFIRM fulvestrant 500 mg column (N=361) | — |
| goserelin-fda-largest-single-agent-breast | goserelin | 1.0.0 | draft | yes | Women in SWOG-8692 who received goserelin for advanced breast cancer. | 57 | 3.6 mg subcutaneous implant | Section 6.6, Table 6, SWOG-8692 ZOLADEX column (n=57) | — |
| imlunestrant-fda-largest-single-agent-breast | imlunestrant | 1.0.0 | draft | yes | Patients in EMBER-3 who received imlunestrant after prior endocrine therapy. | 327 | 400 mg orally once daily on an empty stomach | Section 6.1, Table 3, EMBER-3 INLURIYO column (N=327) | — |
| ixabepilone-fda-largest-single-agent-breast | ixabepilone | 1.0.0 | draft | yes | Patients in Study 081 who received ixabepilone as a single agent for metastatic or locally advanced breast cancer. | 126 | 40 mg/m² by intravenous infusion | Section 6.1, Table 4, Study 081 IXEMPRA single-agent column (n=126) | — |
| letrozole-fda-largest-single-agent-breast | letrozole | 1.0.0 | draft | yes | Postmenopausal women in BIG 1-98 who received letrozole alone in the monotherapy-arms safety analysis. | 2448 | 2.5 mg orally once daily | Section 6.1, Table 1, BIG 1-98 monotherapy-arms Femara column (N=2448) | — |
| neratinib-fda-largest-single-agent-breast | neratinib | 1.0.0 | draft | yes | Patients in ExteNET who received neratinib alone after trastuzumab-based adjuvant therapy and without required antidiarrheal prophylaxis. | 1408 | 240 mg orally once daily with food | Section 6.1, Table 7, ExteNET NERLYNX column (n=1408) | — |
| olaparib-fda-largest-single-agent-breast | olaparib | 1.0.0 | draft | yes | Patients in OlympiA who received olaparib alone after local treatment and chemotherapy for high-risk early breast cancer. | 911 | 300 mg orally twice daily | Section 6.1, Table 8, OlympiA Lynparza tablets column (n=911) | — |
| paclitaxel-fda-largest-single-agent-breast | paclitaxel | 1.0.0 | draft | yes | Patients in the Phase 3 breast carcinoma study who received single-agent conventional paclitaxel at 175 mg/m². | 229 | 175 mg/m² by intravenous infusion | Adverse Reactions, Table 14, 175 mg/m² over 3 hours column (n=229) | — |
| paclitaxel-protein-bound-fda-largest-single-agent-breast | paclitaxel-protein-bound | 1.0.0 | draft | yes | Patients in the randomized metastatic breast cancer study who received single-agent albumin-bound paclitaxel. | 229 | 260 mg/m² by intravenous infusion | Section 6.1, Table 6, ABRAXANE 260 mg/m² column (n=229) | — |
| pembrolizumab-fda-single-agent-label-safety | pembrolizumab | 1.0.0 | draft | yes | People described across the FDA label's pembrolizumab single-agent safety information. The fourteen most-common reaction categories are explicitly labelled for KEYTRUDA as a single agent but are not bound to one breast-cancer population or event-specific denominator. The Warning and Precautions data primarily reflect 2,799 single-agent patients with melanoma or non-small cell lung cancer. | null | Not tied to one dose; the FDA single-agent safety information spans multiple labelled doses and cancer types | Highlights, Adverse Reactions; Sections 5.1 through 5.5; Section 6.1; TNBC safety in Section 6.1 and Table 59; Section 17; and FDA-approved Medication Guide | — |
| sacituzumab-govitecan-fda-largest-single-agent-breast | sacituzumab-govitecan | 1.0.0 | draft | yes | Patients in ASCENT-03 who received sacituzumab govitecan as a single agent. | 275 | 10 mg/kg by intravenous infusion | Section 6.1, Table 3, ASCENT-03 TRODELVY column (n=275) | — |
| talazoparib-fda-largest-single-agent-breast | talazoparib | 1.0.0 | draft | yes | Patients in EMBRACA who received talazoparib as a single agent after no more than three prior chemotherapy regimens for advanced disease. | 286 | 1 mg orally once daily | Section 6.1, Table 5, EMBRACA TALZENNA column (N=286) | — |
| tamoxifen-fda-largest-single-agent-breast | tamoxifen | 1.0.0 | draft | yes | Women in the ATAC trial who received tamoxifen alone for adjuvant treatment of early breast cancer. | 3094 | 20 mg orally once daily | Section 6.1, Table 3, ATAC tamoxifen column (N=3094) | — |
| toremifene-fda-largest-single-agent-breast | toremifene | 1.0.0 | draft | yes | Patients in the North American Study who received toremifene 60 mg for metastatic breast cancer. | 221 | 60 mg orally once daily | Adverse Reactions, Table 1, North American Study FAR60 column (n=221) | — |
| trastuzumab-deruxtecan-fda-largest-single-agent-breast | trastuzumab-deruxtecan | 1.0.0 | draft | yes | Patients in DESTINY-Breast05 who received trastuzumab deruxtecan after surgery for residual invasive HER2-positive breast cancer. | 806 | 5.4 mg/kg by intravenous infusion | Section 6.1, Table 6, DESTINY-Breast05 ENHERTU column (N=806) | — |
| trastuzumab-fda-largest-single-agent-breast | trastuzumab | 1.0.0 | draft | yes | Patients in HERA who received trastuzumab after completing surgery, chemotherapy, and radiotherapy when applicable. | 1678 | 8 mg/kg loading dose, then 6 mg/kg by intravenous infusion | Section 6.1, Table 3, HERA Herceptin column (n=1678) | — |
| vepdegestrant-fda-largest-single-agent-breast | vepdegestrant | 1.0.0 | draft | yes | Patients in VERITAC-2 who received vepdegestrant after prior endocrine therapy including a CDK4/6 inhibitor. | 312 | 200 mg orally once daily with food | Section 6.1, Table 3, VERITAC-2 VEPPANU column (N=312) | — |

## Patient drug toxicity presentations

| Presentation | Drug | Version | Status | Evidence | Patient rows | Sources | Reviewer |
|---|---|---:|---|---|---:|---:|---|
| abemaciclib-patient-side-effects | abemaciclib | 1.0.0 | draft | abemaciclib-fda-largest-single-agent-breast@1.0.0 | 14 | 1 | — |
| ado-trastuzumab-emtansine-patient-side-effects | ado-trastuzumab-emtansine | 1.0.0 | draft | ado-trastuzumab-emtansine-fda-largest-single-agent-breast@1.0.0 | 16 | 1 | — |
| anastrozole-patient-side-effects | anastrozole | 1.0.0 | draft | anastrozole-fda-largest-single-agent-breast@1.0.0 | 18 | 1 | — |
| capecitabine-patient-side-effects | capecitabine | 1.0.0 | draft | capecitabine-fda-largest-single-agent-breast@1.0.0 | 15 | 1 | — |
| carboplatin-patient-side-effects | carboplatin | 1.0.0 | draft | carboplatin-single-agent-ovarian-tables-7-8@1.0.0 | 9 | 1 | — |
| cyclophosphamide-patient-side-effects | cyclophosphamide | 1.0.0 | draft | cyclophosphamide-fda-label-categorical-safety@1.0.0 | 11 | 1 | — |
| datopotamab-deruxtecan-patient-side-effects | datopotamab-deruxtecan | 1.0.0 | draft | datopotamab-deruxtecan-fda-largest-single-agent-breast@1.0.0 | 13 | 1 | — |
| docetaxel-patient-side-effects | docetaxel | 1.0.0 | draft | docetaxel-100mg-breast-table-3@1.0.0 | 17 | 1 | — |
| doxorubicin-patient-side-effects | doxorubicin | 1.0.0 | draft | doxorubicin-fda-label-categorical-safety@1.0.0 | 7 | 1 | — |
| elacestrant-patient-side-effects | elacestrant | 1.0.0 | draft | elacestrant-fda-largest-single-agent-breast@1.0.0 | 11 | 1 | — |
| epirubicin-patient-side-effects | epirubicin | 1.0.0 | draft | epirubicin-fda-label-categorical-safety@1.0.0 | 14 | 1 | — |
| eribulin-patient-side-effects | eribulin | 1.0.0 | draft | eribulin-fda-largest-single-agent-breast@1.0.0 | 15 | 1 | — |
| exemestane-patient-side-effects | exemestane | 1.0.0 | draft | exemestane-fda-largest-single-agent-breast@1.0.0 | 10 | 1 | — |
| fulvestrant-patient-side-effects | fulvestrant | 1.0.0 | draft | fulvestrant-fda-largest-single-agent-breast@1.0.0 | 10 | 1 | — |
| goserelin-patient-side-effects | goserelin | 1.0.0 | draft | goserelin-fda-largest-single-agent-breast@1.0.0 | 6 | 1 | — |
| imlunestrant-patient-side-effects | imlunestrant | 1.0.0 | draft | imlunestrant-fda-largest-single-agent-breast@1.0.0 | 6 | 1 | — |
| ixabepilone-patient-side-effects | ixabepilone | 1.0.0 | draft | ixabepilone-fda-largest-single-agent-breast@1.0.0 | 16 | 1 | — |
| letrozole-patient-side-effects | letrozole | 1.0.0 | draft | letrozole-fda-largest-single-agent-breast@1.0.0 | 17 | 1 | — |
| neratinib-patient-side-effects | neratinib | 1.0.0 | draft | neratinib-fda-largest-single-agent-breast@1.0.0 | 15 | 1 | — |
| olaparib-patient-side-effects | olaparib | 1.0.0 | draft | olaparib-fda-largest-single-agent-breast@1.0.0 | 10 | 1 | — |
| paclitaxel-patient-side-effects | paclitaxel | 1.0.0 | draft | paclitaxel-fda-largest-single-agent-breast@1.0.0 | 5 | 1 | — |
| paclitaxel-protein-bound-patient-side-effects | paclitaxel-protein-bound | 1.0.0 | draft | paclitaxel-protein-bound-fda-largest-single-agent-breast@1.0.0 | 15 | 1 | — |
| pembrolizumab-patient-side-effects | pembrolizumab | 1.0.0 | draft | pembrolizumab-fda-single-agent-label-safety@1.0.0 | 20 | 1 | — |
| sacituzumab-govitecan-patient-side-effects | sacituzumab-govitecan | 1.0.0 | draft | sacituzumab-govitecan-fda-largest-single-agent-breast@1.0.0 | 14 | 1 | — |
| talazoparib-patient-side-effects | talazoparib | 1.0.0 | draft | talazoparib-fda-largest-single-agent-breast@1.0.0 | 7 | 1 | — |
| tamoxifen-patient-side-effects | tamoxifen | 1.0.0 | draft | tamoxifen-fda-largest-single-agent-breast@1.0.0 | 18 | 1 | — |
| toremifene-patient-side-effects | toremifene | 1.0.0 | draft | toremifene-fda-largest-single-agent-breast@1.0.0 | 6 | 1 | — |
| trastuzumab-deruxtecan-patient-side-effects | trastuzumab-deruxtecan | 1.0.0 | draft | trastuzumab-deruxtecan-fda-largest-single-agent-breast@1.0.0 | 14 | 1 | — |
| trastuzumab-patient-side-effects | trastuzumab | 1.0.0 | draft | trastuzumab-fda-largest-single-agent-breast@1.0.0 | 15 | 1 | — |
| vepdegestrant-patient-side-effects | vepdegestrant | 1.0.0 | draft | vepdegestrant-fda-largest-single-agent-breast@1.0.0 | 6 | 1 | — |

## Source inventory

| Source | Organization | Jurisdiction | Verification | Link |
|---|---|---|---|---|
| bc-cancer-hair-loss-appearance | BC Cancer | British Columbia, Canada | verified | [Open](https://www.bccancer.bc.ca/managing-symptoms-site/Documents/Managing%20Hair%20Loss%20-%20FINAL%2C%20OCTOBER%202025.pdf) |
| bc-cancer-lymphedema | BC Cancer | British Columbia, Canada | verified | [Open](https://www.bccancer.bc.ca/managing-symptoms-site/Documents/Lymphedema-Arm-Leg.pdf) |
| bc-cancer-memory-thinking-attention | BC Cancer | British Columbia, Canada | verified | [Open](https://www.bccancer.bc.ca/health-info/coping-with-cancer/managing-symptoms-side-effects/memory-thinking-attention-problems) |
| bc-cancer-peripheral-neuropathy-handout | BC Cancer | British Columbia, Canada | verified | [Open](https://www.bccancer.bc.ca/managing-symptoms-site/Documents/Peripheral-Neuropathy.pdf) |
| bc-cancer-sexual-health-vagina | BC Cancer | British Columbia, Canada | verified | [Open](https://www.bccancer.bc.ca/managing-symptoms-site/Documents/Sexual-Health-Vagina-Web.pdf) |
| bc-cancer-sleeping-problems | BC Cancer | British Columbia, Canada | verified | [Open](https://www.bccancer.bc.ca/health-info/coping-with-cancer/managing-symptoms-side-effects/sleeping-problems) |
| bc-cancer-systemic-therapy-preparation | BC Cancer | British Columbia, Canada | verified | [Open](https://www.bccancer.bc.ca/patient-and-public-info-site/Pages/Chemotherapy.aspx) |
| canada-anaphylaxis-signs | Public Health Agency of Canada | Canada | verified | [Open](https://www.canada.ca/en/public-health/services/diseases/2019-novel-coronavirus-infection/health-professionals/vaccines/anaphylaxis.html) |
| canada-stroke-warning-signs | Public Health Agency of Canada | Canada | verified | [Open](https://www.canada.ca/en/public-health/services/diseases/heart-health/stroke.html) |
| cco-ac-breast-patient-information | Ontario Health (Cancer Care Ontario) | Ontario, Canada | verified | [Open](https://www.cancercareontario.ca/en/drugformulary/regimens/infosheet/46111) |
| cco-ac-breast-patient-information | Ontario Health (Cancer Care Ontario) | Ontario, Canada | verified | [Open](https://www.cancercareontario.ca/en/drugformulary/regimens/infosheet/46111) |
| cco-anxiety-patient-guide | Ontario Health (Cancer Care Ontario) | Ontario, Canada | verified | [Open](https://www.cancercareontario.ca/en/symptom-management/anxiety/how-to-manage-your-anxiety) |
| cco-capecitabine-patient-information | Ontario Health (Cancer Care Ontario) | Ontario, Canada | verified | [Open](https://www.cancercareontario.ca/en/drugformulary/regimens/infosheet/45016) |
| cco-capecitabine-patient-information | Ontario Health (Cancer Care Ontario) | Ontario, Canada | verified | [Open](https://www.cancercareontario.ca/en/drugformulary/regimens/infosheet/45016) |
| cco-capedoce-breast-regimen | Ontario Health (Cancer Care Ontario) | Ontario, Canada | verified | [Open](https://www.cancercareontario.ca/en/drugformulary/regimens/monograph/45926) |
| cco-capetuca-tras-breast-regimen | Ontario Health (Cancer Care Ontario) | Ontario, Canada | verified | [Open](https://www.cancercareontario.ca/en/drugformulary/regimens/monograph/67556) |
| cco-constipation-patient-guide | Ontario Health (Cancer Care Ontario) | Ontario, Canada | verified | [Open](https://www.cancercareontario.ca/en/guidelines-advice/symptom-management/constipation/how-to-manage-constipation) |
| cco-depression-patient-guide | Ontario Health (Cancer Care Ontario) | Ontario, Canada | verified | [Open](https://www.cancercareontario.ca/en/system/files_force/symptoms/ManageDepression.pdf?download=1) |
| cco-dyspnea-patient-guide | Ontario Health (Cancer Care Ontario) | Ontario, Canada | verified | [Open](https://www.cancercareontario.ca/en/symptom-management/dyspnea-shortness-breath/managing-shortness-of-breath-for-people-with-cancer) |
| cco-fatigue-patient-guide | Ontario Health (Cancer Care Ontario) | Ontario, Canada | verified | [Open](https://www.cancercareontario.ca/en/guidelines-advice/symptom-management/fatigue/managing-your-fatigue) |
| cco-fever-assessment-guideline | Ontario Health (Cancer Care Ontario) | Ontario, Canada | verified | [Open](https://www.cancercareontario.ca/en/guidelines-advice/types-of-cancer/1376) |
| cco-fever-patient-guide | Ontario Health (Cancer Care Ontario) | Ontario, Canada | verified | [Open](https://www.cancercareontario.ca/system/files_force/symptoms/CCOFeverPostcard.pdf?download=1) |
| cco-hand-foot-syndrome-patient-guide | Ontario Health (Cancer Care Ontario) | Ontario, Canada | verified | [Open](https://www.cancercareontario.ca/en/system/files_force/symptoms/Hand-Foot%20Syndrome%20During%20Treatment.pdf) |
| cco-loss-appetite-patient-guide | Ontario Health (Cancer Care Ontario) | Ontario, Canada | verified | [Open](https://www.cancercareontario.ca/system/files_force/symptoms/ManageLossOfAppetite.pdf) |
| cco-manage-diarrhea | Ontario Health (Cancer Care Ontario) | Ontario, Canada | verified | [Open](https://www.cancercareontario.ca/en/guidelines-advice/symptom-management/diarrhea/how-to-manage-diarrhea) |
| cco-nausea-vomiting-patient-guide | Ontario Health (Cancer Care Ontario) | Ontario, Canada | verified | [Open](https://www.cancercareontario.ca/en/system/files_force/symptoms/CCONauseaDesktop.pdf?download=1) |
| cco-oral-care-patient-guide | Ontario Health (Cancer Care Ontario) | Ontario, Canada | verified | [Open](https://www.cancercareontario.ca/en/symptom-management/oral-care/how-to-manage-oral-care) |
| cco-paclitaxel-patient-information | Ontario Health (Cancer Care Ontario) | Ontario, Canada | verified | [Open](https://www.cancercareontario.ca/en/drugformulary/drugs/infosheet/44151) |
| cco-paclitaxel-patient-information | Ontario Health (Cancer Care Ontario) | Ontario, Canada | verified | [Open](https://www.cancercareontario.ca/en/drugformulary/drugs/infosheet/44151) |
| cco-pain-patient-guide | Ontario Health (Cancer Care Ontario) | Ontario, Canada | verified | [Open](https://www.cancercareontario.ca/system/files_force/symptoms/ManagePain.pdf) |
| cco-symptom-assessment-tool | Ontario Health (Cancer Care Ontario) | Ontario, Canada | verified | [Open](https://www.cancercareontario.ca/en/guidelines-advice/symptom-side-effect-management/symptom-assessment-tool) |
| cco-symptom-management-directory | Ontario Health (Cancer Care Ontario) | Ontario, Canada | link_only | [Open](https://www.cancercareontario.ca/en/symptom-management) |
| cco-systemic-treatment-information | Ontario Health (Cancer Care Ontario) | Ontario, Canada | link_only | [Open](https://www.cancercareontario.ca/en/drugformulary) |
| cco-tch-breast-regimen | Ontario Health (Cancer Care Ontario) | Ontario, Canada | verified | [Open](https://www.cancercareontario.ca/en/drugformulary/regimens/monograph/45506) |
| cco-tchp-breast-regimen | Ontario Health (Cancer Care Ontario) | Ontario, Canada | verified | [Open](https://www.cancercareontario.ca/en/drugformulary/regimens/monograph/62161) |
| ccs-chemotherapy-questions-preparation | Canadian Cancer Society | Canada | verified | [Open](https://cancer.ca/en/living-with-cancer/coping-with-changes/working-with-your-healthcare-team/questions-to-ask/chemotherapy-questions) |
| ccs-chemotherapy-side-effects | Canadian Cancer Society | Canada | verified | [Open](https://cancer.ca/en/treatments/treatment-types/chemotherapy/side-effects-of-chemotherapy) |
| ccs-eye-vision-problems | Canadian Cancer Society | Canada | verified | [Open](https://cancer.ca/en/treatments/side-effects/eye-and-vision-problems) |
| ccs-having-chemotherapy-preparation | Canadian Cancer Society | Canada | verified | [Open](https://cancer.ca/en/treatments/treatment-types/chemotherapy/having-chemotherapy) |
| ccs-heart-problems | Canadian Cancer Society | Canada | verified | [Open](https://cancer.ca/en/treatments/side-effects/heart-problems) |
| ccs-hormone-therapy-breast | Canadian Cancer Society | Canada | verified | [Open](https://cancer.ca/en/cancer-information/cancer-types/breast/treatment/hormone-therapy) |
| ccs-skin-problems | Canadian Cancer Society | Canada | verified | [Open](https://cancer.ca/en/treatments/side-effects/skin-problems) |
| eviq-dose-dense-ac-breast-patient-information | eviQ Cancer Treatments Online | Australia | verified | [Open](https://www.eviq.org.au/medical-oncology/breast/neoadjuvant-adjuvant/4102-breast-neoadjuvant-adjuvant-ac-doxorubicin-a/patient-information) |
| eviq-general-chemotherapy-side-effects | eviQ Cancer Treatments Online, Cancer Institute NSW | Australia | verified | [Open](https://www.eviq.org.au/patients-and-carers/patient-information-sheets/managing-side-effects/3088-managing-the-side-effects-of-anti-cancer-medi) |
| eviq-hypersensitivity-reaction | eviQ Cancer Treatments Online, Cancer Institute NSW | Australia | verified | [Open](https://www.eviq.org.au/clinical-resources/side-effect-and-toxicity-management/immunological/1831-hypersensitivity-reaction) |
| eviq-infection-during-cancer-treatment | eviQ Cancer Treatments Online | Australia | verified | [Open](https://www.eviq.org.au/getmedia/474a3ca7-e4da-4e2b-95ee-e026cd10028a/eviQ-PI-3098-Infection-during-cancer-treatment-V5-02.pdf.aspx?ext=.pdf) |
| eviq-weekly-paclitaxel-breast-patient-information | eviQ Cancer Treatments Online | Australia | verified | [Open](https://www.eviq.org.au/medical-oncology/breast/neoadjuvant-adjuvant/4103-breast-neoadjuvant-adjuvant-paclitaxel-weekly/patient-information) |
| fda-label-abemaciclib | U.S. Food and Drug Administration | United States | verified | [Open](https://dailymed.nlm.nih.gov/dailymed/drugInfo.cfm?setid=be4bc0de-0fdc-4d46-8d25-be43c79e6a06) |
| fda-label-ado-trastuzumab-emtansine | U.S. Food and Drug Administration | United States | verified | [Open](https://dailymed.nlm.nih.gov/dailymed/drugInfo.cfm?setid=23f3c1f4-0fc8-4804-a9e3-04cf25dd302e) |
| fda-label-alpelisib | U.S. Food and Drug Administration | United States | verified | [Open](https://www.accessdata.fda.gov/scripts/cder/daf/index.cfm?event=overview.process&ApplNo=212526) |
| fda-label-anastrozole | U.S. Food and Drug Administration | United States | verified | [Open](https://dailymed.nlm.nih.gov/dailymed/drugInfo.cfm?setid=acbfaaa9-503c-4691-9828-76a7146ed6de) |
| fda-label-capecitabine | U.S. Food and Drug Administration | United States | verified | [Open](https://dailymed.nlm.nih.gov/dailymed/drugInfo.cfm?setid=06a88b03-6c06-4dae-b3bc-1e8dd81c9067) |
| fda-label-capivasertib | U.S. Food and Drug Administration | United States | verified | [Open](https://www.accessdata.fda.gov/scripts/cder/daf/index.cfm?event=overview.process&ApplNo=218197) |
| fda-label-carboplatin | U.S. Food and Drug Administration | United States | verified | [Open](https://dailymed.nlm.nih.gov/dailymed/drugInfo.cfm?setid=f91c48da-68d1-4aa7-89b8-d84a3e8b629b) |
| fda-label-conjugated-estrogens | U.S. Food and Drug Administration | United States | verified | [Open](https://www.accessdata.fda.gov/scripts/cder/daf/index.cfm?event=overview.process&ApplNo=004782) |
| fda-label-cyclophosphamide | U.S. Food and Drug Administration | United States | verified | [Open](https://www.accessdata.fda.gov/scripts/cder/daf/index.cfm?event=overview.process&ApplNo=212501) |
| fda-label-datopotamab-deruxtecan | U.S. Food and Drug Administration | United States | verified | [Open](https://dailymed.nlm.nih.gov/dailymed/drugInfo.cfm?setid=2950227c-6230-4ca4-a135-46e44d9424a0) |
| fda-label-docetaxel | U.S. Food and Drug Administration | United States | verified | [Open](https://dailymed.nlm.nih.gov/dailymed/drugInfo.cfm?setid=6b9999bb-869e-4d25-838c-23c3ab280044) |
| fda-label-doxorubicin | U.S. Food and Drug Administration | United States | verified | [Open](https://dailymed.nlm.nih.gov/dailymed/lookup.cfm?setid=1fd148fb-0fbc-4b6f-b790-23546fb46a71&version=28) |
| fda-label-elacestrant | U.S. Food and Drug Administration | United States | verified | [Open](https://dailymed.nlm.nih.gov/dailymed/drugInfo.cfm?setid=aa66ae5c-2bd2-4444-8178-b55651e054ef) |
| fda-label-epirubicin | U.S. Food and Drug Administration | United States | verified | [Open](https://dailymed.nlm.nih.gov/dailymed/drugInfo.cfm?audience=consumer&setid=0a03c798-a652-4895-b29c-3b521a89ba42) |
| fda-label-eribulin | U.S. Food and Drug Administration | United States | verified | [Open](https://dailymed.nlm.nih.gov/dailymed/drugInfo.cfm?setid=31ce4750-ded5-4a0b-95e9-f229fa6bc822) |
| fda-label-estradiol | U.S. Food and Drug Administration | United States | verified | [Open](https://www.accessdata.fda.gov/scripts/cder/daf/index.cfm?event=overview.process&ApplNo=040275) |
| fda-label-everolimus | U.S. Food and Drug Administration | United States | verified | [Open](https://www.accessdata.fda.gov/scripts/cder/daf/index.cfm?event=overview.process&ApplNo=022334) |
| fda-label-exemestane | U.S. Food and Drug Administration | United States | verified | [Open](https://dailymed.nlm.nih.gov/dailymed/drugInfo.cfm?setid=cf066b7a-032a-416c-8d40-15ba581423e3) |
| fda-label-fluorouracil | U.S. Food and Drug Administration | United States | verified | [Open](https://www.accessdata.fda.gov/scripts/cder/daf/index.cfm?event=overview.process&ApplNo=040278) |
| fda-label-fulvestrant | U.S. Food and Drug Administration | United States | verified | [Open](https://dailymed.nlm.nih.gov/dailymed/drugInfo.cfm?setid=e20d8ca3-8837-4003-8b01-1ebec342062a) |
| fda-label-gemcitabine | U.S. Food and Drug Administration | United States | verified | [Open](https://www.accessdata.fda.gov/scripts/cder/daf/index.cfm?event=overview.process&ApplNo=200795) |
| fda-label-goserelin | U.S. Food and Drug Administration | United States | verified | [Open](https://dailymed.nlm.nih.gov/dailymed/drugInfo.cfm?setid=294b168b-6e5f-4db9-bf70-d599271458b3) |
| fda-label-imlunestrant | U.S. Food and Drug Administration | United States | verified | [Open](https://dailymed.nlm.nih.gov/dailymed/drugInfo.cfm?setid=5bc172e4-e8a2-441a-be52-279a7f890196) |
| fda-label-inavolisib | U.S. Food and Drug Administration | United States | verified | [Open](https://www.accessdata.fda.gov/scripts/cder/daf/index.cfm?event=overview.process&ApplNo=219249) |
| fda-label-ixabepilone | U.S. Food and Drug Administration | United States | verified | [Open](https://dailymed.nlm.nih.gov/dailymed/drugInfo.cfm?setid=241f0b1e-8b95-470d-876f-bf1804daaf18) |
| fda-label-lapatinib | U.S. Food and Drug Administration | United States | verified | [Open](https://www.accessdata.fda.gov/scripts/cder/daf/index.cfm?event=overview.process&ApplNo=022059) |
| fda-label-letrozole | U.S. Food and Drug Administration | United States | verified | [Open](https://dailymed.nlm.nih.gov/dailymed/drugInfo.cfm?setid=82b77d74-085f-45ac-a7dd-1f5c038bf406) |
| fda-label-margetuximab | U.S. Food and Drug Administration | United States | verified | [Open](https://www.accessdata.fda.gov/scripts/cder/daf/index.cfm?event=overview.process&ApplNo=761150) |
| fda-label-megestrol-acetate | U.S. Food and Drug Administration | United States | verified | [Open](https://www.accessdata.fda.gov/scripts/cder/daf/index.cfm?event=overview.process&ApplNo=072423) |
| fda-label-methotrexate | U.S. Food and Drug Administration | United States | verified | [Open](https://www.accessdata.fda.gov/scripts/cder/daf/index.cfm?event=overview.process&ApplNo=011719) |
| fda-label-methyltestosterone | U.S. Food and Drug Administration | United States | verified | [Open](https://www.accessdata.fda.gov/scripts/cder/daf/index.cfm?event=overview.process&ApplNo=204851) |
| fda-label-neratinib | U.S. Food and Drug Administration | United States | verified | [Open](https://dailymed.nlm.nih.gov/dailymed/drugInfo.cfm?setid=d1e41dcf-e82a-47c2-a0ad-6c6eef621834) |
| fda-label-olaparib | U.S. Food and Drug Administration | United States | verified | [Open](https://dailymed.nlm.nih.gov/dailymed/drugInfo.cfm?setid=741ff3e3-dc1a-45a6-84e5-2481b27131aa) |
| fda-label-paclitaxel | U.S. Food and Drug Administration | United States | verified | [Open](https://dailymed.nlm.nih.gov/dailymed/drugInfo.cfm?setid=ea28753a-8631-460a-bfdc-b101eb8ac84a) |
| fda-label-paclitaxel-protein-bound | U.S. Food and Drug Administration | United States | verified | [Open](https://dailymed.nlm.nih.gov/dailymed/drugInfo.cfm?setid=24d10449-2936-4cd3-b7db-a7683db721e4) |
| fda-label-palbociclib | U.S. Food and Drug Administration | United States | verified | [Open](https://www.accessdata.fda.gov/scripts/cder/daf/index.cfm?event=overview.process&ApplNo=212436) |
| fda-label-pembrolizumab | U.S. Food and Drug Administration | United States | verified | [Open](https://dailymed.nlm.nih.gov/dailymed/drugInfo.cfm?setid=9333c79b-d487-4538-a9f0-71b91a02b287) |
| fda-label-pembrolizumab-berahyaluronidase | U.S. Food and Drug Administration | United States | verified | [Open](https://www.accessdata.fda.gov/scripts/cder/daf/index.cfm?event=overview.process&ApplNo=761467) |
| fda-label-pertuzumab | U.S. Food and Drug Administration | United States | verified | [Open](https://www.accessdata.fda.gov/scripts/cder/daf/index.cfm?event=overview.process&ApplNo=125409) |
| fda-label-pertuzumab-trastuzumab-hyaluronidase | U.S. Food and Drug Administration | United States | verified | [Open](https://www.accessdata.fda.gov/scripts/cder/daf/index.cfm?event=overview.process&ApplNo=761170) |
| fda-label-ribociclib | U.S. Food and Drug Administration | United States | verified | [Open](https://www.accessdata.fda.gov/scripts/cder/daf/index.cfm?event=overview.process&ApplNo=209092) |
| fda-label-sacituzumab-govitecan | U.S. Food and Drug Administration | United States | verified | [Open](https://dailymed.nlm.nih.gov/dailymed/drugInfo.cfm?setid=57a597d2-03f0-472e-b148-016d7169169d) |
| fda-label-talazoparib | U.S. Food and Drug Administration | United States | verified | [Open](https://dailymed.nlm.nih.gov/dailymed/drugInfo.cfm?setid=c6fd147f-a77e-4a0b-9280-e82ecc41b4be) |
| fda-label-tamoxifen | U.S. Food and Drug Administration | United States | verified | [Open](https://dailymed.nlm.nih.gov/dailymed/drugInfo.cfm?setid=1e6ff055-590c-41e6-9530-1fdf04cdbd02) |
| fda-label-testosterone-enanthate | U.S. Food and Drug Administration | United States | verified | [Open](https://www.accessdata.fda.gov/scripts/cder/daf/index.cfm?event=overview.process&ApplNo=212659) |
| fda-label-thiotepa | U.S. Food and Drug Administration | United States | verified | [Open](https://www.accessdata.fda.gov/scripts/cder/daf/index.cfm?event=overview.process&ApplNo=208264) |
| fda-label-toremifene | U.S. Food and Drug Administration | United States | verified | [Open](https://dailymed.nlm.nih.gov/dailymed/drugInfo.cfm?setid=e897546b-4136-4cb5-a262-d94cf3fa3298) |
| fda-label-trastuzumab | U.S. Food and Drug Administration | United States | verified | [Open](https://dailymed.nlm.nih.gov/dailymed/drugInfo.cfm?setid=492dbdb2-077e-4064-bff3-372d6af0a7a2) |
| fda-label-trastuzumab-deruxtecan | U.S. Food and Drug Administration | United States | verified | [Open](https://dailymed.nlm.nih.gov/dailymed/drugInfo.cfm?setid=7e67e73e-ddf4-4e4d-8b50-09d7514910b6) |
| fda-label-trastuzumab-hyaluronidase | U.S. Food and Drug Administration | United States | verified | [Open](https://www.accessdata.fda.gov/scripts/cder/daf/index.cfm?event=overview.process&ApplNo=761106) |
| fda-label-tucatinib | U.S. Food and Drug Administration | United States | verified | [Open](https://www.accessdata.fda.gov/scripts/cder/daf/index.cfm?event=overview.process&ApplNo=213411) |
| fda-label-vepdegestrant | U.S. Food and Drug Administration | United States | verified | [Open](https://dailymed.nlm.nih.gov/dailymed/drugInfo.cfm?setid=484e21ba-8fe1-4c6d-b923-8ba4cf5b2f20) |
| fda-label-vinblastine | U.S. Food and Drug Administration | United States | verified | [Open](https://www.accessdata.fda.gov/scripts/cder/daf/index.cfm?event=overview.process&ApplNo=089515) |
| health-canada-capecitabine-product-record | Health Canada | Canada | verified | [Open](https://health-products.canada.ca/dpd-bdpp/info?code=100911&lang=eng) |
| health-canada-fluoropyrimidine-infowatch | Health Canada | Canada | verified | [Open](https://www.canada.ca/en/health-canada/services/drugs-health-products/medeffect-canada/health-product-infowatch/march-2025.html) |
| heart-stroke-emergency-signs | Heart and Stroke Foundation of Canada | Canada | verified | [Open](https://www.heartandstroke.ca/heart-disease/emergency-signs) |
| heart-stroke-stroke-signs | Heart and Stroke Foundation of Canada | Canada | verified | [Open](https://www.heartandstroke.ca/stroke/signs-of-stroke) |

## Required clinical-owner decisions

- Review the exact single-drug evidence, event dispositions, qualitative-frequency transformation, patient wording, and escalation summary.
- Review and edit every patient-facing module and its claim-to-source mapping.
- Replace synthetic identity and contact fixtures with verified institutional data before any published release.
- Define governed policy-purpose compatibility and exact runtime rendering, then resolve fever and supportive-care through approved module references; exact references alone are not publishable in P0.
- Resolve the Ontario/eviQ diarrhea-threshold discrepancy.
- Confirm the exact AC regimen variant before any cycle-timing statement is introduced.
- Decide whether any team-directed over-the-counter medicine module is appropriate; none is approved here.
- Create content and release approval evidence only after review. The compiler never approves content.
