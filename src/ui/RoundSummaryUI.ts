/**
 * Round Summary UI - Shows round stats and team assignments
 */

import * as Phaser from 'phaser';
import { Player } from '../types/GameTypes';
import { RoundData } from '../systems/RoundManager';

export class RoundSummaryUI {
  private scene: Phaser.Scene;
  private container?: Phaser.GameObjects.Container;
  private onContinueCallback?: () => void;

  constructor(scene: Phaser.Scene) {
    this.scene = scene;
  }

  /**
   * Show round summary overlay
   */
  public show(
    roundData: RoundData,
    players: Player[],
    teams?: { team1: number[]; team2: number[] } | { solo: number; team: number[] },
    onContinue?: () => void
  ): void {
    this.onContinueCallback = onContinue;

    const width = this.scene.cameras.main.width;
    const height = this.scene.cameras.main.height;

    // Create container
    this.container = this.scene.add.container(0, 0);
    this.container.setDepth(500);
    this.container.setScrollFactor(0);

    // Dark overlay background
    const overlay = this.scene.add.rectangle(0, 0, width, height, 0x000000, 0.85);
    overlay.setOrigin(0, 0);
    this.container.add(overlay);

    // Main content panel
    const panelWidth = 700;
    const panelHeight = 500;
    const panelX = width / 2;
    const panelY = height / 2;

    const panel = this.scene.add.rectangle(panelX, panelY, panelWidth, panelHeight, 0x2c3e50, 1);
    panel.setStrokeStyle(5, 0x3498db);
    this.container.add(panel);

    // Title
    const title = this.scene.add.text(panelX, panelY - 200, `🏁 RUNDE ${roundData.roundNumber} AFSLUTTET!`, {
      fontSize: '36px',
      color: '#3498db',
      fontStyle: 'bold'
    });
    title.setOrigin(0.5);
    this.container.add(title);

    // Show player tile colors
    let yOffset = panelY - 140;
    const playerStatsTitle = this.scene.add.text(panelX, yOffset, 'Spillere landede på:', {
      fontSize: '20px',
      color: '#ecf0f1',
      fontStyle: 'bold'
    });
    playerStatsTitle.setOrigin(0.5);
    this.container.add(playerStatsTitle);

    yOffset += 30;

    // Display each player's tile colors
    players.forEach(player => {
      const tileColors = roundData.playerTileColors.get(player.id) || [];
      const greenCount = tileColors.filter(c => c === 'SAFE').length;
      const redCount = tileColors.filter(c => c === 'PENALTY').length;

      const playerRow = this.scene.add.container(panelX - 280, yOffset);

      // Player name with color circle
      const colorCircle = this.scene.add.circle(0, 0, 8, player.color);
      colorCircle.setStrokeStyle(2, 0xffffff);
      playerRow.add(colorCircle);

      const nameText = this.scene.add.text(20, 0, player.name, {
        fontSize: '16px',
        color: '#ecf0f1'
      });
      nameText.setOrigin(0, 0.5);
      playerRow.add(nameText);

      // Tile stats
      const statsText = this.scene.add.text(200, 0, `🟢 ${greenCount}  🔴 ${redCount}`, {
        fontSize: '16px',
        color: '#f39c12'
      });
      statsText.setOrigin(0, 0.5);
      playerRow.add(statsText);

      this.container?.add(playerRow);
      yOffset += 30;
    });

    // Show mini-game type and teams
    if (roundData.miniGameType) {
      yOffset += 20;

      const miniGameTitle = this.scene.add.text(panelX, yOffset, '🎮 NÆSTE MINI-GAME:', {
        fontSize: '22px',
        color: '#f39c12',
        fontStyle: 'bold'
      });
      miniGameTitle.setOrigin(0.5);
      this.container.add(miniGameTitle);

      yOffset += 35;

      const miniGameNames = {
        'FFA': 'Math Sprint (Free-For-All)',
        '2v2': 'Team Memory (2v2)',
        '1v3': 'The Gauntlet (1v3)'
      };

      const miniGameName = this.scene.add.text(panelX, yOffset, miniGameNames[roundData.miniGameType], {
        fontSize: '18px',
        color: '#ecf0f1'
      });
      miniGameName.setOrigin(0.5);
      this.container.add(miniGameName);

      yOffset += 35;

      // Show team assignments
      if (roundData.miniGameType === '2v2' && teams && 'team1' in teams) {
        this.showTeamAssignment2v2(panelX, yOffset, teams, players);
      } else if (roundData.miniGameType === '1v3' && teams && 'solo' in teams) {
        this.showTeamAssignment1v3(panelX, yOffset, teams, players);
      }
    }

    // Continue button
    const buttonY = panelY + 200;
    const continueButton = this.createContinueButton(panelX, buttonY);
    this.container.add(continueButton);

    // Animate in
    this.container.setScale(0);
    this.container.setAlpha(0);
    this.scene.tweens.add({
      targets: this.container,
      scale: 1,
      alpha: 1,
      duration: 400,
      ease: 'Back.out'
    });
  }

