/**
 * Math Sprint - FFA Mini-Game
 *
 * All players compete individually to solve math problems.
 * First to answer correctly gets points.
 * Most points after 10 questions wins.
 */

import * as Phaser from 'phaser';
import { MiniGameBase } from '../systems/MiniGameBase';
import { MiniGameDifficulty } from '../types/MiniGameTypes';

interface MathProblem {
  question: string;
  answer: number;
  options: number[];  // Multiple choice options
}

export class MathSprintScene extends MiniGameBase {
  private questionText!: Phaser.GameObjects.Text;
  private optionButtons: Phaser.GameObjects.Container[] = [];
  private playerScoreTexts: Map<number, Phaser.GameObjects.Text> = new Map();
  private currentProblem: MathProblem | null = null;
  private currentQuestionNumber: number = 0;
  private totalQuestions: number = 10;
  private usedProblems: Set<string> = new Set();
  private timerText!: Phaser.GameObjects.Text;
  private timeRemaining: number = 30000; // 30 seconds per question
  private questionStartTime: number = 0;

  constructor() {
    super('MathSprintScene');
  }

  protected startGame(): void {
    console.log('🎮 Math Sprint: Game starting!');

    // Setup UI
    this.createGameUI();

    // Start first question
    this.nextQuestion();
  }

  /**
   * Create the game UI
   */
  private createGameUI(): void {
    const width = this.cameras.main.width;
    const height = this.cameras.main.height;

    // Background
    this.cameras.main.setBackgroundColor('#2c3e50');

    // Title
    const title = this.add.text(width / 2, 30, 'MATH SPRINT', {
      fontSize: '32px',
      color: '#f39c12',
      fontStyle: 'bold'
    });
    title.setOrigin(0.5);

    // Question counter
    this.add.text(width / 2, 70, `Spørgsmål 1/${this.totalQuestions}`, {
      fontSize: '18px',
      color: '#bdc3c7'
    }).setOrigin(0.5).setName('questionCounter');

    // Question text area
    this.questionText = this.add.text(width / 2, height / 2 - 100, '', {
      fontSize: '48px',
      color: '#ecf0f1',
      fontStyle: 'bold'
    });
    this.questionText.setOrigin(0.5);

    // Timer
    this.timerText = this.add.text(width - 20, 20, '30', {
      fontSize: '32px',
      color: '#e74c3c',
      fontStyle: 'bold'
    });
    this.timerText.setOrigin(1, 0);

    // Create player score displays
    const startX = 50;
    const startY = height - 100;
    const spacing = 200;

    this.players.forEach((player, index) => {
      const x = startX + (index * spacing);

      // Player name with color indicator
      const nameText = this.add.text(x, startY, player.name, {
        fontSize: '16px',
        color: '#ecf0f1',
        fontStyle: 'bold'
      });

      // Color indicator
      const colorCircle = this.add.circle(x - 15, startY + 6, 6, player.color);
      colorCircle.setStrokeStyle(2, 0xffffff);

      // Score
      const scoreText = this.add.text(x, startY + 25, 'Score: 0', {
        fontSize: '18px',
        color: '#f39c12'
      });

      this.playerScoreTexts.set(player.id, scoreText);
    });

    // Create answer option buttons (will be populated per question)
    this.createOptionButtons();
  }

