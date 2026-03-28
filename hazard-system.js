/**
 * Hazard System
 * Contains collision detection and hazard management logic
 */

class HazardSystem {
  constructor() {
    this.hazards = [];
  }

  /**
   * Initialize hazards from level definition
   * @param {Object} levelDef - Level definition containing hazards array
   */
  initializeHazards(levelDef) {
    this.hazards = [];
    if (levelDef.hazards) {
      for (const h of levelDef.hazards) {
        this.hazards.push({
          type: h.type, // "fire" or "trap"
          x: h.x,
          y: h.y,
          w: h.w || 40,
          h: h.h || 20,
          active: true,
        });
      }
    }
  }

  /**
   * Check collision between player and hazards
   * @param {Object} player - Player object with x, y, w, h properties
   * @returns {Object|null} The hazard that was hit, or null if no collision
   */
  checkCollision(player) {
    for (const h of this.hazards) {
      if (!h.active) continue;

      // Player bounding box
      const playerLeft = player.x;
      const playerRight = player.x + player.w;
      const playerTop = player.y;
      const playerBottom = player.y + player.h;

      // Hazard bounding box (centered at h.x, h.y)
      const hazardLeft = h.x - h.w / 2;
      const hazardRight = h.x + h.w / 2;
      const hazardTop = h.y - h.h;
      const hazardBottom = h.y + h.h;

      // AABB collision detection
      if (
        playerRight >= hazardLeft &&
        playerLeft <= hazardRight &&
        playerBottom >= hazardTop &&
        playerTop <= hazardBottom
      ) {
        return h;
      }
    }
    return null;
  }

  /**
   * Deactivate a hazard (after player touches it)
   * @param {Object} hazard - The hazard to deactivate
   */
  deactivateHazard(hazard) {
    hazard.active = false;
  }

  /**
   * Get all active hazards
   * @returns {Array} Array of active hazards
   */
  getActiveHazards() {
    return this.hazards.filter((h) => h.active);
  }

  /**
   * Reset all hazards to active state
   */
  resetHazards() {
    this.hazards.forEach((h) => {
      h.active = true;
    });
  }

  /**
   * Get hazard at specific coordinates (for debugging/UI)
   * @param {number} x - X position
   * @param {number} y - Y position
   * @returns {Object|null} Hazard at position or null
   */
  getHazardAt(x, y) {
    for (const h of this.hazards) {
      const hLeft = h.x - h.w / 2;
      const hRight = h.x + h.w / 2;
      const hTop = h.y - h.h;
      const hBottom = h.y + h.h;

      if (x > hLeft && x < hRight && y > hTop && y < hBottom) {
        return h;
      }
    }
    return null;
  }
}

// Export for Node.js (Jest)
if (typeof module !== "undefined" && module.exports) {
  module.exports = HazardSystem;
}