  /**
   * Show 2v2 team assignment
   */
  private showTeamAssignment2v2(
    x: number,
    y: number,
    teams: { team1: number[]; team2: number[] },
    players: Player[]
  ): void {
    const teamsTitle = this.scene.add.text(x, y, 'HOLD ASSIGNMENT:', {
      fontSize: '18px',
      color: '#3498db',
      fontStyle: 'bold'
    });
    teamsTitle.setOrigin(0.5);
    this.container?.add(teamsTitle);

    y += 30;

    // Team 1
    const team1Players = teams.team1.map(id => players.find(p => p.id === id)!);
    const team1Text = this.scene.add.text(x - 150, y, `🔵 HOLD 1: ${team1Players.map(p => p.name).join(' + ')}`, {
      fontSize: '16px',
      color: '#3498db'
    });
    team1Text.setOrigin(0, 0.5);
    this.container?.add(team1Text);

    // Team 2
    const team2Players = teams.team2.map(id => players.find(p => p.id === id)!);
    const team2Text = this.scene.add.text(x - 150, y + 25, `🔴 HOLD 2: ${team2Players.map(p => p.name).join(' + ')}`, {
      fontSize: '16px',
      color: '#e74c3c'
    });
    team2Text.setOrigin(0, 0.5);
    this.container?.add(team2Text);
  }

  /**
   * Show 1v3 team assignment
   */
  private showTeamAssignment1v3(
    x: number,
    y: number,
    teams: { solo: number; team: number[] },
    players: Player[]
  ): void {
    const teamsTitle = this.scene.add.text(x, y, 'HOLD ASSIGNMENT:', {
      fontSize: '18px',
      color: '#3498db',
      fontStyle: 'bold'
    });
    teamsTitle.setOrigin(0.5);
    this.container?.add(teamsTitle);

    y += 30;

    // Solo player
    const soloPlayer = players.find(p => p.id === teams.solo)!;
    const soloText = this.scene.add.text(x - 150, y, `⭐ SOLO: ${soloPlayer.name}`, {
      fontSize: '16px',
      color: '#f39c12',
      fontStyle: 'bold'
    });
    soloText.setOrigin(0, 0.5);
    this.container?.add(soloText);

    // Team players
    const teamPlayers = teams.team.map(id => players.find(p => p.id === id)!);
    const teamText = this.scene.add.text(x - 150, y + 25, `🔴 HOLD: ${teamPlayers.map(p => p.name).join(', ')}`, {
      fontSize: '16px',
      color: '#e74c3c'
    });
    teamText.setOrigin(0, 0.5);
    this.container?.add(teamText);
  }

  /**
   * Create continue button
   */
  private createContinueButton(x: number, y: number): Phaser.GameObjects.Container {
    const buttonContainer = this.scene.add.container(x, y);

    // Button background
    const buttonBg = this.scene.add.rectangle(0, 0, 200, 50, 0x27ae60, 1);
    buttonBg.setStrokeStyle(3, 0x2c3e50);
    buttonBg.setInteractive({ useHandCursor: true });

    // Button text
    const buttonText = this.scene.add.text(0, 0, 'FORTSÆT', {
      fontSize: '20px',
      color: '#ffffff',
      fontStyle: 'bold'
    });
    buttonText.setOrigin(0.5);

    // Hover effects
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
      this.onContinue();
    });

    buttonContainer.add([buttonBg, buttonText]);
    return buttonContainer;
  }

  /**
   * Handle continue button click
   */
  private onContinue(): void {
    // Hide with animation
    if (this.container) {
      this.scene.tweens.add({
        targets: this.container,
        alpha: 0,
        scale: 0.8,
        duration: 300,
        onComplete: () => {
          this.container?.destroy();
          this.container = undefined;

          // Call callback
          if (this.onContinueCallback) {
            this.onContinueCallback();
          }
        }
      });
    }
  }

  /**
   * Destroy UI
   */
  public destroy(): void {
    this.container?.destroy();
    this.container = undefined;
  }
}
