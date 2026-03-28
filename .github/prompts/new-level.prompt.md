---
name: new-level
description: 'Add a new level to the megaEich Mega Squirrel game. Generates a LEVEL_DEFS entry and inserts it into game.js. Use when: adding a level, extending the game with more content, increasing difficulty.'
argument-hint: 'levelNumber, platformCount, mvpCount, acorns, golden acorns, powerups (e.g. "Level 4: 14 platforms, 4 MVPs, 14 acorns, 3 golden, 2 powerups")'
---

Add a new level to `game.js` following the project conventions in `.github/copilot-instructions.md`.

## Parameters

Fill in from the user's request (use these defaults if unspecified):

| Parameter | Default |
|-----------|---------|
| `levelNumber` | next after last in `LEVEL_DEFS` |
| `platformCount` | 14 |
| `mvpCount` | 3 |
| `acorns` | 12 |
| `golden` | 3 |
| `powerups` | 2 |

## Steps

1. **Read** `game.js` — find the `LEVEL_DEFS` array to see the existing entries and determine the correct append position.

2. **Generate** a new object following this exact shape:
   ```js
   // Level <N>
   {
     acorns: <n>, golden: <n>, powerups: <n>, mvpCount: <n>,
     platforms: [
       { x: <n>, y: GROUND_Y - <offset>, w: <n> },
       // … one entry per floating platform
     ],
   },
   ```

   **Platform placement rules:**
   - Spread platforms across `x: 200` to `x: WORLD_W - 300` (world width = 3200)
   - Space platforms roughly 180–260 px apart horizontally
   - Vary `y` offsets between `60` and `230` px above `GROUND_Y`
   - Platform widths between `100` and `200` px
   - Increase difficulty vs previous levels: smaller platforms, larger gaps

3. **Insert** the new entry at the end of the `LEVEL_DEFS` array in `game.js`, before the closing `]`.

4. **Verify** no syntax errors: every object ends with a trailing comma, all brackets are balanced.

5. **Confirm** to the user: state the level number, counts, and number of platforms added.
