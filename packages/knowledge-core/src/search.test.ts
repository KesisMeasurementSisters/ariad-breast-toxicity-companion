import path from "node:path";
import {
  PREVIEW_ACKNOWLEDGEMENT,
  type CompiledRelease,
  type Drug,
} from "@ariad/contracts";
import { beforeAll, describe, expect, it } from "vitest";
import { compileRelease, findReleaseManifest } from "./compile";
import { loadKnowledgeRepository } from "./repository";
import {
  regimenComponentDrugs,
  searchTreatments,
  treatmentSearchDisplayName,
} from "./search";

let release: CompiledRelease;

beforeAll(async () => {
  const repository = await loadKnowledgeRepository(path.resolve(process.cwd(), "content"));
  const manifest = findReleaseManifest(repository, "build-week-preview-2026-07-18");
  release = compileRelease(repository, manifest, PREVIEW_ACKNOWLEDGEMENT).release;
});

describe("treatment search", () => {
  it("waits for two characters and never returns more than three results", () => {
    expect(searchTreatments(release, "")).toEqual([]);
    expect(searchTreatments(release, "a")).toEqual([]);
    expect(searchTreatments(release, "docetaxel")).toHaveLength(3);
  });

  it("returns one canonical drug for its generic or brand name", () => {
    const generic = searchTreatments(release, "capecitabine");
    const brand = searchTreatments(release, "Xeloda");

    expect(generic.map(({ record }) => record.id)).toEqual([
      "capecitabine",
      "capedocetaxel",
      "capetuca-tras",
    ]);
    expect(brand.map(({ record }) => record.id)).toEqual([
      "capecitabine",
      "capedocetaxel",
      "capetuca-tras",
    ]);
    expect(generic.filter(({ record }) => record.kind === "drug")).toHaveLength(1);
    expect(treatmentSearchDisplayName(release, generic[0]?.record.id ?? "")).toBe(
      "Capecitabine (Xeloda)",
    );
  });

  it("searches every governed brand while displaying only the primary brand", () => {
    const secondaryBrand = searchTreatments(release, "Cytoxan");

    expect(secondaryBrand.map(({ record }) => record.id)).toEqual([
      "cyclophosphamide",
      "ac",
      "tc",
    ]);
    expect(treatmentSearchDisplayName(release, "cyclophosphamide")).toBe(
      "Cyclophosphamide (Procytox)",
    );
  });

  it("excludes treatment classes and every single-drug regimen", () => {
    const results = [
      ...searchTreatments(release, "CAPE"),
      ...searchTreatments(release, "weekly Taxol"),
      ...searchTreatments(release, "chemo"),
    ];

    expect(results.some(({ record }) => record.kind === "treatment_class")).toBe(false);
    expect(results.some(({ record }) => record.id === "capecitabine-monotherapy")).toBe(false);
    expect(results.some(({ record }) => record.id === "weekly-paclitaxel")).toBe(false);
  });

  it("does not turn a broad treatment-class word into regimen options", () => {
    expect(searchTreatments(release, "chemotherapy")).toEqual([]);
    expect(searchTreatments(release, "chemo")).toEqual([]);
  });

  it("searches a drug independently of whether it has its own regimen", () => {
    expect(searchTreatments(release, "carboplatin").map(({ record }) => record.id)).toEqual([
      "carboplatin",
      "tch",
      "tchp",
    ]);
    expect(searchTreatments(release, "Veppanu").map(({ record }) => record.id)).toEqual([
      "vepdegestrant",
    ]);
  });

  it("places an exact drug first, followed by regimens containing that drug", () => {
    const results = searchTreatments(release, "Taxotere");

    expect(results.map(({ record }) => record.id)).toEqual([
      "docetaxel",
      "capedocetaxel",
      "tc",
    ]);
    expect(results.map(({ matchType }) => matchType)).toEqual([
      "exact_alias",
      "component",
      "component",
    ]);
  });

  it("keeps an exact regimen first and includes close regimen prefixes", () => {
    const results = searchTreatments(release, "TC");

    expect(results.map(({ record }) => record.id)).toEqual(["tc", "tch", "tchp"]);
    expect(treatmentSearchDisplayName(release, "tc")).toBe(
      "TC: Docetaxel + Cyclophosphamide",
    );
    expect(treatmentSearchDisplayName(release, "tchp")).toBe(
      "TCHP: Docetaxel + Carboplatin + Trastuzumab + Pertuzumab",
    );
  });

  it("treats TCH as complete while keeping TCHP as a close regimen", () => {
    const results = searchTreatments(release, "TCH");

    expect(results.map(({ record }) => record.id)).toEqual(["tch", "tchp"]);
    expect(treatmentSearchDisplayName(release, "tch")).toBe(
      "TCH: Docetaxel + Carboplatin + Trastuzumab",
    );
  });

  it("finds a regimen by its full component name", () => {
    const results = searchTreatments(
      release,
      "docetaxel carboplatin trastuzumab pertuzumab",
    );

    expect(results[0]?.record.id).toBe("tchp");
    expect(results[0]?.matchType).toBe("exact_alias");
    expect(
      searchTreatments(release, "TCH docetaxel carboplatin trastuzumab")[0]?.record.id,
    ).toBe("tch");
  });

  it("ignores case and governed punctuation variants", () => {
    expect(searchTreatments(release, "t-dxd")[0]?.record.id).toBe(
      "trastuzumab-deruxtecan",
    );
    expect(searchTreatments(release, "TDXD")[0]?.record.id).toBe(
      "trastuzumab-deruxtecan",
    );
  });

  it("offers a spelling-close governed drug when no direct match exists", () => {
    const results = searchTreatments(release, "capecitbine");

    expect(results[0]?.record.id).toBe("capecitabine");
    expect(results[0]?.matchType).toBe("fuzzy");
  });

  it("resolves regimen components in governed order", () => {
    expect(regimenComponentDrugs(release, "tch").map((drug) => drug.id)).toEqual([
      "docetaxel",
      "carboplatin",
      "trastuzumab",
    ]);
    expect(regimenComponentDrugs(release, "tchp").map((drug) => drug.id)).toEqual([
      "docetaxel",
      "carboplatin",
      "trastuzumab",
      "pertuzumab",
    ]);
  });

  it("indexes the FDA-labelled breast-cancer foundation as canonical drugs", () => {
    const fdaDrugs = release.objects.filter(
      (object): object is Drug =>
        object.kind === "drug" &&
        object.catalogue_basis === "fda_breast_cancer_treatment",
    );

    expect(fdaDrugs).toHaveLength(52);
    expect(
      fdaDrugs.every(
        (drug) =>
          drug.searchable &&
          drug.regulatory_labels.length > 0 &&
          drug.regulatory_labels.every(
            (label) => drug.source_ids.includes(label.source_id),
          ),
      ),
    ).toBe(true);
    const eventMappedDrugs = fdaDrugs.filter((drug) =>
      drug.regulatory_labels.some(
        (label) => label.evidence_mapping_status === "event_mapped",
      ),
    );
    const presentationDrugIds = release.objects
      .filter((object) => object.kind === "drug_toxicity_presentation")
      .map(({ drug_id }) => drug_id);
    const breastPresentationDrugIds = presentationDrugIds.filter(
      (drugId) => drugId !== "carboplatin",
    );
    const sourceIndexedDrugs = fdaDrugs.filter(
      (drug) => !eventMappedDrugs.includes(drug),
    );

    expect(eventMappedDrugs).toHaveLength(26);
    expect(new Set(eventMappedDrugs.map(({ id }) => id))).toEqual(
      new Set(breastPresentationDrugIds),
    );
    expect(presentationDrugIds).toContain("carboplatin");
    expect(sourceIndexedDrugs).toHaveLength(26);
    expect(
      sourceIndexedDrugs.every((drug) =>
        drug.regulatory_labels.every(
          (label) => label.evidence_mapping_status === "source_indexed",
        ),
      ),
    ).toBe(true);
    expect(searchTreatments(release, "Veppanu")[0]?.record.id).toBe("vepdegestrant");
    expect(
      searchTreatments(release, "Kanjinti").filter(({ record }) => record.kind === "drug"),
    ).toHaveLength(1);
    expect(searchTreatments(release, "Kanjinti")[0]?.record.id).toBe("trastuzumab");
  });
});
