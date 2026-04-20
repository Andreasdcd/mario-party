/**
 * Central game state manager - single source of truth
 */

import { GameState, Player, Board, GamePhase, TileType } from '../types/GameTypes';
import { GAME_RULES, PLAYER_COLORS } from '../utils/Constants';

export class GameStateManager {
  private state: GameState;
  private listeners: Map<string, Function[]>;

  constructor() {
    this.listeners = new Map();
    this.state = this.createInitialState();
  }

  private createInitialState(): GameState {
    return {
      players: this.createPlayers(4), // Start with 4 players
      currentPlayerIndex: 0,
      currentRound: 1,
      board: this.createDefaultBoard(),
      gamePhase: GamePhase.SETUP,
      winner: null
    };
  }

  private createPlayers(count: number): Player[] {
    const colors = [
      PLAYER_COLORS.PLAYER_1,
      PLAYER_COLORS.PLAYER_2,
      PLAYER_COLORS.PLAYER_3,
      PLAYER_COLORS.PLAYER_4
    ];

    return Array.from({ length: count }, (_, i) => ({
      id: i + 1,
      name: `Player ${i + 1}`,
      position: 0,
      coins: GAME_RULES.STARTING_COINS,
      stars: GAME_RULES.STARTING_STARS,
      color: colors[i]
    }));
  }

  private createDefaultBoard(): Board {
    // Create a simple 25-tile board
    const tiles = [
      { position: 0, type: TileType.START }
    ];

    // Define tile distribution (matching DESIGN.md)
    const distribution = [
      TileType.SAFE, TileType.SAFE, TileType.PENALTY, TileType.CHALLENGE,
      TileType.SAFE, TileType.EVENT, TileType.SAFE, TileType.CHALLENGE,
      TileType.SAFE, TileType.PENALTY, TileType.SAFE, TileType.SAFE,
      TileType.EVENT, TileType.CHALLENGE, TileType.SAFE, TileType.PENALTY,
      TileType.SAFE, TileType.SAFE, TileType.CHALLENGE, TileType.SAFE,
      TileType.EVENT, TileType.PENALTY, TileType.SAFE, TileType.SAFE
    ];

    distribution.forEach((type, i) => {
      tiles.push({ position: i + 1, type });
    });

    return {
      id: 'default_board',
      name: 'Classic Board',
      tiles
    };
  }

  // Getters
  public getState(): GameState {
    return { ...this.state }; // Return copy to prevent direct mutation
  }

  public getCurrentPlayer(): Player {
    return this.state.players[this.state.currentPlayerIndex];
  }

  public getPlayer(id: number): Player | undefined {
    return this.state.players.find(p => p.id === id);
  }

  public getTileAt(position: number): any {
    return this.state.board.tiles.find(t => t.position === position);
  }

  // State mutations
  public nextTurn(): void {
    this.state.currentPlayerIndex = (this.state.currentPlayerIndex + 1) % this.state.players.length;

    // If we've cycled back to player 1, increment round
    if (this.state.currentPlayerIndex === 0) {
      this.state.currentRound++;
      this.emit('ROUND_CHANGED', { round: this.state.currentRound });
    }

    this.emit('TURN_CHANGED', {
      playerId: this.getCurrentPlayer().id,
      round: this.state.currentRound
    });
  }

  public movePlayer(playerId: number, spaces: number): void {
    const player = this.getPlayer(playerId);
    if (!player) return;

    const boardSize = this.state.board.tiles.length;
    player.position = (player.position + spaces) % boardSize;

    this.emit('PLAYER_MOVED', { playerId, newPosition: player.position, spaces });
  }

  public addCoins(playerId: number, amount: number): void {
    const player = this.getPlayer(playerId);
    if (!player) return;

    player.coins = Math.max(0, player.coins + amount);
    this.emit('COINS_CHANGED', { playerId, amount, newTotal: player.coins });
  }

  public addStar(playerId: number): boolean {
    const player = this.getPlayer(playerId);
    if (!player) return false;

    player.stars++;
    this.emit('STARS_CHANGED', { playerId, newTotal: player.stars });

    // Check for instant win
    this.checkWinCondition();
    return true;
  }

  public setPhase(phase: GamePhase): void {
    this.state.gamePhase = phase;
    this.emit('PHASE_CHANGED', { phase });
  }

  public checkWinCondition(): Player | null {
    // Check for 3 stars (instant win)
    const starWinner = this.state.players.find(p => p.stars >= GAME_RULES.STARS_TO_WIN);
    if (starWinner) {
      this.state.winner = starWinner;
      this.setPhase(GamePhase.GAME_OVER);
      this.emit('GAME_OVER', { winner: starWinner });
      return starWinner;
    }

    // Check for round limit
    if (this.state.currentRound > GAME_RULES.MAX_ROUNDS) {
      // Find player with most stars (tiebreaker: most coins)
      const winner = this.state.players.reduce((prev, curr) => {
        if (curr.stars > prev.stars) return curr;
        if (curr.stars === prev.stars && curr.coins > prev.coins) return curr;
        return prev;
      });

      this.state.winner = winner;
      this.setPhase(GamePhase.GAME_OVER);
      this.emit('GAME_OVER', { winner });
      return winner;
    }

    return null;
  }

  // Event system
  public on(event: string, callback: Function): void {
    if (!this.listeners.has(event)) {
      this.listeners.set(event, []);
    }
    this.listeners.get(event)!.push(callback);
  }

  public off(event: string, callback: Function): void {
    if (!this.listeners.has(event)) return;
    const callbacks = this.listeners.get(event)!;
    const index = callbacks.indexOf(callback);
    if (index > -1) {
      callbacks.splice(index, 1);
    }
  }

  private emit(event: string, data?: any): void {
    if (this.listeners.has(event)) {
      this.listeners.get(event)!.forEach(callback => callback(data));
    }
  }

  // Debug
  public debug(): void {
    console.log('=== GAME STATE ===');
    console.log('Round:', this.state.currentRound);
    console.log('Current Player:', this.getCurrentPlayer().name);
    console.log('Phase:', this.state.gamePhase);
    console.log('Players:', this.state.players.map(p => ({
      name: p.name,
      position: p.position,
      coins: p.coins,
      stars: p.stars
    })));
  }
}
