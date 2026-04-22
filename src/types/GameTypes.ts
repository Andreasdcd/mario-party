/**
 * Core game type definitions
 */

export enum TileType {
  START = 'START',
  SAFE = 'SAFE',
  PENALTY = 'PENALTY',
  CHALLENGE = 'CHALLENGE',
  EVENT = 'EVENT'
}

export enum GamePhase {
  SETUP = 'SETUP',
  ROLL_PHASE = 'ROLL_PHASE',
  MOVE_PHASE = 'MOVE_PHASE',
  TILE_PHASE = 'TILE_PHASE',
  ROUND_SUMMARY = 'ROUND_SUMMARY',        // After all 4 players finished turn
  MINIGAME_INTRO = 'MINIGAME_INTRO',      // Team assignment
  MINIGAME_PLAY = 'MINIGAME_PLAY',        // Playing mini-game
  MINIGAME_RESULT = 'MINIGAME_RESULT',    // Show results
  CHALLENGE_PHASE = 'CHALLENGE_PHASE',
  EVENT_PHASE = 'EVENT_PHASE',
  GAME_OVER = 'GAME_OVER'
}

export enum EventType {
  SHOP = 'SHOP',
  BONUS = 'BONUS',
  STEAL = 'STEAL'
}

export enum ChallengeType {
  QUICK_MATH = 'QUICK_MATH',
  RISK_CHOICE = 'RISK_CHOICE',
  PATTERN_MATCH = 'PATTERN_MATCH'
}

export interface Player {
  id: number;
  name: string;
  position: number;
  coins: number;
  stars: number;
  color: number; // Hex color for player token
  isNPC: boolean;
  difficulty?: 'easy' | 'medium' | 'hard'; // Only for NPCs
}

export interface Tile {
  position: number;
  type: TileType;
  x: number;  // World X coordinate (required for camera system)
  y: number;  // World Y coordinate (required for camera system)
}

export interface Board {
  id: string;
  name: string;
  tiles: Tile[];
  worldWidth: number;   // Total world width for camera bounds
  worldHeight: number;  // Total world height for camera bounds
}

export interface GameState {
  players: Player[];
  currentPlayerIndex: number;
  currentRound: number;
  board: Board;
  gamePhase: GamePhase;
  winner: Player | null;
}

export interface ChallengeResult {
  winnerId: number;
  loserId: number;
  coinsChanged: number;
}

export interface EventResult {
  type: EventType;
  playerId: number;
  data: any;
}
