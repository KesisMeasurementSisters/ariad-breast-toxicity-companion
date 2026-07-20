import { readFile } from "node:fs/promises";
import path from "node:path";
import type {
  CompiledRelease,
  EducationalModule,
  TreatmentToxicityRelationship,
} from "@ariad/contracts";
import { PREVIEW_ACKNOWLEDGEMENT } from "@ariad/contracts";
import {
  answerPriorityTags,
  assembleGuidance,
  classifySymptomDeterministically,
  searchTreatments,
} from "@ariad/knowledge-core";
import {
  compileRelease,
  findReleaseManifest,
  loadKnowledgeRepository,
  type KnowledgeRepository,
} from "@ariad/knowledge-core/node";
import { beforeAll, describe, expect, it } from "vitest";

interface GoldenFixture {
  releaseId: string;
  channel: "preview";
  contentHash: string;
  treatmentId: string;
  symptomId: string;
  relationshipId: string;
  supportStatus: "full_guidance";
  questionIds: string[];
  sections: Record<string, string[]>;
  sourceIds: string[];
}

const root = process.cwd();
let repository: KnowledgeRepository;
let release: CompiledRelease;

async function fixture(name: string): Promise<GoldenFixture> {
  return JSON.parse(
    await readFile(path.join(root, "tests/golden", `${name}.json`), "utf8"),
  ) as GoldenFixture;
}

beforeAll(async () => {
  repository = await loadKnowledgeRepository(path.join(root, "content"));
  const manifest = findReleaseManifest(repository, "build-week-preview-2026-07-18");
  release = compileRelease(repository, manifest, PREVIEW_ACKNOWLEDGEMENT).release;
});

describe.each([
  "weekly-paclitaxel-neuropathy",
  "capecitabine-diarrhea",
  "ac-fever-infection-concern",
])("gold pathway %s", (name) => {
  it("assembles the exact governed modules, questions, sources, and release", async () => {
    const expected = await fixture(name);
    const guidance = assembleGuidance(release, expected.treatmentId, expected.symptomId);
    expect(guidance).not.toBeNull();
    expect(release.release_id).toBe(expected.releaseId);
    expect(release.channel).toBe(expected.channel);
    expect(release.content_hash).toBe(expected.contentHash);
    expect(guidance?.relationship_id).toBe(expected.relationshipId);
    expect(guidance?.exact_treatment_support).toBe(expected.supportStatus);
    expect(guidance?.guidance_basis).toBe("exact");
    expect(guidance?.question_ids).toEqual(expected.questionIds);
    expect(guidance?.sections.map((section) => section.section)).toEqual([
      "about",
      "treatment_context",
      "home_management",
      "contact_team",
      "urgent_attention",
      "reporting_checklist",
    ]);
    expect(
      Object.fromEntries(
        guidance?.sections.map((section) => [section.section, section.module_ids]) ?? [],
      ),
    ).toEqual(expected.sections);
    expect(guidance?.source_ids).toEqual(expected.sourceIds);
  });
});

describe("release and safety invariants", () => {
  it("produces identical bytes and hashes from identical pinned input", () => {
    const manifest = findReleaseManifest(repository, "build-week-preview-2026-07-18");
    const first = compileRelease(repository, manifest, PREVIEW_ACKNOWLEDGEMENT);
    const second = compileRelease(repository, manifest, PREVIEW_ACKNOWLEDGEMENT);
    expect(first.json).toBe(second.json);
    expect(first.release.content_hash).toBe(second.release.content_hash);
  });

  it("changes the hash when clinical wording changes", () => {
    const copy = structuredClone(repository) as KnowledgeRepository;
    const clinicalModule = copy.objects.find(
      (object): object is EducationalModule =>
        object.kind === "educational_module" && object.id === "neuropathy-about",
    );
    expect(clinicalModule).toBeDefined();
    if (clinicalModule) clinicalModule.paragraphs[0] = `${clinicalModule.paragraphs[0]} `;
    const manifest = findReleaseManifest(copy, "build-week-preview-2026-07-18");
    const changed = compileRelease(copy, manifest, PREVIEW_ACKNOWLEDGEMENT);
    expect(changed.release.content_hash).not.toBe(release.content_hash);
  });

  it("fails closed when preview acknowledgement is absent", () => {
    const manifest = findReleaseManifest(repository, "build-week-preview-2026-07-18");
    expect(() => compileRelease(repository, manifest)).toThrow(
      "preview-acknowledgement-required",
    );
  });

  it("rejects a release that omits a pinned runtime dependency", () => {
    const manifest = structuredClone(
      findReleaseManifest(repository, "build-week-preview-2026-07-18"),
    );
    manifest.included_objects = manifest.included_objects.filter(
      (reference) =>
        !(reference.kind === "educational_module" && reference.id === "neuropathy-about"),
    );
    expect(() => compileRelease(repository, manifest, PREVIEW_ACKNOWLEDGEMENT)).toThrow(
      "release-dependency-not-included",
    );
  });

  it("rejects a relationship wired to the wrong module section", () => {
    const copy = structuredClone(repository) as KnowledgeRepository;
    const educationalModule = copy.objects.find(
      (object): object is EducationalModule =>
        object.kind === "educational_module" && object.id === "neuropathy-about",
    );
    if (!educationalModule) throw new Error("gold module missing");
    educationalModule.section = "urgent_attention";
    const manifest = findReleaseManifest(copy, "build-week-preview-2026-07-18");
    expect(() => compileRelease(copy, manifest, PREVIEW_ACKNOWLEDGEMENT)).toThrow(
      "relationship-module-section-mismatch",
    );
  });

  it("never changes warning membership based on answers", () => {
    const base = assembleGuidance(release, "weekly-paclitaxel", "peripheral-neuropathy");
    const answered = assembleGuidance(release, "weekly-paclitaxel", "peripheral-neuropathy", [
      { questionId: "q-neuropathy-walking-balance", value: "fall" },
    ]);
    expect(answerPriorityTags(release, [
      { questionId: "q-neuropathy-walking-balance", value: "fall" },
    ])).toContain("fall-prevention");
    expect(answered?.sections.map((section) => section.module_ids)).toEqual(
      base?.sections.map((section) => section.module_ids),
    );
  });
});

