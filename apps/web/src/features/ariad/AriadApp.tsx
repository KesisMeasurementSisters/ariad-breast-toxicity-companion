"use client";

import type {
  ClinicConfigV2,
  ClinicContactRoute,
  Drug,
  DrugToxicityPresentation,
  EducationalModule,
  PatientToxicityEffect,
  PatientToxicityFrequencyBand,
  Question,
  SearchRecord,
  SymptomClassifierResult,
  SymptomSummaryResult,
} from "@ariad/contracts";
import {
  ARIAD_INTENDED_USE,
  SymptomSummaryResultSchema,
  UNIVERSAL_EMERGENCY_STATEMENT,
} from "@ariad/contracts";
import {
  assembleGuidance,
  classifySymptomDeterministically,
  deterministicSummary,
  drugSymptomListings,
  groupPreparationModulesForDisplay,
  normalizeSearchText,
  PATIENT_FREQUENCY_BAND_LABELS,
  PATIENT_FREQUENCY_BAND_ORDER,
  PREPARATION_DISPLAY_COPY,
  regimenDrugToxicityItems,
  resolvePreparation,
  resolveGuidanceRelationship,
  searchSymptoms,
  searchTreatments,
  treatmentSearchDisplayName,
  type AnswerValue,
} from "@ariad/knowledge-core";
import {
  ArrowLeft,
  ArrowRight,
  BookOpenText,
  Check,
  ChevronRight,
  CircleAlert,
  Clipboard,
  Download,
  HeartHandshake,
  Home,
  Info,
  LoaderCircle,
  Pill,
  Printer,
  QrCode,
  RotateCcw,
  Search,
  ShieldCheck,
  Sparkles,
  Stethoscope,
  TriangleAlert,
} from "lucide-react";
import Image from "next/image";
import { useEffect, useMemo, useRef, useState } from "react";
import { TREATMENT_SAVING_ENABLED } from "@/lib/features";
import {
  activeRelease,
  clinicContactHref,
  clinicConfig,
  drugToxicityPresentationForDrug,
  moduleById,
  questionById,
  releaseRequestHeaders,
  sourceById,
  symptomById,
  treatmentById,
  treatmentName,
} from "@/lib/release";
import {
  clearAriadData,
  EMPTY_PREFERENCES,
  readPreferences,
  saveTreatment,
  type Preferences,
} from "@/lib/storage";

type Screen =
  | "home"
  | "treatment-search"
  | "treatment-overview"
  | "symptom-entry"
  | "candidate-confirm"
  | "treatment-context"
  | "questions"
  | "guidance"
  | "summary"
  | "education-only"
  | "unknown-treatment"
  | "unsupported"
  | "about";

type EntryMode = "prepare" | "symptom";
type AnswerMap = Record<string, string | string[]>;
type GenerationMode = "openai" | "deterministic_match" | "deterministic_fallback";

const DEMO_CODES: Record<string, string> = {
  "THREAD-PAC-01": "weekly-paclitaxel",
  "THREAD-CAPE-02": "capecitabine-monotherapy",
  "THREAD-AC-03": "ac",
};

const SUPPORT_LABELS: Record<SearchRecord["support_status"], string> = {
  full_guidance: "Full guide available",
  education_only: "Drug information only",
  catalogued: "Listed, no guide yet",
  unsupported: "Not available",
};

const COMPACT_CLINICAL_BOUNDARY =
  "Ariad cannot tell what is causing your symptom or how serious it is. It cannot tell you to change your cancer treatment.";

const SECTION_ICONS = {
  about: Info,
  treatment_context: Pill,
  home_management: Home,
  contact_team: HeartHandshake,
  urgent_attention: TriangleAlert,
  reporting_checklist: Clipboard,
} as const;

function renderAnswer(question: Question, answer: string | string[] | undefined): string | null {
  if (answer === undefined || answer === "" || (Array.isArray(answer) && answer.length === 0)) {
    return null;
  }
  if (question.answer_type === "short_text" || question.answer_type === "number") {
    return Array.isArray(answer) ? answer.join(", ") : answer;
  }
  const values = Array.isArray(answer) ? answer : [answer];
  return values
    .map((value) => question.options.find((option) => option.value === value)?.summary_text ?? value)
    .join("; ");
}

function PrototypeBanner() {
  const messages = [
    activeRelease.mandatory_notice,
    clinicConfig.mode === "synthetic_demo" ? "Made-up demo details only" : null,
  ].filter((message): message is string => Boolean(message));
  if (messages.length === 0) return null;

  return (
    <div className="prototype-banner" role="status">
      <ShieldCheck aria-hidden="true" size={18} />
      <span>{messages.join(". ")}.</span>
    </div>
  );
}

function BrandHeader({ onHome, onAbout }: { onHome: () => void; onAbout: () => void }) {
  return (
    <>
      <PrototypeBanner />
      <header className="site-header">
        <button className="brand" type="button" onClick={onHome} aria-label="Ariad home">
          <Image className="brand-mark" src="/kesis-mark.svg" alt="" width={40} height={40} priority />
          <span className="brand-copy">
            <small>Kesis &amp; Sisters</small>
            <strong>Ariad: Breast</strong>
          </span>
        </button>
        <button className="quiet-button" type="button" onClick={onAbout}>
          About &amp; limits
        </button>
      </header>
    </>
  );
}

function EmergencyBoundary() {
  return (
    <aside className="emergency-boundary" aria-label="Emergency information">
      <CircleAlert aria-hidden="true" size={20} />
      <span>
        <strong>Emergency:</strong> {UNIVERSAL_EMERGENCY_STATEMENT}
      </span>
    </aside>
  );
}

function CompactSymptomBoundary() {
  return (
    <aside className="compact-symptom-boundary" aria-label="What Ariad cannot do">
      <ShieldCheck aria-hidden="true" size={17} />
      <span>
        <strong>What Ariad cannot do:</strong> {COMPACT_CLINICAL_BOUNDARY}
      </span>
    </aside>
  );
}

function PageIntro({
  eyebrow,
  title,
  children,
  onBack,
}: {
  eyebrow: string;
  title: string;
  children: React.ReactNode;
  onBack?: () => void;
}) {
  return (
    <div className="page-intro">
      {onBack ? (
        <button className="back-button" type="button" onClick={onBack}>
          <ArrowLeft aria-hidden="true" size={18} /> Back
        </button>
      ) : null}
      <p className="eyebrow">{eyebrow}</p>
      <h1>{title}</h1>
      <div className="lede">{children}</div>
    </div>
  );
}

function BoundaryCard() {
  return (
    <aside className="boundary-card">
      <ShieldCheck aria-hidden="true" size={22} />
      <div>
        <strong>Ariad cannot tell what is causing a symptom or how serious it is.</strong>
        <p>
          Use the contact and urgent-help steps on this page. Follow your cancer
          team&apos;s instructions. Ariad cannot tell you to change cancer treatment.
        </p>
      </div>
    </aside>
  );
}

function SupportPill({ status }: { status: SearchRecord["support_status"] }) {
  return <span className={`support-pill support-${status}`}>{SUPPORT_LABELS[status]}</span>;
}

function PreparationCoveragePill({ basis }: { basis: "exact" | "general" | "unavailable" }) {
  const label = basis === "exact"
    ? "Preparation guide"
    : basis === "general"
      ? "General preparation guide"
      : "Preparation guide not ready";
  return <span className={`support-pill preparation-${basis}`}>{label}</span>;
}

