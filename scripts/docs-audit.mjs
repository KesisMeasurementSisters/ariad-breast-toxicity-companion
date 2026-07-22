import { access, readFile, readdir } from "node:fs/promises";
import path from "node:path";

const repositoryRoot = process.cwd();
const documentationRoot = path.join(repositoryRoot, "docs");
const releasePath = path.join(repositoryRoot, "apps/web/src/generated/release.json");
const manifestPath = path.join(repositoryRoot, "content/releases/build-week-preview.yaml");

async function markdownFiles(directory) {
  const entries = await readdir(directory, { withFileTypes: true });
  const files = await Promise.all(entries.map(async (entry) => {
    const entryPath = path.join(directory, entry.name);
    if (entry.isDirectory()) return markdownFiles(entryPath);
    return entry.isFile() && entry.name.endsWith(".md") ? [entryPath] : [];
  }));
  return files.flat();
}

const markdownPaths = [
  path.join(repositoryRoot, "README.md"),
  path.join(repositoryRoot, "BUILD_WEEK.md"),
  ...(await markdownFiles(documentationRoot)),
];
const release = JSON.parse(await readFile(releasePath, "utf8"));
const manifest = await readFile(manifestPath, "utf8");
const manifestVersion = manifest.match(/^version:\s*(\S+)$/mu)?.[1];
const errors = [];

if (manifestVersion !== release.release_version) {
  errors.push(
    `Release version mismatch: manifest ${manifestVersion ?? "missing"}, compiled ${release.release_version}.`,
  );
}

const currentSnapshotPaths = [
  "README.md",
  "docs/product-scope.md",
  "docs/knowledge-model.md",
  "docs/content-governance.md",
  "docs/fda-single-drug-toxicity-coverage.md",
  "docs/submission-checklist.md",
];
const releaseFacts = [release.release_version, release.content_hash];

for (const relativePath of currentSnapshotPaths) {
  const text = await readFile(path.join(repositoryRoot, relativePath), "utf8");
  for (const fact of releaseFacts) {
    if (!text.includes(fact)) {
      errors.push(`${relativePath} is missing current release fact: ${fact}.`);
    }
  }
}

const residuePattern = /\b(?:TODO|FIXME|TBD|XXX|WIP)\b/giu;
const staleCopyPatterns = [
  /\bpreparation-first\b/giu,
  /Preparation comes first/gu,
  /all LLM calls are disabled/gu,
  /current owner-directed mode/giu,
  /dormant, bounded OpenAI adapters/gu,
];
const markdownLinkPattern = /!?\[[^\]]*\]\(([^)]+)\)/gu;

for (const filePath of markdownPaths) {
  const relativePath = path.relative(repositoryRoot, filePath);
  const text = await readFile(filePath, "utf8");

  for (const match of text.matchAll(residuePattern)) {
    const line = text.slice(0, match.index).split("\n").length;
    errors.push(`${relativePath}:${line} contains unfinished-work marker ${match[0]}.`);
  }

  if (!relativePath.startsWith(`docs${path.sep}templates${path.sep}`)) {
    for (const pattern of staleCopyPatterns) {
      for (const match of text.matchAll(pattern)) {
        const line = text.slice(0, match.index).split("\n").length;
        errors.push(`${relativePath}:${line} contains stale product wording: ${match[0]}.`);
      }
    }
  }

  for (const match of text.matchAll(markdownLinkPattern)) {
    const rawTarget = match[1].trim().replace(/^<|>$/gu, "");
    if (
      rawTarget.startsWith("http://") ||
      rawTarget.startsWith("https://") ||
      rawTarget.startsWith("mailto:") ||
      rawTarget.startsWith("#") ||
      rawTarget === ""
    ) {
      continue;
    }

    const targetWithoutAnchor = rawTarget.split("#", 1)[0].split("?", 1)[0];
    const targetPath = path.resolve(path.dirname(filePath), decodeURIComponent(targetWithoutAnchor));
    try {
      await access(targetPath);
    } catch {
      const line = text.slice(0, match.index).split("\n").length;
      errors.push(`${relativePath}:${line} has a missing local link target: ${rawTarget}.`);
    }
  }
}

if (errors.length > 0) {
  console.error(`Documentation audit failed with ${errors.length} issue(s):`);
  for (const error of errors) console.error(`- ${error}`);
  process.exitCode = 1;
} else {
  console.log(
    `Documentation audit: ${markdownPaths.length} Markdown files; release ${release.release_id}@${release.release_version}; ${release.objects.length} objects; no unfinished-work markers; local links resolve.`,
  );
}
