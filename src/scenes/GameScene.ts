/**
 * Main Game Scene - Where the board game is played
 */

import * as Phaser from 'phaser';
import { GameStateManager } from '../systems/GameStateManager';
import { TurnManager } from '../systems/TurnManager';
import { TileEffectManager } from '../systems/TileEffectManager';
import { Player } from '../types/GameTypes';
import { TILE_COLORS } from '../utils/Constants';

export class GameScene extends Phaser.Scene {
  private gameState!: GameStateManager;
  private turnManager!: TurnManager;
  private tileEffects!: TileEffectManager;
  private tileGraphics: Phaser.GameObjects.Graphics[] = [];
  private playerTokens: Phaser.GameObjects.Graphics[] = [];

  constructor() {
    super({ key: 'GameScene' });
  }

  create(): void {
    console.log('GameScene: Creating game...');

    // Initialize game systems
    this.gameState = new GameStateManager();
    this.turnManager = new TurnManager(this.gameState);
    this.tileEffects = new TileEffectManager(this.gameState);

    // Listen to game events
    this.setupEventListeners();

    // Draw board
    this.drawBoard();

    // Draw player tokens
    this.drawPlayerTokens();

    // Add simple UI text
    this.add.text(20, 20, 'Board Game Party - v0.1 Gameplay Demo', {
      fontSize: '24px',
      color: '#2c3e50',
      fontStyle: 'bold'
    });

    this.add.text(20, 60, 'Core Systems Working! Check console for turn flow.', {
      fontSize: '16px',
      color: '#27ae60'
    });

    // Start first turn
    this.turnManager.startTurn();

    // Debug: Show current game state
    this.gameState.debug();
  }

  private setupEventListeners(): void {
    this.gameState.on('PLAYER_MOVED', (data: any) => {
      console.log(`Player ${data.playerId} moved to position ${data.newPosition}`);
      this.updatePlayerTokens();

      // Resolve tile effect after movement
      const player = this.gameState.getPlayer(data.playerId);
      if (player) {
        const tile = this.gameState.getTileAt(player.position);
        if (tile) {
          this.tileEffects.executeTileEffect(player, tile.type);
        }
      }
    });

    this.gameState.on('TURN_CHANGED', (data: any) => {
      console.log(`Turn changed: Player ${data.playerId}, Round ${data.round}`);
    });

    this.gameState.on('GAME_OVER', (data: any) => {
      console.log(`🎉 Game Over! Winner: ${data.winner.name}`);
      this.showVictoryScreen(data.winner);
    });
  }

  private showVictoryScreen(winner: Player): void {
    // Simple victory text for now
    this.add.text(this.cameras.main.width / 2, this.cameras.main.height / 2, `🎉 ${winner.name} WINS! 🎉`, {
      fontSize: '48px',
      color: '#f39c12',
      fontStyle: 'bold'
    }).setOrigin(0.5);
  }

  private drawBoard(): void {
    const board = this.gameState.getState().board;
    const centerX = this.cameras.main.width / 2;
    const centerY = this.cameras.main.height / 2;
    const radius = 250;

    board.tiles.forEach((tile, index) => {
      const angle = (index / board.tiles.length) * Math.PI * 2 - Math.PI / 2;
      const x = centerX + Math.cos(angle) * radius;
      const y = centerY + Math.sin(angle) * radius;

      // Draw tile
      const graphics = this.add.graphics();
      const color = TILE_COLORS[tile.type] || 0x95a5a6;

      graphics.fillStyle(color, 1);
      graphics.fillCircle(x, y, 20);
      graphics.lineStyle(3, 0xffffff, 1);
      graphics.strokeCircle(x, y, 20);

      // Add position number
      this.add.text(x, y, tile.position.toString(), {
        fontSize: '12px',
        color: '#ffffff',
        fontStyle: 'bold'
      }).setOrigin(0.5);

      this.tileGraphics.push(graphics);
    });
  }

  private drawPlayerTokens(): void {
    const players = this.gameState.getState().players;
    const board = this.gameState.getState().board;
    const centerX = this.cameras.main.width / 2;
    const centerY = this.cameras.main.height / 2;
    const radius = 250;

    players.forEach(player => {
      const tile = board.tiles[player.position];
      const angle = (tile.position / board.tiles.length) * Math.PI * 2 - Math.PI / 2;
      const x = centerX + Math.cos(angle) * radius;
      const y = centerY + Math.sin(angle) * radius;

      // Offset tokens so they don't overlap
      const offsetX = ((player.id - 1) % 2) * 15 - 7.5;
      const offsetY = (Math.floor((player.id - 1) / 2)) * 15 - 7.5;

      const token = this.add.graphics();
      token.fillStyle(player.color, 1);
      token.fillCircle(x + offsetX, y + offsetY, 8);
      token.lineStyle(2, 0xffffff, 1);
      token.strokeCircle(x + offsetX, y + offsetY, 8);

      this.playerTokens.push(token);
    });
  }

  private updatePlayerTokens(): void {
    // Re-draw all tokens (simple approach for now)
    this.playerTokens.forEach(token => token.destroy());
    this.playerTokens = [];
    this.drawPlayerTokens();
  }
}
