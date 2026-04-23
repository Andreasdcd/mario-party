/**
 * MiniGameManager - Manages mini-game lifecycle and transitions
 *
 * Responsibilities:
 * - Start mini-games based on round completion
 * - Apply mini-game results (coins, stars) to players
 * - Coordinate transitions between main game and mini-games
 */

import * as Phaser from 'phaser';
import { GameStateManager } from './GameStateManager';
import {
  MiniGameType,
  MiniGameConfig,
  MiniGameData,
  MiniGameResults,
  TeamAssignment,
  SoloAssignment,
  MiniGameDifficulty
} from '../types/MiniGameTypes';
import { Player } from '../types/GameTypes';

export class MiniGameManager {
  private scene: Phaser.Scene;
  private gameState: GameStateManager;
  private currentMiniGame: string | null = null;

  // Registry of available mini-games
  private miniGameRegistry: Map<string, MiniGameConfig> = new Map();

  constructor(scene: Phaser.Scene, gameState: GameStateManager) {
    this.scene = scene;
    this.gameState = gameState;

    // Register mini-games (will be populated as we create them)
    this.registerMiniGames();
  }

  /**
   * Register all available mini-games
   */
  private registerMiniGames(): void {
    // FASE 5: Math Sprint (FFA)
    this.registerMiniGame({
      id: 'MathSprintScene',
      name: 'MATH SPRINT',
      description: 'Løs matematikopgaver hurtigst muligt!',
      type: MiniGameType.FFA,
      difficulty: MiniGameDifficulty.MEDIUM,
      duration: 0, // No time limit (question-based)
      instructions: [
        'Svar på 10 matematikopgaver',
        'Først til at svare rigtigt får point',
        'Flest point vinder!'
      ],
      controls: [
        'Tryk 1, 2, 3, eller 4 for at vælge svar',
        'Eller klik på svaret med musen'
      ]
    });

    // FASE 6: Team Memory (2v2)
    this.registerMiniGame({
      id: 'TeamMemoryScene',
      name: 'TEAM MEMORY',
      description: 'Find matchende par sammen med dit team!',
      type: MiniGameType.TEAM_2V2,
      difficulty: MiniGameDifficulty.MEDIUM,
      duration: 0, // No time limit
      instructions: [
        'Teams skiftes til at vælge kort',
        'Find matchende par',
        'Flest par vinder!'
      ],
      controls: [
        'Klik på kort for at vende dem',
        'Find to ens kort for et match'
      ]
    });

    // FASE 7: The Gauntlet (1v3)
    this.registerMiniGame({
      id: 'TheGauntletScene',
      name: 'THE GAUNTLET',
      description: 'Solo løber prøver at nå målet!',
      type: MiniGameType.SOLO_1V3,
      difficulty: MiniGameDifficulty.HARD,
      duration: 60000, // 60 seconds
      instructions: [
        'Solo spilleren løber gennem banen',
        'Undgå forhindringer!',
        'Nå målet før tiden løber ud'
      ],
      controls: [
        'Brug ← → piletaster for at styre',
        'Undgå røde forhindringer'
      ]
    });

    console.log('🎮 MiniGameManager: Mini-games registered');
  }

  /**
   * Register a mini-game configuration
   */
  public registerMiniGame(config: MiniGameConfig): void {
    this.miniGameRegistry.set(config.id, config);
    console.log(`✅ Registered mini-game: ${config.name} (${config.type})`);
  }

  /**
   * Start a mini-game based on type
   */
  public startMiniGame(
    type: MiniGameType,
    players: Player[],
    teamAssignment?: TeamAssignment,
    soloAssignment?: SoloAssignment,
    onComplete?: (results: MiniGameResults) => void
  ): void {
    // Find a mini-game that matches the type
    const config = this.findMiniGameByType(type);

    if (!config) {
      console.error(`❌ No mini-game registered for type: ${type}`);
      // Fallback: skip mini-game and continue
      if (onComplete) {
        const fallbackResults = this.createFallbackResults(type, players);
        onComplete(fallbackResults);
      }
      return;
    }

    console.log(`🎮 Starting mini-game: ${config.name} (${type})`);

    // Prepare mini-game data
    const miniGameData: MiniGameData & { onComplete?: (results: MiniGameResults) => void } = {
      config,
      players,
      teamAssignment,
      soloAssignment,
      onComplete: (results: MiniGameResults) => {
        this.handleMiniGameComplete(results, onComplete);
      }
    };

    // Start the mini-game scene
    this.currentMiniGame = config.id;
    this.scene.scene.start(config.id, miniGameData);
  }

  /**
   * Find a mini-game configuration by type
   */
  private findMiniGameByType(type: MiniGameType): MiniGameConfig | undefined {
    // Find first mini-game that matches the type
    for (const [_, config] of this.miniGameRegistry.entries()) {
      if (config.type === type) {
        return config;
      }
    }

    return undefined;
  }

  /**
   * Handle mini-game completion
   */
  private handleMiniGameComplete(
    results: MiniGameResults,
    onComplete?: (results: MiniGameResults) => void
  ): void {
    console.log('🏁 Mini-game complete!');
    console.log('Results:', results);

    // Apply results to game state
    this.applyResults(results);

    // Stop mini-game scene
    if (this.currentMiniGame) {
      this.scene.scene.stop(this.currentMiniGame);
      this.currentMiniGame = null;
    }

    // Resume main game scene
    this.scene.scene.resume('GameScene');

    // Call completion callback
    if (onComplete) {
      onComplete(results);
    }
  }

  /**
   * Apply mini-game results to player stats
   */
  private applyResults(results: MiniGameResults): void {
    results.playerResults.forEach(result => {
      // Add coins
      if (result.coinsEarned > 0) {
        this.gameState.addCoins(result.playerId, result.coinsEarned);
        console.log(`💰 Player ${result.playerId} earned ${result.coinsEarned} coins`);
      }

      // Add star
      if (result.starEarned) {
        this.gameState.addStar(result.playerId);
        console.log(`⭐ Player ${result.playerId} earned a star!`);
      }
    });
  }

  /**
   * Create fallback results when no mini-game is available
   */
  private createFallbackResults(type: MiniGameType, players: Player[]): MiniGameResults {
    console.warn('⚠️ Creating fallback results (no mini-game available)');

    // Random winner
    const randomIndex = Math.floor(Math.random() * players.length);
    const winner = players[randomIndex];

    const playerResults = players.map((player, index) => ({
      playerId: player.id,
      score: 0,
      placement: index + 1,
      coinsEarned: player.id === winner.id ? 5 : 0,
      starEarned: false
    }));

    return {
      miniGameId: 'fallback',
      miniGameType: type,
      playerResults,
      winner,
      duration: 0
    };
  }

  /**
   * Check if a mini-game is currently active
   */
  public isActive(): boolean {
    return this.currentMiniGame !== null;
  }

  /**
   * Get current mini-game ID
   */
  public getCurrentMiniGame(): string | null {
    return this.currentMiniGame;
  }

  /**
   * Get list of registered mini-games
   */
  public getRegisteredMiniGames(): MiniGameConfig[] {
    return Array.from(this.miniGameRegistry.values());
  }

  /**
   * Get mini-games by type
   */
  public getMiniGamesByType(type: MiniGameType): MiniGameConfig[] {
    return this.getRegisteredMiniGames().filter(config => config.type === type);
  }
}
