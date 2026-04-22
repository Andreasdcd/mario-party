/**
 * Main Game Scene - Where the board game is played
 */

import * as Phaser from 'phaser';
import { GameStateManager } from '../systems/GameStateManager';
import { TurnManager } from '../systems/TurnManager';
import { TileEffectManager } from '../systems/TileEffectManager';
import { GameUI } from '../ui/GameUI';
import { GamePhase } from '../types/GameTypes';
import { TILE_COLORS } from '../utils/Constants';

interface PlayerSetup {
  name: string;
  color: number;
}

export class GameScene extends Phaser.Scene {
  private gameState!: GameStateManager;
  private turnManager!: TurnManager;
  private tileEffects!: TileEffectManager;
  private gameUI!: GameUI;
  private tileGraphics: Phaser.GameObjects.Graphics[] = [];
  private playerTokens: Phaser.GameObjects.Graphics[] = [];

  constructor() {
    super({ key: 'GameScene' });
  }

  init(data: { playerSetups?: PlayerSetup[] }): void {
    // Receive player setups from SetupScene
    console.log('GameScene: Received player setups:', data.playerSetups);
  }

  create(data: { playerSetups?: PlayerSetup[] }): void {
    console.log('GameScene: Creating interactive game...');

    // Initialize game systems with player setups
    this.gameState = new GameStateManager(data.playerSetups);
    this.turnManager = new TurnManager(this.gameState);
    this.tileEffects = new TileEffectManager(this.gameState);
    this.gameUI = new GameUI(this);

    // Setup camera system
    this.setupCamera();

    // Listen to game events
    this.setupEventListeners();

    // Draw board
    this.drawBoard();

    // Draw player tokens
    this.drawPlayerTokens();

    // Create UI
    this.gameUI.create();

    // Setup UI callbacks
    this.gameUI.onRollButtonClick(() => this.handleRollDice());

    // Setup keyboard input - SPACE key to roll dice
    this.input.keyboard?.on('keydown-SPACE', () => {
      this.handleRollDice();
    });

    // Start first turn
    this.startNewTurn();

    // Zoom camera to first player
    this.zoomToCurrentPlayer(true);

    console.log('🎮 Game ready! Press SPACE to roll dice!');
  }

  private setupCamera(): void {
    const board = this.gameState.getState().board;

    // Set world bounds based on board size
    this.cameras.main.setBounds(0, 0, board.worldWidth, board.worldHeight);

    // Set zoom level - closer view of player
    this.cameras.main.setZoom(1.5);

    // Set background color
    this.cameras.main.setBackgroundColor('#ecf0f1');
  }

  private zoomToCurrentPlayer(immediate: boolean = false): void {
    const player = this.gameState.getCurrentPlayer();
    const board = this.gameState.getState().board;
    const tile = board.tiles[player.position];

    if (!tile) return;

    if (immediate) {
      // Immediate jump (at game start)
      this.cameras.main.centerOn(tile.x, tile.y);
    } else {
      // Smooth pan (during turn transitions)
      this.cameras.main.pan(tile.x, tile.y, 1000, 'Sine.easeInOut');
    }
  }

  private setupEventListeners(): void {
    this.gameState.on('PLAYER_MOVED', (data: any) => {
      console.log(`Player ${data.playerId} moved to position ${data.newPosition}`);
      this.updatePlayerTokens();

      // After movement animation completes, resolve tile effect
      this.time.delayedCall(500, () => {
        const player = this.gameState.getPlayer(data.playerId);
        if (player) {
          const tile = this.gameState.getTileAt(player.position);
          if (tile) {
            this.tileEffects.executeTileEffect(player, tile.type);
            this.gameUI.showMessage(`Landed on ${tile.type} tile!`, 1500);
          }
        }

        // Wait a moment then end turn
        this.time.delayedCall(2000, () => {
          this.endCurrentTurn();
        });
      });
    });

    this.gameState.on('TURN_CHANGED', (data: any) => {
      console.log(`Turn changed: Player ${data.playerId}, Round ${data.round}`);
      this.updateUI();
    });

    this.gameState.on('GAME_OVER', (data: any) => {
      console.log(`🎉 Game Over! Winner: ${data.winner.name}`);
      this.gameUI.showVictory(data.winner);
      this.gameUI.setRollButtonEnabled(false);
    });

    this.gameState.on('PHASE_CHANGED', (data: any) => {
      console.log(`Phase changed to: ${data.phase}`);
      this.gameUI.updatePhase(data.phase);

      // Enable roll button only during roll phase
      this.gameUI.setRollButtonEnabled(data.phase === GamePhase.ROLL_PHASE);
    });
  }

