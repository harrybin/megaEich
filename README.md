# MegaEich — Mega Eichhörnchen Arcade 🐿

> A fast-paced browser arcade game where a mega Eichhörnchen collects acorns and meets legendary MVPs!

## Game Scene

```
             ╔═══════════════════════════════════════════╗
             ║        MegaEich - Gameplay                ║
             ╠═══════════════════════════════════════════╣
             ║                                           ║
             ║              ⬜          ⬜⬜⬜            ║
             ║            👤MVP         🌰 ✨ ⚡         ║
             ║                                           ║
             ║  ⬜⬜⬜  ⬜⬜⬜⬜⬜  ⬜⬜⬜⬜              ║
             ║   🌰       🐿 🌰      ✨   ⚡             ║
             ║                                           ║
             ║    ⬜⬜⬜      ⬜⬜⬜⬜⬜      ⬜⬜           ║
             ║     ✨        🌰👤MVP      🌰            ║
             ║                                           ║
             ║  ═══════════════════════════════════════  ║
             ║  🐿 Golden Eichhörnchen  Lives: ♥♥♥      ║
             ║  Score: 2450  |  Level: 5  |  Combo: x3  ║
             ║  ═══════════════════════════════════════  ║
             ╚═══════════════════════════════════════════╝

  🐿 = Eichhörnchen (You!)     🌰 = Acorn (+10 pts)
  ✨ = Golden Acorn (+50 pts)  ⚡ = Power-Up (+100 pts, speed boost)
  👤 = MVP Character (+200 pts, must meet all to complete level)
  ⬜ = Floating Platform        ♥ = Life
```

## Play

Open `index.html` in any modern browser. No install, no build step, zero dependencies.

## How to Play

Navigate the Eichhörnchen (🐿) across floating platforms to complete each level.

### Controls

| Action | Keys |
|--------|------|
| Move left / right | `← →` or `A` `D` |
| Jump | `Space`, `↑`, or `W` |
| Pause / Resume | `P` or `Esc` |

### Level Objectives

To complete a level, **you must do both**:

1. **Collect all collectibles** — find every acorn (🌰), golden acorn (✨), and power-up (⚡) scattered across the platforms
2. **Meet all MVP characters** — walk up to each MVP (👤) to greet them

**All collectibles collected + All MVPs met = Level Complete!** ✓

## Collectibles

| Item | Points | Effect |
|------|--------|--------|
| 🌰 Acorn | +10 | Common collect |
| ✨ Golden Acorn | +50 | Rare; bobs in the air |
| ⚡ Power-Up | +100 | Grants a 5-second speed boost |

## MVP Characters

MVP characters are special people standing on platforms throughout the level.
Each one has a **name badge** above their head.
Walk into an MVP to meet them and earn **+200 points**.
All MVPs must be met before the level can be completed.

## Scoring

| Event | Points |
|-------|--------|
| Acorn collected | +10 |
| Golden Acorn collected | +50 |
| Power-Up collected | +100 |
| Met an MVP | +200 |
| Level complete bonus | +500 × level |

## Lives

You start with 3 lives (♥♥♥). Falling off any platform costs a life.
Lose all three → Game Over.

## Levels

Twenty levels of increasing difficulty that loop for endless play:

| Level | Acorns | Golden Acorns | Power-Ups | MVPs |
|-------|--------|---------------|-----------|------|
| 1 | 6 | 1 | 0 | 1 |
| 2 | 9 | 2 | 1 | 2 |
| 3 | 12 | 3 | 2 | 3 |
| 4 | 15 | 4 | 3 | 5 |
| 5 | 16 | 4 | 3 | 5 |
| 6 | 17 | 4 | 3 | 5 |
| 7 | 18 | 5 | 3 | 6 |
| 8 | 19 | 5 | 3 | 6 |
| 9 | 20 | 5 | 4 | 6 |
| 10 | 21 | 6 | 4 | 6 |
| 11 | 22 | 6 | 4 | 7 |
| 12 | 23 | 6 | 4 | 7 |
| 13 | 24 | 7 | 5 | 7 |
| 14 | 25 | 7 | 5 | 7 |
| 15 | 26 | 7 | 5 | 8 |
| 16 | 26 | 8 | 5 | 8 |
| 17 | 27 | 8 | 5 | 8 |
| 18 | 28 | 8 | 6 | 8 |
| 19 | 29 | 8 | 6 | 8 |
| 20 | 30 | 9 | 6 | 8 |

## Project Structure

```
megaEich/
├── index.html      — Game shell
├── style.css       — Arcade UI & canvas border styles
├── game-config.js  — Tunable game constants and shared config
├── levels.js       — Level definitions (LEVEL_DEFS)
├── game.js         — Canvas game engine/runtime
└── README.md       — This file
```

## Tech

Pure vanilla **HTML5 Canvas + JavaScript**. No frameworks, no dependencies, no build tools.

## Agentic CI Issue Auto-Close

The repository includes an agentic GitHub Actions workflow that runs tests on every push.

On pushes to `main`, if tests pass, it will close issues referenced in the commit message using keywords like:

- `Fixes #123`
- `Closes #45`
- `Resolves #78`

If tests fail and remain unresolved after a remediation retry, the workflow creates a tracking issue for follow-up instead of closing anything.

## License

MIT