  /**
   * Create the 4 answer option buttons
   */
  private createOptionButtons(): void {
    const width = this.cameras.main.width;
    const height = this.cameras.main.height;

    const buttonWidth = 180;
    const buttonHeight = 80;
    const spacing = 220;
    const startX = width / 2 - ((spacing * 2) - spacing / 2);
    const y = height / 2 + 50;

    for (let i = 0; i < 4; i++) {
      const x = startX + (i * spacing);

      // Create button container
      const buttonContainer = this.add.container(x, y);

      // Button background
      const bg = this.add.rectangle(0, 0, buttonWidth, buttonHeight, 0x3498db, 1);
      bg.setStrokeStyle(4, 0x2c3e50);
      bg.setInteractive({ useHandCursor: true });
      bg.setName('bg');

      // Answer text
      const answerText = this.add.text(0, 0, '', {
        fontSize: '32px',
        color: '#ffffff',
        fontStyle: 'bold'
      });
      answerText.setOrigin(0.5);
      answerText.setName('text');

      // Key hint
      const keyHint = this.add.text(0, -45, `[${i + 1}]`, {
        fontSize: '18px',
        color: '#95a5a6'
      });
      keyHint.setOrigin(0.5);
      keyHint.setName('keyHint');

      buttonContainer.add([bg, answerText, keyHint]);

      // Hover effect
      bg.on('pointerover', () => {
        bg.setFillStyle(0x5dade2);
        bg.setScale(1.05);
      });

      bg.on('pointerout', () => {
        bg.setFillStyle(0x3498db);
        bg.setScale(1);
      });

      // Click handler
      const optionIndex = i;
      bg.on('pointerdown', () => {
        this.handleAnswer(optionIndex);
      });

      this.optionButtons.push(buttonContainer);
    }

    // Setup keyboard input (1, 2, 3, 4 keys)
    this.input.keyboard?.on('keydown-ONE', () => this.handleAnswer(0));
    this.input.keyboard?.on('keydown-TWO', () => this.handleAnswer(1));
    this.input.keyboard?.on('keydown-THREE', () => this.handleAnswer(2));
    this.input.keyboard?.on('keydown-FOUR', () => this.handleAnswer(3));
  }

  /**
   * Generate next question
   */
  private nextQuestion(): void {
    this.currentQuestionNumber++;

    if (this.currentQuestionNumber > this.totalQuestions) {
      // Game over
      this.endGame();
      return;
    }

    // Update question counter
    const counterText = this.children.getByName('questionCounter') as Phaser.GameObjects.Text;
    if (counterText) {
      counterText.setText(`Spørgsmål ${this.currentQuestionNumber}/${this.totalQuestions}`);
    }

    // Generate new problem
    this.currentProblem = this.generateProblem();
    this.questionText.setText(this.currentProblem.question);

    // Update option buttons
    this.currentProblem.options.forEach((option, index) => {
      const button = this.optionButtons[index];
      const text = button.getByName('text') as Phaser.GameObjects.Text;
      text.setText(option.toString());
    });

    // Reset timer
    this.timeRemaining = 30000;
    this.questionStartTime = Date.now();
    this.timerText.setColor('#e74c3c');

    // Enable buttons
    this.setButtonsEnabled(true);
  }

  /**
   * Generate a random math problem
   */
  private generateProblem(): MathProblem {
    let problem: MathProblem;
    let attempts = 0;

    do {
      const operators = ['+', '-', '×'];
      const operator = operators[Math.floor(Math.random() * operators.length)];

      let num1: number;
      let num2: number;
      let answer: number;

      if (operator === '+') {
        num1 = Math.floor(Math.random() * 50) + 10;
        num2 = Math.floor(Math.random() * 50) + 10;
        answer = num1 + num2;
      } else if (operator === '-') {
        num1 = Math.floor(Math.random() * 50) + 30;
        num2 = Math.floor(Math.random() * (num1 - 10)) + 5;
        answer = num1 - num2;
      } else {
        // Multiplication
        num1 = Math.floor(Math.random() * 12) + 2;
        num2 = Math.floor(Math.random() * 12) + 2;
        answer = num1 * num2;
      }

      const question = `${num1} ${operator} ${num2} = ?`;

      // Generate wrong answers
      const wrongAnswers = new Set<number>();
      while (wrongAnswers.size < 3) {
        const offset = Math.floor(Math.random() * 20) - 10;
        const wrong = answer + offset;
        if (wrong !== answer && wrong > 0) {
          wrongAnswers.add(wrong);
        }
      }

      // Create options array (shuffle)
      const options = [answer, ...Array.from(wrongAnswers)];
      this.shuffle(options);

      problem = { question, answer, options };

      attempts++;
    } while (this.usedProblems.has(problem.question) && attempts < 10);

    this.usedProblems.add(problem.question);
    return problem;
  }

