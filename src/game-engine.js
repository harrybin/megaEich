/**
 * Game Engine Module
 * Main game loop and orchestration layer
 * Ties together all Phase 1-3 modules into a complete game
 */

class GameEngine {
  constructor(canvas, levelDefs) {
    this.canvas = canvas;
    this.ctx = canvas.getContext('2d');
    this.W = canvas.width;
    this.H = canvas.height;
    
    // Game constants
    this.GRAVITY = window.GAME_CONFIG?.GRAVITY || 0.6;
    this.JUMP_FORCE = window.GAME_CONFIG?.JUMP_FORCE || 14;
    this.MOVE_SPEED = window.GAME_CONFIG?.MOVE_SPEED || 4;
    this.GROUND_Y = window.GAME_CONFIG?.GROUND_Y || (this.H - 60);
    this.WORLD_W = window.GAME_CONFIG?.WORLD_W || 3200;
    this.TILE_H = window.GAME_CONFIG?.TILE_H || 18;

    // Will be initialized in setup()
    this.player = null;
    this.levelDefs = levelDefs;
    
    // Game state
    this.score = 0;
    this.lives = 3;
    this.level = 1;
    this.tick = 0;
    this.isRunning = false;

    // Track if setup has been called
    this._setupComplete = false;
  }

  /**
   * Setup all systems (call after modules are loaded)
   */
  setup() {
    if (this._setupComplete) return;

    // Phase 1: Core Systems (expect these to be available globally after modules load)
    this.player = new Player(100, this.GROUND_Y - 44);
    this.hazardSystem = new HazardSystem();
    this.collectibles = new CollectiblesManager();
    this.mvpSystem = new MVPSystem();
    this.particles = new ParticleSystem();
    this.input = new InputManager();
    this.notifications = new NotificationManager();

    // Phase 3: Game Management
    this.levelManager = new LevelManager();
    this.platformManager = new PlatformManager();
    this.gameState = new GameState();
    this.camera = new Camera(this.W, this.H, this.WORLD_W);

    // Phase 2: Renderers
    this.drawingUtils = new DrawingUtils(this.ctx);
    this.playerRenderer = new PlayerRenderer(this.ctx);
    this.hazardRenderer = new HazardRenderer(this.ctx);
    this.collectiblesRenderer = new CollectiblesRenderer(this.ctx);
    this.mvpRenderer = new MVPRenderer(this.ctx);
    this.uiRenderer = new UIRenderer(this.ctx, this.W, this.H);
    this.screenRenderer = new ScreenRenderer(this.ctx, this.W, this.H);
    this.backgroundRenderer = new BackgroundRenderer(this.ctx, this.W, this.H);

    // Initialize systems
    this.levelManager.initialize(this.levelDefs);
    this.input.init();

    this._setupComplete = true;
  }

  /**
   * Start the game
   */
  start() {
    this.setup();
    this.isRunning = true;
    this.gameState.setState(GameState.START);
    this.loadLevel(1);
    this.gameLoop();
  }

  /**
   * Load a specific level
   */
  loadLevel(levelNum) {
    const levelData = this.levelManager.loadLevel(levelNum);
    this.level = levelNum;

    // Initialize platforms
    this.platformManager.setPlatforms(levelData.platforms);

    // Initialize hazards
    this.hazardSystem.initialize(levelData.hazards);

    // Initialize collectibles
    this.collectibles.initialize(levelData.collectibles);

    // Initialize MVPs
    this.mvpSystem.initialize(levelData.mvps);

    // Reset player
    this.player.x = 100;
    this.player.y = this.GROUND_Y - 44;
    this.player.vx = 0;
    this.player.vy = 0;

    // Reset camera
    this.camera.reset();
  }

  /**
   * Main game loop
   */
  gameLoop = () => {
    if (!this.isRunning) return;

    this.update();
    this.render();
    requestAnimationFrame(this.gameLoop);
  };

  /**
   * Update game state
   */
  update() {
    this.tick++;
    this.gameState.update();
    this.notifications.update();
    this.particles.update();

    switch (this.gameState.getState()) {
      case GameState.START:
        this.updateStart();
        break;
      case GameState.PLAYING:
        this.updatePlaying();
        break;
      case GameState.PAUSED:
        // No updates while paused
        break;
      case GameState.LEVEL_COMPLETE:
        this.updateLevelComplete();
        break;
      case GameState.GAME_OVER:
        // No updates while game over
        break;
    }
  }

