# Vash and the Last Flame: Items, Shop, and Gold

This file lists all 12 items with their effects and prices, where to find each one, what Bren sells at each point in the story, and a check that gold income matches prices. Enemy drops and gold rewards come from [ENEMIES.md](ENEMIES.md), and chest locations come from [MAPS.md](MAPS.md).

---

## 1. Item list

### Consumables (stack up to 9 of each)
| Item | Effect | Buy | Sell | Where to get it |
|---|---|---|---|---|
| **Herb** | +20 HP | 8 | 4 | Shop, village chest (×3), slimes and wolves |
| **Tonic** | +50 HP | 25 | 12 | Shop (after Shrine 1), Mosswood chest, Boar (×2), caves chest, *Lost Locket* (×3), beetles and knights |
| **Wick Oil** | +5 Light | 15 | 7 | Shop, Mosswood chest (×2), bats and shades |
| **Smoke Bomb** | Escape any battle for sure (not boss fights) | 20 | 10 | Shop |
| **Elixir** | Restores all HP and all Light | 120 | 60 | Shop (after Shrine 2) |

### Weapons (one slot, adds to ATK)
| Item | ATK | Buy | Sell | Where to get it |
|---|---|---|---|---|
| **Lamplighter's Staff** | +2 | — | 5 | Starting weapon |
| **Iron Sword** | +5 | 90 | 45 | Bren's shop, from the start |
| **Emberblade** | +9 | — | 150 | Dropped by the Pale Crawler |

### Armor (one slot, adds to DEF)
| Item | DEF | Buy | Sell | Where to get it |
|---|---|---|---|---|
| **Cloth Coat** | +1 | — | 5 | Starting armor |
| **Leather Vest** | +3 | — | 40 | *Pest Control* reward |
| **Spire Mail** | +6 | — | 120 | Spire Floor 1 chest |

### Key items (can't be sold or used up)
| Item | Purpose |
|---|---|
| **Tamsin's Locket** | Found in the Gloam Caves chest at (4, 7). Give it to Tamsin to finish *Lost Locket*. |

**Why the gear works this way:** you buy only one piece of gear, the Iron Sword. You earn every other upgrade by playing: a quest gives the Leather Vest, a boss drops the Emberblade, and exploring finds the Spire Mail. So the shop's job is to sell the one big early purchase and the healing items, and the best gear still feels earned.

---

## 2. Rules

- **Using items:** in battle, using an item takes your turn. Outside battle, you can use items from the inventory panel at any time.
- **Equipping:** do this only from the inventory panel, outside battle. The panel shows the stat change before you confirm, for example `ATK 11 → 14 (+3)`.
- **Selling:** you get half the buy price, rounded down. You can't sell equipped gear or key items.
- **Full stacks:** if you already have 9 of a consumable, a chest or drop gives you its value in gold instead. The message reads *"Your pack is full. Sold for 12 gold."* This way no item is lost and there's no item-discard screen to build.
- **Starting kit:** 30 gold, the Staff, the Cloth Coat, and no consumables. The village chest has 3 Herbs to get you started.
- **Losing a battle:** you lose half your gold, rounded down, and keep all your items.

---

## 3. Bren's shop

Bren's stock grows as you relight shrines, so a returning player always finds something new.

| Item | Price | Sold from |
|---|---|---|
| Herb | 8 | Start |
| Wick Oil | 15 | Start |
| Smoke Bomb | 20 | Start |
| Iron Sword | 90 | Start |
| Tonic | 25 | `shrine1Lit` |
| Elixir | 120 | `shrine2Lit` |

- **Pest Control reward:** once you finish the quest, everything costs **20% less**, rounded down. The shop shows *"Friend's price!"* next to each discounted price. Selling prices stay the same.
- **New stock line:** when stock unlocks, Bren says *"Fresh from the cave road: Tonics!"* the next time you talk to him.
- **Shop panel:** a **Buy** tab and a **Sell** tab. Each row shows the item name, effect, price, and how many you own. Your gold is shown at the top. Use the arrow keys to move, Enter to buy or sell, and Esc to close. If you can't afford an item, its price shows in red and buying it does nothing.

