/**
 * MiniGameBase - Abstract base class for all mini-games
 *
 * All mini-games must extend this class and implement:
 * - create(): Setup mini-game scene
 * - startGame(): Begin gameplay
 * - update(): Game loop logic
 * - cleanup(): Cleanup when game ends
 */

import * as Phaser from 'phaser';
import {
  MiniGameConfig,
  MiniGameData,
  MiniGameResults,
  MiniGamePlayerResult,
  MiniGamePhase,
  TeamAssignment,
  SoloAssignment
} from '../types/MiniGameTypes';
import { Player } from '../types/GameTypes';

export abstract class MiniGameBase extends Phaser.Scene {
  protected config!: MiniGameConfig;
  protected players!: Player[];
  protected teamAssignment?: TeamAssignment;
  protected soloAssignment?: SoloAssignment;

  protected phase: MiniGamePhase = MiniGamePhase.INTRO;
  protected startTime: number = 0;
  protected playerScores: Map<number, number> = new Map();
  protected onComplete?: (results: MiniGameResults) => void;

  constructor(sceneKey: string) {
    super({ key: sceneKey });
  }

  /**
   * Initialize mini-game with data from GameScene
   */
  init(data: MiniGameData & { onComplete?: (results: MiniGameResults) => void }): void {
    this.config = data.config;
    this.players = data.players;
    this.teamAssignment = data.teamAssignment;
    this.soloAssignment = data.soloAssignment;
    this.onComplete = data.onComplete;

    // Initialize scores
    this.players.forEach(player => {
      this.playerScores.set(player.id, 0);
    });

    console.log(`🎮 Mini-Game "${this.config.name}" initialized`);
  }

  /**
   * Create scene - calls child implementation
   */
  create(): void {
    this.phase = MiniGamePhase.INTRO;

    // Show intro first
    this.showIntro(() => {
      // After intro, show countdown
      this.showCountdown(() => {
        // After countdown, start game
        this.phase = MiniGamePhase.PLAYING;
        this.startTime = Date.now();
        this.startGame();
      });
    });
  }

  /**
   * Show intro screen with instructions
   */
  protected showIntro(onComplete: () => void): void {
    const width = this.cameras.main.width;
    const height = this.cameras.main.height;

    // Dark overlay
    const overlay = this.add.rectangle(0, 0, width, height, 0x2c3e50, 1);
    overlay.setOrigin(0, 0);

    // Title
    const title = this.add.text(width / 2, height / 2 - 150, this.config.name, {
      fontSize: '48px',
      color: '#f39c12',
      fontStyle: 'bold'
    });
    title.setOrigin(0.5);

    // Description
    const description = this.add.text(width / 2, height / 2 - 80, this.config.description, {
      fontSize: '20px',
      color: '#ecf0f1'
    });
    description.setOrigin(0.5);

    // Instructions
    const instructionsY = height / 2;
    this.config.instructions.forEach((instruction, index) => {
      const text = this.add.text(width / 2, instructionsY + (index * 30), `• ${instruction}`, {
        fontSize: '18px',
        color: '#bdc3c7'
      });
      text.setOrigin(0.5, 0);
    });

    // Controls
    const controlsY = instructionsY + (this.config.instructions.length * 30) + 40;
    this.add.text(width / 2, controlsY, 'Controls:', {
      fontSize: '16px',
      color: '#95a5a6',
      fontStyle: 'bold'
    }).setOrigin(0.5);

    this.config.controls.forEach((control, index) => {
      const text = this.add.text(width / 2, controlsY + 25 + (index * 25), control, {
        fontSize: '14px',
        color: '#95a5a6'
      });
      text.setOrigin(0.5, 0);
    });

    // Start prompt
    const prompt = this.add.text(width / 2, height - 100, 'Tryk SPACE for at starte', {
      fontSize: '24px',
      color: '#27ae60',
      fontStyle: 'bold'
    });
    prompt.setOrigin(0.5);

    // Pulse animation
    this.tweens.add({
      targets: prompt,
      alpha: 0.5,
      duration: 800,
      yoyo: true,
      repeat: -1
    });

    // Wait for SPACE key
    const spaceKey = this.input.keyboard?.addKey(Phaser.Input.Keyboard.KeyCodes.SPACE);
    spaceKey?.once('down', () => {
      // Cleanup intro
      overlay.destroy();
      title.destroy();
      description.destroy();
      prompt.destroy();

      onComplete();
    });
  }

  /**
   * Show countdown before game starts
   */
  protected showCountdown(onComplete: () => void): void {
    this.phase = MiniGamePhase.COUNTDOWN;

    const width = this.cameras.main.width;
    const height = this.cameras.main.height;

    const countdownText = this.add.text(width / 2, height / 2, '3', {
      fontSize: '120px',
      color: '#f39c12',
      fontStyle: 'bold'
    });
    countdownText.setOrigin(0.5);

    let count = 3;

    const countdownInterval = setInterval(() => {
      count--;

      if (count > 0) {
        countdownText.setText(count.toString());

        // Scale animation
        countdownText.setScale(0);
        this.tweens.add({
          targets: countdownText,
          scale: 1,
          duration: 300,
          ease: 'Back.out'
        });
      } else {
        // Show "GO!"
        countdownText.setText('GO!');
        countdownText.setColor('#27ae60');
        countdownText.setScale(0);

        this.tweens.add({
          targets: countdownText,
          scale: 1.5,
          duration: 300,
          ease: 'Back.out',
          onComplete: () => {
            this.time.delayedCall(500, () => {
              countdownText.destroy();
              clearInterval(countdownInterval);
              onComplete();
            });
          }
        });
      }
    }, 1000);
  }

