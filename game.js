"use strict";

// ─────────────────────────────────────────────
//  CANVAS SETUP
// ─────────────────────────────────────────────
const canvas = document.getElementById("gameCanvas");
const ctx = canvas.getContext("2d");
const bgMusic = document.getElementById("bgMusic");
const W = canvas.width; // 800
const H = canvas.height; // 500

let hasStartedMusic = false;

function tryStartMusic() {
  if (!bgMusic || hasStartedMusic) return;
  bgMusic.muted = false;
  bgMusic.volume = 0.45;
  const playPromise = bgMusic.play();
  if (playPromise && typeof playPromise.then === "function") {
    playPromise
      .then(() => {
        hasStartedMusic = true;
      })
      .catch(() => {
        // Ignore autoplay errors; next user interaction will retry.
      });
  } else {
    hasStartedMusic = true;
  }
}

// ─────────────────────────────────────────────
//  CONSTANTS
// ─────────────────────────────────────────────
const GAME_CONFIG = window.GAME_CONFIG;
if (!GAME_CONFIG) {
  throw new Error(
    "GAME_CONFIG is missing. Ensure game-config.js is loaded before game.js.",
  );
}

const {
  GRAVITY,
  JUMP_FORCE,
  MOVE_SPEED,
  GROUND_Y,
  WORLD_W,
  TILE_H,
  MVP_NAMES,
} = GAME_CONFIG;

// ─────────────────────────────────────────────
//  INPUT
// ─────────────────────────────────────────────
const keys = {};
let mobileControlsEnabled = false;
const touchKeyPressCount = {
  ArrowLeft: 0,
  ArrowRight: 0,
  Space: 0,
};
const activeTouchPointers = new Map();

function detectMobileBrowser() {
  return (
    window.matchMedia("(pointer: coarse)").matches ||
    "ontouchstart" in window ||
    navigator.maxTouchPoints > 0 ||
    /Android|iPhone|iPad|iPod|Mobile/i.test(navigator.userAgent)
  );
}

function setKeyState(code, pressed) {
  keys[code] = pressed;
}

function triggerPrimaryAction() {
  if (state === "START") {
    startGame();
    return;
  }
  if (state === "LEVEL_COMPLETE") {
    level++;
    loadLevel(level);
    state = "PLAYING";
    return;
  }
  if (state === "GAME_OVER") {
    level = 1;
    score = 0;
    lives = 3;
    startGame();
  }
}

function applyTouchKeyState(code) {
  setKeyState(code, touchKeyPressCount[code] > 0);
}

function pressTouchKey(code, pointerId) {
  if (!touchKeyPressCount.hasOwnProperty(code)) return;
  if (activeTouchPointers.has(pointerId)) releasePointerTouch(pointerId);
  activeTouchPointers.set(pointerId, code);
  touchKeyPressCount[code]++;
  applyTouchKeyState(code);
}

function releasePointerTouch(pointerId) {
  const code = activeTouchPointers.get(pointerId);
  if (!code) return;
  activeTouchPointers.delete(pointerId);
  touchKeyPressCount[code] = Math.max(0, touchKeyPressCount[code] - 1);
  applyTouchKeyState(code);
}

function releaseMobileKeys() {
  activeTouchPointers.clear();
  Object.keys(touchKeyPressCount).forEach((code) => {
    touchKeyPressCount[code] = 0;
    setKeyState(code, false);
  });
}

function bindTouchControlButton(btn) {
  const key = btn.dataset.touchKey;

  const press = (e) => {
    if (e.cancelable) e.preventDefault();
    tryStartMusic();
    if (key === "Space") triggerPrimaryAction();
    if (typeof e.pointerId === "number") {
      pressTouchKey(key, e.pointerId);
      btn.setPointerCapture(e.pointerId);
    } else {
      pressTouchKey(key, `${key}-touch-fallback`);
    }
  };

  const release = (e) => {
    if (e.cancelable) e.preventDefault();
    if (typeof e.pointerId === "number") {
      releasePointerTouch(e.pointerId);
    } else {
      releasePointerTouch(`${key}-touch-fallback`);
    }
  };

  btn.addEventListener("pointerdown", press);
  btn.addEventListener("pointerup", release);
  btn.addEventListener("pointercancel", release);
  btn.addEventListener("pointerleave", release);
  btn.addEventListener("touchstart", press, { passive: false });
  btn.addEventListener("touchend", release, { passive: false });
  btn.addEventListener("touchcancel", release, { passive: false });
}

function initMobileControls() {
  const controls = document.getElementById("mobile-controls");
  if (!controls) return;

  mobileControlsEnabled = detectMobileBrowser();
  const touchButtons = controls.querySelectorAll(".touch-btn");
  touchButtons.forEach((btn) => bindTouchControlButton(btn));

  if (mobileControlsEnabled)
    document.body.classList.add("mobile-controls-enabled");

  // Some phone browsers report touch capability only after first interaction.
  window.addEventListener(
    "touchstart",
    () => {
      mobileControlsEnabled = true;
      document.body.classList.add("mobile-controls-enabled");
    },
    { once: true, passive: true },
  );

  // Avoid stuck movement when a touch is interrupted by OS gestures.
  window.addEventListener("blur", releaseMobileKeys);
}

