# Game.js Refactoring Roadmap

## Current State
- game.js: ~1500 lines - monolithic single file
- Contains all game logic, state, rendering, and input handling

## Target State
- game.js: ~300 lines - orchestration layer only
- 10+ focused modules handling specific responsibilities

## Refactoring Plan

### Phase 1: Core Systems (DONE)
- [x] `src/player.js` - Player class with physics
- [x] `src/hazard-system.js` - Hazard collision detection
- [x] `src/collectibles.js` - Item management
- [x] `src/mvp-system.js` - NPC management
- [x] `src/particles.js` - Particle effects
- [x] `src/input.js` - Input handling
- [x] `src/notification.js` - Message system

### Phase 2: Drawing & Rendering (DONE)
- [x] `src/drawing.js` - Core drawing utilities (roundRect, etc.)
- [x] `src/drawing-player.js` - Player rendering
- [x] `src/drawing-hazards.js` - Hazard rendering (drawFire, drawTrap)
- [x] `src/drawing-collectibles.js` - Item rendering
- [x] `src/drawing-mvp.js` - NPC rendering
- [x] `src/drawing-ui.js` - HUD and UI rendering
- [x] `src/drawing-screens.js` - Start/Pause/GameOver screens
- [x] `src/drawing-background.js` - Background and parallax

### Phase 3: Game Management
- [ ] `src/level-manager.js` - Level loading and data
- [ ] `src/platform-manager.js` - Platform management
- [ ] `src/game-state.js` - State machine (START, PLAYING, PAUSED, etc.)
- [ ] `src/camera.js` - Camera controls

### Phase 4: Main Loop & Entry
- [ ] `src/game-engine.js` - Main game loop logic
- [ ] `src/index.js` - Entry point and module initialization

---

## Module Import Strategy

For browser environment, we'll use ES6 modules:

```html
<!-- In index.html -->
<script type="module">
  import Game from './src/game-engine.js';
  const game = new Game();
</script>
```

Or bundle with bundler for production.

---

## Example: Refactoring `checkCollectibles()`

### Before (in game.js):
```javascript
function checkCollectibles() {
  const cx = player.x + player.w / 2;
  const cy = player.y + player.h / 2;
  for (const c of collectibles) {
    if (c.collected) continue;
    if (Math.abs(cx - c.x) < 22 && Math.abs(cy - c.y) < 22) {
      c.collected = true;
      if (c.type === "acorn") {
        score += 10;
        // ... more code
      }
    }
  }
}
```

### After (using CollectiblesManager):
```javascript
const collectiblesManager = new CollectiblesManager();
// In initialization:
collectiblesManager.initialize(platforms, 6, 1, 0);

// In game loop:
const collected = collectiblesManager.checkCollision(
  player.getCenterX(),
  player.getCenterY()
);
if (collected) {
  const points = getPointsForCollectible(collected.type);
  score += points;
  particleSystem.spawn(collected.x, collected.y, getColorForType(collected.type), 8);
  notificationManager.show(`+${points} ${getEmojiForType(collected.type)}!`, 60);
}
```

---

## Benefits Summary

| Aspect | Before | After |
|--------|--------|-------|
| **Main File Size** | ~1500 lines | ~300 lines |
| **Testability** | Difficult | Comprehensive unit tests |
| **Reusability** | Limited | Classes usable in other projects |
| **New Features** | Risky, scattered edits | Localized to specific modules |
| **Debugging** | Hard to isolate issues | Clear stack traces to modules |
| **Performance** | Same | Slightly better (code splitting) |

---

## Migration Checklist

- [ ] Extract Player class
- [ ] Extract HazardSystem class
- [ ] Extract CollectiblesManager class
- [ ] Extract MVPSystem class
- [ ] Extract ParticleSystem class
- [ ] Extract InputManager class
- [ ] Extract NotificationManager class
- [ ] Create drawing modules
- [ ] Create level manager
- [ ] Create state machine
- [ ] Update game.js to use modules
- [ ] Update index.html to use ES6 modules
- [ ] Run full test suite
- [ ] Update documentation
- [ ] Performance optimization/bundling

---

## Testing Strategy

Each module gets its own test file:
```
src/
├── player.js
├── player.test.js
├── hazard-system.js
├── hazard-system.test.js
├── collectibles.js
├── collectibles.test.js
└── ...
```

Run with: `npm test`

---

## Performance Considerations

- Modules are compatible with bundlers (Webpack, Rollup, Vite)
- ES6 module tree-shaking removes unused code
- No performance degradation vs. monolithic approach
- Better code splitting for potential future "lazy loading"
