import path from "node:path";
import {
  PREVIEW_ACKNOWLEDGEMENT,
  type CompiledRelease,
  type TreatmentToxicityRelationship,
} from "@ariad/contracts";
import { beforeAll, describe, expect, it } from "vitest";
import { compileRelease, findReleaseManifest } from "./compile";
import { resolveGuidanceRelationship } from "./guidance";
import { loadKnowledgeRepository } from "./repository";
import { drugSymptomListings } from "./toxicity";

let release: CompiledRelease;

beforeAll(async () => {
  const repository = await loadKnowledgeRepository(path.resolve(process.cwd(), "content"));
  const manifest = findReleaseManifest(repository, "build-week-preview-2026-07-18");
  release = compileRelease(repository, manifest, PREVIEW_ACKNOWLEDGEMENT).release;
});

describe("source-linked drug symptom listings", () => {
  it("covers every matching drug page for the three sample symptoms", () => {
    expect(drugSymptomListings(release, "peripheral-neuropathy")).toHaveLength(12);
    expect(drugSymptomListings(release, "diarrhea")).toHaveLength(18);
    expect(drugSymptomListings(release, "fever-infection-concern")).toHaveLength(20);
  });

  it("lists paclitaxel and docetaxel as drugs without tying neuropathy to a schedule", () => {
    const listings = drugSymptomListings(release, "peripheral-neuropathy");
    const drugIds = listings.map(({ drug }) => drug.id);

    expect(drugIds).toEqual(expect.arrayContaining(["docetaxel", "paclitaxel"]));
    expect(drugIds).not.toContain("weekly-paclitaxel");
    expect(listings.find(({ drug }) => drug.id === "docetaxel")?.effects.map(({ id }) => id))
      .toEqual(["numbness-tingling-or-burning"]);
    expect(listings.find(({ drug }) => drug.id === "paclitaxel")?.effects.map(({ id }) => id))
      .toEqual(["peripheral-neuropathy"]);
  });

  it("keeps every listing bound to an exact presentation row and its source", () => {
    const listings = [
      ...drugSymptomListings(release, "peripheral-neuropathy"),
      ...drugSymptomListings(release, "diarrhea"),
      ...drugSymptomListings(release, "fever-infection-concern"),
    ];

    for (const { drug, presentation, effects, relationship } of listings) {
      expect(presentation.drug_id).toBe(drug.id);
      expect(effects).not.toHaveLength(0);
      expect(effects.map(({ id }) => id)).toEqual(relationship.presentation_effect_ids);
      expect(relationship.source_ids).toEqual(expect.arrayContaining(presentation.source_ids));
      expect(relationship).toMatchObject({
        treatment_kind: "drug",
        relationship_type: "associated_with",
        support_status: "education_only",
        modules: null,
      } satisfies Partial<TreatmentToxicityRelationship>);
    }
  });

  it("keeps exact regimen guidance ahead of the new general fallbacks", () => {
    expect(resolveGuidanceRelationship(
      release,
      "weekly-paclitaxel",
      "peripheral-neuropathy",
    )?.basis).toBe("exact");
    expect(resolveGuidanceRelationship(
      release,
      "docetaxel",
      "peripheral-neuropathy",
    )?.basis).toBe("general");
    expect(resolveGuidanceRelationship(
      release,
      "trastuzumab",
      "diarrhea",
    )?.basis).toBe("general");
    expect(resolveGuidanceRelationship(
      release,
      "paclitaxel",
      "fever-infection-concern",
    )?.basis).toBe("general");
  });
});