describe("deterministic recognition", () => {
  it("recognizes generic, brand, abbreviation, and misspelled treatment names", () => {
    expect(searchTreatments(release, "paclitaxel")[0]?.record.id).toBe("paclitaxel");
    expect(searchTreatments(release, "Taxol")[0]?.record.id).toBe("paclitaxel");
    expect(searchTreatments(release, "AC")[0]?.record.id).toBe("ac");
    expect(searchTreatments(release, "TCHP")[0]?.record.id).toBe("tchp");
    expect(searchTreatments(release, "capecitbine")[0]?.record.id).toBe(
      "capecitabine",
    );
    expect(searchTreatments(release, "capecitabine")[0]?.record.id).toBe(
      "capecitabine",
    );
  });

  it("recognizes the locked neuropathy demo phrase without generating guidance", () => {
    const result = classifySymptomDeterministically(
      release,
      "My fingertips feel like pins and needles and I am dropping buttons and coins.",
    );
    expect(result.candidates[0]?.symptomId).toBe("peripheral-neuropathy");
    expect(result.reasonCode).toBe("matched");
  });
});

describe("transparent guidance fallback hierarchy", () => {
  function releaseWithFallback(
    treatmentKind: TreatmentToxicityRelationship["treatment_kind"],
    treatmentId: string,
  ): CompiledRelease {
    const copy = structuredClone(release) as CompiledRelease;
    const exact = copy.objects.find(
      (object): object is TreatmentToxicityRelationship =>
        object.kind === "treatment_toxicity_relationship" &&
        object.id === "weekly-paclitaxel-peripheral-neuropathy",
    );
    if (!exact) throw new Error("gold relationship missing");
    copy.objects = copy.objects.filter((object) => object.id !== exact.id);
    copy.objects.push({
      ...exact,
      id: `fallback-${treatmentId}-peripheral-neuropathy`,
      treatment_kind: treatmentKind,
      treatment_id: treatmentId,
      relationship_type: treatmentKind === "treatment_class" ? "class_general" : "associated_with",
    });
    return copy;
  }

  it("resolves regimen component guidance and labels it as a fallback", () => {
    const componentRelease = releaseWithFallback("drug", "paclitaxel");
    const guidance = assembleGuidance(
      componentRelease,
      "weekly-paclitaxel",
      "peripheral-neuropathy",
    );
    expect(guidance?.guidance_basis).toBe("component");
    expect(guidance?.guidance_basis_label).toBe("Component guidance: paclitaxel");
    expect(guidance?.fallback_reason).toContain("No complete pathway exists for the exact regimen");
  });

  it("walks from a regimen to its nearest treatment class", () => {
    const classRelease = releaseWithFallback("treatment_class", "taxane");
    const guidance = assembleGuidance(
      classRelease,
      "weekly-paclitaxel",
      "peripheral-neuropathy",
    );
    expect(guidance?.guidance_basis).toBe("class");
    expect(guidance?.guidance_basis_label).toContain("Taxane");
    expect(guidance?.fallback_reason).toContain("broader");
  });

  it("returns no guidance when no complete exact or fallback relationship exists", () => {
    expect(assembleGuidance(release, "tchp", "peripheral-neuropathy")).toBeNull();
  });

  it("moves answer-relevant modules first without changing section membership", () => {
    const copy = structuredClone(release) as CompiledRelease;
    const relationship = copy.objects.find(
      (object): object is TreatmentToxicityRelationship =>
        object.kind === "treatment_toxicity_relationship" &&
        object.id === "weekly-paclitaxel-peripheral-neuropathy",
    );
    const homeModule = copy.objects.find(
      (object): object is EducationalModule =>
        object.kind === "educational_module" && object.id === "neuropathy-home-safety",
    );
    if (!relationship?.modules || !homeModule) throw new Error("gold home module missing");
    const relevantModule: EducationalModule = {
      ...structuredClone(homeModule),
      id: "neuropathy-fall-prevention-demo",
      priority_tags: ["fall-prevention"],
    };
    homeModule.priority_tags = [];
    copy.objects.push(relevantModule);
    relationship.modules.home_management = [homeModule.id, relevantModule.id];

    const base = assembleGuidance(copy, "weekly-paclitaxel", "peripheral-neuropathy");
    const answered = assembleGuidance(
      copy,
      "weekly-paclitaxel",
      "peripheral-neuropathy",
      [{ questionId: "q-neuropathy-walking-balance", value: "fall" }],
    );
    const baseHome = base?.sections.find((section) => section.section === "home_management");
    const answeredHome = answered?.sections.find(
      (section) => section.section === "home_management",
    );

    expect(baseHome?.module_ids).toEqual([homeModule.id, relevantModule.id]);
    expect(answeredHome?.module_ids).toEqual([relevantModule.id, homeModule.id]);
    expect(new Set(answeredHome?.module_ids)).toEqual(new Set(baseHome?.module_ids));
  });
});
