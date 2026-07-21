import AxeBuilder from "@axe-core/playwright";
import { expect, test, type Locator } from "@playwright/test";

async function expectNormalPatientCopy(locator: Locator) {
  const sizes = await locator.evaluateAll((elements) =>
    elements.map((element) => Number.parseFloat(window.getComputedStyle(element).fontSize)),
  );
  expect(sizes.length).toBeGreaterThan(0);
  expect(Math.min(...sizes)).toBeGreaterThanOrEqual(16);
}

test("home and symptom-entry screens have no automatically detectable serious violations", async ({
  page,
}) => {
  await page.goto("/");
  await expect(page.locator("body")).toHaveAttribute("data-ariad-ready", "true");

  const home = await new AxeBuilder({ page }).analyze();
  expect(
    home.violations.filter(({ impact }) => impact === "critical" || impact === "serious"),
  ).toEqual([]);

  await page.getByRole("button", { name: "I’m having a symptom" }).click();
  await expect(page.locator(".compact-symptom-boundary")).toHaveCount(1);
  await expect(page.locator(".boundary-card")).toHaveCount(0);
  const symptomEntry = await new AxeBuilder({ page }).analyze();
  expect(
    symptomEntry.violations.filter(
      ({ impact }) => impact === "critical" || impact === "serious",
    ),
  ).toEqual([]);
});

test("routine symptom questions use one compact safety boundary", async ({ page }) => {
  await page.goto("/");
  await expect(page.locator("body")).toHaveAttribute("data-ariad-ready", "true");
  await page.getByRole("button", { name: /Loose, watery bowel movements/ }).click();
  await expect(page.locator(".symptom-drug-row")).toHaveCount(18);
  await page.locator(".suggested-treatment-card").click();
  await page.getByRole("button", { name: "Continue with this treatment" }).click();

  await expect(page.locator(".compact-symptom-boundary")).toHaveCount(1);
  await expect(page.locator(".boundary-card")).toHaveCount(0);
  await expect(page.locator(".answer-list")).toBeInViewport();

  await page.getByRole("radio", { name: "Today" }).click();
  await page.evaluate(() => window.scrollTo(0, document.body.scrollHeight));
  await expect.poll(() => page.evaluate(() => window.scrollY)).toBeGreaterThan(0);
  await page.getByRole("button", { name: "Next question" }).click();
  await expect.poll(() => page.evaluate(() => window.scrollY)).toBeLessThanOrEqual(1);
  await expect(page.getByRole("heading", { name: "How many loose or watery bowel movements have you had in the past 24 hours?" })).toBeInViewport();
});

test("320px layout has no horizontal overflow and exposes a keyboard skip link", async ({ page }) => {
  await page.setViewportSize({ width: 320, height: 720 });
  await page.goto("/");
  await expect(page.locator("body")).toHaveAttribute("data-ariad-ready", "true");

  await expect
    .poll(() =>
      page.evaluate(() => document.documentElement.scrollWidth <= window.innerWidth),
    )
    .toBe(true);

  await page.keyboard.press("Tab");
  const skipLink = page.getByRole("link", { name: "Skip to main content" });
  await expect(skipLink).toBeFocused();
  await expect(skipLink).toBeVisible();
  await page.keyboard.press("Enter");
  await expect(page.locator("#main-content")).toBeFocused();
});

test("source-linked symptom drug listings are accessible and fit at 320px", async ({ page }) => {
  await page.setViewportSize({ width: 320, height: 720 });
  await page.goto("/");
  await expect(page.locator("body")).toHaveAttribute("data-ariad-ready", "true");
  await page.getByRole("button", { name: /Loose, watery bowel movements/ }).click();
  await expect(page.locator(".symptom-drug-row")).toHaveCount(18);

  const result = await new AxeBuilder({ page }).analyze();
  expect(
    result.violations.filter(({ impact }) => impact === "critical" || impact === "serious"),
  ).toEqual([]);
  await expect
    .poll(() => page.evaluate(() => document.documentElement.scrollWidth <= window.innerWidth))
    .toBe(true);
});

test("the main choices stay readable and horizontally contained", async ({ page }) => {
  for (const viewport of [
    { width: 390, height: 844 },
    { width: 1440, height: 900 },
  ]) {
    await page.setViewportSize(viewport);
    await page.goto("/");
    await expect(page.locator("body")).toHaveAttribute("data-ariad-ready", "true");

    const choiceCards = page.locator(".entry-card");
    await expect(choiceCards).toHaveCount(2);
    await expect(choiceCards.first()).toBeInViewport();
    await expect
      .poll(() =>
        choiceCards.evaluateAll((cards) =>
          cards.every((card) => {
            const bounds = card.getBoundingClientRect();
            return (
              bounds.width > 0 &&
              bounds.height > 0 &&
              bounds.left >= 0 &&
              bounds.right <= window.innerWidth
            );
          }) && document.documentElement.scrollWidth <= window.innerWidth,
        ),
      )
      .toBe(true);

    await choiceCards.last().scrollIntoViewIfNeeded();
    await expect(choiceCards.last()).toBeInViewport();
  }
});

