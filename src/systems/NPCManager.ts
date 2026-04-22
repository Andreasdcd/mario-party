/**
 * NPC Manager - Handles AI player turns
 */

import { GameStateManager } from './GameStateManager';
import { Player } from '../types/GameTypes';

export class NPCManager {
  private gameState: GameStateManager;
  private npcTurnTimeout?: number;

  constructor(gameState: GameStateManager) {
    this.gameState = gameState;
  }

  /**
   * Check if current player is an NPC
   */
  public isCurrentPlayerNPC(): boolean {
    const currentPlayer = this.gameState.getCurrentPlayer();
    return currentPlayer.isNPC;
  }

  /**
   * Get current NPC player (returns null if current player is human)
   */
  public getCurrentNPC(): Player | null {
    const currentPlayer = this.gameState.getCurrentPlayer();
    return currentPlayer.isNPC ? currentPlayer : null;
  }

  /**
   * Trigger NPC turn - auto-roll after 1 second delay
   * @param onRollCallback - Function to call when NPC should roll dice
   */
  public triggerNPCTurn(onRollCallback: () => void): void {
    const npc = this.getCurrentNPC();

    if (!npc) {
      console.warn('NPCManager: Attempted to trigger NPC turn but current player is human');
      return;
    }

    console.log(`🤖 ${npc.name} (NPC) turn - auto-rolling in 1 second...`);

    // Clear any existing timeout
    this.cancelNPCTurn();

    // Schedule auto-roll after 1 second
    this.npcTurnTimeout = setTimeout(() => {
      console.log(`🎲 ${npc.name} (NPC) auto-rolling dice...`);
      onRollCallback();
    }, 1000);
  }

  /**
   * Cancel scheduled NPC turn (e.g., if player manually intervenes)
   */
  public cancelNPCTurn(): void {
    if (this.npcTurnTimeout) {
      clearTimeout(this.npcTurnTimeout);
      this.npcTurnTimeout = undefined;
    }
  }

  /**
   * Get NPC behavior description based on difficulty
   * (Currently not affecting dice rolls, but could affect future decisions)
   */
  public getNPCBehavior(difficulty: 'easy' | 'medium' | 'hard'): string {
    const behaviors = {
      easy: 'Cautious - tends to play safe',
      medium: 'Balanced - adapts to situation',
      hard: 'Aggressive - takes calculated risks'
    };
    return behaviors[difficulty];
  }

  /**
   * Cleanup - call when scene is destroyed
   */
  public destroy(): void {
    this.cancelNPCTurn();
  }
}
