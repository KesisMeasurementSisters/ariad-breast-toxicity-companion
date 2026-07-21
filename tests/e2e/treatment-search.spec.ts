import { expect, test } from "@playwright/test";

test.beforeEach(async ({ page }) => {
  await page.goto("/");
  await expect(page.locator("body")).toHaveAttribute("data-ariad-ready", "true");
  await page.getByRole("button", { name: /I’m starting treatment/ }).click();
});

test("search stays minimal and canonicalizes generic and brand names", async ({ page }) => {
  const search = page.getByLabel("Drug or treatment plan");

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
      name: /Drug: Capecitabine \(Xeloda\).*preparation guide/i,
    }),
  ).toBeVisible();
  await expect(
    page.getByRole("button", {
      name: /Treatment plan: CAPE: Capecitabine.*Preparation guide available/i,
    }),
  ).toBeVisible();

  await search.fill("Xeloda");
  await expect(results).toHaveCount(3);
  await expect(results.first()).toContainText("Capecitabine (Xeloda)");

  await search.fill("Veppanu");
  await expect(results).toHaveCount(1);
  await expect(results.first()).toContainText("Vepdegestrant (Veppanu)");
});

test("a weekly schedule search opens preparation before paclitaxel side effects", async ({ page }) => {
  await page.getByLabel("Drug or treatment plan").fill("weekly Taxol");

  const weekly = page.getByRole("button", {
    name: /Treatment plan: Weekly paclitaxel.*Preparation guide available/i,
  });
  await expect(weekly).toBeVisible();
  await weekly.click();

  await expect(page.getByRole("heading", { name: "Weekly paclitaxel" })).toBeVisible();
  await expect(page.getByRole("heading", { name: "Get ready for treatment" })).toBeVisible();
  await expect(page.getByText("Preparation guide", { exact: true })).toBeVisible();
  await expect(page.getByRole("heading", { name: "Your treatment at a glance" })).toBeVisible();
  await expect(page.getByRole("heading", { name: "Side-effect information" })).toBeVisible();
  await expect(
    page.getByRole("heading", { name: "Side effects reported with paclitaxel alone" }),
  ).toBeVisible();
});

test("the capecitabine code renders exact preparation and its one-drug card", async ({ page }) => {
  await page.getByLabel("Treatment code").fill("THREAD-CAPE-02");
  await page.getByRole("button", { name: "Use code" }).click();

  await expect(page.getByRole("heading", { name: "Get ready for treatment" })).toBeVisible();
  await expect(page.getByText("Preparation guide", { exact: true })).toBeVisible();
  await expect(page.getByText("Capecitabine is a cancer medicine taken as tablets.")).toBeVisible();
  await expect(page.locator(".regimen-medication-card")).toHaveCount(1);
  await expect(
    page.getByRole("heading", { name: "Capecitabine (Xeloda)" }),
  ).toBeVisible();
  await expect(
    page.getByRole("heading", { name: "Side effects reported with capecitabine alone" }),
  ).toBeVisible();
});

test("unknown-treatment help gives useful next steps and keeps the search", async ({ page }) => {
  const search = page.getByLabel("Drug or treatment plan");
  await search.fill("docetaxel");
  await page.getByRole("button", { name: "I don’t know my treatment" }).click();

  await expect(
    page.getByRole("heading", { name: "You can check a few places for the name" }),
  ).toBeVisible();
  await expect(page.getByText("Check your treatment sheet, visit details, or medicine list.")).toBeVisible();
  await expect(page.getByText("Do not guess which treatment you are receiving.")).toBeVisible();

  await page.getByRole("button", { name: /Try the treatment search/ }).click();
  await expect(page.getByLabel("Drug or treatment plan")).toHaveValue("docetaxel");
});

test("preparation can be printed and a saved treatment can be reopened from home", async ({ page }) => {
  await page.getByLabel("Drug or treatment plan").fill("weekly paclitaxel");
  await page.getByRole("button", { name: /Treatment plan: Weekly paclitaxel/ }).click();

  await page.evaluate(() => {
    window.print = () => {
      document.body.dataset.printRequested = "true";
    };
  });
  await page.getByRole("button", { name: "Print this page" }).click();
  await expect(page.locator("body")).toHaveAttribute("data-print-requested", "true");

  await page.getByRole("button", { name: "Save this treatment" }).click();
  await expect(page.getByRole("button", { name: "Saved on this device" })).toBeDisabled();
  await page.getByRole("button", { name: "Ariad home" }).click();

  await expect(page.getByRole("heading", { name: "Your saved treatments" })).toBeVisible();
  await page.getByRole("button", { name: "Open saved treatment: Weekly paclitaxel" }).click();
  await expect(page.getByRole("heading", { name: "Weekly paclitaxel" })).toBeVisible();
  await expect(page.getByRole("heading", { name: "Get ready for treatment" })).toBeVisible();
});

