import "server-only";

import { createHash } from "node:crypto";
import { NextResponse } from "next/server";

const JSON_HEADERS = {
  "Cache-Control": "no-store, max-age=0",
  "Content-Type": "application/json; charset=utf-8",
  "X-Content-Type-Options": "nosniff",
} as const;

const RATE_WINDOW_MS = 60_000;
const RATE_LIMIT = 30;
const MAX_RATE_BUCKETS = 1_000;
const DEFAULT_AI_MAX_INPUT_CHARS = 500;
const MIN_AI_MAX_INPUT_CHARS = 50;
const rateBuckets = new Map<string, { startedAt: number; count: number }>();

export class RequestBodyError extends Error {
  constructor(
    public readonly status: 400 | 413 | 415,
    message: string,
  ) {
    super(message);
  }
}

export function apiJson(body: unknown, status = 200): NextResponse {
  return NextResponse.json(body, { status, headers: JSON_HEADERS });
}

export function configuredAiMaxInputChars(): number {
  const parsed = Number.parseInt(process.env.AI_MAX_INPUT_CHARS ?? "", 10);
  if (!Number.isFinite(parsed)) return DEFAULT_AI_MAX_INPUT_CHARS;
  return Math.min(
    DEFAULT_AI_MAX_INPUT_CHARS,
    Math.max(MIN_AI_MAX_INPUT_CHARS, parsed),
  );
}

function expectedOrigin(request: Request): string {
  const url = new URL(request.url);
  const forwardedHost = request.headers.get("x-forwarded-host")?.split(",")[0]?.trim();
  const host = forwardedHost || request.headers.get("host") || url.host;
  const forwardedProtocol = request.headers
    .get("x-forwarded-proto")
    ?.split(",")[0]
    ?.trim()
    .replace(/:$/u, "");
  const protocol = forwardedProtocol || url.protocol.replace(/:$/u, "");
  return `${protocol}://${host}`;
}

export function isSameOrigin(request: Request): boolean {
  const supplied = request.headers.get("origin");
  if (!supplied) return false;
  try {
    return new URL(supplied).origin === new URL(expectedOrigin(request)).origin;
  } catch {
    return false;
  }
}

function rateKey(request: Request): string {
  const forwarded = request.headers.get("x-forwarded-for")?.split(",")[0]?.trim();
  const address = forwarded || request.headers.get("x-real-ip") || "unavailable";
  return createHash("sha256").update(address).digest("hex");
}

export function withinRateLimit(request: Request, now = Date.now()): boolean {
  const key = rateKey(request);
  const bucket = rateBuckets.get(key);
  if (!bucket) {
    if (rateBuckets.size >= MAX_RATE_BUCKETS) {
      for (const [candidateKey, candidate] of rateBuckets) {
        if (now - candidate.startedAt >= RATE_WINDOW_MS) rateBuckets.delete(candidateKey);
      }
      if (rateBuckets.size >= MAX_RATE_BUCKETS) return false;
    }
    rateBuckets.set(key, { startedAt: now, count: 1 });
  } else if (now - bucket.startedAt >= RATE_WINDOW_MS) {
    rateBuckets.set(key, { startedAt: now, count: 1 });
  } else {
    bucket.count += 1;
    if (bucket.count > RATE_LIMIT) return false;
  }
  return true;
}

export function guardAiPost(request: Request): NextResponse | null {
  if (!isSameOrigin(request)) {
    return apiJson({ error: "same_origin_required" }, 403);
  }
  if (!withinRateLimit(request)) {
    return apiJson({ error: "rate_limit_exceeded" }, 429);
  }
  const contentType = request.headers.get("content-type")?.toLocaleLowerCase("en-CA") ?? "";
  if (!contentType.startsWith("application/json")) {
    return apiJson({ error: "application_json_required" }, 415);
  }
  return null;
}

export async function readBoundedJson(request: Request, maxBytes: number): Promise<unknown> {
  const declaredLength = Number.parseInt(request.headers.get("content-length") ?? "", 10);
  if (Number.isFinite(declaredLength) && declaredLength > maxBytes) {
    throw new RequestBodyError(413, "request_too_large");
  }
  const body = await request.text();
  if (new TextEncoder().encode(body).byteLength > maxBytes) {
    throw new RequestBodyError(413, "request_too_large");
  }
  try {
    return JSON.parse(body) as unknown;
  } catch {
    throw new RequestBodyError(400, "invalid_json");
  }
}

export function releaseHeaderMismatch(
  request: Request,
  identity: { id: string; contentHash: string },
): boolean {
  const requestedId = request.headers.get("x-ariad-release-id");
  const requestedHash = request.headers.get("x-ariad-content-hash");
  return Boolean(
    (requestedId && requestedId !== identity.id) ||
      (requestedHash && requestedHash !== identity.contentHash),
  );
}