window.addEventListener("keydown", (e) => {
  tryStartMusic();
  keys[e.code] = true;
  if (
    ["Space", "ArrowUp", "ArrowDown", "ArrowLeft", "ArrowRight"].includes(
      e.code,
    )
  ) {
    e.preventDefault();
  }
  if (e.code === "KeyP" || e.code === "Escape") {
    togglePause();
  }
});
window.addEventListener("keyup", (e) => {
  keys[e.code] = false;
});

window.addEventListener("pointerdown", () => {
  tryStartMusic();
  if (mobileControlsEnabled) triggerPrimaryAction();
});

window.addEventListener(
  "touchstart",
  () => {
    tryStartMusic();
    triggerPrimaryAction();
  },
  { passive: true },
);

// ─────────────────────────────────────────────
//  GAME STATE
// ─────────────────────────────────────────────
let state = "START"; // START | PLAYING | PAUSED | LEVEL_COMPLETE | GAME_OVER
let level = 1;
let score = 0;
let lives = 3;
let tick = 0;
let cameraX = 0;

let notification = null; // { text, timer }
let particles = [];
let bgStars = [];

// ─────────────────────────────────────────────
//  PLAYER
// ─────────────────────────────────────────────
let player;

function resetPlayer() {
  player = {
    x: 120,
    y: GROUND_Y - 44,
    vx: 0,
    vy: 0,
    w: 36,
    h: 44,
    onGround: false,
    facing: 1, // 1 = right, -1 = left
    walkFrame: 0,
    walkTimer: 0,
    speedBoost: 0, // ticks remaining
  };
}

// ─────────────────────────────────────────────
//  LEVEL DATA
// ─────────────────────────────────────────────
let platforms = [];
let collectibles = [];
let mvps = [];
let hazards = [];

const LEVEL_DEFS = window.GAME_LEVEL_DEFS;
if (!Array.isArray(LEVEL_DEFS) || LEVEL_DEFS.length === 0) {
  throw new Error(
    "GAME_LEVEL_DEFS is missing. Ensure levels.js is loaded before game.js.",
  );
}

function loadLevel(num) {
  const def = LEVEL_DEFS[(num - 1) % LEVEL_DEFS.length];

  platforms = [
    { x: 0, y: GROUND_Y, w: WORLD_W, isGround: true },
    ...def.platforms.map((p) => ({ ...p, isGround: false })),
  ];

  collectibles = [];
  const nonGround = platforms.filter((p) => !p.isGround);
  const shuffled = [...nonGround].sort(() => Math.random() - 0.5);
  let idx = 0;

  for (let i = 0; i < def.acorns; i++) {
    const p = shuffled[idx % shuffled.length];
    idx++;
    collectibles.push({
      type: "acorn",
      x: p.x + 30 + Math.random() * Math.max(0, p.w - 60),
      y: p.y - 24,
      collected: false,
    });
  }
  for (let i = 0; i < def.golden; i++) {
    const p = shuffled[idx % shuffled.length];
    idx++;
    collectibles.push({
      type: "golden",
      x: p.x + 20 + Math.random() * Math.max(0, p.w - 40),
      y: p.y - 28,
      collected: false,
      bobOffset: Math.random() * Math.PI * 2,
    });
  }
  for (let i = 0; i < def.powerups; i++) {
    const p = shuffled[idx % shuffled.length];
    idx++;
    collectibles.push({
      type: "powerup",
      x: p.x + 20 + Math.random() * Math.max(0, p.w - 40),
      y: p.y - 28,
      collected: false,
      bobOffset: Math.random() * Math.PI * 2,
    });
  }

  // Place MVPs on platforms
  const mvpPool = [...nonGround].sort(() => Math.random() - 0.5);
  const namePool = [...MVP_NAMES].sort(() => Math.random() - 0.5);
  mvps = [];
  for (let i = 0; i < def.mvpCount; i++) {
    const p = mvpPool[i % mvpPool.length];
    mvps.push({
      x: p.x + p.w / 2,
      y: p.y - 50, // feet at p.y
      name: namePool[i % namePool.length],
      met: false,
      w: 30,
      h: 50,
      bounceTimer: Math.random() * Math.PI * 2,
    });
  }

  // Populate hazards from level definition
  hazards = [];
  if (def.hazards) {
    for (const h of def.hazards) {
      hazards.push({
        type: h.type, // "fire" or "trap"
        x: h.x,
        y: h.y,
        w: h.w || 40,
        h: h.h || 20,
        active: true,
      });
    }
  }

  cameraX = 0;
  particles = [];
  resetPlayer();
}

