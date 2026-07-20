"use client";

import type {
  ClinicConfigV2,
  ClinicContactRoute,
  Drug,
  EducationalModule,
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
  normalizeSearchText,
  preparationModules,
  regimenComponentDrugs,
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
import {
  activeRelease,
  clinicContactHref,
  clinicConfig,
  moduleById,
  questionById,
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
  full_guidance: "Full demo guidance",
  education_only: "Education only",
  catalogued: "Catalogued",
  unsupported: "Unsupported",
};

const COMPACT_CLINICAL_BOUNDARY =
  "Ariad cannot determine the cause, assign a grade, personalize triage, or recommend a treatment change.";

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
    clinicConfig.mode === "synthetic_demo" ? "Synthetic demo data only" : null,
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
      <span>{UNIVERSAL_EMERGENCY_STATEMENT}</span>
    </aside>
  );
}

function CompactSymptomBoundary() {
  return (
    <aside className="compact-symptom-boundary" aria-label="Ariad clinical boundary">
      <ShieldCheck aria-hidden="true" size={17} />
      <span>{COMPACT_CLINICAL_BOUNDARY}</span>
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
        <strong>Education, not a diagnosis or personal triage decision</strong>
        <p>
          Ariad cannot determine the cause, assign a grade, or tell you to change cancer
          treatment. Follow the instructions provided by your cancer team.
        </p>
      </div>
    </aside>
  );
}

function SupportPill({ status }: { status: SearchRecord["support_status"] }) {
  return <span className={`support-pill support-${status}`}>{SUPPORT_LABELS[status]}</span>;
}

function HomeScreen({
  startPrepare,
  startSymptom,
  runDemo,
}: {
  startPrepare: () => void;
  startSymptom: () => void;
  runDemo: (scenario: "neuropathy" | "diarrhea" | "infection") => void;
}) {
  return (
    <>
      <section className="hero">
        <div className="hero-copy">
          <p className="eyebrow">A breast cancer treatment side-effect companion</p>
          <h1>A clearer way into the questions treatment creates.</h1>
          <p className="hero-lede">
            Start with your treatment or something you are noticing. Ariad brings the
            relevant, source-controlled information into one calm path.
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
          <p className="eyebrow">Choose where to begin</p>
          <h2 id="choose-path">Two paths. One governed knowledge source.</h2>
        </div>
        <button className="entry-card" type="button" onClick={startPrepare}>
          <span className="entry-icon"><BookOpenText aria-hidden="true" /></span>
          <span>
            <strong>I’m starting treatment</strong>
            <small>Learn what to expect and save a treatment on this device.</small>
          </span>
          <ArrowRight aria-hidden="true" />
        </button>
        <button className="entry-card" type="button" onClick={startSymptom}>
          <span className="entry-icon"><Stethoscope aria-hidden="true" /></span>
          <span>
            <strong>I’m having a symptom</strong>
            <small>Find a controlled symptom category and prepare a neutral summary.</small>
          </span>
          <ArrowRight aria-hidden="true" />
        </button>
      </section>

      <BoundaryCard />

      <section className="demo-section" aria-labelledby="demo-heading">
        <div className="section-heading">
          <p className="eyebrow">Explore the prototype</p>
          <h2 id="demo-heading">Try a sample path</h2>
          <p>Each scenario uses synthetic answers and draft, source-linked content.</p>
        </div>
        <div className="demo-grid">
          <button className="demo-card demo-featured" type="button" onClick={() => runDemo("neuropathy")}>
            <span className="demo-number">01</span>
            <span className="ai-chip"><Search aria-hidden="true" size={14} /> Controlled navigation</span>
            <strong>“My fingertips feel buzzy and small things keep slipping.”</strong>
            <small>Weekly paclitaxel · peripheral neuropathy</small>
            <span className="text-link">Try this demo <ChevronRight aria-hidden="true" size={16} /></span>
          </button>
          <button className="demo-card" type="button" onClick={() => runDemo("diarrhea")}>
            <span className="demo-number">02</span>
            <strong>Loose, watery bowel movements</strong>
            <small>Capecitabine · diarrhea</small>
            <span className="text-link">Try this demo <ChevronRight aria-hidden="true" size={16} /></span>
          </button>
          <button className="demo-card" type="button" onClick={() => runDemo("infection")}>
            <span className="demo-number">03</span>
            <strong>Fever, chills, or feeling unwell</strong>
            <small>AC chemotherapy · infection concern</small>
            <span className="text-link">Try this demo <ChevronRight aria-hidden="true" size={16} /></span>
          </button>
        </div>
      </section>
    </>
  );
}

