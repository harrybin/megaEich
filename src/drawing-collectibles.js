/**
 * Collectibles Rendering Module
 * Handles drawing acorns, golden acorns, and power-ups
 */

class CollectiblesRenderer {
  constructor(ctx) {
    this.ctx = ctx;
  }

  /**
   * Draw a regular acorn
   * @param {number} x - Screen X position
   * @param {number} y - Screen Y position
   * @param {number} bobOffset - Bobbing animation offset (0-2π)
   * @param {number} tick - Game tick
   */
  drawAcorn(x, y, bobOffset, tick) {
    const ctx = this.ctx;
    const bobY = y + Math.sin(tick * 0.1 + bobOffset) * 3;
    
    ctx.save();
    ctx.translate(x, bobY);

    // Shadow
    ctx.fillStyle = "rgba(0, 0, 0, 0.2)";
    ctx.beginPath();
    ctx.ellipse(0, 5, 6, 2, 0, 0, Math.PI * 2);
    ctx.fill();

    // Acorn cap (brown)
    ctx.fillStyle = "#8B4513";
    ctx.beginPath();
    ctx.ellipse(0, -2, 5, 3, 0, 0, Math.PI * 2);
    ctx.fill();

    // Acorn body (dark brown, nut shape)
    ctx.fillStyle = "#654321";
    ctx.beginPath();
    ctx.ellipse(0, 3, 6, 7, 0, 0, Math.PI * 2);
    ctx.fill();

    // Highlight
    ctx.fillStyle = "#8B6914";
    ctx.beginPath();
    ctx.ellipse(-2, 0, 2, 3, 0, 0, Math.PI * 2);
    ctx.fill();

    ctx.restore();
  }

  /**
   * Draw a golden acorn (with glow and bobbing)
   * @param {number} x - Screen X position
   * @param {number} y - Screen Y position
   * @param {number} bobOffset - Bobbing animation offset
   * @param {number} tick - Game tick
   */
  drawGoldenAcorn(x, y, bobOffset, tick) {
    const ctx = this.ctx;
    const bobY = y + Math.sin(tick * 0.1 + bobOffset) * 4;
    const glowAlpha = 0.4 + 0.3 * Math.sin(tick * 0.08 + bobOffset);
    
    ctx.save();
    ctx.translate(x, bobY);

    // Glow effect
    ctx.fillStyle = `rgba(255, 215, 0, ${glowAlpha})`;
    ctx.beginPath();
    ctx.arc(0, 0, 14, 0, Math.PI * 2);
    ctx.fill();

    ctx.fillStyle = `rgba(255, 215, 0, ${glowAlpha * 0.6})`;
    ctx.beginPath();
    ctx.arc(0, 0, 20, 0, Math.PI * 2);
    ctx.fill();

    // Shadow
    ctx.fillStyle = "rgba(0, 0, 0, 0.3)";
    ctx.beginPath();
    ctx.ellipse(0, 5, 7, 2, 0, 0, Math.PI * 2);
    ctx.fill();

    // Acorn cap (golden)
    ctx.fillStyle = "#DAA520";
    ctx.beginPath();
    ctx.ellipse(0, -2, 5, 3, 0, 0, Math.PI * 2);
    ctx.fill();

    // Acorn body (bright gold, nut shape)
    ctx.fillStyle = "#FFD700";
    ctx.beginPath();
    ctx.ellipse(0, 3, 6, 7, 0, 0, Math.PI * 2);
    ctx.fill();

    // Bright highlight
    ctx.fillStyle = "#FFFF99";
    ctx.beginPath();
    ctx.ellipse(-2, 0, 2.5, 3.5, 0, 0, Math.PI * 2);
    ctx.fill();

    ctx.restore();
  }

  /**
   * Draw a power-up (rotating with glow)
   * @param {number} x - Screen X position
   * @param {number} y - Screen Y position
   * @param {number} tick - Game tick
   */
  drawPowerUp(x, y, tick) {
    const ctx = this.ctx;
    const rotation = (tick * 0.05) % (Math.PI * 2);
    const glowAlpha = 0.5 + 0.3 * Math.sin(tick * 0.1);
    
    ctx.save();
    ctx.translate(x, y);

    // Glow effect
    ctx.fillStyle = `rgba(0, 255, 200, ${glowAlpha})`;
    ctx.beginPath();
    ctx.arc(0, 0, 16, 0, Math.PI * 2);
    ctx.fill();

    ctx.fillStyle = `rgba(0, 255, 200, ${glowAlpha * 0.5})`;
    ctx.beginPath();
    ctx.arc(0, 0, 22, 0, Math.PI * 2);
    ctx.fill();

    // Shadow
    ctx.fillStyle = "rgba(0, 0, 0, 0.3)";
    ctx.beginPath();
    ctx.ellipse(0, 5, 7, 2, 0, 0, Math.PI * 2);
    ctx.fill();

    // Rotating star shape
    ctx.fillStyle = "#00FF88";
    ctx.rotate(rotation);
    this.drawStar(0, 0, 6, 10, 5);

    ctx.restore();
  }

  /**
   * Helper: Draw a star
   * @param {number} cx - Center X
   * @param {number} cy - Center Y
   * @param {number} innerRadius - Inner radius
   * @param {number} outerRadius - Outer radius
   * @param {number} points - Number of points
   */
  drawStar(cx, cy, innerRadius, outerRadius, points) {
    const ctx = this.ctx;
    ctx.beginPath();
    
    for (let i = 0; i < points * 2; i++) {
      const angle = (i * Math.PI) / points;
      const radius = i % 2 === 0 ? outerRadius : innerRadius;
      const x = cx + Math.cos(angle) * radius;
      const y = cy + Math.sin(angle) * radius;
      
      if (i === 0) {
        ctx.moveTo(x, y);
      } else {
        ctx.lineTo(x, y);
      }
    }
    
    ctx.closePath();
    ctx.fill();
  }

  /**
   * Draw any collectible
   * @param {Object} collectible - Collectible with type, x, y, bobOffset
   * @param {number} cameraX - Camera X position
   * @param {number} tick - Game tick
   */
  drawCollectible(collectible, cameraX, tick) {
    const sx = collectible.x - cameraX;
    
    if (collectible.type === "acorn") {
      this.drawAcorn(sx, collectible.y, collectible.bobOffset, tick);
    } else if (collectible.type === "golden") {
      this.drawGoldenAcorn(sx, collectible.y, collectible.bobOffset, tick);
    } else if (collectible.type === "powerup") {
      this.drawPowerUp(sx, collectible.y, tick);
    }
  }
}

if (typeof module !== "undefined" && module.exports) {
  module.exports = CollectiblesRenderer;
}
