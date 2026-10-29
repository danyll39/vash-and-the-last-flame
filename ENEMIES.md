# Lanternhold: Enemies and Bosses

This file covers every enemy in the game: stats, special moves, rewards, and boss phases. The numbers are tuned against the player stat curve below and checked with a battle simulation ([tools/balance_sim.py](tools/balance_sim.py)). Section 6 has the results.

The map letters match [MAPS.md](MAPS.md).

---

## 1. Player stat curve (what enemies are balanced against)

| | Level 1 | Per level | Level 4 | Level 7 | Level 10 |
|---|---|---|---|---|---|
| HP | 30 | +8 | 54 | 78 | 102 |
| ATK | 5 | +2 | 11 | 17 | 23 |
| DEF | 2 | +1 | 5 | 8 | 11 |
| Light | 5 | +1, plus +2 per shrine lit | 8 | 13 | 18 |

- **XP to reach level N:** `10 × N × (N − 1)`, so 20 for Lv 2, 120 for Lv 4, 420 for Lv 7, and 900 for Lv 10. This follows from the README's rule of `level × 20` XP per level.
- **Expected gear:** in Mosswood, the Staff (+2 ATK) and Cloth Coat (+1 DEF). In the caves, the Iron Sword (+5) and Leather Vest (+3). In the Spire, the Emberblade (+9) and Spire Mail (+6).
- **Damage:** `max(1, ATK + weapon − (DEF + armor) + random(−2..2))`, which uses the same formula for both sides.
- **Skills:** Flare deals 1.5× damage. Mend heals 30% of max HP. Radiance deals normal Attack damage to every enemy.

---

## 2. Regular enemies

| Map | Enemy | HP | ATK | DEF | XP | Gold | Group size | Drop |
|---|---|---|---|---|---|---|---|---|
| `s` | **Moss Slime** | 12 | 6 | 1 | 6 | 3 | 1–2 | Herb 30% |
| `w` | **Thorn Wolf** | 20 | 8 | 2 | 12 | 6 | 1 | Herb 25% |
| `b` | **Cave Bat** | 22 | 14 | 3 | 15 | 6 | 2 | Wick Oil 25% |
| `r` | **Stone Beetle** | 40 | 13 | 10 | 22 | 10 | 1 | Tonic 15% |
| `z` | **Shade** | 40 | 20 | 6 | 30 | 12 | 1–2 | Wick Oil 30% |
| `k` | **Ash Knight** | 65 | 22 | 14 | 40 | 18 | 1 | Tonic 25% |

**Group size:** each enemy you see on the map is one encounter. When you bump into it, the battle spawns that many copies, picked at random within the range. *Pest Control* counts each kill, so a pair of slimes counts as 2.

### Special moves

| Enemy | Move | Rule |
|---|---|---|
| Moss Slime | **Absorb** | 20% chance each turn to heal 3 HP instead of attacking. *"The slime soaks up the moss."* |
| Thorn Wolf | **Pounce** | 25% chance its attack deals 1.5× damage. |
| Cave Bat | **Leech Light** | 30% chance its attack also drains 2 of your Light. Using up your skills early is risky here. |
| Stone Beetle | **Harden** | On turns 1, 5, 9 and so on, it skips its attack and gains +5 DEF for 2 turns. Hit it hardest between Hardens, or use Flare. |
| Shade | **Fade** | Your plain Attack does half damage against it, but skills do full damage. This teaches the player that Light matters. |
| Ash Knight | **Heavy Swing** | A 3-turn cycle: it attacks, then *"raises its blade…"* (no attack), then hits for 1.5×. The warning turn gives you time to heal. |

---

## 3. Mini-bosses

### Thornback Boar (Mosswood, `M`)
| HP | ATK | DEF | XP | Gold | Reward |
|---|---|---|---|---|---|
| 70 | 10 | 4 | 60 | 40 | 2 Tonics, then relight **Shrine 1** |

- **Charge (3-turn cycle):** it attacks, then *"The boar paws the ground…"* (no attack), then **charges for 2× damage**. This is the first telegraphed attack in the game, and it teaches the player to heal on the warning turn.
- **Target level:** 3. At level 2 it wins about 4 in 10 fights. At level 3 it almost always loses.

