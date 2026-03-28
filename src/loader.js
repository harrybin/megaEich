/**
 * Module Loader
 * Loads all game modules and makes classes available globally
 * Then initializes and starts the game
 */

// Import all Phase 1 core systems
import Player from './player.js';
import HazardSystem from './hazard-system.js';
import CollectiblesManager from './collectibles.js';
import MVPSystem from './mvp-system.js';
import ParticleSystem from './particles.js';
import InputManager from './input.js';
import NotificationManager from './notification.js';

// Import all Phase 3 game management  
import LevelManager from './level-manager.js';
import PlatformManager from './platform-manager.js';
import GameState from './game-state.js';
import Camera from './camera.js';

// Import all Phase 2 renderers
import DrawingUtils from './drawing.js';
import PlayerRenderer from './drawing-player.js';
import HazardRenderer from './drawing-hazards.js';
import CollectiblesRenderer from './drawing-collectibles.js';
import MVPRenderer from './drawing-mvp.js';
import UIRenderer from './drawing-ui.js';
import ScreenRenderer from './drawing-screens.js';
import BackgroundRenderer from './drawing-background.js';

// Import game engine
import GameEngine from './game-engine.js';

function initFullscreenControl() {
  const btn = document.getElementById("fullscreen-btn");
  const target = document.getElementById("game-shell") || document.documentElement;
  if (!btn || !target) return;

  const requestFullscreen =
    target.requestFullscreen ||
    target.webkitRequestFullscreen ||
    target.msRequestFullscreen;
  const exitFullscreen =
    document.exitFullscreen ||
    document.webkitExitFullscreen ||
    document.msExitFullscreen;

  if (typeof requestFullscreen !== "function" || typeof exitFullscreen !== "function") {
    btn.hidden = true;
    return;
  }

  const getFullscreenElement = () =>
    document.fullscreenElement ||
    document.webkitFullscreenElement ||
    document.msFullscreenElement ||
    null;

  const updateLabel = () => {
    const active = getFullscreenElement() === target;
    btn.textContent = active ? "Exit Fullscreen" : "Fullscreen";
    btn.setAttribute("aria-pressed", active ? "true" : "false");
  };

  const toggleFullscreen = async () => {
    try {
      const active = getFullscreenElement() === target;
      if (active) {
        await exitFullscreen.call(document);
      } else {
        await requestFullscreen.call(target);
      }
    } catch (error) {
      console.warn("Fullscreen toggle failed:", error);
    }
    updateLabel();
  };

  btn.addEventListener("pointerdown", (e) => {
    e.stopPropagation();
  });
  btn.addEventListener("click", (e) => {
    e.stopPropagation();
    toggleFullscreen();
  });

  window.addEventListener("keydown", (e) => {
    if (e.code === "KeyF" && !e.repeat) {
      e.preventDefault();
      toggleFullscreen();
    }
  });

  document.addEventListener("fullscreenchange", updateLabel);
  document.addEventListener("webkitfullscreenchange", updateLabel);
  updateLabel();
}

// Make classes available globally
window.Player = Player;
window.HazardSystem = HazardSystem;
window.CollectiblesManager = CollectiblesManager;
window.MVPSystem = MVPSystem;
window.ParticleSystem = ParticleSystem;
window.InputManager = InputManager;
window.NotificationManager = NotificationManager;
window.LevelManager = LevelManager;
window.PlatformManager = PlatformManager;
window.GameState = GameState;
window.Camera = Camera;
window.DrawingUtils = DrawingUtils;
window.PlayerRenderer = PlayerRenderer;
window.HazardRenderer = HazardRenderer;
window.CollectiblesRenderer = CollectiblesRenderer;
window.MVPRenderer = MVPRenderer;
window.UIRenderer = UIRenderer;
window.ScreenRenderer = ScreenRenderer;
window.BackgroundRenderer = BackgroundRenderer;
window.GameEngine = GameEngine;

// Wait for DOM ready and initialize game
function initializeGame() {
  initFullscreenControl();

  // Check for required globals
  if (!window.GAME_CONFIG) {
    console.error('GAME_CONFIG not found! Ensure game-config.js is loaded.');
    return;
  }
  
  if (!window.GAME_LEVEL_DEFS) {
    console.error('GAME_LEVEL_DEFS not found! Ensure levels.js is loaded.');
    return;
  }

  // Get canvas element
  const canvas = document.getElementById('gameCanvas');
  if (!canvas) {
    console.error('Canvas element with id "gameCanvas" not found!');
    return;
  }

  // Create and start game
  const game = new GameEngine(canvas, window.GAME_LEVEL_DEFS);

  // Start the game
  game.start();

  // Handle pause on window blur (optional)
  window.addEventListener('blur', () => {
    if (game.gameState.isState(GameState.PLAYING)) {
      game.gameState.pause();
    }
  });

  // Expose game globally for debugging
  window.megaEichGame = game;

  console.log('MegaEich game initialized and running!');
}

// Initialize when DOM is ready
if (document.readyState === 'loading') {
  document.addEventListener('DOMContentLoaded', initializeGame);
} else {
  initializeGame();
}
