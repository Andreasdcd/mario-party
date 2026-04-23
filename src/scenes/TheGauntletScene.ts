/**
 * The Gauntlet - 1v3 Mini-Game
 *
 * Solo player races through a gauntlet of obstacles.
 * Team of 3 players tries to place obstacles to stop them.
 * Solo wins if they reach the end; Team wins if time runs out.
 */

import * as Phaser from 'phaser';
import { MiniGameBase } from '../systems/MiniGameBase';
import { MiniGamePhase } from '../types/MiniGameTypes';

interface Obstacle {
  x: number;
  y: number;
  graphics: Phaser.GameObjects.Rectangle;
}

export class TheGauntletScene extends MiniGameBase {
  private soloPlayer!: Phaser.GameObjects.Graphics;
  private soloPlayerId!: number;
  private teamPlayerIds!: number[];
  private obstacles: Obstacle[] = [];
  private checkpoints: Phaser.GameObjects.Graphics[] = [];
  private currentCheckpoint: number = 0;
  private totalCheckpoints: number = 5;
  private timeRemaining: number = 60000; // 60 seconds
  private gameStartTime: number = 0;
  private timerText!: Phaser.GameObjects.Text;
  private progressBar!: Phaser.GameObjects.Graphics;
  private soloSpeed: number = 200; // pixels per second
  private cursors!: Phaser.Types.Input.Keyboard.CursorKeys;
  private trackWidth: number = 600;
  private trackHeight: number = 800;
  private trackStartY: number = 100;
  private soloX: number = 0;
  private soloY: number = 0;
  private isMoving: boolean = true;

  constructor() {
    super('TheGauntletScene');
  }

  protected startGame(): void {
    console.log('🎮 The Gauntlet: Game starting!');

    // Get solo and team player IDs
    this.soloPlayerId = this.soloAssignment!.solo;
    this.teamPlayerIds = this.soloAssignment!.team;

    // Setup UI
    this.createGameUI();

    // Create track
    this.createTrack();

    // Create solo player
    this.createSoloPlayer();

    // Create checkpoints
    this.createCheckpoints();

    // Setup controls
    this.setupControls();

    // Start timer
    this.gameStartTime = Date.now();
  }

  /**
   * Create the game UI
   */
  private createGameUI(): void {
    const width = this.cameras.main.width;
    const height = this.cameras.main.height;

    // Background
    this.cameras.main.setBackgroundColor('#1a252f');

    // Title
    const title = this.add.text(width / 2, 30, 'THE GAUNTLET', {
      fontSize: '32px',
      color: '#f39c12',
      fontStyle: 'bold'
    });
    title.setOrigin(0.5);

    // Solo player info (left)
    const soloPlayer = this.players.find(p => p.id === this.soloPlayerId)!;
    this.add.text(50, 80, 'SOLO RUNNER', {
      fontSize: '20px',
      color: '#e74c3c',
      fontStyle: 'bold'
    });

    this.add.text(50, 110, soloPlayer.name, {
      fontSize: '16px',
      color: '#ecf0f1'
    });

    const soloColorCircle = this.add.circle(30, 118, 8, soloPlayer.color);
    soloColorCircle.setStrokeStyle(2, 0xffffff);

    // Team players info (right)
    const teamTitle = this.add.text(width - 50, 80, 'BLOCKERS', {
      fontSize: '20px',
      color: '#3498db',
      fontStyle: 'bold'
    });
    teamTitle.setOrigin(1, 0);

    const teamPlayers = this.teamPlayerIds.map(id => this.players.find(p => p.id === id)!);
    teamPlayers.forEach((player, index) => {
      const y = 110 + (index * 25);
      const nameText = this.add.text(width - 50, y, player.name, {
        fontSize: '16px',
        color: '#ecf0f1'
      });
      nameText.setOrigin(1, 0);

      const colorCircle = this.add.circle(width - 30, y + 8, 6, player.color);
      colorCircle.setStrokeStyle(2, 0xffffff);
    });

    // Timer
    this.timerText = this.add.text(width / 2, 70, '60', {
      fontSize: '28px',
      color: '#f39c12',
      fontStyle: 'bold'
    });
    this.timerText.setOrigin(0.5);

    // Progress bar
    this.progressBar = this.add.graphics();
    this.updateProgressBar(0);

    // Instructions
    const instructions = this.add.text(width / 2, height - 30, '← → for at styre | Undgå forhindringer', {
      fontSize: '16px',
      color: '#95a5a6'
    });
    instructions.setOrigin(0.5);
  }

