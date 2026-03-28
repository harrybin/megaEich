const { test, expect } = require("@playwright/test");
const {
  hasActiveFullscreen,
  hasVisibleControls,
  isCanvasSizedForViewport,
  isLandscapeAdapted,
} = require("../test-utils/fullscreen-metrics");

// Use CDP to override device metrics instead of setViewportSize, which fails
// when the browser window is in fullscreen or maximized state.
async function setLandscapeViewport(page) {
  const session = await page.context().newCDPSession(page);
  await session.send("Emulation.setDeviceMetricsOverride", {
    width: 844,
    height: 390,
    deviceScaleFactor: 2.625,
    mobile: true,
    screenOrientation: { angle: 90, type: "landscapePrimary" },
  });
  await session.detach();
}

async function readMetrics(page) {
  return page.evaluate(() => {
    const controls = document.getElementById("mobile-controls");
    const canvas = document.getElementById("gameCanvas");
    const wrapper = document.getElementById("wrapper");
    const cs = getComputedStyle(controls);
    const rect = controls.getBoundingClientRect();
    const cRect = canvas.getBoundingClientRect();

    return {
      fullscreenElementId: document.fullscreenElement
        ? document.fullscreenElement.id
        : null,
      wrapperFullscreen: document.fullscreenElement === wrapper,
      pseudoFullscreen: document.body.classList.contains("pseudo-fullscreen"),
      mobileClass: document.body.classList.contains("mobile-controls-enabled"),
      controlsDisplay: cs.display,
      controlsVisibility: cs.visibility,
      controlsRect: {
        x: rect.x,
        y: rect.y,
        w: rect.width,
        h: rect.height,
      },
      canvasRect: {
        x: cRect.x,
        y: cRect.y,
        w: cRect.width,
        h: cRect.height,
      },
      viewport: {
        w: window.innerWidth,
        h: window.innerHeight,
      },
      pseudoVars: {
        vw: getComputedStyle(document.documentElement)
          .getPropertyValue("--pseudo-vw")
          .trim(),
        vh: getComputedStyle(document.documentElement)
          .getPropertyValue("--pseudo-vh")
          .trim(),
      },
    };
  });
}

test.describe("mobile fullscreen behavior", () => {
  test("native fullscreen keeps controls visible", async ({ page }) => {
    await page.goto("/index.html", { waitUntil: "domcontentloaded" });
    await page.waitForTimeout(600);

    await page.click("#fullscreen-btn");
    await page.waitForTimeout(900);

    const metrics = await readMetrics(page);
    expect(hasActiveFullscreen(metrics)).toBeTruthy();
    expect(metrics.wrapperFullscreen || metrics.pseudoFullscreen).toBeTruthy();
    expect(hasVisibleControls(metrics)).toBeTruthy();
    expect(isCanvasSizedForViewport(metrics)).toBeTruthy();
  });

  test("landscape adaptation in fullscreen", async ({ page }) => {
    await page.goto("/index.html", { waitUntil: "domcontentloaded" });
    await page.waitForTimeout(600);

    await page.click("#fullscreen-btn");
    await page.waitForTimeout(900);

    await setLandscapeViewport(page);
    await page.waitForTimeout(1200);

    const metrics = await readMetrics(page);
    expect(hasVisibleControls(metrics)).toBeTruthy();
    expect(isCanvasSizedForViewport(metrics)).toBeTruthy();
    expect(isLandscapeAdapted(metrics)).toBeTruthy();
  });

  test("pseudo fullscreen fallback keeps controls visible and adapts", async ({
    browser,
  }) => {
    const context = await browser.newContext();
    const page = await context.newPage();

    await page.addInitScript(() => {
      const noop = undefined;
      Object.defineProperty(Element.prototype, "requestFullscreen", {
        configurable: true,
        value: noop,
      });
      Object.defineProperty(Element.prototype, "webkitRequestFullscreen", {
        configurable: true,
        value: noop,
      });
      Object.defineProperty(Element.prototype, "msRequestFullscreen", {
        configurable: true,
        value: noop,
      });
      Object.defineProperty(Document.prototype, "exitFullscreen", {
        configurable: true,
        value: noop,
      });
    });

    await page.goto("http://127.0.0.1:4173/index.html", {
      waitUntil: "domcontentloaded",
    });
    await page.waitForTimeout(600);

    await page.click("#fullscreen-btn");
    await page.waitForTimeout(900);

    const entered = await readMetrics(page);
    expect(entered.pseudoFullscreen).toBeTruthy();
    expect(hasVisibleControls(entered)).toBeTruthy();

    await setLandscapeViewport(page);
    await page.waitForTimeout(1200);

    const rotated = await readMetrics(page);
    expect(rotated.pseudoFullscreen).toBeTruthy();
    expect(hasVisibleControls(rotated)).toBeTruthy();
    expect(isCanvasSizedForViewport(rotated)).toBeTruthy();
    expect(isLandscapeAdapted(rotated)).toBeTruthy();
    expect(rotated.pseudoVars.vw).toBeTruthy();
    expect(rotated.pseudoVars.vh).toBeTruthy();

    await context.close();
  });
});
