import { CompiledReleaseSchema, type CompiledRelease } from "@ariad/contracts";
import { canonicalJson, sha256 } from "@ariad/knowledge-core/canonical";
import rawRelease from "../generated/release.json";

export interface ReleaseIdentity {
  id: string;
  version: string;
  contentHash: string;
  channel: CompiledRelease["channel"];
}

export function verifyReleaseIntegrity(release: CompiledRelease): void {
  const { content_hash: contentHash, ...hashableRelease } = release;
  const calculatedHash = sha256(canonicalJson(hashableRelease));

  if (calculatedHash !== contentHash) {
    throw new Error("The compiled content release failed its integrity check");
  }

  const configuredReleaseId = process.env.CONTENT_RELEASE_ID?.trim();
  if (configuredReleaseId && configuredReleaseId !== release.release_id) {
    throw new Error("The configured content release does not match the compiled release");
  }
}

export const activeServerRelease: CompiledRelease = CompiledReleaseSchema.parse(rawRelease);
verifyReleaseIntegrity(activeServerRelease);

export function releaseIdentity(release = activeServerRelease): ReleaseIdentity {
  return {
    id: release.release_id,
    version: release.release_version,
    contentHash: release.content_hash,
    channel: release.channel,
  };
}
