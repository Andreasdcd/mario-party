/**
 * GameUI - Manages all interactive UI elements
 */

import * as Phaser from 'phaser';
import { Player, GamePhase } from '../types/GameTypes';

export class GameUI {
  private scene: Phaser.Scene;
  private rollButton!: Phaser.GameObjects.Container;
  private diceDisplay!: Phaser.GameObjects.Text;
  private playerInfoPanel!: Phaser.GameObjects.Container;
  private turnIndicator!: Phaser.GameObjects.Text;
  private phaseIndicator!: Phaser.GameObjects.Text;
  private onRollCallback?: () => void;

  constructor(scene: Phaser.Scene) {
    this.scene = scene;
  }

  /**
   * Create all UI elements
   */
  public create(): void {
    this.createPlayerInfoPanel();
    this.createDiceUI();
    this.createPhaseIndicator();
  }

  /**
   * Create the player information panel
   */
  private createPlayerInfoPanel(): void {
    const width = this.scene.cameras.main.width;
    const panelHeight = 100;

    this.playerInfoPanel = this.scene.add.container(0, 0);

    // Background
    const bg = this.scene.add.rectangle(0, 0, width, panelHeight, 0x2c3e50, 0.9);
    bg.setOrigin(0, 0);
    this.playerInfoPanel.add(bg);

    // Title
    const title = this.scene.add.text(20, 15, 'Board Game Party', {
      fontSize: '28px',
      color: '#ecf0f1',
      fontStyle: 'bold'
    });
    this.playerInfoPanel.add(title);

    // Turn indicator (will be updated dynamically)
    this.turnIndicator = this.scene.add.text(20, 50, '', {
      fontSize: '18px',
      color: '#3498db'
    });
    this.playerInfoPanel.add(this.turnIndicator);

    this.playerInfoPanel.setDepth(100);
    this.playerInfoPanel.setScrollFactor(0); // Fixed to camera
  }

  /**
   * Create the dice UI (roll button and dice display)
   */
  private createDiceUI(): void {
    const width = this.scene.cameras.main.width;
    const height = this.scene.cameras.main.height;

    // Dice container positioned at bottom right
    const diceContainer = this.scene.add.container(width - 180, height - 180);

    // Dice display (shows the rolled number)
    const diceBg = this.scene.add.rectangle(0, -50, 80, 80, 0xffffff, 1);
    diceBg.setStrokeStyle(4, 0x2c3e50);

    this.diceDisplay = this.scene.add.text(0, -50, '?', {
      fontSize: '48px',
      color: '#2c3e50',
      fontStyle: 'bold'
    });
    this.diceDisplay.setOrigin(0.5);

    // Roll button
    const buttonBg = this.scene.add.rectangle(0, 50, 140, 50, 0x27ae60, 1);
    buttonBg.setStrokeStyle(3, 0x2c3e50);
    buttonBg.setInteractive({ useHandCursor: true });

    const buttonText = this.scene.add.text(0, 50, 'ROLL DICE', {
      fontSize: '18px',
      color: '#ffffff',
      fontStyle: 'bold'
    });
    buttonText.setOrigin(0.5);

    // Button hover effects
    buttonBg.on('pointerover', () => {
      buttonBg.setFillStyle(0x2ecc71);
      buttonBg.setScale(1.05);
    });

    buttonBg.on('pointerout', () => {
      buttonBg.setFillStyle(0x27ae60);
      buttonBg.setScale(1);
    });

    buttonBg.on('pointerdown', () => {
      buttonBg.setScale(0.95);
    });

    buttonBg.on('pointerup', () => {
      buttonBg.setScale(1.05);
      this.onRollDice();
    });

    // Add all elements to container
    diceContainer.add([diceBg, this.diceDisplay, buttonBg, buttonText]);
    diceContainer.setDepth(100);
    diceContainer.setScrollFactor(0); // Fixed to camera

    this.rollButton = diceContainer;
  }

  /**
   * Create phase indicator
   */
  private createPhaseIndicator(): void {
    const width = this.scene.cameras.main.width;

    this.phaseIndicator = this.scene.add.text(width / 2, 120, '', {
      fontSize: '24px',
      color: '#f39c12',
      fontStyle: 'bold',
      backgroundColor: '#2c3e50',
      padding: { x: 30, y: 15 }
    });
    this.phaseIndicator.setOrigin(0.5, 0);
    this.phaseIndicator.setDepth(100);
    this.phaseIndicator.setScrollFactor(0); // Fixed to camera
  }

