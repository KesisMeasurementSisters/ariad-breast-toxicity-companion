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
  await expect(page.getByText("Information for this drug is being prepared")).toBeVisible();

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
