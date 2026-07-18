import path from "node:path";
import type { EducationalModule } from "@ariad/contracts";
import { scanModuleSafety } from "@ariad/knowledge-core";
import { loadKnowledgeRepository } from "@ariad/knowledge-core/node";

async function main() {
  const repository = await loadKnowledgeRepository(path.join(process.cwd(), "content"));
  const findings = repository.objects
    .filter((object): object is EducationalModule => object.kind === "educational_module")
    .flatMap(scanModuleSafety);

  findings.forEach((finding) => {
    console.error(
      `ERROR [${finding.ruleId}] ${finding.objectId} ${finding.field}: ${finding.excerpt}`,
    );
  });

  console.info(`Safety scan: ${findings.length} prohibited-language finding(s)`);
  if (findings.length > 0) process.exitCode = 1;
}

main().catch((error: unknown) => {
  console.error(error instanceof Error ? error.message : String(error));
  process.exitCode = 1;
});