test("moving to a new screen resets the page to its beginning", async ({ page }) => {
  await page.setViewportSize({ width: 390, height: 844 });
  await page.goto("/");
  await expect(page.locator("body")).toHaveAttribute("data-ariad-ready", "true");

  await page.evaluate(() => window.scrollTo(0, document.body.scrollHeight));
  await expect.poll(() => page.evaluate(() => window.scrollY)).toBeGreaterThan(0);
  await page.getByRole("button", { name: /I’m starting treatment/ }).click();

  await expect(page.getByRole("button", { name: "Back" })).toBeInViewport();
  await expect.poll(() => page.evaluate(() => window.scrollY)).toBe(0);
  await expect(page.locator("#main-content")).toBeFocused();
});

test("the emergency boundary sits at the page end without covering the page flow", async ({ page }) => {
  await page.setViewportSize({ width: 320, height: 720 });
  await page.goto("/");
  await expect(page.locator("body")).toHaveAttribute("data-ariad-ready", "true");

  const emergencyBoundary = page.locator(".emergency-boundary");
  await expect(emergencyBoundary).toHaveCSS("position", "static");
  await expect(emergencyBoundary).toHaveCSS("font-size", "16px");
  await expect
    .poll(() =>
      emergencyBoundary.evaluate((element) => ({
        followsMain: element.previousElementSibling?.matches("main") ?? false,
        precedesFooter: element.nextElementSibling?.matches("footer") ?? false,
      })),
    )
    .toEqual({ followsMain: true, precedesFooter: true });
  await page.evaluate(() => window.scrollTo(0, document.body.scrollHeight));
  await expect(emergencyBoundary).toBeInViewport();

  await expect
    .poll(() => page.evaluate(() => document.documentElement.scrollWidth <= window.innerWidth))
    .toBe(true);
});

test("live treatment results and regimen accordions have no serious accessibility violations", async ({
  page,
}) => {
  await page.goto("/");
  await expect(page.locator("body")).toHaveAttribute("data-ariad-ready", "true");
  await page.getByRole("button", { name: /I’m starting treatment/ }).click();
  await page.getByLabel("Drug or treatment plan").fill("TCHP");

  const search = await new AxeBuilder({ page }).analyze();
  expect(
    search.violations.filter(({ impact }) => impact === "critical" || impact === "serious"),
  ).toEqual([]);

  await page
    .getByRole("button", {
      name: /Treatment plan: TCHP: Docetaxel \+ Carboplatin \+ Trastuzumab \+ Pertuzumab/,
    })
    .click();
  await expect(page.getByRole("heading", { name: "Get ready in three steps" })).toBeVisible();
  await expect(page.locator(".preparation-step")).toHaveCount(3);
  await expect(page.locator(".preparation-guide, .side-effect-education").first()).toHaveClass(
    /side-effect-education/u,
  );
  await expect(page.locator(".toxicity-presentation")).toHaveCount(3);
  await expect(page.locator(".regimen-single-drug-boundary")).toHaveCount(3);
  const cards = page.locator(".regimen-drug-accordion");
  await expect(cards).toHaveCount(4);
  for (let index = 0; index < 4; index += 1) {
    await expect(cards.nth(index)).not.toHaveAttribute("open", "");
  }
  const collapsedRegimen = await new AxeBuilder({ page }).analyze();
  expect(
    collapsedRegimen.violations.filter(
      ({ impact }) => impact === "critical" || impact === "serious",
    ),
  ).toEqual([]);

  await cards.nth(0).locator(":scope > summary").click();
  await cards.nth(3).locator(":scope > summary").click();
  await expect(cards.nth(0).locator(".toxicity-presentation")).toBeVisible();
  await expect(cards.nth(3).locator(".information-pending")).toBeVisible();
  const expandedRegimen = await new AxeBuilder({ page }).analyze();
  expect(
    expandedRegimen.violations.filter(
      ({ impact }) => impact === "critical" || impact === "serious",
    ),
  ).toEqual([]);
});

test("weekly preparation and unknown-treatment help have no serious accessibility violations", async ({
  page,
}) => {
  await page.goto("/");
  await expect(page.locator("body")).toHaveAttribute("data-ariad-ready", "true");
  await page.getByRole("button", { name: /I’m starting treatment/ }).click();
  await page.getByLabel("Drug or treatment plan").fill("weekly paclitaxel");
  await page.getByRole("button", { name: /Treatment plan: Weekly paclitaxel/ }).click();

  const preparation = await new AxeBuilder({ page }).analyze();
  expect(
    preparation.violations.filter(
      ({ impact }) => impact === "critical" || impact === "serious",
    ),
  ).toEqual([]);

  await page.getByRole("button", { name: "Back" }).click();
  await page.getByRole("button", { name: "I don’t know my treatment" }).click();
  const unknown = await new AxeBuilder({ page }).analyze();
  expect(
    unknown.violations.filter(({ impact }) => impact === "critical" || impact === "serious"),
  ).toEqual([]);
});