---

## 4. Gold check

This is the expected gold for the intended path (one clear of each zone), using the enemy gold and group sizes from ENEMIES.md:

| Zone | Enemies | Boss | Chest | Quest | Earned | Running total |
|---|---|---|---|---|---|---|
| Start | | | | | 30 | 30 |
| Mosswood | 39 | 40 | — | — | 79 | 109 |
| Gloam Caves | 90 | 80 | 60 | 50 (*Lost Locket*) | 280 | 389 |
| Ashen Spire | 162 | — | — | — | 162 | 551 |

And this is a typical spending plan:

| When | Purchase | Cost | Left over |
|---|---|---|---|
| End of Mosswood (after *Pest Control*) | Iron Sword at the friend's price | 72 | ~37, enough for a few Herbs |
| Gloam Caves | about 6 Tonics | ~120 | ~200 |
| Before the Lightless King | 2 Elixirs + 4 Tonics | ~272 | ~90 |

- **Result:** the must-have purchase, the Iron Sword before the caves, is affordable after one Mosswood clear, but only if the player does *Pest Control* first. That gives the side quest a real purpose. By the end, players have a small cushion of gold that covers one defeat without being left broke.
- **If playtesters end with lots of unspent gold,** raise the Elixir price before changing any enemy numbers. It's the one luxury item, so it's the easiest gold sink to adjust.
- **If they can't afford the Iron Sword,** raise slime gold from 3 to 4 instead of lowering the sword's price, because the sword should feel like a big buy.

---

## 5. Data format

```js
// src/data/items.js
export const ITEMS = {
  herb:      { name: 'Herb', type: 'consumable', effect: { hp: 20 }, price: 8,
               description: 'A bitter leaf. Restores 20 HP.' },
  elixir:    { name: 'Elixir', type: 'consumable', effect: { hp: 'full', light: 'full' },
               price: 120, description: 'Liquid sunrise. Restores everything.' },
  smokeBomb: { name: 'Smoke Bomb', type: 'consumable', effect: { flee: true }, price: 20,
               battleOnly: true, description: 'Escape any battle except a boss fight.' },
  ironSword: { name: 'Iron Sword', type: 'weapon', atk: 5, price: 90,
               description: 'Plain, heavy, dependable.' },
  emberblade:{ name: 'Emberblade', type: 'weapon', atk: 9, value: 300,
               description: 'Warm to the touch. It hums near shades.' },
  locket:    { name: "Tamsin's Locket", type: 'key',
               description: 'Engraved with a lantern. Tamsin will want this back.' },
  // ...
};
// Sell price = Math.floor((price ?? value) / 2). Key items have neither, so they can't be sold.

// src/data/shop.js
export const SHOP_STOCK = [
  { item: 'herb' }, { item: 'wickOil' }, { item: 'smokeBomb' }, { item: 'ironSword' },
  { item: 'tonic',  requires: 'shrine1Lit' },
  { item: 'elixir', requires: 'shrine2Lit' },
];
```

```js
// Chests can hold items, gold, or both. Example: the caves chest at (16, 2)
{ x: 16, y: 2, contents: { gold: 60, items: [{ item: 'tonic', qty: 1 }] } }
```

**Unit tests worth writing:** discounts round down. Items stack to 9, and an extra item turns into gold. Equipped gear can't be sold. Losing a battle halves your gold and keeps your items. Shop stock appears when its flag is set.

---

## 6. Every chest

| Map | Tile | Contents |
|---|---|---|
| Village | (15, 4) | 3 Herbs |
| Mosswood | (2, 5) | 2 Wick Oil |
| Mosswood | (16, 12) | 1 Tonic |
| Gloam Caves | (4, 7) | Tamsin's Locket |
| Gloam Caves | (16, 2) | 60 gold + 1 Tonic |
| Spire Floor 1 | (9, 5) | Spire Mail |
