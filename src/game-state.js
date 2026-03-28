/**
 * Game State Module
 * Manages game state machine: START -> PLAYING <-> PAUSED -> LEVEL_COMPLETE -> PLAYING, or GAME_OVER
 */

class GameState {
  // State constants
  static get START() { return "START"; }
  static get PLAYING() { return "PLAYING"; }
  static get PAUSED() { return "PAUSED"; }
  static get LEVEL_COMPLETE() { return "LEVEL_COMPLETE"; }
  static get GAME_OVER() { return "GAME_OVER"; }

  constructor() {
    this.currentState = GameState.START;
    this.previousState = null;
    this.stateTime = 0; // Ticks in current state
    this.stateData = {}; // Data associated with current state (e.g., level complete reason)
  }

  /**
   * Transition to a new state
   * @param {string} newState - New state value
   * @param {Object} data - Optional state data
   */
  setState(newState, data = {}) {
    // Validate state
    const validStates = [
      GameState.START,
      GameState.PLAYING,
      GameState.PAUSED,
      GameState.LEVEL_COMPLETE,
      GameState.GAME_OVER
    ];

    if (!validStates.includes(newState)) {
      console.warn(`Invalid state: ${newState}`);
      return;
    }

    // Update state
    this.previousState = this.currentState;
    this.currentState = newState;
    this.stateTime = 0;
    this.stateData = data;
  }

  /**
   * Get current state
   * @returns {string}
   */
  getState() {
    return this.currentState;
  }

  /**
   * Check if in specific state
   * @param {string} state - State to check
   * @returns {boolean}
   */
  isState(state) {
    return this.currentState === state;
  }

  /**
   * Get state data
   * @returns {Object}
   */
  getStateData() {
    return this.stateData;
  }

  /**
   * Update state timer
   * Should be called once per game tick
   */
  update() {
    this.stateTime++;
  }

  /**
   * Get time in current state (ticks)
   * @returns {number}
   */
  getStateTime() {
    return this.stateTime;
  }

  /**
   * Get time in current state (seconds)
   * @returns {number}
   */
  getStateTimeSeconds() {
    return this.stateTime / 60; // Assuming 60 FPS
  }

  /**
   * Check if state just transitioned (less than 1 tick ago)
   * @returns {boolean}
   */
  isJustTransitioned() {
    return this.stateTime === 0;
  }

  /**
   * Valid state transitions
   * Returns array of valid next states from current state
   * @returns {Array}
   */
  getValidTransitions() {
    const transitions = {
      [GameState.START]: [GameState.PLAYING],
      [GameState.PLAYING]: [GameState.PAUSED, GameState.LEVEL_COMPLETE, GameState.GAME_OVER],
      [GameState.PAUSED]: [GameState.PLAYING, GameState.GAME_OVER],
      [GameState.LEVEL_COMPLETE]: [GameState.PLAYING],
      [GameState.GAME_OVER]: [GameState.START]
    };

    return transitions[this.currentState] || [];
  }

  /**
   * Check if transition is valid
   * @param {string} newState - Proposed new state
   * @returns {boolean}
   */
  canTransitionTo(newState) {
    return this.getValidTransitions().includes(newState);
  }

  /**
   * Attempt safe state transition (checks validity)
   * @param {string} newState - Proposed new state
   * @param {Object} data - Optional state data
   * @returns {boolean} True if transition succeeded
   */
  transitionSafe(newState, data = {}) {
    if (this.canTransitionTo(newState)) {
      this.setState(newState, data);
      return true;
    }
    console.warn(`Cannot transition from ${this.currentState} to ${newState}`);
    return false;
  }

  /**
   * Pause the game (if possible)
   * @returns {boolean} True if pause succeeded
   */
  pause() {
    if (this.currentState === GameState.PLAYING) {
      this.setState(GameState.PAUSED);
      return true;
    }
    return false;
  }

  /**
   * Resume the game (if paused)
   * @returns {boolean} True if resume succeeded
   */
  resume() {
    if (this.currentState === GameState.PAUSED) {
      this.setState(GameState.PLAYING);
      return true;
    }
    return false;
  }

  /**
   * Start a new game
   * @returns {boolean}
   */
  start() {
    if (this.currentState === GameState.START) {
      this.setState(GameState.PLAYING);
      return true;
    }
    return false;
  }

  /**
   * Complete current level
   * @param {number} bonusPoints - Bonus points awarded
   * @returns {boolean}
   */
  completeLevel(bonusPoints = 0) {
    if (this.currentState === GameState.PLAYING) {
      this.setState(GameState.LEVEL_COMPLETE, { bonusPoints });
      return true;
    }
    return false;
  }

  /**
   * End the game
   * @param {string} reason - Reason for ending (e.g., "no-lives")
   * @returns {boolean}
   */
  endGame(reason = "no-lives") {
    if (this.currentState === GameState.PLAYING || this.currentState === GameState.PAUSED) {
      this.setState(GameState.GAME_OVER, { reason });
      return true;
    }
    return false;
  }

  /**
   * Next level after completion
   * @returns {boolean}
   */
  nextLevel() {
    if (this.currentState === GameState.LEVEL_COMPLETE) {
      this.setState(GameState.PLAYING);
      return true;
    }
    return false;
  }

  /**
   * Restart from game over screen
   * @returns {boolean}
   */
  restart() {
    if (this.currentState === GameState.GAME_OVER) {
      this.setState(GameState.START);
      return true;
    }
    return false;
  }

  /**
   * Get state description (for debugging)
   * @returns {string}
   */
  getDescription() {
    return `State: ${this.currentState} (${this.stateTime}t)`;
  }
}

export default GameState;

if (typeof module !== "undefined" && module.exports) {
  module.exports = GameState;
}
