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
