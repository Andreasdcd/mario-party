/**
 * Main entry point for Board Game Party
 */

import * as Phaser from 'phaser';
import { BootScene } from './scenes/BootScene';
import { GameScene } from './scenes/GameScene';
import { GAME_CONFIG } from './utils/Constants';

const config: Phaser.Types.Core.GameConfig = {
  type: Phaser.AUTO,
  width: GAME_CONFIG.WIDTH,
  height: GAME_CONFIG.HEIGHT,
  backgroundColor: GAME_CONFIG.BACKGROUND_COLOR,
  parent: 'game-container',
  scene: [BootScene, GameScene],
  physics: {
    default: 'arcade',
    arcade: {
      gravity: { x: 0, y: 0 },
      debug: false
    }
  },
  scale: {
    mode: Phaser.Scale.FIT,
    autoCenter: Phaser.Scale.CENTER_BOTH
  }
};

// Create game instance
const game = new Phaser.Game(config);

// Debug: Expose game instance to window for development
(window as any).game = game;

console.log('Board Game Party v0.1 - Technical Setup Complete');
console.log('Framework: Phaser 3 + TypeScript');
console.log('Next Phase: Gameplay Agent will implement turn system');