function HomeScreen({
  startPrepare,
  startSymptom,
  runDemo,
  savedTreatmentIds,
  openSavedTreatment,
}: {
  startPrepare: () => void;
  startSymptom: () => void;
  runDemo: (scenario: "neuropathy" | "diarrhea" | "infection") => void;
  savedTreatmentIds: string[];
  openSavedTreatment: (id: string) => void;
}) {
  const savedTreatments = savedTreatmentIds.flatMap((id) => {
    const treatment = treatmentById(id);
    if (!treatment) return [];
    const displayName = treatment.kind === "treatment_class"
      ? treatment.display_name
      : treatmentSearchDisplayName(activeRelease, treatment.id);
    return [{ id, displayName, kind: treatment.kind }];
  });

  return (
    <>
      <section className="hero">
        <div className="hero-copy">
          <p className="eyebrow">A side-effect guide for breast cancer treatment</p>
          <h1>Clear information about treatment and side effects.</h1>
          <p className="hero-lede">
            Start with your treatment or a symptom. Ariad helps you find the information
            you need in one calm path.
          </p>
        </div>
        <div className="hero-thread" aria-hidden="true">
          <span />
          <span />
          <span />
        </div>
      </section>

      <section className="entry-grid" aria-labelledby="choose-path">
        <div className="section-heading">
          <p className="eyebrow">Choose how to start</p>
          <h2 id="choose-path">What would you like help with?</h2>
        </div>
        <button className="entry-card" type="button" onClick={startPrepare}>
          <span className="entry-icon"><BookOpenText aria-hidden="true" /></span>
          <span>
            <strong>I’m starting treatment</strong>
            <small>Learn how to get ready and what you may notice.</small>
          </span>
          <ArrowRight aria-hidden="true" />
        </button>
        <button className="entry-card" type="button" onClick={startSymptom}>
          <span className="entry-icon"><Stethoscope aria-hidden="true" /></span>
          <span>
            <strong>I’m having a symptom</strong>
            <small>Match your words to a symptom and make a summary for your cancer team.</small>
          </span>
          <ArrowRight aria-hidden="true" />
        </button>
      </section>

      {TREATMENT_SAVING_ENABLED && savedTreatments.length > 0 ? (
        <section className="saved-treatments" aria-labelledby="saved-treatments-heading">
          <div className="section-heading">
            <p className="eyebrow">Saved on this device</p>
            <h2 id="saved-treatments-heading">Your saved treatments</h2>
            <p>Open a treatment without searching for it again.</p>
          </div>
          <div className="saved-treatment-list">
            {savedTreatments.map((treatment) => (
              <button
                className="saved-treatment-row"
                type="button"
                key={treatment.id}
                onClick={() => openSavedTreatment(treatment.id)}
                aria-label={`Open saved treatment: ${treatment.displayName}`}
              >
                <span>
                  <small>{treatment.kind === "regimen" ? "Treatment plan" : "Drug"}</small>
                  <strong>{treatment.displayName}</strong>
                </span>
                <ChevronRight aria-hidden="true" size={18} />
              </button>
            ))}
          </div>
        </section>
      ) : null}

      <BoundaryCard />

      <section className="demo-section" aria-labelledby="demo-heading">
        <div className="section-heading">
          <p className="eyebrow">Explore the prototype</p>
          <h2 id="demo-heading">Try a sample path</h2>
          <p>Each example uses made-up answers and draft information linked to health sources.</p>
        </div>
        <div className="demo-grid">
          <button className="demo-card demo-featured" type="button" onClick={() => runDemo("neuropathy")}>
            <span className="demo-number">01</span>
            <span className="ai-chip"><Search aria-hidden="true" size={14} /> Symptom match</span>
            <strong>“My fingertips feel buzzy and small things keep slipping.”</strong>
            <small>Sample treatment: Weekly paclitaxel. Ariad will also show other linked drug pages.</small>
            <span className="text-link">Try this demo <ChevronRight aria-hidden="true" size={16} /></span>
          </button>
          <button className="demo-card" type="button" onClick={() => runDemo("diarrhea")}>
            <span className="demo-number">02</span>
            <strong>Loose, watery bowel movements</strong>
            <small>Sample treatment: Capecitabine. Ariad will also show other linked drug pages.</small>
            <span className="text-link">Try this demo <ChevronRight aria-hidden="true" size={16} /></span>
          </button>
          <button className="demo-card" type="button" onClick={() => runDemo("infection")}>
            <span className="demo-number">03</span>
            <strong>Fever, chills, or feeling unwell</strong>
            <small>Sample treatment: AC chemotherapy. Ariad will also show other linked drug pages.</small>
            <span className="text-link">Try this demo <ChevronRight aria-hidden="true" size={16} /></span>
          </button>
        </div>
      </section>
    </>
  );
}

function TreatmentSearchScreen({
  mode,
  query,
  symptomId,
  suggestedTreatmentId,
  onQueryChange,
  onSelect,
  onUnknown,
  onBack,
}: {
  mode: EntryMode;
  query: string;
  symptomId: string | null;
  suggestedTreatmentId: string | null;
  onQueryChange: (query: string) => void;
  onSelect: (id: string) => void;
  onUnknown: () => void;
  onBack: () => void;
}) {
  const [code, setCode] = useState("");
  const [codeError, setCodeError] = useState<string | null>(null);
  const normalizedQuery = normalizeSearchText(query).replace(/\s+/gu, "");
  const readyToSearch = normalizedQuery.length >= 2;
  const results = readyToSearch ? searchTreatments(activeRelease, query) : [];
  const symptom = symptomId ? symptomById(symptomId) : undefined;
  const symptomListings = symptom ? drugSymptomListings(activeRelease, symptom.id) : [];
  const suggestedTreatment = suggestedTreatmentId
    ? treatmentById(suggestedTreatmentId)
    : undefined;
  const spellingSuggestions =
    results.length > 0 && results.every(({ matchType }) => matchType === "fuzzy");

  const resolveCode = () => {
    const treatmentId = DEMO_CODES[code.trim().toUpperCase()];
    if (!treatmentId) {
      setCodeError("That demo code did not match. Try THREAD-PAC-01.");
      return;
    }
    setCodeError(null);
    onSelect(treatmentId);
  };

  return (
    <>
      <PageIntro
        eyebrow={mode === "prepare" ? "Starting treatment" : "Your treatment"}
        title={mode === "prepare" ? "Which treatment are you starting?" : "Which treatment are you receiving?"}
        onBack={onBack}
      >
        Search using a name from your treatment sheet, visit details, medicine
        container, or cancer team. You can enter one drug or a treatment plan.
      </PageIntro>

      {mode === "symptom" && symptom ? (
        <section className="symptom-drug-listings" aria-labelledby="symptom-drug-listings-heading">
          <header className="symptom-drug-listings-header">
            <p className="eyebrow">Source-linked drug pages</p>
            <h2 id="symptom-drug-listings-heading">
              Drugs in Ariad that list {symptom.patient_label.toLocaleLowerCase("en-CA")}
            </h2>
            <p>
              These Ariad drug pages list this symptom in their side-effect information.
              Each drug keeps its own source. A listing does not mean the drug caused
              what you feel.
            </p>
            <p>
              This list covers drug pages in this demo. It does not show your dose,
              schedule, or full treatment plan. Choose the treatment you actually receive.
            </p>
          </header>

          {suggestedTreatment ? (
            <button
              className="suggested-treatment-card"
              type="button"
              onClick={() => onSelect(suggestedTreatment.id)}
            >
              <span>
                <small>Treatment for this path</small>
                <strong>{treatmentSearchDisplayName(activeRelease, suggestedTreatment.id)}</strong>
                <span>Continue with this treatment</span>
              </span>
              <ChevronRight aria-hidden="true" size={20} />
            </button>
          ) : null}

          {symptomListings.length > 0 ? (
            <details className="symptom-drug-list" open>
              <summary>
                <span>
                  <strong>View linked drug pages</strong>
                  <small>{symptomListings.length} drugs, shown in alphabetical order</small>
                </span>
                <ChevronRight className="summary-chevron" aria-hidden="true" size={20} />
              </summary>
              <div className="symptom-drug-list-body">
                {symptomListings.map(({ drug, effects }) => (
                  <button
                    className="symptom-drug-row"
                    type="button"
                    key={drug.id}
                    onClick={() => onSelect(drug.id)}
                    aria-label={`Drug: ${treatmentSearchDisplayName(activeRelease, drug.id)}. Listed effect: ${effects.map((effect) => effect.display_name).join(", ")}. View this drug page.`}
                  >
                    <span>
                      <strong>{treatmentSearchDisplayName(activeRelease, drug.id)}</strong>
                      <small>{effects.map((effect) => effect.display_name).join(" · ")}</small>
                      <span>View this drug page</span>
                    </span>
                    <ChevronRight aria-hidden="true" size={18} />
                  </button>
                ))}
              </div>
            </details>
          ) : (
            <p className="symptom-drug-list-empty">
              Ariad does not have a source-linked drug page for this symptom yet.
            </p>
          )}
        </section>
      ) : null}

      <div className="search-panel">
        <label htmlFor="treatment-search">Drug or treatment plan</label>
        <div className="search-field">
          <Search aria-hidden="true" size={20} />
          <input
            id="treatment-search"
            value={query}
            onChange={(event) => onQueryChange(event.target.value)}
            placeholder="Try capecitabine, Xeloda, TC, or TCHP"
            autoComplete="off"
            aria-describedby="treatment-search-help"
          />
        </div>
        <p className="search-help" id="treatment-search-help">
          Type at least two characters. Up to three close matches will appear.
        </p>
        {readyToSearch ? (
          <div className="result-list" aria-live="polite" aria-label="Drug and treatment plan results">
            {spellingSuggestions ? <p className="result-list-heading">Did you mean?</p> : null}
            {results.length ? (
              results.map(({ record }) => {
                const isDrug = record.kind === "drug";
                const typeLabel = isDrug ? "Drug" : "Treatment plan";
                const preparation = resolvePreparation(activeRelease, record.id);
                const destination = mode === "prepare"
                  ? preparation.basis === "exact"
                    ? "View preparation and side-effect information"
                    : preparation.basis === "general"
                      ? "View general preparation and available side-effect information"
                      : "See what information is available"
                  : isDrug
                    ? "View this drug’s information"
                    : "View information for each drug in this treatment plan";
                const coverageLabel = mode === "prepare"
                  ? preparation.basis === "exact"
                    ? "Preparation guide available"
                    : preparation.basis === "general"
                      ? "General preparation guide available"
                      : "Preparation guide not ready"
                  : SUPPORT_LABELS[record.support_status];
                const displayName = treatmentSearchDisplayName(activeRelease, record.id);
                return (
                  <button
                    className="result-row"
                    type="button"
                    key={`${record.kind}:${record.id}`}
                    onClick={() => onSelect(record.id)}
                    aria-label={`${typeLabel}: ${displayName}. ${coverageLabel}. ${destination}`}
                  >
                    <span className="result-main">
                      <span className={`result-kind result-kind-${record.kind}`}>{typeLabel}</span>
                      <span className="result-copy">
                        <strong>{displayName}</strong>
                        {mode === "prepare" ? (
                          <PreparationCoveragePill basis={preparation.basis} />
                        ) : (
                          <SupportPill status={record.support_status} />
                        )}
                        <small>{destination}</small>
                      </span>
                    </span>
                    <ChevronRight aria-hidden="true" size={18} />
                  </button>
                );
              })
            ) : (
              <div className="empty-result">
                <strong>No matching drug or treatment plan found.</strong>
                <p>Check the spelling or try another drug or treatment plan name.</p>
              </div>
            )}
          </div>
        ) : null}
      </div>

      <div className="code-panel">
        <div>
          <QrCode aria-hidden="true" />
          <span><strong>Demo treatment code</strong><small>This code has no personal information.</small></span>
        </div>
        <div className="code-entry">
          <label className="sr-only" htmlFor="treatment-code">Treatment code</label>
          <input id="treatment-code" value={code} onChange={(event) => setCode(event.target.value)} placeholder="THREAD-PAC-01" />
          <button className="secondary-button" type="button" onClick={resolveCode}>Use code</button>
        </div>
        {codeError ? <p className="form-error" role="alert">{codeError}</p> : null}
      </div>

      <button className="text-button" type="button" onClick={onUnknown}>I don’t know my treatment</button>
    </>
  );
}

