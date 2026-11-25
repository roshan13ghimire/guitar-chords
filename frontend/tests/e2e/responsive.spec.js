
import {
  test,
  expect,
} from "@playwright/test";

const pages = [
  "/",
  "/songs",
  "/artists",
  "/chords",
  "/learn",
  "/practice",
  "/contribute",
];

const viewports = [
  { width: 320, height: 780 },
  { width: 375, height: 812 },
  { width: 768, height: 1024 },
  { width: 1280, height: 800 },
];

for (const viewport of viewports) {
  for (const route of pages) {
    test(`${route} fits ${viewport.width}px`, async ({
      page,
    }) => {
      await page.setViewportSize(viewport);

      await page.goto(route);

      await expect(
        page.locator("#main-content")
      ).toBeVisible();

      await page.evaluate(
        () => document.fonts.ready
      );

      // Allow asynchronous page content to render.
      await page.waitForTimeout(300);

      const layout = await page.evaluate(() => {
        const root = document.documentElement;

        const viewportWidth = root.clientWidth;

        const documentWidth = root.scrollWidth;

        const overflow = documentWidth - viewportWidth;

        const offenders = Array.from(
          document.querySelectorAll("body *")
        )
          .filter((element) => {
            const style = getComputedStyle(element);
            const rect = element.getBoundingClientRect();

            if (
              style.display === "none" ||
              style.visibility === "hidden" ||
              element.closest('[aria-hidden="true"]')
            ) {
              return false;
            }

            return (
              rect.right > viewportWidth + 3 &&
              rect.left < viewportWidth &&
              rect.width > 0
            );
          })
          .slice(0, 10)
          .map((element) => ({
            tag: element.tagName.toLowerCase(),
            className:
              typeof element.className === "string"
                ? element.className.slice(0, 100)
                : "",
          }));

        return {
          viewportWidth,
          documentWidth,
          overflow,
          offenders,
        };
      });

      expect(
        layout.overflow,
        `Horizontal overflow on ${route} at ${
          viewport.width
        }px:\n${JSON.stringify(
          layout,
          null,
          2
        )}`
      ).toBeLessThanOrEqual(2);
    });
  }
}
