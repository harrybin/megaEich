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
├── index.html   — Game shell
├── style.css    — Arcade UI & canvas border styles
├── game.js      — Full canvas-based game engine
└── README.md    — This file
```

## Tech

Pure vanilla **HTML5 Canvas + JavaScript**. No frameworks, no dependencies, no build tools.

## License

MIT
