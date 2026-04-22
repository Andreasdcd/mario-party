/**
 * Game constants and configuration
 */

export const GAME_CONFIG = {
  WIDTH: 1280,
  HEIGHT: 720,
  BACKGROUND_COLOR: '#ecf0f1',
  TITLE: 'Board Game Party'
};

export const GAME_RULES = {
  MAX_ROUNDS: 10,
  STARS_TO_WIN: 3,
  STARTING_COINS: 10,
  STARTING_STARS: 0,
  DIE_MIN: 1,
  DIE_MAX: 10  // Changed from 6 to 10
};

export const TILE_REWARDS = {
  SAFE_COINS: 5,      // Green tiles: +5 coins
  PENALTY_COINS: -5,  // Red tiles: -5 coins (cannot go below 0)
  CHALLENGE_WIN_COINS: 5,
  CHALLENGE_LOSE_COINS: -2,
  SHOP_STAR_COST: 10
};

export const PLAYER_COLORS = {
  PLAYER_1: 0xe74c3c, // Red
  PLAYER_2: 0x3498db, // Blue
  PLAYER_3: 0x2ecc71, // Green
  PLAYER_4: 0xf39c12  // Orange
};

export const TILE_COLORS = {
  START: 0x95a5a6,    // Gray
  SAFE: 0x3498db,     // Blue
  PENALTY: 0xe74c3c,  // Red
  CHALLENGE: 0xf39c12, // Yellow
  EVENT: 0x2ecc71     // Green
};

export const ANIMATIONS = {
  TOKEN_MOVE_DURATION: 500, // ms per tile
  DIE_ROLL_DURATION: 1000,
  OVERLAY_FADE_DURATION: 300
};
