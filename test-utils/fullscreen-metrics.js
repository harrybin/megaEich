"use strict";

function hasActiveFullscreen(metrics) {
  if (!metrics) return false;
  return Boolean(
    metrics.wrapperFullscreen ||
    metrics.pseudoFullscreen ||
    metrics.fullscreenElementId,
  );
}

function hasVisibleControls(metrics) {
  if (!metrics || !metrics.controlsRect) return false;
  const displayOk = metrics.controlsDisplay !== "none";
  const visibleOk = metrics.controlsVisibility !== "hidden";
  return (
    displayOk &&
    visibleOk &&
    Number(metrics.controlsRect.w) > 0 &&
    Number(metrics.controlsRect.h) > 0
  );
}

function isCanvasSizedForViewport(metrics, epsilon = 2) {
  if (!metrics || !metrics.canvasRect || !metrics.viewport) return false;
  const w = Number(metrics.canvasRect.w);
  const h = Number(metrics.canvasRect.h);
  const vw = Number(metrics.viewport.w);
  const vh = Number(metrics.viewport.h);
  if (w <= 0 || h <= 0 || vw <= 0 || vh <= 0) return false;
  return w <= vw + epsilon && h <= vh + epsilon;
}

function isLandscapeAdapted(metrics) {
  if (!metrics || !metrics.canvasRect || !metrics.viewport) return false;
  const vw = Number(metrics.viewport.w);
  const vh = Number(metrics.viewport.h);
  const cw = Number(metrics.canvasRect.w);
  const ch = Number(metrics.canvasRect.h);
  if (vw <= vh) return false;
  if (cw <= 0 || ch <= 0) return false;

  const widthCoverage = cw / vw;
  return widthCoverage >= 0.9 && ch <= vh;
}

module.exports = {
  hasActiveFullscreen,
  hasVisibleControls,
  isCanvasSizedForViewport,
  isLandscapeAdapted,
};
