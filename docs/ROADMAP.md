# Roadmap: Vertical Slice (v0.1)

**Goal:** Build the smallest playable version that proves the core game loop is fun.

**Target:** 2-3 weeks of focused development
**Status:** Planning Phase

---

## Vertical Slice Scope

### What's IN Scope

#### 1. Core Game Loop
- ✅ 2-4 players (hotseat, local)
- ✅ Turn-based movement system
- ✅ Simple board with 20-30 tiles
- ✅ Roll dice → move → land on tile → resolve event
- ✅ Win condition: first to 3 stars OR highest score after 10 rounds

#### 2. Tile Types (4 types max)
1. **Blue Tile (Safe)** - Gain 3 coins
2. **Red Tile (Penalty)** - Lose 2 coins
3. **Challenge Tile (Duel)** - Face a skill challenge vs opponent
4. **Event Tile (Special)** - Trigger special event (shop, star spawn, etc.)

#### 3. Challenge Types (3 types max)
1. **Quick Math** - "Pick two numbers that sum to X" (15 sec timer)
2. **Risk Choice** - "Bet 5 or 10 coins on outcome?" (decision-making)
3. **Pattern Match** - "Find the matching pair" (memory/attention)

Challenges award coins or allow stealing from opponents.

#### 4. Resources & Win Condition
- **Coins** - earned through tiles and challenges
- **Stars** - purchased at Event Tiles for 10 coins
- **Winner** - First to 3 stars OR most stars + coins after 10 rounds

#### 5. UI Elements
- Board view (isometric or top-down)
- Player tokens/avatars
- Current player indicator
- Coin/star counts
- Dice roll button
- Challenge overlay (pops up over board)
- Simple victory screen

#### 6. Polish Elements
- Smooth token movement animation
- Tile highlight on hover
- Clear turn transition
- Sound effects (optional but nice)
- Simple character sprites (can be colored circles initially)

### What's OUT of Scope (for v0.1)

❌ Multiple boards
❌ Character abilities or unique powers
❌ Complex event chains
❌ More than 3 challenge types
❌ Online multiplayer
❌ Save/load game state
❌ Settings menu
❌ Achievements or progression
❌ Advanced AI opponents

---

## Development Phases

### Phase 1: Foundation (Week 1)
**Owner:** Technical Agent + Gameplay Agent

**Deliverables:**
- Tech stack decision finalized
- Project setup (engine, repo, build pipeline)
- Core game state management
- Turn system (player rotation, turn flow)
- Simple board representation (data structure)
- Basic player movement (no animations yet)

**Success:** Can move 4 players around a board in turns via console/debug UI.

---

### Phase 2: Core Mechanics (Week 1-2)
**Owner:** Gameplay Agent + Challenge Agent

**Deliverables:**
- Tile effect system (hooks for different tile types)
- Implement 4 tile types (Blue, Red, Challenge, Event)
- Implement 3 challenge types with basic UI
- Coin/star resource system
- Win condition logic
- Event system (shop, star purchase)

**Success:** Full game loop works end-to-end with placeholder UI.

---

### Phase 3: UI & Polish (Week 2-3)
**Owner:** UI/UX Agent + Technical Agent

**Deliverables:**
- Visual board layout (isometric or top-down)
- Player tokens with smooth movement animation
- Challenge overlay UI (clean, clear)
- Turn indicator and player HUD
- Victory screen
- Basic sound effects
- Visual feedback (highlights, transitions)

**Success:** Game looks and feels polished. Playtesters enjoy the experience.

---

### Phase 4: Playtesting & Iteration (Week 3)
**Owner:** Orchestrator + All Agents

**Deliverables:**
- Internal playtest with 2-4 people
- Bug fixes and balance tweaks
- Challenge difficulty tuning
- UI clarity improvements
- Documentation for future phases

**Success:** Game is fun, clear, and replayable. Ready to show others.

---

## Key Milestones

| Milestone | Date Target | Description |
|-----------|-------------|-------------|
| M1: Setup Complete | Day 3 | Project structure, tech stack, repo ready |
| M2: Core Loop Working | Day 7 | Players can complete a full game (no UI polish) |
| M3: Challenges Implemented | Day 10 | All 3 challenge types functional |
| M4: UI Polish Pass | Day 14 | Game looks good, animations smooth |
| M5: Playtest Ready | Day 17 | Internal playtest build |
| M6: v0.1 Complete | Day 21 | Polished vertical slice ready to show |

---

## Post-Vertical Slice (Future)

**If v0.1 is successful, next steps could include:**
- Add 2-3 more challenge types
- Second board with different layout
- Character abilities (light asymmetry)
- Simple AI opponent for solo play
- Save/load system
- More event types
- Settings and options menu

**But:** Only proceed if v0.1 proves the core loop is fun.

---

## Risk Management

| Risk | Mitigation |
|------|------------|
| Challenges feel too "school-like" | Playtest early, integrate challenges into game fiction |
| Scope creep | Strict 4 tile types, 3 challenges limit for v0.1 |
| Tech stack choice delays progress | Decide in first 2 days, pick proven tools |
| UI polish takes too long | Use placeholder art initially, polish in Phase 3 |
| Game isn't fun | Pivot challenge types based on early playtests |

---

**Roadmap Summary:**
Build a small, complete game loop with 1 board, 4 tile types, 3 challenges, and 2-4 players. Polish it well. Playtest it. Ship it. Then decide next steps.