// ─────────────────────────────────────────────
//  PHYSICS & COLLISION
// ─────────────────────────────────────────────
function updatePlayer() {
  const spd = MOVE_SPEED + (player.speedBoost > 0 ? 2.5 : 0);

  if (keys["ArrowLeft"] || keys["KeyA"]) {
    player.vx = -spd;
    player.facing = -1;
  } else if (keys["ArrowRight"] || keys["KeyD"]) {
    player.vx = spd;
    player.facing = 1;
  } else {
    player.vx *= 0.78; // friction
  }

  if ((keys["Space"] || keys["ArrowUp"] || keys["KeyW"]) && player.onGround) {
    player.vy = JUMP_FORCE;
    player.onGround = false;
  }

  player.vy += GRAVITY;
  player.x += player.vx;
  player.y += player.vy;

  // World bounds
  player.x = Math.max(0, Math.min(WORLD_W - player.w, player.x));

  // Platform collision (land from above only)
  player.onGround = false;
  for (const p of platforms) {
    const tolerance = Math.abs(player.vy) + 2;
    if (
      player.x + player.w > p.x &&
      player.x < p.x + p.w &&
      player.y + player.h >= p.y &&
      player.y + player.h <= p.y + TILE_H + tolerance &&
      player.vy >= 0
    ) {
      player.y = p.y - player.h;
      player.vy = 0;
      player.onGround = true;
    }
  }

  // Fell off world → lose a life
  if (player.y > H + 100) {
    loseLife();
    return;
  }

  // Walk animation
  if (Math.abs(player.vx) > 0.5) {
    player.walkTimer++;
    if (player.walkTimer > 8) {
      player.walkTimer = 0;
      player.walkFrame = (player.walkFrame + 1) % 4;
    }
  } else {
    player.walkFrame = 0;
  }

  if (player.speedBoost > 0) player.speedBoost--;

  // Smooth camera
  const targetCam = player.x - W / 2 + player.w / 2;
  cameraX += (targetCam - cameraX) * 0.12;
  cameraX = Math.max(0, Math.min(WORLD_W - W, cameraX));
}

function loseLife() {
  lives--;
  spawnParticles(
    player.x + player.w / 2,
    player.y + player.h / 2,
    "#ff4444",
    22,
  );
  if (lives <= 0) {
    state = "GAME_OVER";
  } else {
    resetPlayer();
    cameraX = 0;
    showNotification("💫  Ouch! Try again!", 120);
  }
}

// ─────────────────────────────────────────────
//  HAZARDS
// ─────────────────────────────────────────────
function checkHazards() {
  const cx = player.x + player.w / 2;
  const cy = player.y + player.h / 2;

  for (const h of hazards) {
    if (!h.active) continue;
    // AABB collision
    if (cx > h.x && cx < h.x + h.w && cy > h.y - h.h && cy < h.y + h.h) {
      h.active = false;
      if (h.type === "fire") {
        loseLife();
        showNotification("🔥  Ouch! Stay away from fire!", 100);
      } else if (h.type === "trap") {
        loseLife();
        showNotification("⚠️  Trapped! Lost a life!", 100);
      }
    }
  }
}

// ─────────────────────────────────────────────
//  COLLECTIBLES
// ─────────────────────────────────────────────
function checkCollectibles() {
  const cx = player.x + player.w / 2;
  const cy = player.y + player.h / 2;

  for (const c of collectibles) {
    if (c.collected) continue;
    if (Math.abs(cx - c.x) < 22 && Math.abs(cy - c.y) < 22) {
      c.collected = true;
      if (c.type === "acorn") {
        score += 10;
        spawnParticles(c.x, c.y, "#8B4513", 8);
        showNotification("+10  🌰  Acorn!", 60);
      } else if (c.type === "golden") {
        score += 50;
        spawnParticles(c.x, c.y, "#FFD700", 14);
        showNotification("+50  ✨  Golden Acorn!", 80);
      } else if (c.type === "powerup") {
        score += 100;
        player.speedBoost = 300; // 5 s
        spawnParticles(c.x, c.y, "#00BFFF", 18);
        showNotification("+100  ⚡  Speed Boost!", 100);
      }
    }
  }
}

// ─────────────────────────────────────────────
//  MVP ENCOUNTERS
// ─────────────────────────────────────────────
function checkMVPs() {
  const cx = player.x + player.w / 2;
  const cy = player.y + player.h / 2;

  for (const m of mvps) {
    if (m.met) continue;
    const mvpCx = m.x;
    const mvpCy = m.y + m.h / 2;
    if (Math.abs(cx - mvpCx) < 36 && Math.abs(cy - mvpCy) < 40) {
      m.met = true;
      score += 200;
      spawnParticles(m.x, m.y + 25, "#FFD700", 24);
      showNotification(`🌟  You met MVP ${m.name}!  +200`, 180);
    }
  }
}

// ─────────────────────────────────────────────
//  LEVEL COMPLETE
// ─────────────────────────────────────────────
function checkLevelComplete() {
  if (collectibles.every((c) => c.collected) && mvps.every((m) => m.met)) {
    score += level * 500;
    state = "LEVEL_COMPLETE";
  }
}

// ─────────────────────────────────────────────
//  PARTICLES
// ─────────────────────────────────────────────
function spawnParticles(x, y, color, count) {
  for (let i = 0; i < count; i++) {
    const angle = Math.random() * Math.PI * 2;
    const spd = 1.5 + Math.random() * 4;
    particles.push({
      x,
      y,
      vx: Math.cos(angle) * spd,
      vy: Math.sin(angle) * spd - 2,
      color,
      life: 40 + Math.random() * 30,
      maxLife: 70,
      size: 3 + Math.random() * 4,
    });
  }
}

function updateParticles() {
  for (let i = particles.length - 1; i >= 0; i--) {
    const p = particles[i];
    p.x += p.vx;
    p.y += p.vy;
    p.vy += 0.15;
    p.life--;
    if (p.life <= 0) particles.splice(i, 1);
  }
}

