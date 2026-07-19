import { describe, expect, it } from "vitest";
import {
  activeRelease,
  clinicContactHref,
  resolveClinicConfig,
} from "./release";

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
