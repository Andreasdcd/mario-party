/**
 * Tile Effect Manager - Handles tile effects and events
 */

import { GameStateManager } from './GameStateManager';
import { TileType, EventType, Player } from '../types/GameTypes';
import { TILE_REWARDS } from '../utils/Constants';

export class TileEffectManager {
  private gameState: GameStateManager;

  constructor(gameState: GameStateManager) {
    this.gameState = gameState;
  }

  /**
   * Execute the effect of a tile for a given player
   * Returns true if turn should continue, false if blocked
   */
  public executeTileEffect(player: Player, tileType: TileType): boolean {
    console.log(`Executing ${tileType} tile effect for ${player.name}`);

    switch (tileType) {
      case TileType.START:
        return this.handleStartTile(player);

      case TileType.SAFE:
        return this.handleSafeTile(player);

      case TileType.PENALTY:
        return this.handlePenaltyTile(player);

      case TileType.CHALLENGE:
        return this.handleChallengeTile(player);

      case TileType.EVENT:
        return this.handleEventTile(player);

      default:
        console.warn(`Unknown tile type: ${tileType}`);
        return true;
    }
  }

  // ==================== Tile Effect Handlers ====================

  private handleStartTile(player: Player): boolean {
    console.log(`${player.name} is on START tile (no effect)`);
    return true;
  }

  private handleSafeTile(player: Player): boolean {
    const coins = TILE_REWARDS.SAFE_COINS;
    this.gameState.addCoins(player.id, coins);
    console.log(`✅ ${player.name} gained ${coins} coins!`);
    return true;
  }

  private handlePenaltyTile(player: Player): boolean {
    const coins = TILE_REWARDS.PENALTY_COINS;
    this.gameState.addCoins(player.id, coins);
    console.log(`❌ ${player.name} lost ${Math.abs(coins)} coins!`);
    return true;
  }

  private handleChallengeTile(player: Player): boolean {
    console.log(`⚔️ ${player.name} triggered a CHALLENGE!`);

    // TODO: Challenge Agent will implement this
    // For now, just pick a random opponent
    const opponent = this.selectRandomOpponent(player);

    if (opponent) {
      console.log(`   → Challenging ${opponent.name}`);
      // Placeholder: Will be implemented by Challenge Agent
      // For now, just continue turn
    }

    return true; // Will return false when challenges are implemented
  }

  private handleEventTile(player: Player): boolean {
    const eventType = this.selectRandomEvent();
    console.log(`🎲 ${player.name} triggered ${eventType} event!`);

    switch (eventType) {
      case EventType.SHOP:
        return this.handleShopEvent(player);

      case EventType.BONUS:
        return this.handleBonusEvent();

      case EventType.STEAL:
        return this.handleStealEvent(player);

      default:
        return true;
    }
  }

  // ==================== Event Handlers ====================

  private handleShopEvent(player: Player): boolean {
    const starCost = TILE_REWARDS.SHOP_STAR_COST;

    if (player.coins >= starCost) {
      console.log(`   → Shop available! ${player.name} can buy a star for ${starCost} coins`);
      // TODO: UI Agent will show prompt
      // For now, auto-purchase if affordable
      this.gameState.addCoins(player.id, -starCost);
      this.gameState.addStar(player.id);
      console.log(`   ⭐ ${player.name} purchased a star!`);
    } else {
      console.log(`   → Not enough coins (need ${starCost}, have ${player.coins})`);
    }

    return true;
  }

  private handleBonusEvent(): boolean {
    const bonusCoins = 5;
    const players = this.gameState.getState().players;

    players.forEach(player => {
      this.gameState.addCoins(player.id, bonusCoins);
    });

    console.log(`   🎉 All players gained ${bonusCoins} coins!`);
    return true;
  }

  private handleStealEvent(player: Player): boolean {
    const opponent = this.selectRandomOpponent(player);

    if (opponent) {
      const stolenCoins = Math.min(3, opponent.coins);
      this.gameState.addCoins(opponent.id, -stolenCoins);
      this.gameState.addCoins(player.id, stolenCoins);
      console.log(`   💰 ${player.name} stole ${stolenCoins} coins from ${opponent.name}!`);
    }

    return true;
  }

  // ==================== Helper Methods ====================

  /**
   * Select a random opponent (not the current player)
   */
  private selectRandomOpponent(player: Player): Player | null {
    const players = this.gameState.getState().players;
    const opponents = players.filter(p => p.id !== player.id);

    if (opponents.length === 0) return null;

    const randomIndex = Math.floor(Math.random() * opponents.length);
    return opponents[randomIndex];
  }

  /**
   * Select a random event type based on frequency
   * Shop: 70%, Bonus: 20%, Steal: 10%
   */
  private selectRandomEvent(): EventType {
    const roll = Math.random() * 100;

    if (roll < 70) return EventType.SHOP;
    if (roll < 90) return EventType.BONUS;
    return EventType.STEAL;
  }

  /**
   * Check if player can afford a star
   */
  public canAffordStar(player: Player): boolean {
    return player.coins >= TILE_REWARDS.SHOP_STAR_COST;
  }
}
