import { readFile } from "node:fs/promises";
import path from "node:path";
import type { CompiledRelease, EducationalModule } from "@ariad/contracts";
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
      "capecitabine-monotherapy",
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
