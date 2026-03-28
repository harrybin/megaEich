---
name: canvas-arcade
description: "Build a complete browser-based HTML5 Canvas arcade game from scratch. Use when: creating a new arcade game, adding a new level or game mechanic, scaffolding a platform/collectible/NPC system, building a scrolling-world game with a HUD, particle effects, multiple screens (start, pause, level complete, game over), or extending the megaEich Mega Squirrel game. Triggers: arcade game, canvas game, platform game, collectibles, NPC encounter, game loop, sprite, particle, scrolling world, game HUD."
argument-hint: "Describe the game: protagonist, collectibles, NPCs/enemies, number of levels, special mechanics"
---

# canvas-arcade — HTML5 Canvas Arcade Game Builder

Builds a **zero-dependency** browser arcade game using the HTML5 Canvas 2D API.
All drawing is done in pure JavaScript — no libraries, no build step.

## Project Structure

```
<project>/
├── index.html        # Minimal shell — loads canvas + style + game script
├── style.css         # Dark arcade aesthetic, canvas border glow
├── game.js           # Entire game engine (single file)
└── README.md         # Player-facing docs (only if requested)
```

## When to Use

- Scaffold a new arcade game from scratch
- Add a new level definition, collectible type, or NPC type to an existing canvas game
- Extend game mechanics (new power-up, enemy, screen transition)
- Reproduce the megaEich Mega Squirrel pattern for a different theme

---

## Procedure

### Step 1 — Gather Requirements

Before writing code, clarify:

| Question                | Default if unspecified               |
| ----------------------- | ------------------------------------ |
| Protagonist name/animal | Squirrel                             |
| Collectible types       | Acorn, Golden Acorn, Power-Up        |
| NPC type & trigger      | "MVP" characters — walk into to meet |
| Number of levels        | 3 (looping)                          |
| Special mechanics       | Speed boost power-up                 |
| World width             | 3200 px                              |
| Canvas size             | 800 × 500 px                         |

Store a brief plan in session memory before coding.

### Step 2 — `index.html`

Minimal shell:

- `<canvas id="gameCanvas" width="800" height="500">`
- Link `style.css` and `game.js`
- `controls-hint` div below the canvas

### Step 3 — `style.css`

Dark arcade palette:

- Body: `#050a12`, flex-centered, full-viewport
- Canvas: amber `#f5a623` border + glow (`box-shadow`)
- `image-rendering: pixelated` on canvas
- Controls hint in muted monospace below canvas

### Step 4 — `game.js` Architecture

Organise into clearly commented sections:

```
CANVAS SETUP
CONSTANTS          ← gravity, jump force, speed, world size
INPUT              ← keydown/keyup → keys{}; prevent scroll on arrow keys
GAME STATE         ← state machine: START | PLAYING | PAUSED | LEVEL_COMPLETE | GAME_OVER
PLAYER             ← resetPlayer(), physics object {x,y,vx,vy,onGround,facing,walkFrame,speedBoost}
LEVEL DATA         ← LEVEL_DEFS array; loadLevel(n) populates platforms[], collectibles[], npcs[]
PHYSICS            ← updatePlayer(): gravity, friction, AABB landing, world bounds, fall-off-world
COLLECTIBLES       ← checkCollectibles(): proximity circle test, score, particles, notification
NPC ENCOUNTERS     ← checkNPCs(): proximity test, score, particles, notification
LEVEL COMPLETE     ← checkLevelComplete(): all collected && all NPCs met → state change + bonus score
PARTICLES          ← spawnParticles(x,y,color,count); updateParticles()
NOTIFICATIONS      ← showNotification(text, duration); drawNotification() with fade + slide
BACKGROUND         ← initBgStars(); drawBackground() with parallax layers
DRAWING HELPERS    ← roundRect(x,y,w,h,r,fill,stroke)
DRAW: PROTAGONIST  ← pure canvas shapes, walk animation, facing flip, special-state aura
DRAW: NPCs         ← name badge, bouncing idle, met/unmet state
DRAW: COLLECTIBLES ← per-type draw functions; bobbing animation for rare items
DRAW: PLATFORMS    ← ground vs floating platform rendering
DRAW: HUD          ← score, level, lives, remaining items, boost timer
SCREENS            ← drawStartScreen, drawLevelCompleteScreen, drawGameOverScreen, drawPauseScreen
MAIN LOOP          ← update() + render() called via requestAnimationFrame
INIT               ← initBgStars(); gameLoop()
```

#### Key Patterns

**State machine** — all input and logic branches on `state`:

```js
let state = "START"; // START | PLAYING | PAUSED | LEVEL_COMPLETE | GAME_OVER
```

**Camera** — smooth follow, world-clamped:

```js
const targetCam = player.x - W / 2 + player.w / 2;
cameraX += (targetCam - cameraX) * 0.12;
cameraX = Math.max(0, Math.min(WORLD_W - W, cameraX));
```

**Platform collision** — land-from-above only (one-way):

```js
if (px + pw > platX && px < platX + platW &&
    py + ph >= platY && py + ph <= platY + TILE_H + tolerance && vy >= 0)
```

**Proximity trigger** (collectibles & NPCs):

```js
if (Math.abs(cx - item.x) < RADIUS && Math.abs(cy - item.y) < RADIUS)
```

**Parallax** — multiply camera offset by a fraction per layer (0.18 for stars, 0.4 for bg trees).

**Particle burst**:

```js
function spawnParticles(x, y, color, count) {
  for (let i = 0; i < count; i++) {
    const angle = Math.random() * Math.PI * 2;
    const spd = 1.5 + Math.random() * 4;
    particles.push({
      x,
      y,
      vx: cos * spd,
      vy: sin * spd - 2,
      color,
      life: 40 + rand * 30,
      maxLife: 70,
      size: 3 + rand * 4,
    });
  }
}
```

**Bobbing items** — store a `bobOffset` per collectible:

```js
const bob = Math.sin(tick * 0.06 + c.bobOffset) * 4;
```

### Step 5 — Level Definitions

Each level in `LEVEL_DEFS` specifies counts and platform layout:

```js
{ acorns: 6, golden: 1, powerups: 0, npcCount: 1, platforms: [...] }
```

`loadLevel(n)` places collectibles on shuffled platforms and spawns NPCs from a name pool.

### Step 6 — README (only if requested)

Include: gameplay summary, controls table, collectibles table, NPC description, scoring table, level table, project structure, tech note (vanilla JS), license.

---

## Collectible Types Reference

| Type                | Points | Visual cue      | Special           |
| ------------------- | ------ | --------------- | ----------------- |
| Common (e.g. acorn) | +10    | Static          | —                 |
| Rare (e.g. golden)  | +50    | Bobbing + glow  | —                 |
| Power-up            | +100   | Rotating + glow | Timed player buff |

## NPC Encounter Reference

- NPCs stand on platforms, bounce gently at idle
- Name badge rendered above head with `roundRect` pill
- On contact: mark `met = true`, award points, show notification, spawn particles
- All NPCs must be met for level complete

## Quality Checklist

- [ ] `'use strict'` at top of `game.js`
- [ ] `e.preventDefault()` on arrow/space keys to stop page scroll
- [ ] World bounds enforced (`Math.max / Math.min`)
- [ ] `ctx.globalAlpha` reset to `1` after every transparency operation
- [ ] Player respawns on fall (lives-- then `resetPlayer()`)
- [ ] Each `ctx.save()` matched with `ctx.restore()`
- [ ] No `var` — use `const` / `let` throughout
