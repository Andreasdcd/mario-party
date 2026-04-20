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
}

export interface Tile {
  position: number;
  type: TileType;
}

export interface Board {
  id: string;
  name: string;
  tiles: Tile[];
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
