import path from "node:path";
import {
  PREVIEW_ACKNOWLEDGEMENT,
  type CompiledRelease,
} from "@ariad/contracts";
import { beforeAll, describe, expect, it } from "vitest";
import { compileRelease, findReleaseManifest } from "./compile";
import { loadKnowledgeRepository } from "./repository";
import { regimenDrugToxicityItems } from "./toxicity";

let release: CompiledRelease;

beforeAll(async () => {
  const repository = await loadKnowledgeRepository(path.resolve(process.cwd(), "content"));
  const manifest = findReleaseManifest(repository, "build-week-preview-2026-07-18");
  release = compileRelease(repository, manifest, PREVIEW_ACKNOWLEDGEMENT).release;
});

describe("regimen single-drug toxicity composition", () => {
  it("preserves TCH component order and attaches each independent presentation", () => {
    const items = regimenDrugToxicityItems(release, "tch");

    expect(items.map(({ drug }) => drug.id)).toEqual([
      "docetaxel",
      "carboplatin",
      "trastuzumab",
    ]);
    expect(items.map(({ presentation }) => presentation?.drug_id ?? null)).toEqual([
      "docetaxel",
      "carboplatin",
      "trastuzumab",
    ]);
  });

  it("never substitutes one component presentation for another", () => {
    const items = regimenDrugToxicityItems(release, "tchp");

    expect(items).toHaveLength(4);
    expect(
      items.every(
        ({ drug, presentation }) =>
          presentation === null ||
          (presentation.drug_id === drug.id && presentation.monotherapy),
      ),
    ).toBe(true);
    expect(items.find(({ drug }) => drug.id === "pertuzumab")?.presentation).toBeNull();
  });
});
