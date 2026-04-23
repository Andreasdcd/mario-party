/**
 * Team Memory - 2v2 Mini-Game
 *
 * Two teams compete to find matching pairs in a memory game.
 * Teams alternate turns flipping cards.
 * Most pairs collected wins.
 */

import * as Phaser from 'phaser';
import { MiniGameBase } from '../systems/MiniGameBase';

interface MemoryCard {
  id: number;
  symbol: string;
  isFlipped: boolean;
  isMatched: boolean;
  container: Phaser.GameObjects.Container;
}

export class TeamMemoryScene extends MiniGameBase {
  private cards: MemoryCard[] = [];
  private currentTeam: 1 | 2 = 1;
  private teamScores: Map<number, number> = new Map([[1, 0], [2, 0]]);
  private selectedCards: MemoryCard[] = [];
  private isProcessing: boolean = false;
  private teamIndicator!: Phaser.GameObjects.Text;
  private team1ScoreText!: Phaser.GameObjects.Text;
  private team2ScoreText!: Phaser.GameObjects.Text;

  // Card symbols (using emojis for visual appeal)
  private symbols = ['🍎', '🍌', '🍇', '🍊', '🍓', '🍉', '🍒', '🥝'];

  constructor() {
    super('TeamMemoryScene');
  }

  protected startGame(): void {
    console.log('🎮 Team Memory: Game starting!');

    // Setup UI
    this.createGameUI();

    // Create cards
    this.createCards();

    // Start first team's turn
    this.startTeamTurn();
  }

  /**
   * Create the game UI
   */
  private createGameUI(): void {
    const width = this.cameras.main.width;
    const height = this.cameras.main.height;

    // Background
    this.cameras.main.setBackgroundColor('#34495e');

    // Title
    const title = this.add.text(width / 2, 30, 'TEAM MEMORY', {
      fontSize: '32px',
      color: '#f39c12',
      fontStyle: 'bold'
    });
    title.setOrigin(0.5);

    // Get team assignments
    const team1Players = this.teamAssignment!.team1.map(id => this.players.find(p => p.id === id)!);
    const team2Players = this.teamAssignment!.team2.map(id => this.players.find(p => p.id === id)!);

    // Team 1 display (left side)
    this.add.text(100, 80, 'TEAM 1', {
      fontSize: '24px',
      color: '#3498db',
      fontStyle: 'bold'
    });

    team1Players.forEach((player, index) => {
      const y = 120 + (index * 30);
      this.add.text(100, y, player.name, {
        fontSize: '16px',
        color: '#ecf0f1'
      });

      const colorCircle = this.add.circle(80, y + 8, 6, player.color);
      colorCircle.setStrokeStyle(2, 0xffffff);
    });

    this.team1ScoreText = this.add.text(100, 190, 'Par: 0', {
      fontSize: '20px',
      color: '#f39c12',
      fontStyle: 'bold'
    });

    // Team 2 display (right side)
    const team2Title = this.add.text(width - 100, 80, 'TEAM 2', {
      fontSize: '24px',
      color: '#e74c3c',
      fontStyle: 'bold'
    });
    team2Title.setOrigin(1, 0);

    team2Players.forEach((player, index) => {
      const y = 120 + (index * 30);
      const nameText = this.add.text(width - 100, y, player.name, {
        fontSize: '16px',
        color: '#ecf0f1'
      });
      nameText.setOrigin(1, 0);

      const colorCircle = this.add.circle(width - 80, y + 8, 6, player.color);
      colorCircle.setStrokeStyle(2, 0xffffff);
    });

    this.team2ScoreText = this.add.text(width - 100, 190, 'Par: 0', {
      fontSize: '20px',
      color: '#f39c12',
      fontStyle: 'bold'
    });
    this.team2ScoreText.setOrigin(1, 0);

    // Current team indicator
    this.teamIndicator = this.add.text(width / 2, 230, '', {
      fontSize: '20px',
      color: '#ecf0f1',
      fontStyle: 'bold',
      backgroundColor: '#2c3e50',
      padding: { x: 20, y: 10 }
    });
    this.teamIndicator.setOrigin(0.5);

    // Instructions
    const instructions = this.add.text(width / 2, height - 30, 'Klik på kort for at vende dem', {
      fontSize: '16px',
      color: '#95a5a6'
    });
    instructions.setOrigin(0.5);
  }

