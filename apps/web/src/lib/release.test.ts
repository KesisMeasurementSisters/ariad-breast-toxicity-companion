import { readFileSync } from "node:fs";
import { ARIAD_INTENDED_USE } from "@ariad/contracts";
import { describe, expect, it } from "vitest";
import {
  activeRelease,
  clinicContactHref,
  drugToxicityPresentationForDrug,
  releaseRequestHeaders,
  resolveClinicConfig,
  sourceById,
} from "./release";

describe("release-bound requests", () => {
  it("sends the exact client release identity with JSON API requests", () => {
    expect(releaseRequestHeaders()).toEqual({
      "content-type": "application/json",
      "x-ariad-release-id": activeRelease.release_id,
      "x-ariad-content-hash": activeRelease.content_hash,
    });
  });
});

describe("patient-safe drug toxicity release", () => {
  it("ships every supported single-drug presentation without private numerical evidence", () => {
    const supportedDrugIds = [
      "abemaciclib",
      "ado-trastuzumab-emtansine",
      "anastrozole",
      "capecitabine",
      "carboplatin",
      "cyclophosphamide",
      "datopotamab-deruxtecan",
      "docetaxel",
      "doxorubicin",
      "elacestrant",
      "epirubicin",
      "eribulin",
      "exemestane",
      "fulvestrant",
      "goserelin",
      "imlunestrant",
      "ixabepilone",
      "letrozole",
      "neratinib",
      "olaparib",
      "paclitaxel",
      "paclitaxel-protein-bound",
      "pembrolizumab",
      "sacituzumab-govitecan",
      "talazoparib",
      "tamoxifen",
      "toremifene",
      "trastuzumab",
      "trastuzumab-deruxtecan",
      "vepdegestrant",
    ];
    const presentations = activeRelease.objects.filter(
      (object) => object.kind === "drug_toxicity_presentation",
    );

    expect(presentations).toHaveLength(30);
    expect(presentations.map(({ drug_id }) => drug_id).sort()).toEqual(supportedDrugIds);
    for (const drugId of supportedDrugIds) {
      expect(drugToxicityPresentationForDrug(drugId)).toBeDefined();
    }
    expect(drugToxicityPresentationForDrug("alpelisib")).toBeUndefined();
    expect(
      activeRelease.objects.some((object) => object.kind === "drug_toxicity_evidence"),
    ).toBe(false);

    const patientPayload = JSON.stringify(presentations);
    for (const privateField of [
      "all_grade_pct",
      "all_grade_pct_qualifier",
      "severe_pct",
      "fatal_pct",
      "dose_mg_per_m2",
      "dose_description",
      "grading_system",
      "severe_source_label",
      "severity_values",
      "n_treatment",
      "n_comparator",
      "frequency_status",
      "source_frequency_category",
    ]) {
      expect(patientPayload).not.toContain(`"${privateField}":`);
    }
  });

  it("keeps conventional and protein-bound paclitaxel as separate source-bound pages", () => {
    const conventional = drugToxicityPresentationForDrug("paclitaxel");
    const proteinBound = drugToxicityPresentationForDrug("paclitaxel-protein-bound");

    expect(conventional?.drug_id).toBe("paclitaxel");
    expect(proteinBound?.drug_id).toBe("paclitaxel-protein-bound");
    expect(sourceById(conventional?.source_ids[0] ?? "")?.canonical_url).toContain(
      "setid=ea28753a-8631-460a-bfdc-b101eb8ac84a",
    );
    expect(sourceById(proteinBound?.source_ids[0] ?? "")?.canonical_url).toContain(
      "setid=24d10449-2936-4cd3-b7db-a7683db721e4",
    );
  });
});

describe("Canadian patient language", () => {
  it("keeps authored patient copy in Canadian spelling", () => {
    const patientCopy: string[] = [ARIAD_INTENDED_USE];

    for (const object of activeRelease.objects) {
      if (object.kind === "educational_module" && object.audience === "patient") {
        patientCopy.push(object.title, ...object.paragraphs, ...object.bullets);
      }
      if (object.kind === "drug_toxicity_presentation") {
        patientCopy.push(
          object.route_label,
          object.subtitle,
          object.frequency_context,
          object.cause_statement,
          object.source_context,
          object.escalation_summary.heading,
          object.escalation_summary.introduction,
          ...object.escalation_summary.contact_team,
          ...object.escalation_summary.urgent_help,
        );
        for (const effect of object.effects) {
          patientCopy.push(
            effect.display_name,
            effect.meaning,
            ...effect.what_you_may_notice,
            ...effect.safe_actions,
            ...effect.contact_team,
            ...effect.urgent_help,
            ...effect.reassuring_monitoring,
          );
        }
      }
      if (object.kind === "question") {
        patientCopy.push(
          object.prompt,
          object.help_text ?? "",
          object.summary_label,
          ...object.options.flatMap((option) => [option.label, option.summary_text]),
        );
      }
      if (object.kind === "symptom") {
        patientCopy.push(object.patient_label);
      }
      if (object.kind === "drug") {
        patientCopy.push(object.generic_name, ...object.brand_names);
      }
      if (object.kind === "regimen") {
        patientCopy.push(object.display_name);
      }
      if (object.kind === "clinic_config" && "mode" in object) {
        patientCopy.push(
          object.identity.display_name,
          ...object.contact_routes.flatMap((route) => [
            route.label,
            route.availability.state === "display_only" ? route.availability.label : "",
          ]),
        );
      }
    }

    const combinedPatientCopy = patientCopy.filter(Boolean).join("\n");
    const interfaceSource = readFileSync(
      new URL("../features/ariad/AriadApp.tsx", import.meta.url),
      "utf8",
    );
    const usSpellings =
      /\b(?:behavior|behaviors|center|centers|color|colors|counseling|labeled|labeling|tumor|tumors)\b/iu;

    expect(combinedPatientCopy).not.toMatch(usSpellings);
    expect(interfaceSource).not.toMatch(usSpellings);
  });
});