function TreatmentSearchScreen({
  mode,
  onSelect,
  onUnknown,
  onBack,
}: {
  mode: EntryMode;
  onSelect: (id: string) => void;
  onUnknown: () => void;
  onBack: () => void;
}) {
  const [query, setQuery] = useState("");
  const [code, setCode] = useState("");
  const [codeError, setCodeError] = useState<string | null>(null);
  const normalizedQuery = normalizeSearchText(query).replace(/\s+/gu, "");
  const readyToSearch = normalizedQuery.length >= 2;
  const results = readyToSearch ? searchTreatments(activeRelease, query) : [];
  const spellingSuggestions =
    results.length > 0 && results.every(({ matchType }) => matchType === "fuzzy");

  const resolveCode = () => {
    const treatmentId = DEMO_CODES[code.trim().toUpperCase()];
    if (!treatmentId) {
      setCodeError("That demo code was not recognized. Try THREAD-PAC-01.");
      return;
    }
    setCodeError(null);
    onSelect(treatmentId);
  };

  return (
    <>
      <PageIntro
        eyebrow={mode === "prepare" ? "Starting treatment" : "Treatment context"}
        title={mode === "prepare" ? "Which treatment are you starting?" : "Which treatment are you receiving?"}
        onBack={onBack}
      >
        Search for one drug by its generic or brand name, or for a regimen by its
        abbreviation or full name.
      </PageIntro>

      <div className="search-panel">
        <label htmlFor="treatment-search">Drug or regimen</label>
        <div className="search-field">
          <Search aria-hidden="true" size={20} />
          <input
            id="treatment-search"
            value={query}
            onChange={(event) => setQuery(event.target.value)}
            placeholder="Try capecitabine, Xeloda, TC, or TCHP"
            autoComplete="off"
            aria-describedby="treatment-search-help"
          />
        </div>
        <p className="search-help" id="treatment-search-help">
          Type at least two characters. Up to three close matches will appear.
        </p>
        {readyToSearch ? (
          <div className="result-list" aria-live="polite" aria-label="Drug and regimen results">
            {spellingSuggestions ? <p className="result-list-heading">Did you mean?</p> : null}
            {results.length ? (
              results.map(({ record }) => {
                const isDrug = record.kind === "drug";
                const typeLabel = isDrug ? "Drug" : "Regimen";
                const destination = isDrug
                  ? "View this drug’s information"
                  : "View information for each drug in this regimen";
                const displayName = treatmentSearchDisplayName(activeRelease, record.id);
                return (
                  <button
                    className="result-row"
                    type="button"
                    key={`${record.kind}:${record.id}`}
                    onClick={() => onSelect(record.id)}
                    aria-label={`${typeLabel}: ${displayName}. ${destination}`}
                  >
                    <span className="result-main">
                      <span className={`result-kind result-kind-${record.kind}`}>{typeLabel}</span>
                      <span className="result-copy">
                        <strong>{displayName}</strong>
                        <small>{destination}</small>
                      </span>
                    </span>
                    <ChevronRight aria-hidden="true" size={18} />
                  </button>
                );
              })
            ) : (
              <div className="empty-result">
                <strong>No matching drug or regimen found.</strong>
                <p>Check the spelling or try another generic, brand, or regimen name.</p>
              </div>
            )}
          </div>
        ) : null}
      </div>

      <div className="code-panel">
        <div>
          <QrCode aria-hidden="true" />
          <span><strong>Clinic-issued treatment code demo</strong><small>No personal information is encoded.</small></span>
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

function PreparationModuleList({
  modules,
  nested = false,
}: {
  modules: EducationalModule[];
  nested?: boolean;
}) {
  const Heading = nested ? "h3" : "h2";
  return (
    <div className="module-stack preparation-stack">
      {modules.map((item, index) => (
        <section className="preparation-module" key={item.id}>
          <span className="module-index">{String(index + 1).padStart(2, "0")}</span>
          <div>
            <Heading>{item.title}</Heading>
            {item.paragraphs.map((paragraph) => <p key={paragraph}>{paragraph}</p>)}
            {item.bullets.length ? (
              <ul>{item.bullets.map((bullet) => <li key={bullet}>{bullet}</li>)}</ul>
            ) : null}
          </div>
        </section>
      ))}
    </div>
  );
}

function InformationPending({ nested = false }: { nested?: boolean }) {
  const Heading = nested ? "h3" : "h2";
  return (
    <div className="information-pending">
      <Info aria-hidden="true" size={22} />
      <div>
        <Heading>Information for this drug is being prepared</Heading>
        <p>
          Drug-specific information is not shown here yet. Follow the information provided
          by your cancer team.
        </p>
      </div>
    </div>
  );
}

function RegimenMedicationCard({ drug, index }: { drug: Drug; index: number }) {
  const modules = preparationModules(activeRelease, drug.id);
  const sourceIds = [...new Set(modules.flatMap((item) => item.source_ids))].sort();
  const headingId = `regimen-drug-${drug.id}`;

  return (
    <article className="regimen-medication-card" aria-labelledby={headingId}>
      <header className="regimen-medication-header">
        <span>Drug {String(index + 1).padStart(2, "0")}</span>
        <h2 id={headingId}>{treatmentSearchDisplayName(activeRelease, drug.id)}</h2>
      </header>
      {modules.length ? (
        <>
          <PreparationModuleList modules={modules} nested />
          <SourcesPanel sourceIds={sourceIds} />
        </>
      ) : (
        <InformationPending nested />
      )}
    </article>
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
  const treatment = treatmentById(treatmentId);
  const modules = preparationModules(activeRelease, treatmentId);
  const sourceIds = [...new Set(modules.flatMap((item) => item.source_ids))].sort();
  const regimenDrugs = treatment?.kind === "regimen"
    ? regimenComponentDrugs(activeRelease, treatment.id)
    : [];
  const isMultiDrugRegimen = treatment?.kind === "regimen" && regimenDrugs.length > 1;
  const overviewTitle = treatment?.kind === "drug" || isMultiDrugRegimen
    ? treatmentSearchDisplayName(activeRelease, treatmentId)
    : treatmentName(treatmentId);
  const selectionType = treatment?.kind === "regimen" ? "Regimen" : "Drug";

  return (
    <>
      <PageIntro
        eyebrow={treatment?.kind === "regimen" ? "Regimen information" : "Drug information"}
        title={overviewTitle}
        onBack={onBack}
      >
        {isMultiDrugRegimen
          ? "Each anticancer drug in this regimen is shown in its own card."
          : treatment?.kind === "drug"
            ? "This page is for this drug only. Information for other drugs is kept separate."
            : "This page shows the current preparation information for this regimen."}
      </PageIntro>
      <div className="overview-meta">
        <span className={`selection-kind selection-kind-${treatment?.kind ?? "drug"}`}>
          {selectionType}
        </span>
        <button className="secondary-button" type="button" onClick={onSave}>
          {saved ? <Check aria-hidden="true" size={17} /> : null}
          {saved ? "Saved on this device" : "Save this treatment"}
        </button>
      </div>

      <BoundaryCard />

      {isMultiDrugRegimen ? (
        <section className="regimen-medication-stack" aria-label="Drugs in this regimen">
          {regimenDrugs.map((drug, index) => (
            <RegimenMedicationCard drug={drug} index={index} key={drug.id} />
          ))}
        </section>
      ) : modules.length ? (
        <>
          <PreparationModuleList modules={modules} />
          <SourcesPanel sourceIds={sourceIds} />
        </>
      ) : (
        <InformationPending />
      )}
      <div className="action-row">
        <button className="primary-button" type="button" onClick={onSymptom}>
          {onSymptomLabel} <ArrowRight aria-hidden="true" size={18} />
        </button>
      </div>
    </>
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
      setNote("Add a few words about what you are noticing, or choose from the catalogue.");
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
        headers: { "content-type": "application/json" },
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
      setNote("GPT‑5.6 is unavailable right now. Ariad is using its controlled catalogue fallback.");
      onCandidates(deterministic, "deterministic_fallback", text);
    }
  };

  return (
    <>
      <PageIntro eyebrow="Symptom navigator" title="What are you noticing?" onBack={onBack}>
        Use your own words or choose a controlled symptom category. Free text is used only
        for navigation—it never becomes clinical guidance.
      </PageIntro>
      <BoundaryCard />

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
        <div className="input-meta"><span>{text.length}/500</span><span>No identifying information, please.</span></div>
        <button className="primary-button" type="button" onClick={findCategory} disabled={loading}>
          {loading ? <LoaderCircle className="spin" aria-hidden="true" size={18} /> : <Sparkles aria-hidden="true" size={18} />}
          {loading ? "Finding a controlled category…" : "Find a symptom category"}
        </button>
        {note ? <p className="form-note" role="status">{note}</p> : null}
      </div>

      <div className="or-divider"><span>or choose from the catalogue</span></div>

      <div className="catalogue-panel">
        <label htmlFor="symptom-catalogue">Search symptom catalogue</label>
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
      <PageIntro eyebrow="Patient confirmation required" title="Which category is closest?" onBack={onBack}>
        Ariad never treats a language match as a diagnosis. Choose a category before any
        source-controlled information is shown.
      </PageIntro>
      <div className="quoted-input">“{input}”</div>
      <div className="match-method">
        {generationMode === "openai" ? <Sparkles aria-hidden="true" size={18} /> : <Search aria-hidden="true" size={18} />}
        <span>
          {generationMode === "openai"
            ? "GPT‑5.6 mapped the wording only to Ariad’s controlled catalogue. It did not diagnose or generate guidance."
            : "Ariad matched the wording using its controlled vocabulary. No model generated guidance."}
        </span>
      </div>
      <div className="candidate-list">
        {result.candidates.length ? result.candidates.map((candidate) => {
          const symptom = symptomById(candidate.symptomId);
          if (!symptom) return null;
          return (
            <button className="candidate-card" type="button" key={candidate.symptomId} onClick={() => onConfirm(candidate.symptomId)}>
              <span><strong>{symptom.patient_label}</strong><small>{symptom.clinical_label}</small></span>
              <span className="confirm-label">This is closest <ChevronRight aria-hidden="true" size={18} /></span>
            </button>
          );
        }) : (
          <div className="empty-result">
            <strong>No safe controlled match was found.</strong>
            <p>Choose from the catalogue or contact your cancer team for help describing the symptom.</p>
          </div>
        )}
      </div>
      <button className="text-button" type="button" onClick={onBack}>
        {result.candidates.length ? "None of these—browse the symptom catalogue" : "Browse the symptom catalogue"}
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
        {question.help_text ?? "Answer only what you can observe."}
      </PageIntro>
      <BoundaryCard />

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
          <small>This answer stays only in this active browser session.</small>
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
          {index + 1 === total ? "View source-controlled guidance" : "Next question"}
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
      <summary><BookOpenText aria-hidden="true" size={18} /> Sources and review status <span>{sources.length}</span></summary>
      <div className="sources-content">
        <p>
          This preview content is unreviewed. No clinician reviewer or approval date has been
          recorded. Source links were accessed on 2026-07-18.
        </p>
        <ul>
          {sources.map((source) => source ? (
            <li key={source.id}>
              <a href={source.canonical_url} target="_blank" rel="noreferrer">
                <strong>{source.title}</strong>
                <span>{source.organization} · {source.jurisdiction}</span>
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
      <PageIntro eyebrow="Source-controlled guidance" title={symptom.patient_label} onBack={onBack}>
        <span className="context-line">{treatmentName(treatmentId)} · {guidance.guidance_basis_label}</span>
        {guidance.fallback_reason ? <span className="fallback-note">{guidance.fallback_reason}</span> : null}
      </PageIntro>
      <BoundaryCard />

      <div className="guidance-sections">
        {guidance.sections.map((section, index) => {
          const Icon = SECTION_ICONS[section.section as keyof typeof SECTION_ICONS] ?? Info;
          const modules = section.module_ids.map(moduleById).filter(Boolean) as EducationalModule[];
          const emphasized = section.emphasized_module_ids.length > 0;
          const hasPendingClinicalDecision = modules.some((item) => item.placeholders.length > 0);
          return (
            <details
              className={`guidance-section section-${section.section}`}
              key={section.section}
              open={index < 3 || emphasized || hasPendingClinicalDecision}
            >
              <summary>
                <span className="section-icon"><Icon aria-hidden="true" size={20} /></span>
                <span><strong>{section.heading}</strong>{emphasized ? <small>Related details shown first</small> : null}</span>
                <ChevronRight className="summary-chevron" aria-hidden="true" size={20} />
              </summary>
              <div className="guidance-body">
                {modules.map((item) => (
                  <article key={item.id}>
                    {item.paragraphs.map((paragraph) => <p key={paragraph}>{paragraph}</p>)}
                    {item.bullets.length ? <ul>{item.bullets.map((bullet) => <li key={bullet}>{bullet}</li>)}</ul> : null}
                    {item.placeholders.length ? (
                      <div className="pending-review"><CircleAlert aria-hidden="true" size={17} /> Clinical-owner decision pending in this prototype.</div>
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
        <div><p className="eyebrow">Communication support</p><h2>Prepare a neutral summary</h2><p>Only the facts you entered are used. Ariad does not add a diagnosis, grade, or recommendation.</p></div>
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
        {synthetic ? "Synthetic demo clinic configuration" : "Institutional clinic configuration"}
      </p>
      <h2 id="clinic-config-title">{config.identity.display_name}</h2>
      {synthetic ? (
        <p className="clinic-mode-note">
          Fictional contact details for demonstration only — do not call or use for care.
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
                  Contact details unavailable pending current verification
                </small>
              )}
              {synthetic || telephoneHref ? (
                route.availability.state === "display_only" ? (
                  <small>Availability: {route.availability.label}</small>
                ) : (
                  <small>Availability not configured</small>
                )
              ) : (
                <small>Availability withheld until contact verification is current</small>
              )}
            </section>
          );
        })}
      </div>
      <p className="clinic-availability-note">
        When contact details are available, availability is shown as configured. Ariad does not
        calculate whether a line is open now.
      </p>
      {showFeverPolicyNotice && feverPolicyPending ? (
        <div className="clinic-policy-notice" role="note">
          <CircleAlert aria-hidden="true" size={17} />
          <span>Local fever instruction pending clinical review in this prototype</span>
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
        A neutral restatement of the observable facts you entered. Review it before sharing.
      </PageIntro>
      <div className="summary-method">
        {loading ? <LoaderCircle className="spin" aria-hidden="true" size={18} /> : mode === "openai" ? <Sparkles aria-hidden="true" size={18} /> : <ShieldCheck aria-hidden="true" size={18} />}
        <span>{loading ? "Creating the bounded summary…" : mode === "openai" ? "GPT‑5.6 restated supplied facts; Ariad validated field provenance." : "Deterministic template fallback—no model was required."}</span>
      </div>
      <article className="summary-sheet" aria-live="polite">
        <PrototypeBanner />
        <h2>{result.title}</h2>
        <ul>{result.summaryItems.map((item, index) => <li key={`${item.sourceFieldIds.join("-")}-${index}`}>{item.text}</li>)}</ul>
        {result.omittedUncertainItems.length ? (
          <div className="summary-omissions">
            <strong>Not included in the summary</strong>
            <p>
              Ariad omitted entries that could not be restated safely: {result.omittedUncertainItems.join(", ")}.
            </p>
          </div>
        ) : null}
        {result.patientQuestions.length ? <><h3>Questions I want to ask</h3><ul>{result.patientQuestions.map((item) => <li key={item}>{item}</li>)}</ul></> : null}
        <p className="summary-boundary">
          This summary records patient-entered facts. {COMPACT_CLINICAL_BOUNDARY}
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
        eyebrow="Education-only coverage"
        title={`${treatmentName(treatmentId)} has a source-linked catalogue entry.`}
        onBack={onTreatment}
      >
        This preview does not yet have a complete preparation guide or a supported
        treatment–symptom pathway for this individual medication.
      </PageIntro>
      <div className="unsupported-card">
        <BookOpenText aria-hidden="true" size={28} />
        <div>
          <SupportPill status="education_only" />
          <h2>Reference information is available; clinical guidance is not.</h2>
          <p>
            Use the source links below and the education from your own cancer team. Ariad
            will not substitute class-level information as though it were exact guidance.
          </p>
        </div>
      </div>
      <BoundaryCard />
      <SourcesPanel sourceIds={sourceIds} />
      <div className="action-row wrap">
        <button className="secondary-button" type="button" onClick={onTreatment}>Search another treatment</button>
        <button className="secondary-button" type="button" onClick={onSymptom}>View symptom catalogue</button>
        <button className="text-button" type="button" onClick={onHome}>Return home</button>
      </div>
    </>
  );
}

function UnsupportedScreen({ reason, onTreatment, onSymptom, onHome }: { reason: string; onTreatment: () => void; onSymptom: () => void; onHome: () => void }) {
  return (
    <>
      <PageIntro eyebrow="Coverage boundary" title="Ariad does not have an exact pathway for this selection.">
        {reason}
      </PageIntro>
      <div className="unsupported-card">
        <CircleAlert aria-hidden="true" size={28} />
        <div>
          <h2>We do not currently have treatment-specific guidance for this medication or regimen.</h2>
          <p>Try another name, a generic or brand name, a regimen abbreviation, or an individual component. When broader class or general information is available, Ariad labels it as a fallback and never presents it as exact guidance.</p>
          <p>If you still cannot find the treatment or symptom, follow the information from your own cancer team or contact them for help locating the right patient information.</p>
        </div>
      </div>
      <BoundaryCard />
      <div className="action-row wrap">
        <button className="secondary-button" type="button" onClick={onTreatment}>Search another treatment</button>
        <button className="secondary-button" type="button" onClick={onSymptom}>View symptom catalogue</button>
        <button className="text-button" type="button" onClick={onHome}>Return home</button>
      </div>
    </>
  );
}

function AboutScreen({ onBack, onReset }: { onBack: () => void; onReset: () => void }) {
  return (
    <>
      <PageIntro eyebrow="About this prototype" title="A trusted thread, with visible boundaries." onBack={onBack}>
        Ariad is a downstream guide. Governed clinical knowledge remains separate from the
        language model and from the patient interface.
      </PageIntro>
      <div className="about-grid">
        <article><ShieldCheck aria-hidden="true" /><h2>Deterministic clinical content</h2><p>Guidance is assembled from an immutable, source-controlled release. This preview contains unapproved drafts and cannot masquerade as a published clinical release.</p></article>
        <article><Sparkles aria-hidden="true" /><h2>Bounded GPT‑5.6</h2><p>GPT‑5.6 may map free text to controlled symptom IDs and restate supplied facts. It cannot generate clinical guidance, diagnose, grade, or recommend action.</p></article>
        <article><Clipboard aria-hidden="true" /><h2>Private by design</h2><p>No account, database, medical-record upload, or server symptom history. Saved treatments stay in versioned local storage; symptom answers remain ephemeral.</p></article>
      </div>
      <section className="intended-use"><h2>Intended use</h2><p>{ARIAD_INTENDED_USE}</p></section>
      <section className="release-card"><p className="eyebrow">Active content artifact</p><code>{activeRelease.release_id}</code><code>{activeRelease.content_hash}</code><span>{activeRelease.objects.length} pinned objects · {activeRelease.channel} channel</span></section>
      <button className="danger-text-button" type="button" onClick={onReset}><RotateCcw aria-hidden="true" size={17} /> Reset demo and clear saved treatments</button>
    </>
  );
}

export function AriadApp() {
  const mainRef = useRef<HTMLElement>(null);
  const [screen, setScreen] = useState<Screen>("home");
  const [previousScreen, setPreviousScreen] = useState<Screen>("home");
  const [mode, setMode] = useState<EntryMode>("symptom");
  const [selectedTreatmentId, setSelectedTreatmentId] = useState<string | null>(null);
  const [selectedSymptomId, setSelectedSymptomId] = useState<string | null>(null);
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

  useEffect(() => {
    document.body.dataset.ariadReady = "true";
    const timer = window.setTimeout(() => {
      setPreferences(readPreferences());
      const code = new URLSearchParams(window.location.search).get("code")?.toUpperCase();
      const treatmentId = code ? DEMO_CODES[code] : undefined;
      if (treatmentId) {
        setMode("prepare");
        setSelectedTreatmentId(treatmentId);
        setScreen("treatment-overview");
      }
    }, 0);
    return () => {
      window.clearTimeout(timer);
      delete document.body.dataset.ariadReady;
    };
  }, []);

  useEffect(() => {
    if (screen !== "home") mainRef.current?.focus();
  }, [screen]);

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
    setInitialSymptomText("");
    setCandidateResult(null);
    setAnswers({});
    setQuestionIndex(0);
    setSummaryResult(null);
    setSummaryLoading(false);
  };

  const goHome = () => {
    resetEphemeral();
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
      setUnsupportedReason("The exact treatment–symptom combination is not fully supported in this preview.");
      setScreen("unsupported");
    }
  };

  const chooseSymptom = (id: string) => {
    setSelectedSymptomId(id);
    if (selectedTreatmentId && resolveGuidanceRelationship(activeRelease, selectedTreatmentId, id)) {
      setAnswers({});
      setQuestionIndex(0);
      setScreen("questions");
    } else {
      setScreen("treatment-context");
    }
  };

  const beginDemo = (scenario: "neuropathy" | "diarrhea" | "infection") => {
    setMode("symptom");
    setAnswers({});
    setQuestionIndex(0);
    if (scenario === "neuropathy") {
      const text = "My fingertips feel buzzy and small things keep slipping from my hand.";
      setSelectedTreatmentId("weekly-paclitaxel");
      setInitialSymptomText(text);
      setScreen("symptom-entry");
    } else if (scenario === "diarrhea") {
      setSelectedTreatmentId("capecitabine-monotherapy");
      setSelectedSymptomId("diarrhea");
      setScreen("questions");
    } else {
      setSelectedTreatmentId("ac");
      setSelectedSymptomId("fever-infection-concern");
      setScreen("questions");
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
        headers: { "content-type": "application/json" },
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
            startPrepare={() => { resetEphemeral(); setMode("prepare"); setScreen("treatment-search"); }}
            startSymptom={() => { resetEphemeral(); setMode("symptom"); setScreen("symptom-entry"); }}
            runDemo={beginDemo}
          />
        ) : null}

        {screen === "treatment-search" || screen === "treatment-context" ? (
          <TreatmentSearchScreen
            mode={screen === "treatment-context" ? "symptom" : mode}
            onSelect={chooseTreatment}
            onUnknown={() => { setUnsupportedReason("Without treatment context, Ariad cannot provide treatment-specific guidance."); setScreen("unsupported"); }}
            onBack={() => setScreen(screen === "treatment-context" ? "symptom-entry" : "home")}
          />
        ) : null}

        {screen === "treatment-overview" && selectedTreatmentId ? (
          <TreatmentOverviewScreen
            treatmentId={selectedTreatmentId}
            saved={preferences.savedTreatmentIds.includes(selectedTreatmentId)}
            onSave={() => setPreferences(saveTreatment(preferences, selectedTreatmentId))}
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
            onMissing={() => { setUnsupportedReason("The symptom could not be mapped safely to the controlled catalogue."); setScreen("unsupported"); }}
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
      <EmergencyBoundary />
      <footer className="site-footer">
        <span>Kesis &amp; Sisters · Turning complexity into clarity.</span>
        <span>Release {activeRelease.release_version} · {activeRelease.content_hash.slice(0, 10)}</span>
      </footer>
    </>
  );
}
