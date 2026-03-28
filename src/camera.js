/**
 * Camera Module
 * Handles camera positioning and smooth player following
 */

class Camera {
  constructor(canvasWidth, canvasHeight, worldWidth) {
    this.W = canvasWidth;
    this.H = canvasHeight;
    this.worldWidth = worldWidth;
    
    this.x = 0; // Camera position (top-left in world)
    this.targetX = 0; // Target position for smooth following
    this.smoothness = 0.08; // Interpolation factor (0-1, higher = faster)
  }

  /**
   * Update camera to follow player
   * @param {Object} player - Player object with {x, w}
   */
  update(player) {
    // Target: keep player roughly centered on screen
    const playerCenterX = player.x + player.w / 2;
    const screenCenterX = this.W / 2;
    
    // Calculate target camera X
    this.targetX = playerCenterX - screenCenterX;

    // Smooth interpolation
    this.x += (this.targetX - this.x) * this.smoothness;

    // Clamp to world bounds
    this.clamp();
  }

  /**
   * Clamp camera to world bounds (no black bars)
   */
  clamp() {
    // Don't go past left edge
    if (this.x < 0) {
      this.x = 0;
    }
    
    // Don't go past right edge
    const maxX = this.worldWidth - this.W;
    if (this.x > maxX) {
      this.x = maxX;
    }
  }

  /**
   * Get camera X position
   * @returns {number}
   */
  getX() {
    return this.x;
  }

  /**
   * Set camera X position directly (for hard cuts, not smooth)
   * @param {number} x - New X position
   */
  setX(x) {
    this.x = x;
    this.targetX = x;
    this.clamp();
  }

  /**
   * Set camera smoothness (0-1, higher = faster following)
   * @param {number} smoothness - Smoothing factor
   */
  setSmoothness(smoothness) {
    this.smoothness = Math.max(0, Math.min(1, smoothness));
  }

  /**
   * Convert world coordinate to screen coordinate
   * @param {number} worldX - World X coordinate
   * @returns {number} Screen X coordinate
   */
  toScreenX(worldX) {
    return worldX - this.x;
  }

  /**
   * Convert screen coordinate to world coordinate
   * @param {number} screenX - Screen X coordinate
   * @returns {number} World X coordinate
   */
  toWorldX(screenX) {
    return screenX + this.x;
  }

  /**
   * Check if point is visible on screen
   * @param {number} worldX - World X coordinate
   * @returns {boolean}
   */
  isVisible(worldX) {
    const screenX = this.toScreenX(worldX);
    return screenX > -50 && screenX < this.W + 50;
  }

  /**
   * Check if rectangle is visible on screen
   * @param {number} x - World X
   * @param {number} w - Width
   * @returns {boolean}
   */
  isRectVisible(x, w) {
    const left = this.toScreenX(x);
    const right = left + w;
    return right > -50 && left < this.W + 50;
  }

  /**
   * Get visible world region (for culling)
   * @returns {Object} {minX, maxX}
   */
  getVisibleRegion() {
    return {
      minX: this.x - 50,
      maxX: this.x + this.W + 50
    };
  }

  /**
   * Shake camera (for impact effects)
   * @param {number} amount - Shake intensity
   * @param {number} duration - Duration in ticks
   */
  shake(amount, duration) {
    this.shakeAmount = amount;
    this.shakeDuration = duration;
    this.shakeTimer = 0;
  }

  /**
   * Update shake effect
   */
  updateShake() {
    if (!this.shakeTimer && this.shakeTimer !== 0) return;
    
    if (this.shakeTimer < this.shakeDuration) {
      const offset = (Math.random() - 0.5) * 2 * this.shakeAmount;
      this.x += offset;
      this.clamp();
      this.shakeTimer++;
    } else {
      this.shakeTimer = null;
      this.shakeAmount = 0;
      this.shakeDuration = 0;
    }
  }

  /**
   * Focus on a specific point (hard cut, no smoothing)
   * @param {number} x - Target world X
   * @param {boolean} centerOnPoint - If true, center camera on point; else align left
   */
  focusOn(x, centerOnPoint = true) {
    if (centerOnPoint) {
      this.setX(x - this.W / 2);
    } else {
      this.setX(x);
    }
  }

  /**
   * Get camera bounds (for rendering optimization)
   * @returns {Object} {x, y, w, h}
   */
  getBounds() {
    return {
      x: this.x,
      y: 0,
      w: this.W,
      h: this.H
    };
  }

  /**
   * Reset camera
   */
  reset() {
    this.x = 0;
    this.targetX = 0;
  }

  /**
   * Check if at world edge
   * @returns {Object} {atLeft, atRight}
   */
  getEdgeState() {
    const maxX = this.worldWidth - this.W;
    return {
      atLeft: this.x <= 0,
      atRight: this.x >= maxX
    };
  }

  /**
   * Get camera progress (0-1, where 1 is at world end)
   * @returns {number}
   */
  getProgress() {
    const maxX = this.worldWidth - this.W;
    return maxX > 0 ? this.x / maxX : 0;
  }
}

export default Camera;

if (typeof module !== "undefined" && module.exports) {
  module.exports = Camera;
}
