import { expect, test } from "@playwright/test";

test.beforeEach(async ({ page }) => {
  await page.goto("/");
  await expect(page.locator("body")).toHaveAttribute("data-ariad-ready", "true");
  await page.getByRole("button", { name: /I’m starting treatment/ }).click();
});

test("search stays minimal and canonicalizes generic and brand names", async ({ page }) => {
  const search = page.getByLabel("Drug or regimen");

  await expect(page.locator(".result-list")).toHaveCount(0);
  await search.fill("c");
  await expect(page.locator(".result-list")).toHaveCount(0);

  await search.fill("capecitabine");
  const results = page.locator(".result-row");
  await expect(results).toHaveCount(3);
  await expect(page.locator(".result-kind-drug")).toHaveCount(1);
  await expect(page.locator(".result-kind-regimen")).toHaveCount(2);
  await expect(
    page.getByRole("button", {
      name: "Drug: Capecitabine (Xeloda). View this drug’s information",
    }),
  ).toBeVisible();

  await search.fill("Xeloda");
  await expect(results).toHaveCount(3);
  await expect(results.first()).toContainText("Capecitabine (Xeloda)");

  await search.fill("Veppanu");
  await expect(results).toHaveCount(1);
  await expect(results.first()).toContainText("Vepdegestrant (Veppanu)");
});

test("an exact drug is followed by multi-drug regimens containing it", async ({ page }) => {
  await page.getByLabel("Drug or regimen").fill("docetaxel");

  const results = page.locator(".result-row");
  await expect(results).toHaveCount(3);
  await expect(results.nth(0)).toContainText("Drug");
  await expect(results.nth(0)).toContainText("Docetaxel (Taxotere)");
  await expect(results.nth(1)).toContainText(
    "CAPEDOCE: Capecitabine + Docetaxel",
  );
  await expect(results.nth(2)).toContainText(
    "TC: Docetaxel + Cyclophosphamide",
  );
});

test("an exact regimen remains first while close regimen names stay visible", async ({ page }) => {
  await page.getByLabel("Drug or regimen").fill("TC");

  const results = page.locator(".result-row");
  await expect(results).toHaveCount(3);
  await expect(results.nth(0)).toContainText("TC: Docetaxel + Cyclophosphamide");
  await expect(results.nth(1)).toContainText(
    "TCH: Docetaxel + Carboplatin + Trastuzumab",
  );
  await expect(results.nth(2)).toContainText(
    "TCHP: Docetaxel + Carboplatin + Trastuzumab + Pertuzumab",
  );
});

test("TCH is complete and TCHP remains visible as a close regimen", async ({ page }) => {
  await page.getByLabel("Drug or regimen").fill("TCH");

  const results = page.locator(".result-row");
  await expect(results).toHaveCount(2);
  await expect(results.nth(0)).toContainText(
    "TCH: Docetaxel + Carboplatin + Trastuzumab",
  );
  await expect(results.nth(1)).toContainText(
    "TCHP: Docetaxel + Carboplatin + Trastuzumab + Pertuzumab",
  );
});

test("a spelling-close result is clearly introduced as a suggestion", async ({ page }) => {
  await page.getByLabel("Drug or regimen").fill("capecitbine");

  await expect(page.getByText("Did you mean?")).toBeVisible();
  await expect(page.locator(".result-row").first()).toContainText("Capecitabine (Xeloda)");
});

test("a drug opens one drug page and a regimen opens ordered component cards", async ({ page }) => {
  const search = page.getByLabel("Drug or regimen");
  await search.fill("capecitabine");
  await page
    .getByRole("button", {
      name: "Drug: Capecitabine (Xeloda). View this drug’s information",
    })
    .click();

  await expect(page.getByRole("heading", { name: "Capecitabine (Xeloda)" })).toBeVisible();
  await expect(page.locator(".regimen-medication-card")).toHaveCount(0);
  await expect(
    page.getByRole("heading", { name: "Side effects reported with capecitabine alone" }),
  ).toBeVisible();

  await page.getByRole("button", { name: "Back" }).click();
  await search.fill("TCHP");
  await page
    .getByRole("button", {
      name: /Regimen: TCHP: Docetaxel \+ Carboplatin \+ Trastuzumab \+ Pertuzumab/,
    })
    .click();

  await expect(
    page.getByRole("heading", {
      name: "TCHP: Docetaxel + Carboplatin + Trastuzumab + Pertuzumab",
    }),
  ).toBeVisible();
  const cards = page.locator(".regimen-medication-card");
  await expect(cards).toHaveCount(4);
  await expect(cards.nth(0).locator("h2")).toHaveText("Docetaxel (Taxotere)");
  await expect(cards.nth(1).locator("h2")).toHaveText("Carboplatin");
  await expect(cards.nth(2).locator("h2")).toHaveText("Trastuzumab (Herceptin)");
  await expect(cards.nth(3).locator("h2")).toHaveText("Pertuzumab (Perjeta)");
  await expect(page.getByText("Information for this drug is being prepared")).toHaveCount(4);
});

