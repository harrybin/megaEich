/**
 * Player Rendering Module
 * Handles drawing the Eichhörnchen (player character)
 */

class PlayerRenderer {
  constructor(ctx) {
    this.ctx = ctx;
  }

  /**
   * Draw the Eichhörnchen character
   * @param {number} x - Screen X position
   * @param {number} y - Screen Y position
   * @param {number} facing - Direction (1 = right, -1 = left)
   * @param {number} walkFrame - Animation frame (0-3)
   * @param {number} speedBoost - Speed boost timer
   * @param {number} tick - Game tick for animations
   */
  draw(x, y, facing, walkFrame, speedBoost, tick) {
    const ctx = this.ctx;
    ctx.save();
    ctx.translate(x + 18, y); // centre x for easy flip
    if (facing === -1) ctx.scale(-1, 1);

    const bob = Math.sin(tick * 0.1) * 1.4;
    const legPhase = walkFrame * (Math.PI / 2);

    // Shadow
    ctx.beginPath();
    ctx.ellipse(0, 44 + bob, 15, 5, 0, 0, Math.PI * 2);
    ctx.fillStyle = "rgba(0,0,0,0.22)";
    ctx.fill();

    // Speed boost aura
    if (speedBoost > 0) {
      ctx.beginPath();
      ctx.arc(0, 28 + bob, 22, 0, Math.PI * 2);
      ctx.strokeStyle = `rgba(0,191,255,${0.2 + 0.1 * Math.sin(tick * 0.12)})`;
      ctx.lineWidth = 2;
      ctx.stroke();
    }

    // Tail (behind body)
    ctx.beginPath();
    ctx.moveTo(-8, 30 + bob);
    ctx.bezierCurveTo(-26, 18 + bob, -32, -2 + bob, -6, -14 + bob);
    ctx.bezierCurveTo(10, -20 + bob, 12, -4 + bob, 4, 6 + bob);
    ctx.strokeStyle = "#6B3A2A";
    ctx.lineWidth = 13;
    ctx.lineCap = "round";
    ctx.stroke();
    ctx.strokeStyle = "#9B5A3A";
    ctx.lineWidth = 8;
    ctx.stroke();

    // Legs
    ctx.strokeStyle = "#8B4513";
    ctx.lineWidth = 5;
    ctx.lineCap = "round";
    ctx.beginPath();
    ctx.moveTo(-8, 36 + bob);
    ctx.lineTo(-8 + Math.cos(legPhase + Math.PI) * 9, 44 + bob);
    ctx.stroke();
    ctx.beginPath();
    ctx.moveTo(8, 36 + bob);
    ctx.lineTo(8 + Math.cos(legPhase) * 9, 44 + bob);
    ctx.stroke();

    // Body
    ctx.beginPath();
    ctx.ellipse(0, 28 + bob, 14, 18, 0, 0, Math.PI * 2);
    ctx.fillStyle = "#C4622D";
    ctx.fill();
    ctx.strokeStyle = "#8B3A1A";
    ctx.lineWidth = 1.5;
    ctx.stroke();

    // Belly
    ctx.beginPath();
    ctx.ellipse(0, 30 + bob, 8, 12, 0, 0, Math.PI * 2);
    ctx.fillStyle = "#F0C080";
    ctx.fill();

    // Arms
    ctx.strokeStyle = "#C4622D";
    ctx.lineWidth = 5;
    ctx.beginPath();
    ctx.moveTo(-10, 20 + bob);
    ctx.lineTo(-16 + Math.cos(legPhase + Math.PI) * 7, 30 + bob);
    ctx.stroke();
    ctx.beginPath();
    ctx.moveTo(10, 20 + bob);
    ctx.lineTo(16 + Math.cos(legPhase) * 7, 28 + bob);
    ctx.stroke();

    // Head
    ctx.beginPath();
    ctx.arc(2, 10 + bob, 12, 0, Math.PI * 2);
    ctx.fillStyle = "#C4622D";
    ctx.fill();
    ctx.strokeStyle = "#8B3A1A";
    ctx.lineWidth = 1.5;
    ctx.stroke();

    // Ears
    ctx.fillStyle = "#C4622D";
    ctx.beginPath();
    ctx.moveTo(-6, 2 + bob);
    ctx.lineTo(-10, -7 + bob);
    ctx.lineTo(-1, -1 + bob);
    ctx.fill();
    ctx.beginPath();
    ctx.moveTo(8, 2 + bob);
    ctx.lineTo(13, -7 + bob);
    ctx.lineTo(4, -1 + bob);
    ctx.fill();
    ctx.fillStyle = "#FFAABB";
    ctx.beginPath();
    ctx.moveTo(-5, 1 + bob);
    ctx.lineTo(-8, -4 + bob);
    ctx.lineTo(-1, -1 + bob);
    ctx.fill();
    ctx.beginPath();
    ctx.moveTo(7, 1 + bob);
    ctx.lineTo(11, -4 + bob);
    ctx.lineTo(4, -1 + bob);
    ctx.fill();

    // Eye white
    ctx.beginPath();
    ctx.arc(9, 9 + bob, 3.5, 0, Math.PI * 2);
    ctx.fillStyle = "#fff";
    ctx.fill();
    // Pupil
    ctx.beginPath();
    ctx.arc(10, 9 + bob, 2, 0, Math.PI * 2);
    ctx.fillStyle = "#111";
    ctx.fill();
    // Glint
    ctx.beginPath();
    ctx.arc(10.6, 8.2 + bob, 0.8, 0, Math.PI * 2);
    ctx.fillStyle = "#fff";
    ctx.fill();

    // Nose
    ctx.beginPath();
    ctx.arc(13, 12 + bob, 2, 0, Math.PI * 2);
    ctx.fillStyle = "#CC5555";
    ctx.fill();

    ctx.restore();
  }
}

if (typeof module !== "undefined" && module.exports) {
  module.exports = PlayerRenderer;
}
