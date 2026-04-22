/**
 * Setup Scene - Player configuration before game starts
 */

import * as Phaser from 'phaser';
import { PLAYER_COLORS } from '../utils/Constants';

interface PlayerSetup {
  name: string;
  color: number;
  isNPC: boolean;
  difficulty?: 'easy' | 'medium' | 'hard';
}

export class SetupScene extends Phaser.Scene {
  private readonly PLAYER_COUNT: number = 4; // Always 4 players
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
    this.add.text(centerX, 40, 'BOARD GAME PARTY', {
      fontSize: '48px',
      color: '#2c3e50',
      fontStyle: 'bold'
    }).setOrigin(0.5);

    this.add.text(centerX, 90, '4 Spillere Setup', {
      fontSize: '24px',
      color: '#7f8c8d'
    }).setOrigin(0.5);

    // Initialize player setups for 4 players
    for (let i = 0; i < this.PLAYER_COUNT; i++) {
      this.playerSetups[i] = {
        name: '',
        color: this.availableColors[i].color,
        isNPC: false,
        difficulty: 'medium'
      };
      this.selectedColors.add(this.availableColors[i].color);
    }

    // Player setup forms (always 4)
    this.createPlayerForms();

    // Start button
    this.createStartButton();

    // Error message text
    this.errorText = this.add.text(centerX, 680, '', {
      fontSize: '16px',
      color: '#e74c3c'
    }).setOrigin(0.5);

    console.log('SetupScene: Ready for 4 player configuration');
  }


  private createPlayerForms(): void {
    const centerX = this.cameras.main.width / 2;
    const startY = 140;
    const formHeight = 120;

    for (let i = 0; i < this.PLAYER_COUNT; i++) {
      const y = startY + i * formHeight;

      // Player label
      this.add.text(centerX - 500, y, `Spiller ${i + 1}:`, {
        fontSize: '18px',
        color: '#2c3e50',
        fontStyle: 'bold'
      });

      // Name input
      this.add.text(centerX - 500, y + 25, 'Navn:', {
        fontSize: '14px',
        color: '#7f8c8d'
      });

      const nameInput = this.createInputField(centerX - 440, y + 45, 150, i);
      this.inputFields.push(nameInput);

      // Color selector
      this.add.text(centerX - 260, y + 30, 'Farve:', {
        fontSize: '14px',
        color: '#7f8c8d'
      });

      this.createColorSelector(i, centerX - 200, y + 20);

      // NPC Checkbox
      this.createNPCCheckbox(i, centerX - 60, y + 25);

      // Difficulty dropdown (only shown if NPC)
      this.createDifficultyDropdown(i, centerX + 150, y + 25);
    }
  }

  private createInputField(x: number, y: number, width: number, playerIndex: number): Phaser.GameObjects.DOMElement {
    const input = this.add.dom(x, y).createFromHTML(`
      <input
        type="text"
        id="player${playerIndex}_name"
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

  private createNPCCheckbox(playerIndex: number, x: number, y: number): void {
    // Label
    this.add.text(x, y + 5, 'NPC:', {
      fontSize: '14px',
      color: '#7f8c8d'
    });

    // Checkbox
    const checkbox = this.add.dom(x + 50, y).createFromHTML(`
      <input
        type="checkbox"
        id="player${playerIndex}_npc"
        style="
          width: 20px;
          height: 20px;
          cursor: pointer;
        "
      />
    `);

    const checkboxElement = checkbox.node.querySelector('input') as HTMLInputElement;
    checkboxElement.addEventListener('change', () => {
      this.playerSetups[playerIndex].isNPC = checkboxElement.checked;

      if (checkboxElement.checked) {
        // Auto-generate NPC name
        this.playerSetups[playerIndex].name = `CPU ${playerIndex + 1}`;

        // Update input field
        const nameInput = document.getElementById(`player${playerIndex}_name`) as HTMLInputElement;
        if (nameInput) {
          nameInput.value = `CPU ${playerIndex + 1}`;
          nameInput.disabled = true;
        }

        // Show difficulty dropdown
        const difficultySelect = document.getElementById(`player${playerIndex}_difficulty`) as HTMLSelectElement;
        if (difficultySelect) {
          difficultySelect.style.display = 'block';
        }
      } else {
        // Clear NPC name
        this.playerSetups[playerIndex].name = '';

        // Enable input field
        const nameInput = document.getElementById(`player${playerIndex}_name`) as HTMLInputElement;
        if (nameInput) {
          nameInput.value = '';
          nameInput.disabled = false;
        }

        // Hide difficulty dropdown
        const difficultySelect = document.getElementById(`player${playerIndex}_difficulty`) as HTMLSelectElement;
        if (difficultySelect) {
          difficultySelect.style.display = 'none';
        }
      }
    });
  }

  private createDifficultyDropdown(playerIndex: number, x: number, y: number): void {
    const dropdown = this.add.dom(x, y).createFromHTML(`
      <select
        id="player${playerIndex}_difficulty"
        style="
          display: none;
          padding: 8px;
          font-size: 14px;
          border: 2px solid #bdc3c7;
          border-radius: 4px;
          font-family: Arial, sans-serif;
          cursor: pointer;
        "
      >
        <option value="easy">Let</option>
        <option value="medium" selected>Mellem</option>
        <option value="hard">Svær</option>
      </select>
    `);

    const selectElement = dropdown.node.querySelector('select') as HTMLSelectElement;
    selectElement.addEventListener('change', () => {
      this.playerSetups[playerIndex].difficulty = selectElement.value as 'easy' | 'medium' | 'hard';
    });
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
    // Check if all players have names (human or NPC)
    for (let i = 0; i < this.PLAYER_COUNT; i++) {
      if (!this.playerSetups[i].name || this.playerSetups[i].name.length < 1) {
        if (!this.playerSetups[i].isNPC) {
          this.showError(`Spiller ${i + 1} mangler et navn!`);
          return;
        }
      }
    }

    // Check for duplicate names
    const names = this.playerSetups.map(p => p.name.toLowerCase());
    if (new Set(names).size !== names.length) {
      this.showError('Alle spillere skal have unikke navne!');
      return;
    }

    // Check if all colors are unique
    if (this.selectedColors.size !== this.PLAYER_COUNT) {
      this.showError('Alle spillere skal have forskellige farver!');
      return;
    }

    // All validation passed - start game
    console.log('Starting game with 4 players:', this.playerSetups);

    // Pass player data to GameScene
    this.scene.start('GameScene', {
      playerSetups: this.playerSetups
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
