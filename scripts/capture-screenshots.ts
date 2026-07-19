import { mkdir } from "node:fs/promises";
import path from "node:path";
import { chromium, type Page } from "@playwright/test";

const baseUrl = process.env.ARIAD_SCREENSHOT_BASE_URL ?? "http://localhost:3000";
const outputDirectory = path.resolve(process.cwd(), "docs/screenshots");

async function choose(page: Page, name: string | RegExp) {
  await page
    .getByRole("button", { name })
    .or(page.getByRole("radio", { name }))
    .or(page.getByRole("checkbox", { name }))
    .first()
    .click();
}

async function nextQuestion(page: Page) {
  await page
    .getByRole("button", { name: /Next question|View source-controlled guidance/ })
    .click();
}

async function capture(page: Page, filename: string) {
  await page.evaluate(() => {
    (document.activeElement as HTMLElement | null)?.blur();
    document.body.classList.add("ariad-screenshot-capture");
    window.scrollTo(0, 0);
  });
  await page.screenshot({
    path: path.join(outputDirectory, filename),
    fullPage: true,
    animations: "disabled",
  });
  await page.evaluate(() => {
    document.body.classList.remove("ariad-screenshot-capture");
  });
}

async function main() {
  await mkdir(outputDirectory, { recursive: true });
  const browser = await chromium.launch();

  try {
    const page = await browser.newPage({ viewport: { width: 390, height: 844 } });
    await page.route("**/api/ai/classify-symptom", async (route) => {
      await route.fulfill({
        status: 200,
        contentType: "application/json",
        body: JSON.stringify({
          generationMode: "deterministic_match",
          result: {
            candidates: [
              {
                symptomId: "peripheral-neuropathy",
                confidence: 0.92,
                supportingPhrases: ["fingertips"],
              },
            ],
            needsClarification: false,
            outOfScope: false,
            reasonCode: "matched",
          },
        }),
      });
    });
    await page.route("**/api/ai/create-symptom-summary", async (route) => {
      const request = route.request().postDataJSON() as {
        symptomLabel: string;
        facts: Array<{ id: string; label: string; value: string }>;
      };
      await route.fulfill({
        status: 200,
        contentType: "application/json",
        body: JSON.stringify({
          generationMode: "deterministic_fallback",
          result: {
            title: `${request.symptomLabel} summary`,
            summaryItems: request.facts.map((fact) => ({
              text: `${fact.label}: ${fact.value}.`,
              sourceFieldIds: [fact.id],
            })),
            patientQuestions: [],
            omittedUncertainItems: [],
          },
        }),
      });
    });

    await page.goto(baseUrl);
    await page.locator("body[data-ariad-ready='true']").waitFor();
    await page.addStyleTag({
      content: `
        .ariad-screenshot-capture .skip-link {
          display: none !important;
        }

        .ariad-screenshot-capture .emergency-boundary {
          inset: auto !important;
          position: static !important;
        }
      `,
    });
    await capture(page, "01-home-mobile.png");

    await choose(page, "I’m having a symptom");
    await page
      .getByLabel("Describe the symptom in your own words")
      .fill("Electric sparks across my fingertips make small objects slip.");
    await choose(page, "Find a symptom category");
    await page.getByRole("heading", { name: "Which category is closest?" }).waitFor();
    await capture(page, "02-controlled-symptom-match-mobile.png");

    await choose(page, /Tingling, numbness, or burning.*This is closest/);
    await page.getByLabel("Treatment or regimen").fill("weekly paclitaxel");
    await choose(page, /Weekly paclitaxel.*Full demo guidance/);
    await choose(page, "Fingers");
    await nextQuestion(page);
    await choose(page, "Today");
    await nextQuestion(page);
    await choose(page, "Getting stronger or spreading");
    await nextQuestion(page);
    await choose(page, "Picking up small objects");
    await nextQuestion(page);
    await choose(page, "No");
    await nextQuestion(page);
    await choose(page, "No");
    await nextQuestion(page);
    await page.getByRole("heading", { name: "Tingling, numbness, or burning" }).waitFor();
    await capture(page, "03-source-controlled-guidance-mobile.png");

    await choose(page, "Create a summary for my cancer team");
    await page
      .getByRole("heading", { name: "Tingling, numbness, or burning summary", level: 1 })
      .waitFor();
    await page
      .getByText("Deterministic template fallback—no model was required.")
      .waitFor();
    await capture(page, "04-neutral-summary-mobile.png");
  } finally {
    await browser.close();
  }
}

void main();
