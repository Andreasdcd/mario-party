# 🎮 Board Game Party - Major Upgrade Plan

**Dato:** 2026-04-22
**Status:** ⏸️ AFVENTER GODKENDELSE
**Anslået tid:** 4-6 timer fordelt på 4 agenter

---

## 📋 Oversigt af Ønskede Features

### 1. **Spil Setup Menu** (før spillet starter)
- Vælg antal spillere (2-4)
- For hver spiller: Indtast navn og vælg farve
- "Start Game" knap

### 2. **Stort Board med Tema**
- IKKE cirkulært layout - stort explorerbart board
- Tematisk grafik (f.eks. park, eventyr-sti)
- Man ser aldrig hele boardet på én gang

### 3. **Kamera System**
- Kamera følger altid den aktuelle spiller (zoom ind)
- Smooth transition når tur skifter
- Viser spilleren + omgivende tiles for kontekst
- ALDRIG zoomet ud til at vise hele kortet

### 4. **Fysisk 3D Terning**
- Animeret 3D terning der ruller
- Resultat: 1-10 (IKKE 1-6)
- Aktiveres med **SPACE** tasten (ikke klik)

### 5. **Turn Indicator**
- Tydeligt spillernavn: "DIN TUR, [Navn]!"
- Synlig når spilleren skal slå
- Forsvinder under andre faser

---

## 🎯 Agent Ansvarsfordeling

### **Agent 1: UI/UX Agent** (uiux.md)
**Ansvar:**
- Design og implementer MenuScene (spil setup)
- Opdater turn indicator til at være mere synlig
- Design SPACE-key prompt til terning

**Filer at oprette:**
- `src/scenes/MenuScene.ts` - Spil setup scene
- `src/ui/MenuUI.ts` - Menu UI komponenter
- `src/ui/PlayerSetup.ts` - Spiller konfiguration

**Filer at ændre:**
- `src/ui/GameUI.ts` - Opdater turn indicator, fjern click-button
- `src/main.ts` - Tilføj MenuScene først

---

### **Agent 2: Technical Agent** (technical.md)
**Ansvar:**
- Implementer kamera follow system
- Keyboard input handling (SPACE key)
- Smooth camera transitions
- 3D terning physics/animation

**Filer at oprette:**
- `src/systems/CameraManager.ts` - Kamera follow logik
- `src/systems/InputManager.ts` - Keyboard input
- `src/ui/Dice3D.ts` - 3D terning renderer

**Filer at ændre:**
- `src/scenes/GameScene.ts` - Integrer kamera system
- `src/utils/Constants.ts` - Kamera zoom settings

---

### **Agent 3: Visual Design Agent** (visual.md)
**Ansvar:**
- Design stort board layout (ikke cirkel)
- Vælg tema (park, eventyr, etc.)
- Specificer tile graphics
- Plan kamera framing

**Filer at oprette:**
- `docs/VISUAL_SPEC.md` - Komplet visual guide
- `assets/boards/adventure_board.json` - Nyt board layout

**Filer at ændre:**
- `src/utils/Constants.ts` - Tile farver og tema
- Board rendering logik efter nyt layout

---

### **Agent 4: Gameplay Agent** (gameplay.md)
**Ansvar:**
- Opdater terning til 1-10
- Turn flow med navne-display
- Game state management for setup
- Balance tile distribution

**Filer at ændre:**
- `src/systems/TurnManager.ts` - 1-10 dice, turn flow
- `src/systems/GameStateManager.ts` - Spiller setup state
- `src/utils/Constants.ts` - `DIE_MAX = 10`
- `src/types/GameTypes.ts` - Nye states for setup

---

## 📂 Fil Ændringsoversigt

### **Nye Filer (11 filer):**
```
src/scenes/MenuScene.ts          - Spil setup menu
src/ui/MenuUI.ts                 - Menu UI komponenter
src/ui/PlayerSetup.ts            - Spiller konfiguration form
src/systems/CameraManager.ts     - Kamera follow system
src/systems/InputManager.ts      - Keyboard input handler
src/ui/Dice3D.ts                 - 3D terning animation
docs/VISUAL_SPEC.md              - Visual design guide
assets/boards/adventure_board.json - Nyt board layout
coordination/AGENT_TASKS.md      - Task tracking for agenter
```

