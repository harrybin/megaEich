# megaEich — Project Guidelines

## Architecture

This is a **zero-dependency, single-file canvas arcade game**.

- `index.html` — minimal HTML shell; loads `style.css` and `game.js` only
- `style.css` — dark arcade aesthetic; canvas border glow; no frameworks
- `game.js` — the entire game engine in one file, organised into clearly commented sections
- No build step, no bundler, no npm, no external libraries

## Code Style

- Pure **vanilla JavaScript** — no TypeScript, no JSX, no framework
- `"use strict"` at the top of `game.js`
- `const` / `let` only — never `var`
- Arrow functions for callbacks; named functions for game subsystems
- Each `ctx.save()` must be paired with a matching `ctx.restore()`
- `ctx.globalAlpha` must be reset to `1` after every transparency operation
- Formatter: **Prettier defaults** (double quotes, 2-space indent, trailing commas)

## Canvas Conventions

- Canvas size: **800 × 500 px** (`W = 800`, `H = 500`)
- World width: **3200 px** (`WORLD_W`)
- Ground at `GROUND_Y = H - 60` (440 px)
- Platform tile height: `TILE_H = 18`
- All drawing uses **plain Canvas 2D shapes** — no image assets, no sprite sheets
- Bobbing items use a per-item `bobOffset` seeded with `Math.random() * Math.PI * 2` at spawn
- Parallax layers: stars × 0.18, background trees × 0.4

## Game State Machine

States in `game.js`:  `START` → `PLAYING` ↔ `PAUSED` → `LEVEL_COMPLETE` → `PLAYING` (next level)  
                                                         → `GAME_OVER`

All input and rendering branch on the `state` variable — never skip the state check.

## Level Data

Level definitions live in `LEVEL_DEFS` (array, 0-indexed).  
`loadLevel(n)` reads `LEVEL_DEFS[(n-1) % LEVEL_DEFS.length]` and populates:
- `platforms[]` — ground slab + floating platforms from the definition
- `collectibles[]` — acorns, golden acorns, power-ups placed on shuffled platforms
- `mvps[]` — MVP characters drawn from `MVP_NAMES`, placed on platforms

## Collectibles

| Type | Points | Notes |
|------|--------|-------|
| `"acorn"` | +10 | Static |
| `"golden"` | +50 | Bobbing + glow; needs `bobOffset` |
| `"powerup"` | +100 | Rotating + glow; grants `player.speedBoost` ticks |

Proximity trigger radius: **22 px** (circle test on item centre vs player centre).

## MVP Characters

- Triggered by proximity: **36 px x, 40 px y** check
- Award **+200 pts** on first contact, set `m.met = true`
- All MVPs must be `met` AND all collectibles `collected` to trigger level complete
- Level complete bonus: `level × 500` pts

## Player

```js
{
  x, y, vx, vy,
  w: 36, h: 44,
  onGround: false,
  facing: 1,        // 1 = right, -1 = left
  walkFrame: 0,
  walkTimer: 0,
  speedBoost: 0,    // ticks remaining; adds +2.5 to MOVE_SPEED
}
```

Fall below `H + 100` → `loseLife()` → decrement `lives`; if `lives <= 0` → `state = 'GAME_OVER'`.

## Notifications

`showNotification(text, duration)` — rendered as a fading amber banner below the HUD.  
Always call after any score event.

## Adding Content

- **New collectible type**: add a draw function, add detection in `checkCollectibles()`, add to `LEVEL_DEFS` counts
- **New level**: append an entry to `LEVEL_DEFS` — specify `acorns`, `golden`, `powerups`, `mvpCount`, and `platforms[]`
- **New screen**: add a state value and a `draw*Screen()` function; branch in `update()` and `render()`
