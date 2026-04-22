/**
 * Round Manager - Tracks rounds and triggers mini-games
 */

import { GameStateManager } from './GameStateManager';
import { GamePhase } from '../types/GameTypes';

export interface RoundData {
  roundNumber: number;
  playerTileColors: Map<number, string[]>; // playerId -> array of tile colors landed on this round
  miniGameType: 'FFA' | '2v2' | '1v3' | null;
}

export class RoundManager {
  private gameState: GameStateManager;
  private currentRound: number = 1;
  private maxRounds: number = 10;
  private playerTileColors: Map<number, string[]> = new Map();
  private turnsThisRound: number = 0;
  private totalPlayers: number;
  private listeners: Map<string, Function[]> = new Map();

  constructor(gameState: GameStateManager, maxRounds: number = 10) {
    this.gameState = gameState;
    this.maxRounds = maxRounds;
    this.totalPlayers = gameState.getState().players.length;

    // Initialize tile color tracking for each player
    this.initializeTileTracking();

    // Listen for player movements to track tile colors
    this.setupEventListeners();
  }

  /**
   * Initialize tile color tracking for all players
   */
  private initializeTileTracking(): void {
    const players = this.gameState.getState().players;
    players.forEach(player => {
      this.playerTileColors.set(player.id, []);
    });
  }

  /**
   * Setup event listeners to track game events
   */
  private setupEventListeners(): void {
    // Track when players land on tiles
    this.gameState.on('PLAYER_MOVED', (data: any) => {
      const player = this.gameState.getPlayer(data.playerId);
      if (player) {
        const tile = this.gameState.getTileAt(player.position);
        if (tile) {
          // Record the tile type (color) the player landed on
          const colors = this.playerTileColors.get(player.id) || [];
          colors.push(tile.type);
          this.playerTileColors.set(player.id, colors);
        }
      }
    });

    // Track turn completions to know when round ends
    this.gameState.on('TURN_CHANGED', () => {
      this.turnsThisRound++;

      // Check if round is complete (all players have had their turn)
      if (this.turnsThisRound >= this.totalPlayers) {
        this.endRound();
      }
    });
  }

  /**
   * Get current round number
   */
  public getCurrentRound(): number {
    return this.currentRound;
  }

  /**
   * Get maximum rounds
   */
  public getMaxRounds(): number {
    return this.maxRounds;
  }

  /**
   * Check if game should end after this round
   */
  public isLastRound(): boolean {
    return this.currentRound >= this.maxRounds;
  }

  /**
   * Get tile colors for a specific player this round
   */
  public getPlayerTileColors(playerId: number): string[] {
    return this.playerTileColors.get(playerId) || [];
  }

  /**
   * End the current round and trigger mini-game phase
   */
  private endRound(): void {
    console.log(`🏁 Round ${this.currentRound} complete!`);

    // Determine mini-game type based on round number
    const miniGameType = this.determineMiniGameType();

    // Create round data
    const roundData: RoundData = {
      roundNumber: this.currentRound,
      playerTileColors: new Map(this.playerTileColors),
      miniGameType
    };

    // Emit round end event
    this.emit('ROUND_COMPLETE', roundData);

    // Change to round summary phase
    this.gameState.setPhase(GamePhase.ROUND_SUMMARY);

    // If there's a mini-game, it will be triggered after summary
    if (miniGameType) {
      console.log(`🎮 Mini-game type: ${miniGameType}`);
    }
  }

  /**
   * Determine which mini-game type based on last tile color landed
   * - All landed on same color → FFA
   * - 2 on one color, 2 on another → 2v2
   * - 3 on one color, 1 on another → 1v3
   */
  private determineMiniGameType(): 'FFA' | '2v2' | '1v3' | null {
    if (this.currentRound >= this.maxRounds) {
      return null; // No mini-game on final round
    }

    // Get last tile color for each player (what they landed on this turn)
    const lastTileColors = Array.from(this.playerTileColors.entries()).map(([playerId, colors]) => {
      const lastColor = colors[colors.length - 1]; // Last tile they landed on
      return { playerId, lastColor };
    });

    // Count how many landed on SAFE vs PENALTY
    const safeCount = lastTileColors.filter(p => p.lastColor === 'SAFE').length;
    const penaltyCount = lastTileColors.filter(p => p.lastColor === 'PENALTY').length;

    console.log(`🎮 Mini-game determination: ${safeCount} on SAFE, ${penaltyCount} on PENALTY`);

    // All on same color → FFA
    if (safeCount === 4 || penaltyCount === 4) {
      return 'FFA'; // Everyone landed on same color
    }

    // 2 on one color, 2 on another → 2v2
    if (safeCount === 2 && penaltyCount === 2) {
      return '2v2'; // Even split
    }

    // 3 on one color, 1 on another → 1v3
    if (safeCount === 3 || penaltyCount === 3) {
      return '1v3'; // One player different from others
    }

    // Fallback (shouldn't happen with 4 players)
    return 'FFA';
  }