function PreparationModuleContent({ modules }: { modules: EducationalModule[] }) {
  const showModuleTitles = modules.length > 1;
  return (
    <>
      {modules.map((item) => (
        <div className="preparation-step-item" key={item.id}>
          {showModuleTitles ? <h4>{item.title}</h4> : null}
          {item.paragraphs.map((paragraph) => <p key={paragraph}>{paragraph}</p>)}
          {item.bullets.length ? (
            <ul>{item.bullets.map((bullet) => <li key={bullet}>{bullet}</li>)}</ul>
          ) : null}
        </div>
      ))}
    </>
  );
}

function PreparationStepList({ modules }: { modules: EducationalModule[] }) {
  const groups = groupPreparationModulesForDisplay(modules);

  return (
    <>
      <ol className="preparation-steps">
        {PREPARATION_DISPLAY_COPY.steps.map((step, index) => (
          <li className="preparation-step" data-preparation-step={step.id} key={step.id}>
            <header className="preparation-step-header">
              <span className="preparation-step-number" aria-hidden="true">{index + 1}</span>
              <div>
                <span className="preparation-step-label">{step.label}</span>
                <h3>{step.title}</h3>
              </div>
            </header>
            <div className="preparation-step-body">
              <PreparationModuleContent modules={groups[step.id]} />
            </div>
          </li>
        ))}
      </ol>

      {groups.safetyBoundary.length > 0 ? (
        <aside className="preparation-safety-note" aria-label="Important safety information">
          <Info aria-hidden="true" size={22} />
          <div>
            {groups.safetyBoundary.map((item) => (
              <div key={item.id}>
                <h3>{item.title}</h3>
                {item.paragraphs.map((paragraph) => <p key={paragraph}>{paragraph}</p>)}
                {item.bullets.length ? (
                  <ul>{item.bullets.map((bullet) => <li key={bullet}>{bullet}</li>)}</ul>
                ) : null}
              </div>
            ))}
          </div>
        </aside>
      ) : null}
    </>
  );
}

function PreparationSection({
  preparation,
}: {
  preparation: ReturnType<typeof resolvePreparation>;
}) {
  const introduction = preparation.basis === "exact"
    ? PREPARATION_DISPLAY_COPY.exactIntroduction
    : preparation.basis === "unavailable"
      ? PREPARATION_DISPLAY_COPY.unavailableIntroduction
      : null;

  return (
    <section className="preparation-guide" aria-labelledby="preparation-guide-heading">
      <header className="preparation-guide-header">
        <p className="eyebrow">Treatment preparation</p>
        <h2 id="preparation-guide-heading">{PREPARATION_DISPLAY_COPY.heading}</h2>
        <PreparationCoveragePill basis={preparation.basis} />
        {introduction ? <p>{introduction}</p> : null}
        {preparation.fallbackReason ? (
          <p className="preparation-fallback">{preparation.fallbackReason}</p>
        ) : null}
      </header>
      {preparation.modules.length > 0 ? (
        <PreparationStepList modules={preparation.modules} />
      ) : (
        <div className="information-pending preparation-pending">
          <Info aria-hidden="true" size={22} />
          <div>
            <h3>Follow your cancer team&apos;s preparation instructions</h3>
            <p>
              Ask your cancer team what to do before treatment and what to bring. Ariad
              will not guess instructions for your treatment.
            </p>
          </div>
        </div>
      )}
      {preparation.sourceIds.length > 0 ? (
        <SourcesPanel sourceIds={preparation.sourceIds} />
      ) : null}
    </section>
  );
}

function InformationPending({ nested = false }: { nested?: boolean }) {
  const Heading = nested ? "h4" : "h2";
  return (
    <div className="information-pending">
      <Info aria-hidden="true" size={22} />
      <div>
        <Heading>Detailed side-effect information is still being prepared</Heading>
        <p>
          Ariad does not have a detailed side-effect guide for this drug yet. This notice
          applies only to the side-effect section. Follow the information from your cancer team.
        </p>
      </div>
    </div>
  );
}

const PATIENT_FREQUENCY_GROUP_DESCRIPTIONS: Readonly<
  Record<PatientToxicityFrequencyBand, string>
> = {
  many_people: "These side effects happened more often in the study used for FDA drug information.",
  some_people: "These side effects happened in some people in the study used for FDA drug information.",
  fewer_people: "These side effects happened less often in the study used for FDA drug information.",
};

const PATIENT_EFFECT_BLOCKS = [
  ["what_you_may_notice", "What you may notice"],
  ["safe_actions", "Steps that may help"],
  ["contact_team", "Contact your cancer team"],
  ["urgent_help", "Get urgent medical help"],
  ["reassuring_monitoring", "Checks your team may do"],
] as const satisfies readonly [
  keyof Pick<
    PatientToxicityEffect,
    | "what_you_may_notice"
    | "safe_actions"
    | "contact_team"
    | "urgent_help"
    | "reassuring_monitoring"
  >,
  string,
][];

function PatientEffectDisclosure({
  effect,
  nested = false,
}: {
  effect: PatientToxicityEffect;
  nested?: boolean;
}) {
  const BlockHeading = nested ? "h5" : "h3";
  return (
    <details className="toxicity-effect">
      <summary>
        <span>
          <strong>{effect.display_name}</strong>
          <small>{effect.meaning}</small>
        </span>
        <ChevronRight className="summary-chevron" aria-hidden="true" size={20} />
      </summary>
      <div className="toxicity-effect-body">
        {PATIENT_EFFECT_BLOCKS.map(([field, heading]) => {
          const items = effect[field];
          if (items.length === 0) return null;
          return (
            <section className={`patient-effect-block patient-effect-${field}`} key={field}>
              <BlockHeading>{heading}</BlockHeading>
              <ul>{items.map((item) => <li key={item}>{item}</li>)}</ul>
            </section>
          );
        })}
      </div>
    </details>
  );
}

function DrugToxicityPatientView({
  presentation,
  regimenContextLabel,
  idPrefix = presentation.id,
}: {
  presentation: DrugToxicityPresentation;
  regimenContextLabel?: string;
  idPrefix?: string;
}) {
  const nested = Boolean(regimenContextLabel);
  const SectionHeading = nested ? "h4" : "h2";
  const SubsectionHeading = nested ? "h5" : "h3";
  const sideEffectsHeadingId = `side-effects-heading-${idPrefix}`;
  const escalationHeadingId = `toxicity-escalation-heading-${idPrefix}`;
  const groupedEffects = PATIENT_FREQUENCY_BAND_ORDER.map((band) => ({
    band,
    effects: presentation.effects.filter((effect) => effect.frequency_band === band),
  })).filter((group) => group.effects.length > 0);
  const labelGroups = [
    {
      id: "common" as const,
      heading: "Common effects",
      description: "The FDA lists these as common side effects.",
    },
    {
      id: "serious" as const,
      heading: "Serious effects",
      description: "These effects can be serious even if they are not common.",
    },
  ].map((group) => ({
    ...group,
    effects: presentation.effects.filter((effect) => effect.presentation_group === group.id),
  })).filter((group) => group.effects.length > 0);
  const monitoringEffects = presentation.effects.filter(
    (effect) => effect.frequency_band === null && effect.presentation_group === undefined,
  );

  return (
    <section
      className="toxicity-presentation"
      aria-labelledby={sideEffectsHeadingId}
      data-presentation-id={presentation.id}
    >
      {regimenContextLabel ? (
        <aside className="regimen-single-drug-boundary">
          <ShieldCheck aria-hidden="true" size={20} />
          <div>
            <strong>Information for one drug</strong>
            {presentation.evidence_scope === "drug_label" ? (
              <p>{`This section shows FDA information for this drug. It does not say how often these effects happen with the full ${regimenContextLabel} treatment plan.`}</p>
            ) : (
              <p>{`This section shows FDA information for this drug when it was studied alone. The groups do not show how often side effects happen with the full ${regimenContextLabel} treatment plan.`}</p>
            )}
          </div>
        </aside>
      ) : null}
      <header className="toxicity-presentation-header">
        <p className="eyebrow">Side effects for one drug</p>
        <SectionHeading id={sideEffectsHeadingId}>{presentation.subtitle}</SectionHeading>
        <p className="route-label"><Pill aria-hidden="true" size={17} /> {presentation.route_label}</p>
        <p>{presentation.frequency_context}</p>
        <p className="cause-statement"><ShieldCheck aria-hidden="true" size={18} /> {presentation.cause_statement}</p>
      </header>

      <div className="toxicity-frequency-groups">
        {groupedEffects.map(({ band, effects }) => (
          <section className={`toxicity-frequency-group frequency-${band}`} key={band}>
            <header>
              <SectionHeading>{PATIENT_FREQUENCY_BAND_LABELS[band]}</SectionHeading>
              <p>{PATIENT_FREQUENCY_GROUP_DESCRIPTIONS[band]}</p>
            </header>
            <div className="toxicity-effect-list">
              {effects.map((effect) => (
                <PatientEffectDisclosure effect={effect} key={effect.id} nested={nested} />
              ))}
            </div>
          </section>
        ))}

        {labelGroups.map(({ id, heading, description, effects }) => (
          <section className={`toxicity-frequency-group frequency-${id}`} key={id}>
            <header>
              <SectionHeading>{heading}</SectionHeading>
              <p>{description}</p>
            </header>
            <div className="toxicity-effect-list">
              {effects.map((effect) => (
                <PatientEffectDisclosure effect={effect} key={effect.id} nested={nested} />
              ))}
            </div>
          </section>
        ))}

        {monitoringEffects.length > 0 ? (
          <section className="toxicity-frequency-group frequency-monitoring">
            <header>
              <SectionHeading>Changes your team checks for</SectionHeading>
              <p>These are changes your team may find during check-ups or tests. You may not feel them.</p>
            </header>
            <div className="toxicity-effect-list">
              {monitoringEffects.map((effect) => (
                <PatientEffectDisclosure effect={effect} key={effect.id} nested={nested} />
              ))}
            </div>
          </section>
        ) : null}
      </div>

      <p className="toxicity-source-context">{presentation.source_context}</p>
      <SourcesPanel sourceIds={presentation.source_ids} />

      <section className="toxicity-escalation" aria-labelledby={escalationHeadingId}>
        <header>
          <CircleAlert aria-hidden="true" size={24} />
          <div>
            <p className="eyebrow">Keep this easy to find</p>
            <SectionHeading id={escalationHeadingId}>
              {presentation.escalation_summary.heading}
            </SectionHeading>
            <p>{presentation.escalation_summary.introduction}</p>
          </div>
        </header>
        <div className="toxicity-escalation-grid">
          <section>
            <SubsectionHeading>Contact your cancer team</SubsectionHeading>
            <ul>{presentation.escalation_summary.contact_team.map((item) => <li key={item}>{item}</li>)}</ul>
          </section>
          <section className="toxicity-urgent-list">
            <SubsectionHeading>Get urgent medical help</SubsectionHeading>
            <ul>{presentation.escalation_summary.urgent_help.map((item) => <li key={item}>{item}</li>)}</ul>
          </section>
        </div>
        <p className="toxicity-emergency">{UNIVERSAL_EMERGENCY_STATEMENT}</p>
      </section>
    </section>
  );
}

