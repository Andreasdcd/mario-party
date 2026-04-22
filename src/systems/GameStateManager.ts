/**
 * Central game state manager - single source of truth
 */

import { GameState, Player, Board, GamePhase, TileType } from '../types/GameTypes';
import { GAME_RULES, PLAYER_COLORS } from '../utils/Constants';

interface PlayerSetup {
  name: string;
  color: number;
}

export class GameStateManager {
  private state: GameState;
  private listeners: Map<string, Function[]>;

  constructor(playerSetups?: PlayerSetup[]) {
    this.listeners = new Map();
    this.state = this.createInitialState(playerSetups);
  }

  private createInitialState(playerSetups?: PlayerSetup[]): GameState {
    return {
      players: playerSetups ? this.createCustomPlayers(playerSetups) : this.createPlayers(4),
      currentPlayerIndex: 0,
      currentRound: 1,
      board: this.createDefaultBoard(),
      gamePhase: GamePhase.SETUP,
      winner: null
    };
  }

  private createCustomPlayers(setups: PlayerSetup[]): Player[] {
    return setups.map((setup, i) => ({
      id: i + 1,
      name: setup.name,
      position: 0,
      coins: GAME_RULES.STARTING_COINS,
      stars: GAME_RULES.STARTING_STARS,
      color: setup.color
    }));
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
    // Create a large winding path board (35 tiles)
    // Theme: Adventure Park - winding path through different areas

    const worldWidth = 2400;
    const worldHeight = 1600;

    // Define path coordinates - creates a winding "S" shape
    const pathCoordinates = [
      // Starting area (bottom-left)
      { x: 200, y: 1300 },   // 0 - START
      { x: 320, y: 1300 },   // 1
      { x: 440, y: 1300 },   // 2
      { x: 560, y: 1280 },   // 3
      { x: 680, y: 1240 },   // 4

      // First curve (going up-right)
      { x: 780, y: 1160 },   // 5
      { x: 860, y: 1060 },   // 6
      { x: 920, y: 950 },    // 7
      { x: 960, y: 840 },    // 8
      { x: 980, y: 720 },    // 9

      // Top section (middle area)
      { x: 980, y: 600 },    // 10
      { x: 960, y: 480 },    // 11
      { x: 920, y: 370 },    // 12
      { x: 860, y: 270 },    // 13
      { x: 780, y: 200 },    // 14

      // Top-left turn
      { x: 680, y: 180 },    // 15
      { x: 580, y: 190 },    // 16
      { x: 480, y: 220 },    // 17
      { x: 390, y: 270 },    // 18
      { x: 310, y: 340 },    // 19

      // Middle section (going down)
      { x: 250, y: 440 },    // 20
      { x: 220, y: 550 },    // 21
      { x: 220, y: 670 },    // 22
      { x: 250, y: 780 },    // 23
      { x: 310, y: 880 },    // 24

      // Bottom curve (going right)
      { x: 390, y: 950 },    // 25
      { x: 490, y: 1000 },   // 26
      { x: 600, y: 1030 },   // 27
      { x: 720, y: 1040 },   // 28
      { x: 840, y: 1030 },   // 29

      // Final section (toward finish area)
      { x: 960, y: 1000 },   // 30
      { x: 1070, y: 950 },   // 31
      { x: 1170, y: 890 },   // 32
      { x: 1260, y: 820 },   // 33
      { x: 1340, y: 740 }    // 34 - Near finish
    ];

    // Define tile types - balanced distribution for 35 tiles
    const tileTypes = [
      TileType.START,        // 0
      TileType.SAFE,         // 1
      TileType.SAFE,         // 2
      TileType.PENALTY,      // 3
      TileType.SAFE,         // 4
      TileType.CHALLENGE,    // 5
      TileType.SAFE,         // 6
      TileType.SAFE,         // 7
      TileType.EVENT,        // 8
      TileType.SAFE,         // 9
      TileType.PENALTY,      // 10
      TileType.SAFE,         // 11
      TileType.CHALLENGE,    // 12
      TileType.SAFE,         // 13
      TileType.SAFE,         // 14
      TileType.EVENT,        // 15
      TileType.SAFE,         // 16
      TileType.PENALTY,      // 17
      TileType.SAFE,         // 18
      TileType.SAFE,         // 19
      TileType.CHALLENGE,    // 20
      TileType.SAFE,         // 21
      TileType.SAFE,         // 22
      TileType.EVENT,        // 23
      TileType.SAFE,         // 24
      TileType.PENALTY,      // 25
      TileType.SAFE,         // 26
      TileType.CHALLENGE,    // 27
      TileType.SAFE,         // 28
      TileType.SAFE,         // 29
      TileType.EVENT,        // 30
      TileType.SAFE,         // 31
      TileType.PENALTY,      // 32
      TileType.SAFE,         // 33
      TileType.CHALLENGE     // 34
    ];

    // Build tiles array with coordinates
    const tiles = pathCoordinates.map((coord, index) => ({
      position: index,
      type: tileTypes[index],
      x: coord.x,
      y: coord.y
    }));

    return {
      id: 'adventure_park_board',
      name: 'Adventure Park',
      tiles,
      worldWidth,
      worldHeight
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