  /**
   * Shuffle array
   */
  private shuffle<T>(array: T[]): void {
    for (let i = array.length - 1; i > 0; i--) {
      const j = Math.floor(Math.random() * (i + 1));
      [array[i], array[j]] = [array[j], array[i]];
    }
  }

  /**
   * Handle answer selection
   */
  private handleAnswer(optionIndex: number): void {
    if (!this.currentProblem) return;

    const selectedAnswer = this.currentProblem.options[optionIndex];
    const correct = selectedAnswer === this.currentProblem.answer;

    // Disable buttons
    this.setButtonsEnabled(false);

    // Visual feedback
    const button = this.optionButtons[optionIndex];
    const bg = button.getByName('bg') as Phaser.GameObjects.Rectangle;

    if (correct) {
      // Correct answer
      bg.setFillStyle(0x27ae60);

      // Add points to current player (for now, human player is player 1)
      // TODO: Proper turn-based input for multiplayer
      const currentPlayerId = this.players[0].id;
      this.addScore(currentPlayerId, 10);
      this.updateScoreDisplay(currentPlayerId);

      // Show correct feedback
      this.showFeedback('Rigtigt! +10 point', '#27ae60');
    } else {
      // Wrong answer
      bg.setFillStyle(0xe74c3c);

      // Highlight correct answer
      const correctIndex = this.currentProblem.options.indexOf(this.currentProblem.answer);
      const correctButton = this.optionButtons[correctIndex];
      const correctBg = correctButton.getByName('bg') as Phaser.GameObjects.Rectangle;
      correctBg.setFillStyle(0x27ae60);

      this.showFeedback('Forkert!', '#e74c3c');
    }

    // Wait then next question
    this.time.delayedCall(1500, () => {
      // Reset button colors
      this.optionButtons.forEach(btn => {
        const bg = btn.getByName('bg') as Phaser.GameObjects.Rectangle;
        bg.setFillStyle(0x3498db);
      });

      this.nextQuestion();
    });
  }

  /**
   * Show feedback message
   */
  private showFeedback(message: string, color: string): void {
    const width = this.cameras.main.width;
    const height = this.cameras.main.height;

    const feedback = this.add.text(width / 2, height / 2 + 150, message, {
      fontSize: '28px',
      color: color,
      fontStyle: 'bold'
    });
    feedback.setOrigin(0.5);
    feedback.setAlpha(0);

    this.tweens.add({
      targets: feedback,
      alpha: 1,
      duration: 200,
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
   * Enable/disable answer buttons
   */
  private setButtonsEnabled(enabled: boolean): void {
    this.optionButtons.forEach(button => {
      const bg = button.getByName('bg') as Phaser.GameObjects.Rectangle;
      if (enabled) {
        bg.setInteractive();
      } else {
        bg.disableInteractive();
      }
    });
  }

  /**
   * Update score display for a player
   */
  private updateScoreDisplay(playerId: number): void {
    const scoreText = this.playerScoreTexts.get(playerId);
    if (scoreText) {
      const score = this.getScore(playerId);
      scoreText.setText(`Score: ${score}`);
    }
  }

  /**
   * Update timer
   */
  update(): void {
    if (this.phase !== 2) return; // Only update during PLAYING phase

    if (this.currentProblem) {
      const elapsed = Date.now() - this.questionStartTime;
      const remaining = Math.max(0, this.timeRemaining - elapsed);
      const seconds = Math.ceil(remaining / 1000);

      this.timerText.setText(seconds.toString());

      // Change color when low
      if (seconds <= 5) {
        this.timerText.setColor('#e74c3c');
      } else if (seconds <= 10) {
        this.timerText.setColor('#f39c12');
      }

      // Time's up
      if (remaining === 0 && this.currentProblem) {
        this.handleAnswer(-1); // No answer selected
      }
    }
  }

  /**
   * End the game and show results
   */
  private endGame(): void {
    console.log('🏁 Math Sprint: Game over!');

    const results = this.calculateResults();
    this.showResults(results);
  }

  protected cleanup(): void {
    this.optionButtons.forEach(btn => btn.destroy());
    this.optionButtons = [];
    this.playerScoreTexts.clear();
  }
}