  /**
   * Create memory cards
   */
  private createCards(): void {
    const width = this.cameras.main.width;
    const height = this.cameras.main.height;

    // Create pairs (8 symbols × 2 = 16 cards)
    const cardSymbols: string[] = [];
    this.symbols.forEach(symbol => {
      cardSymbols.push(symbol, symbol); // Add each symbol twice
    });

    // Shuffle cards
    this.shuffleArray(cardSymbols);

    // Card dimensions and layout
    const cardWidth = 80;
    const cardHeight = 100;
    const cols = 4;
    const rows = 4;
    const spacingX = 100;
    const spacingY = 120;
    const startX = width / 2 - ((cols - 1) * spacingX) / 2;
    const startY = height / 2 - ((rows - 1) * spacingY) / 2 + 20;

    // Create card objects
    let cardId = 0;
    for (let row = 0; row < rows; row++) {
      for (let col = 0; col < cols; col++) {
        const x = startX + (col * spacingX);
        const y = startY + (row * spacingY);
        const symbol = cardSymbols[cardId];

        const card = this.createCard(cardId, x, y, cardWidth, cardHeight, symbol);
        this.cards.push(card);

        cardId++;
      }
    }
  }

  /**
   * Create a single card
   */
  private createCard(
    id: number,
    x: number,
    y: number,
    width: number,
    height: number,
    symbol: string
  ): MemoryCard {
    const container = this.add.container(x, y);

    // Card back (shown by default)
    const cardBack = this.add.rectangle(0, 0, width, height, 0x2980b9, 1);
    cardBack.setStrokeStyle(4, 0xffffff);
    cardBack.setName('back');

    // Card pattern on back
    const pattern = this.add.text(0, 0, '?', {
      fontSize: '48px',
      color: '#ecf0f1',
      fontStyle: 'bold'
    });
    pattern.setOrigin(0.5);
    pattern.setName('pattern');

    // Card front (hidden initially)
    const cardFront = this.add.rectangle(0, 0, width, height, 0xecf0f1, 1);
    cardFront.setStrokeStyle(4, 0x2c3e50);
    cardFront.setVisible(false);
    cardFront.setName('front');

    // Symbol on front
    const symbolText = this.add.text(0, 0, symbol, {
      fontSize: '48px'
    });
    symbolText.setOrigin(0.5);
    symbolText.setVisible(false);
    symbolText.setName('symbol');

    container.add([cardFront, symbolText, cardBack, pattern]);

    // Make interactive
    cardBack.setInteractive({ useHandCursor: true });

    // Hover effect
    cardBack.on('pointerover', () => {
      if (!this.isProcessing) {
        cardBack.setScale(1.1);
      }
    });

    cardBack.on('pointerout', () => {
      cardBack.setScale(1);
    });

    // Click handler
    cardBack.on('pointerdown', () => {
      this.handleCardClick(id);
    });

    return {
      id,
      symbol,
      isFlipped: false,
      isMatched: false,
      container
    };
  }

  /**
   * Handle card click
   */
  private handleCardClick(cardId: number): void {
    const card = this.cards[cardId];

    // Ignore if already flipped, matched, or processing
    if (card.isFlipped || card.isMatched || this.isProcessing) {
      return;
    }

    // Ignore if already selected 2 cards
    if (this.selectedCards.length >= 2) {
      return;
    }

    // Flip card
    this.flipCard(card, true);
    this.selectedCards.push(card);

    // If 2 cards selected, check for match
    if (this.selectedCards.length === 2) {
      this.isProcessing = true;
      this.time.delayedCall(1000, () => {
        this.checkMatch();
      });
    }
  }

  /**
   * Flip a card
   */
  private flipCard(card: MemoryCard, show: boolean): void {
    card.isFlipped = show;

    const back = card.container.getByName('back') as Phaser.GameObjects.Rectangle;
    const pattern = card.container.getByName('pattern') as Phaser.GameObjects.Text;
    const front = card.container.getByName('front') as Phaser.GameObjects.Rectangle;
    const symbol = card.container.getByName('symbol') as Phaser.GameObjects.Text;

    if (show) {
      // Flip to front
      this.tweens.add({
        targets: card.container,
        scaleX: 0,
        duration: 150,
        onComplete: () => {
          back.setVisible(false);
          pattern.setVisible(false);
          front.setVisible(true);
          symbol.setVisible(true);

          this.tweens.add({
            targets: card.container,
            scaleX: 1,
            duration: 150
          });
        }
      });
    } else {
      // Flip to back
      this.tweens.add({
        targets: card.container,
        scaleX: 0,
        duration: 150,
        onComplete: () => {
          front.setVisible(false);
          symbol.setVisible(false);
          back.setVisible(true);
          pattern.setVisible(true);

          this.tweens.add({
            targets: card.container,
            scaleX: 1,
            duration: 150
          });
        }
      });
    }
  }

