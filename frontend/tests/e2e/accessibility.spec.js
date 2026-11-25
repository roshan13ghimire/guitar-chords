
import { test, expect } from "@playwright/test";
import AxeBuilder from "@axe-core/playwright";

const routes = [
  "/",
  "/songs",
  "/artists",
  "/chords",
  "/learn",
  "/practice",
  "/contribute",
];

const viewports = [
  {
    name: "mobile",
    width: 375,
    height: 812,
  },
  {
    name: "desktop",
    width: 1280,
    height: 800,
  },
];

for (const viewport of viewports) {
  for (const route of routes) {
    test(`${route} accessibility on ${viewport.name}`, async ({
      page,
    }) => {
      await page.setViewportSize({
        width: viewport.width,
        height: viewport.height,
      });

      await page.goto(route);

      await expect(
        page.locator("#main-content")
      ).toBeVisible();

      await page.evaluate(
        () => document.fonts.ready
      );

      // Allow initial asynchronous content to settle.
      await page.waitForLoadState("networkidle");

      const results = await new AxeBuilder({
        page,
      })
        .withTags([
          "wcag2a",
          "wcag2aa",
          "wcag21a",
          "wcag21aa",
          "wcag22aa",
        ])
        .analyze();

      const issues = results.violations.map(
        (violation) => ({
          rule: violation.id,
          impact: violation.impact,
          description: violation.help,
          affectedElements: violation.nodes.map(
            (node) => ({
              selector: node.target,
              explanation: node.failureSummary,
            })
          ),
        })
      );

      expect(
        issues,
        `Accessibility issues on ${route} (${viewport.name}):\n${JSON.stringify(
          issues,
          null,
          2
        )}`
      ).toEqual([]);
    });
  }
}
