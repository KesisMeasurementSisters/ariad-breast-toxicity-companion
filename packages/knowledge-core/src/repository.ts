import { readFile, readdir } from "node:fs/promises";
import path from "node:path";
import {
  ContentApprovalSchema,
  ContentReleaseManifestSchema,
  KnowledgeObjectSchema,
  ReleaseApprovalSchema,
  type ContentApproval,
  type ContentReleaseManifest,
  type KnowledgeObject,
  type ReleaseApproval,
} from "@ariad/contracts";
import { parseDocument } from "yaml";

export interface KnowledgeRepository {
  objects: KnowledgeObject[];
  releases: ContentReleaseManifest[];
  contentApprovals: ContentApproval[];
  releaseApprovals: ReleaseApproval[];
  filesByKey: Map<string, string>;
}

async function discoverFiles(directory: string): Promise<string[]> {
  const entries = await readdir(directory, { withFileTypes: true });
  const files: string[] = [];

  for (const entry of entries.sort((left, right) => left.name.localeCompare(right.name))) {
    const candidate = path.join(directory, entry.name);
    if (entry.isDirectory()) {
      files.push(...(await discoverFiles(candidate)));
    } else if (/\.(?:ya?ml|json)$/u.test(entry.name)) {
      files.push(candidate);
    }
  }

  return files;
}

function parseSourceFile(file: string, source: string): unknown[] {
  if (file.endsWith(".json")) {
    const parsed: unknown = JSON.parse(source);
    return Array.isArray(parsed) ? parsed : [parsed];
  }

  const document = parseDocument(source, {
    merge: true,
    prettyErrors: true,
    strict: true,
    uniqueKeys: true,
  });

  if (document.errors.length > 0) {
    throw new Error(`${file}: ${document.errors.map((error) => error.message).join("; ")}`);
  }

  const parsed: unknown = document.toJS({ maxAliasCount: 200 });
  return Array.isArray(parsed) ? parsed : [parsed];
}

function formatSchemaError(file: string, error: unknown): Error {
  return new Error(`${file}: ${error instanceof Error ? error.message : String(error)}`);
}

export function objectKey(object: Pick<KnowledgeObject, "kind" | "id" | "version">): string {
  return `${object.kind}:${object.id}@${object.version}`;
}

export async function loadKnowledgeRepository(contentRoot: string): Promise<KnowledgeRepository> {
  const files = await discoverFiles(contentRoot);
  const objects: KnowledgeObject[] = [];
  const releases: ContentReleaseManifest[] = [];
  const contentApprovals: ContentApproval[] = [];
  const releaseApprovals: ReleaseApproval[] = [];
  const filesByKey = new Map<string, string>();

  for (const file of files) {
    const relative = path.relative(contentRoot, file);
    if (relative.startsWith(`schemas${path.sep}`)) continue;
    const entries = parseSourceFile(file, await readFile(file, "utf8"));

    for (const entry of entries) {
      try {
        if (relative.startsWith(`releases${path.sep}`)) {
          const release = ContentReleaseManifestSchema.parse(entry);
          releases.push(release);
          filesByKey.set(`release:${release.release_id}@${release.version}`, relative);
        } else if (relative.startsWith(`approvals${path.sep}`)) {
          if ((entry as { kind?: unknown }).kind === "content_approval") {
            const approval = ContentApprovalSchema.parse(entry);
            contentApprovals.push(approval);
            filesByKey.set(`content_approval:${approval.id}`, relative);
          } else if ((entry as { kind?: unknown }).kind === "release_approval") {
            const approval = ReleaseApprovalSchema.parse(entry);
            releaseApprovals.push(approval);
            filesByKey.set(`release_approval:${approval.id}`, relative);
          }
        } else {
          const object = KnowledgeObjectSchema.parse(entry);
          objects.push(object);
          filesByKey.set(objectKey(object), relative);
        }
      } catch (error) {
        throw formatSchemaError(relative, error);
      }
    }
  }

  return { objects, releases, contentApprovals, releaseApprovals, filesByKey };
}
