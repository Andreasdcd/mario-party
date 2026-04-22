/**
 * Setup Scene - Player configuration before game starts
 */

import * as Phaser from 'phaser';
import { PLAYER_COLORS } from '../utils/Constants';

interface PlayerSetup {
  name: string;
  color: number;
}

export class SetupScene extends Phaser.Scene {
  private playerCount: number = 2;
  private playerSetups: PlayerSetup[] = [];
  private inputFields: Phaser.GameObjects.DOMElement[] = [];
  private selectedColors: Set<number> = new Set();
  private startButton!: Phaser.GameObjects.Text;
  private errorText!: Phaser.GameObjects.Text;

  // Available colors
  private availableColors = [
    { color: PLAYER_COLORS.PLAYER_1, name: 'Rød' },
    { color: PLAYER_COLORS.PLAYER_2, name: 'Blå' },
    { color: PLAYER_COLORS.PLAYER_3, name: 'Grøn' },
    { color: PLAYER_COLORS.PLAYER_4, name: 'Orange' }
  ];

  constructor() {
    super({ key: 'SetupScene' });
  }

  create(): void {
    const centerX = this.cameras.main.width / 2;

    // Title
    this.add.text(centerX, 60, 'BOARD GAME PARTY', {
      fontSize: '48px',
      color: '#2c3e50',
      fontStyle: 'bold'
    }).setOrigin(0.5);

    this.add.text(centerX, 110, 'Spiller Setup', {
      fontSize: '24px',
      color: '#7f8c8d'
    }).setOrigin(0.5);

    // Player count selector
    this.createPlayerCountSelector();

    // Player setup forms (will be created based on playerCount)
    this.createPlayerForms();

    // Start button
    this.createStartButton();

    // Error message text
    this.errorText = this.add.text(centerX, 650, '', {
      fontSize: '16px',
      color: '#e74c3c'
    }).setOrigin(0.5);

    console.log('SetupScene: Ready for player configuration');
  }

  private createPlayerCountSelector(): void {
    const centerX = this.cameras.main.width / 2;
    const y = 160;

    this.add.text(centerX, y, 'Antal Spillere:', {
      fontSize: '20px',
      color: '#34495e'
    }).setOrigin(0.5);

    // Create buttons for 2, 3, 4 players
    const buttonY = y + 40;
    const spacing = 80;
    const startX = centerX - spacing * 1.5;

    for (let i = 2; i <= 4; i++) {
      const x = startX + (i - 2) * spacing;
      const button = this.add.text(x, buttonY, i.toString(), {
        fontSize: '24px',
        color: this.playerCount === i ? '#ffffff' : '#2c3e50',
        backgroundColor: this.playerCount === i ? '#3498db' : '#ecf0f1',
        padding: { x: 20, y: 10 }
      })
      .setOrigin(0.5)
      .setInteractive({ useHandCursor: true });

      button.on('pointerdown', () => {
        this.setPlayerCount(i);
      });

      button.on('pointerover', () => {
        if (this.playerCount !== i) {
          button.setBackgroundColor('#bdc3c7');
        }
      });

      button.on('pointerout', () => {
        if (this.playerCount !== i) {
          button.setBackgroundColor('#ecf0f1');
        }
      });
    }
  }

  private setPlayerCount(count: number): void {
    this.playerCount = count;

    // Clear existing forms
    this.inputFields.forEach(field => field.destroy());
    this.inputFields = [];
    this.playerSetups = [];
    this.selectedColors.clear();

    // Recreate forms with new count
    this.createPlayerForms();

    // Recreate player count buttons to update colors
    this.scene.restart();
  }

  private createPlayerForms(): void {
    const centerX = this.cameras.main.width / 2;
    const startY = 260;
    const formHeight = 90;

    for (let i = 0; i < this.playerCount; i++) {
      const y = startY + i * formHeight;

      // Player label
      this.add.text(centerX - 280, y, `Spiller ${i + 1}:`, {
        fontSize: '18px',
        color: '#2c3e50',
        fontStyle: 'bold'
      });

      // Name input
      this.add.text(centerX - 280, y + 25, 'Navn:', {
        fontSize: '14px',
        color: '#7f8c8d'
      });

      const nameInput = this.createInputField(centerX - 220, y + 20, 150, i, 'name');
      this.inputFields.push(nameInput);

      // Color selector
      this.add.text(centerX + 0, y + 25, 'Farve:', {
        fontSize: '14px',
        color: '#7f8c8d'
      });

      this.createColorSelector(i, centerX + 60, y + 15);

      // Initialize player setup
      this.playerSetups[i] = {
        name: '',
        color: this.availableColors[i].color // Default color
      };
      this.selectedColors.add(this.availableColors[i].color);
    }
  }

