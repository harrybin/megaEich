/**
 * Drawing Utilities Module
 * Common drawing helpers and utilities
 */

class DrawingUtils {
  constructor(ctx) {
    this.ctx = ctx;
  }

  /**
   * Draw a rounded rectangle
   * @param {number} x - X position
   * @param {number} y - Y position
   * @param {number} w - Width
   * @param {number} h - Height
   * @param {number} r - Corner radius
   * @param {string} fillColor - Fill color (optional)
   * @param {string} strokeColor - Stroke color (optional)
   */
  roundRect(x, y, w, h, r, fillColor, strokeColor) {
    this.ctx.beginPath();
    this.ctx.moveTo(x + r, y);
    this.ctx.lineTo(x + w - r, y);
    this.ctx.arcTo(x + w, y, x + w, y + r, r);
    this.ctx.lineTo(x + w, y + h - r);
    this.ctx.arcTo(x + w, y + h, x + w - r, y + h, r);
    this.ctx.lineTo(x + r, y + h);
    this.ctx.arcTo(x, y + h, x, y + h - r, r);
    this.ctx.lineTo(x, y + r);
    this.ctx.arcTo(x, y, x + r, y, r);
    this.ctx.closePath();

    if (fillColor) {
      this.ctx.fillStyle = fillColor;
      this.ctx.fill();
    }
    if (strokeColor) {
      this.ctx.strokeStyle = strokeColor;
      this.ctx.lineWidth = 2;
      this.ctx.stroke();
    }
  }

  /**
   * Save canvas state
   */
  save() {
    this.ctx.save();
  }

  /**
   * Restore canvas state
   */
  restore() {
    this.ctx.restore();
  }

  /**
   * Translate and optional scale
   */
  translate(x, y, scale = 1) {
    this.ctx.translate(x, y);
    if (scale !== 1) {
      this.ctx.scale(scale, scale);
    }
  }

  /**
   * Set global alpha for transparency
   */
  setAlpha(alpha) {
    this.ctx.globalAlpha = alpha;
  }

  /**
   * Reset global alpha to fully opaque
   */
  resetAlpha() {
    this.ctx.globalAlpha = 1;
  }
}

if (typeof module !== "undefined" && module.exports) {
  module.exports = DrawingUtils;
}
