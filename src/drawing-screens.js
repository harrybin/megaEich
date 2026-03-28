/**
 * Screens Rendering Module
 * Handles drawing start screen, pause screen, level complete, and game over screens
 */

class ScreenRenderer {
  constructor(ctx, canvasWidth, canvasHeight) {
    this.ctx = ctx;
    this.W = canvasWidth;
    this.H = canvasHeight;
  }

  /**
   * Draw the start screen
   * @param {number} tick - Game tick for animations
   */
  drawStartScreen(tick) {
    const ctx = this.ctx;
    
    // Background gradient
    ctx.save();
    const gradient = ctx.createLinearGradient(0, 0, 0, this.H);
    gradient.addColorStop(0, "#1a1a2e");
    gradient.addColorStop(1, "#0f3460");
    ctx.fillStyle = gradient;
    ctx.fillRect(0, 0, this.W, this.H);

    // Stars as background
    ctx.fillStyle = "#FFF";
    for (let i = 0; i < 50; i++) {
      const x = (i * 37 + tick * 0.5) % this.W;
      const y = (i * 23) % this.H;
      ctx.fillRect(x, y, 1, 1);
    }

    // Title with animation
    const titleBounce = Math.sin(tick * 0.05) * 10;
    ctx.font = "bold 64px Arial";
    ctx.fillStyle = "#00FF00";
    ctx.textAlign = "center";
    ctx.textBaseline = "middle";
    ctx.fillText("MegaEich", this.W / 2, this.H / 3 - titleBounce);

    // Subtitle
    ctx.font = "24px Arial";
    ctx.fillStyle = "#00FFFF";
    ctx.fillText("Mega Eichhörnchen Arcade", this.W / 2, this.H / 3 + 50);

    // Blinking "Press START"
    const blink = Math.sin(tick * 0.1) > 0 ? 1 : 0.3;
    ctx.globalAlpha = blink;
    ctx.font = "28px Arial";
    ctx.fillStyle = "#FF00FF";
    ctx.fillText("Press Space to Start", this.W / 2, this.H - 100);
    
    ctx.globalAlpha = 1;

    // Instructions
    ctx.font = "14px Arial";
    ctx.fillStyle = "#CCC";
    ctx.fillText("Arrow Keys / WASD to Move • Space to Jump", this.W / 2, this.H - 60);
    ctx.fillText("Collect acorns • Meet NPCs • Avoid hazards!", this.W / 2, this.H - 35);

    ctx.restore();
  }

  /**
   * Draw the pause screen
   * @param {number} tick - Game tick for animations
   */
  drawPauseScreen(tick) {
    const ctx = this.ctx;
    
    // Semi-transparent overlay
    ctx.save();
    ctx.fillStyle = "rgba(0, 0, 0, 0.5)";
    ctx.fillRect(0, 0, this.W, this.H);

    // Pause box
    const boxW = 300;
    const boxH = 150;
    const boxX = (this.W - boxW) / 2;
    const boxY = (this.H - boxH) / 2;

    ctx.fillStyle = "#1a1a2e";
    ctx.fillRect(boxX, boxY, boxW, boxH);
    ctx.strokeStyle = "#00FF00";
    ctx.lineWidth = 3;
    ctx.strokeRect(boxX, boxY, boxW, boxH);

    // Title
    ctx.font = "bold 32px Arial";
    ctx.fillStyle = "#00FF00";
    ctx.textAlign = "center";
    ctx.fillText("PAUSED", this.W / 2, boxY + 40);

    // Blinking resume text
    const blink = Math.sin(tick * 0.1) > 0 ? 1 : 0.3;
    ctx.globalAlpha = blink;
    ctx.font = "18px Arial";
    ctx.fillStyle = "#FF00FF";
    ctx.fillText("Press P to Resume", this.W / 2, boxY + 90);
    
    ctx.globalAlpha = 1;

    ctx.restore();
  }

