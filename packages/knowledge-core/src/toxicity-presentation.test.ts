import path from "node:path";
import type {
  DrugToxicityEvidence,
  DrugToxicityPresentation,
  TreatmentToxicityRelationship,
} from "@ariad/contracts";
import { beforeAll, describe, expect, it } from "vitest";
import { loadKnowledgeRepository, type KnowledgeRepository } from "./repository";
import { validateRepository } from "./validation";

let repository: KnowledgeRepository;

function mutableCopy(): KnowledgeRepository {
  return {
    ...repository,
    objects: structuredClone(repository.objects),
    filesByKey: new Map(repository.filesByKey),
  };
}

beforeAll(async () => {
  repository = await loadKnowledgeRepository(path.resolve(process.cwd(), "content"));
});

describe("single-drug toxicity presentation validation", () => {
  it("contains one hash-bound draft presentation for each eligible single-drug evidence record", () => {
    const evidence = repository.objects.filter(
      (object): object is DrugToxicityEvidence => object.kind === "drug_toxicity_evidence",
    );
    const presentations = repository.objects.filter(
      (object): object is DrugToxicityPresentation =>
        object.kind === "drug_toxicity_presentation",
    );

    expect(evidence).toHaveLength(30);
    expect(presentations).toHaveLength(30);
    expect(new Set(evidence.map(({ drug_id }) => drug_id))).toEqual(
      new Set(presentations.map(({ drug_id }) => drug_id)),
    );
    expect(evidence.filter(({ evidence_scope }) => evidence_scope !== "drug_label")
      .every(({ monotherapy }) => monotherapy)).toBe(true);
    expect(presentations.every(({ status }) => status === "draft")).toBe(true);
    expect(validateRepository(repository).issues).toEqual([]);
  });

  it("keeps carboplatin's cross-indication methodology in private provenance", () => {
    const evidence = repository.objects.find(
      (object): object is DrugToxicityEvidence =>
        object.kind === "drug_toxicity_evidence" &&
        object.id === "carboplatin-single-agent-ovarian-tables-7-8",
    );
    const presentation = repository.objects.find(
      (object): object is DrugToxicityPresentation =>
        object.kind === "drug_toxicity_presentation" &&
        object.id === "carboplatin-patient-side-effects",
    );

    expect(evidence).toMatchObject({
      drug_id: "carboplatin",
      monotherapy: true,
      n_treatment: 553,
      source_id: "fda-label-carboplatin",
    });
    expect(evidence?.events.find(({ id }) => id === "nausea-and-vomiting")?.all_grade_pct)
      .toBe(92);
    expect(evidence?.events.find(({ id }) => id === "decreased-neutrophils")?.all_grade_pct)
      .toBe(67);

    const visibleContext = [
      presentation?.subtitle,
      presentation?.frequency_context,
      presentation?.cause_statement,
      presentation?.source_context,
    ].join(" ");
    expect(visibleContext).not.toMatch(/ovarian|553|table\s*[78]|denominator/iu);
  });

  it("keeps cyclophosphamide's FDA common and serious categories separate from numerical frequency", () => {
    const evidence = repository.objects.find(
      (object): object is DrugToxicityEvidence =>
        object.kind === "drug_toxicity_evidence" &&
        object.id === "cyclophosphamide-fda-label-categorical-safety",
    );
    const presentation = repository.objects.find(
      (object): object is DrugToxicityPresentation =>
        object.kind === "drug_toxicity_presentation" &&
        object.id === "cyclophosphamide-patient-side-effects",
    );

    expect(evidence).toMatchObject({
      drug_id: "cyclophosphamide",
      monotherapy: false,
      evidence_scope: "drug_label",
      n_treatment: null,
      denominator_status: "unavailable",
      source_id: "fda-label-cyclophosphamide",
    });
    expect(evidence?.events.find(({ id }) => id === "neutropenia")).toMatchObject({
      frequency_status: "reported",
      source_frequency_category: "most_common",
      all_grade_pct: null,
    });
    expect(evidence?.events.find(({ id }) => id === "cardiotoxicity")).toMatchObject({
      frequency_status: "not_reported",
      frequency_basis: "warning",
      all_grade_pct: null,
    });
    expect(presentation?.frequency_method_id).toBeNull();
    expect(new Set(presentation?.effects.map(({ presentation_group }) => presentation_group)))
      .toEqual(new Set(["common", "serious"]));
    expect(presentation?.effects.every(({ frequency_band }) => frequency_band === null)).toBe(true);
  });

  it("keeps doxorubicin's AC combination table out of the individual-drug presentation", () => {
    const evidence = repository.objects.find(
      (object): object is DrugToxicityEvidence =>
        object.kind === "drug_toxicity_evidence" &&
        object.id === "doxorubicin-fda-label-categorical-safety",
    );
    const presentation = repository.objects.find(
      (object): object is DrugToxicityPresentation =>
        object.kind === "drug_toxicity_presentation" &&
        object.id === "doxorubicin-patient-side-effects",
    );

    expect(evidence).toMatchObject({
      drug_id: "doxorubicin",
      monotherapy: false,
      evidence_scope: "drug_label",
      n_treatment: null,
      denominator_status: "unavailable",
      source_id: "fda-label-doxorubicin",
    });
    expect(evidence?.events.filter(({ source_frequency_category }) =>
      source_frequency_category === "most_common")).toHaveLength(3);
    expect(evidence?.events.filter(({ frequency_basis }) =>
      frequency_basis === "warning")).toHaveLength(4);
    expect(evidence?.events.every(({ all_grade_pct }) => all_grade_pct === null)).toBe(true);
    expect(presentation?.frequency_method_id).toBeNull();
    expect(presentation?.effects.every(({ frequency_band }) => frequency_band === null)).toBe(true);

    const patientCopy = JSON.stringify(presentation);
    expect(patientCopy).not.toMatch(/\b(?:AC|1492|cyclophosphamide|denominator)\b/u);
  });

  it("keeps epirubicin's FEC and CEF tables out of the individual-drug presentation", () => {
    const evidence = repository.objects.find(
      (object): object is DrugToxicityEvidence =>
        object.kind === "drug_toxicity_evidence" &&
        object.id === "epirubicin-fda-label-categorical-safety",
    );
    const presentation = repository.objects.find(
      (object): object is DrugToxicityPresentation =>
        object.kind === "drug_toxicity_presentation" &&
        object.id === "epirubicin-patient-side-effects",
    );

    expect(evidence).toMatchObject({
      drug_id: "epirubicin",
      monotherapy: false,
      evidence_scope: "drug_label",
      n_treatment: null,
      denominator_status: "unavailable",
      source_id: "fda-label-epirubicin",
    });
    expect(evidence?.events.filter(({ source_frequency_category }) =>
      source_frequency_category === "most_common")).toHaveLength(14);
    expect(evidence?.events.filter(({ frequency_basis }) =>
      frequency_basis === "warning")).toHaveLength(4);
    expect(evidence?.events.every(({ all_grade_pct }) => all_grade_pct === null)).toBe(true);
    expect(presentation?.frequency_method_id).toBeNull();
    expect(presentation?.effects.every(({ frequency_band }) => frequency_band === null)).toBe(true);

    const patientCopy = JSON.stringify(presentation);
    expect(patientCopy).not.toMatch(/\b(?:FEC|CEF|1260|cyclophosphamide|fluorouracil|denominator)\b/u);
  });

  it("uses pembrolizumab's cross-cancer single-agent label categories without KEYNOTE-522 rates", () => {
    const evidence = repository.objects.find(
      (object): object is DrugToxicityEvidence =>
        object.kind === "drug_toxicity_evidence" &&
        object.id === "pembrolizumab-fda-single-agent-label-safety",
    );
    const presentation = repository.objects.find(
      (object): object is DrugToxicityPresentation =>
        object.kind === "drug_toxicity_presentation" &&
        object.id === "pembrolizumab-patient-side-effects",
    );

    expect(evidence).toMatchObject({
      drug_id: "pembrolizumab",
      monotherapy: true,
      evidence_scope: "drug_label",
      n_treatment: null,
      denominator_status: "unavailable",
      source_id: "fda-label-pembrolizumab",
    });
    expect(evidence?.events.filter(({ source_frequency_category }) =>
      source_frequency_category === "most_common")).toHaveLength(14);
    expect(evidence?.events.filter(({ frequency_basis }) =>
      frequency_basis === "warning")).toHaveLength(11);
    expect(Object.fromEntries(
      evidence?.events
        .filter(({ all_grade_pct }) => all_grade_pct !== null)
        .map(({ id, all_grade_pct }) => [id, all_grade_pct]) ?? [],
    )).toEqual({
      "immune-mediated-colitis": 1.7,
      "immune-mediated-dermatologic-reactions": 1.4,
      "immune-mediated-hepatitis": 0.7,
      "immune-mediated-nephritis": 0.3,
      "immune-mediated-pneumonitis": 3.4,
      "infusion-related-reactions": 0.2,
    });
    expect(presentation?.frequency_method_id).toBeNull();
    expect(presentation?.effects.every(({ frequency_band }) => frequency_band === null)).toBe(true);

    const patientCopy = JSON.stringify(presentation);
    expect(patientCopy).not.toMatch(
      /\b(?:KEYNOTE|522|778|2799|chemotherapy|carboplatin|paclitaxel|doxorubicin|epirubicin|cyclophosphamide|melanoma|NSCLC|denominator|Grade)\b/u,
    );
  });

  it("detects a private evidence change even when the qualitative band would stay the same", () => {
    const copy = mutableCopy();
    const evidence = copy.objects.find(
      (object): object is DrugToxicityEvidence =>
        object.kind === "drug_toxicity_evidence" &&
        object.id === "docetaxel-100mg-breast-table-3",
    );
    expect(evidence).toBeDefined();
    const hairLoss = evidence?.events.find((event) => event.id === "alopecia");
    expect(hairLoss).toBeDefined();
    if (hairLoss) hairLoss.all_grade_pct = 73;

    const report = validateRepository(copy);
    expect(report.issues).toEqual(
      expect.arrayContaining([
        expect.objectContaining({
          code: "toxicity-presentation-evidence-hash-mismatch",
          objectId: "docetaxel-patient-side-effects",
        }),
      ]),
    );
  });

  it("rejects a qualitative group that does not match its all-grade evidence value", () => {
    const copy = mutableCopy();
    const presentation = copy.objects.find(
      (object): object is DrugToxicityPresentation =>
        object.kind === "drug_toxicity_presentation" &&
        object.id === "docetaxel-patient-side-effects",
    );
    expect(presentation).toBeDefined();
    const hairLoss = presentation?.effects.find((effect) => effect.id === "hair-loss");
    expect(hairLoss).toBeDefined();
    if (hairLoss) hairLoss.frequency_band = "some_people";

    const report = validateRepository(copy);
    expect(report.issues).toEqual(
      expect.arrayContaining([
        expect.objectContaining({
          code: "toxicity-presentation-frequency-band-invalid",
          objectId: "docetaxel-patient-side-effects",
        }),
      ]),
    );
  });

  it("rejects a symptom listing that points to a missing presentation effect", () => {
    const copy = mutableCopy();
    const relationship = copy.objects.find(
      (object): object is TreatmentToxicityRelationship =>
        object.kind === "treatment_toxicity_relationship" &&
        object.id === "drug-listing-docetaxel-peripheral-neuropathy",
    );
    expect(relationship).toBeDefined();
    if (relationship) relationship.presentation_effect_ids = ["not-on-the-drug-page"];

    const report = validateRepository(copy);
    expect(report.issues).toEqual(
      expect.arrayContaining([
        expect.objectContaining({
          code: "relationship-toxicity-effect-missing",
          objectId: "drug-listing-docetaxel-peripheral-neuropathy",
        }),
      ]),
    );
  });
});