  /**
   * Show results screen
   */
  protected showResults(results: MiniGameResults): void {
    this.phase = MiniGamePhase.RESULTS;

    const width = this.cameras.main.width;
    const height = this.cameras.main.height;

    // Dark overlay
    const overlay = this.add.rectangle(0, 0, width, height, 0x000000, 0.8);
    overlay.setOrigin(0, 0);

    // Title
    const title = this.add.text(width / 2, 100, 'Resultater', {
      fontSize: '48px',
      color: '#f39c12',
      fontStyle: 'bold'
    });
    title.setOrigin(0.5);

    // Sort results by placement
    const sortedResults = [...results.playerResults].sort((a, b) => a.placement - b.placement);

    // Display player results
    const startY = 200;
    const spacing = 80;

    sortedResults.forEach((result, index) => {
      const player = this.players.find(p => p.id === result.playerId)!;
      const y = startY + (index * spacing);

      // Placement medal
      const medals = ['🥇', '🥈', '🥉', '4️⃣'];
      const medal = this.add.text(width / 2 - 300, y, medals[result.placement - 1], {
        fontSize: '32px'
      });
      medal.setOrigin(0.5);

      // Player name with color indicator
      const nameText = this.add.text(width / 2 - 200, y, player.name, {
        fontSize: '24px',
        color: '#ecf0f1',
        fontStyle: result.placement === 1 ? 'bold' : 'normal'
      });
      nameText.setOrigin(0, 0.5);

      // Score
      const scoreText = this.add.text(width / 2 + 100, y, `Score: ${result.score}`, {
        fontSize: '20px',
        color: '#3498db'
      });
      scoreText.setOrigin(0, 0.5);

      // Rewards
      const rewardsText = this.add.text(width / 2 + 250, y, `+${result.coinsEarned} 🪙${result.starEarned ? ' +1 ⭐' : ''}`, {
        fontSize: '20px',
        color: '#f39c12'
      });
      rewardsText.setOrigin(0, 0.5);
    });

    // Continue prompt
    const prompt = this.add.text(width / 2, height - 100, 'Tryk SPACE for at fortsætte', {
      fontSize: '24px',
      color: '#27ae60',
      fontStyle: 'bold'
    });
    prompt.setOrigin(0.5);

    // Wait for SPACE key
    const spaceKey = this.input.keyboard?.addKey(Phaser.Input.Keyboard.KeyCodes.SPACE);
    spaceKey?.once('down', () => {
      this.phase = MiniGamePhase.COMPLETE;

      // Call completion callback
      if (this.onComplete) {
        this.onComplete(results);
      }
    });
  }

  /**
   * Calculate results based on scores
   */
  protected calculateResults(): MiniGameResults {
    const duration = Date.now() - this.startTime;

    // Create player results
    const playerResults: MiniGamePlayerResult[] = [];

    // Sort players by score (highest first)
    const sortedPlayers = [...this.players].sort((a, b) => {
      const scoreA = this.playerScores.get(a.id) || 0;
      const scoreB = this.playerScores.get(b.id) || 0;
      return scoreB - scoreA;
    });

    // Assign placements and rewards
    sortedPlayers.forEach((player, index) => {
      const placement = index + 1;
      const score = this.playerScores.get(player.id) || 0;

      // Reward distribution: 1st = 10 coins + star, 2nd = 7 coins, 3rd = 5 coins, 4th = 3 coins
      const coinsEarned = placement === 1 ? 10 : placement === 2 ? 7 : placement === 3 ? 5 : 3;
      const starEarned = placement === 1;

      playerResults.push({
        playerId: player.id,
        score,
        placement,
        coinsEarned,
        starEarned
      });
    });

    // Find winner
    const winner = sortedPlayers[0];

    return {
      miniGameId: this.config.id,
      miniGameType: this.config.type,
      playerResults,
      winner,
      duration
    };
  }

  /**
   * Get player score
   */
  protected getScore(playerId: number): number {
    return this.playerScores.get(playerId) || 0;
  }

  /**
   * Add score to player
   */
  protected addScore(playerId: number, points: number): void {
    const currentScore = this.playerScores.get(playerId) || 0;
    this.playerScores.set(playerId, currentScore + points);
  }

  /**
   * Set player score
   */
  protected setScore(playerId: number, score: number): void {
    this.playerScores.set(playerId, score);
  }

  // ===== ABSTRACT METHODS - Must be implemented by child classes =====

  /**
   * Start the mini-game gameplay
   */
  protected abstract startGame(): void;

  /**
   * Cleanup when game ends
   */
  protected abstract cleanup(): void;
}
