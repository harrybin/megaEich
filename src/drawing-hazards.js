/**
 * Hazard Rendering Module
 * Handles drawing fire and trap hazards
 */

class HazardRenderer {
  constructor(ctx) {
    this.ctx = ctx;
  }

  /**
   * Draw a fire hazard
   * @param {number} x - Screen X position
   * @param {number} y - Screen Y position
   * @param {number} w - Width
   * @param {number} h - Height
   * @param {number} tick - Game tick for animation
   */
  drawFire(x, y, w, h, tick) {
    const ctx = this.ctx;
    const flicker = Math.sin(tick * 0.15) * 4 + 2;
    const flicker2 = Math.sin(tick * 0.22 + 2) * 3;
    
    ctx.save();
    ctx.translate(x, y);

    // Left flame
    ctx.beginPath();
    ctx.moveTo(-w / 2, 0);
    ctx.quadraticCurveTo(-w / 2 - 5, -h * 0.4 + flicker, -w / 3, -h * 0.8);
    ctx.quadraticCurveTo(-w / 4, -h + flicker2, 0, -h - 2);
    ctx.quadraticCurveTo(-w / 4, -h * 0.5, -w / 2, 0);
    ctx.fillStyle = "#FF4500";
    ctx.fill();

    // Center flame
    ctx.beginPath();
    ctx.moveTo(-w / 4, 0);
    ctx.quadraticCurveTo(-w / 4 - 3, -h * 0.5 + flicker2, 0, -h * 1.2);
    ctx.quadraticCurveTo(w / 4 + 3, -h * 0.5 + flicker2, w / 4, 0);
    ctx.fillStyle = "#FF8C00";
    ctx.fill();

    // Right flame
    ctx.beginPath();
    ctx.moveTo(w / 2, 0);
    ctx.quadraticCurveTo(w / 4, -h + flicker2, w / 3, -h * 0.8);
    ctx.quadraticCurveTo(w / 2 + 5, -h * 0.4 + flicker, w / 2, 0);
    ctx.fillStyle = "#FF4500";
    ctx.fill();

    // Yellow inner flame
    ctx.beginPath();
    ctx.moveTo(-w / 3, -h * 0.2);
    ctx.quadraticCurveTo(-w / 4, -h * 0.6 + flicker * 0.5, 0, -h * 0.9);
    ctx.quadraticCurveTo(w / 4, -h * 0.6 + flicker * 0.5, w / 3, -h * 0.2);
    ctx.quadraticCurveTo(w / 4, -h * 0.4, 0, -h * 0.4);
    ctx.quadraticCurveTo(-w / 4, -h * 0.4, -w / 3, -h * 0.2);
    ctx.fillStyle = "#FFD700";
    ctx.fill();

    // Bright yellow core
    ctx.beginPath();
    ctx.ellipse(0, -h * 0.5, w * 0.25, h * 0.3, 0, 0, Math.PI * 2);
    ctx.fillStyle = "#FFFF99";
    ctx.fill();

    // Orange glow
    ctx.beginPath();
    ctx.arc(0, -h * 0.3, w * 0.9, 0, Math.PI * 2);
    ctx.fillStyle = `rgba(255, 140, 0, ${0.25 + 0.15 * (Math.sin(tick * 0.08) + 1)})`;
    ctx.fill();

    ctx.restore();
  }

  /**
   * Draw a trap hazard
   * @param {number} x - Screen X position
   * @param {number} y - Screen Y position
   * @param {number} w - Width
   * @param {number} h - Height
   * @param {number} tick - Game tick for animation
   */
  drawTrap(x, y, w, h, tick) {
    const ctx = this.ctx;
    const shake = Math.sin(tick * 0.2) * 1.5;
    
    ctx.save();
    ctx.translate(x, y + shake);

    // Metal spring trap base
    ctx.beginPath();
    ctx.rect(-w / 2, -h / 2, w, h);
    ctx.fillStyle = "#888";
    ctx.fill();
    ctx.strokeStyle = "#444";
    ctx.lineWidth = 2;
    ctx.stroke();

    // Teeth/spikes
    const spikeCount = 4;
    for (let i = 0; i < spikeCount; i++) {
      const sx = -w / 2 + (i + 0.5) * (w / spikeCount);
      ctx.beginPath();
      ctx.moveTo(sx, -h / 2);
      ctx.lineTo(sx - 3, -h / 2 - 6);
      ctx.lineTo(sx + 3, -h / 2 - 6);
      ctx.closePath();
      ctx.fillStyle = "#444";
      ctx.fill();
    }

    // Warning stripes
    ctx.fillStyle = "#FF6624";
    for (let i = 0; i < 3; i++) {
      ctx.fillRect(-w / 2 + i * (w / 3), -h / 2 + 2, w / 6, 3);
    }

    ctx.restore();
  }

  /**
   * Draw any hazard
   * @param {Object} hazard - Hazard object with type, x, y, w, h
   * @param {number} cameraX - Camera X position for screen-space conversion
   * @param {number} tick - Game tick
   */
  drawHazard(hazard, cameraX, tick) {
    const sx = hazard.x - cameraX;
    
    if (hazard.type === "fire") {
      this.drawFire(sx, hazard.y, hazard.w, hazard.h, tick);
    } else if (hazard.type === "trap") {
      this.drawTrap(sx, hazard.y, hazard.w, hazard.h, tick);
    }
  }
}

if (typeof module !== "undefined" && module.exports) {
  module.exports = HazardRenderer;
}
