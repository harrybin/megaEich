/**
 * MVP Rendering Module
 * Handles drawing NPC/MVP characters
 */

class MVPRenderer {
  constructor(ctx) {
    this.ctx = ctx;
  }

  /**
   * Draw an MVP character
   * @param {Object} mvp - MVP object with x, y, name, met
   * @param {number} cameraX - Camera X position
   * @param {number} tick - Game tick
   */
  drawMVP(mvp, cameraX, tick) {
    const sx = mvp.x - cameraX;
    const sy = mvp.y - 15;
    
    if (mvp.met) {
      this.drawMVPMet(sx, sy, mvp.name, tick);
    } else {
      this.drawMVPActive(sx, sy, mvp.name, tick);
    }
  }

  /**
   * Draw an active (not yet met) MVP
   * @param {number} x - Screen X
   * @param {number} y - Screen Y
   * @param {string} name - MVP name
   * @param {number} tick - Game tick
   */
  drawMVPActive(x, y, name, tick) {
    const ctx = this.ctx;
    const bounce = Math.sin(tick * 0.1) * 2;
    
    ctx.save();
    ctx.translate(x, y + bounce);

    // Glow
    ctx.fillStyle = "rgba(100, 200, 255, 0.3)";
    ctx.beginPath();
    ctx.arc(0, 0, 22, 0, Math.PI * 2);
    ctx.fill();

    this.drawCharacter(name, 0, 0, tick);

    // Name label below
    ctx.font = "bold 10px Arial";
    ctx.fillStyle = "#2AF";
    ctx.textAlign = "center";
    ctx.fillText(name, 0, 20);

    ctx.restore();
  }

  /**
   * Draw a met (already collected) MVP
   * @param {number} x - Screen X
   * @param {number} y - Screen Y
   * @param {string} name - MVP name
   * @param {number} tick - Game tick
   */
  drawMVPMet(x, y, name, tick) {
    const ctx = this.ctx;
    
    ctx.save();
    ctx.translate(x, y);
    ctx.globalAlpha = 0.4;

    this.drawCharacter(name, 0, 0, tick);

    // Checkmark
    ctx.globalAlpha = 1;
    ctx.fillStyle = "#0FF";
    ctx.font = "bold 16px Arial";
    ctx.textAlign = "center";
    ctx.fillText("✓", 0, 2);

    ctx.restore();
  }

  /**
   * Draw a character
   * @param {string} name - Character name (for styling)
   * @param {number} x - Center X
   * @param {number} y - Center Y
   * @param {number} tick - Game tick
   */
  drawCharacter(name, x, y, tick) {
    const ctx = this.ctx;
    const nameLC = name.toLowerCase();
    
    // Apply different styling based on name
    if (nameLC.includes("apple")) {
      this.drawApple(x, y);
    } else if (nameLC.includes("squirrel") || nameLC.includes("eichhorn")) {
      this.drawFriendlySquirrel(x, y, tick);
    } else if (nameLC.includes("owl")) {
      this.drawOwl(x, y, tick);
    } else if (nameLC.includes("fox")) {
      this.drawFox(x, y, tick);
    } else {
      this.drawGenericCharacter(x, y, tick);
    }
  }

  /**
   * Draw an apple character
   */
  drawApple(x, y) {
    const ctx = this.ctx;
    
    // Apple body
    ctx.fillStyle = "#DC143C";
    ctx.beginPath();
    ctx.arc(x, y, 8, 0, Math.PI * 2);
    ctx.fill();

    // Stem
    ctx.strokeStyle = "#8B4513";
    ctx.lineWidth = 2;
    ctx.beginPath();
    ctx.moveTo(x, y - 8);
    ctx.lineTo(x, y - 12);
    ctx.stroke();

    // Leaf
    ctx.fillStyle = "#228B22";
    ctx.beginPath();
    ctx.ellipse(x + 4, y - 10, 3, 5, 0.3, 0, Math.PI * 2);
    ctx.fill();

    // Shine
    ctx.fillStyle = "rgba(255, 255, 255, 0.4)";
    ctx.beginPath();
    ctx.arc(x - 3, y - 3, 2, 0, Math.PI * 2);
    ctx.fill();
  }

