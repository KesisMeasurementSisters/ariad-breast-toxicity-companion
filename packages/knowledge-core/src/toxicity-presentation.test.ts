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

    expect(evidence).toHaveLength(25);
    expect(presentations).toHaveLength(25);
    expect(new Set(evidence.map(({ drug_id }) => drug_id))).toEqual(
      new Set(presentations.map(({ drug_id }) => drug_id)),
    );
    expect(evidence.every(({ monotherapy }) => monotherapy)).toBe(true);
    expect(presentations.every(({ status }) => status === "draft")).toBe(true);
    expect(validateRepository(repository).issues).toEqual([]);
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
