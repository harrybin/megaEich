# Giscus Highscore Setup

This document explains how to activate the optional GitHub-based highscore
feature that lets players post their scores via [giscus](https://giscus.app/).

Scores are stored as comments in a pinned GitHub Discussion thread.
Login is optional — players can still play without saving a score.
The highscore panel is hidden automatically whenever the game is in fullscreen
mode so it never interrupts gameplay.

---

## GitHub Repository Settings

### 1 — Enable GitHub Discussions

1. Open the repository **Settings** (⚙ tab in GitHub).
2. Scroll to the **Features** section.
3. Tick **Discussions** and save.

### 2 — Create a "Highscores" Discussion Category

1. Go to the **Discussions** tab of the repository.
2. Click **Edit categories** (pencil icon in the left sidebar).
3. Click **New category**.
4. Name: `Highscores`
5. Format: **Announcement** (so only maintainers can open new threads but
   anyone can comment — this keeps all scores in one pinned thread).
6. Save.

### 3 — Create the Pinned Highscore Discussion

1. Click **New discussion** → category **Highscores**.
2. Title: `🏆 Highscores`  *(must match the `data-term` value exactly)*
3. Body: describe the scoring rules, e.g.:
   > Post your best score below!  Use the **Copy** button in the game, then
   > paste here and add your username.
4. Pin the discussion so it stays at the top.

---

## Giscus Configuration

### 4 — Get the Repo ID and Category ID

1. Go to <https://giscus.app/>.
2. In the **Repository** field enter `harrybin/megaEich`.
3. Under **Page ↔ Discussion Mapping** choose **Specific discussion title**
   and enter `🏆 Highscores`.
4. Under **Discussion Category** choose `Highscores`.
5. Scroll to the generated `<script>` block and copy:
   - `data-repo-id="…"`
   - `data-category-id="…"`

### 5 — Update index.html

Open `index.html` and find the Giscus loader script near the bottom:

```js
const REPO_ID = "REPLACE_WITH_REPO_ID";
const CATEGORY_ID = "REPLACE_WITH_CATEGORY_ID";
```

Replace both placeholder strings with the real values from step 4, e.g.:

```js
const REPO_ID = "R_kgDOABCDEF";
const CATEGORY_ID = "DIC_kwDOABCDEF4AXXXXXX";
```

Then remove (or hide) the `#giscus-setup-notice` `<div>` from `index.html`
since it is no longer needed.

---

## How the Feature Works

| Scenario | Behaviour |
|---|---|
| Player finishes a game (Game Over) | Score display appears below the canvas; panel scrolls into view |
| Player clicks **📋 Copy** | `🐿 MegaEich score: <pts> (Level <n>)` is copied to clipboard |
| Player pastes into giscus box | Comment is posted to the Highscores discussion |
| Player is not logged in | giscus shows a "Sign in with GitHub" button |
| Game is in fullscreen mode | Highscore panel is hidden (CSS `display: none`) |

---

## Security Notes

* No custom server or token is required.
* Scores are plain text comments — nothing is stored in the repository code.
* GitHub OAuth is handled entirely by giscus; no credentials touch this page.
