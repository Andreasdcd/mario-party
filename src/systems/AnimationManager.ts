/**
 * Animation Manager - Handles smooth animations for player movements
 */

import * as Phaser from 'phaser';
import { GameStateManager } from './GameStateManager';
import { ANIMATIONS } from '../utils/Constants';

export class AnimationManager {
  private scene: Phaser.Scene;
  private gameState: GameStateManager;
  private isAnimating: boolean = false;

  constructor(scene: Phaser.Scene, gameState: GameStateManager) {
    this.scene = scene;
    this.gameState = gameState;
  }

  /**
   * Check if an animation is currently playing
   */
  public isPlaying(): boolean {
    return this.isAnimating;
  }

  /**
   * Animate player token moving step-by-step from current position to target
   * @param playerId - ID of player to animate
   * @param startPosition - Starting tile position
   * @param steps - Number of steps to move
   * @param onComplete - Callback when animation finishes
   */
  public async animatePlayerMovement(
    playerId: number,
    startPosition: number,
    steps: number,
    onComplete?: () => void
  ): Promise<void> {
    console.log(`🎬 AnimationManager: Player ${playerId} moving ${steps} steps from position ${startPosition}`);
    this.isAnimating = true;

    const board = this.gameState.getState().board;
    const boardSize = board.tiles.length;

    // Calculate path (step by step)
    const path: number[] = [];
    for (let i = 1; i <= steps; i++) {
      path.push((startPosition + i) % boardSize);
    }
    console.log(`📍 Path positions:`, path);

    // Animate step-by-step
    for (let i = 0; i < path.length; i++) {
      const targetPosition = path[i];
      const targetTile = this.gameState.getTileAt(targetPosition);

      if (!targetTile) {
        console.warn(`AnimationManager: Could not find tile at position ${targetPosition}`);
        continue;
      }

      console.log(`  → Step ${i + 1}/${path.length}: Moving to position ${targetPosition} at (${targetTile.x}, ${targetTile.y})`);

      // Animate to this tile
      await this.animateToTile(playerId, targetTile.x, targetTile.y);

      // Small pause between steps for visibility
      await this.delay(50);
    }

    this.isAnimating = false;

    // Call completion callback
    if (onComplete) {
      onComplete();
    }
  }

  /**
   * Animate player token to a specific tile position
   */
  private animateToTile(playerId: number, targetX: number, targetY: number): Promise<void> {
    return new Promise((resolve) => {
      // Find player token graphics (we'll need to pass this from GameScene)
      // For now, we'll emit an event that GameScene can listen to
      this.scene.events.emit('ANIMATE_TOKEN', {
        playerId,
        targetX,
        targetY,
        duration: ANIMATIONS.TOKEN_MOVE_DURATION,
        onComplete: resolve
      });

      // Also animate camera to follow
      this.animateCameraTo(targetX, targetY);

      // Fallback timeout in case event isn't handled
      setTimeout(() => resolve(), ANIMATIONS.TOKEN_MOVE_DURATION + 100);
    });
  }

  /**
   * Smoothly pan camera to position
   */
  private animateCameraTo(x: number, y: number): void {
    const camera = this.scene.cameras.main;

    // Use Phaser's built-in pan method for smooth camera movement
    camera.pan(x, y, ANIMATIONS.TOKEN_MOVE_DURATION, 'Sine.easeInOut');
  }

  /**
   * Utility: Wait for a specified time
   */
  private delay(ms: number): Promise<void> {
    return new Promise(resolve => setTimeout(resolve, ms));
  }

  /**
   * Animate dice roll with a bounce effect
   */
  public animateDiceRoll(diceValue: number): Promise<void> {
    return new Promise((resolve) => {
      // Emit event for UI to handle dice animation
      this.scene.events.emit('ANIMATE_DICE', {
        value: diceValue,
        onComplete: resolve
      });

      // Fallback timeout
      setTimeout(() => resolve(), ANIMATIONS.DIE_ROLL_DURATION + 100);
    });
  }

  /**
   * Show message overlay with animation
   */
  public showMessage(message: string, duration: number = 2000): Promise<void> {
    return new Promise((resolve) => {
      this.scene.events.emit('SHOW_MESSAGE', {
        message,
        duration,
        onComplete: resolve
      });

      setTimeout(() => resolve(), duration + ANIMATIONS.OVERLAY_FADE_DURATION * 2);
    });
  }

  /**
   * Cleanup
   */
  public destroy(): void {
    this.isAnimating = false;
  }
}