  /**
   * Check if selected cards match
   */
  private checkMatch(): void {
    const [card1, card2] = this.selectedCards;

    if (card1.symbol === card2.symbol) {
      // Match!
      card1.isMatched = true;
      card2.isMatched = true;

      // Award point to current team
      const currentScore = this.teamScores.get(this.currentTeam) || 0;
      this.teamScores.set(this.currentTeam, currentScore + 1);

      // Update score display
      this.updateScoreDisplays();

      // Add score to players
      const teamPlayers = this.currentTeam === 1
        ? this.teamAssignment!.team1
        : this.teamAssignment!.team2;

      teamPlayers.forEach(playerId => {
        this.addScore(playerId, 10); // 10 points per match
      });

      // Visual feedback
      this.showMatchFeedback(true);

      // Keep cards flipped - same team goes again
      this.selectedCards = [];
      this.isProcessing = false;

      // Check if game over
      if (this.isGameOver()) {
        this.time.delayedCall(1500, () => {
          this.endGame();
        });
      }
    } else {
      // No match
      this.showMatchFeedback(false);

      // Flip cards back
      this.time.delayedCall(500, () => {
        this.flipCard(card1, false);
        this.flipCard(card2, false);
        this.selectedCards = [];
        this.isProcessing = false;

        // Switch teams
        this.switchTeam();
      });
    }
  }

  /**
   * Show match feedback
   */
  private showMatchFeedback(matched: boolean): void {
    const width = this.cameras.main.width;
    const height = this.cameras.main.height;

    const message = matched ? 'MATCH! 🎉' : 'Ingen match';
    const color = matched ? '#27ae60' : '#e74c3c';

    const feedback = this.add.text(width / 2, height / 2 - 150, message, {
      fontSize: '36px',
      color: color,
      fontStyle: 'bold'
    });
    feedback.setOrigin(0.5);
    feedback.setAlpha(0);

    this.tweens.add({
      targets: feedback,
      alpha: 1,
      scale: { from: 0, to: 1 },
      duration: 300,
      ease: 'Back.out',
      onComplete: () => {
        this.time.delayedCall(1000, () => {
          this.tweens.add({
            targets: feedback,
            alpha: 0,
            duration: 200,
            onComplete: () => feedback.destroy()
          });
        });
      }
    });
  }

  /**
   * Update score displays
   */
  private updateScoreDisplays(): void {
    const team1Score = this.teamScores.get(1) || 0;
    const team2Score = this.teamScores.get(2) || 0;

    this.team1ScoreText.setText(`Par: ${team1Score}`);
    this.team2ScoreText.setText(`Par: ${team2Score}`);
  }

  /**
   * Start a team's turn
   */
  private startTeamTurn(): void {
    const teamName = this.currentTeam === 1 ? 'TEAM 1' : 'TEAM 2';
    const teamColor = this.currentTeam === 1 ? '#3498db' : '#e74c3c';

    this.teamIndicator.setText(`${teamName}'s tur`);
    this.teamIndicator.setColor(teamColor);

    // Flash indicator
    this.tweens.add({
      targets: this.teamIndicator,
      scale: { from: 1, to: 1.1 },
      duration: 300,
      yoyo: true
    });
  }

  /**
   * Switch to other team
   */
  private switchTeam(): void {
    this.currentTeam = this.currentTeam === 1 ? 2 : 1;
    this.startTeamTurn();
  }

  /**
   * Check if game is over
   */
  private isGameOver(): boolean {
    return this.cards.every(card => card.isMatched);
  }

  /**
   * End the game and show results
   */
  private endGame(): void {
    console.log('🏁 Team Memory: Game over!');

    // Determine winning team
    const team1Score = this.teamScores.get(1) || 0;
    const team2Score = this.teamScores.get(2) || 0;

    let winningTeam: 1 | 2 | null = null;
    if (team1Score > team2Score) {
      winningTeam = 1;
    } else if (team2Score > team1Score) {
      winningTeam = 2;
    }

    // Award bonus to winning team
    if (winningTeam) {
      const winningPlayers = winningTeam === 1
        ? this.teamAssignment!.team1
        : this.teamAssignment!.team2;

      winningPlayers.forEach(playerId => {
        this.addScore(playerId, 20); // Bonus for winning team
      });
    }

    const results = this.calculateResults();
    results.teamWinner = winningTeam === 1 ? 'team1' : winningTeam === 2 ? 'team2' : null;

    this.showResults(results);
  }

  /**
   * Shuffle array
   */
  private shuffleArray<T>(array: T[]): void {
    for (let i = array.length - 1; i > 0; i--) {
      const j = Math.floor(Math.random() * (i + 1));
      [array[i], array[j]] = [array[j], array[i]];
    }
  }

  protected cleanup(): void {
    this.cards.forEach(card => card.container.destroy());
    this.cards = [];
    this.teamScores.clear();
  }
}