  private createInputField(x: number, y: number, width: number, playerIndex: number, field: 'name'): Phaser.GameObjects.DOMElement {
    const input = this.add.dom(x, y).createFromHTML(`
      <input
        type="text"
        id="player${playerIndex}_${field}"
        placeholder="Indtast navn"
        style="
          width: ${width}px;
          padding: 8px;
          font-size: 14px;
          border: 2px solid #bdc3c7;
          border-radius: 4px;
          font-family: Arial, sans-serif;
        "
        maxlength="12"
      />
    `);

    const inputElement = input.node.querySelector('input') as HTMLInputElement;
    inputElement.addEventListener('input', () => {
      this.playerSetups[playerIndex].name = inputElement.value.trim();
      this.clearError();
    });

    return input;
  }

  private createColorSelector(playerIndex: number, x: number, y: number): void {
    const spacing = 40;

    this.availableColors.forEach((colorObj, colorIndex) => {
      const colorX = x + colorIndex * spacing;

      const circle = this.add.circle(colorX, y, 12, colorObj.color)
        .setStrokeStyle(3, 0xffffff);

      // Make it interactive
      circle.setInteractive({ useHandCursor: true });

      // Update selection visual
      if (this.playerSetups[playerIndex]?.color === colorObj.color) {
        circle.setStrokeStyle(4, 0x2c3e50);
      }

      circle.on('pointerdown', () => {
        // Check if color is already selected by another player
        if (this.selectedColors.has(colorObj.color) && this.playerSetups[playerIndex].color !== colorObj.color) {
          this.showError('Denne farve er allerede valgt!');
          return;
        }

        // Remove old color from selected set
        this.selectedColors.delete(this.playerSetups[playerIndex].color);

        // Update player color
        this.playerSetups[playerIndex].color = colorObj.color;
        this.selectedColors.add(colorObj.color);

        // Update visuals
        this.scene.restart();
        this.clearError();
      });

      circle.on('pointerover', () => {
        if (!this.selectedColors.has(colorObj.color) || this.playerSetups[playerIndex].color === colorObj.color) {
          circle.setScale(1.2);
        }
      });

      circle.on('pointerout', () => {
        circle.setScale(1.0);
      });
    });
  }

  private createStartButton(): void {
    const centerX = this.cameras.main.width / 2;

    this.startButton = this.add.text(centerX, 600, 'START SPIL', {
      fontSize: '28px',
      color: '#ffffff',
      backgroundColor: '#27ae60',
      padding: { x: 40, y: 15 }
    })
    .setOrigin(0.5)
    .setInteractive({ useHandCursor: true });

    this.startButton.on('pointerdown', () => {
      this.validateAndStart();
    });

    this.startButton.on('pointerover', () => {
      this.startButton.setBackgroundColor('#229954');
      this.startButton.setScale(1.05);
    });

    this.startButton.on('pointerout', () => {
      this.startButton.setBackgroundColor('#27ae60');
      this.startButton.setScale(1.0);
    });
  }

  private validateAndStart(): void {
    // Check if all players have names
    for (let i = 0; i < this.playerCount; i++) {
      if (!this.playerSetups[i].name || this.playerSetups[i].name.length < 1) {
        this.showError(`Spiller ${i + 1} mangler et navn!`);
        return;
      }
    }

    // Check for duplicate names
    const names = this.playerSetups.map(p => p.name.toLowerCase());
    if (new Set(names).size !== names.length) {
      this.showError('Alle spillere skal have unikke navne!');
      return;
    }

    // Check if all colors are unique
    if (this.selectedColors.size !== this.playerCount) {
      this.showError('Alle spillere skal have forskellige farver!');
      return;
    }

    // All validation passed - start game
    console.log('Starting game with players:', this.playerSetups);

    // Pass player data to GameScene
    this.scene.start('GameScene', {
      playerSetups: this.playerSetups.slice(0, this.playerCount)
    });
  }

  private showError(message: string): void {
    this.errorText.setText(message);

    // Clear error after 3 seconds
    this.time.delayedCall(3000, () => {
      this.clearError();
    });
  }

  private clearError(): void {
    this.errorText.setText('');
  }
}
