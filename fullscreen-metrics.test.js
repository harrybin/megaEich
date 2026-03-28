const {
  hasActiveFullscreen,
  hasVisibleControls,
  isCanvasSizedForViewport,
  isLandscapeAdapted,
} = require("./test-utils/fullscreen-metrics");

describe("fullscreen metrics helpers", () => {
  test("hasActiveFullscreen returns true for native fullscreen", () => {
    const metrics = {
      wrapperFullscreen: true,
      pseudoFullscreen: false,
      fullscreenElementId: "wrapper",
    };
    expect(hasActiveFullscreen(metrics)).toBe(true);
  });

  test("hasActiveFullscreen returns true for pseudo fullscreen", () => {
    const metrics = {
      wrapperFullscreen: false,
      pseudoFullscreen: true,
      fullscreenElementId: null,
    };
    expect(hasActiveFullscreen(metrics)).toBe(true);
  });

  test("hasVisibleControls returns true for visible controls", () => {
    const metrics = {
      controlsDisplay: "flex",
      controlsVisibility: "visible",
      controlsRect: { w: 390, h: 90 },
    };
    expect(hasVisibleControls(metrics)).toBe(true);
  });

  test("hasVisibleControls returns false when hidden", () => {
    const metrics = {
      controlsDisplay: "none",
      controlsVisibility: "hidden",
      controlsRect: { w: 390, h: 90 },
    };
    expect(hasVisibleControls(metrics)).toBe(false);
  });

  test("isCanvasSizedForViewport validates bounds", () => {
    const metrics = {
      canvasRect: { w: 390, h: 244 },
      viewport: { w: 390, h: 664 },
    };
    expect(isCanvasSizedForViewport(metrics)).toBe(true);
  });

  test("isLandscapeAdapted returns true when canvas covers landscape width", () => {
    const metrics = {
      canvasRect: { w: 844, h: 208 },
      viewport: { w: 844, h: 390 },
    };
    expect(isLandscapeAdapted(metrics)).toBe(true);
  });

  test("isLandscapeAdapted returns false when canvas stays narrow", () => {
    const metrics = {
      canvasRect: { w: 360, h: 200 },
      viewport: { w: 844, h: 390 },
    };
    expect(isLandscapeAdapted(metrics)).toBe(false);
  });
});

describe("fullscreen metrics helpers — edge cases", () => {
  test("hasActiveFullscreen returns false when all fields are false/null", () => {
    const metrics = {
      wrapperFullscreen: false,
      pseudoFullscreen: false,
      fullscreenElementId: null,
    };
    expect(hasActiveFullscreen(metrics)).toBe(false);
  });

  test("hasVisibleControls returns false when rect has zero width", () => {
    const metrics = {
      controlsDisplay: "flex",
      controlsVisibility: "visible",
      controlsRect: { w: 0, h: 90 },
    };
    expect(hasVisibleControls(metrics)).toBe(false);
  });

  test("hasVisibleControls returns false when rect has zero height", () => {
    const metrics = {
      controlsDisplay: "flex",
      controlsVisibility: "visible",
      controlsRect: { w: 390, h: 0 },
    };
    expect(hasVisibleControls(metrics)).toBe(false);
  });

  test("hasVisibleControls returns false when visibility is hidden even if display is flex", () => {
    const metrics = {
      controlsDisplay: "flex",
      controlsVisibility: "hidden",
      controlsRect: { w: 390, h: 90 },
    };
    expect(hasVisibleControls(metrics)).toBe(false);
  });

  test("isCanvasSizedForViewport returns false when canvas width exceeds viewport width beyond epsilon", () => {
    const metrics = {
      canvasRect: { w: 400, h: 244 },
      viewport: { w: 390, h: 664 },
    };
    expect(isCanvasSizedForViewport(metrics)).toBe(false);
  });

  test("isCanvasSizedForViewport returns false when canvas height exceeds viewport height beyond epsilon", () => {
    const metrics = {
      canvasRect: { w: 390, h: 670 },
      viewport: { w: 390, h: 664 },
    };
    expect(isCanvasSizedForViewport(metrics)).toBe(false);
  });

  test("isLandscapeAdapted returns false when orientation is portrait (vw < vh)", () => {
    const metrics = {
      canvasRect: { w: 390, h: 244 },
      viewport: { w: 390, h: 664 },
    };
    expect(isLandscapeAdapted(metrics)).toBe(false);
  });

  test("isCanvasSizedForViewport returns false for zero-size canvas", () => {
    const metrics = {
      canvasRect: { w: 0, h: 0 },
      viewport: { w: 390, h: 664 },
    };
    expect(isCanvasSizedForViewport(metrics)).toBe(false);
  });
});
