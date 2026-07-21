import AxeBuilder from "@axe-core/playwright";
import { expect, test } from "@playwright/test";

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
  const symptomEntry = await new AxeBuilder({ page }).analyze();
  expect(
    symptomEntry.violations.filter(
      ({ impact }) => impact === "critical" || impact === "serious",
    ),
  ).toEqual([]);
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

test("the emergency boundary stays visible without covering the page flow", async ({ page }) => {
  await page.setViewportSize({ width: 320, height: 720 });
  await page.goto("/");
  await expect(page.locator("body")).toHaveAttribute("data-ariad-ready", "true");

  const emergencyBoundary = page.locator(".emergency-boundary");
  await expect(emergencyBoundary).toHaveCSS("position", "sticky");
  await expect(emergencyBoundary).toHaveCSS("font-size", "16px");
  await page.evaluate(() => window.scrollTo(0, document.body.scrollHeight));
  await expect
    .poll(() => emergencyBoundary.evaluate((element) => Math.round(element.getBoundingClientRect().top)))
    .toBe(0);

  await expect
    .poll(() => page.evaluate(() => document.documentElement.scrollWidth <= window.innerWidth))
    .toBe(true);
});

test("live treatment results and regimen cards have no serious accessibility violations", async ({
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
    /preparation-guide/u,
  );
  await expect(page.locator(".toxicity-presentation")).toHaveCount(3);
  await expect(page.locator(".regimen-single-drug-boundary")).toHaveCount(3);
  const regimen = await new AxeBuilder({ page }).analyze();
  expect(
    regimen.violations.filter(({ impact }) => impact === "critical" || impact === "serious"),
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

  const result = await new AxeBuilder({ page }).analyze();
  expect(
    result.violations.filter(({ impact }) => impact === "critical" || impact === "serious"),
  ).toEqual([]);

  await expect
    .poll(() => page.evaluate(() => document.documentElement.scrollWidth <= window.innerWidth))
    .toBe(true);
});
