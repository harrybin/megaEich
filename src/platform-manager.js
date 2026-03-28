/**
 * Platform Manager Module
 * Handles platform data, collision detection, and spatial queries
 */

class PlatformManager {
  constructor() {
    this.platforms = [];
  }

  /**
   * Set platforms for the current level
   * @param {Array} platforms - Array of platform objects {x, y, w, h}
   */
  setPlatforms(platforms) {
    this.platforms = platforms || [];
  }

  /**
   * Find platform below a given point
   * @param {number} x - X coordinate (player center)
   * @param {number} y - Y coordinate (player bottom)
   * @returns {Object|null} Platform object or null if none found
   */
  findPlatformBelow(x, y) {
    // Check platforms from bottom to top (reverse order for correct priority)
    for (let i = this.platforms.length - 1; i >= 0; i--) {
      const p = this.platforms[i];
      
      // Check if x is within platform bounds
      if (x >= p.x && x <= p.x + p.w) {
        // Check if player is just above or at platform top
        if (y >= p.y && y <= p.y + 5) {
          return p;
        }
      }
    }
    
    return null;
  }

  /**
   * Check if player would collide with any platform moving down
   * @param {Object} player - Player object {x, y, w, h, vx, vy}
   * @returns {Object|null} Platform being stood on or null
   */
  checkPlatformCollision(player) {
    const playerLeft = player.x;
    const playerRight = player.x + player.w;
    const playerBottom = player.y + player.h;
    const playerTop = player.y;

    // Check each platform
    for (const p of this.platforms) {
      // Horizontal overlap?
      const hOverlap = playerRight > p.x && playerLeft < p.x + p.w;
      
      // Vertical collision (from above)?
      const playerWasAbove = playerBottom - player.vy <= p.y;
      const playerIsNowBelow = playerBottom > p.y;
      const vOverlap = playerWasAbove && playerIsNowBelow;

      if (hOverlap && vOverlap && player.vy >= 0) {
        return p;
      }
    }

    return null;
  }

  /**
   * Get all platforms  
   * @returns {Array}
   */
  getPlatforms() {
    return this.platforms;
  }

  /**
   * Get platform count
   * @returns {number}
   */
  getPlatformCount() {
    return this.platforms.length;
  }

  /**
   * Find all platforms at a given X position (for spatial queries)
   * @param {number} x - X coordinate
   * @param {number} tolerance - Pixel tolerance
   * @returns {Array} Array of platforms at that X
   */
  getPlatformsAtX(x, tolerance = 50) {
    return this.platforms.filter(p => {
      return Math.abs(p.x + p.w / 2 - x) <= tolerance;
    });
  }

  /**
   * Get nearest platform to a point
   * @param {number} x - X coordinate
   * @param {number} y - Y coordinate
   * @returns {Object|null} Nearest platform or null
   */
  getNearestPlatform(x, y) {
    if (this.platforms.length === 0) return null;

    let nearest = this.platforms[0];
    let minDist = Math.hypot(
      x - (nearest.x + nearest.w / 2),
      y - (nearest.y + nearest.h / 2)
    );

    for (const p of this.platforms) {
      const dx = x - (p.x + p.w / 2);
      const dy = y - (p.y + p.h / 2);
      const dist = Math.hypot(dx, dy);
      
      if (dist < minDist) {
        minDist = dist;
        nearest = p;
      }
    }

    return nearest;
  }

  /**
   * Get platform bounding box (world bounds of all platforms)
   * @returns {Object} {x, y, w, h} or null if no platforms
   */
  getBoundingBox() {
    if (this.platforms.length === 0) return null;

    let minX = Infinity, maxX = -Infinity;
    let minY = Infinity, maxY = -Infinity;

    for (const p of this.platforms) {
      minX = Math.min(minX, p.x);
      maxX = Math.max(maxX, p.x + p.w);
      minY = Math.min(minY, p.y);
      maxY = Math.max(maxY, p.y + p.h);
    }

    return {
      x: minX,
      y: minY,
      w: maxX - minX,
      h: maxY - minY
    };
  }

  /**
   * Check if position is on solid ground (on any platform)
   * @param {number} x - X coordinate (player center)
   * @param {number} y - Y coordinate (player bottom)
   * @param {number} tolerance - How close to platform top
   * @returns {boolean}
   */
  isOnGround(x, y, tolerance = 5) {
    return this.findPlatformBelow(x, y) !== null;
  }

  /**
   * Get all platforms within a rectangular region
   * @param {number} x - Left X
   * @param {number} y - Top Y
   * @param {number} w - Width
   * @param {number} h - Height
   * @returns {Array} Platforms in region
   */
  getPlatformsInRegion(x, y, w, h) {
    return this.platforms.filter(p => {
      // AABB collision detection
      return !(p.x + p.w < x || p.x > x + w ||
               p.y + p.h < y || p.y > y + h);
    });
  }

  /**
   * Clear all platforms
   */
  clear() {
    this.platforms = [];
  }
}

if (typeof module !== "undefined" && module.exports) {
  module.exports = PlatformManager;
}
