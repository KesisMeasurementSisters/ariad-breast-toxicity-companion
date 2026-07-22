import path from "node:path";
import {
  EducationalModuleSchema,
  PREVIEW_ACKNOWLEDGEMENT,
  type CompiledRelease,
  type Drug,
  type EducationalModule,
  type Regimen,
} from "@ariad/contracts";
import { beforeAll, describe, expect, it } from "vitest";
import { compileRelease, findReleaseManifest } from "./compile";
import {
  groupPreparationModulesForDisplay,
  PREPARATION_DISPLAY_COPY,
  resolvePreparation,
} from "./guidance";
import { loadKnowledgeRepository } from "./repository";

const moduleFixture = {
  kind: "educational_module",
  id: "preparation-contract-fixture",
  version: "1.0.0",
  status: "draft",
  review: {
    reviewer: null,
    reviewed_at: null,
    review_due: null,
    approval_id: null,
  },
  supersedes: null,
  superseded_by: null,
  audience: "patient",
  jurisdiction: "Canada",
  section: "preparation",
  preparation_order: 1,
  title: "Preparation fixture",
  paragraphs: ["Fixture text."],
  bullets: [],
  applicability: { treatment_ids: ["systemic-therapy"], symptom_ids: [] },
  priority_tags: [],
  source_ids: ["fixture-source"],
  claim_ids: ["fixture-claim"],
  placeholders: [],
  review_due: null,
} as const;

let release: CompiledRelease;

function estimatedSyllables(word: string): number {
  const letters = word.toLocaleLowerCase("en-CA").replace(/[^a-z]/gu, "");
  if (!letters) return 0;
  if (letters.length <= 3) return 1;
  const vowelGroups = letters.match(/[aeiouy]+/gu)?.length ?? 0;
  const silentE = letters.endsWith("e") && !letters.endsWith("le") ? 1 : 0;
  return Math.max(1, vowelGroups - silentE);
}