  /**
   * Draw a friendly squirrel character
   */
  drawFriendlySquirrel(x, y, tick) {
    const ctx = this.ctx;
    const tailWag = Math.sin(tick * 0.15) * 8;
    
    // Body
    ctx.fillStyle = "#8B4513";
    ctx.beginPath();
    ctx.ellipse(x, y, 6, 8, 0, 0, Math.PI * 2);
    ctx.fill();

    // Head
    ctx.fillStyle = "#8B4513";
    ctx.beginPath();
    ctx.arc(x, y - 8, 5, 0, Math.PI * 2);
    ctx.fill();

    // Ears
    ctx.fillStyle = "#A0522D";
    ctx.beginPath();
    ctx.ellipse(x - 2, y - 13, 1.5, 3, 0, 0, Math.PI * 2);
    ctx.fill();
    ctx.beginPath();
    ctx.ellipse(x + 2, y - 13, 1.5, 3, 0, 0, Math.PI * 2);
    ctx.fill();

    // Eyes (happy)
    ctx.fillStyle = "#000";
    ctx.beginPath();
    ctx.arc(x - 1.5, y - 8, 1, 0, Math.PI * 2);
    ctx.fill();
    ctx.beginPath();
    ctx.arc(x + 1.5, y - 8, 1, 0, Math.PI * 2);
    ctx.fill();

    // Smile
    ctx.strokeStyle = "#000";
    ctx.lineWidth = 0.5;
    ctx.beginPath();
    ctx.arc(x, y - 7, 2, 0, Math.PI);
    ctx.stroke();

    // Tail
    ctx.strokeStyle = "#A0522D";
    ctx.lineWidth = 2;
    ctx.beginPath();
    ctx.moveTo(x + 4, y);
    ctx.quadraticCurveTo(x + 8 + tailWag, y - 4, x + 10 + tailWag, y - 8);
    ctx.stroke();
  }

  /**
   * Draw an owl character
   */
  drawOwl(x, y, tick) {
    const ctx = this.ctx;
    const blink = Math.sin(tick * 0.05) > 0.9 ? 0.1 : 1;
    
    // Body
    ctx.fillStyle = "#8B7355";
    ctx.beginPath();
    ctx.ellipse(x, y + 2, 7, 8, 0, 0, Math.PI * 2);
    ctx.fill();

    // Head
    ctx.fillStyle = "#8B7355";
    ctx.beginPath();
    ctx.arc(x, y - 6, 6, 0, Math.PI * 2);
    ctx.fill();

    // Ear tufts
    ctx.fillStyle = "#654321";
    this.drawTriangle(x - 3, y - 12, 2, 4, false);
    this.drawTriangle(x + 3, y - 12, 2, 4, true);

    // Eyes (large)
    ctx.fillStyle = "#FFD700";
    ctx.beginPath();
    ctx.arc(x - 2, y - 6, 2.5, 0, Math.PI * 2);
    ctx.fill();
    ctx.beginPath();
    ctx.arc(x + 2, y - 6, 2.5, 0, Math.PI * 2);
    ctx.fill();

    // Pupils
    ctx.fillStyle = "#000";
    const pupilScale = blink;
    ctx.beginPath();
    ctx.arc(x - 2, y - 6, 1.2 * pupilScale, 0, Math.PI * 2);
    ctx.fill();
    ctx.beginPath();
    ctx.arc(x + 2, y - 6, 1.2 * pupilScale, 0, Math.PI * 2);
    ctx.fill();

    // Beak
    ctx.fillStyle = "#FF8C00";
    this.drawTriangle(x, y - 4, 1.5, 2, false);
  }