function RegimenMedicationAccordion({
  drug,
  index,
  total,
  presentation,
  regimenId,
  regimenLabel,
}: {
  drug: Drug;
  index: number;
  total: number;
  presentation: DrugToxicityPresentation | null;
  regimenId: string;
  regimenLabel: string;
}) {
  const headingId = `regimen-drug-${regimenId}-${index}-${drug.id}`;
  const idPrefix = `${regimenId}-${index}-${drug.id}`;

  return (
    <details
      className="regimen-medication-card regimen-drug-accordion"
      aria-labelledby={headingId}
      data-drug-id={drug.id}
      data-guide-status={presentation ? "available" : "pending"}
    >
      <summary className="regimen-medication-summary">
        <span className="regimen-medication-summary-copy">
          <span className="regimen-drug-position">Drug {index + 1} of {total}</span>
          <span className="regimen-drug-name" id={headingId} role="heading" aria-level={3}>
            {treatmentSearchDisplayName(activeRelease, drug.id)}
          </span>
          <span className="regimen-drug-status">
            {presentation
              ? "Open side effects and when to get help"
              : "Detailed side-effect guide not ready"}
          </span>
        </span>
        <ChevronRight className="summary-chevron" aria-hidden="true" size={22} />
      </summary>
      <div className="regimen-medication-body">
        {presentation ? (
          <DrugToxicityPatientView
            idPrefix={idPrefix}
            presentation={presentation}
            regimenContextLabel={regimenLabel}
          />
        ) : (
          <InformationPending nested />
        )}
      </div>
    </details>
  );
}

function TreatmentOverviewScreen({
  treatmentId,
  saved,
  onSave,
  onBack,
  onSymptom,
  onSymptomLabel,
}: {
  treatmentId: string;
  saved: boolean;
  onSave: () => void;
  onBack: () => void;
  onSymptom: () => void;
  onSymptomLabel: string;
}) {
  const printSurfaceRef = useRef<HTMLDivElement>(null);
  const treatment = treatmentById(treatmentId);
  const preparation = resolvePreparation(activeRelease, treatmentId);
  const toxicityPresentation = treatment?.kind === "drug"
    ? drugToxicityPresentationForDrug(treatment.id)
    : undefined;
  const regimenItems = treatment?.kind === "regimen"
    ? regimenDrugToxicityItems(activeRelease, treatment.id)
    : [];
  const isRegimen = treatment?.kind === "regimen";
  const hasSideEffectEducation = Boolean(toxicityPresentation) ||
    regimenItems.some(({ presentation }) => presentation !== null);
  const canPrint = preparation.modules.length > 0 || hasSideEffectEducation;
  const overviewTitle = treatment?.kind === "drug" || treatment?.kind === "regimen"
    ? treatmentSearchDisplayName(activeRelease, treatmentId)
    : treatmentName(treatmentId);
  const selectionType = treatment?.kind === "regimen"
    ? "Treatment plan"
    : treatment?.kind === "drug"
      ? "Drug"
      : "Treatment";

  useEffect(() => {
    let previouslyClosed: HTMLDetailsElement[] = [];
    let printExpansionActive = false;
    const expandForPrint = () => {
      if (printExpansionActive) return;
      printExpansionActive = true;
      previouslyClosed = Array.from(
        printSurfaceRef.current?.querySelectorAll<HTMLDetailsElement>("details:not([open])") ?? [],
      );
      previouslyClosed.forEach((details) => {
        details.open = true;
      });
    };
    const restoreAfterPrint = () => {
      if (!printExpansionActive) return;
      previouslyClosed.forEach((details) => {
        details.open = false;
      });
      previouslyClosed = [];
      printExpansionActive = false;
    };

    window.addEventListener("beforeprint", expandForPrint);
    window.addEventListener("afterprint", restoreAfterPrint);
    return () => {
      restoreAfterPrint();
      window.removeEventListener("beforeprint", expandForPrint);
      window.removeEventListener("afterprint", restoreAfterPrint);
    };
  }, []);

  return (
    <div className={canPrint ? "treatment-print-surface" : undefined} ref={printSurfaceRef}>
      <PageIntro
        eyebrow={treatment?.kind === "regimen" ? "Treatment plan information" : "Drug information"}
        title={overviewTitle}
        onBack={onBack}
      >
        {isRegimen && regimenItems.length > 1
          ? "Preparation for the treatment plan comes first. Side-effect information for each cancer drug follows."
          : isRegimen
            ? "Preparation for this treatment plan comes first. Side-effect information for its drug follows."
          : treatment?.kind === "drug"
            ? "Preparation comes first. Side-effect information on this page is for this drug only."
            : "This page shows information about this treatment plan."}
      </PageIntro>
      <div className="overview-meta">
        <span className={`selection-kind selection-kind-${treatment?.kind ?? "drug"}`}>
          {selectionType}
        </span>
        {TREATMENT_SAVING_ENABLED ? (
          <button
            className="secondary-button"
            type="button"
            onClick={onSave}
            aria-pressed={saved}
            disabled={saved}
          >
            {saved ? <Check aria-hidden="true" size={17} /> : null}
            {saved ? "Saved on this device" : "Save this treatment"}
          </button>
        ) : null}
      </div>

      <BoundaryCard />

      <PreparationSection preparation={preparation} />

      <section className="side-effect-education" aria-labelledby="side-effect-education-heading">
        <header className="side-effect-intro">
          <p className="eyebrow">What you may notice</p>
          <h2 id="side-effect-education-heading">Side-effect information</h2>
          <p>
            {isRegimen
              ? "Each drug stays in its own section. Ariad does not treat information for one drug as information for the full treatment plan."
              : "This section is for the selected drug. It cannot predict which effects you will have."}
          </p>
        </header>
        {isRegimen && regimenItems.length > 0 ? (
          <div className="regimen-medication-stack" aria-label="Drugs in this treatment plan">
            {regimenItems.map(({ drug, presentation }, index) => (
              <RegimenMedicationAccordion
                drug={drug}
                index={index}
                key={drug.id}
                presentation={presentation}
                regimenId={treatment.id}
                regimenLabel={treatment.abbreviation ?? treatment.display_name}
                total={regimenItems.length}
              />
            ))}
          </div>
        ) : toxicityPresentation ? (
          <DrugToxicityPatientView presentation={toxicityPresentation} />
        ) : (
          <InformationPending />
        )}
      </section>
      <div className="action-row">
        {canPrint ? (
          <button className="secondary-button print-button" type="button" onClick={() => window.print()}>
            <Printer aria-hidden="true" size={17} /> Print this page
          </button>
        ) : null}
        <button className="primary-button" type="button" onClick={onSymptom}>
          {onSymptomLabel} <ArrowRight aria-hidden="true" size={18} />
        </button>
      </div>
    </div>
  );
}