// ─────────────────────────────────────────────
//  NOTIFICATIONS
// ─────────────────────────────────────────────
function showNotification(text, duration) {
  notification = { text, timer: duration };
}

// ─────────────────────────────────────────────
//  BACKGROUND
// ─────────────────────────────────────────────
function initBgStars() {
  bgStars = [];
  for (let i = 0; i < 90; i++) {
    bgStars.push({
      x: Math.random() * WORLD_W,
      y: Math.random() * (H - 120),
      r: 0.5 + Math.random() * 1.5,
      blink: Math.random() * Math.PI * 2,
    });
  }
}

function drawBackground() {
  // Sky gradient
  const grad = ctx.createLinearGradient(0, 0, 0, H - 60);
  grad.addColorStop(0, "#0D1B2A");
  grad.addColorStop(0.6, "#1B3A5C");
  grad.addColorStop(1, "#2A5080");
  ctx.fillStyle = grad;
  ctx.fillRect(0, 0, W, H);

  // Stars (parallax)
  for (const s of bgStars) {
    const sx = (((s.x - cameraX * 0.18) % W) + W) % W;
    const alpha = 0.5 + 0.5 * Math.sin(tick * 0.04 + s.blink);
    ctx.beginPath();
    ctx.arc(sx, s.y, s.r, 0, Math.PI * 2);
    ctx.fillStyle = `rgba(255,255,220,${alpha})`;
    ctx.fill();
  }

  // Crescent moon
  const moonX = (((W * 0.78 - cameraX * 0.05) % W) + W) % W;
  ctx.beginPath();
  ctx.arc(moonX, 75, 34, 0, Math.PI * 2);
  ctx.fillStyle = "#FFFDE7";
  ctx.fill();
  ctx.beginPath();
  ctx.arc(moonX + 14, 68, 29, 0, Math.PI * 2);
  ctx.fillStyle = "#1B3A5C";
  ctx.fill();

  // Background trees (deeper parallax)
  for (let tx = 0; tx < WORLD_W; tx += 220) {
    const sx = tx - cameraX * 0.4;
    if (sx > -80 && sx < W + 80) drawTree(sx, GROUND_Y, 0.72);
  }
}

function drawTree(x, baseY, scale) {
  ctx.save();
  ctx.translate(x, baseY);
  ctx.scale(scale, scale);
  ctx.fillStyle = "#3E2723";
  ctx.fillRect(-8, -50, 16, 50);
  ctx.fillStyle = "#1B5E20";
  ctx.beginPath();
  ctx.moveTo(0, -118);
  ctx.lineTo(-38, -55);
  ctx.lineTo(38, -55);
  ctx.closePath();
  ctx.fill();
  ctx.fillStyle = "#2E7D32";
  ctx.beginPath();
  ctx.moveTo(0, -96);
  ctx.lineTo(-48, -28);
  ctx.lineTo(48, -28);
  ctx.closePath();
  ctx.fill();
  ctx.restore();
}

// ─────────────────────────────────────────────
//  DRAWING HELPERS
// ─────────────────────────────────────────────
function roundRect(x, y, w, h, r, fillColor, strokeColor) {
  ctx.beginPath();
  ctx.moveTo(x + r, y);
  ctx.lineTo(x + w - r, y);
  ctx.arcTo(x + w, y, x + w, y + r, r);
  ctx.lineTo(x + w, y + h - r);
  ctx.arcTo(x + w, y + h, x + w - r, y + h, r);
  ctx.lineTo(x + r, y + h);
  ctx.arcTo(x, y + h, x, y + h - r, r);
  ctx.lineTo(x, y + r);
  ctx.arcTo(x, y, x + r, y, r);
  ctx.closePath();
  if (fillColor) {
    ctx.fillStyle = fillColor;
    ctx.fill();
  }
  if (strokeColor) {
    ctx.strokeStyle = strokeColor;
    ctx.stroke();
  }
}

