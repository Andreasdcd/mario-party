# Core Game Design

**Version:** 0.1 - Vertical Slice
**Last Updated:** 2026-04-20

---

## Game Loop Overview

```
[Game Start]
  ↓
[Turn Start] → Player rolls die → Move token → Land on tile
  ↓
[Resolve Tile] → Execute tile effect (gain coins, challenge, event, etc.)
  ↓
[Turn End] → Check win condition → Next player
  ↓
[Repeat until win condition met]
```

---

## Core Systems

### 1. Turn System

**Flow:**
1. Highlight current player
2. Player clicks "Roll Die" button
3. Die animates → shows result (1-6)
4. Player token moves forward N spaces
5. Tile effect resolves
6. Turn ends → next player becomes active

**Rules:**
- Players take turns in fixed order (P1 → P2 → P3 → P4)
- Cannot skip turn
- Movement is always forward (no backtracking)
- If player reaches end of board, loop back to start

---

### 2. Board System

**Structure:**
- Linear path with 20-30 tiles
- Tiles arranged in a circuit (loop)
- Each tile has a **type** and **position**

**Tile Types (v0.1):**

| Type | Color | Effect | Frequency |
|------|-------|--------|-----------|
| **Safe** | Blue | +3 coins | 50% of tiles |
| **Penalty** | Red | -2 coins | 20% of tiles |
| **Challenge** | Yellow | Trigger challenge vs random opponent | 20% of tiles |
| **Event** | Green | Trigger special event (shop, star spawn) | 10% of tiles |

**Board Layout Example (25 tiles):**
```
[START] → Blue → Blue → Red → Challenge → Blue → Event → Blue → Challenge
→ Blue → Red → Blue → Blue → Event → Challenge → Blue → Red → Blue
→ Blue → Challenge → Blue → Event → Red → Blue → [loop back to START]
```

---

### 3. Challenge System

Challenges are **quick skill tests** between two players.

**Challenge Flow:**
1. Active player lands on Challenge Tile
2. System randomly picks an opponent
3. Challenge UI overlay appears
4. Both players participate
5. Winner gains reward (coins or steals from loser)
6. Challenge UI closes → game resumes

**Challenge Types (v0.1):**

#### Challenge 1: Quick Math
- **Prompt:** "Pick two numbers that add to [target]"
- **Mechanics:**
  - System shows target (e.g., 15)
  - Both players pick two numbers from 1-10
  - Closest to target wins
  - Tie = both get smaller reward
- **Reward:** Winner gains 5 coins
- **Time Limit:** 15 seconds

#### Challenge 2: Risk Choice
- **Prompt:** "Bet 5 or 10 coins on a coin flip"
- **Mechanics:**
  - Both players choose bet amount (5 or 10)
  - System flips coin
  - Winner gains 2x their bet
  - Loser loses their bet
- **Reward:** Variable (based on bet)
- **Time Limit:** 10 seconds

#### Challenge 3: Pattern Match
- **Prompt:** "Find the matching pair"
- **Mechanics:**
  - Show 6 cards face-up for 3 seconds
  - Flip all cards face-down
  - Both players pick 2 cards
  - First to find matching pair wins
- **Reward:** Winner gains 5 coins, loser loses 2 coins
- **Time Limit:** 20 seconds

---

### 4. Resource System

**Coins:**
- Primary currency
- Gained through tiles and challenges
- Used to buy stars at Event Tiles
- Can be stolen via challenges

**Stars:**
- Victory points
- Purchased at Event Tiles for 10 coins
- Cannot be stolen (in v0.1)
- Win condition tied to star count

**Starting Resources:**
- Each player starts with 10 coins
- Each player starts with 0 stars

---

### 5. Event System

**Event Tiles** trigger special actions:

**Event Types (v0.1):**

1. **Shop Event**
   - Prompt: "Buy a star for 10 coins?"
   - If player has ≥10 coins → can purchase star
   - If player has <10 coins → "Not enough coins!"

2. **Bonus Event**
   - All players gain 5 coins (rare)

3. **Steal Event**
   - Active player can steal 3 coins from any opponent

**Event Frequency:**
- Shop: 70% of Event Tiles
- Bonus: 20% of Event Tiles
- Steal: 10% of Event Tiles

---

### 6. Win Condition

**Victory Conditions (first to trigger wins):**