function SymptomEntryScreen({
  initialText,
  onCandidates,
  onSelect,
  onMissing,
  onBack,
}: {
  initialText: string;
  onCandidates: (result: SymptomClassifierResult, mode: GenerationMode, input: string) => void;
  onSelect: (id: string) => void;
  onMissing: () => void;
  onBack: () => void;
}) {
  const [text, setText] = useState(initialText);
  const [catalogueQuery, setCatalogueQuery] = useState("");
  const [loading, setLoading] = useState(false);
  const [note, setNote] = useState<string | null>(null);
  const catalogue = catalogueQuery
    ? searchSymptoms(activeRelease, catalogueQuery, 10)
    : activeRelease.indexes.symptoms.filter((record) =>
        ["peripheral-neuropathy", "diarrhea", "fever-infection-concern", "fatigue", "nausea", "mouth-soreness"].includes(record.id),
      ).map((record) => ({ record, score: 1, matchType: "exact_name" as const }));

  const findCategory = async () => {
    if (text.trim().length < 2) {
      setNote("Add a few words about what you notice, or choose a symptom from the list.");
      return;
    }
    setLoading(true);
    setNote(null);
    const deterministic = classifySymptomDeterministically(activeRelease, text);
    const strongDeterministic =
      deterministic.candidates.length > 0 &&
      !deterministic.needsClarification &&
      (deterministic.candidates[0]?.confidence ?? 0) >= 0.88;

    if (strongDeterministic) {
      setLoading(false);
      onCandidates(deterministic, "deterministic_match", text);
      return;
    }

    try {
      const response = await fetch("/api/ai/classify-symptom", {
        method: "POST",
        headers: releaseRequestHeaders(),
        body: JSON.stringify({ text }),
      });
      const body = (await response.json()) as {
        result?: unknown;
        generationMode?: GenerationMode;
      };
      if (!response.ok || !body.result) throw new Error("classification unavailable");
      const parsed = body.result as SymptomClassifierResult;
      setLoading(false);
      onCandidates(parsed, body.generationMode ?? "openai", text);
    } catch {
      setLoading(false);
      setNote("The AI service is not available. Ariad is using its built-in symptom list.");
      onCandidates(deterministic, "deterministic_fallback", text);
    }
  };

  return (
    <>
      <PageIntro eyebrow="Symptom guide" title="What are you noticing?" onBack={onBack}>
        Use your own words or choose a symptom from the list. Your words are used only to
        find a match. They do not create medical advice.
      </PageIntro>

      <div className="language-panel">
        <label htmlFor="symptom-description">Describe the symptom in your own words</label>
        <textarea
          id="symptom-description"
          value={text}
          maxLength={500}
          rows={4}
          onChange={(event) => setText(event.target.value)}
          placeholder="For example: My fingertips feel buzzy and small things keep slipping."
        />
        <div className="input-meta">
          <span className="input-count">{text.length}/500</span>
          <span>Do not include your name or other personal details.</span>
        </div>
        <button className="primary-button" type="button" onClick={findCategory} disabled={loading}>
          {loading ? <LoaderCircle className="spin" aria-hidden="true" size={18} /> : <Sparkles aria-hidden="true" size={18} />}
          {loading ? "Finding a symptom…" : "Find a symptom"}
        </button>
        {note ? <p className="form-note" role="status">{note}</p> : null}
      </div>

      <div className="or-divider"><span>or choose from the symptom list</span></div>

      <div className="catalogue-panel">
        <label htmlFor="symptom-catalogue">Search the symptom list</label>
        <div className="search-field">
          <Search aria-hidden="true" size={20} />
          <input id="symptom-catalogue" value={catalogueQuery} onChange={(event) => setCatalogueQuery(event.target.value)} placeholder="Try tingling, watery stool, or mouth sores" />
        </div>
        <div className="symptom-chip-grid">
          {catalogue.map(({ record }) => (
            <button type="button" key={record.id} onClick={() => onSelect(record.id)}>
              <span>{record.display_name}</span>
              <SupportPill status={record.support_status} />
            </button>
          ))}
        </div>
      </div>
      <button className="text-button" type="button" onClick={onMissing}>I can’t find my symptom</button>
    </>
  );
}

function CandidateConfirmScreen({
  result,
  generationMode,
  input,
  onConfirm,
  onBack,
}: {
  result: SymptomClassifierResult;
  generationMode: GenerationMode;
  input: string;
  onConfirm: (id: string) => void;
  onBack: () => void;
}) {
  return (
    <>
      <PageIntro eyebrow="Check the symptom" title="Which symptom is the closest match?" onBack={onBack}>
        Ariad only looks for a match in its symptom list. It cannot tell what is causing the symptom.
      </PageIntro>
      <div className="quoted-input">“{input}”</div>
      <div className="match-method">
        {generationMode === "openai" ? <Sparkles aria-hidden="true" size={18} /> : <Search aria-hidden="true" size={18} />}
        <span>
          {generationMode === "openai"
            ? "Ariad used AI only to match your words to its symptom list. The AI did not decide what is wrong or write medical advice."
            : "Ariad matched your words to its built-in symptom list. It did not decide what is wrong or write medical advice."}
        </span>
      </div>
      <div className="candidate-list">
        {result.candidates.length ? result.candidates.map((candidate) => {
          const symptom = symptomById(candidate.symptomId);
          if (!symptom) return null;
          return (
            <button className="candidate-card" type="button" key={candidate.symptomId} onClick={() => onConfirm(candidate.symptomId)}>
              <span><strong>{symptom.patient_label}</strong></span>
              <span className="confirm-label">Choose this <ChevronRight aria-hidden="true" size={18} /></span>
            </button>
          );
        }) : (
          <div className="empty-result">
            <strong>No close match was found.</strong>
            <p>Choose from the symptom list or contact your cancer team for help describing the symptom.</p>
          </div>
        )}
      </div>
      <button className="text-button" type="button" onClick={onBack}>
        {result.candidates.length ? "None of these. Browse the symptom list" : "Browse the symptom list"}
      </button>
    </>
  );
}

function QuestionScreen({
  question,
  index,
  total,
  answer,
  onAnswer,
  onNext,
  onBack,
}: {
  question: Question;
  index: number;
  total: number;
  answer: string | string[] | undefined;
  onAnswer: (value: string | string[]) => void;
  onNext: () => void;
  onBack: () => void;
}) {
  const values = Array.isArray(answer) ? answer : [];
  const hasAnswer =
    question.optional ||
    (typeof answer === "string" ? answer.trim().length > 0 : Array.isArray(answer) && answer.length > 0);

  const toggle = (value: string) => {
    const next = values.includes(value)
      ? values.filter((item) => item !== value)
      : [...values.filter((item) => item !== "none"), value];
    onAnswer(value === "none" ? ["none"] : next);
  };

  return (
    <>
      <div
        className="question-progress"
        role="progressbar"
        aria-label={`Question ${index + 1} of ${total}`}
        aria-valuemin={1}
        aria-valuemax={total}
        aria-valuenow={index + 1}
      >
        <span style={{ width: `${((index + 1) / total) * 100}%` }} />
      </div>
      <PageIntro eyebrow={`Question ${index + 1} of ${total}`} title={question.prompt} onBack={onBack}>
        {question.help_text ?? "Answer only what you can see or feel."}
      </PageIntro>

      {question.answer_type === "short_text" ? (
        <div className="question-short-text">
          <label className="sr-only" htmlFor={question.id}>{question.prompt}</label>
          <input
            id={question.id}
            value={typeof answer === "string" ? answer : ""}
            maxLength={180}
            onChange={(event) => onAnswer(event.target.value)}
            placeholder={question.optional ? "Optional" : "Type your answer"}
          />
          <small>This answer is cleared when you leave or refresh this page.</small>
        </div>
      ) : (
        <div className="answer-list" role={question.answer_type === "multi_choice" ? "group" : "radiogroup"} aria-label={question.prompt}>
          {question.options.map((option) => {
            const selected = Array.isArray(answer) ? answer.includes(option.value) : answer === option.value;
            return (
              <button
                className={selected ? "answer-option selected" : "answer-option"}
                type="button"
                role={question.answer_type === "multi_choice" ? "checkbox" : "radio"}
                aria-checked={selected}
                key={option.value}
                onClick={() => question.answer_type === "multi_choice" ? toggle(option.value) : onAnswer(option.value)}
              >
                <span className="answer-check">{selected ? <Check aria-hidden="true" size={16} /> : null}</span>
                <span>{option.label}</span>
              </button>
            );
          })}
        </div>
      )}

      <div className="question-actions">
        <button className="primary-button" type="button" onClick={onNext} disabled={!hasAnswer}>
          {index + 1 === total ? "See information" : "Next question"}
          <ArrowRight aria-hidden="true" size={18} />
        </button>
        {question.optional && !hasAnswer ? <button className="text-button" type="button" onClick={onNext}>Skip this question</button> : null}
      </div>
    </>
  );
}

function SourcesPanel({ sourceIds }: { sourceIds: string[] }) {
  const sources = sourceIds.map(sourceById).filter(Boolean);
  return (
    <details className="sources-panel">
      <summary><BookOpenText aria-hidden="true" size={18} /> Where this information comes from <span>{sources.length}</span></summary>
      <div className="sources-content">
        <p>
          This is draft information. A health professional has not reviewed or approved it yet. The
          dates below show when each source was checked.
        </p>
        <ul>
          {sources.map((source) => source ? (
            <li key={source.id}>
              <a href={source.canonical_url} target="_blank" rel="noreferrer">
                <strong>{source.title}</strong>
                <span>{source.organization} · {source.jurisdiction} · checked {source.accessed_date}</span>
              </a>
            </li>
          ) : null)}
        </ul>
      </div>
    </details>
  );
}