test("a catalogue drug without FDA single-agent breast frequencies stays in preparation", async ({
  page,
}) => {
  await page.goto("/?treatment=alpelisib");
  await expect(page.locator("body")).toHaveAttribute("data-ariad-ready", "true");

  await expect(page.getByRole("heading", { name: "Alpelisib (Piqray)" })).toBeVisible();
  await expect(
    page.getByRole("heading", { name: "Information for this drug is being prepared" }),
  ).toBeVisible();
  await expect(page.locator(".toxicity-presentation")).toHaveCount(0);
});

test("representative single drugs open separate FDA-linked qualitative pages", async ({ page }) => {
  const examples = [
    ["anastrozole", "Anastrozole (Arimidex)"],
    ["capecitabine", "Capecitabine (Xeloda)"],
    ["goserelin", "Goserelin (Zoladex)"],
    ["paclitaxel", "Paclitaxel (Taxol)"],
    ["paclitaxel-protein-bound", "Paclitaxel protein-bound (Abraxane)"],
    ["trastuzumab-deruxtecan", "Trastuzumab deruxtecan (Enhertu)"],
  ] as const;

  for (const [drugId, heading] of examples) {
    await page.goto(`/?treatment=${drugId}`);
    await expect(page.locator("body")).toHaveAttribute("data-ariad-ready", "true");
    await expect(page.getByRole("heading", { name: heading })).toBeVisible();
    await expect(page.locator(".toxicity-presentation")).toBeVisible();
    await expect(page.getByText("Ariad cannot determine the cause of a symptom.")).toBeVisible();
    const patientText = await page.locator(".toxicity-presentation").innerText();
    expect(patientText).not.toMatch(/\d+(?:\.\d+)?\s*%/u);
  }

  const sourceLinks = page.locator(".toxicity-presentation .sources-panel a");
  await expect(sourceLinks).toHaveCount(1);
  await expect(sourceLinks).toHaveAttribute("href", /dailymed\.nlm\.nih\.gov/u);
});

test("docetaxel opens a patient-only side-effect presentation without numerical frequencies", async ({
  page,
}) => {
  await page.goto("/?treatment=docetaxel");
  await expect(page.locator("body")).toHaveAttribute("data-ariad-ready", "true");

  await expect(page.getByRole("heading", { name: "Docetaxel (Taxotere)" })).toBeVisible();
  await expect(
    page.getByRole("heading", { name: "Side effects reported with docetaxel alone" }),
  ).toBeVisible();
  await expect(page.getByRole("heading", { name: "Seen in many people" })).toBeVisible();
  await expect(page.getByRole("heading", { name: "Seen in some people" })).toBeVisible();
  await expect(page.getByRole("heading", { name: "Seen in fewer people" })).toBeVisible();
  await expect(page.getByRole("heading", { name: "Changes your team checks for" })).toBeVisible();

  const effects = page.locator(".toxicity-effect");
  await expect(effects).toHaveCount(17);
  await expect(effects.first()).not.toHaveAttribute("open", "");
  await page.getByText("Hair loss", { exact: true }).click();
  await expect(effects.first()).toHaveAttribute("open", "");
  await expect(page.getByRole("heading", { name: "What you may notice" }).first()).toBeVisible();

  const patientText = await page.locator("main").innerText();
  expect(patientText).not.toMatch(/\d+(?:\.\d+)?\s*%/u);
  expect(patientText).not.toMatch(/\bgrade\s*\d+\b/iu);
  expect(patientText).not.toContain("mg/m");
  expect(patientText).not.toContain("cells/mm");
  await expect(
    page.getByRole("heading", { name: "When to contact your cancer team" }),
  ).toBeVisible();
  await expect(page.getByText(/If you think you may be experiencing a medical emergency/).first()).toBeVisible();

  await page.evaluate(() => window.dispatchEvent(new Event("beforeprint")));
  await expect(effects).toHaveCount(17);
  for (let index = 0; index < 17; index += 1) {
    await expect(effects.nth(index)).toHaveAttribute("open", "");
  }
  await expect(page.locator(".toxicity-presentation .sources-panel")).toHaveAttribute("open", "");
  await page.evaluate(() => window.dispatchEvent(new Event("afterprint")));
  await expect(effects.nth(1)).not.toHaveAttribute("open", "");
});