  /**
   * Update player info display
   */
  public updatePlayerInfo(players: Player[], currentPlayerIndex: number, round: number): void {
    const currentPlayer = players[currentPlayerIndex];

    // Clear existing player displays
    const existingPlayers = this.playerInfoPanel.getAll().filter(obj =>
      (obj as any).name === 'playerDisplay'
    );
    existingPlayers.forEach(obj => obj.destroy());

    // Display all players horizontally
    const startX = 400;
    const spacing = 200;

    players.forEach((player, index) => {
      const x = startX + (index * spacing);
      const isCurrent = index === currentPlayerIndex;

      // Player container
      const playerDisplay = this.scene.add.container(x, 30);
      (playerDisplay as any).name = 'playerDisplay';

      // Highlight current player
      if (isCurrent) {
        const highlight = this.scene.add.rectangle(0, 15, 180, 50, 0x3498db, 0.3);
        highlight.setStrokeStyle(2, 0x3498db);
        playerDisplay.add(highlight);
      }

      // Player name and color indicator
      const colorCircle = this.scene.add.circle(-70, 0, 8, player.color);
      colorCircle.setStrokeStyle(2, 0xffffff);

      const nameText = this.scene.add.text(-55, 0, player.name, {
        fontSize: '16px',
        color: isCurrent ? '#3498db' : '#ecf0f1',
        fontStyle: isCurrent ? 'bold' : 'normal'
      });
      nameText.setOrigin(0, 0.5);

      // Stats
      const statsText = this.scene.add.text(-55, 20, `⭐${player.stars}  🪙${player.coins}`, {
        fontSize: '14px',
        color: '#f39c12'
      });
      statsText.setOrigin(0, 0.5);

      playerDisplay.add([colorCircle, nameText, statsText]);
      this.playerInfoPanel.add(playerDisplay);
    });

    // Update turn indicator
    this.turnIndicator.setText(`Runde ${round} - ${currentPlayer.name}'s Tur`);

    // Show big turn banner
    this.showTurnBanner(currentPlayer.name);
  }

  /**
   * Show a big turn banner with player's name
   */
  private showTurnBanner(playerName: string): void {
    const width = this.scene.cameras.main.width;
    const height = this.scene.cameras.main.height;

    // Create banner container
    const bannerContainer = this.scene.add.container(width / 2, height / 2);
    bannerContainer.setDepth(150);
    bannerContainer.setScrollFactor(0);

    // Background
    const bg = this.scene.add.rectangle(0, 0, 600, 120, 0x2c3e50, 0.95);
    bg.setStrokeStyle(5, 0x3498db);

    // Text
    const turnText = this.scene.add.text(0, -20, `DET ER ${playerName.toUpperCase()}'S TUR!`, {
      fontSize: '32px',
      color: '#3498db',
      fontStyle: 'bold'
    });
    turnText.setOrigin(0.5);

    const promptText = this.scene.add.text(0, 25, '🎲 Tryk SPACE for at slå', {
      fontSize: '18px',
      color: '#f39c12'
    });
    promptText.setOrigin(0.5);

    bannerContainer.add([bg, turnText, promptText]);

    // Animate in
    bannerContainer.setScale(0);
    bannerContainer.setAlpha(0);

    this.scene.tweens.add({
      targets: bannerContainer,
      scale: 1,
      alpha: 1,
      duration: 400,
      ease: 'Back.out',
      onComplete: () => {
        // Hold for a moment, then fade out
        this.scene.time.delayedCall(2000, () => {
          this.scene.tweens.add({
            targets: bannerContainer,
            alpha: 0,
            duration: 300,
            onComplete: () => {
              bannerContainer.destroy();
            }
          });
        });
      }
    });
  }

  /**
   * Show dice roll result with animation
   */
  public showDiceRoll(result: number): void {
    // Physical rolling animation - show random numbers rolling
    const rollDuration = 800; // Total roll duration
    const rollSteps = 12; // Number of random numbers to show
    const stepDuration = rollDuration / rollSteps;

    let currentStep = 0;

    // Rolling effect - show random numbers
    const rollInterval = setInterval(() => {
      const randomNum = Math.floor(Math.random() * 10) + 1;
      this.diceDisplay.setText(randomNum.toString());

      // Shake/rotate effect for each step
      this.scene.tweens.add({
        targets: this.diceDisplay,
        angle: Math.random() * 20 - 10,
        scale: 1 + Math.random() * 0.2,
        duration: stepDuration / 2,
        yoyo: true
      });

      currentStep++;
      if (currentStep >= rollSteps) {
        clearInterval(rollInterval);

        // Final reveal animation
        this.diceDisplay.setText(result.toString());

        // Big pop-in effect for final result
        this.scene.tweens.add({
          targets: this.diceDisplay,
          scale: { from: 1.8, to: 1 },
          angle: { from: 360, to: 0 },
          duration: 400,
          ease: 'Back.out'
        });

        // Glow effect
        this.scene.tweens.add({
          targets: this.diceDisplay,
          alpha: { from: 0.5, to: 1 },
          yoyo: true,
          repeat: 2,
          duration: 100
        });
      }
    }, stepDuration);
  }

