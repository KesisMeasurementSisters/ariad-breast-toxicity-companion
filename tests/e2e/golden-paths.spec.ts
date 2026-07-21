import { UNIVERSAL_EMERGENCY_STATEMENT } from "@ariad/contracts";
import { expect, test, type Page } from "@playwright/test";

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
    .getByRole("button", {
      name: /Next question|See information/,
    })
    .click();
}

test.beforeEach(async ({ page }) => {
  await page.goto("/");
  await expect(page.locator("body")).toHaveAttribute("data-ariad-ready", "true");
  const emergencyBoundary = page.locator(".emergency-boundary");
  await expect(emergencyBoundary).toHaveCount(1);
  await expect(emergencyBoundary).toContainText(UNIVERSAL_EMERGENCY_STATEMENT);
  await expect(
    page.getByText("Draft demo. A health professional has not reviewed this information. Do not use it for patient care").first(),
  ).toBeVisible();
  await expect(page.locator('meta[name="format-detection"]')).toHaveAttribute(
    "content",
    /telephone=no/u,
  );
});

test("mocked GPT navigation completes the neuropathy path and neutral summary", async ({
  page,
}) => {
  await page.route("**/api/ai/classify-symptom", async (route) => {
    await route.fulfill({
      status: 200,
      contentType: "application/json",
      body: JSON.stringify({
        generationMode: "openai",
        result: {
          candidates: [
            {
              symptomId: "peripheral-neuropathy",
              confidence: 0.82,
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
    await route.fulfill({
      status: 200,
      contentType: "application/json",
      body: JSON.stringify({
        generationMode: "openai",
        result: {
          title: "Symptom summary: Tingling, numbness, or burning",
          summaryItems: [
            {
              text: "Location: Fingers.",
              sourceFieldIds: ["q-neuropathy-location"],
            },
            {
              text: "Hand tasks: Affects picking up small objects.",
              sourceFieldIds: ["q-neuropathy-hand-tasks"],
            },
          ],
          patientQuestions: [],
          omittedUncertainItems: [],
        },
      }),
    });
  });

  await choose(page, "I’m having a symptom");
  await page
    .getByLabel("Describe the symptom in your own words")
    .fill("Electric sparks across my fingertips make small objects slip.");
  await choose(page, "Find a symptom");

  await expect(page.getByText("Ariad used AI only to match your words")).toBeVisible();
  await choose(page, /Tingling, numbness, or burning.*Choose this/);

  await expect(
    page.getByRole("heading", { name: "Drugs in Ariad that list tingling, numbness, or burning" }),
  ).toBeVisible();
  await expect(page.locator(".symptom-drug-row")).toHaveCount(12);
  await expect(
    page.getByRole("button", { name: /Drug: Docetaxel.*Numbness, tingling, or burning/ }),
  ).toBeVisible();
  await expect(
    page.getByRole("button", { name: /Drug: Paclitaxel.*Numbness, tingling, or weakness/ }).first(),
  ).toBeVisible();
  await expect(page.locator(".symptom-drug-list")).not.toContainText("Weekly paclitaxel");
  await page.getByLabel("Treatment code").fill("THREAD-PAC-01");
  await choose(page, "Use code");
  await choose(page, "Continue with this treatment");

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

  await expect(
    page.getByRole("heading", { name: "Tingling, numbness, or burning" }),
  ).toBeVisible();
  await expect(page.getByText("When to contact your cancer team")).toBeVisible();
  await expect(page.getByText("When to get urgent medical help")).toBeVisible();
  const contactSection = page.locator(".section-contact_team");
  const urgentSection = page.locator(".section-urgent_attention");
  await expect(contactSection).toHaveAttribute("open", "");
  await expect(urgentSection).toHaveAttribute("open", "");
  await expect(contactSection).not.toContainText("Based on your answers");
  await expect(urgentSection).not.toContainText("Based on your answers");
  const clinicCard = page.locator(".clinic-card");
  await expect(clinicCard.getByText("Demo clinic details")).toBeVisible();
  await expect(
    clinicCard.getByRole("heading", { name: "Threadline Demo Cancer Centre" }),
  ).toBeVisible();
  await expect(clinicCard.getByRole("heading", { name: "Demo daytime cancer team" })).toBeVisible();
  await expect(
    clinicCard.getByRole("heading", { name: "Demo after-hours cancer team" }),
  ).toBeVisible();
  await expect(clinicCard.locator("a[href^='tel:']")).toHaveCount(0);

  await choose(page, /Create a summary for my cancer team/);
  await expect(page.getByText("Ariad used only the answers you gave.")).toBeVisible();
  await expect(page.getByText("Location: Fingers.")).toBeVisible();
  await expect(
    page.locator(".summary-sheet").getByText(/cannot tell what is causing your symptom or how serious it is/i),
  ).toBeVisible();
});

test("a drug result opens its single-drug information", async ({ page }) => {
  await choose(page, /I’m starting treatment/);
  await page.getByLabel("Drug or treatment plan").fill("doxorubicin");
  await page
    .getByRole("button", { name: /^Drug: Doxorubicin \(Adriamycin\)\./ })
    .click();

  await expect(
    page.getByRole("heading", { name: "Doxorubicin (Adriamycin)" }),
  ).toBeVisible();
  const doxorubicinPresentation = page.locator(
    '[data-presentation-id="doxorubicin-patient-side-effects"]',
  );
  await expect(
    doxorubicinPresentation.getByRole("heading", { name: "Side effects linked to doxorubicin" }),
  ).toBeVisible();
  await expect(
    doxorubicinPresentation.getByText("Ariad cannot tell what is causing a symptom.", {
      exact: true,
    }),
  ).toBeVisible();
});

test("a clinic code still opens the complete weekly paclitaxel preparation guide", async ({ page }) => {
  await choose(page, /I’m starting treatment/);
  await page.getByLabel("Treatment code").fill("THREAD-PAC-01");
  await choose(page, "Use code");

  await expect(page.getByRole("heading", { name: "Weekly paclitaxel" })).toBeVisible();
  await expect(page.getByRole("heading", { name: "Get ready in three steps" })).toBeVisible();
  await expect(page.getByRole("heading", { name: "What is this treatment?" })).toBeVisible();
  await expect(page.getByRole("heading", { name: "What should I do before treatment?" })).toBeVisible();
  await expect(page.getByRole("heading", { name: "What should I have ready?" })).toBeVisible();
  await expect(page.locator(".preparation-step")).toHaveCount(3);
  await expect(
    page
      .locator(".boundary-card")
      .getByText("Ariad cannot tell what is causing a symptom or how serious it is.", {
        exact: true,
      }),
  ).toBeVisible();
});

test("capecitabine demo reaches the fixed diarrhea guidance sections", async ({ page }) => {
  await choose(page, /Loose, watery bowel movements/);
  await expect(page.getByRole("heading", { name: "Drugs in Ariad that list diarrhea" })).toBeVisible();
  await expect(page.locator(".symptom-drug-row")).toHaveCount(18);
  await page.locator(".suggested-treatment-card").click();
  await choose(page, "Continue with this treatment");
  await choose(page, "Today");
  await nextQuestion(page);
  await choose(page, "4–6");
  await nextQuestion(page);
  await choose(page, "Drinking less than usual");
  await nextQuestion(page);
  await choose(page, "No");
  await nextQuestion(page);
  await choose(page, "No");
  await nextQuestion(page);
  await nextQuestion(page);
  await choose(page, "No");
  await nextQuestion(page);

  await expect(page.getByRole("heading", { name: "Diarrhea" })).toBeVisible();
  await expect(page.getByText("When to contact your cancer team")).toBeVisible();
  await expect(page.getByText("A clinic instruction still needs review.")).toBeVisible();
});

test("AC demo preserves the unresolved fever threshold as a visible review boundary", async ({
  page,
}) => {
  await choose(page, /Fever, chills, or feeling unwell/);
  await expect(
    page.getByRole("heading", { name: "Drugs in Ariad that list fever, chills, or feeling unwell" }),
  ).toBeVisible();
  await expect(page.locator(".symptom-drug-row")).toHaveCount(20);
  await page.locator(".suggested-treatment-card").click();
  await choose(page, "Continue with this treatment");
  await nextQuestion(page);
  await choose(page, "Chills");
  await nextQuestion(page);
  await choose(page, "Yes");
  await nextQuestion(page);
  await choose(page, "Mouth sores");
  await nextQuestion(page);
  await nextQuestion(page);

  await expect(
    page.getByRole("heading", { name: "Fever, chills, or feeling unwell" }),
  ).toBeVisible();
  await expect(page.getByText("A clinic instruction still needs review.")).toBeVisible();
  await expect(page.getByText(/follow the fever instructions .*your cancer team/i).first()).toBeVisible();
  const clinicCard = page.locator(".clinic-card");
  await expect(
    clinicCard.getByText("Made-up contact details for this demo. Do not call these numbers or use them for care."),
  ).toBeVisible();
  await expect(
    clinicCard.getByText("The clinic's fever instructions still need review."),
  ).toBeVisible();
  await expect(clinicCard.locator("a[href^='tel:']")).toHaveCount(0);
});