### **Filer at Ændre (8 filer):**
```
src/main.ts                      - Add MenuScene
src/scenes/GameScene.ts          - Camera integration, fjern old UI
src/ui/GameUI.ts                 - Turn indicator, remove button
src/systems/TurnManager.ts       - 1-10 dice, SPACE trigger
src/systems/GameStateManager.ts  - Setup state
src/utils/Constants.ts           - DIE_MAX=10, camera settings, colors
src/types/GameTypes.ts           - Setup phases
```

---

## 🔄 Implementerings Rækkefølge

### **Fase 1: Foundation** (Visual + Gameplay Agents)
**Varighed:** 1-1.5 timer

1. **Visual Agent:**
   - Design board tema og layout
   - Specificer tile graphics
   - Plan kamera views
   - Output: `VISUAL_SPEC.md`

2. **Gameplay Agent:**
   - Opdater constants (DIE_MAX = 10)
   - Design setup game states
   - Update turn flow logik
   - Output: Opdaterede constants og types

**Deliverable:** Visual spec klar + Game constants opdateret

---

### **Fase 2: Menu System** (UI/UX Agent)
**Varighed:** 1.5-2 timer

1. Create MenuScene
2. Player count selection (2-4 spillere)
3. For hver spiller:
   - Navn input field
   - Farve vælger (dropdown/buttons)
4. "Start Game" button → Transition til GameScene
5. Pass spiller data til game

**Deliverable:** Fungerende setup menu

---

### **Fase 3: Camera System** (Technical Agent)
**Varighed:** 1.5-2 timer

1. CameraManager system:
   - Follow current player
   - Zoom level calculation
   - Smooth pan/zoom transitions
2. Integration med GameScene
3. Trigger camera change ved turn switch
4. Test smooth følge-bevægelse

**Deliverable:** Kamera følger spillere, aldrig fuld board view

---

### **Fase 4: Input & Dice** (Technical + UI/UX Agents)
**Varighed:** 1-1.5 timer

**Technical Agent:**
1. InputManager (SPACE key detection)
2. Dice3D animation (rolling effect)
3. Random 1-10 resultat

**UI/UX Agent:**
1. "Tryk SPACE for at slå" prompt
2. Turn indicator: "DIN TUR, [Navn]!"
3. Fjern gamle click-button
4. Integration med SPACE trigger

**Deliverable:** Fysisk terning med SPACE control

---

### **Fase 5: Board Rendering** (Technical + Visual Agents)
**Varighed:** 1 time

1. **Visual Agent:** Levere board layout JSON
2. **Technical Agent:** Implementer rendering af ikke-cirkulært board
3. Test at kamera fungerer med nyt board
4. Tile positioning og spacing

**Deliverable:** Stort, tematisk board synligt med kamera follow

---

### **Fase 6: Integration & Polish** (Alle agenter)
**Varighed:** 0.5-1 time

1. Test komplet flow: Menu → Game → Turns → Win
2. Bug fixes
3. Visual polish
4. Performance check

**Deliverable:** Fuldt fungerende spil med alle features

---

## ⚙️ Tekniske Detaljer

### **Kamera Specs:**
```typescript
CAMERA: {
  ZOOM_LEVEL: 1.5,              // Tæt på spilleren
  FOLLOW_SMOOTHNESS: 0.1,       // Smooth følge
  TRANSITION_DURATION: 800,      // ms til næste spiller
  VIEW_RADIUS: 300,             // pixels synlige omkring spiller
  NEVER_SHOW_FULL_BOARD: true
}
```

### **Terning Specs:**
```typescript
DICE: {
  MIN: 1,
  MAX: 10,                      // ændret fra 6
  ANIMATION_DURATION: 1000,     // ms
  TRIGGER: 'SPACE',             // keyboard key
  PHYSICS: true                 // bounce/roll animation
}
```

### **Board Specs:**
```typescript
BOARD: {
  LAYOUT: 'path',               // ikke cirkel
  TILES: 30-40,                 // større board
  THEME: 'adventure_park',      // TBD af Visual Agent
  BRANCHING: false              // v0.1 = simpel sti
}
```

---

## 🎨 Visual Theme Forslag

**Option 1: Eventyr Park** 🌳
- Grøn/brun farvepalette
- Stier gennem park
- Træer og bænke langs vejen
- Hyggelig, tilgængelig stemning

**Option 2: Eventyr Sti** 🏰
- Fantasy-inspireret
- Varierede biomes (skov → bjerg → slot)
- Magiske elementer
- Mere eventyrlig stemning

**Visual Agent vælger baseret på vision!**

---

## ✅ Success Criteria

