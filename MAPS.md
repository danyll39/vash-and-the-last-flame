# Lanternhold: World and Map Design

This file shows how the areas connect and gives a tile layout for each of the 5 maps. Every map is **20 tiles wide × 15 tiles tall**, so at 16 px × 3 scale the game screen is 960 × 720 px. Coordinates are written as `(x, y)`, counting from `(0, 0)` at the top-left.

The ASCII layouts are meant to be copied into `src/data/maps/*.js` as they are (see [section 4](#4-turning-a-layout-into-map-data)).

---

## 1. World layout

```
                       ┌──────────────┐
                       │ Gloam Caves  │  Zone 2 · Lv 4–6
                       └──────┬───────┘
                              │ north gate (fog clears after Shrine 1)
┌──────────────┐       ┌──────┴───────┐       ┌──────────────┐
│ Ashen Spire  ├───────┤  Lanternhold ├───────┤   Mosswood   │  Zone 1 · Lv 1–3
│   Floor 1    │ west  │   Village    │ east  │              │
└──────┬───────┘ gate  └──────────────┘ open  └──────────────┘
       │ stairs  (fog clears after Shrine 2)
┌──────┴───────┐
│ Ashen Spire  │  Zone 3 · Lv 7–10
│   Floor 2    │  Hollow King + Shrine 3
└──────────────┘
```

**Progression gates:** the village sits in the middle of everything. Shade fog blocks the north and west exits. Each time you relight a shrine, the village lantern grows brighter and burns away one wall of fog. Because of this, the game never needs keys or locked doors, and the player can see their next goal from the start.

| Order | Zone | Unlocked by | Flag that clears the fog | Recommended level |
|---|---|---|---|---|
| 1 | Mosswood | Open from the start | — | 1–3 |
| 2 | Gloam Caves | Relighting Shrine 1 | `shrine1Lit` | 4–6 |
| 3 | Ashen Spire | Relighting Shrine 2 | `shrine2Lit` | 7–10 |

---

## 2. Tile legend

| Char | Meaning | Walkable? |
|---|---|---|
| `#` | Wall, tree, or rock (sprite depends on the zone's tileset) | No |
| `.` | Floor, grass, or path | Yes |
| `~` | Water | No |
| `=` | Bridge | Yes |
| `H` | House / building | No |
| `f` | Shade fog (turns into `.` once its flag is set) | No, until cleared |
| `1` `2` `3` | Warp between zones (see the warp table) | Yes, and it warps you |
| `U` / `D` | Stairs up / down | Yes, and it warps you |
| `@` | Player start (new game only) | Yes |
| `C` | Chest | No, interact with it |
| `S` | Shrine (rest point once relit) | No, interact with it |
| `L` | Village lantern | No, interact with it |
| `W` `B` `T` | NPCs: Old Wick, Bren, Tamsin | No, talk to them |
| `s` `w` | Moss Slime, Thorn Wolf | No, bump into it to fight |
| `b` `r` | Cave Bat, Stone Beetle | No, bump into it to fight |
| `z` `k` | Shade, Ash Knight | No, bump into it to fight |
| `M` | Mini-boss guarding the shrine | No, bump into it to fight |
| `K` | The Hollow King | No, bump into it to fight |

**Enemy respawns:** regular enemies come back when you leave a map and return, so you can grind for XP. Mini-bosses and the Hollow King stay defeated for good, which is tracked in `world.defeatedBosses`.

---

## 3. Maps

### Village: Lanternhold (`village`)

```
#########22#########
#HHH.....ff.....HHH#
#HHH............HHH#
#...........T......#
#..~~~.........C...#
#..~~~...###.......#
3f.....W..L#.......1
3f.......###.......1
#..................#
#..HHH.......HHH...#
#..HHH.......HHH...#
#.........@...B....#
#..................#
#..................#
####################
```

- The **lantern** `L` (10, 6) sits on a stone plinth in the square. The plinth is open on its west side, so you interact with the lantern from (9, 6). Its sprite has 4 stages: flickering, then 1, 2, and 3 shrines lit. Interacting with it shows a hint about where to go next.
- **Old Wick** `W` (7, 6) stands beside the lantern and gives all 3 main quests.
- **Tamsin** `T` (12, 3) is near the north road and gives *Lost Locket* once the caves open.
- **Bren** `B` (14, 11) stands in front of the shop building, opens the shop, and gives *Pest Control*.
- **Chest** (15, 4): 3 Herbs, so new players start with some healing.
- **Fog:** the north fog (9–10, 1) clears with `shrine1Lit`, and the west fog (1, 6–7) clears with `shrine2Lit`.
- There are no enemies in the village, so it's always a safe place.

### Zone 1: Mosswood (`mosswood`)

```
####################
#.....#..~~...#..S.#
#..s..#..~~...#....#
#.....#..~~...##M###
#.....#..~~........#
#.C......~~...w....#
1........==........#
1...s....~~...s....#
#........~~........#
#..##....~~..w..##.#
#..##.s..~~.....##.#
#........~~..s.....#
#...s....~~.....C..#
#........~~........#
####################
```

- A river runs down the middle, and the **bridge** (9–10, 6) is the only way across. The west half is safe for a level 1 player, and the east half is harder.
- **6 Moss Slimes** `s`, which is enough for *Pest Control* (5 kills) in one trip, plus **2 Thorn Wolves** `w` on the east side.
- The **Thornback Boar** `M` (16, 3) blocks the only gap into the shrine clearing. **Shrine 1** `S` is at (17, 1).
- **Chests:** (2, 5) holds 2 Wick Oil, and (16, 12) holds a Tonic.

### Zone 2: Gloam Caves (`caves`)

```
####################
#S.#.....b#........#
#..M......#..b..C..#
####.####.#.####...#
#........r#....#...#
#.######..#.##.#.b.#
#.#....#.....#.#...#
#.#.C..#..b..#.###.#
#.#....######......#
#.##.###....r...####
#.......#.#####....#
######..#.....#.r..#
#....#..#####.#....#
#.b.......#....#...#
#########22#########
```

- This map is a winding maze. You enter at the bottom (9–10, 14), and the shrine is in the far top-left corner, so you have to explore to reach it.
- **5 Cave Bats** `b` and **3 Stone Beetles** `r`.
- **Tamsin's Locket** is in the chest at (4, 7), inside a side room you enter from below at (4, 9).
- The second **chest** (16, 2) holds 60 gold and a Tonic, as a reward for exploring.
- The **Pale Crawler** `M` (3, 2) guards **Shrine 2** `S` at (1, 1). Relighting it also unlocks the **Radiance** skill.

### Zone 3: Ashen Spire, Floor 1 (`spire1`)

```
####################
#####....U.....#####
###.....###......###
##..k..#####..z...##
##.....#####......##
#..z...##C##...k...#
#......##.##.......#
#.................z#
#..k....#...#......#
##......#...#.....##
##..z...........k.##
###......#.#.....###
#####....#.#...#####
#######.......######
#########33#########
```

- This floor is the round base of the tower. You enter at the bottom (9–10, 14), and the **stairs up** `U` are at the top (9, 1).
- **4 Shades** `z` and **4 Ash Knights** `k`. You can't sneak past all of them, so this floor tests whether your level is high enough.
- The **chest** (9, 5) is inside the central pillar, which opens at (9, 6). It holds the **Spire Mail**.
- **Sign:** a portrait of Corvin Ashe hangs on the wall at (10, 2), and you can read it from (10, 1) or (11, 2). It's a story clue (see [STORY.md](STORY.md)). Store it in this map's `signs: [{ x: 10, y: 2, scene: 'corvinPortrait' }]`.

### Zone 3: Ashen Spire, Floor 2 (`spire2`)

```
####################
##########S#########
##########K#########
######.........#####
#####...........####
####......z......###
####..#.......#..###
####.............###
#####...........####
######.........#####
#######.......######
########.....#######
#########...########
#########.D.########
####################
```

- This floor is the open throne room. You arrive by the **stairs down** `D` (10, 13).
- **1 Shade** `z` is in the middle of the room.
- **The Hollow King** `K` (10, 2) blocks the only way to **Shrine 3** `S` at (10, 1). Walking into him starts his 2-phase fight. Once you win, step onto his tile and relight the shrine to roll the credits.
- Before the fight there's a confirmation: *"The air grows cold. Continue?"* That gives the player one last chance to heal or turn back.

---

## 4. Turning a layout into map data

Each map file stores its layout as the same ASCII strings, along with the warps. When the game loads a map, a parser converts every entity letter into a floor tile and adds an object for that letter. This keeps the ASCII layout as the only source of truth.

```js
// src/data/maps/mosswood.js
export default {
  id: 'mosswood',
  name: 'Mosswood',
  tileset: 'forest',
  layout: [
    '####################',
    '#.....#..~~...#..S.#',
    // ...the rest of the rows
  ],
  warps: {
    '1': { to: 'village', x: 18, y: 6 },
  },
  boss: { char: 'M', enemyId: 'thornbackBoar', bossId: 'boss1' },
};
```

```js
// src/logic/parseMap.js (unit-test this one)
const ENEMY_CHARS = { s: 'mossSlime', w: 'thornWolf', b: 'caveBat',
                      r: 'stoneBeetle', z: 'shade', k: 'ashKnight' };

export function parseMap(map) {
  const tiles = [];
  const objects = [];
  map.layout.forEach((row, y) => {
    tiles.push([...row].map((ch, x) => {
      if (ENEMY_CHARS[ch]) {
        objects.push({ type: 'enemy', enemyId: ENEMY_CHARS[ch], x, y });
        return '.';
      }
      // ...same idea for C, S, L, W, B, T, M, K, @
      return ch;
    }));
  });
  return { tiles, objects };
}
```

**Tests worth writing:** every row is 20 characters, every map has 15 rows, every warp character has an entry in `warps`, and every walkable tile can be reached from the map's entrance.

---

## 5. Warp table

| From | Tile(s) | To | Arrive at | Needs |
|---|---|---|---|---|
| Village | `1` (19, 6–7) | Mosswood | (1, 6) | — |
| Mosswood | `1` (0, 6–7) | Village | (18, 6) | — |
| Village | `2` (9–10, 0) | Gloam Caves | (9, 13) | `shrine1Lit` |
| Gloam Caves | `2` (9–10, 14) | Village | (9, 2) | — |
| Village | `3` (0, 6–7) | Spire Floor 1 | (9, 13) | `shrine2Lit` |
| Spire Floor 1 | `3` (9–10, 14) | Village | (2, 6) | — |
| Spire Floor 1 | `U` (9, 1) | Spire Floor 2 | (10, 12) | — |
| Spire Floor 2 | `D` (10, 13) | Spire Floor 1 | (10, 1) | — |

The village warps don't need to check their flags. While a flag is unset, the fog in front of the warp stops the player from reaching it.

---

## 6. Map checklist by milestone

- **M1:** build only the village layout, with movement and wall collision.
- **M2:** add `parseMap`, the warps, NPCs, chests, and Mosswood.
- **M3:** add enemies to Mosswood.
- **M7:** add the Gloam Caves, both Spire floors, the bosses, the fog flags, and the lantern stages.
