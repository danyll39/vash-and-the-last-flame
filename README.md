# Vash and the Last Flame: Project Plan

A small, finishable, turn-based fantasy RPG built with React and Vite. This is a portfolio piece by Ursala Lindsey.

> **Status:** M2 done. The opening scene plays, you can talk to NPCs, open chests, and walk between Candlebrook and Mosswood, with a HUD on top. Next up is M3 (turn-based combat). Work through the milestones below in order and check off each item as you finish it.

## Getting started

```bash
npm install
npm run dev        # http://localhost:5173
npm test           # Vitest in watch mode (npx vitest run for a single run)
npm run lint       # oxlint
npm run format     # Prettier
npm run build      # production build in dist/
```

---

## 1. Design decisions (locked)

| Question | Decision |
|---|---|
| Combat | **Turn-based**: the player picks Attack, Skill, Item, or Flee, then the enemy acts |
| View | **Top-down tile map** with arrow-key or WASD movement on a grid |
| Art | **Free CC0 pixel-art pack** (Kenney *Tiny Dungeon* and *Tiny Town*, 16×16 tiles, scaled up 3×) |
| Setting | **Classic fantasy** with an original story |
| Platform | Desktop browser first; mobile is a stretch goal |
| Length | About 30–45 minutes of play from start to credits |

---

## 2. Core idea and setting

**Pitch:** *The lantern that protects your village is going out. Relight the three shrine flames before the Lightless King swallows the valley in darkness.*

