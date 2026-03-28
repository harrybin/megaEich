/**
 * UI/HUD Rendering Module
 * Handles drawing game UI, HUD, score, lives, and notifications
 */

class UIRenderer {
  constructor(ctx, canvasWidth, canvasHeight) {
    this.ctx = ctx;
    this.W = canvasWidth;
    this.H = canvasHeight;
  }

  /**
   * Draw the HUD (heads-up display)
   * @param {number} score - Current score
   * @param {number} level - Current level
   * @param {number} lives - Remaining lives
   * @param {number} collectiblesRemaining - Collectibles left to collect
   * @param {number} mvpsRemaining - MVPs left to meet
   */
  drawHUD(score, level, lives, collectiblesRemaining, mvpsRemaining) {
    const ctx = this.ctx;
    const HUD_Y = 20;
    
    ctx.save();
    ctx.font = "bold 16px Arial";
    ctx.fillStyle = "#0FF";
    ctx.textAlign = "left";
    
    // Score
    ctx.fillText(`Score: ${score}`, 10, HUD_Y);
    
    // Level
    ctx.fillText(`Level: ${level}`, 10, HUD_Y + 25);
    
    // Lives with hearts
    ctx.fillText(`Lives: `, 10, HUD_Y + 50);
    for (let i = 0; i < lives; i++) {
      this.drawHeart(50 + i * 20, HUD_Y + 40);
    }
    
    // Items remaining info
    ctx.font = "14px Arial";
    ctx.fillStyle = "#8F8";
    ctx.fillText(`Items: ${collectiblesRemaining}`, 200, HUD_Y);
    ctx.fillText(`NPCs: ${mvpsRemaining}`, 200, HUD_Y + 25);
    
    ctx.restore();
  }

  /**
   * Draw a heart shape
   * @param {number} x - Center X
   * @param {number} y - Center Y
   */
  drawHeart(x, y) {
    const ctx = this.ctx;
    ctx.fillStyle = "#FF1493";
    ctx.beginPath();
    ctx.moveTo(x, y + 3);
    ctx.quadraticCurveTo(x - 2, y - 1, x - 4, y - 1);
    ctx.quadraticCurveTo(x - 6, y - 1, x - 6, y + 1);
    ctx.quadraticCurveTo(x - 6, y + 4, x, y + 8);
    ctx.quadraticCurveTo(x + 6, y + 4, x + 6, y + 1);
    ctx.quadraticCurveTo(x + 6, y - 1, x + 4, y - 1);
    ctx.quadraticCurveTo(x + 2, y - 1, x, y + 3);
    ctx.fill();
  }

  /**
   * Draw a notification banner
   * @param {string} text - Notification text
   * @param {number} alpha - Alpha transparency (0-1)
   */
  drawNotification(text, alpha) {
    const ctx = this.ctx;
    const bannerY = this.H - 80;
    const bannerW = 300;
    const bannerH = 40;
    const bannerX = (this.W - bannerW) / 2;
    
    ctx.save();
    ctx.globalAlpha = alpha;
    
    // Banner background
    ctx.fillStyle = "#FFA500";
    ctx.fillRect(bannerX, bannerY, bannerW, bannerH);
    
    // Border
    ctx.strokeStyle = "#FF8C00";
    ctx.lineWidth = 2;
    ctx.strokeRect(bannerX, bannerY, bannerW, bannerH);
    
    // Text
    ctx.fillStyle = "#000";
    ctx.font = "bold 16px Arial";
    ctx.textAlign = "center";
    ctx.textBaseline = "middle";
    ctx.fillText(text, this.W / 2, bannerY + bannerH / 2);
    
    ctx.restore();
  }

  /**
   * Draw a floating damage indicator
   * @param {number} x - Screen X
   * @param {number} y - Screen Y
   * @param {number} t - Time elapsed (0-1)
   * @param {string} text - Text to display (e.g., "-10")
   * @param {string} color - Color
   */
  drawFloatingText(x, y, t, text, color = "#FF0000") {
    const ctx = this.ctx;
    const yOffset = t * 20;
    const alpha = 1 - t;
    
    ctx.save();
    ctx.globalAlpha = alpha;
    ctx.font = "bold 20px Arial";
    ctx.fillStyle = color;
    ctx.textAlign = "center";
    ctx.fillText(text, x, y - yOffset);
    ctx.restore();
  }

  /**
   * Draw a level info banner
   * @param {string} title - Level title
   * @param {string} description - Level description
   * @param {number} displayTime - Time to display (0-1, where 1 is full duration)
   */
  drawLevelBanner(title, description, displayTime) {
    const ctx = this.ctx;
    
    ctx.save();
    
    // Background
    ctx.fillStyle = "rgba(0, 0, 0, 0.7)";
    ctx.fillRect(0, 0, this.W, this.H);
    
    // Title background
    ctx.fillStyle = "#1E90FF";
    ctx.fillRect(50, this.H / 2 - 60, this.W - 100, 50);
    
    // Title
    ctx.fillStyle = "#FFF";
    ctx.font = "bold 32px Arial";
    ctx.textAlign = "center";
    ctx.fillText(title, this.W / 2, this.H / 2 - 35);
    
    // Description
    ctx.font = "16px Arial";
    ctx.fillStyle = "#CFF";
    ctx.fillText(description, this.W / 2, this.H / 2 + 20);
    
    ctx.restore();
  }
}

if (typeof module !== "undefined" && module.exports) {
  module.exports = UIRenderer;
}
