/**
 * Background Rendering Module
 * Handles drawing parallax background, stars, moon, and terrain
 */

class BackgroundRenderer {
  constructor(ctx, canvasWidth, canvasHeight) {
    this.ctx = ctx;
    this.W = canvasWidth;
    this.H = canvasHeight;
  }

  /**
   * Draw the night sky background
   */
  drawSky() {
    const ctx = this.ctx;
    
    // Gradient sky from dark to lighter blue
    const gradient = ctx.createLinearGradient(0, 0, 0, this.H * 0.6);
    gradient.addColorStop(0, "#0a0e27");
    gradient.addColorStop(1, "#1a3a4a");
    
    ctx.fillStyle = gradient;
    ctx.fillRect(0, 0, this.W, this.H * 0.6);

    // Lower sky
    ctx.fillStyle = "#1a3a4a";
    ctx.fillRect(0, this.H * 0.6, this.W, this.H * 0.4);
  }

  /**
   * Draw stars with parallax
   * @param {number} cameraX - Camera X position
   * @param {number} tick - Game tick
   */
  drawStars(cameraX, tick) {
    const ctx = this.ctx;
    const parallaxX = cameraX * 0.18;

    ctx.fillStyle = "#FFF";
    
    // Create pseudo-random stars
    for (let i = 0; i < 100; i++) {
      const seed = i * 12.7;
      const x = ((seed * 73) % this.W - parallaxX) % this.W;
      if (x < 0) return; // Skip if off-screen
      
      const y = ((seed * 91) % (this.H * 0.5)) + 10;
      const size = ((seed * 17) % 2) + 0.5;
      
      // Twinkling effect
      const twinkle = Math.sin(tick * 0.02 + seed) * 0.5 + 0.5;
      ctx.globalAlpha = twinkle;
      ctx.beginPath();
      ctx.arc(x, y, size, 0, Math.PI * 2);
      ctx.fill();
    }
    
    ctx.globalAlpha = 1;
  }

  /**
   * Draw the moon
   * @param {number} cameraX - Camera X position
   * @param {number} tick - Game tick
   */
  drawMoon(cameraX, tick) {
    const ctx = this.ctx;
    const moonX = (this.W * 0.75 - cameraX * 0.15) % (this.W * 1.5);
    const moonY = this.H * 0.15;
    const moonRadius = 30;

    ctx.save();
    ctx.globalAlpha = 0.9;

    // Moon body
    ctx.fillStyle = "#F4F1DE";
    ctx.beginPath();
    ctx.arc(moonX, moonY, moonRadius, 0, Math.PI * 2);
    ctx.fill();

    // Craters
    ctx.fillStyle = "#D4D1C4";
    for (let i = 0; i < 3; i++) {
      const cx = moonX + Math.cos(i) * moonRadius * 0.5;
      const cy = moonY + Math.sin(i) * moonRadius * 0.5;
      const cr = moonRadius * (0.3 + i * 0.15);
      ctx.beginPath();
      ctx.arc(cx, cy, cr, 0, Math.PI * 2);
      ctx.fill();
    }

    // Glow
    ctx.globalAlpha = 0.15;
    ctx.fillStyle = "#F4F1DE";
    ctx.beginPath();
    ctx.arc(moonX, moonY, moonRadius + 15, 0, Math.PI * 2);
    ctx.fill();

    ctx.restore();
  }

  /**
   * Draw trees in the background with parallax
   * @param {number} cameraX - Camera X position
   */
  drawTrees(cameraX) {
    const ctx = this.ctx;
    const parallaxX = cameraX * 0.4;
    const treeSpacing = 200;
    const startTree = Math.floor(parallaxX / treeSpacing);

    for (let i = startTree - 2; i <= startTree + 5; i++) {
      const treeX = i * treeSpacing - parallaxX;
      const treeY = this.H * 0.55;
      
      if (treeX > -100 && treeX < this.W + 100) {
        this.drawTree(treeX, treeY, 40 + (i % 3) * 15);
      }
    }
  }

  /**
   * Draw a single tree
   * @param {number} x - X position
   * @param {number} y - Y position
   * @param {number} height - Tree height
   */
  drawTree(x, y, height) {
    const ctx = this.ctx;
    
    ctx.save();

    // Trunk
    ctx.fillStyle = "#654321";
    ctx.fillRect(x - height * 0.1, y, height * 0.2, height * 0.4);

    // Foliage layers
    ctx.fillStyle = "#1a4d1a";
    
    // Layer 1 (bottom, larger)
    ctx.beginPath();
    ctx.arc(x, y - height * 0.15, height * 0.35, 0, Math.PI * 2);
    ctx.fill();

    // Layer 2 (middle)
    ctx.beginPath();
    ctx.arc(x - height * 0.2, y - height * 0.35, height * 0.25, 0, Math.PI * 2);
    ctx.fill();
    ctx.beginPath();
    ctx.arc(x + height * 0.2, y - height * 0.35, height * 0.25, 0, Math.PI * 2);
    ctx.fill();

    // Layer 3 (top, smaller)
    ctx.fillStyle = "#0d2d0d";
    ctx.beginPath();
    ctx.arc(x, y - height * 0.55, height * 0.15, 0, Math.PI * 2);
    ctx.fill();

    ctx.restore();
  }

  /**
   * Draw ground platforms with visual layer
   * @param {number} cameraX - Camera X position
   * @param {Array} platforms - Platform array
   */
  drawGround(cameraX, platforms) {
    const ctx = this.ctx;

    // Draw each platform
    for (const platform of platforms) {
      const sx = platform.x - cameraX;
      const sy = platform.y;

      // Platform main body
      ctx.fillStyle = "#4a4a4a";
      ctx.fillRect(sx, sy, platform.w, platform.h);

      // Top border highlight
      ctx.fillStyle = "#6a6a6a";
      ctx.fillRect(sx, sy, platform.w, 3);

      // Pattern/texture
      ctx.fillStyle = "rgba(255, 255, 255, 0.05)";
      for (let i = 0; i < platform.w; i += 20) {
        ctx.fillRect(sx + i, sy + 5, 10, 2);
      }

      // Shadow underneath
      ctx.fillStyle = "rgba(0, 0, 0, 0.3)";
      ctx.fillRect(sx, sy + platform.h, platform.w, 4);
    }
  }

  /**
   * Draw the complete background (sky, stars, moon, trees)
   * @param {number} cameraX - Camera X position
   * @param {number} tick - Game tick
   */
  drawBackground(cameraX, tick) {
    this.drawSky();
    this.drawStars(cameraX, tick);
    this.drawMoon(cameraX, tick);
    this.drawTrees(cameraX);
  }
}

if (typeof module !== "undefined" && module.exports) {
  module.exports = BackgroundRenderer;
}