  /**
   * Start a new turn
   */
  private startNewTurn(): void {
    this.turnManager.startTurn();
    this.updateUI();

    // Zoom camera to current player
    this.zoomToCurrentPlayer(false);
  }

  /**
   * Handle dice roll button click
   */
  private handleRollDice(): void {
    const phase = this.gameState.getState().gamePhase;

    if (phase !== GamePhase.ROLL_PHASE) {
      console.log('Not in roll phase!');
      return;
    }

    // Disable button during roll
    this.gameUI.setRollButtonEnabled(false);

    // Roll the dice
    const result = this.turnManager.rollDice();

    // Show dice animation
    this.gameUI.showDiceRoll(result);

    console.log(`🎲 Rolled: ${result}`);

    // Wait for dice animation, then move player
    this.time.delayedCall(800, () => {
      this.moveCurrentPlayer();
    });
  }

  /**
   * Move the current player
   */
  private async moveCurrentPlayer(): Promise<void> {
    await this.turnManager.movePlayer();
    this.updateUI();
  }

  /**
   * End the current turn and start next
   */
  private endCurrentTurn(): void {
    const winner = this.gameState.checkWinCondition();

    if (winner) {
      console.log(`🎉 ${winner.name} wins!`);
      return;
    }

    // Move to next player
    this.gameState.nextTurn();

    // Start next turn
    this.startNewTurn();
  }

  /**
   * Update UI elements
   */
  private updateUI(): void {
    const state = this.gameState.getState();
    this.gameUI.updatePlayerInfo(
      state.players,
      state.currentPlayerIndex,
      state.currentRound
    );
    this.gameUI.updatePhase(state.gamePhase);
  }

  private drawBoard(): void {
    const board = this.gameState.getState().board;

    board.tiles.forEach((tile) => {
      // Use tile's x,y coordinates from board layout
      const x = tile.x;
      const y = tile.y;

      // Draw tile
      const graphics = this.add.graphics();
      const color = TILE_COLORS[tile.type] || 0x95a5a6;

      graphics.fillStyle(color, 1);
      graphics.fillCircle(x, y, 30); // Larger tiles for better visibility
      graphics.lineStyle(4, 0xffffff, 1);
      graphics.strokeCircle(x, y, 30);

      // Add position number
      this.add.text(x, y, tile.position.toString(), {
        fontSize: '16px',
        color: '#ffffff',
        fontStyle: 'bold'
      }).setOrigin(0.5);

      this.tileGraphics.push(graphics);
    });

    // Draw connecting lines between tiles to show the path
    this.drawPath();
  }

  private drawPath(): void {
    const board = this.gameState.getState().board;
    const pathGraphics = this.add.graphics();

    pathGraphics.lineStyle(6, 0x95a5a6, 0.5);

    for (let i = 0; i < board.tiles.length - 1; i++) {
      const current = board.tiles[i];
      const next = board.tiles[i + 1];

      pathGraphics.lineBetween(current.x, current.y, next.x, next.y);
    }
  }

  private drawPlayerTokens(): void {
    const players = this.gameState.getState().players;
    const board = this.gameState.getState().board;

    players.forEach(player => {
      const tile = board.tiles[player.position];

      // Use tile's x,y coordinates
      const x = tile.x;
      const y = tile.y;

      // Offset tokens so they don't overlap when multiple players on same tile
      const offsetX = ((player.id - 1) % 2) * 20 - 10;
      const offsetY = (Math.floor((player.id - 1) / 2)) * 20 - 10;

      const token = this.add.graphics();
      token.fillStyle(player.color, 1);
      token.fillCircle(x + offsetX, y + offsetY, 12); // Larger tokens
      token.lineStyle(3, 0xffffff, 1);
      token.strokeCircle(x + offsetX, y + offsetY, 12);

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
