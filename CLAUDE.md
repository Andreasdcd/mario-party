# Board Game Party - Claude Orchestrator Overview

**Project Type:** Turn-based party board game with skill challenges
**Status:** Initial Setup Phase
**Last Updated:** 2026-04-20

## What This Project Is

A Mario Party-inspired board game where players move around a board, land on tiles, and face **skill challenges** instead of traditional minigames. The game prioritizes:

- Strategic decision-making
- Math/logic integration that feels like gameplay
- Local multiplayer (hotseat)
- High replayability through system-driven design
- Polished, lightweight feel (fake 3D/isometric style)

## Project Structure

```
board-game-party/
├── CLAUDE.md                 # This file - project overview
├── docs/
│   ├── VISION.md            # Core game vision and design pillars
│   ├── ROADMAP.md           # Vertical slice roadmap
│   └── DESIGN.md            # Core systems and mechanics
├── coordination/
│   ├── TASKS.md             # Current task list
│   ├── STATUS.md            # Project status tracking
│   └── HANDOFF.md           # Agent-to-agent handoffs
├── agents/
│   ├── orchestrator.md      # Lead orchestrator agent definition
│   ├── gameplay.md          # Gameplay systems agent
│   ├── uiux.md              # UI/UX design agent
│   ├── challenges.md        # Challenge design agent
│   └── technical.md         # Technical implementation agent
└── src/                     # Source code (TBD structure)
```

## Agent Workflow

1. **Orchestrator** reads STATUS.md and assigns work via TASKS.md
2. **Specialist agents** pick up tasks, read their role definition + relevant docs
3. Agents complete work and write to HANDOFF.md for next agent
4. Orchestrator reviews handoffs and updates STATUS.md
5. Repeat

## Current Phase: Setup

**Goal:** Establish project foundation before building features.

**Next Steps:**
1. Complete all documentation files
2. Define agent roles clearly
3. Identify first 2 parallel work streams
4. Wait for human approval before proceeding

## Design Principles

- **Scope discipline:** Small, polished vertical slice first
- **System-driven:** Reusable mechanics over content quantity
- **Quality > Quantity:** Better to have 3 great challenge types than 20 mediocre ones
- **Offline-first:** No real-time multiplayer dependency
- **Accessible:** Easy to learn, hard to master

## Tech Stack (Proposed)

**To be decided by Technical Agent**, but likely:
- **Godot Engine** or **Phaser 3** for 2D/2.5D board game style
- **Simple art pipeline** (sprites, tilesets, basic animations)
- **JSON-driven content** for boards, challenges, events
- **Local save system** (no cloud dependency)

Reasoning: Fast iteration, lightweight, proven for turn-based games.

---

**Remember:** This project should feel like building ONE great game, not a giant platform. Start small. Ship vertical slice. Iterate.