  /**
   * Update phase indicator
   */
  public updatePhase(phase: GamePhase): void {
    const phaseText = {
      [GamePhase.SETUP]: '⚙️ Setting up...',
      [GamePhase.ROLL_PHASE]: '🎲 Tryk SPACE for at slå!',
      [GamePhase.MOVE_PHASE]: '🏃 Moving...',
      [GamePhase.TILE_PHASE]: '📍 Resolving tile effect...',
      [GamePhase.CHALLENGE_PHASE]: '⚔️ Challenge time!',
      [GamePhase.EVENT_PHASE]: '🎉 Event!',
      [GamePhase.GAME_OVER]: '🏆 Game Over!'
    };

    this.phaseIndicator.setText(phaseText[phase] || '');
  }

  /**
   * Enable/disable the roll button
   */
  public setRollButtonEnabled(enabled: boolean): void {
    const button = this.rollButton.getAll()[2] as Phaser.GameObjects.Rectangle;

    if (enabled) {
      button.setFillStyle(0x27ae60);
      button.setInteractive();
    } else {
      button.setFillStyle(0x95a5a6);
      button.disableInteractive();
    }
  }

  /**
   * Set callback for when roll button is clicked
   */
  public onRollButtonClick(callback: () => void): void {
    this.onRollCallback = callback;
  }

  /**
   * Internal handler for roll button click
   */
  private onRollDice(): void {
    if (this.onRollCallback) {
      this.onRollCallback();
    }
  }

  /**
   * Show a message to the player
   */
  public showMessage(message: string, duration: number = 2000): void {
    const width = this.scene.cameras.main.width;
    const height = this.scene.cameras.main.height;

    const messageText = this.scene.add.text(width / 2, height / 2, message, {
      fontSize: '32px',
      color: '#ffffff',
      fontStyle: 'bold',
      backgroundColor: '#2c3e50',
      padding: { x: 30, y: 20 }
    });
    messageText.setOrigin(0.5);
    messageText.setDepth(200);

    // Fade in
    messageText.setAlpha(0);
    this.scene.tweens.add({
      targets: messageText,
      alpha: 1,
      duration: 300,
      onComplete: () => {
        // Wait and fade out
        this.scene.time.delayedCall(duration, () => {
          this.scene.tweens.add({
            targets: messageText,
            alpha: 0,
            duration: 300,
            onComplete: () => {
              messageText.destroy();
            }
          });
        });
      }
    });
  }

  /**
   * Show victory screen
   */
  public showVictory(winner: Player): void {
    const width = this.scene.cameras.main.width;
    const height = this.scene.cameras.main.height;

    // Dark overlay
    const overlay = this.scene.add.rectangle(0, 0, width, height, 0x000000, 0.7);
    overlay.setOrigin(0, 0);
    overlay.setDepth(300);

    // Victory text container
    const victoryContainer = this.scene.add.container(width / 2, height / 2);
    victoryContainer.setDepth(301);

    // Trophy
    const trophy = this.scene.add.text(0, -80, '🏆', {
      fontSize: '80px'
    });
    trophy.setOrigin(0.5);

    // Winner announcement
    const winnerText = this.scene.add.text(0, 0, `${winner.name} WINS!`, {
      fontSize: '48px',
      color: '#f39c12',
      fontStyle: 'bold'
    });
    winnerText.setOrigin(0.5);

    // Stats
    const statsText = this.scene.add.text(0, 60, `⭐ ${winner.stars} Stars  🪙 ${winner.coins} Coins`, {
      fontSize: '24px',
      color: '#ecf0f1'
    });
    statsText.setOrigin(0.5);

    victoryContainer.add([trophy, winnerText, statsText]);

    // Animate in
    victoryContainer.setScale(0);
    this.scene.tweens.add({
      targets: victoryContainer,
      scale: 1,
      duration: 600,
      ease: 'Back.out'
    });
  }
}