  /**
   * Create the race track
   */
  private createTrack(): void {
    const width = this.cameras.main.width;

    const trackX = width / 2 - this.trackWidth / 2;
    const trackY = this.trackStartY;

    // Track background
    const track = this.add.rectangle(
      trackX,
      trackY,
      this.trackWidth,
      this.trackHeight,
      0x2c3e50,
      1
    );
    track.setOrigin(0, 0);
    track.setStrokeStyle(4, 0xffffff);

    // Grid lines
    const gridGraphics = this.add.graphics();
    gridGraphics.lineStyle(1, 0x7f8c8d, 0.3);

    // Horizontal lines
    for (let i = 0; i <= 10; i++) {
      const y = trackY + (i * this.trackHeight / 10);
      gridGraphics.lineBetween(trackX, y, trackX + this.trackWidth, y);
    }

    // Vertical lines
    for (let i = 0; i <= 4; i++) {
      const x = trackX + (i * this.trackWidth / 4);
      gridGraphics.lineBetween(x, trackY, x, trackY + this.trackHeight);
    }

    // Generate random obstacles
    this.generateObstacles(trackX, trackY);
  }

  /**
   * Generate random obstacles
   */
  private generateObstacles(trackX: number, trackY: number): void {
    const obstacleCount = 15;

    for (let i = 0; i < obstacleCount; i++) {
      // Spread obstacles evenly along the track
      const sectionY = trackY + (i / obstacleCount) * this.trackHeight + 100;
      const x = trackX + Math.random() * (this.trackWidth - 100) + 50;
      const y = sectionY + Math.random() * 40 - 20;

      const obstacle = this.add.rectangle(x, y, 80, 40, 0xe74c3c, 1);
      obstacle.setStrokeStyle(3, 0xc0392b);

      this.obstacles.push({ x, y, graphics: obstacle });
    }
  }

  /**
   * Create checkpoints
   */
  private createCheckpoints(): void {
    const width = this.cameras.main.width;
    const trackX = width / 2 - this.trackWidth / 2;
    const trackY = this.trackStartY;

    for (let i = 0; i < this.totalCheckpoints; i++) {
      const y = trackY + ((i + 1) / (this.totalCheckpoints + 1)) * this.trackHeight;

      const checkpoint = this.add.graphics();
      checkpoint.lineStyle(4, 0x27ae60, 1);
      checkpoint.lineBetween(trackX, y, trackX + this.trackWidth, y);

      this.checkpoints.push(checkpoint);
    }
  }

  /**
   * Create solo player
   */
  private createSoloPlayer(): void {
    const width = this.cameras.main.width;

    this.soloX = width / 2;
    this.soloY = this.trackStartY + 50;

    const soloPlayer = this.players.find(p => p.id === this.soloPlayerId)!;

    this.soloPlayer = this.add.graphics();
    this.soloPlayer.fillStyle(soloPlayer.color, 1);
    this.soloPlayer.fillCircle(0, 0, 20);
    this.soloPlayer.lineStyle(3, 0xffffff, 1);
    this.soloPlayer.strokeCircle(0, 0, 20);

    this.soloPlayer.setPosition(this.soloX, this.soloY);
  }

  /**
   * Setup keyboard controls
   */
  private setupControls(): void {
    this.cursors = this.input.keyboard!.createCursorKeys();
  }

