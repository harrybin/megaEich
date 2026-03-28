/**
 * Particles Module
 * Handles particle effects
 */

class ParticleSystem {
  constructor() {
    this.particles = [];
  }

  spawn(x, y, color, count) {
    for (let i = 0; i < count; i++) {
      const angle = Math.random() * Math.PI * 2;
      const speed = 2 + Math.random() * 3;
      this.particles.push({
        x: x,
        y: y,
        vx: Math.cos(angle) * speed,
        vy: Math.sin(angle) * speed,
        color: color,
        size: 2 + Math.random() * 3,
        life: 60 + Math.random() * 40,
        maxLife: 60 + Math.random() * 40,
      });
    }
  }

  update() {
    for (let i = this.particles.length - 1; i >= 0; i--) {
      const p = this.particles[i];
      p.x += p.vx;
      p.y += p.vy;
      p.vy += 0.1; // Gravity
      p.life--;
      if (p.life <= 0) {
        this.particles.splice(i, 1);
      }
    }
  }

  getParticles() {
    return this.particles;
  }

  clear() {
    this.particles = [];
  }
}

if (typeof module !== "undefined" && module.exports) {
  module.exports = ParticleSystem;
}
