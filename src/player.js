/**
 * Player Module
 * Handles player state, movement, and collision
 */

class Player {
  constructor(x, y, w = 36, h = 44) {
    this.x = x;
    this.y = y;
    this.vx = 0;
    this.vy = 0;
    this.w = w;
    this.h = h;
    this.onGround = false;
    this.facing = 1; // 1 = right, -1 = left
    this.walkFrame = 0;
    this.walkTimer = 0;
    this.speedBoost = 0; // ticks remaining
  }

  reset(x, y) {
    this.x = x;
    this.y = y;
    this.vx = 0;
    this.vy = 0;
    this.onGround = false;
    this.facing = 1;
    this.walkFrame = 0;
    this.walkTimer = 0;
    this.speedBoost = 0;
  }

  update(keys, platforms, gravity, moveSpeed, jumpForce, worldW, groundY, h) {
    const spd = moveSpeed + (this.speedBoost > 0 ? 2.5 : 0);

    if (keys["ArrowLeft"] || keys["KeyA"]) {
      this.vx = -spd;
      this.facing = -1;
    } else if (keys["ArrowRight"] || keys["KeyD"]) {
      this.vx = spd;
      this.facing = 1;
    } else {
      this.vx *= 0.78; // friction
    }

    if ((keys["Space"] || keys["ArrowUp"] || keys["KeyW"]) && this.onGround) {
      this.vy = jumpForce;
      this.onGround = false;
    }

    this.vy += gravity;
    this.x += this.vx;
    this.y += this.vy;

    // World bounds
    this.x = Math.max(0, Math.min(worldW - this.w, this.x));

    // Platform collision (land from above only)
    this.onGround = false;
    const TILE_H = 18;
    for (const p of platforms) {
      const tolerance = Math.abs(this.vy) + 2;
      if (
        this.x + this.w > p.x &&
        this.x < p.x + p.w &&
        this.y + this.h >= p.y &&
        this.y + this.h <= p.y + TILE_H + tolerance &&
        this.vy >= 0
      ) {
        this.y = p.y - this.h;
        this.vy = 0;
        this.onGround = true;
      }
    }

    // Fell off world
    if (this.y > h + 100) {
      return false; // Lost life
    }

    // Walk animation
    if (Math.abs(this.vx) > 0.5) {
      this.walkTimer++;
      if (this.walkTimer > 8) {
        this.walkTimer = 0;
        this.walkFrame = (this.walkFrame + 1) % 4;
      }
    } else {
      this.walkFrame = 0;
    }

    if (this.speedBoost > 0) this.speedBoost--;

    return true; // Still alive
  }

  getCenterX() {
    return this.x + this.w / 2;
  }

  getCenterY() {
    return this.y + this.h / 2;
  }
}

if (typeof module !== "undefined" && module.exports) {
  module.exports = Player;
}