  /**
   * Draw the level complete screen
   * @param {number} level - Current level
   * @param {number} score - Current score
   * @param {number} bonusPoints - Level completion bonus
   * @param {number} tick - Game tick
   */
  drawLevelCompleteScreen(level, score, bonusPoints, tick) {
    const ctx = this.ctx;
    
    // Background
    ctx.save();
    const gradient = ctx.createLinearGradient(0, 0, 0, this.H);
    gradient.addColorStop(0, "#1a0033");
    gradient.addColorStop(1, "#2d0052");
    ctx.fillStyle = gradient;
    ctx.fillRect(0, 0, this.W, this.H);

    // Decorative elements
    ctx.fillStyle = "rgba(255, 215, 0, 0.1)";
    for (let i = 0; i < 20; i++) {
      const x = (i * 101 + tick * 2) % this.W;
      const y = Math.sin(tick * 0.02 + i) * 50 + this.H / 2;
      ctx.beginPath();
      ctx.arc(x, y, 3, 0, Math.PI * 2);
      ctx.fill();
    }

    // Main text
    ctx.font = "bold 56px Arial";
    ctx.fillStyle = "#FFD700";
    ctx.textAlign = "center";
    ctx.fillText("LEVEL COMPLETE!", this.W / 2, 100);

    // Stats box
    const boxW = 350;
    const boxH = 140;
    const boxX = (this.W - boxW) / 2;
    const boxY = 150;

    ctx.fillStyle = "rgba(30, 144, 255, 0.2)";
    ctx.fillRect(boxX, boxY, boxW, boxH);
    ctx.strokeStyle = "#1E90FF";
    ctx.lineWidth = 2;
    ctx.strokeRect(boxX, boxY, boxW, boxH);

    // Stats
    ctx.font = "22px Arial";
    ctx.fillStyle = "#00FF00";
    ctx.textAlign = "left";
    ctx.fillText(`Level ${level} Bonus: +${bonusPoints}`, boxX + 20, boxY + 40);
    ctx.fillText(`Total Score: ${score}`, boxX + 20, boxY + 80);

    // Next action
    const blink = Math.sin(tick * 0.1) > 0 ? 1 : 0.4;
    ctx.globalAlpha = blink;
    ctx.font = "18px Arial";
    ctx.fillStyle = "#FF00FF";
    ctx.textAlign = "center";
    ctx.fillText("Press Space for Next Level", this.W / 2, this.H - 50);
    
    ctx.globalAlpha = 1;

    ctx.restore();
  }

  /**
   * Draw the game over screen
   * @param {number} finalScore - Final score
   * @param {number} level - Level reached
   * @param {number} tick - Game tick
   */
  drawGameOverScreen(finalScore, level, tick) {
    const ctx = this.ctx;
    
    // Background - red tint
    ctx.save();
    const gradient = ctx.createLinearGradient(0, 0, 0, this.H);
    gradient.addColorStop(0, "#330000");
    gradient.addColorStop(1, "#660000");
    ctx.fillStyle = gradient;
    ctx.fillRect(0, 0, this.W, this.H);

    // Warning stripes animation
    ctx.fillStyle = "rgba(255, 100, 0, 0.1)";
    for (let i = 0; i < 10; i++) {
      const offset = (tick * 3) % 40;
      ctx.fillRect(0, i * 50 + offset, this.W, 20);
    }

    // Main text
    const scale = 1 + Math.sin(tick * 0.08) * 0.1;
    ctx.font = "bold 72px Arial";
    ctx.fillStyle = "#FF0000";
    ctx.textAlign = "center";
    ctx.save();
    ctx.scale(scale, scale);
    ctx.fillText("GAME OVER", (this.W / 2) / scale, (160) / scale);
    ctx.restore();

    // Stats
    const boxW = 350;
    const boxH = 140;
    const boxX = (this.W - boxW) / 2;
    const boxY = 220;

    ctx.fillStyle = "rgba(139, 0, 0, 0.3)";
    ctx.fillRect(boxX, boxY, boxW, boxH);
    ctx.strokeStyle = "#FF6B6B";
    ctx.lineWidth = 2;
    ctx.strokeRect(boxX, boxY, boxW, boxH);

    // Final stats
    ctx.font = "24px Arial";
    ctx.fillStyle = "#FFD700";
    ctx.textAlign = "center";
    ctx.fillText(`Final Score: ${finalScore}`, this.W / 2, boxY + 40);
    ctx.fillText(`Levels Reached: ${level}`, this.W / 2, boxY + 80);

    // Restart instruction
    const blink = Math.sin(tick * 0.1) > 0 ? 1 : 0.3;
    ctx.globalAlpha = blink;
    ctx.font = "20px Arial";
    ctx.fillStyle = "#00FF00";
    ctx.fillText("Press Space to Restart", this.W / 2, this.H - 50);
    
    ctx.globalAlpha = 1;

    ctx.restore();
  }
}

if (typeof module !== "undefined" && module.exports) {
  module.exports = ScreenRenderer;
}