### The Pale Crawler (Gloam Caves, `M`)
| HP | ATK | DEF | XP | Gold | Reward |
|---|---|---|---|---|---|
| 190 | 20 | 8 | 150 | 80 | **Emberblade** (+9 ATK), then relight **Shrine 2**, which unlocks Radiance |

- **Web:** every 4th turn, it skips its attack and **you lose your next turn**. *"Sticky threads bind your arms!"*
- **Target level:** 6. This fight is a soft wall. At level 5 you win about 40% of the time, and at level 6 you win nearly every time. A player who skips the rest of the caves gets sent back to grind.

---

## 4. Final boss: The Hollow King (Ashen Spire Floor 2, `K`)

| HP | ATK | DEF | XP | Gold |
|---|---|---|---|---|
| 200 | 22, then 25 in phase 2 | 12 | — | — |

**Phase 1 (200 → 100 HP): "The King of Nothing"**
- **Snuff:** on turns 1, 5, 9 and so on, he drains 3 of your Light *as well as* attacking. *"The flames around you gutter and die."*
- Otherwise he attacks normally.

**Phase 2 (100 HP or less): "Hunger"**
- **Transition:** he spends one turn summoning **2 Shades**. This happens only once. *"Darkness pours from his crown."* This is where Radiance pays off.
- His ATK rises to **25**.
- **Eclipse:** every 3rd turn, an attack deals **2× damage**. Use the turn before it to heal.
- He keeps using Snuff.

**Target level:** 9–10. You can't flee this fight. Losing sends you back to the village like any other defeat, and the *"The air grows cold. Continue?"* prompt before the fight gives the player a chance to heal first.

**Win:** *"The crown cracks. Light floods the spire."* Then you relight Shrine 3 and the credits roll.

---

## 5. Data format

Each enemy is one object in `src/data/enemies.js`. The special moves use a few reusable patterns, so `combat.js` only has to handle 4 cases: `chance`, `cycle`, `every`, and `passive`.

```js
export const ENEMIES = {
  mossSlime: {
    name: 'Moss Slime', hp: 12, atk: 6, def: 1, xp: 6, gold: 3,
    group: [1, 2],
    drops: [{ item: 'herb', chance: 0.3 }],
    special: { type: 'chance', chance: 0.2, effect: 'heal', amount: 3,
               text: 'The slime soaks up the moss.' },
  },
  thornbackBoar: {
    name: 'Thornback Boar', hp: 70, atk: 10, def: 4, xp: 60, gold: 40,
    boss: true,
    drops: [{ item: 'tonic', qty: 2, chance: 1 }],
    special: { type: 'cycle', length: 3, warnTurn: 2, hitTurn: 3, multiplier: 2,
               warnText: 'The boar paws the ground…' },
  },
  shade: {
    name: 'Shade', hp: 40, atk: 20, def: 6, xp: 30, gold: 12,
    group: [1, 2],
    drops: [{ item: 'wickOil', chance: 0.3 }],
    special: { type: 'passive', effect: 'halfPhysical' },
  },
  // ...
};
```

The Hollow King gets a `phases` array (`[{ untilHpPct: 50, ... }, { ... }]`) and a little custom code in `combat.js`. Don't try to make him fit the generic special-move system.

**Unit tests to write:** cycle timing, where turn 2 warns and turn 3 hits for 2×. Fade halving only plain Attacks. Web skipping exactly one player turn. The King's summon happening once, at the 50% mark.

---

## 6. Balance check

The simulation plays the whole game 300 times for each strategy. Its simple player attacks, uses Flare on bosses and Shades, uses Mend under 40% HP, uses items under 30% HP, and uses Radiance against groups. It rests to full before each zone and before each boss.

| Strategy | Finishes the game | Typical level at Boar / Crawler / King |
|---|---|---|
| Clear each zone once (the intended path) | **93%** (most losses are to the Crawler) | 3 / 6 / 10 |
| One extra Mosswood clear | 100% | 4 / 7 / 10 |
| One extra caves clear | 99% | 3 / 8 / 10 |

- Regular fights take 2–4 turns. Boss fights take about 7–15 turns (Boar), 15–25 (Crawler), and 13–16 (King).
- On the intended path, the player's HP usually drops to about 40–50% during a zone, so it feels risky without being punishing.
- When you change any number in this file, update the same number in `balance_sim.py` and rerun it (`python3 tools/balance_sim.py`). Alternatively, port it to a Vitest test once `combat.js` exists, so the game's real code is what gets checked.