  /**
   * Update start screen
   */
  updateStart() {
    if (this.input.isKeyPressed(' ')) {
      this.gameState.start();
    }
  }

  /**
   * Update gameplay
   */
  updatePlaying() {
    // Input handling
    if (this.input.isKeyPressed('p') || this.input.isKeyPressed('P')) {
      this.gameState.pause();
      this.input.clearKey('p');
      this.input.clearKey('P');
      return;
    }

    // Player physics
    const moveDir = this.input.getMovementDirection();
    this.player.update(moveDir, this.MOVE_SPEED, this.GRAVITY, this.JUMP_FORCE, this.input);

    // Platform collision
    const platform = this.platformManager.checkPlatformCollision(this.player);
    if (platform && this.player.vy >= 0) {
      this.player.y = platform.y - this.player.h;
      this.player.vy = 0;
      this.player.onGround = true;
    } else if (this.player.y > this.H + 100) {
      // Fall off world
      this.loseLife();
      return;
    }

    // Hazard collision
    if (this.hazardSystem.checkCollision(this.player)) {
      this.particles.spawn(this.player.x + this.player.w / 2, this.player.y + this.player.h / 2, "#FF4500", 8);
      this.notifications.show("🔥 Ouch! Stay away from fire!", 60);
      this.loseLife();
      return;
    }

    // Collectible collision
    const collected = this.collectibles.checkCollision(
      this.player.x + this.player.w / 2,
      this.player.y + this.player.h / 2
    );
    if (collected) {
      const points = collected.type === "acorn" ? 10 : collected.type === "golden" ? 50 : 100;
      this.score += points;
      const emoji = collected.type === "acorn" ? "🌰" : collected.type === "golden" ? "✨" : "⭐";
      this.notifications.show(`+${points} ${emoji}`, 60);
      this.particles.spawn(collected.x, collected.y, "#FFD700", 8);
      if (collected.type === "powerup") {
        this.player.speedBoost = 300;
      }
    }

    // MVP collision
    const mvpMet = this.mvpSystem.checkCollision(
      this.player.x + this.player.w / 2,
      this.player.y + this.player.h / 2
    );
    if (mvpMet) {
      this.score += 200;
      this.notifications.show(`Met ${mvpMet.name}! +200 pts`, 60);
      this.particles.spawn(mvpMet.x, mvpMet.y, "#00FFFF", 12);
    }

    // Camera update
    this.camera.update(this.player);

    // Check level completion
    if (this.levelManager.allCollectiblesCollected() && this.levelManager.allMVPsMet()) {
      const bonus = this.levelManager.getLevelBonusPoints();
      this.score += bonus;
      this.gameState.completeLevel(bonus);
    }
  }

  /**
   * Update level complete screen
   */
  updateLevelComplete() {
    if (this.input.isKeyPressed(' ')) {
      this.gameState.nextLevel();
      this.loadLevel(this.level + 1);
      this.input.clearKey(' ');
    }
  }

  /**
   * Lose a life
   */
  loseLife() {
    this.lives--;
    if (this.lives <= 0) {
      this.gameState.endGame("no-lives");
    } else {
      // Respawn player
      this.player.x = 100;
      this.player.y = this.GROUND_Y - 44;
      this.player.vx = 0;
      this.player.vy = 0;
    }
  }

  /**
   * Render game
   */
  render() {
    // Clear canvas
    this.ctx.fillStyle = "#000";
    this.ctx.fillRect(0, 0, this.W, this.H);

    switch (this.gameState.getState()) {
      case GameState.START:
        this.renderStartScreen();
        break;
      case GameState.PLAYING:
        this.renderPlayingScreen();
        break;
      case GameState.PAUSED:
        this.renderPlayingScreen();
        this.screenRenderer.drawPauseScreen(this.tick);
        break;
      case GameState.LEVEL_COMPLETE:
        this.renderLevelCompleteScreen();
        break;
      case GameState.GAME_OVER:
        this.renderGameOverScreen();
        break;
    }
  }

