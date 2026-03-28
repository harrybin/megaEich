/**
 * Game Entry Point
 * Initializes and starts the megaEich game
 * 
 * Note: This module expects:
 * - window.GAME_CONFIG to be available (loaded from game-config.js)
 * - window.GAME_LEVEL_DEFS to be available (loaded from levels.js)
 */

import GameEngine from './game-engine.js';

// Wait for DOM to be ready
function initializeGame() {
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