test("an exact drug is followed by multi-drug regimens containing it", async ({ page }) => {
  await page.getByLabel("Drug or treatment plan").fill("docetaxel");

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
  await page.getByLabel("Drug or treatment plan").fill("TC");

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
  await page.getByLabel("Drug or treatment plan").fill("TCH");

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
  await page.getByLabel("Drug or treatment plan").fill("capecitbine");

  await expect(page.getByText("Did you mean?")).toBeVisible();
  await expect(page.locator(".result-row").first()).toContainText("Capecitabine (Xeloda)");
});

test("a drug opens one drug page and a regimen opens ordered component cards", async ({ page }) => {
  const search = page.getByLabel("Drug or treatment plan");
  await search.fill("capecitabine");
  await page
    .getByRole("button", {
      name: /Drug: Capecitabine \(Xeloda\).*preparation guide/i,
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
      name: /Treatment plan: TCHP: Docetaxel \+ Carboplatin \+ Trastuzumab \+ Pertuzumab/,
    })
    .click();

  await expect(
    page.getByRole("heading", {
      name: "TCHP: Docetaxel + Carboplatin + Trastuzumab + Pertuzumab",
    }),
  ).toBeVisible();
  await expect(page.getByText("General preparation guide", { exact: true })).toBeVisible();
  await expect(page.getByRole("heading", { name: "Start with your cancer team's plan" })).toBeVisible();
  await expect(page.locator(".preparation-guide, .side-effect-education")).toHaveCount(2);
  await expect(page.locator(".preparation-guide, .side-effect-education").nth(0)).toHaveClass(
    /preparation-guide/u,
  );
  const cards = page.locator(".regimen-medication-card");
  await expect(cards).toHaveCount(4);
  await expect(cards.nth(0).locator(".regimen-medication-header h2")).toHaveText(
    "Docetaxel (Taxotere)",
  );
  await expect(cards.nth(1).locator(".regimen-medication-header h2")).toHaveText(
    "Carboplatin",
  );
  await expect(cards.nth(2).locator(".regimen-medication-header h2")).toHaveText(
    "Trastuzumab (Herceptin)",
  );
  await expect(cards.nth(3).locator(".regimen-medication-header h2")).toHaveText(
    "Pertuzumab (Perjeta)",
  );
  await expect(
    cards.nth(0).getByRole("heading", { name: "Side effects reported with docetaxel alone" }),
  ).toBeVisible();
  await expect(
    cards.nth(1).getByRole("heading", { name: "Side effects reported with carboplatin alone" }),
  ).toBeVisible();
  await expect(
    cards.nth(2).getByRole("heading", { name: "Side effects reported with trastuzumab alone" }),
  ).toBeVisible();
  await expect(
    page.getByText("Detailed side-effect information is still being prepared"),
  ).toHaveCount(1);
});

test("TCH composes independent single-drug pages without implying regimen frequencies", async ({
  page,
}) => {
  await page.goto("/?treatment=tch");
  await expect(page.locator("body")).toHaveAttribute("data-ariad-ready", "true");

  const cards = page.locator(".regimen-medication-card");
  await expect(cards).toHaveCount(3);

  const docetaxel = page.locator('[data-drug-id="docetaxel"]');
  const carboplatin = page.locator('[data-drug-id="carboplatin"]');
  const trastuzumab = page.locator('[data-drug-id="trastuzumab"]');

  await expect(
    docetaxel.getByRole("heading", { name: "Side effects reported with docetaxel alone" }),
  ).toBeVisible();
  await expect(
    trastuzumab.getByRole("heading", { name: "Side effects reported with trastuzumab alone" }),
  ).toBeVisible();
  await expect(
    carboplatin.getByRole("heading", { name: "Side effects reported with carboplatin alone" }),
  ).toBeVisible();
  await expect(page.locator(".toxicity-presentation")).toHaveCount(3);
  await expect(page.locator(".regimen-single-drug-boundary")).toHaveCount(3);
  await expect(
    page.getByText(
      "This section shows FDA information for this drug when it was studied alone. The groups do not show how often side effects happen with the full TCH treatment plan.",
    ),
  ).toHaveCount(3);

  const patientText = await page.locator("main").innerText();
  expect(patientText).not.toMatch(/\d+(?:\.\d+)?\s*%/u);
  expect(patientText).not.toMatch(/\bgrade\s*\d+\b/iu);

  const ids = await page.locator("[id]").evaluateAll((elements) =>
    elements.map((element) => element.id),
  );
  expect(new Set(ids).size).toBe(ids.length);

  const docetaxelEffects = docetaxel.locator(".toxicity-effect");
  const trastuzumabEffects = trastuzumab.locator(".toxicity-effect");
  await docetaxelEffects.first().locator("summary").click();
  await expect(docetaxelEffects.first()).toHaveAttribute("open", "");
  await expect(trastuzumabEffects.first()).not.toHaveAttribute("open", "");

  await page.evaluate(() => window.dispatchEvent(new Event("beforeprint")));
  await expect(page.locator(".toxicity-presentation details:not([open])")).toHaveCount(0);
  await page.evaluate(() => window.dispatchEvent(new Event("afterprint")));
  await expect(docetaxelEffects.first()).toHaveAttribute("open", "");
  await expect(trastuzumabEffects.first()).not.toHaveAttribute("open", "");
});