1. **Star Victory:** First player to reach **3 stars** wins immediately
2. **Round Limit Victory:** After **10 rounds** (40 turns for 4 players):
   - Player with most stars wins
   - Tiebreaker: most coins
   - If still tied: shared victory

**Round Counting:**
- 1 round = all players complete 1 turn
- Track with a "Round Counter" UI element

---

## Game State Structure

```javascript
{
  players: [
    { id: 1, name: "Player 1", position: 0, coins: 10, stars: 0 },
    { id: 2, name: "Player 2", position: 0, coins: 10, stars: 0 },
    { id: 3, name: "Player 3", position: 0, coins: 10, stars: 0 },
    { id: 4, name: "Player 4", position: 0, coins: 10, stars: 0 }
  ],
  currentPlayerIndex: 0,
  currentRound: 1,
  boardLayout: [ /* array of 25 tile objects */ ],
  gamePhase: "ROLL_PHASE" | "MOVE_PHASE" | "TILE_PHASE" | "CHALLENGE_PHASE" | "EVENT_PHASE" | "GAME_OVER"
}
```

---

## UI Layout Mockup

```
┌─────────────────────────────────────────────────────────────┐
│  [Board Game Party]                    Round: 3/10          │
├─────────────────────────────────────────────────────────────┤
│                                                              │
│           [   GAME BOARD - Isometric View   ]              │
│                                                              │
│         [Tiles arranged in circuit with player tokens]     │
│                                                              │
├─────────────────────────────────────────────────────────────┤
│ Player 1 (YOU) ⭐⭐ 💰15     [ROLL DIE]                     │
│ Player 2       ⭐  💰8                                       │
│ Player 3       ⭐⭐⭐ 💰2   ← WINNER!                        │
│ Player 4       ⭐  💰12                                      │
└─────────────────────────────────────────────────────────────┘
```

**Challenge Overlay Example:**
```
┌───────────────────────────────────────┐
│        QUICK MATH CHALLENGE!          │
├───────────────────────────────────────┤
│  Pick two numbers that add to 15      │
│                                       │
│  [1] [2] [3] [4] [5] [6] [7] [8] [9] │
│                                       │
│  Your picks: ___ + ___                │
│                                       │
│  Time: 12s                [SUBMIT]    │
└───────────────────────────────────────┘
```

---

## Technical Architecture (Proposed)

### Option A: **Phaser 3 (JavaScript)**
- **Pros:** Fast 2D board game setup, great for isometric/top-down, JSON-driven
- **Cons:** Less structure than Godot
- **Best for:** Quick prototyping, web deployment

### Option B: **Godot 4 (GDScript)**
- **Pros:** Excellent scene system, built-in animation tools, exportable to desktop
- **Cons:** Slightly steeper learning curve
- **Best for:** Long-term project, multiple platforms

**Recommendation:** **Phaser 3** for v0.1 vertical slice
- Faster iteration
- Easy web deployment for playtesting
- JSON-driven content (boards, challenges)
- Can migrate to Godot later if needed

---

## Data-Driven Design

**Board Definition (JSON):**
```json
{
  "boardId": "classic_01",
  "tiles": [
    { "position": 0, "type": "START" },
    { "position": 1, "type": "SAFE" },
    { "position": 2, "type": "SAFE" },
    { "position": 3, "type": "PENALTY" },
    { "position": 4, "type": "CHALLENGE" },
    ...
  ]
}
```

**Challenge Definition (JSON):**
```json
{
  "challengeId": "quick_math_01",
  "type": "QUICK_MATH",
  "prompt": "Pick two numbers that add to {target}",
  "params": {
    "target": 15,
    "timeLimit": 15,
    "reward": 5
  }
}
```

This allows non-programmers to edit content later.

---

## Balance Considerations

**Coin Economy:**
- Average gain per turn: ~2-3 coins
- Star cost: 10 coins → ~3-4 turns to afford
- Challenges can swing ±5 coins → high impact

**Comeback Mechanics:**
- Steal events allow trailing players to catch up
- Challenges create opportunities for upsets
- Round limit prevents runaway victories

**Luck vs Skill Balance:**
- Dice roll = luck (movement)
- Challenge outcomes = skill
- Event triggers = luck
- Target: 60% skill, 40% luck

---

**Design Philosophy:**
Every system should be simple to implement, easy to understand, and fun to interact with. If a feature doesn't contribute to the core loop, cut it.