function GuidanceScreen({
  treatmentId,
  symptomId,
  answers,
  onSummary,
  onBack,
}: {
  treatmentId: string;
  symptomId: string;
  answers: AnswerMap;
  onSummary: () => void;
  onBack: () => void;
}) {
  const answerValues: AnswerValue[] = Object.entries(answers).map(([questionId, value]) => ({ questionId, value }));
  const guidance = assembleGuidance(activeRelease, treatmentId, symptomId, answerValues);
  const symptom = symptomById(symptomId);
  if (!guidance || !symptom) return null;

  return (
    <>
      <PageIntro eyebrow="Information for this symptom" title={symptom.patient_label} onBack={onBack}>
        <span className="context-line">{treatmentName(treatmentId)} · {guidance.guidance_basis_label}</span>
        {guidance.fallback_reason ? <span className="fallback-note">{guidance.fallback_reason}</span> : null}
      </PageIntro>
      <div className="guidance-sections">
        {guidance.sections.map((section, index) => {
          const Icon = SECTION_ICONS[section.section as keyof typeof SECTION_ICONS] ?? Info;
          const modules = section.module_ids.map(moduleById).filter(Boolean) as EducationalModule[];
          const emphasized = section.emphasized_module_ids.length > 0;
          const isSafetySection = section.section === "contact_team" || section.section === "urgent_attention";
          const hasPendingClinicalDecision = modules.some((item) => item.placeholders.length > 0);
          return (
            <details
              className={`guidance-section section-${section.section}`}
              key={section.section}
              open={isSafetySection || index < 3 || emphasized || hasPendingClinicalDecision}
            >
              <summary>
                <span className="section-icon"><Icon aria-hidden="true" size={20} /></span>
                <span>
                  <strong>{section.heading}</strong>
                  {emphasized && !isSafetySection ? <small>Moved up from your answers</small> : null}
                </span>
                <ChevronRight className="summary-chevron" aria-hidden="true" size={20} />
              </summary>
              <div className="guidance-body">
                {modules.map((item) => (
                  <article key={item.id}>
                    {item.paragraphs.map((paragraph) => <p key={paragraph}>{paragraph}</p>)}
                    {item.bullets.length ? <ul>{item.bullets.map((bullet) => <li key={bullet}>{bullet}</li>)}</ul> : null}
                    {item.placeholders.length ? (
                      <div className="pending-review"><CircleAlert aria-hidden="true" size={17} /> A clinic instruction still needs review.</div>
                    ) : null}
                  </article>
                ))}
              </div>
            </details>
          );
        })}
      </div>

      <ClinicConfigCard
        config={clinicConfig}
        showFeverPolicyNotice={symptomId === "fever-infection-concern"}
      />

      <SourcesPanel sourceIds={guidance.source_ids} />

      <div className="summary-cta">
        <div><p className="eyebrow">For your cancer team</p><h2>Make a symptom summary</h2><p>The summary uses only your answers. Ariad does not say what caused the symptom or what care you need.</p></div>
        <button className="primary-button" type="button" onClick={onSummary}>
          Create a summary for my cancer team <ArrowRight aria-hidden="true" size={18} />
        </button>
      </div>
    </>
  );
}

const CLINIC_CONTACT_ROLE_ORDER: Record<ClinicContactRoute["role"], number> = {
  daytime_team: 0,
  after_hours_team: 1,
};

function ClinicConfigCard({
  config,
  showFeverPolicyNotice,
}: {
  config: ClinicConfigV2;
  showFeverPolicyNotice: boolean;
}) {
  const contacts = [...config.contact_routes].sort(
    (left, right) =>
      CLINIC_CONTACT_ROLE_ORDER[left.role] - CLINIC_CONTACT_ROLE_ORDER[right.role] ||
      left.id.localeCompare(right.id),
  );
  const synthetic = config.mode === "synthetic_demo";
  const feverPolicyPending = config.clinical_policy_bindings.fever.state === "unresolved";
  const [contactActionabilityCheckedAt, setContactActionabilityCheckedAt] = useState<
    string | null
  >(null);

  useEffect(() => {
    const refresh = () => setContactActionabilityCheckedAt(new Date().toISOString());
    const initialTimer = window.setTimeout(refresh, 0);
    const interval = window.setInterval(refresh, 60_000);
    const refreshWhenVisible = () => {
      if (document.visibilityState === "visible") refresh();
    };
    document.addEventListener("visibilitychange", refreshWhenVisible);
    return () => {
      window.clearTimeout(initialTimer);
      window.clearInterval(interval);
      document.removeEventListener("visibilitychange", refreshWhenVisible);
    };
  }, []);

  return (
    <aside className="clinic-card" aria-labelledby="clinic-config-title">
      <p className="eyebrow">
        {synthetic ? "Demo clinic details" : "Your clinic details"}
      </p>
      <h2 id="clinic-config-title">{config.identity.display_name}</h2>
      {synthetic ? (
        <p className="clinic-mode-note">
          Made-up contact details for this demo. Do not call these numbers or use them for care.
        </p>
      ) : null}
      <div className="clinic-contact-list">
        {contacts.map((route) => {
          const telephoneHref = contactActionabilityCheckedAt
            ? clinicContactHref(config, route, contactActionabilityCheckedAt)
            : null;
          return (
            <section className="clinic-contact" key={route.id}>
              <h3>{route.label}</h3>
              {telephoneHref ? (
                <a href={telephoneHref}>{route.display_value}</a>
              ) : synthetic ? (
                <span className="clinic-contact-value">{route.display_value}</span>
              ) : (
                <small className="clinic-verification-note">
                  Contact details are not available while they are being checked
                </small>
              )}
              {synthetic || telephoneHref ? (
                route.availability.state === "display_only" ? (
                  <small>Hours: {route.availability.label}</small>
                ) : (
                  <small>Hours not listed</small>
                )
              ) : (
                <small>Hours are hidden until the contact details have been checked</small>
              )}
            </section>
          );
        })}
      </div>
      <p className="clinic-availability-note">
        Ariad shows the hours provided by the clinic. It does not know if a phone line is open now.
      </p>
      {showFeverPolicyNotice && feverPolicyPending ? (
        <div className="clinic-policy-notice" role="note">
          <CircleAlert aria-hidden="true" size={17} />
          <span>The clinic&apos;s fever instructions still need review.</span>
        </div>
      ) : null}
    </aside>
  );
}

function SummaryScreen({
  result,
  mode,
  loading,
  onBack,
}: {
  result: SymptomSummaryResult;
  mode: GenerationMode;
  loading: boolean;
  onBack: () => void;
}) {
  const [copied, setCopied] = useState(false);
  const asText = [
    activeRelease.mandatory_notice ?? "",
    COMPACT_CLINICAL_BOUNDARY,
    result.title,
    ...result.summaryItems.map((item) => `• ${item.text}`),
    UNIVERSAL_EMERGENCY_STATEMENT,
  ].filter(Boolean).join("\n\n");

  const copy = async () => {
    await navigator.clipboard.writeText(asText);
    setCopied(true);
  };
  const download = () => {
    const url = URL.createObjectURL(new Blob([asText], { type: "text/plain;charset=utf-8" }));
    const anchor = document.createElement("a");
    anchor.href = url;
    anchor.download = "ariad-symptom-summary.txt";
    anchor.click();
    URL.revokeObjectURL(url);
  };

  return (
    <>
      <PageIntro eyebrow="Your symptom summary" title={result.title} onBack={onBack}>
        A summary of what you entered. Check it before sharing.
      </PageIntro>
      <div className="summary-method">
        {loading ? <LoaderCircle className="spin" aria-hidden="true" size={18} /> : mode === "openai" ? <Sparkles aria-hidden="true" size={18} /> : <ShieldCheck aria-hidden="true" size={18} />}
        <span>{loading ? "Making your summary…" : mode === "openai" ? "Ariad used only the answers you gave." : "Ariad made this summary from your answers."}</span>
      </div>
      <article className="summary-sheet" aria-live="polite">
        <PrototypeBanner />
        <h2>{result.title}</h2>
        <ul>{result.summaryItems.map((item, index) => <li key={`${item.sourceFieldIds.join("-")}-${index}`}>{item.text}</li>)}</ul>
        {result.omittedUncertainItems.length ? (
          <div className="summary-omissions">
            <strong>Not included in the summary</strong>
            <p>
              Ariad left out answers it could not safely rewrite: {result.omittedUncertainItems.join(", ")}.
            </p>
          </div>
        ) : null}
        {result.patientQuestions.length ? <><h3>Questions I want to ask</h3><ul>{result.patientQuestions.map((item) => <li key={item}>{item}</li>)}</ul></> : null}
        <p className="summary-boundary">
          This summary contains only the information you entered. {COMPACT_CLINICAL_BOUNDARY}
        </p>
        <p className="summary-emergency">{UNIVERSAL_EMERGENCY_STATEMENT}</p>
      </article>
      <div className="summary-actions">
        <button className="secondary-button" type="button" onClick={copy}>{copied ? <Check aria-hidden="true" size={17} /> : <Clipboard aria-hidden="true" size={17} />}{copied ? "Copied" : "Copy"}</button>
        <button className="secondary-button" type="button" onClick={() => window.print()}><Printer aria-hidden="true" size={17} /> Print</button>
        <button className="secondary-button" type="button" onClick={download}><Download aria-hidden="true" size={17} /> Download</button>
      </div>
    </>
  );
}

