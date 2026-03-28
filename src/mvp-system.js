/**
 * MVP System Module
 * Handles MVP character encounters
 */

class MVPSystem {
  constructor(mvpNames) {
    this.mvps = [];
    this.mvpNames = mvpNames;
  }

  initialize(platforms) {
    const nonGround = platforms.filter((p) => !p.isGround);
    const mvpPool = [...nonGround].sort(() => Math.random() - 0.5);
    const namePool = [...this.mvpNames].sort(() => Math.random() - 0.5);
    this.mvps = [];
  }

  addMVP(x, y, name, count) {
    this.mvps.push({
      x: x,
      y: y,
      name: name,
      met: false,
      w: 30,
      h: 50,
      bounceTimer: Math.random() * Math.PI * 2,
    });
  }

  populate(platforms, count) {
    this.mvps = [];
    const nonGround = platforms.filter((p) => !p.isGround);
    const mvpPool = [...nonGround].sort(() => Math.random() - 0.5);
    const namePool = [...this.mvpNames].sort(() => Math.random() - 0.5);

    for (let i = 0; i < count; i++) {
      const p = mvpPool[i % mvpPool.length];
      this.mvps.push({
        x: p.x + p.w / 2,
        y: p.y - 50,
        name: namePool[i % namePool.length],
        met: false,
        w: 30,
        h: 50,
        bounceTimer: Math.random() * Math.PI * 2,
      });
    }
  }

  checkCollision(playerCenterX, playerCenterY) {
    for (const m of this.mvps) {
      if (m.met) continue;
      const mvpCx = m.x;
      const mvpCy = m.y + m.h / 2;
      if (Math.abs(playerCenterX - mvpCx) < 36 && Math.abs(playerCenterY - mvpCy) < 40) {
        m.met = true;
        return m;
      }
    }
    return null;
  }

  allMet() {
    return this.mvps.every((m) => m.met);
  }

  getMetCount() {
    return this.mvps.filter((m) => m.met).length;
  }

  reset() {
    this.mvps.forEach((m) => {
      m.met = false;
    });
  }
}

if (typeof module !== "undefined" && module.exports) {
  module.exports = MVPSystem;
}