  /**
   * Render start screen
   */
  renderStartScreen() {
    this.screenRenderer.drawStartScreen(this.tick);
  }

  /**
   * Render playing screen
   */
  renderPlayingScreen() {
    const cameraX = this.camera.getX();

    // Background layers
    this.backgroundRenderer.drawBackground(cameraX, this.tick);

    // Save canvas state for screen-space translations
    this.ctx.save();
    this.ctx.translate(-cameraX, 0);

    // Draw hazards
    for (const hazard of this.hazardSystem.hazards) {
      this.hazardRenderer.drawHazard(hazard, cameraX, this.tick);
    }

    // Draw collectibles
    for (const collectible of this.collectibles.collectibles) {
      if (!collectible.collected) {
        this.collectiblesRenderer.drawCollectible(collectible, cameraX, this.tick);
      }
    }

    // Draw MVPs
    for (const mvp of this.mvpSystem.mvps) {
      this.mvpRenderer.drawMVP(mvp, cameraX, this.tick);
    }

    // Draw player
    this.playerRenderer.draw(
      this.player.x,
      this.player.y,
      this.player.facing,
      this.player.walkFrame,
      this.player.speedBoost > 0 ? 1 : 0,
      this.tick
    );

    // Draw particles
    for (const p of this.particles.particles) {
      this.ctx.fillStyle = p.color;
      this.ctx.globalAlpha = p.life / p.maxLife;
      this.ctx.beginPath();
      this.ctx.arc(p.x, p.y, p.size, 0, Math.PI * 2);
      this.ctx.fill();
    }
    this.ctx.globalAlpha = 1;

    // Draw ground platforms
    this.backgroundRenderer.drawGround(cameraX, this.platformManager.getPlatforms());

    this.ctx.restore();

    // Draw HUD and UI (screen-space, not translated)
    this.uiRenderer.drawHUD(
      this.score,
      this.level,
      this.lives,
      this.levelManager.getUncollectedCount(),
      this.levelManager.getUnmetMVPCount()
    );

    // Draw notifications
    if (this.notifications.isActive) {
      const alpha = this.notifications.age < 30 ? 1 : Math.max(0, 1 - (this.notifications.age - 30) / 30);
      this.uiRenderer.drawNotification(this.notifications.text, alpha);
    }
  }

  /**
   * Render level complete screen
   */
  renderLevelCompleteScreen() {
    this.renderPlayingScreen();
    const bonus = this.gameState.getStateData().bonusPoints || 0;
    this.screenRenderer.drawLevelCompleteScreen(
      this.level,
      this.score,
      bonus,
      this.tick
    );
  }

  /**
   * Render game over screen
   */
  renderGameOverScreen() {
    this.screenRenderer.drawGameOverScreen(this.score, this.level, this.tick);

    // Handle restart
    if (this.input.isKeyPressed(' ')) {
      this.gameState.restart();
      this.resetGame();
      this.input.clearKey(' ');
    }
  }

  /**
   * Reset game to beginning
   */
  resetGame() {
    this.score = 0;
    this.lives = 3;
    this.level = 1;
    this.tick = 0;
    this.gameState.setState(GameState.START);
  }

  /**
   * Resume from pause
   */
  resume() {
    if (this.gameState.isState(GameState.PAUSED)) {
      this.gameState.resume();
    }
  }

  /**
   * Stop the game
   */
  stop() {
    this.isRunning = false;
  }
}