  /**
   * Get team assignment for 2v2 mini-game based on last tile color
   * Players who landed on same color are on same team
   */
  public get2v2TeamAssignment(): { team1: number[]; team2: number[] } {
    const lastTileColors = Array.from(this.playerTileColors.entries()).map(([playerId, colors]) => {
      const lastColor = colors[colors.length - 1];
      return { playerId, lastColor };
    });

    // Split into teams based on last tile color
    const safeTeam = lastTileColors.filter(p => p.lastColor === 'SAFE').map(p => p.playerId);
    const penaltyTeam = lastTileColors.filter(p => p.lastColor === 'PENALTY').map(p => p.playerId);

    return {
      team1: safeTeam,   // Players who landed on SAFE (green)
      team2: penaltyTeam // Players who landed on PENALTY (red)
    };
  }

  /**
   * Get solo player assignment for 1v3 mini-game
   * The one player who landed on different color is solo
   */
  public get1v3SoloPlayer(): { solo: number; team: number[] } {
    const lastTileColors = Array.from(this.playerTileColors.entries()).map(([playerId, colors]) => {
      const lastColor = colors[colors.length - 1];
      return { playerId, lastColor };
    });

    // Count how many on each color
    const safeCount = lastTileColors.filter(p => p.lastColor === 'SAFE').length;

    // If 3 on SAFE, 1 on PENALTY → the PENALTY player is solo
    if (safeCount === 3) {
      const soloPlayer = lastTileColors.find(p => p.lastColor === 'PENALTY')!;
      const teamPlayers = lastTileColors.filter(p => p.lastColor === 'SAFE').map(p => p.playerId);
      return {
        solo: soloPlayer.playerId,
        team: teamPlayers
      };
    }

    // If 1 on SAFE, 3 on PENALTY → the SAFE player is solo
    const soloPlayer = lastTileColors.find(p => p.lastColor === 'SAFE')!;
    const teamPlayers = lastTileColors.filter(p => p.lastColor === 'PENALTY').map(p => p.playerId);
    return {
      solo: soloPlayer.playerId,
      team: teamPlayers
    };
  }

  /**
   * Start the next round
   */
  public startNextRound(): void {
    this.currentRound++;
    this.turnsThisRound = 0;

    // Reset tile color tracking for new round
    this.playerTileColors.clear();
    this.initializeTileTracking();

    console.log(`🆕 Starting Round ${this.currentRound}/${this.maxRounds}`);

    // Emit round start event
    this.emit('ROUND_START', {
      roundNumber: this.currentRound,
      isLastRound: this.isLastRound()
    });

    // Return to normal gameplay
    this.gameState.setPhase(GamePhase.ROLL_PHASE);
  }

  /**
   * Get summary of current round
   */
  public getRoundSummary(): RoundData {
    return {
      roundNumber: this.currentRound,
      playerTileColors: new Map(this.playerTileColors),
      miniGameType: this.determineMiniGameType()
    };
  }

  // Event system (matching GameStateManager pattern)
  public on(event: string, callback: Function): void {
    if (!this.listeners.has(event)) {
      this.listeners.set(event, []);
    }
    this.listeners.get(event)!.push(callback);
  }

  public off(event: string, callback: Function): void {
    if (!this.listeners.has(event)) return;
    const callbacks = this.listeners.get(event)!;
    const index = callbacks.indexOf(callback);
    if (index > -1) {
      callbacks.splice(index, 1);
    }
  }

  private emit(event: string, data?: any): void {
    if (this.listeners.has(event)) {
      this.listeners.get(event)!.forEach(callback => callback(data));
    }
  }

  /**
   * Cleanup
   */
  public destroy(): void {
    this.listeners.clear();
  }
}