### **Menu System:**
- [ ] Kan vælge 2-4 spillere
- [ ] Kan indtaste unikke navne
- [ ] Kan vælge forskellige farver
- [ ] "Start Game" fungerer og starter GameScene

### **Camera System:**
- [ ] Kamera centreret på aktuel spiller
- [ ] Smooth transition ved turn change
- [ ] Aldrig viser hele boardet
- [ ] Omgivende tiles synlige for kontekst

### **Dice System:**
- [ ] SPACE key slår terning
- [ ] 3D animation spiller
- [ ] Resultat er 1-10
- [ ] Kun aktiv når det er spillerens tur

### **Turn System:**
- [ ] Spillernavn vises tydeligt ved deres tur
- [ ] "Tryk SPACE" prompt vises
- [ ] Turn flow korrekt med navne
- [ ] Camera følger ny spiller ved turn change

### **Board:**
- [ ] Ikke-cirkulært layout
- [ ] Tematisk grafik
- [ ] Fungerer med camera follow
- [ ] Læseligt ved zoom-niveau

---

## 🚨 Potentielle Risici

### **Risiko 1: Kamera Complexity**
**Problem:** Kamera følge kan være svært at få smooth
**Løsning:** Start simpelt (instant move), polish senere

### **Risiko 2: 3D Terning Performance**
**Problem:** Kompleks 3D animation kan lagg
**Løsning:** Start med 2D sprite animation hvis nødvendigt

### **Risiko 3: Board Layout**
**Problem:** Ikke-cirkulært board kræver ny position logik
**Løsning:** Brug array af positioner med x,y coordinates

### **Risiko 4: Scope Creep**
**Problem:** For mange features på én gang
**Løsning:** Strikt prioritering - MVP først, polish senere

---

## 📊 Prioritets Matrix

### **MUST HAVE (v0.1):**
1. ✅ Menu setup (spillere, navne, farver)
2. ✅ Kamera følger spiller
3. ✅ SPACE-key terning 1-10
4. ✅ Ikke-cirkulært board
5. ✅ Tydeligt turn indicator

### **SHOULD HAVE:**
- 🎯 3D terning animation (kan starte med 2D)
- 🎯 Tematisk grafik (kan bruge simple farver først)
- 🎯 Smooth camera transitions

### **NICE TO HAVE (v0.2+):**
- 💡 Board branching paths
- 💡 Particle effects
- 💡 Sound effects
- 💡 Advanced animations

---

## 🔄 Agent Handoff Plan

```
START
  ↓
Visual Agent (Design board + theme)
  ↓
Gameplay Agent (Update constants + states)
  ↓
UI/UX Agent (Menu scene)
  ↓
Technical Agent (Camera + Input)
  ↓
UI/UX + Technical (Dice + UI integration)
  ↓
Technical + Visual (Board rendering)
  ↓
ALL AGENTS (Integration test)
  ↓
DONE
```

---

## ❓ Spørgsmål til Godkendelse

### **1. Board Tema:**
Hvilket tema foretrækker du?
- A) 🌳 Eventyr Park (hyggelig, tilgængelig)
- B) 🏰 Fantasy Sti (eventyrlig, varieret)
- C) 🎪 Karneval (festlig, farverig)
- D) Andet forslag?

### **2. 3D Terning:**
- A) Fuld 3D physics animation (kompleks, flot)
- B) 2D sprite rotation (simplere, hurtigere)
- C) Start med B, upgrade til A senere

### **3. Board Størrelse:**
- A) 30 tiles (medium-lang)
- B) 40 tiles (lang)
- C) 50+ tiles (meget lang)

### **4. Prioritering:**
Hvilken rækkefølge?
- A) Som beskrevet i planen (anbefalet)
- B) Start med Camera først (for at se effekten tidligt)
- C) Start med Menu først (komplet feature-for-feature)

---

## 🎯 Næste Skridt (efter godkendelse)

1. **Human godkender plan** ✋
2. **Orchestrator Agent** assignerer tasks til agenter
3. **Visual Agent** starter med board design
4. **Agents arbejder i rækkefølge**
5. **Integration og test**
6. **Klar til at spille!** 🎮

---

**Estimeret Total Tid:** 4-6 timer
**Agenter Involveret:** 4 (UI/UX, Technical, Visual, Gameplay)
**Nye Filer:** ~11
**Ændrede Filer:** ~8

---

**⏸️ AFVENTER DIN GODKENDELSE**

Svar med:
- ✅ Godkendt som den er
- 🔄 Godkendt med ændringer: [specificer]
- ❌ Ikke godkendt: [hvorfor]