export default GameEngine;

  /**
   * Start the game
   */
  start() {
    this.isRunning = true;
    this.gameState.setState(GameState.START);
    this.loadLevel(1);
    this.gameLoop();
  }

  /**
   * Load a specific level
   */
  loadLevel(levelNum) {
    const levelData = this.levelManager.loadLevel(levelNum);
    this.level = levelNum;

    // Initialize platforms
    this.platformManager.setPlatforms(levelData.platforms);

    // Initialize hazards
    this.hazardSystem.initialize(levelData.hazards);

    // Initialize collectibles
    this.collectibles.initialize(levelData.collectibles);

    // Initialize MVPs
    this.mvpSystem.initialize(levelData.mvps);

    // Reset player
    if (!this.player) {
      this.player = new Player(100, this.GROUND_Y - 44);
    } else {
      this.player.x = 100;
      this.player.y = this.GROUND_Y - 44;
      this.player.vx = 0;
      this.player.vy = 0;
    }

    // Reset camera
    this.camera.reset();
  }

  /**
   * Main game loop
   */
  gameLoop = () => {
    if (!this.isRunning) return;

    this.update();
    this.render();
    requestAnimationFrame(this.gameLoop);
  };

  /**
   * Update game state
   */
  update() {
    this.tick++;
    this.gameState.update();
    this.notifications.update();
    this.particles.update();

    switch (this.gameState.getState()) {
      case GameState.START:
        this.updateStart();
        break;
      case GameState.PLAYING:
        this.updatePlaying();
        break;
      case GameState.PAUSED:
        // No updates while paused
        break;
      case GameState.LEVEL_COMPLETE:
        this.updateLevelComplete();
        break;
      case GameState.GAME_OVER:
        // No updates while game over
        break;
    }
  }

  /**
   * Update start screen
   */
  updateStart() {
    if (this.input.isKeyPressed(' ')) {
      this.gameState.start();
    }
  }

  /**
   * Update gameplay
   */
  updatePlaying() {
    // Input handling
    if (this.input.isKeyPressed('p') || this.input.isKeyPressed('P')) {
      this.gameState.pause();
      this.input.clearKey('p');
      this.input.clearKey('P');
      return;
    }

    // Player physics
    const moveDir = this.input.getMovementDirection();
    this.player.update(moveDir, this.MOVE_SPEED, this.GRAVITY, this.JUMP_FORCE, this.input);

    // Platform collision
    const platform = this.platformManager.checkPlatformCollision(this.player);
    if (platform && this.player.vy >= 0) {
      this.player.y = platform.y - this.player.h;
      this.player.vy = 0;
      this.player.onGround = true;
    } else if (this.player.y > this.H + 100) {
      // Fall off world
      this.loseLife();
      return;
    }

    // Hazard collision
    if (this.hazardSystem.checkCollision(this.player)) {
      this.particles.spawn(this.player.x + this.player.w / 2, this.player.y + this.player.h / 2, "#FF4500", 8);
      this.notifications.show("🔥 Ouch! Stay away from fire!", 60);
      this.loseLife();
      return;
    }

    // Collectible collision
    const collected = this.collectibles.checkCollision(
      this.player.x + this.player.w / 2,
      this.player.y + this.player.h / 2
    );
    if (collected) {
      const points = collected.type === "acorn" ? 10 : collected.type === "golden" ? 50 : 100;
      this.score += points;
      const emoji = collected.type === "acorn" ? "🌰" : collected.type === "golden" ? "✨" : "⭐";
      this.notifications.show(`+${points} ${emoji}`, 60);
      this.particles.spawn(collected.x, collected.y, "#FFD700", 8);
      if (collected.type === "powerup") {
        this.player.speedBoost = 300;
      }
    }

    // MVP collision
    const mvpMet = this.mvpSystem.checkCollision(
      this.player.x + this.player.w / 2,
      this.player.y + this.player.h / 2
    );
    if (mvpMet) {
      this.score += 200;
      this.notifications.show(`Met ${mvpMet.name}! +200 pts`, 60);
      this.particles.spawn(mvpMet.x, mvpMet.y, "#00FFFF", 12);
    }

    // Camera update
    this.camera.update(this.player);

    // Check level completion
    if (this.levelManager.allCollectiblesCollected() && this.levelManager.allMVPsMet()) {
      const bonus = this.levelManager.getLevelBonusPoints();
      this.score += bonus;
      this.gameState.completeLevel(bonus);
    }
  }

  /**
   * Update level complete screen
   */
  updateLevelComplete() {
    if (this.input.isKeyPressed(' ')) {
      this.gameState.nextLevel();
      this.loadLevel(this.level + 1);
      this.input.clearKey(' ');
    }
  }

  /**
   * Lose a life
   */
  loseLife() {
    this.lives--;
    if (this.lives <= 0) {
      this.gameState.endGame("no-lives");
    } else {
      // Respawn player
      this.player.x = 100;
      this.player.y = this.GROUND_Y - 44;
      this.player.vx = 0;
      this.player.vy = 0;
    }
  }

  /**
   * Render game
   */
  render() {
    // Clear canvas
    this.ctx.fillStyle = "#000";
    this.ctx.fillRect(0, 0, this.W, this.H);

    switch (this.gameState.getState()) {
      case GameState.START:
        this.renderStartScreen();
        break;
      case GameState.PLAYING:
        this.renderPlayingScreen();
        break;
      case GameState.PAUSED:
        this.renderPlayingScreen();
        this.screenRenderer.drawPauseScreen(this.tick);
        break;
      case GameState.LEVEL_COMPLETE:
        this.renderLevelCompleteScreen();
        break;
      case GameState.GAME_OVER:
        this.renderGameOverScreen();
        break;
    }
  }

  /**
   * Render start screen
   */
  renderStartScreen() {
    this.screenRenderer.drawStartScreen(this.tick);
  }

  /**
   * Render playing screen
   */
  renderPlayingScreen() {
    const cameraX = this.camera.getX();

    // Background layers
    this.backgroundRenderer.drawBackground(cameraX, this.tick);

    // Save canvas state for screen-space translations
    this.ctx.save();
    this.ctx.translate(-cameraX, 0);

    // Draw hazards
    for (const hazard of this.hazardSystem.hazards) {
      this.hazardRenderer.drawHazard(hazard, cameraX, this.tick);
    }

    // Draw collectibles
    for (const collectible of this.collectibles.collectibles) {
      if (!collectible.collected) {
        this.collectiblesRenderer.drawCollectible(collectible, cameraX, this.tick);
      }
    }

    // Draw MVPs
    for (const mvp of this.mvpSystem.mvps) {
      this.mvpRenderer.drawMVP(mvp, cameraX, this.tick);
    }

    // Draw player
    this.playerRenderer.draw(
      this.player.x,
      this.player.y,
      this.player.facing,
      this.player.walkFrame,
      this.player.speedBoost > 0 ? 1 : 0,
      this.tick
    );

    // Draw particles
    for (const p of this.particles.particles) {
      this.ctx.fillStyle = p.color;
      this.ctx.globalAlpha = p.life / p.maxLife;
      this.ctx.beginPath();
      this.ctx.arc(p.x, p.y, p.size, 0, Math.PI * 2);
      this.ctx.fill();
    }
    this.ctx.globalAlpha = 1;

    // Draw ground platforms
    this.backgroundRenderer.drawGround(cameraX, this.platformManager.getPlatforms());

    this.ctx.restore();

    // Draw HUD and UI (screen-space, not translated)
    this.uiRenderer.drawHUD(
      this.score,
      this.level,
      this.lives,
      this.levelManager.getUncollectedCount(),
      this.levelManager.getUnmetMVPCount()
    );

    // Draw notifications
    if (this.notifications.isActive) {
      const alpha = this.notifications.age < 30 ? 1 : Math.max(0, 1 - (this.notifications.age - 30) / 30);
      this.uiRenderer.drawNotification(this.notifications.text, alpha);
    }
  }

  /**
   * Render level complete screen
   */
  renderLevelCompleteScreen() {
    this.renderPlayingScreen();
    const bonus = this.gameState.getStateData().bonusPoints || 0;
    this.screenRenderer.drawLevelCompleteScreen(
      this.level,
      this.score,
      bonus,
      this.tick
    );
  }

  /**
   * Render game over screen
   */
  renderGameOverScreen() {
    this.screenRenderer.drawGameOverScreen(this.score, this.level, this.tick);

    // Handle restart
    if (this.input.isKeyPressed(' ')) {
      this.gameState.restart();
      this.resetGame();
      this.input.clearKey(' ');
    }
  }

  /**
   * Reset game to beginning
   */
  resetGame() {
    this.score = 0;
    this.lives = 3;
    this.level = 1;
    this.tick = 0;
    this.gameState.setState(GameState.START);
  }

  /**
   * Resume from pause
   */
  resume() {
    if (this.gameState.isState(GameState.PAUSED)) {
      this.gameState.resume();
    }
  }

  /**
   * Stop the game
   */
  stop() {
    this.isRunning = false;
  }
}

export default GameEngine;
