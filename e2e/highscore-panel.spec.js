const { test, expect } = require("@playwright/test");

test.describe("highscore panel", () => {
  test("visible in normal mode with setup notice when unconfigured", async ({
    page,
  }) => {
    await page.goto("/index.html", { waitUntil: "domcontentloaded" });
    await page.waitForTimeout(800);

    await expect(page.locator("#highscore-panel")).toBeVisible();

    // Score row is hidden until a game ends
    await expect(page.locator("#highscore-score-display")).toBeHidden();

    // Placeholder IDs → setup notice is shown
    await expect(page.locator("#giscus-setup-notice")).toBeVisible();
  });

  test("hidden when fullscreen-active class is set", async ({ page }) => {
    await page.goto("/index.html", { waitUntil: "domcontentloaded" });
    await page.waitForTimeout(800);

    await page.evaluate(() =>
      document.body.classList.add("fullscreen-active"),
    );

    await expect(page.locator("#highscore-panel")).toBeHidden();
  });

  test("score display appears and shows correct value after game over", async ({
    page,
  }) => {
    await page.goto("/index.html", { waitUntil: "domcontentloaded" });
    await page.waitForTimeout(500);

    // notifyHighscorePanel is a global defined in game.js
    await page.evaluate(() => {
      if (typeof notifyHighscorePanel === "function") {
        notifyHighscorePanel(1250, 2);
      }
    });

    await expect(page.locator("#highscore-score-display")).toBeVisible();
    await expect(page.locator("#highscore-score-value")).toHaveText(
      "1250 pts  (Level 2)",
    );
  });
});