  /**
   * Draw a fox character
   */
  drawFox(x, y, tick) {
    const ctx = this.ctx;
    
    // Body
    ctx.fillStyle = "#FF6347";
    ctx.beginPath();
    ctx.ellipse(x - 1, y + 2, 6, 8, 0, 0, Math.PI * 2);
    ctx.fill();

    // Head
    ctx.fillStyle = "#FF6347";
    ctx.beginPath();
    ctx.arc(x, y - 6, 6, 0, Math.PI * 2);
    ctx.fill();

    // Ears
    ctx.fillStyle = "#FF6347";
    this.drawTriangle(x - 3, y - 11, 2, 4, false);
    this.drawTriangle(x + 3, y - 11, 2, 4, true);

    // Inner ear
    ctx.fillStyle = "#FFB6C1";
    this.drawTriangle(x - 3, y - 11, 1, 2, false);
    this.drawTriangle(x + 3, y - 11, 1, 2, true);

    // Snout
    ctx.fillStyle = "#FFA07A";
    ctx.beginPath();
    ctx.ellipse(x, y - 5, 3, 2, 0, 0, Math.PI * 2);
    ctx.fill();

    // Eyes
    ctx.fillStyle = "#000";
    ctx.beginPath();
    ctx.arc(x - 1.5, y - 7, 1, 0, Math.PI * 2);
    ctx.fill();
    ctx.beginPath();
    ctx.arc(x + 1.5, y - 7, 1, 0, Math.PI * 2);
    ctx.fill();

    // Nose
    ctx.fillStyle = "#000";
    ctx.beginPath();
    ctx.arc(x, y - 5, 0.5, 0, Math.PI * 2);
    ctx.fill();

    // Tail
    ctx.strokeStyle = "#FF6347";
    ctx.lineWidth = 2;
    ctx.beginPath();
    ctx.moveTo(x - 5, y + 4);
    ctx.quadraticCurveTo(x - 10, y + 2, x - 12, y - 2);
    ctx.stroke();
  }

  /**
   * Draw a generic character
   */
  drawGenericCharacter(x, y, tick) {
    const ctx = this.ctx;
    
    // Body
    ctx.fillStyle = "#4169E1";
    ctx.beginPath();
    ctx.ellipse(x, y, 5, 7, 0, 0, Math.PI * 2);
    ctx.fill();

    // Head
    ctx.fillStyle = "#4169E1";
    ctx.beginPath();
    ctx.arc(x, y - 8, 4, 0, Math.PI * 2);
    ctx.fill();

    // Eyes
    ctx.fillStyle = "#FFF";
    ctx.beginPath();
    ctx.arc(x - 1, y - 8, 1, 0, Math.PI * 2);
    ctx.fill();
    ctx.beginPath();
    ctx.arc(x + 1, y - 8, 1, 0, Math.PI * 2);
    ctx.fill();

    // Pupils
    ctx.fillStyle = "#000";
    ctx.beginPath();
    ctx.arc(x - 1, y - 8, 0.5, 0, Math.PI * 2);
    ctx.fill();
    ctx.beginPath();
    ctx.arc(x + 1, y - 8, 0.5, 0, Math.PI * 2);
    ctx.fill();
  }

  /**
   * Helper: Draw a triangle
   */
  drawTriangle(x, y, baseWidth, height, pointRight) {
    const ctx = this.ctx;
    const halfW = baseWidth / 2;
    
    ctx.beginPath();
    if (pointRight) {
      ctx.moveTo(x - halfW, y);
      ctx.lineTo(x - halfW, y + height);
      ctx.lineTo(x + halfW, y + height / 2);
    } else {
      ctx.moveTo(x + halfW, y);
      ctx.lineTo(x + halfW, y + height);
      ctx.lineTo(x - halfW, y + height / 2);
    }
    ctx.closePath();
    ctx.fill();
  }
}

if (typeof module !== "undefined" && module.exports) {
  module.exports = MVPRenderer;
}