test("a direct treatment link fits at 320px without saved-treatment controls", async ({ page }) => {
  await page.setViewportSize({ width: 320, height: 720 });
  await page.goto("/?treatment=weekly-paclitaxel");
  await expect(page.locator("body")).toHaveAttribute("data-ariad-ready", "true");
  await expect(page.getByRole("heading", { name: "Weekly paclitaxel" })).toBeVisible();
  await expect(page.getByRole("button", { name: "Save this treatment" })).toHaveCount(0);

  await expect
    .poll(() => page.evaluate(() => document.documentElement.scrollWidth <= window.innerWidth))
    .toBe(true);

  const directTreatment = await new AxeBuilder({ page }).analyze();
  expect(
    directTreatment.violations.filter(
      ({ impact }) => impact === "critical" || impact === "serious",
    ),
  ).toEqual([]);
});

test("three live treatment results fit at 320px without horizontal overflow", async ({ page }) => {
  await page.setViewportSize({ width: 320, height: 720 });
  await page.goto("/");
  await expect(page.locator("body")).toHaveAttribute("data-ariad-ready", "true");
  await page.getByRole("button", { name: /I’m starting treatment/ }).click();
  await page.getByLabel("Drug or treatment plan").fill("docetaxel");
  await expect(page.locator(".result-row")).toHaveCount(3);

  await expect
    .poll(() =>
      page.evaluate(() => document.documentElement.scrollWidth <= window.innerWidth),
    )
    .toBe(true);
});

test("a new single-drug patient presentation is accessible and fits at 320px", async ({ page }) => {
  await page.setViewportSize({ width: 320, height: 720 });
  await page.goto("/?treatment=capecitabine");
  await expect(page.locator("body")).toHaveAttribute("data-ariad-ready", "true");

  const result = await new AxeBuilder({ page }).analyze();
  expect(
    result.violations.filter(({ impact }) => impact === "critical" || impact === "serious"),
  ).toEqual([]);

  await expect
    .poll(() => page.evaluate(() => document.documentElement.scrollWidth <= window.innerWidth))
    .toBe(true);
});

test("the composed TCH patient presentation is accessible and fits at 320px", async ({ page }) => {
  await page.setViewportSize({ width: 320, height: 720 });
  await page.goto("/?treatment=tch");
  await expect(page.locator("body")).toHaveAttribute("data-ariad-ready", "true");
  await expect(page.locator(".toxicity-presentation")).toHaveCount(3);
  const firstDrug = page.locator(".regimen-drug-accordion").first();
  await firstDrug.locator(":scope > summary").click();
  await expect(firstDrug.locator(".toxicity-presentation")).toBeVisible();

  const result = await new AxeBuilder({ page }).analyze();
  expect(
    result.violations.filter(({ impact }) => impact === "critical" || impact === "serious"),
  ).toEqual([]);

  await expect
    .poll(() => page.evaluate(() => document.documentElement.scrollWidth <= window.innerWidth))
    .toBe(true);
});

test("meaningful patient copy is at least the normal body size", async ({ page }) => {
  await page.goto("/");
  await expect(page.locator("body")).toHaveAttribute("data-ariad-ready", "true");
  await expectNormalPatientCopy(
    page.locator(
      ".prototype-banner, .emergency-boundary, .entry-card small, .boundary-card p, .demo-card small",
    ),
  );

  await page.getByRole("button", { name: /I’m starting treatment/ }).click();
  await page.getByLabel("Drug or treatment plan").fill("docetaxel");
  await expectNormalPatientCopy(page.locator(".search-help, .result-row small, .code-panel small"));

  await page.goto("/");
  await expect(page.locator("body")).toHaveAttribute("data-ariad-ready", "true");
  await page.getByRole("button", { name: /Loose, watery bowel movements/ }).click();
  await expectNormalPatientCopy(
    page.locator(
      ".symptom-drug-listings-header p:not(.eyebrow), .suggested-treatment-card small, .suggested-treatment-card span span, .symptom-drug-list summary small, .symptom-drug-row small, .symptom-drug-row span span",
    ),
  );

  await page.goto("/?treatment=docetaxel");
  await expect(page.locator("body")).toHaveAttribute("data-ariad-ready", "true");
  await page.locator(".toxicity-effect").first().locator("summary").click();
  await expectNormalPatientCopy(
    page.locator(
      ".route-label, .cause-statement, .toxicity-frequency-group > header p, .toxicity-effect summary small, .patient-effect-block li, .toxicity-source-context",
    ),
  );

  await page.goto("/?treatment=tch");
  await expect(page.locator("body")).toHaveAttribute("data-ariad-ready", "true");
  const regimenDrug = page.locator(".regimen-drug-accordion").first();
  await regimenDrug.locator(":scope > summary").click();
  await expectNormalPatientCopy(
    page.locator(".regimen-drug-status, .regimen-single-drug-boundary p"),
  );
});