test("a catalogue drug gets general preparation while detailed side effects stay pending", async ({
  page,
}) => {
  await page.goto("/?treatment=alpelisib");
  await expect(page.locator("body")).toHaveAttribute("data-ariad-ready", "true");

  await expect(page.getByRole("heading", { name: "Alpelisib (Piqray)" })).toBeVisible();
  await expect(
    page.getByRole("heading", { name: "Get ready for treatment" }),
  ).toBeVisible();
  await expect(page.getByText("General preparation guide", { exact: true })).toBeVisible();
  await expect(
    page.getByRole("heading", { name: "Detailed side-effect information is still being prepared" }),
  ).toBeVisible();
  await expect(
    page.getByText("This notice applies only to the side-effect section.", { exact: false }),
  ).toBeVisible();
  await expect(page.locator(".toxicity-presentation")).toHaveCount(0);
});

test("carboplatin shows patient copy while keeping study methodology out of view", async ({
  page,
}) => {
  await page.goto("/?treatment=carboplatin");
  await expect(page.locator("body")).toHaveAttribute("data-ariad-ready", "true");

  await expect(page.getByRole("heading", { name: "Carboplatin", exact: true })).toBeVisible();
  await expect(
    page.getByRole("heading", { name: "Side effects reported with carboplatin alone" }),
  ).toBeVisible();
  await expect(page.getByText("Nausea or vomiting", { exact: true })).toBeVisible();
  await expect(page.getByText("Bruising or bleeding", { exact: true })).toBeVisible();
  await expect(page.getByRole("heading", { name: "Changes your team checks for" })).toBeVisible();

  const patientText = await page.locator("main").innerText();
  expect(patientText).not.toMatch(/\d+(?:\.\d+)?\s*%/u);
  expect(patientText).not.toMatch(/\bgrade\s*\d+\b/iu);
  expect(patientText).not.toMatch(/ovarian|553|table\s*[78]|denominator|mg\/m/iu);
});

test("cyclophosphamide uses FDA common and serious groups without numerical frequencies", async ({
  page,
}) => {
  await page.goto("/?treatment=cyclophosphamide");
  await expect(page.locator("body")).toHaveAttribute("data-ariad-ready", "true");

  await expect(
    page.getByRole("heading", { name: "Cyclophosphamide (Procytox)" }),
  ).toBeVisible();
  await expect(
    page.getByRole("heading", { name: "Side effects linked to cyclophosphamide" }),
  ).toBeVisible();
  await expect(page.getByRole("heading", { name: "Common effects" })).toBeVisible();
  await expect(page.getByRole("heading", { name: "Serious effects" })).toBeVisible();
  await expect(page.getByText("Hair loss", { exact: true })).toBeVisible();
  await expect(page.getByText("Fever or serious infection", { exact: true })).toBeVisible();

  const patientText = await page.locator(".toxicity-presentation").innerText();
  expect(patientText).not.toMatch(/\d+(?:\.\d+)?\s*%/u);
  expect(patientText).not.toMatch(/\bgrade\s*\d+\b/iu);
  expect(patientText).not.toMatch(/denominator|postmarketing|population|mg\/m/iu);

  await page.goto("/?treatment=tc");
  const cyclophosphamide = page.locator('[data-drug-id="cyclophosphamide"]');
  await expect(
    cyclophosphamide.getByRole("heading", { name: "Side effects linked to cyclophosphamide" }),
  ).toBeVisible();
  await expect(
    cyclophosphamide.getByText(
      "This section shows FDA information for this drug. It does not say how often these effects happen with the full TC treatment plan.",
    ),
  ).toBeVisible();
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
    await expect(page.getByText("Ariad cannot tell what is causing a symptom.")).toBeVisible();
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
  await expect(page.getByText(/If you think this is a medical emergency/).first()).toBeVisible();

  await page.evaluate(() => window.dispatchEvent(new Event("beforeprint")));
  await expect(effects).toHaveCount(17);
  for (let index = 0; index < 17; index += 1) {
    await expect(effects.nth(index)).toHaveAttribute("open", "");
  }
  await expect(page.locator(".toxicity-presentation .sources-panel")).toHaveAttribute("open", "");
  await page.evaluate(() => window.dispatchEvent(new Event("afterprint")));
  await expect(effects.nth(1)).not.toHaveAttribute("open", "");
});