function EducationOnlyScreen({
  treatmentId,
  onTreatment,
  onSymptom,
  onHome,
}: {
  treatmentId: string;
  onTreatment: () => void;
  onSymptom: () => void;
  onHome: () => void;
}) {
  const treatment = treatmentById(treatmentId);
  const sourceIds = treatment && "source_ids" in treatment ? treatment.source_ids : [];

  return (
    <>
      <PageIntro
        eyebrow="Drug information only"
        title={`${treatmentName(treatmentId)} is in Ariad's treatment list.`}
        onBack={onTreatment}
      >
        Ariad does not yet have a full guide or symptom information for this drug.
      </PageIntro>
      <div className="unsupported-card">
        <BookOpenText aria-hidden="true" size={28} />
        <div>
          <SupportPill status="education_only" />
          <h2>Some source information is available, but Ariad does not yet have a patient guide for this treatment.</h2>
          <p>
            Use the source links below and the information from your cancer team. Ariad will
            not use general information as if it were written for this exact treatment.
          </p>
        </div>
      </div>
      <SourcesPanel sourceIds={sourceIds} />
      <div className="action-row wrap">
        <button className="secondary-button" type="button" onClick={onTreatment}>Search another treatment</button>
        <button className="secondary-button" type="button" onClick={onSymptom}>View symptom list</button>
        <button className="text-button" type="button" onClick={onHome}>Return home</button>
      </div>
    </>
  );
}

function UnknownTreatmentScreen({
  onBack,
  onSymptom,
  onHome,
}: {
  onBack: () => void;
  onSymptom: () => void;
  onHome: () => void;
}) {
  return (
    <>
      <PageIntro
        eyebrow="Finding your treatment"
        title="You can check a few places for the name"
        onBack={onBack}
      >
        Ariad needs a treatment name before it can show treatment-specific information.
      </PageIntro>
      <section className="unknown-treatment-card" aria-labelledby="unknown-treatment-steps">
        <Clipboard aria-hidden="true" size={28} />
        <div>
          <h2 id="unknown-treatment-steps">Where to look</h2>
          <ul>
            <li>Check your treatment sheet, visit details, or medicine list.</li>
            <li>For pills, look at the medicine container.</li>
            <li>Look for a full drug name, a brand name, or a short plan name such as AC or TCHP.</li>
            <li>If you are not sure, ask your cancer team to confirm the exact name.</li>
          </ul>
          <p>Do not guess which treatment you are receiving.</p>
        </div>
      </section>
      <div className="action-row wrap">
        <button className="primary-button" type="button" onClick={onBack}>
          Try the treatment search <ArrowRight aria-hidden="true" size={18} />
        </button>
        <button className="secondary-button" type="button" onClick={onSymptom}>
          View symptom list
        </button>
        <button className="text-button" type="button" onClick={onHome}>Return home</button>
      </div>
    </>
  );
}

function UnsupportedScreen({ reason, onTreatment, onSymptom, onHome }: { reason: string; onTreatment: () => void; onSymptom: () => void; onHome: () => void }) {
  return (
    <>
      <PageIntro eyebrow="Information not available" title="Ariad does not have a guide for this choice.">
        {reason}
      </PageIntro>
      <div className="unsupported-card">
        <CircleAlert aria-hidden="true" size={28} />
        <div>
          <h2>Ariad does not have information for this drug or treatment plan yet.</h2>
          <p>Try a brand name, another drug name, the short name for a treatment plan, or one drug in the plan. Ariad will clearly say when information is general and not for the exact treatment.</p>
          <p>If you still cannot find it, follow the information from your cancer team or ask them where to find the right patient information.</p>
        </div>
      </div>
      <BoundaryCard />
      <div className="action-row wrap">
        <button className="secondary-button" type="button" onClick={onTreatment}>Search another treatment</button>
        <button className="secondary-button" type="button" onClick={onSymptom}>View symptom list</button>
        <button className="text-button" type="button" onClick={onHome}>Return home</button>
      </div>
    </>
  );
}

function AboutScreen({ onBack, onReset }: { onBack: () => void; onReset: () => void }) {
  return (
    <>
      <PageIntro eyebrow="About this prototype" title="What Ariad can and cannot do" onBack={onBack}>
        Ariad helps you find information about treatment side effects. Its safety information
        comes from a fixed set of health sources.
      </PageIntro>
      <div className="about-grid">
        <article><ShieldCheck aria-hidden="true" /><h2>Fixed safety information</h2><p>Ariad shows information from the sources listed in this demo. The information is still a draft and has not been approved for patient care.</p></article>
        <article><Sparkles aria-hidden="true" /><h2>How Ariad uses AI</h2><p>AI may match your words to a symptom and rewrite the facts you enter. It cannot write safety advice, decide what is wrong, or tell you what care you need.</p></article>
        <article>
          <Clipboard aria-hidden="true" />
          <h2>Your privacy</h2>
          <p>
            {TREATMENT_SAVING_ENABLED
              ? "You do not need an account. Treatments you save stay on this device. Ariad does not keep your symptom answers after you leave or refresh the page."
              : "You do not need an account. The competition demo does not add treatment choices to a saved list. Ariad does not keep your symptom answers after you leave or refresh the page."}
          </p>
        </article>
      </div>
      <section className="intended-use"><h2>What Ariad is for</h2><p>{ARIAD_INTENDED_USE}</p></section>
      <section className="release-card"><p className="eyebrow">Version used for this demo</p><span>Demo version {activeRelease.release_version}</span></section>
      <button className="danger-text-button" type="button" onClick={onReset}>
        <RotateCcw aria-hidden="true" size={17} />
        {TREATMENT_SAVING_ENABLED ? "Reset demo and clear saved treatments" : "Reset demo"}
      </button>
    </>
  );
}

