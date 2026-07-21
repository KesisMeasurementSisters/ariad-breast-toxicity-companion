import path from "node:path";
import {
  PREVIEW_ACKNOWLEDGEMENT,
  type CompiledRelease,
} from "@ariad/contracts";
import { beforeAll, describe, expect, it } from "vitest";
import { compileRelease, findReleaseManifest } from "./compile";
import {
  assembleGuidance,
  resolveGuidanceRelationship,
} from "./guidance";
import { loadKnowledgeRepository } from "./repository";

const GENERAL_SYMPTOM_IDS = [
  "fatigue",
  "nausea",
  "vomiting",
  "constipation",
  "appetite-taste-changes",
  "mouth-soreness",
  "rash-itching",
  "hand-foot-symptoms",
  "joint-muscle-symptoms",
  "headache",
  "dizziness",
  "hot-flashes",
  "vaginal-genitourinary-symptoms",
  "sleep-concerns",
  "mood-cognitive-concerns",
  "pain",
  "shortness-of-breath-cough",
  "chest-symptoms",
  "edema-swelling",
  "palpitations",
  "bleeding-bruising",
  "blood-clot-warning-symptoms",
  "eye-vision-symptoms",
  "nail-hair-changes",
  "infusion-allergic-symptoms",
] as const;

let release: CompiledRelease;

beforeAll(async () => {
  const repository = await loadKnowledgeRepository(path.resolve(process.cwd(), "content"));
  const manifest = findReleaseManifest(repository, "build-week-preview-2026-07-18");
  release = compileRelease(repository, manifest, PREVIEW_ACKNOWLEDGEMENT).release;
});

describe("general symptom journeys", () => {
  it("keeps the existing exact pathways ahead of general safety fallbacks", () => {
    const exact = resolveGuidanceRelationship(
      release,
      "weekly-paclitaxel",
      "peripheral-neuropathy",
    );

    expect(exact?.basis).toBe("exact");
    expect(exact?.relationship.id).toBe("weekly-paclitaxel-peripheral-neuropathy");
  });

  it("labels general safety content as general even for the systemic-therapy class", () => {
    for (const treatmentId of ["docetaxel", "tchp", "systemic-therapy"]) {
      const resolution = resolveGuidanceRelationship(release, treatmentId, "fatigue");

      expect(resolution?.basis).toBe("general");
      expect(resolution?.basisLabel).toBe("General symptom information");
      expect(resolution?.fallbackReason).toBe(
        "Ariad does not have a full guide for this treatment and symptom together.",
      );
    }
  });

  it("assembles all 25 new journeys with four questions and six fixed sections", () => {
    for (const symptomId of GENERAL_SYMPTOM_IDS) {
      const guidance = assembleGuidance(release, "docetaxel", symptomId);

      expect(guidance?.guidance_basis, symptomId).toBe("general");
      expect(guidance?.question_ids, symptomId).toHaveLength(4);
      expect(guidance?.sections, symptomId).toHaveLength(6);
      expect(
        guidance?.sections.every((section) => section.module_ids.length > 0),
        symptomId,
      ).toBe(true);
    }
  });

  it("opens fixed contact and urgent modules when an answer shares their authored tag", () => {
    const guidance = assembleGuidance(release, "docetaxel", "chest-symptoms", [
      { questionId: "q-chest-symptoms-details", value: ["pressure"] },
    ]);

    expect(
      guidance?.sections.find((section) => section.section === "contact_team")
        ?.emphasized_module_ids,
    ).toEqual(["chest-symptoms-contact-team"]);
    expect(
      guidance?.sections.find((section) => section.section === "urgent_attention")
        ?.emphasized_module_ids,
    ).toEqual(["chest-symptoms-urgent-attention"]);
  });
});
