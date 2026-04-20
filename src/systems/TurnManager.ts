/**
 * Turn Manager - Handles turn flow and player actions
 */

import { GameStateManager } from './GameStateManager';
import { GamePhase } from '../types/GameTypes';
import { GAME_RULES } from '../utils/Constants';

export class TurnManager {
  private gameState: GameStateManager;
  private diceRollResult: number = 0;

  constructor(gameState: GameStateManager) {
    this.gameState = gameState;
  }

  /**
   * Start a new turn for the current player
   */
  public startTurn(): void {
    const player = this.gameState.getCurrentPlayer();
    console.log(`=== ${player.name}'s Turn (Round ${this.gameState.getState().currentRound}) ===`);

    // Set phase to roll
    this.gameState.setPhase(GamePhase.ROLL_PHASE);
  }

  /**
   * Roll the dice (random 1-6)
   */
  public rollDice(): number {
    this.diceRollResult = Math.floor(Math.random() * GAME_RULES.DIE_MAX) + GAME_RULES.DIE_MIN;
    console.log(`Dice roll: ${this.diceRollResult}`);

    // Move to movement phase
    this.gameState.setPhase(GamePhase.MOVE_PHASE);

    return this.diceRollResult;
  }

  /**
   * Move the current player based on dice roll
   */
  public async movePlayer(): Promise<void> {
    const player = this.gameState.getCurrentPlayer();

    // Move player
    this.gameState.movePlayer(player.id, this.diceRollResult);

    // Wait for animation (placeholder - will be implemented by UI/UX Agent)
    await this.sleep(500 * this.diceRollResult);

    // Move to tile resolution phase
    this.gameState.setPhase(GamePhase.TILE_PHASE);
  }

  /**
   * Resolve the tile effect where player landed
   * Returns true if turn should continue, false if blocked (e.g., challenge)
   */
  public resolveTileEffect(): boolean {
    const player = this.gameState.getCurrentPlayer();
    const tile = this.gameState.getTileAt(player.position);

    if (!tile) {
      console.error('Invalid tile position');
      return true;
    }

    console.log(`${player.name} landed on ${tile.type} tile`);

    // Tile effects will be handled by TileEffectManager
    // For now, just log and continue
    // This will be implemented next

    return true; // Continue to next turn
  }

  /**
   * End the current turn and move to next player
   */
  public endTurn(): void {
    const winner = this.gameState.checkWinCondition();

    if (winner) {
      console.log(`🎉 ${winner.name} wins!`);
      return;
    }

    // Move to next player
    this.gameState.nextTurn();

    // Start next turn
    this.startTurn();
  }

  /**
   * Execute a complete turn (for AI or automated testing)
   */
  public async executeTurn(): Promise<void> {
    this.startTurn();
    this.rollDice();
    await this.movePlayer();

    const shouldContinue = this.resolveTileEffect();

    if (shouldContinue) {
      this.endTurn();
    }
  }

  /**
   * Get the last dice roll result
   */
  public getLastDiceRoll(): number {
    return this.diceRollResult;
  }

  /**
   * Helper: Sleep for animations
   */
  private sleep(ms: number): Promise<void> {
    return new Promise(resolve => setTimeout(resolve, ms));
  }
}
