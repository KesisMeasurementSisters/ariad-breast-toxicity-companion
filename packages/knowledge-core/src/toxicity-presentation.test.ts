import path from "node:path";
import type {
  DrugToxicityEvidence,
  DrugToxicityPresentation,
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

    expect(evidence).toHaveLength(27);
    expect(presentations).toHaveLength(27);
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
});
