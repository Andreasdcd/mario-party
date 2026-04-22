/**
 * Mini-Game Type Definitions
 */

import { Player } from './GameTypes';

/**
 * Mini-game types based on player tile distribution
 */
export enum MiniGameType {
  FFA = 'FFA',       // Free-for-all (all players landed on same color)
  TEAM_2V2 = '2v2',  // Team vs Team (2 on one color, 2 on another)
  SOLO_1V3 = '1v3'   // One vs Three (1 on one color, 3 on another)
}

/**
 * Mini-game difficulty levels
 */
export enum MiniGameDifficulty {
  EASY = 'easy',
  MEDIUM = 'medium',
  HARD = 'hard'
}

/**
 * Mini-game phase tracking
 */
export enum MiniGamePhase {
  INTRO = 'intro',           // Show mini-game intro/instructions
  COUNTDOWN = 'countdown',   // 3-2-1 countdown
  PLAYING = 'playing',       // Active gameplay
  RESULTS = 'results',       // Show results/winners
  COMPLETE = 'complete'      // Mini-game finished, ready to return
}

/**
 * Mini-game result for a single player
 */
export interface MiniGamePlayerResult {
  playerId: number;
  score: number;
  placement: number;  // 1st, 2nd, 3rd, 4th
  coinsEarned: number;
  starEarned: boolean;
}

/**
 * Overall mini-game results
 */
export interface MiniGameResults {
  miniGameId: string;
  miniGameType: MiniGameType;
  playerResults: MiniGamePlayerResult[];
  winner: Player | null;
  teamWinner?: 'team1' | 'team2' | null;  // For 2v2 games
  soloWinner?: boolean;  // For 1v3 games (true if solo won)
  duration: number;  // Time taken in ms
}

/**
 * Team assignment for 2v2 games
 */
export interface TeamAssignment {
  team1: number[];  // Player IDs
  team2: number[];  // Player IDs
}

/**
 * Solo assignment for 1v3 games
 */
export interface SoloAssignment {
  solo: number;      // Solo player ID
  team: number[];    // Team player IDs
}

/**
 * Mini-game configuration
 */
export interface MiniGameConfig {
  id: string;
  name: string;
  description: string;
  type: MiniGameType;
  difficulty: MiniGameDifficulty;
  duration: number;  // Max duration in ms (0 = no time limit)
  instructions: string[];
  controls: string[];
}

/**
 * Mini-game data passed to scene
 */
export interface MiniGameData {
  config: MiniGameConfig;
  players: Player[];
  teamAssignment?: TeamAssignment;
  soloAssignment?: SoloAssignment;
}
