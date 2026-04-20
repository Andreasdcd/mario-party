# Board Game Party 🎲

**Version:** 0.1 - Technical Foundation Complete
**Status:** In Development - Foundation Phase
**Framework:** Phaser 3 + TypeScript

---

## Project Overview

Board Game Party is a turn-based party board game inspired by Mario Party, where players compete through strategic decisions and skill challenges instead of traditional minigames.

### Vision (v0.1 Vertical Slice)

- **1 board** with 25 tiles (circular layout)
- **4 tile types:** Safe, Penalty, Challenge, Event
- **3 challenge types:** Quick Math, Risk Choice, Pattern Match
- **2-4 players** (local hotseat)
- **Win condition:** First to 3 stars OR highest score after 10 rounds

---

## Tech Stack

- **Game Engine:** Phaser 3 (v4.0.0)
- **Language:** TypeScript
- **Build Tool:** Webpack 5
- **Dev Server:** webpack-dev-server with hot reload

---

## Project Structure

```
board-game-party/
├── docs/                   # Project documentation
│   ├── VISION.md          # Game vision and design pillars
│   ├── ROADMAP.md         # Development roadmap
│   └── DESIGN.md          # System design document
├── coordination/          # Agent coordination files
│   ├── TASKS.md           # Task tracking
│   ├── STATUS.md          # Project status
│   └── HANDOFF.md         # Agent handoffs
├── agents/                # Agent role definitions
├── src/                   # Source code
│   ├── main.ts            # Entry point
│   ├── scenes/            # Phaser scenes
│   ├── systems/           # Game systems
│   ├── types/             # TypeScript definitions
│   └── utils/             # Utilities and constants
├── assets/                # Game assets
│   └── data/              # JSON data files
└── public/                # Static files
```

---

## Getting Started

### Prerequisites

- Node.js (v18+)
- npm or yarn

### Installation

```bash
cd board-game-party
npm install
```

### Development

```bash
npm run dev
```

Opens dev server at `http://localhost:8080` with hot reload.

### Build

```bash
npm run build
```

Creates production build in `/dist`.

---

## Current Status

### ✅ Complete

- [x] Phaser 3 + TypeScript setup
- [x] Webpack build pipeline
- [x] Game state management system
- [x] Event-driven architecture
- [x] Board rendering (circular layout)
- [x] Player token system
- [x] Type-safe structure

### 🟡 In Progress

- [ ] Turn system logic (Gameplay Agent)
- [ ] Dice roll mechanic
- [ ] Tile effect system

### ⏸️ Not Started

- [ ] Challenge implementations
- [ ] UI/UX polish
- [ ] Animations
- [ ] Sound effects

---

## Architecture

### Core Systems

**GameStateManager** (`src/systems/GameStateManager.ts`)
- Centralized state management
- Event-driven updates
- Methods: `nextTurn()`, `movePlayer()`, `addCoins()`, `addStar()`, `checkWinCondition()`
- Events: `PLAYER_MOVED`, `TURN_CHANGED`, `COINS_CHANGED`, `STARS_CHANGED`, `GAME_OVER`

**Scenes**
- **BootScene**: Asset loading
- **GameScene**: Main gameplay

**Type System** (`src/types/GameTypes.ts`)
- Full TypeScript definitions for all game entities
- Enums for TileType, GamePhase, EventType, ChallengeType

---

## Game Rules (v0.1)

### Setup
- 4 players start at position 0 with 10 coins, 0 stars
- Board has 25 tiles in circular layout

### Turn Flow
1. Player rolls die (1-6)
2. Player token moves forward
3. Tile effect resolves
4. Next player's turn

### Tile Types
- **Safe (Blue):** +3 coins
- **Penalty (Red):** -2 coins
- **Challenge (Yellow):** Trigger skill challenge vs opponent
- **Event (Green):** Special event (shop, bonus, steal)

### Win Conditions
1. First player to reach **3 stars** wins immediately
2. After **10 rounds**, player with most stars wins (tiebreaker: coins)

---

## Development Workflow

This project uses an **agent-based workflow**:

1. **Orchestrator** coordinates work via `/coordination` files
2. **Specialist agents** (Gameplay, UI/UX, Challenge, Technical) work in parallel
3. Agents communicate via `HANDOFF.md`
4. Status tracked in `STATUS.md`

See `/coordination` and `/agents` for full details.

---

## Roadmap

**Week 1 (Foundation):** ✅ Technical setup complete
**Week 2 (Core Mechanics):** Turn system, tile effects, challenges
**Week 3 (Polish & Test):** UI polish, playtesting, bug fixes

Target: v0.1 Vertical Slice complete by Day 21

---

## Contributing

This is currently a closed development project. See `/docs/DESIGN.md` for system architecture.

---

## License

ISC

---

**Built with Claude Code** 🤖
