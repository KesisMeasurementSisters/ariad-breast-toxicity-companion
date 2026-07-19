import { readFile } from "node:fs/promises";
import path from "node:path";
import {
  CompiledReleaseSchema,
  type ClinicConfig,
  type EducationalModule,
  type KnowledgeObject,
} from "@ariad/contracts";
import {
  scanClinicConfigSafety,
  scanModuleSafety,
  scanPatientTextSafety,
} from "@ariad/knowledge-core";
import { loadKnowledgeRepository } from "@ariad/knowledge-core/node";

function scanKnowledgeObject(object: KnowledgeObject, idPrefix = "") {
  if (object.kind === "educational_module") {
    return scanModuleSafety({ ...object, id: `${idPrefix}${object.id}` } as EducationalModule);
  }
  if (object.kind === "clinic_config") {
    return scanClinicConfigSafety({ ...object, id: `${idPrefix}${object.id}` } as ClinicConfig);
  }
  return [];
}

async function main() {
  const repository = await loadKnowledgeRepository(path.join(process.cwd(), "content"));
  const sourceFindings = repository.objects.flatMap((object) => scanKnowledgeObject(object));
  const generatedRelease = CompiledReleaseSchema.parse(
    JSON.parse(
      await readFile(
        path.join(process.cwd(), "apps/web/src/generated/release.json"),
        "utf8",
      ),
    ) as unknown,
  );
  const generatedFindings = generatedRelease.objects.flatMap((object) =>
    scanKnowledgeObject(object, "generated-"),
  );
  const summaryFixtures = JSON.parse(
    await readFile(path.join(process.cwd(), "tests/ai/safe-summary-fixtures.json"), "utf8"),
  ) as Array<{ id: string; text: string[] }>;
  const summaryFindings = summaryFixtures.flatMap((fixture) =>
    fixture.text.flatMap((value, index) =>
      scanPatientTextSafety(`summary-${fixture.id}`, `text.${index}`, value),
    ),
  );
  const findings = [...sourceFindings, ...generatedFindings, ...summaryFindings];

  findings.forEach((finding) => {
    console.error(
      `ERROR [${finding.ruleId}] ${finding.objectId} ${finding.field}: ${finding.excerpt}`,
    );
  });

  console.info(
    `Safety scan: ${findings.length} finding(s) across source content, compiled content, and summary fixtures`,
  );
  if (findings.length > 0) process.exitCode = 1;
}

main().catch((error: unknown) => {
  console.error(error instanceof Error ? error.message : String(error));
  process.exitCode = 1;
});