function estimatedGradeFromSentences(sentenceUnits: string[]): number {
  const words = sentenceUnits
    .join(" ")
    .match(/[A-Za-z]+(?:[’'-][A-Za-z]+)*/gu) ?? [];
  const sentenceCount = Math.max(1, sentenceUnits.length);
  const syllableCount = words.reduce(
    (total, word) => total + estimatedSyllables(word),
    0,
  );
  return 0.39 * (words.length / sentenceCount) +
    11.8 * (syllableCount / words.length) -
    15.59;
}

function estimatedFleschKincaidGrade(modules: EducationalModule[]): number {
  return estimatedGradeFromSentences(
    modules.flatMap((preparationModule) => [
      preparationModule.title,
      ...preparationModule.paragraphs,
      ...preparationModule.bullets,
    ]),
  );
}

beforeAll(async () => {
  const repository = await loadKnowledgeRepository(path.resolve(process.cwd(), "content"));
  const manifest = findReleaseManifest(repository, "build-week-preview-2026-07-18");
  release = compileRelease(repository, manifest, PREVIEW_ACKNOWLEDGEMENT).release;
});

describe("preparation module contract", () => {
  it("requires a positive order for preparation modules", () => {
    expect(EducationalModuleSchema.safeParse(moduleFixture).success).toBe(true);
    expect(
      EducationalModuleSchema.safeParse({
        ...moduleFixture,
        preparation_order: undefined,
      }).success,
    ).toBe(false);
    expect(
      EducationalModuleSchema.safeParse({
        ...moduleFixture,
        preparation_order: 0,
      }).success,
    ).toBe(false);
  });

  it("forbids preparation order on every other module section", () => {
    expect(
      EducationalModuleSchema.safeParse({
        ...moduleFixture,
        section: "about",
      }).success,
    ).toBe(false);
  });
});

describe("preparation resolution", () => {
  it("resolves preparation once for all 53 drugs and 8 regimens", () => {
    const treatments = release.objects.filter(
      (object): object is Drug | Regimen =>
        object.kind === "drug" || object.kind === "regimen",
    );
    expect(treatments.filter((treatment) => treatment.kind === "drug")).toHaveLength(53);
    expect(treatments.filter((treatment) => treatment.kind === "regimen")).toHaveLength(8);

    for (const treatment of treatments) {
      const resolution = resolvePreparation(release, treatment.id);
      expect(["exact", "general"], treatment.id).toContain(resolution.basis);
      expect(resolution.modules.length, treatment.id).toBeGreaterThan(0);
      expect(
        resolution.modules.every((module) => module.section === "preparation"),
        treatment.id,
      ).toBe(true);
    }
  });

  it("keeps exact preparation ahead of the general fallback for the three demo plans", () => {
    for (const treatmentId of ["weekly-paclitaxel", "ac", "capecitabine-monotherapy"]) {
      const resolution = resolvePreparation(release, treatmentId);
      expect(resolution.basis, treatmentId).toBe("exact");
      expect(
        resolution.modules.every((module) =>
          module.applicability.treatment_ids.includes(treatmentId),
        ),
        treatmentId,
      ).toBe(true);
    }
  });

  it("organizes each active guide into three patient questions and one safety boundary", () => {
    const representativeTreatmentIds = [
      "alpelisib",
      "weekly-paclitaxel",
      "capecitabine-monotherapy",
      "ac",
    ];

    for (const treatmentId of representativeTreatmentIds) {
      const resolution = resolvePreparation(release, treatmentId);
      const groups = groupPreparationModulesForDisplay(resolution.modules);
      const displayedIds = [
        ...groups.treatment,
        ...groups.beforeTreatment,
        ...groups.haveReady,
        ...groups.safetyBoundary,
      ].map((preparationModule) => preparationModule.id);

      expect(groups.treatment, treatmentId).toHaveLength(1);
      expect(groups.beforeTreatment, treatmentId).toHaveLength(1);
      expect(groups.haveReady.length, treatmentId).toBeGreaterThan(0);
      expect(groups.safetyBoundary, treatmentId).toHaveLength(1);
      expect(
        groups.safetyBoundary[0]?.claim_ids,
        treatmentId,
      ).toContain("claim-universal-emergency-boundary");
      expect(displayedIds, treatmentId).toEqual(
        resolution.modules.map((preparationModule) => preparationModule.id),
      );
    }
  });

  it("returns modules in deterministic authored order without losing sources", () => {
    const treatmentIds = release.objects
      .filter(
        (object): object is Drug | Regimen =>
          object.kind === "drug" || object.kind === "regimen",
      )
      .map((treatment) => treatment.id);

    for (const treatmentId of treatmentIds) {
      const first = resolvePreparation(release, treatmentId);
      const second = resolvePreparation(release, treatmentId);
      const orders = first.modules.map((module) => module.preparation_order);
      const expectedSources = [
        ...new Set(first.modules.flatMap((module) => module.source_ids)),
      ].sort();

      expect(first.modules.map((module) => module.id), treatmentId).toEqual(
        second.modules.map((module) => module.id),
      );
      expect(orders, treatmentId).toEqual(
        [...orders].sort((left, right) => (left ?? 0) - (right ?? 0)),
      );
      expect(new Set(orders).size, treatmentId).toBe(orders.length);
      expect(first.sourceIds, treatmentId).toEqual(expectedSources);
    }
  });

  it("keeps every active preparation guide at or below an estimated grade 8 level", () => {
    const representativeTreatmentIds = [
      "alpelisib",
      "weekly-paclitaxel",
      "capecitabine-monotherapy",
      "ac",
    ];

    for (const treatmentId of representativeTreatmentIds) {
      const resolution = resolvePreparation(release, treatmentId);
      const grade = estimatedFleschKincaidGrade(resolution.modules);
      expect(grade, `${treatmentId}: estimated grade ${grade.toFixed(2)}`).toBeLessThanOrEqual(8);
    }
  });

  it("keeps preparation navigation plain and below an estimated grade 8 level", () => {
    const generalFallback = resolvePreparation(release, "alpelisib").fallbackReason ?? "";
    const interfaceCopy = [
      PREPARATION_DISPLAY_COPY.heading,
      PREPARATION_DISPLAY_COPY.exactIntroduction,
      PREPARATION_DISPLAY_COPY.unavailableIntroduction,
      generalFallback,
      ...PREPARATION_DISPLAY_COPY.steps.flatMap((step) => [step.label, step.title]),
    ];
    const grade = estimatedGradeFromSentences(interfaceCopy);

    expect(grade, `estimated grade ${grade.toFixed(2)}`).toBeLessThanOrEqual(8);
    expect(interfaceCopy.join(" ")).not.toMatch(
      /\b(?:administered|intravenously|pre-treatment|protocol|supportive care|systemic therapy)\b/iu,
    );
  });

  it("does not infer regimen preparation from a component drug", () => {
    const copy = structuredClone(release);
    const regimen = copy.objects.find(
      (object): object is Regimen => object.kind === "regimen" && object.id === "tch",
    );
    const general = copy.objects.find(
      (object): object is EducationalModule =>
        object.kind === "educational_module" &&
        object.section === "preparation" &&
        object.applicability.treatment_ids.includes("systemic-therapy"),
    );
    expect(regimen).toBeDefined();
    expect(general).toBeDefined();
    if (!regimen || !general) return;

    for (const object of copy.objects) {
      if (object.kind !== "educational_module" || object.section !== "preparation") continue;
      object.applicability.treatment_ids = object.applicability.treatment_ids.filter(
        (id) => id !== regimen.id,
      );
    }
    copy.objects.push({
      ...general,
      id: "component-only-preparation-fixture",
      preparation_order: 999,
      applicability: {
        ...general.applicability,
        treatment_ids: [regimen.component_drug_ids[0]!],
      },
    });

    const resolution = resolvePreparation(copy, regimen.id);
    expect(resolution.basis).toBe("general");
    expect(resolution.modules.map((module) => module.id)).not.toContain(
      "component-only-preparation-fixture",
    );
  });

  it("fails closed when a resolved set repeats an authored order", () => {
    const copy = structuredClone(release);
    const drug = copy.objects.find((object): object is Drug => object.kind === "drug");
    const general = copy.objects.find(
      (object): object is EducationalModule =>
        object.kind === "educational_module" &&
        object.section === "preparation" &&
        object.applicability.treatment_ids.includes("systemic-therapy"),
    );
    expect(drug).toBeDefined();
    expect(general).toBeDefined();
    if (!drug || !general) return;

    for (const object of copy.objects) {
      if (object.kind !== "educational_module" || object.section !== "preparation") continue;
      object.applicability.treatment_ids = object.applicability.treatment_ids.filter(
        (id) => id !== drug.id,
      );
    }
    copy.objects.push({
      ...general,
      id: "duplicate-general-preparation-fixture",
    });

    expect(() => resolvePreparation(copy, drug.id)).toThrow(
      /Duplicate general preparation_order/u,
    );
  });

  it("returns unavailable for an unknown treatment id", () => {
    expect(resolvePreparation(release, "not-a-treatment")).toEqual({
      basis: "unavailable",
      basisLabel: "Preparation information unavailable",
      fallbackReason: "Ariad could not find this treatment.",
      modules: [],
      sourceIds: [],
    });
  });
});
