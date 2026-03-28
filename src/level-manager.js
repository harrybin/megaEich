/**
 * Level Manager Module
 * Handles level loading, progression, and data management
 */

class LevelManager {
  constructor() {
    this.currentLevel = 1;
    this.levelData = null;
    this.platforms = [];
    this.collectibles = [];
    this.hazards = [];
    this.mvps = [];
  }

  /**
   * Initialize with level definitions (from levels.js)
   * @param {Array} levelDefs - Array of level definition objects from levels.js
   */
  initialize(levelDefs) {
    this.levelDefs = levelDefs;
  }

  /**
   * Load a specific level
   * @param {number} levelNum - Level number (1-indexed)
   * @returns {Object} Level data with platforms, collectibles, hazards, mvps
   */
  loadLevel(levelNum) {
    // Wrap around if beyond available levels
    const levelIndex = (levelNum - 1) % this.levelDefs.length;
    this.currentLevel = levelNum;
    this.levelData = this.levelDefs[levelIndex];

    // Initialize arrays from level definition
    this.platforms = this.createPlatforms(this.levelData);
    this.collectibles = this.createCollectibles(this.levelData);
    this.hazards = this.createHazards(this.levelData);
    this.mvps = this.createMVPs(this.levelData);

    return {
      platforms: this.platforms,
      collectibles: this.collectibles,
      hazards: this.hazards,
      mvps: this.mvps,
      levelData: this.levelData
    };
  }

  /**
   * Create platform array from level definition
   * @param {Object} levelData - Level definition
   * @returns {Array} Platforms array
   */
  createPlatforms(levelData) {
    const platforms = [];
    
    if (levelData.platforms && Array.isArray(levelData.platforms)) {
      for (const p of levelData.platforms) {
        platforms.push({
          x: p.x,
          y: p.y,
          w: p.w,
          h: p.h
        });
      }
    }
    
    return platforms;
  }

  /**
   * Create collectibles from level definition
   * @param {Object} levelData - Level definition
   * @returns {Array} Collectibles array
   */
  createCollectibles(levelData) {
    const collectibles = [];
    const platforms = levelData.platforms || [];

    // Shuffle platforms for variety
    const shuffled = [...platforms].sort(() => Math.random() - 0.5);

    // Place acorns
    const acornCount = levelData.acorns || 5;
    for (let i = 0; i < acornCount && i < shuffled.length; i++) {
      collectibles.push({
        type: "acorn",
        x: shuffled[i].x + shuffled[i].w / 2,
        y: shuffled[i].y - 30,
        collected: false,
        bobOffset: Math.random() * Math.PI * 2
      });
    }

    // Place golden acorns
    const goldenCount = levelData.golden || 2;
    for (let i = acornCount; i < acornCount + goldenCount && i < shuffled.length; i++) {
      collectibles.push({
        type: "golden",
        x: shuffled[i].x + shuffled[i].w / 2,
        y: shuffled[i].y - 30,
        collected: false,
        bobOffset: Math.random() * Math.PI * 2
      });
    }

    // Place power-ups
    const powerupCount = levelData.powerups || 1;
    for (let i = acornCount + goldenCount; i < acornCount + goldenCount + powerupCount && i < shuffled.length; i++) {
      collectibles.push({
        type: "powerup",
        x: shuffled[i].x + shuffled[i].w / 2,
        y: shuffled[i].y - 30,
        collected: false
      });
    }

    return collectibles;
  }

  /**
   * Create hazards from level definition
   * @param {Object} levelData - Level definition
   * @returns {Array} Hazards array
   */
  createHazards(levelData) {
    const hazards = [];

    if (levelData.hazards && Array.isArray(levelData.hazards)) {
      for (const h of levelData.hazards) {
        hazards.push({
          type: h.type,
          x: h.x,
          y: h.y,
          w: h.w,
          h: h.h,
          active: true
        });
      }
    }

    return hazards;
  }

  /**
   * Create MVPs from level definition and MVP names
   * @param {Object} levelData - Level definition
   * @returns {Array} MVPs array
   */
  createMVPs(levelData) {
    const mvps = [];
    const mvpNames = [
      "Apple",
      "Friendly Squirrel",
      "Owl",
      "Fox",
      "Badger",
      "Hedgehog"
    ];

    const mvpCount = levelData.mvpCount || 2;
    const platforms = levelData.platforms || [];
    const shuffled = [...platforms].sort(() => Math.random() - 0.5);

    for (let i = 0; i < mvpCount && i < shuffled.length && i < mvpNames.length; i++) {
      mvps.push({
        name: mvpNames[i],
        x: shuffled[i].x + shuffled[i].w / 2,
        y: shuffled[i].y - 40,
        met: false
      });
    }

    return mvps;
  }

  /**
   * Get next level number
   * @returns {number} Next level
   */
  getNextLevel() {
    return this.currentLevel + 1;
  }

  /**
   * Calculate level completion bonus
   * @returns {number} Bonus points (level * 500)
   */
  getLevelBonusPoints() {
    return this.currentLevel * 500;
  }

  /**
   * Check if all collectibles are collected
   * @returns {boolean}
   */
  allCollectiblesCollected() {
    return this.collectibles.every(c => c.collected);
  }

  /**
   * Check if all MVPs are met
   * @returns {boolean}
   */
  allMVPsMet() {
    return this.mvps.every(m => m.met);
  }

  /**
   * Get count of uncollected items
   * @returns {number}
   */
  getUncollectedCount() {
    return this.collectibles.filter(c => !c.collected).length;
  }

  /**
   * Get count of unmet MVPs
   * @returns {number}
   */
  getUnmetMVPCount() {
    return this.mvps.filter(m => !m.met).length;
  }

  /**
   * Get level info/description
   * @returns {string}
   */
  getLevelDescription() {
    if (this.levelData.description) {
      return this.levelData.description;
    }
    return `Level ${this.currentLevel}`;
  }

  /**
   * Get level title
   * @returns {string}
   */
  getLevelTitle() {
    if (this.levelData.title) {
      return this.levelData.title;
    }
    return `Level ${this.currentLevel}`;
  }
}

if (typeof module !== "undefined" && module.exports) {
  module.exports = LevelManager;
}