  /**
   * Update game state
   */
  update(_time: number, delta: number): void {
    if (this.phase !== MiniGamePhase.PLAYING) return; // Only update during PLAYING phase

    if (!this.isMoving) return;

    // Update timer
    const elapsed = Date.now() - this.gameStartTime;
    const remaining = Math.max(0, this.timeRemaining - elapsed);
    const seconds = Math.ceil(remaining / 1000);

    this.timerText.setText(seconds.toString());

    // Change color when low
    if (seconds <= 10) {
      this.timerText.setColor('#e74c3c');
    }

    // Time's up - Team wins
    if (remaining === 0) {
      this.handleGameEnd(false);
      return;
    }

    // Handle player movement
    const width = this.cameras.main.width;
    const trackX = width / 2 - this.trackWidth / 2;
    const trackRight = trackX + this.trackWidth;

    if (this.cursors.left?.isDown) {
      this.soloX -= this.soloSpeed * (delta / 1000);
      this.soloX = Math.max(trackX + 30, this.soloX);
    } else if (this.cursors.right?.isDown) {
      this.soloX += this.soloSpeed * (delta / 1000);
      this.soloX = Math.min(trackRight - 30, this.soloX);
    }

    // Auto-move forward
    this.soloY += this.soloSpeed * (delta / 1000) * 0.5;

    this.soloPlayer.setPosition(this.soloX, this.soloY);

    // Check collision with obstacles
    if (this.checkObstacleCollision()) {
      this.handleCollision();
      return;
    }

    // Check checkpoint progress
    this.checkCheckpointProgress();

    // Update progress bar
    const trackEndY = this.trackStartY + this.trackHeight;
    const progress = Math.min(1, (this.soloY - this.trackStartY) / this.trackHeight);
    this.updateProgressBar(progress);

    // Check if reached end
    if (this.soloY >= trackEndY - 50) {
      this.handleGameEnd(true);
    }
  }

  /**
   * Check collision with obstacles
   */
  private checkObstacleCollision(): boolean {
    for (const obstacle of this.obstacles) {
      const distance = Phaser.Math.Distance.Between(
        this.soloX,
        this.soloY,
        obstacle.x,
        obstacle.y
      );

      if (distance < 50) {
        return true;
      }
    }

    return false;
  }

  /**
   * Handle collision with obstacle
   */
  private handleCollision(): void {
    this.isMoving = false;

    // Flash red
    this.cameras.main.flash(300, 255, 0, 0);

    // Show message
    const width = this.cameras.main.width;
    const height = this.cameras.main.height;

    const message = this.add.text(width / 2, height / 2, 'KOLLISION! Team vinder!', {
      fontSize: '36px',
      color: '#e74c3c',
      fontStyle: 'bold',
      backgroundColor: '#000000',
      padding: { x: 30, y: 20 }
    });
    message.setOrigin(0.5);

    this.time.delayedCall(2000, () => {
      this.handleGameEnd(false);
    });
  }

  /**
   * Check checkpoint progress
   */
  private checkCheckpointProgress(): void {
    if (this.currentCheckpoint >= this.totalCheckpoints) return;

    const checkpoint = this.checkpoints[this.currentCheckpoint];
    const checkpointY = checkpoint.y;

    if (this.soloY >= checkpointY) {
      this.currentCheckpoint++;

      // Visual feedback
      this.tweens.add({
        targets: checkpoint,
        alpha: 0,
        duration: 300
      });

      // Add points to solo player
      this.addScore(this.soloPlayerId, 10);
    }
  }

  /**
   * Update progress bar
   */
  private updateProgressBar(progress: number): void {
    const width = this.cameras.main.width;

    this.progressBar.clear();
    this.progressBar.fillStyle(0x27ae60, 1);
    this.progressBar.fillRect(width / 2 - 200, 100, 400 * progress, 20);
    this.progressBar.lineStyle(3, 0xffffff, 1);
    this.progressBar.strokeRect(width / 2 - 200, 100, 400, 20);
  }

  /**
   * Handle game end
   */
  private handleGameEnd(soloWon: boolean): void {
    this.isMoving = false;

    console.log(`🏁 The Gauntlet: ${soloWon ? 'Solo' : 'Team'} wins!`);

    // Award points
    if (soloWon) {
      // Solo player gets big bonus
      this.addScore(this.soloPlayerId, 50);
    } else {
      // Team gets bonus
      this.teamPlayerIds.forEach(playerId => {
        this.addScore(playerId, 20);
      });
    }

    const results = this.calculateResults();
    results.soloWinner = soloWon;

    this.time.delayedCall(1500, () => {
      this.showResults(results);
    });
  }

  protected cleanup(): void {
    this.obstacles.forEach(obs => obs.graphics.destroy());
    this.obstacles = [];
    this.checkpoints.forEach(cp => cp.destroy());
    this.checkpoints = [];
  }
}