// ─────────────────────────────────────────────
//  DRAW: EICHHÖRNCHEN
// ─────────────────────────────────────────────
function drawEichhörnchen(x, y, facing, walkFrame, speedBoost) {
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
    ctx.ellipse(0, 22 + bob, 27, 27, 0, 0, Math.PI * 2);
    ctx.strokeStyle = `rgba(0,191,255,${0.3 + 0.25 * Math.sin(tick * 0.2)})`;
    ctx.lineWidth = 3;
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

// ─────────────────────────────────────────────
//  DRAW: MVP CHARACTER
// ─────────────────────────────────────────────
function drawMVP(x, y, name, bounceTimer, met) {
  const bob = met ? 0 : Math.sin(bounceTimer + tick * 0.05) * 3;
  const shirtColor = met ? "#777" : "#1E90FF";
  const skinColor = "#FDBCB4";
  const hairColor = met ? "#AAA" : "#5C3317";

  ctx.save();
  ctx.translate(x, y + bob);

  // Shadow
  ctx.beginPath();
  ctx.ellipse(0, 52, 14, 4, 0, 0, Math.PI * 2);
  ctx.fillStyle = "rgba(0,0,0,0.25)";
  ctx.fill();

  // Legs
  ctx.strokeStyle = "#1A3488";
  ctx.lineWidth = 7;
  ctx.lineCap = "round";
  ctx.beginPath();
  ctx.moveTo(-5, 30);
  ctx.lineTo(-7, 50);
  ctx.stroke();
  ctx.beginPath();
  ctx.moveTo(5, 30);
  ctx.lineTo(7, 50);
  ctx.stroke();

  // Shirt body
  roundRect(-14, 8, 28, 24, 6, shirtColor, null);

  // Arms
  ctx.strokeStyle = shirtColor;
  ctx.lineWidth = 6;
  ctx.beginPath();
  ctx.moveTo(-14, 12);
  ctx.lineTo(-22, 28);
  ctx.stroke();
  ctx.beginPath();
  ctx.moveTo(14, 12);
  ctx.lineTo(22, 28);
  ctx.stroke();

  // Hands
  ctx.beginPath();
  ctx.arc(-22, 28, 5, 0, Math.PI * 2);
  ctx.fillStyle = skinColor;
  ctx.fill();
  ctx.beginPath();
  ctx.arc(22, 28, 5, 0, Math.PI * 2);
  ctx.fillStyle = skinColor;
  ctx.fill();

  // Gold star badge on shirt
  ctx.save();
  ctx.translate(-6, 18);
  ctx.fillStyle = "#FFD700";
  ctx.beginPath();
  for (let i = 0; i < 5; i++) {
    const ao = -Math.PI / 2 + (i * 2 * Math.PI) / 5;
    const ai = -Math.PI / 2 + ((i * 2 + 1) * Math.PI) / 5;
    if (i === 0) ctx.moveTo(Math.cos(ao) * 8, Math.sin(ao) * 8);
    else ctx.lineTo(Math.cos(ao) * 8, Math.sin(ao) * 8);
    ctx.lineTo(Math.cos(ai) * 4, Math.sin(ai) * 4);
  }
  ctx.closePath();
  ctx.fill();
  ctx.strokeStyle = "#DAA520";
  ctx.lineWidth = 1;
  ctx.stroke();
  ctx.restore();

  // Head
  ctx.beginPath();
  ctx.arc(0, 0, 12, 0, Math.PI * 2);
  ctx.fillStyle = skinColor;
  ctx.fill();
  ctx.strokeStyle = "#D09080";
  ctx.lineWidth = 1;
  ctx.stroke();

  // Eyes
  ctx.fillStyle = "#333";
  ctx.beginPath();
  ctx.arc(-4, -1, 2, 0, Math.PI * 2);
  ctx.fill();
  ctx.beginPath();
  ctx.arc(4, -1, 2, 0, Math.PI * 2);
  ctx.fill();

  // Smile
  ctx.beginPath();
  ctx.arc(0, 2, 5, 0.2, Math.PI - 0.2);
  ctx.strokeStyle = "#884444";
  ctx.lineWidth = 1.5;
  ctx.stroke();

  // Hair
  ctx.beginPath();
  ctx.arc(0, -10, 12, Math.PI, 0);
  ctx.fillStyle = hairColor;
  ctx.fill();

  // Name tag
  ctx.font = "bold 11px Courier New";
  ctx.textAlign = "center";
  const label = `MVP ${name}`;
  const tw = ctx.measureText(label).width + 16;
  roundRect(-tw / 2, -40, tw, 18, 4, "rgba(0,0,0,0.75)", "#FFD700");
  ctx.fillStyle = met ? "#aaa" : "#FFD700";
  ctx.fillText(label, 0, -26);

  // Check mark when met
  if (met) {
    ctx.font = "13px sans-serif";
    ctx.fillStyle = "#66BB6A";
    ctx.fillText("✓", 0, -52);
  }

  ctx.restore();
}

// ─────────────────────────────────────────────
//  DRAW: HAZARDS
// ─────────────────────────────────────────────
function drawFire(x, y, w, h) {
  const flicker = Math.sin(tick * 0.15) * 4 + 2; // Vertical flicker
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

function drawTrap(x, y, w, h) {
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

// ─────────────────────────────────────────────
//  DRAW: COLLECTIBLES
// ─────────────────────────────────────────────
function drawAcorn(x, y) {
  ctx.save();
  ctx.translate(x, y);
  // Cap
  ctx.beginPath();
  ctx.arc(0, -4, 8, Math.PI, 0);
  ctx.fillStyle = "#5C3317";
  ctx.fill();
  // Stem
  ctx.beginPath();
  ctx.moveTo(0, -12);
  ctx.lineTo(0, -16);
  ctx.strokeStyle = "#5C3317";
  ctx.lineWidth = 2;
  ctx.stroke();
  // Body
  ctx.beginPath();
  ctx.ellipse(0, 4, 7, 9, 0, 0, Math.PI * 2);
  ctx.fillStyle = "#8B4513";
  ctx.fill();
  ctx.strokeStyle = "#5C2510";
  ctx.lineWidth = 1;
  ctx.stroke();
  // Shine
  ctx.beginPath();
  ctx.ellipse(-2, 1, 2, 3.5, -0.5, 0, Math.PI * 2);
  ctx.fillStyle = "rgba(255,255,255,0.3)";
  ctx.fill();
  ctx.restore();
}

function drawGoldenAcorn(x, y, bobOffset) {
  const bob = Math.sin(tick * 0.06 + bobOffset) * 4;
  ctx.save();
  ctx.translate(x, y + bob);
  // Glow
  ctx.beginPath();
  ctx.arc(0, 0, 16, 0, Math.PI * 2);
  ctx.fillStyle = `rgba(255,215,0,${0.12 + 0.1 * Math.sin(tick * 0.1 + bobOffset)})`;
  ctx.fill();
  // Cap
  ctx.beginPath();
  ctx.arc(0, -4, 8, Math.PI, 0);
  ctx.fillStyle = "#B8860B";
  ctx.fill();
  // Stem
  ctx.beginPath();
  ctx.moveTo(0, -12);
  ctx.lineTo(0, -16);
  ctx.strokeStyle = "#B8860B";
  ctx.lineWidth = 2;
  ctx.stroke();
  // Body
  ctx.beginPath();
  ctx.ellipse(0, 4, 7, 9, 0, 0, Math.PI * 2);
  ctx.fillStyle = "#FFD700";
  ctx.fill();
  ctx.strokeStyle = "#DAA520";
  ctx.lineWidth = 1.5;
  ctx.stroke();
  // Shine
  ctx.beginPath();
  ctx.ellipse(-2, 1, 2, 3.5, -0.5, 0, Math.PI * 2);
  ctx.fillStyle = "rgba(255,255,255,0.5)";
  ctx.fill();
  ctx.restore();
}

function drawPowerUp(x, y, bobOffset) {
  const bob = Math.sin(tick * 0.07 + bobOffset) * 4;
  const rot = tick * 0.03;
  ctx.save();
  ctx.translate(x, y + bob);
  ctx.rotate(rot);
  // Glow
  ctx.beginPath();
  ctx.arc(0, 0, 18, 0, Math.PI * 2);
  ctx.fillStyle = `rgba(0,191,255,${0.14 + 0.1 * Math.sin(tick * 0.12)})`;
  ctx.fill();
  // Lightning bolt
  ctx.beginPath();
  ctx.moveTo(4, -12);
  ctx.lineTo(-4, 0);
  ctx.lineTo(2, 0);
  ctx.lineTo(-4, 12);
  ctx.lineTo(4, 2);
  ctx.lineTo(-2, 2);
  ctx.closePath();
  ctx.fillStyle = "#00BFFF";
  ctx.fill();
  ctx.strokeStyle = "#fff";
  ctx.lineWidth = 1;
  ctx.stroke();
  ctx.restore();
}

// ─────────────────────────────────────────────
//  DRAW: PLATFORMS
// ─────────────────────────────────────────────
function drawPlatform(p) {
  const sx = p.x - cameraX;
  if (p.isGround) {
    ctx.fillStyle = "#2D5016";
    ctx.fillRect(sx, p.y, p.w, H - p.y);
    ctx.fillStyle = "#4A7C20";
    ctx.fillRect(sx, p.y, p.w, 10);
    // Dirt stripe texture
    ctx.fillStyle = "#3D2B1F";
    for (let tx = p.x; tx < p.x + p.w; tx += 64) {
      const stx = tx - cameraX;
      if (stx > -64 && stx < W + 64) {
        ctx.fillRect(stx, p.y + 14, 42, 4);
      }
    }
  } else {
    // Shadow
    ctx.fillStyle = "rgba(0,0,0,0.22)";
    ctx.fillRect(sx + 4, p.y + 8, p.w, TILE_H);
    // Wood body
    ctx.fillStyle = "#5D4037";
    ctx.fillRect(sx, p.y, p.w, TILE_H);
    // Green top
    ctx.fillStyle = "#66BB6A";
    ctx.fillRect(sx, p.y, p.w, 5);
    // Highlight strip
    ctx.fillStyle = "rgba(255,255,255,0.1)";
    ctx.fillRect(sx, p.y, p.w, 3);
    // Edge posts
    ctx.fillStyle = "#4A2F26";
    ctx.fillRect(sx, p.y + 5, 4, TILE_H - 5);
    ctx.fillRect(sx + p.w - 4, p.y + 5, 4, TILE_H - 5);
  }
}

// ─────────────────────────────────────────────
//  DRAW: HUD
// ─────────────────────────────────────────────
function drawHUD() {
  ctx.save();

  // Score
  roundRect(10, 10, 165, 36, 6, "rgba(0,0,0,0.55)", "#f5a623");
  ctx.font = "bold 14px Courier New";
  ctx.fillStyle = "#f5a623";
  ctx.textAlign = "left";
  ctx.fillText(`SCORE: ${score}`, 20, 33);

  // Level
  roundRect(W / 2 - 62, 10, 124, 36, 6, "rgba(0,0,0,0.55)", "#66BB6A");
  ctx.fillStyle = "#66BB6A";
  ctx.textAlign = "center";
  ctx.fillText(`LEVEL ${level}`, W / 2, 33);

  // Lives
  roundRect(W - 120, 10, 110, 36, 6, "rgba(0,0,0,0.55)", "#EF5350");
  ctx.fillStyle = "#EF5350";
  ctx.textAlign = "right";
  const hearts =
    "♥".repeat(Math.max(0, lives)) + "♡".repeat(Math.max(0, 3 - lives));
  ctx.fillText(hearts, W - 14, 33);

  // Remaining items
  const remItems = collectibles.filter((c) => !c.collected).length;
  const remMVPs = mvps.filter((m) => !m.met).length;
  roundRect(10, 54, 210, 28, 6, "rgba(0,0,0,0.5)", "#666");
  ctx.font = "12px Courier New";
  ctx.fillStyle = "#CCC";
  ctx.textAlign = "left";
  ctx.fillText(`🌰 ×${remItems}   🌟 MVP ×${remMVPs}`, 18, 73);

  // Speed boost timer
  if (player && player.speedBoost > 0) {
    roundRect(W - 138, 54, 128, 28, 6, "rgba(0,0,0,0.5)", "#00BFFF");
    ctx.fillStyle = "#00BFFF";
    ctx.textAlign = "center";
    ctx.fillText(`⚡ BOOST  ${Math.ceil(player.speedBoost / 60)}s`, W - 74, 73);
  }

  ctx.restore();
}

// ─────────────────────────────────────────────
//  DRAW: NOTIFICATION BANNER
// ─────────────────────────────────────────────
function drawNotification() {
  if (!notification) return;

  const alpha = Math.min(1, notification.timer / 30);
  const ySlide = notification.timer > 30 ? 0 : (30 - notification.timer) * 0.5;

  ctx.save();
  ctx.globalAlpha = alpha;
  ctx.font = "bold 16px Courier New";
  ctx.textAlign = "center";
  const tw = ctx.measureText(notification.text).width + 26;
  roundRect(
    W / 2 - tw / 2,
    86 - ySlide,
    tw,
    28,
    6,
    "rgba(0,0,0,0.75)",
    "#FFD700",
  );
  ctx.fillStyle = "#FFD700";
  ctx.fillText(notification.text, W / 2, 105 - ySlide);
  ctx.restore();

  notification.timer--;
  if (notification.timer <= 0) notification = null;
}

// ─────────────────────────────────────────────
//  SCREENS
// ─────────────────────────────────────────────
function drawStartScreen() {
  drawBackground();

  ctx.fillStyle = "rgba(0,0,0,0.52)";
  ctx.fillRect(0, 0, W, H);

  // Title
  roundRect(W / 2 - 268, 52, 536, 82, 14, "rgba(0,0,0,0.78)", "#f5a623");
  ctx.font = "bold 46px Courier New";
  ctx.fillStyle = "#f5a623";
  ctx.textAlign = "center";
  ctx.shadowColor = "#f5a623";
  ctx.shadowBlur = 20;
  ctx.fillText("MEGA EICHHÖRNCHEN", W / 2, 112);
  ctx.shadowBlur = 0;

  ctx.font = "16px Courier New";
  ctx.fillStyle = "#DDD";
  ctx.fillText("🐿   MegaEich Arcade Edition   🐿", W / 2, 170);

  // Instructions
  roundRect(W / 2 - 228, 194, 456, 178, 10, "rgba(0,0,0,0.62)", "#444");
  ctx.font = "13px Courier New";
  ctx.fillStyle = "#CCC";
  const lines = [
    "← →  /  A D      —  Move",
    "SPACE  /  ↑  /  W  —  Jump",
    "Collect 🌰 acorns & ✨ golden acorns",
    "⚡ Power-ups grant a speed boost!",
    "🌟 Meet ALL MVPs to complete the level",
    "P  /  ESC  —  Pause",
  ];
  lines.forEach((ln, i) => ctx.fillText(ln, W / 2, 224 + i * 26));

  // Start prompt (pulse)
  const pulse = 0.6 + 0.4 * Math.sin(tick * 0.08);
  ctx.font = "bold 20px Courier New";
  ctx.fillStyle = `rgba(245,166,35,${pulse})`;
  ctx.fillText("▶   PRESS SPACE TO START   ◀", W / 2, 422);

  // Preview Eichhörnchen
  drawEichhörnchen(W / 2 - 18, H - 108, 1, Math.floor(tick / 12) % 4, 0);
}

function drawLevelCompleteScreen() {
  ctx.fillStyle = "rgba(0,0,0,0.65)";
  ctx.fillRect(0, 0, W, H);

  roundRect(
    W / 2 - 230,
    H / 2 - 122,
    460,
    244,
    14,
    "rgba(0,20,60,0.92)",
    "#FFD700",
  );

  ctx.font = "bold 36px Courier New";
  ctx.fillStyle = "#FFD700";
  ctx.textAlign = "center";
  ctx.shadowColor = "#FFD700";
  ctx.shadowBlur = 16;
  ctx.fillText("LEVEL COMPLETE!", W / 2, H / 2 - 72);
  ctx.shadowBlur = 0;

  ctx.font = "18px Courier New";
  ctx.fillStyle = "#FFF";
  ctx.fillText(`Level Bonus  +${level * 500} pts`, W / 2, H / 2 - 28);
  ctx.fillText(`Total Score: ${score}`, W / 2, H / 2 + 8);

  ctx.font = "14px Courier New";
  ctx.fillStyle = "#AAA";
  ctx.fillText(
    `MVPs met: ${mvps.filter((m) => m.met).length} / ${mvps.length}`,
    W / 2,
    H / 2 + 40,
  );

  const pulse = 0.6 + 0.4 * Math.sin(tick * 0.1);
  ctx.font = "bold 17px Courier New";
  ctx.fillStyle = `rgba(245,166,35,${pulse})`;
  ctx.fillText("▶   SPACE to continue   ◀", W / 2, H / 2 + 82);
}

function drawGameOverScreen() {
  ctx.fillStyle = "rgba(0,0,0,0.76)";
  ctx.fillRect(0, 0, W, H);

  roundRect(
    W / 2 - 210,
    H / 2 - 112,
    420,
    224,
    14,
    "rgba(60,0,0,0.92)",
    "#EF5350",
  );

  ctx.font = "bold 42px Courier New";
  ctx.fillStyle = "#EF5350";
  ctx.textAlign = "center";
  ctx.shadowColor = "#EF5350";
  ctx.shadowBlur = 18;
  ctx.fillText("GAME OVER", W / 2, H / 2 - 56);
  ctx.shadowBlur = 0;

  ctx.font = "18px Courier New";
  ctx.fillStyle = "#FFF";
  ctx.fillText(`Final Score:  ${score}`, W / 2, H / 2 - 12);
  ctx.fillText(`Reached Level: ${level}`, W / 2, H / 2 + 20);

  const pulse = 0.6 + 0.4 * Math.sin(tick * 0.1);
  ctx.font = "bold 16px Courier New";
  ctx.fillStyle = `rgba(245,166,35,${pulse})`;
  ctx.fillText("▶   SPACE to try again   ◀", W / 2, H / 2 + 72);
}

function drawPauseScreen() {
  ctx.fillStyle = "rgba(0,0,0,0.55)";
  ctx.fillRect(0, 0, W, H);

  roundRect(W / 2 - 145, H / 2 - 62, 290, 124, 12, "rgba(0,0,0,0.82)", "#888");
  ctx.font = "bold 32px Courier New";
  ctx.fillStyle = "#FFF";
  ctx.textAlign = "center";
  ctx.fillText("PAUSED", W / 2, H / 2 - 8);
  ctx.font = "14px Courier New";
  ctx.fillStyle = "#888";
  ctx.fillText("P / ESC to resume", W / 2, H / 2 + 30);
}

// ─────────────────────────────────────────────
//  MAIN LOOP
// ─────────────────────────────────────────────
function update() {
  tick++;

  if (state === "START") {
    if (keys["Space"] || keys["Enter"]) startGame();
    return;
  }
  if (state === "GAME_OVER") {
    if (keys["Space"] || keys["Enter"]) {
      level = 1;
      score = 0;
      lives = 3;
      startGame();
    }
    return;
  }
  if (state === "LEVEL_COMPLETE") {
    if (keys["Space"] || keys["Enter"]) {
      level++;
      loadLevel(level);
      state = "PLAYING";
    }
    return;
  }
  if (state === "PAUSED") return;

  // PLAYING
  updatePlayer();
  checkCollectibles();
  checkHazards();
  checkMVPs();
  updateParticles();
  checkLevelComplete();
}

function render() {
  ctx.clearRect(0, 0, W, H);

  if (state === "START") {
    drawStartScreen();
    return;
  }

  drawBackground();

  // Platforms
  for (const p of platforms) {
    if (p.x + p.w - cameraX > -220 && p.x - cameraX < W + 220) {
      drawPlatform(p);
    }
  }

  // Hazards
  for (const h of hazards) {
    if (!h.active) continue;
    const sx = h.x - cameraX;
    if (sx < -50 || sx > W + 50) continue;
    if (h.type === "fire") drawFire(sx, h.y, h.w, h.h);
    else if (h.type === "trap") drawTrap(sx, h.y, h.w, h.h);
  }

  // Collectibles
  for (const c of collectibles) {
    if (c.collected) continue;
    const sx = c.x - cameraX;
    if (sx < -30 || sx > W + 30) continue;
    if (c.type === "acorn") drawAcorn(sx, c.y);
    else if (c.type === "golden") drawGoldenAcorn(sx, c.y, c.bobOffset);
    else if (c.type === "powerup") drawPowerUp(sx, c.y, c.bobOffset);
  }

  // MVPs
  for (const m of mvps) {
    const sx = m.x - cameraX;
    if (sx < -70 || sx > W + 70) continue;
    drawMVP(sx, m.y, m.name, m.bounceTimer, m.met);
  }

  // Eichhörnchen
  drawEichhörnchen(
    player.x - cameraX,
    player.y,
    player.facing,
    player.walkFrame,
    player.speedBoost,
  );

  // Particles
  for (const p of particles) {
    const alpha = p.life / p.maxLife;
    ctx.beginPath();
    ctx.arc(p.x - cameraX, p.y, p.size * alpha, 0, Math.PI * 2);
    ctx.fillStyle = p.color;
    ctx.globalAlpha = alpha;
    ctx.fill();
    ctx.globalAlpha = 1;
  }

  drawHUD();
  drawNotification();

  if (state === "PAUSED") drawPauseScreen();
  if (state === "LEVEL_COMPLETE") drawLevelCompleteScreen();
  if (state === "GAME_OVER") drawGameOverScreen();
}

function gameLoop() {
  update();
  render();
  requestAnimationFrame(gameLoop);
}

// ─────────────────────────────────────────────
//  INIT
// ─────────────────────────────────────────────
function startGame() {
  loadLevel(level);
  state = "PLAYING";
  showNotification(`Level ${level}  —  Go! 🐿`, 130);
}

function togglePause() {
  if (state === "PLAYING") state = "PAUSED";
  else if (state === "PAUSED") state = "PLAYING";
}

initMobileControls();
initBgStars();
gameLoop();
