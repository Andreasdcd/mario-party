# Project Tasks

**Last Updated:** 2026-04-20
**Status:** Setup Phase

---

## Current Sprint: Project Setup

### Phase: Documentation Complete ✅

- [x] Create project structure
- [x] Write CLAUDE.md
- [x] Write VISION.md
- [x] Write ROADMAP.md
- [x] Write DESIGN.md
- [x] Create coordination files
- [x] Create agent definition files

### Phase: Awaiting Approval

**Next Steps (pending human approval):**
1. Technical Agent finalizes tech stack decision
2. Gameplay Agent + Technical Agent work in parallel on foundation

---

## Backlog (Post-Approval)

### Foundation Phase (Week 1)

#### Technical Agent
- [ ] Finalize tech stack (Phaser 3 vs Godot)
- [ ] Set up project repository and build pipeline
- [ ] Create basic project structure (folders, entry point)
- [ ] Set up game state management system
- [ ] Implement basic rendering loop
- [ ] Create board data structure

#### Gameplay Agent
- [ ] Design turn system logic
- [ ] Implement player state management
- [ ] Design tile effect system architecture
- [ ] Create movement system (player moves X spaces)
- [ ] Implement dice roll mechanic
- [ ] Create win condition checker

**Handoff:** Technical Agent hands off working project setup to Gameplay Agent

---

### Core Mechanics Phase (Week 1-2)

#### Gameplay Agent
- [ ] Implement 4 tile types (Safe, Penalty, Challenge, Event)
- [ ] Create tile effect resolution system
- [ ] Implement coin/star resource tracking
- [ ] Build event system (shop, bonus, steal)
- [ ] Connect win condition to game loop

#### Challenge Agent
- [ ] Design challenge UI overlay system
- [ ] Implement Quick Math challenge
- [ ] Implement Risk Choice challenge
- [ ] Implement Pattern Match challenge
- [ ] Create challenge reward/penalty system
- [ ] Balance challenge difficulty and timing

**Handoff:** Gameplay Agent hands off working game loop to UI/UX Agent

---

### UI & Polish Phase (Week 2-3)

#### UI/UX Agent
- [ ] Design board visual layout (isometric or top-down)
- [ ] Create player token sprites/graphics
- [ ] Implement smooth token movement animation
- [ ] Design and implement player HUD (coins, stars, turn indicator)
- [ ] Create challenge overlay UI
- [ ] Design victory screen
- [ ] Add visual feedback (tile highlights, transitions)

#### Technical Agent
- [ ] Implement animation system
- [ ] Add sound effects (optional)
- [ ] Optimize rendering performance
- [ ] Add error handling and edge case fixes
- [ ] Create build for playtesting

**Handoff:** UI/UX Agent hands off polished build to Orchestrator for playtest

---

### Playtesting Phase (Week 3)

#### Orchestrator
- [ ] Conduct internal playtest with 2-4 people
- [ ] Document feedback and bugs
- [ ] Prioritize fixes and improvements

#### All Agents
- [ ] Fix critical bugs
- [ ] Balance tweaks (coin values, challenge difficulty)
- [ ] UI clarity improvements
- [ ] Final polish pass

**Deliverable:** v0.1 Vertical Slice ready to show

---

## Task Assignment Rules

1. **Orchestrator** assigns tasks by updating this file
2. **Agents** pick up tasks marked with their role
3. **Agents** move task to "In Progress" in STATUS.md
4. **Agents** complete task and document in HANDOFF.md
5. **Orchestrator** reviews and updates STATUS.md

---

## Priority Legend

- 🔴 Critical (blocks other work)
- 🟡 High (important for milestone)
- 🟢 Medium (should be done)
- ⚪ Low (nice to have)

Currently all setup tasks are 🔴 Critical.
