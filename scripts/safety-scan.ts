import { readFile } from "node:fs/promises";
import path from "node:path";
import { CompiledReleaseSchema, type EducationalModule } from "@ariad/contracts";
import { scanModuleSafety, scanPatientTextSafety } from "@ariad/knowledge-core";
import { loadKnowledgeRepository } from "@ariad/knowledge-core/node";

async function main() {
  const repository = await loadKnowledgeRepository(path.join(process.cwd(), "content"));
  const sourceFindings = repository.objects
    .filter((object): object is EducationalModule => object.kind === "educational_module")
    .flatMap(scanModuleSafety);
  const generatedRelease = CompiledReleaseSchema.parse(
    JSON.parse(
      await readFile(
        path.join(process.cwd(), "apps/web/src/generated/release.json"),
        "utf8",
      ),
    ) as unknown,
  );
  const generatedFindings = generatedRelease.objects
    .filter((object): object is EducationalModule => object.kind === "educational_module")
    .flatMap((module) =>
      scanModuleSafety({ ...module, id: `generated-${module.id}` }),
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
    `Safety scan: ${findings.length} finding(s) across source modules, compiled modules, and summary fixtures`,
  );
  if (findings.length > 0) process.exitCode = 1;
}

main().catch((error: unknown) => {
  console.error(error instanceof Error ? error.message : String(error));
  process.exitCode = 1;
});