export function AriadApp() {
  const mainRef = useRef<HTMLElement>(null);
  const [screen, setScreen] = useState<Screen>("home");
  const [previousScreen, setPreviousScreen] = useState<Screen>("home");
  const [mode, setMode] = useState<EntryMode>("symptom");
  const [treatmentQuery, setTreatmentQuery] = useState("");
  const [selectedTreatmentId, setSelectedTreatmentId] = useState<string | null>(null);
  const [selectedSymptomId, setSelectedSymptomId] = useState<string | null>(null);
  const [sampleTreatmentId, setSampleTreatmentId] = useState<string | null>(null);
  const [initialSymptomText, setInitialSymptomText] = useState("");
  const [candidateResult, setCandidateResult] = useState<SymptomClassifierResult | null>(null);
  const [candidateMode, setCandidateMode] = useState<GenerationMode>("deterministic_match");
  const [candidateInput, setCandidateInput] = useState("");
  const [answers, setAnswers] = useState<AnswerMap>({});
  const [questionIndex, setQuestionIndex] = useState(0);
  const [preferences, setPreferences] = useState<Preferences>(EMPTY_PREFERENCES);
  const [unsupportedReason, setUnsupportedReason] = useState("");
  const [summaryResult, setSummaryResult] = useState<SymptomSummaryResult | null>(null);
  const [summaryMode, setSummaryMode] = useState<GenerationMode>("deterministic_fallback");
  const [summaryLoading, setSummaryLoading] = useState(false);
  const navigationStep = screen === "questions" ? `${screen}:${questionIndex}` : screen;

  useEffect(() => {
    document.body.dataset.ariadReady = "true";
    const timer = window.setTimeout(() => {
      setPreferences(
        TREATMENT_SAVING_ENABLED ? readPreferences() : clearAriadData(),
      );
      const parameters = new URLSearchParams(window.location.search);
      const code = parameters.get("code")?.toUpperCase();
      const treatmentId = code ? DEMO_CODES[code] : undefined;
      const requestedTreatmentId = parameters.get("treatment");
      const directTreatmentId = requestedTreatmentId && treatmentById(requestedTreatmentId)
        ? requestedTreatmentId
        : undefined;
      if (treatmentId || directTreatmentId) {
        setMode("prepare");
        setSelectedTreatmentId(treatmentId ?? directTreatmentId ?? null);
        setScreen("treatment-overview");
      }
    }, 0);
    return () => {
      window.clearTimeout(timer);
      delete document.body.dataset.ariadReady;
    };
  }, []);

  useEffect(() => {
    const root = document.documentElement;
    const previousScrollStyle = root.style.scrollBehavior;
    root.style.scrollBehavior = "auto";
    if (screen !== "home") mainRef.current?.focus({ preventScroll: true });
    window.scrollTo(0, 0);
    const restoreFrame = window.requestAnimationFrame(() => {
      root.style.scrollBehavior = previousScrollStyle;
    });
    return () => {
      window.cancelAnimationFrame(restoreFrame);
      root.style.scrollBehavior = previousScrollStyle;
    };
  }, [navigationStep, screen]);

  const relationshipResolution = useMemo(
    () => selectedTreatmentId && selectedSymptomId
      ? resolveGuidanceRelationship(activeRelease, selectedTreatmentId, selectedSymptomId)
      : null,
    [selectedSymptomId, selectedTreatmentId],
  );
  const questions = useMemo(
    () => (relationshipResolution?.relationship.question_ids ?? []).map(questionById).filter(Boolean) as Question[],
    [relationshipResolution],
  );

  const resetEphemeral = () => {
    setSelectedTreatmentId(null);
    setSelectedSymptomId(null);
    setSampleTreatmentId(null);
    setInitialSymptomText("");
    setCandidateResult(null);
    setAnswers({});
    setQuestionIndex(0);
    setSummaryResult(null);
    setSummaryLoading(false);
  };

  const goHome = () => {
    resetEphemeral();
    setTreatmentQuery("");
    setScreen("home");
  };

  const goAbout = () => {
    setPreviousScreen(screen);
    setScreen("about");
  };

  const chooseTreatment = (id: string) => {
    setSelectedTreatmentId(id);
    setScreen("treatment-overview");
  };

  const openSavedTreatment = (id: string) => {
    resetEphemeral();
    setMode("prepare");
    setSelectedTreatmentId(id);
    setScreen("treatment-overview");
  };

  const continueFromTreatment = () => {
    if (!selectedTreatmentId) return;
    if (!selectedSymptomId) {
      setMode("symptom");
      setScreen("symptom-entry");
      return;
    }

    const treatment = treatmentById(selectedTreatmentId);
    const supportStatus = treatment && "support_status" in treatment
      ? treatment.support_status
      : "catalogued";
    if (resolveGuidanceRelationship(activeRelease, selectedTreatmentId, selectedSymptomId)) {
      setAnswers({});
      setQuestionIndex(0);
      setScreen("questions");
    } else if (supportStatus === "education_only") {
      setScreen("education-only");
    } else {
      setUnsupportedReason("Ariad does not have a full guide for this treatment and symptom together.");
      setScreen("unsupported");
    }
  };

  const chooseSymptom = (id: string) => {
    setSelectedSymptomId(id);
    setTreatmentQuery("");
    setScreen("treatment-context");
  };

  const beginDemo = (scenario: "neuropathy" | "diarrhea" | "infection") => {
    setMode("symptom");
    setSelectedTreatmentId(null);
    setAnswers({});
    setQuestionIndex(0);
    if (scenario === "neuropathy") {
      const text = "My fingertips feel buzzy and small things keep slipping from my hand.";
      setSampleTreatmentId("weekly-paclitaxel");
      setInitialSymptomText(text);
      setScreen("symptom-entry");
    } else if (scenario === "diarrhea") {
      setSampleTreatmentId("capecitabine-monotherapy");
      setSelectedSymptomId("diarrhea");
      setScreen("treatment-context");
    } else {
      setSampleTreatmentId("ac");
      setSelectedSymptomId("fever-infection-concern");
      setScreen("treatment-context");
    }
  };

  const showCandidates = (result: SymptomClassifierResult, generationMode: GenerationMode, input: string) => {
    setCandidateResult(result);
    setCandidateMode(generationMode);
    setCandidateInput(input);
    setScreen("candidate-confirm");
  };

  const createSummary = async () => {
    if (!selectedTreatmentId || !selectedSymptomId) return;
    const facts = questions.flatMap((question) => {
      const rendered = renderAnswer(question, answers[question.id]);
      return rendered ? [{ id: question.id, label: question.summary_label, value: rendered }] : [];
    });
    const request = {
      symptomId: selectedSymptomId,
      symptomLabel: symptomById(selectedSymptomId)?.patient_label ?? selectedSymptomId,
      treatmentId: selectedTreatmentId,
      treatmentLabel: treatmentName(selectedTreatmentId),
      facts,
    };
    const fallback = deterministicSummary(request);
    setSummaryResult(fallback);
    setSummaryMode("deterministic_fallback");
    setSummaryLoading(true);
    setScreen("summary");
    try {
      const response = await fetch("/api/ai/create-symptom-summary", {
        method: "POST",
        headers: releaseRequestHeaders(),
        body: JSON.stringify(request),
      });
      const body = (await response.json()) as { result?: unknown; generationMode?: GenerationMode };
      const parsed = SymptomSummaryResultSchema.safeParse(body.result);
      if (!response.ok || !parsed.success) throw new Error("summary unavailable");
      setSummaryResult(parsed.data);
      setSummaryMode(body.generationMode ?? "openai");
    } catch {
      setSummaryResult(fallback);
      setSummaryMode("deterministic_fallback");
    } finally {
      setSummaryLoading(false);
    }
  };

  const currentQuestion = questions[questionIndex];

  return (
    <>
      <a className="skip-link" href="#main-content">Skip to main content</a>
      <BrandHeader onHome={goHome} onAbout={goAbout} />
      <EmergencyBoundary />
      {[
        "symptom-entry",
        "candidate-confirm",
        "treatment-context",
        "questions",
        "guidance",
        "summary",
        "education-only",
        "unsupported",
      ].includes(screen) ? <CompactSymptomBoundary /> : null}
      <main id="main-content" className="app-shell" ref={mainRef} tabIndex={-1}>
        {screen === "home" ? (
          <HomeScreen
            startPrepare={() => { resetEphemeral(); setTreatmentQuery(""); setMode("prepare"); setScreen("treatment-search"); }}
            startSymptom={() => { resetEphemeral(); setMode("symptom"); setScreen("symptom-entry"); }}
            runDemo={beginDemo}
            savedTreatmentIds={preferences.savedTreatmentIds}
            openSavedTreatment={openSavedTreatment}
          />
        ) : null}

        {screen === "treatment-search" || screen === "treatment-context" ? (
          <TreatmentSearchScreen
            mode={screen === "treatment-context" ? "symptom" : mode}
            query={treatmentQuery}
            symptomId={screen === "treatment-context" ? selectedSymptomId : null}
            suggestedTreatmentId={screen === "treatment-context" ? selectedTreatmentId ?? sampleTreatmentId : null}
            onQueryChange={setTreatmentQuery}
            onSelect={chooseTreatment}
            onUnknown={() => setScreen("unknown-treatment")}
            onBack={() => setScreen(screen === "treatment-context" ? "symptom-entry" : "home")}
          />
        ) : null}

        {screen === "treatment-overview" && selectedTreatmentId ? (
          <TreatmentOverviewScreen
            treatmentId={selectedTreatmentId}
            saved={preferences.savedTreatmentIds.includes(selectedTreatmentId)}
            onSave={() => {
              if (TREATMENT_SAVING_ENABLED) {
                setPreferences(saveTreatment(preferences, selectedTreatmentId));
              }
            }}
            onBack={() => setScreen(selectedSymptomId ? "treatment-context" : "treatment-search")}
            onSymptom={continueFromTreatment}
            onSymptomLabel={selectedSymptomId ? "Continue with this treatment" : "I’m having a symptom"}
          />
        ) : null}

        {screen === "symptom-entry" ? (
          <SymptomEntryScreen
            initialText={initialSymptomText}
            onCandidates={showCandidates}
            onSelect={chooseSymptom}
            onMissing={() => { setUnsupportedReason("Ariad could not safely match this symptom to its list."); setScreen("unsupported"); }}
            onBack={() => setScreen(selectedTreatmentId ? "treatment-overview" : "home")}
          />
        ) : null}

        {screen === "candidate-confirm" && candidateResult ? (
          <CandidateConfirmScreen
            result={candidateResult}
            generationMode={candidateMode}
            input={candidateInput}
            onConfirm={chooseSymptom}
            onBack={() => setScreen("symptom-entry")}
          />
        ) : null}

        {screen === "questions" && currentQuestion ? (
          <QuestionScreen
            question={currentQuestion}
            index={questionIndex}
            total={questions.length}
            answer={answers[currentQuestion.id]}
            onAnswer={(value) => setAnswers((current) => ({ ...current, [currentQuestion.id]: value }))}
            onNext={() => questionIndex + 1 < questions.length ? setQuestionIndex((index) => index + 1) : setScreen("guidance")}
            onBack={() => questionIndex > 0 ? setQuestionIndex((index) => index - 1) : setScreen("treatment-context")}
          />
        ) : null}

        {screen === "guidance" && selectedTreatmentId && selectedSymptomId ? (
          <GuidanceScreen
            treatmentId={selectedTreatmentId}
            symptomId={selectedSymptomId}
            answers={answers}
            onSummary={createSummary}
            onBack={() => { setQuestionIndex(Math.max(0, questions.length - 1)); setScreen("questions"); }}
          />
        ) : null}

        {screen === "summary" && summaryResult ? (
          <SummaryScreen result={summaryResult} mode={summaryMode} loading={summaryLoading} onBack={() => setScreen("guidance")} />
        ) : null}

        {screen === "education-only" && selectedTreatmentId ? (
          <EducationOnlyScreen
            treatmentId={selectedTreatmentId}
            onTreatment={() => setScreen("treatment-search")}
            onSymptom={() => setScreen("symptom-entry")}
            onHome={goHome}
          />
        ) : null}

        {screen === "unknown-treatment" ? (
          <UnknownTreatmentScreen
            onBack={() => setScreen(selectedSymptomId ? "treatment-context" : "treatment-search")}
            onSymptom={() => { resetEphemeral(); setMode("symptom"); setScreen("symptom-entry"); }}
            onHome={goHome}
          />
        ) : null}

        {screen === "unsupported" ? (
          <UnsupportedScreen
            reason={unsupportedReason}
            onTreatment={() => setScreen("treatment-search")}
            onSymptom={() => setScreen("symptom-entry")}
            onHome={goHome}
          />
        ) : null}

        {screen === "about" ? (
          <AboutScreen
            onBack={() => setScreen(previousScreen)}
            onReset={() => { setPreferences(clearAriadData()); goHome(); }}
          />
        ) : null}
      </main>
      <footer className="site-footer">
        <span>Kesis &amp; Sisters · Turning complexity into clarity.</span>
        <span>Demo version {activeRelease.release_version}</span>
      </footer>
    </>
  );
}
