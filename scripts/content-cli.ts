import { mkdir, writeFile } from "node:fs/promises";
import path from "node:path";
import {
  CompiledReleaseSchema,
  KnowledgeObjectSchema,
  type ClinicConfig,
  type ClinicConfigV2,
  type EducationalModule,
  type KnowledgeObject,
  type Source,
} from "@ariad/contracts";
import {
  canonicalJson,
  compileRelease,
  findReleaseManifest,
  loadKnowledgeRepository,
  validateRepository,
} from "@ariad/knowledge-core/node";
import { z } from "zod";

const root = process.cwd();
const contentRoot = path.join(root, "content");

function printValidation(report: ReturnType<typeof validateRepository>) {
  const counts = Object.entries(report.counts)
    .sort(([left], [right]) => left.localeCompare(right))
    .map(([kind, count]) => `${kind}=${count}`)
    .join(", ");
  console.info(`Content objects: ${counts}`);
  report.issues.forEach((issue) =>
    console.info(`${issue.severity.toUpperCase()} [${issue.code}] ${issue.objectId}: ${issue.message}`),
  );
  console.info(`Validation: ${report.errors} error(s), ${report.warnings} warning(s)`);
}

function reviewReport(objects: KnowledgeObject[]): string {
  const modules = objects
    .filter((object): object is EducationalModule => object.kind === "educational_module")
    .sort((left, right) => left.id.localeCompare(right.id));
  const sources = objects
    .filter((object): object is Source => object.kind === "source")
    .sort((left, right) => left.id.localeCompare(right.id));
  const clinicConfigVersions = objects
    .filter((object): object is ClinicConfig => object.kind === "clinic_config")
    .sort((left, right) =>
      `${left.id}:${left.version}`.localeCompare(`${right.id}:${right.version}`),
    );
  const clinicConfigs = clinicConfigVersions
    .filter(
      (object): object is ClinicConfigV2 => "mode" in object,
    )
    .sort((left, right) => left.version.localeCompare(right.version));
  const drafts = objects.filter(
    (object) => object.kind !== "source" && "status" in object && object.status === "draft",
  );
  const missingSourceModules = modules.filter((module) => module.source_ids.length === 0);
  const placeholders = modules.filter((module) => module.placeholders.length > 0);
  const unresolvedClinicPolicies = clinicConfigs.flatMap((clinic) =>
    Object.entries(clinic.clinical_policy_bindings).filter(
      ([, binding]) => binding.state === "unresolved",
    ),
  );

  return `# Ariad content review report

> Generated from repository content. Generation does not approve any content.

## Review summary

- Draft governed objects: ${drafts.length}
- Patient-facing modules: ${modules.length}
- Approved patient-facing modules: ${modules.filter((module) => module.status === "approved").length}
- Modules missing sources: ${missingSourceModules.length}
- Modules with unresolved placeholders: ${placeholders.length}
- Source records: ${sources.length}
- Clinic configuration versions: ${clinicConfigVersions.length}
- Structured clinic configuration v2 objects: ${clinicConfigs.length}
- Unresolved clinic policy bindings: ${unresolvedClinicPolicies.length}

## Clinic configuration

| Clinic | Version | Mode | Status | Contacts | Fever policy | Supportive-care policy |
|---|---:|---|---|---:|---|---|
${clinicConfigVersions
  .map(
    (clinic) =>
      "mode" in clinic
        ? `| ${clinic.id} | ${clinic.version} | ${clinic.mode} | ${clinic.status} | ${clinic.contact_routes.length} | ${clinic.clinical_policy_bindings.fever.state} | ${clinic.clinical_policy_bindings.supportive_care.state} |`
        : `| ${clinic.id} | ${clinic.version} | legacy_v1 | ${clinic.status} | legacy flat fields | retained history | retained history |`,
  )
  .join("\n")}

## Patient-facing modules

| Module | Version | Section | Status | Reviewer | Sources | Placeholders |
|---|---:|---|---|---|---:|---|
${modules
  .map(
    (module) =>
      `| ${module.id} | ${module.version} | ${module.section} | ${module.status} | ${module.review.reviewer ?? "—"} | ${module.source_ids.length} | ${module.placeholders.join("; ") || "—"} |`,
  )
  .join("\n")}

## Source inventory

| Source | Organization | Jurisdiction | Verification | Link |
|---|---|---|---|---|
${sources
  .map(
    (source) =>
      `| ${source.id} | ${source.organization} | ${source.jurisdiction} | ${source.verification_status} | [Open](${source.canonical_url}) |`,
  )
  .join("\n")}

## Required clinical-owner decisions

- Review and edit every patient-facing module and its claim-to-source mapping.
- Replace synthetic identity and contact fixtures with verified institutional data before any published release.
- Define governed policy-purpose compatibility and exact runtime rendering, then resolve fever and supportive-care through approved module references; exact references alone are not publishable in P0.
- Resolve the Ontario/eviQ diarrhea-threshold discrepancy.
- Confirm the exact AC regimen variant before any cycle-timing statement is introduced.
- Decide whether any team-directed over-the-counter medicine module is appropriate; none is approved here.
- Create content and release approval evidence only after review. The compiler never approves content.
`;
}

async function writeSchemas() {
  const schemaDirectory = path.join(contentRoot, "schemas");
  await mkdir(schemaDirectory, { recursive: true });
  await writeFile(
    path.join(schemaDirectory, "knowledge-object.schema.json"),
    canonicalJson(z.toJSONSchema(KnowledgeObjectSchema, { target: "draft-7" })),
  );
  await writeFile(
    path.join(schemaDirectory, "compiled-release.schema.json"),
    canonicalJson(z.toJSONSchema(CompiledReleaseSchema, { target: "draft-7" })),
  );
}

async function main() {
  const command = process.argv[2] ?? "validate";
  const repository = await loadKnowledgeRepository(contentRoot);
  const validation = validateRepository(repository);

  if (command === "validate") {
    printValidation(validation);
    if (validation.errors > 0) process.exitCode = 1;
    return;
  }

  if (validation.errors > 0) {
    printValidation(validation);
    process.exitCode = 1;
    return;
  }

  if (command === "report") {
    const report = reviewReport(repository.objects);
    await writeFile(path.join(contentRoot, "review-report.md"), report);
    console.info(report);
    return;
  }

  if (command === "build") {
    const manifest = findReleaseManifest(repository, process.env.CONTENT_RELEASE_ID);
    const compiled = compileRelease(repository, manifest, process.env.ALLOW_DRAFT_CONTENT);
    const generatedDirectory = path.join(root, "apps/web/src/generated");
    const releaseDirectory = path.join(root, "apps/web/public/releases");
    await mkdir(generatedDirectory, { recursive: true });
    await mkdir(releaseDirectory, { recursive: true });
    await writeFile(path.join(generatedDirectory, "release.json"), compiled.json);
    await writeFile(
      path.join(releaseDirectory, `${compiled.release.release_id}.${compiled.release.content_hash}.json`),
      compiled.json,
    );
    await writeFile(path.join(contentRoot, "review-report.md"), reviewReport(repository.objects));
    await writeSchemas();
    console.info(
      `Compiled ${manifest.channel} release ${manifest.release_id} (${compiled.release.content_hash}) from ${manifest.included_objects.length} pinned objects`,
    );
    return;
  }

  throw new Error(`Unknown content command '${command}'. Use validate, build, or report.`);
}

main().catch((error: unknown) => {
  console.error(error instanceof Error ? error.message : String(error));
  process.exitCode = 1;
});
