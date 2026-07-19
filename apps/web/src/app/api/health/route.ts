import { apiJson } from "@/server/http";
import { openAiRuntimeStatus } from "@/server/openai";
import { activeServerRelease, releaseIdentity } from "@/server/release";

export function GET() {
  const ai = openAiRuntimeStatus();
  return apiJson({
    status: "ok",
    service: "ariad-breast",
    release: releaseIdentity(),
    clinicalUse: activeServerRelease.clinical_use,
    containsUnapprovedContent: activeServerRelease.contains_unapproved_content,
    ai: { enabled: ai.enabled, model: ai.model, reason: ai.reason },
  });
}
