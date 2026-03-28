# MegaEich — Mega Eichhörnchen Arcade 🐿

> A fast-paced browser arcade game where a mega Eichhörnchen collects acorns and meets legendary MVPs!

## Play

Open `index.html` in any modern browser. No install, no build step, zero dependencies.

## How to Play

| Action | Keys |
|--------|------|
| Move left / right | `← →` or `A` `D` |
| Jump | `Space`, `↑`, or `W` |
| Pause / Resume | `P` or `Esc` |

## Objective

Complete each level by doing **both** of the following:

1. **Collecting all items** — find every acorn, golden acorn, and power-up scattered across the floating platforms
2. **Meeting every MVP** — walk up to each MVP character on the platforms to introduce yourself

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

Three levels of increasing difficulty that loop for endless play:

| Level | Acorns | Golden Acorns | Power-Ups | MVPs |
|-------|--------|---------------|-----------|------|
| 1 | 6 | 1 | 0 | 1 |
| 2 | 9 | 2 | 1 | 2 |
| 3 | 12 | 3 | 2 | 3 |

## Project Structure

```
megaEich/
├── index.html   — Game shell
├── style.css    — Arcade UI & canvas border styles
├── game.js      — Full canvas-based game engine
└── README.md    — This file
```

## Tech

Pure vanilla **HTML5 Canvas + JavaScript**. No frameworks, no dependencies, no build tools.

## License

MIT
