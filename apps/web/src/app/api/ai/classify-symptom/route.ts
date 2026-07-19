import { SymptomClassifierRequestSchema } from "@ariad/contracts";
import { ZodError } from "zod";
import { classifySymptom } from "@/server/ai-service";
import {
  apiJson,
  configuredAiMaxInputChars,
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
    const raw = await readBoundedJson(request, 2_048);
    const parsed = SymptomClassifierRequestSchema.parse(raw);
    if (parsed.text.length > configuredAiMaxInputChars()) {
      return apiJson({ error: "request_too_large" }, 413);
    }
    const generated = await classifySymptom(
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
    return apiJson({ error: "request_unavailable" }, 400);
  }
}