describe("active clinic configuration resolution", () => {
  it("resolves the exact kind, id, and version pinned by the compiled release", () => {
    const resolved = resolveClinicConfig(activeRelease);
    expect({ kind: resolved.kind, id: resolved.id, version: resolved.version }).toEqual(
      activeRelease.clinic_config,
    );
  });

  it("does not select an earlier object with the same clinic id and another version", () => {
    const exact = resolveClinicConfig(activeRelease);
    const historicalVersion = { ...structuredClone(exact), version: "2.99.99" };
    const releaseWithHistoricalFirst = {
      ...activeRelease,
      objects: [historicalVersion, ...activeRelease.objects],
    };

    expect(resolveClinicConfig(releaseWithHistoricalFirst).version).toBe(
      activeRelease.clinic_config.version,
    );
  });

  it("fails closed when the exact pinned object is absent or duplicated", () => {
    const exact = resolveClinicConfig(activeRelease);
    const withoutExact = {
      ...activeRelease,
      objects: activeRelease.objects.filter(
        (object) =>
          !(
            object.kind === activeRelease.clinic_config.kind &&
            object.id === activeRelease.clinic_config.id &&
            object.version === activeRelease.clinic_config.version
          ),
      ),
    };
    const withDuplicate = {
      ...activeRelease,
      objects: [structuredClone(exact), ...activeRelease.objects],
    };

    expect(() => resolveClinicConfig(withoutExact)).toThrow(/resolve exactly once/u);
    expect(() => resolveClinicConfig(withDuplicate)).toThrow(/resolve exactly once/u);
  });
});

describe("clinic contact actions", () => {
  it("never makes a synthetic demonstration number actionable", () => {
    const config = resolveClinicConfig(activeRelease);
    const route = config.contact_routes[0];
    expect(route).toBeDefined();
    expect(clinicContactHref(config, route!, activeRelease.generated_at)).toBeNull();
  });

  it("uses the normalized value only for a currently verified institutional phone", () => {
    const synthetic = resolveClinicConfig(activeRelease);
    const sourceRoute = synthetic.contact_routes[0];
    expect(sourceRoute).toBeDefined();
    const institutional = { ...synthetic, mode: "institutional" as const };
    const verifiedRoute = {
      ...sourceRoute!,
      verification: {
        status: "verified" as const,
        method: "Official institutional directory",
        verified_by: "Demo verifier",
        verified_at: "2026-07-18T12:00:00-04:00",
        review_due: "2026-08-18",
      },
    };

    expect(
      clinicContactHref(institutional, verifiedRoute, "2026-07-19T00:00:00-04:00"),
    ).toBe(`tel:${verifiedRoute.normalized_value}`);
    expect(
      clinicContactHref(institutional, verifiedRoute, "2026-08-19T03:59:59.000Z"),
    ).toBe(`tel:${verifiedRoute.normalized_value}`);
    expect(
      clinicContactHref(institutional, verifiedRoute, "2026-08-19T04:00:00.000Z"),
    ).toBeNull();
  });

  it("fails closed before verification evidence exists or for an invalid clock value", () => {
    const synthetic = resolveClinicConfig(activeRelease);
    const sourceRoute = synthetic.contact_routes[0];
    expect(sourceRoute).toBeDefined();
    const institutional = { ...synthetic, mode: "institutional" as const };
    const verifiedRoute = {
      ...sourceRoute!,
      verification: {
        status: "verified" as const,
        method: "Official institutional directory",
        verified_by: "Demo verifier",
        verified_at: "2026-07-20T12:00:00-04:00",
        review_due: "2026-08-20",
      },
    };

    expect(
      clinicContactHref(institutional, verifiedRoute, "2026-07-19T12:00:00-04:00"),
    ).toBeNull();
    expect(clinicContactHref(institutional, verifiedRoute, "not-a-time")).toBeNull();
  });
});
