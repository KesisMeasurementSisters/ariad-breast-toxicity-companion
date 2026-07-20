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
      name: /Next question|View source-controlled guidance/,
    })
    .click();
}

test.beforeEach(async ({ page }) => {
  await page.goto("/");
  await expect(page.locator("body")).toHaveAttribute("data-ariad-ready", "true");
  await expect(
    page.getByText("Unreviewed prototype content — not for clinical use").first(),
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
  await choose(page, "Find a symptom category");

  await expect(page.getByText("GPT‑5.6 mapped the wording only")).toBeVisible();
  await choose(page, /Tingling, numbness, or burning.*This is closest/);

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
  await expect(page.getByText("Contact your cancer team if…")).toBeVisible();
  await expect(page.getByText("Seek urgent medical attention if…")).toBeVisible();
  const clinicCard = page.locator(".clinic-card");
  await expect(clinicCard.getByText("Synthetic demo clinic configuration")).toBeVisible();
  await expect(
    clinicCard.getByRole("heading", { name: "Threadline Demo Cancer Centre" }),
  ).toBeVisible();
  await expect(clinicCard.getByRole("heading", { name: "Demo daytime cancer team" })).toBeVisible();
  await expect(
    clinicCard.getByRole("heading", { name: "Demo after-hours cancer team" }),
  ).toBeVisible();
  await expect(clinicCard.locator("a[href^='tel:']")).toHaveCount(0);

  await choose(page, /Create a summary for my cancer team/);
  await expect(page.getByText("GPT‑5.6 restated supplied facts")).toBeVisible();
  await expect(page.getByText("Location: Fingers.")).toBeVisible();
  await expect(
    page.locator(".summary-sheet").getByText(/cannot determine the cause, assign a grade/i),
  ).toBeVisible();
});

test("a drug result opens the single-drug information fallback", async ({ page }) => {
  await choose(page, /I’m starting treatment/);
  await page.getByLabel("Drug or regimen").fill("doxorubicin");
  await choose(page, /Drug: Doxorubicin \(Adriamycin\).*View this drug’s information/);

  await expect(
    page.getByRole("heading", { name: "Doxorubicin (Adriamycin)" }),
  ).toBeVisible();
  await expect(page.getByText("Information for this drug is being prepared")).toBeVisible();
  await expect(page.getByText("Ariad cannot determine the cause").first()).toBeVisible();
});

test("a clinic code still opens the complete weekly paclitaxel preparation guide", async ({ page }) => {
  await choose(page, /I’m starting treatment/);
  await page.getByLabel("Treatment code").fill("THREAD-PAC-01");
  await choose(page, "Use code");

  await expect(page.getByRole("heading", { name: "Weekly paclitaxel" })).toBeVisible();
  await expect(page.getByRole("heading", { name: "Your treatment at a glance" })).toBeVisible();
  await expect(page.getByRole("heading", { name: "A simple preparation checklist" })).toBeVisible();
  await expect(page.getByText(/cannot determine the cause, assign a grade/i).first()).toBeVisible();
});

test("capecitabine demo reaches the fixed diarrhea guidance sections", async ({ page }) => {
  await choose(page, /Loose, watery bowel movements/);
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
  await expect(page.getByText("Contact your cancer team if…")).toBeVisible();
  await expect(page.getByText("Clinical-owner decision pending")).toBeVisible();
});

test("AC demo preserves the unresolved fever threshold as a visible review boundary", async ({
  page,
}) => {
  await choose(page, /Fever, chills, or feeling unwell/);
  await nextQuestion(page);
  await choose(page, "Chills");
  await nextQuestion(page);
  await choose(page, "Yes");
  await nextQuestion(page);
  await choose(page, "Mouth sores");
  await nextQuestion(page);
  await nextQuestion(page);

  await expect(
    page.getByRole("heading", { name: "Fever, chills, or infection concern" }),
  ).toBeVisible();
  await expect(page.getByText("Clinical-owner decision pending")).toBeVisible();
  await expect(page.getByText(/follow the fever instructions .*your cancer team/i).first()).toBeVisible();
  const clinicCard = page.locator(".clinic-card");
  await expect(
    clinicCard.getByText("Fictional contact details for demonstration only — do not call or use for care."),
  ).toBeVisible();
  await expect(
    clinicCard.getByText("Local fever instruction pending clinical review in this prototype"),
  ).toBeVisible();
  await expect(clinicCard.locator("a[href^='tel:']")).toHaveCount(0);
});
