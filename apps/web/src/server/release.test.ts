import { CompiledReleaseSchema } from "@ariad/contracts";
import { describe, expect, it } from "vitest";
import rawRelease from "../generated/release.json";
import { releaseIdentity, verifyReleaseIntegrity } from "./release";

describe("compiled server release", () => {
  it("verifies its canonical hash and exposes an exact identity", () => {
    const release = CompiledReleaseSchema.parse(rawRelease);
    expect(() => verifyReleaseIntegrity(release)).not.toThrow();
    expect(releaseIdentity(release)).toEqual({
      id: release.release_id,
      version: release.release_version,
      contentHash: release.content_hash,
      channel: release.channel,
    });
  });

  it("fails closed if compiled release content is changed after hashing", () => {
    const release = CompiledReleaseSchema.parse(structuredClone(rawRelease));
    release.release_notes = [...release.release_notes, "Unhashed mutation"];
    expect(() => verifyReleaseIntegrity(release)).toThrow(/integrity check/u);
  });
});

