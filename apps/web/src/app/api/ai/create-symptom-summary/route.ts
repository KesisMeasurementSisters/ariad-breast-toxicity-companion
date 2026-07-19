import { SymptomSummaryRequestSchema } from "@ariad/contracts";
import { ZodError } from "zod";
import { createSymptomSummary } from "@/server/ai-service";
import {
  apiJson,
  guardAiPost,
  readBoundedJson,
  releaseHeaderMismatch,
  RequestBodyError,
} from "@/server/http";
import { executeStructuredOutput } from "@/server/openai";
import { activeServerRelease, releaseIdentity } from "@/server/release";

export const runtime = "nodejs";
export const maxDuration = 15;

export async function POST(request: Request) {
  const blocked = guardAiPost(request);
  if (blocked) return blocked;
  const release = releaseIdentity();
  if (releaseHeaderMismatch(request, release)) {
    return apiJson({ error: "release_mismatch", release }, 409);
  }

  try {
    const raw = await readBoundedJson(request, 12_288);
    const parsed = SymptomSummaryRequestSchema.parse(raw);
    const generated = await createSymptomSummary(
      parsed,
      activeServerRelease,
      executeStructuredOutput,
    );
    return apiJson({ ...generated, release });
  } catch (error) {
    if (error instanceof RequestBodyError) {
      return apiJson({ error: error.message }, error.status);
    }
    if (error instanceof ZodError) {
      return apiJson({ error: "invalid_request" }, 400);
    }
    return apiJson({ error: "invalid_pathway_facts" }, 400);
  }
}

