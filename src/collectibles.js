/**
 * Collectibles Module
 * Handles collectible items (acorns, golden acorns, power-ups)
 */

class CollectiblesManager {
  constructor() {
    this.collectibles = [];
  }

  initialize(platforms, acornCount, goldenCount, powerupCount) {
    this.collectibles = [];
    const nonGround = platforms.filter((p) => !p.isGround);
    const shuffled = [...nonGround].sort(() => Math.random() - 0.5);
    let idx = 0;

    // Regular acorns
    for (let i = 0; i < acornCount; i++) {
      const p = shuffled[idx % shuffled.length];
      idx++;
      this.collectibles.push({
        type: "acorn",
        x: p.x + 30 + Math.random() * Math.max(0, p.w - 60),
        y: p.y - 24,
        collected: false,
      });
    }

    // Golden acorns
    for (let i = 0; i < goldenCount; i++) {
      const p = shuffled[idx % shuffled.length];
      idx++;
      this.collectibles.push({
        type: "golden",
        x: p.x + 20 + Math.random() * Math.max(0, p.w - 40),
        y: p.y - 28,
        collected: false,
        bobOffset: Math.random() * Math.PI * 2,
      });
    }

    // Power-ups
    for (let i = 0; i < powerupCount; i++) {
      const p = shuffled[idx % shuffled.length];
      idx++;
      this.collectibles.push({
        type: "powerup",
        x: p.x + 20 + Math.random() * Math.max(0, p.w - 40),
        y: p.y - 28,
        collected: false,
        bobOffset: Math.random() * Math.PI * 2,
      });
    }
  }

  checkCollision(playerCenterX, playerCenterY) {
    for (const c of this.collectibles) {
      if (c.collected) continue;
      if (Math.abs(playerCenterX - c.x) < 22 && Math.abs(playerCenterY - c.y) < 22) {
        c.collected = true;
        return c;
      }
    }
    return null;
  }

  allCollected() {
    return this.collectibles.every((c) => c.collected);
  }

  getRemaining() {
    return this.collectibles.filter((c) => !c.collected).length;
  }

  reset() {
    this.collectibles.forEach((c) => {
      c.collected = false;
    });
  }
}

if (typeof module !== "undefined" && module.exports) {
  module.exports = CollectiblesManager;
}