- **Candlebrook** is a small village in a valley. A great lantern in the village square keeps monsters away, but it has started to flicker.
- The light came from three **shrine flames**: one in the **Mosswood** (forest), one in the **Gloam Caves**, and one at the top of the **Ashen Spire** (ruined tower).
- The **Lightless King** feeds on light, and he has been stealing the flames. His shades now roam the valley. *(Twist: he is Corvin Ashe, Candlebrook's first lamplighter, who hoarded the light out of fear of the dark. You free him at the end. The full story is in [STORY.md](STORY.md).)*
- You play the lamplighter's apprentice. You take the old lamplighter's staff and set out to relight each shrine, and the village lantern brightens each time you do.

**The original twist, Light:** Your skill resource is **Light**, not mana. Skills spend Light. Resting at a lit shrine refills it. Each shrine you relight also raises your maximum Light, so story progress shows up directly in your character's power.

### Characters
- **Player:** the apprentice. One playable character, so there's no party system to build.
- **Old Wick:** the lamplighter, who gives the main quests.
- **Bren:** the shopkeeper.
- **Tamsin:** a farmer who gives a side quest.
- **The Lightless King:** the final boss at the top of the Ashen Spire.
- **Vash:** the player's fixed name. The cast's voices, every scene, and all NPC lines are in [STORY.md](STORY.md).

---

## 3. Gameplay loop

```
 Village (talk, shop, take quests)
        │
        ▼
 Explore a zone map ──► step on enemy / random encounter ──► Turn-based battle
        ▲                                                       │
        │                       win: XP + gold + loot           │
        │                       lose: wake up in village, −gold │
        └────── level up, equip items, finish quest ◄───────────┘
        │
        ▼
 Reach shrine → mini-boss → relight flame → zone cleared → next zone unlocks
```

### Exploring
- Grid movement, one tile per keypress, with blocked tiles for walls, water, and trees.
- Doors and edge tiles warp you to another map (`{ map, x, y }`).
- NPCs and chests are interactable tiles: face them and press **Space** or **E**.
- Enemies are **visible on the map** and wander a little. You fight when you bump into one, so there are no random encounters to frustrate players.

### Combat (turn-based, 1 vs 1–3 enemies)
- **Actions:** Attack, Skill (costs Light), Item, and Flee (60% chance, not allowed in boss fights).
- **Turn order:** player first, then each enemy. Add a Speed stat as a stretch goal.
- **Damage formula:** `max(1, attacker.atk + weaponBonus − defender.def + random(−2..2))`
- **Starting skills:**
  - **Flare** (2 Light): 1.5× damage
  - **Mend** (3 Light): heal 30% of max HP
  - **Radiance** (5 Light, unlocked at shrine 2): hits all enemies
- **Win:** gain XP, gold, and a chance at an item drop. **Lose:** return to the village with full HP and lose half your gold.

### Leveling
- Stats: **HP, Light, ATK, DEF**. You start at level 1 with 30 HP, 5 Light, 5 ATK, and 2 DEF. Each shrine you relight adds +2 max Light.
- XP needed for the next level is `level * 20`, and the level cap is **10**.
- Each level-up adds +8 HP, +2 ATK, +1 DEF, and +1 Light, then fully heals you.

### Items (12 total; prices, shop stock, and the gold check are in [ITEMS.md](ITEMS.md))
| Type | Examples |
|---|---|
| Consumables | Herb (+20 HP), Tonic (+50 HP), Wick Oil (+5 Light), Smoke Bomb (guaranteed flee), Elixir (full HP and Light) |
| Weapons | Lamplighter's Staff (+2), Iron Sword (+5, bought from Bren), Emberblade (+9, dropped by the Pale Crawler) |
| Armor | Cloth Coat (+1), Leather Vest (+3), Spire Mail (+6) |
| Key items | Tamsin's Locket |

Each item is a plain data object, for example `{ id, name, type, value, price, description }`. There's one weapon slot and one armor slot, and the inventory is a simple list.

### Quests (3 main + 2 side)
1. **Relight the Mosswood Shrine** (main): beat the mini-boss *Thornback Boar*.
2. **Relight the Gloam Shrine** (main): beat *the Pale Crawler*.
3. **Relight the Spire Shrine** (main): beat **the Lightless King**, then the credits roll.
4. **Lost Locket** (side, Tamsin): find a chest in the caves. Reward: Tonic ×3 and 50 gold.
5. **Pest Control** (side, Bren): defeat 5 Mosswood slimes. Reward: 20% off everything in the shop, plus a Leather Vest.

A quest is a data object `{ id, title, giver, status: 'locked'|'active'|'done', goal: { type: 'defeat'|'collect'|'flag', target, count } }`, and game events update its progress.

---

## 4. Scope

### In scope (version 1)
- 4 maps: Village, Mosswood, Gloam Caves, Ashen Spire. The Spire has 2 floors, so that's 5 map files. **The world layout and every map's tile layout are in [MAPS.md](MAPS.md).**
- 6 regular enemy types (2 per zone), 2 mini-bosses, and 1 final boss. **Stats, special moves, and boss phases are in [ENEMIES.md](ENEMIES.md).**
- 1 shop, 4 NPCs, and short dialogue boxes with no branching choices.
- Saving and loading with `localStorage`, using one save slot.
- A title screen, a game-over screen, and a credits screen.

### Out of scope (park these ideas in "Someday" below)
- Party members, crafting, branching dialogue, multiple save slots, procedural maps, multiplayer, and a backend.

### Someday (only after v1 ships)
- Sound effects and music (CC0 from Kenney or OpenGameArt)
- Speed stat and turn order
- Mobile on-screen D-pad
- Let players choose their own name instead of "Vash"

**Rule of thumb:** if a new idea needs a new system, it goes to "Someday." If it only needs new data, such as one more enemy or item, it's fine to add.

---

## 5. Tech stack

| Concern | Choice | Why |
|---|---|---|
| Framework | **React 19 + Vite 8** | Fast dev server with hot reload, and a simple static build |
| Game state | **`useReducer` + Context** | Fits a turn-based game: every action is a dispatched event, and the state is easy to save as JSON |
| Map rendering | **CSS Grid of tile `<div>`s** using sprite-sheet `background-position` | No canvas or game engine needed. A 20×15 grid is only 300 nodes, which is fine |
| Maps | 2D arrays in JS modules (`src/data/maps/*.js`) | Simple to start. Optionally switch to the [Tiled](https://www.mapeditor.org/) editor later and import its JSON |
| Game data | Plain JS modules: `enemies.js`, `items.js`, `quests.js`, `dialogue.js` | Content stays separate from logic |
| Logic tests | **Vitest** | Pure functions such as damage, XP, and quest progress are easy to unit-test, and the tests look good in a portfolio |
| Styling | Plain CSS modules and a pixel font (*Press Start 2P* from Google Fonts) | |
| Persistence | `localStorage` | No backend needed |
| Deploy | **Render static site** or GitHub Pages | Free hosting from its own repo |

**Why not Phaser or another engine?** An engine would hide the React skills this project is meant to show. A turn-based grid game doesn't need a physics or render loop, and React state is enough.

### Folder structure
```
lanternhold-rpg/
├── public/assets/          # Kenney sprite sheets (keep their License.txt!)
├── src/
│   ├── main.jsx
│   ├── App.jsx             # switches screens: title | world | battle | gameover | credits
│   ├── state/
│   │   ├── gameContext.js  # the context object only, so fast refresh works
│   │   ├── GameProvider.jsx
│   │   ├── useGame.js
│   │   ├── gameReducer.js  # all state changes live here
│   │   └── save.js         # localStorage save/load
│   ├── logic/              # pure functions, unit-tested
│   │   ├── combat.js
│   │   ├── leveling.js
│   │   ├── movement.js
│   │   └── quests.js
│   ├── data/
│   │   ├── maps/
│   │   ├── enemies.js
│   │   ├── items.js
│   │   ├── quests.js
│   │   └── dialogue.js
│   ├── components/
│   │   ├── world/          # TileMap, Tile, Player, NPC, DialogueBox
│   │   ├── battle/         # BattleScreen, ActionMenu, CombatLog, HealthBar
│   │   └── ui/             # HUD, InventoryPanel, QuestLog, ShopPanel
│   └── hooks/
│       └── useKeyboard.js
└── tests/
```

### State shape (starting point)
```js
{
  screen: 'title',            // 'title' | 'world' | 'battle' | 'gameover' | 'credits'
  player: { name, level, xp, hp, maxHp, light, maxLight, atk, def, gold,
            weapon, armor, inventory: {} },   // { herb: 3 }, stacks up to 9
  world:  { mapId: 'village', x: 5, y: 7, facing: 'down',
            defeatedEnemies: [],   // cleared when you change maps, so regular enemies respawn
            defeatedBosses: [], openedChests: [], flags: {} },
  battle: null,               // { enemies: [...], log: [], turn: 'player' } while fighting
  quests: { [questId]: { status, progress } },
  dialogue: null,             // { boxes: [{ speaker?, text }], index, then } while talking
}
```

---

## 6. Milestones

Each milestone should leave you with something runnable. Commit at the end of each one. Times are rough estimates for part-time work.

### M0: Project setup (½ day)
- [x] `npm create vite@latest lanternhold-rpg -- --template react`
- [x] Add Vitest (with Testing Library and jsdom), oxlint (the template's linter, used instead of ESLint), and Prettier
- [x] Download Kenney *Tiny Dungeon* and *Tiny Town* into `public/assets/`, keeping the license files
- [x] Create a GitHub repo, then push
- **Done when:** `npm run dev` shows a "Vash and the Last Flame" title screen with a Start button.

### M1: Tile map and movement (1–2 days)
- [x] `TileMap` renders the village map from a 2D array, with sprites drawn from the sheet (sprite choices live in `src/data/tilesets.js`)
- [x] `useKeyboard` hook, plus a `MOVE` action in the reducer
- [x] `movement.js`: `canMoveTo(map, x, y)` checks blocked tiles (unit-tested)
- [x] The player sprite faces the direction it's moving. The Kenney characters have only one pose, so facing left mirrors the sprite.
- Notes: neither Kenney pack has water, so water and fog are drawn with CSS. `parseMap` (planned for M2) was built early, because the map needs it to draw NPCs.
- **Done when:** you can walk around the village and you can't walk through walls.

### M2: Maps, warps, NPCs, and dialogue (2 days)
- [x] `parseMap` turns map letters into objects (done in M1)
- [x] Warp tiles move you between the village and Mosswood
- [x] NPC tiles and an `INTERACT` action show a `DialogueBox` (Space advances, and movement is locked while it's open). The opening scene and the lantern hints use it too.
- [x] Chests give an item once (tracked in `openedChests`). A full stack sells the extra, as ITEMS.md describes.
- [x] A HUD shows HP, Light, gold, and level
- **Done when:** you can talk to Old Wick, walk into the forest, and open a chest.

### M3: Turn-based combat (3 days, the core of the game)
- [ ] Enemies placed on the map; bumping into one starts a battle (`screen: 'battle'`)
- [ ] `combat.js`: `calcDamage`, `enemyTurn`, `isBattleOver` (unit-tested)
- [ ] `ActionMenu` (Attack, Skill, Item, Flee), a `CombatLog`, and animated HP bars
- [ ] Winning removes the enemy from the map. Losing goes to the game-over screen, then back to the village
- **Done when:** you can fight and beat a Mosswood slime, and you can lose to one.

### M4: XP and leveling (1 day)
- [ ] `leveling.js`: `gainXp(player, amount)` returns the new player state and any level-ups (unit-tested)
- [ ] A level-up banner showing the stat increases
- [ ] Skills unlocked by level or flags
- **Done when:** grinding slimes takes you to level 3 and your stats visibly go up.

### M5: Items, inventory, and shop (2 days)
- [ ] `InventoryPanel` (press **I**): use consumables and equip a weapon or armor
- [ ] Equipment bonuses feed into the damage formula
- [ ] Items can be used in battle
- [ ] `ShopPanel` for Bren: buy and sell
- [ ] Enemy loot tables
- **Done when:** you can buy an Iron Sword and see your damage go up in battle.

### M6: Quests (2 days)
- [ ] `quests.js` data plus `logic/quests.js` `updateQuests(state, event)`, which reacts to `ENEMY_DEFEATED`, `ITEM_GAINED`, and `FLAG_SET` (unit-tested)
- [ ] `QuestLog` panel (press **Q**)
- [ ] NPC dialogue changes based on quest status
- [ ] Both side quests working
- **Done when:** you can take Pest Control, kill 5 slimes, and turn it in for the reward.

### M7: Content, zones, and bosses (3–4 days)
- [ ] Build the Mosswood shrine, the Gloam Caves, and the Ashen Spire (2 floors)
- [ ] All 6 enemies and 2 mini-bosses, each with one special move (for example, Boar charges up: "The boar paws the ground…")
- [ ] Shrine relight event: refills Light, raises max Light, unlocks the next zone, and brightens the village lantern sprite
- [ ] Lightless King fight with 2 phases (at 50% HP he summons shades)
- [ ] Credits screen
- **Done when:** you can play the whole game from start to credits.

### M8: Save, balance, and polish (2 days)
- [ ] `save.js`: autosave whenever you change maps, plus a Continue button on the title screen
- [ ] Balance pass: play through twice and adjust the numbers in the data files only
- [ ] Screen transitions (fade), damage numbers, and a hit flash
- [ ] Accessibility: visible focus, keyboard-only play, a button to turn text speed off
- **Done when:** a friend can finish the game without help in under an hour.

### M9: Ship it (½ day)
- [ ] Deploy to Render as a static site (build command `npm run build`, publish dir `dist`)
- [ ] Final README: a GIF or screenshots, a controls table, the tech stack, what you learned, and asset credits
- [ ] Add a project card to ursalalindsey.com (danyll39/portfolio-site)
- **Done when:** the live link works and it appears on your portfolio.

**Total:** about 3–4 weeks of steady part-time work.

---

## 7. Controls (planned)

| Key | Action |
|---|---|
| Arrows / WASD | Move |
| Space / E | Talk, open, confirm |
| I | Inventory |
| Q | Quest log |
| Esc | Close panel / pause |

---

## 8. Credits and licenses
- Art: [Kenney.nl](https://kenney.nl) *Tiny Dungeon* and *Tiny Town* (CC0)
- Font: *Press Start 2P* (SIL Open Font License)
