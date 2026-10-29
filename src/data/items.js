// All 12 items. Numbers come from ITEMS.md.
export const ITEMS = {
  herb: {
    name: 'Herb',
    type: 'consumable',
    effect: { hp: 20 },
    price: 8,
    description: 'A bitter leaf. Restores 20 HP.',
  },
  tonic: {
    name: 'Tonic',
    type: 'consumable',
    effect: { hp: 50 },
    price: 25,
    description: 'Tastes like pine needles. Restores 50 HP.',
  },
  wickOil: {
    name: 'Wick Oil',
    type: 'consumable',
    effect: { light: 5 },
    price: 15,
    description: 'Thick and golden. Restores 5 Light.',
  },
  smokeBomb: {
    name: 'Smoke Bomb',
    type: 'consumable',
    effect: { flee: true },
    price: 20,
    battleOnly: true,
    description: 'Escape any battle except a boss fight.',
  },
  elixir: {
    name: 'Elixir',
    type: 'consumable',
    effect: { hp: 'full', light: 'full' },
    price: 120,
    description: 'Liquid sunrise. Restores everything.',
  },
  staff: {
    name: "Lamplighter's Staff",
    type: 'weapon',
    atk: 2,
    value: 10,
    description: 'Older than the village. Warm, as if someone just held it.',
  },
  ironSword: {
    name: 'Iron Sword',
    type: 'weapon',
    atk: 5,
    price: 90,
    description: 'Plain, heavy, dependable.',
  },
  emberblade: {
    name: 'Emberblade',
    type: 'weapon',
    atk: 9,
    value: 300,
    description: 'Warm to the touch. It hums near shades.',
  },
  clothCoat: {
    name: 'Cloth Coat',
    type: 'armor',
    def: 1,
    value: 10,
    description: 'Patched at both elbows.',
  },
  leatherVest: {
    name: 'Leather Vest',
    type: 'armor',
    def: 3,
    value: 80,
    description: 'Smells faintly of slime. A gift from Bren.',
  },
  spireMail: {
    name: 'Spire Mail',
    type: 'armor',
    def: 6,
    value: 240,
    description: 'Ash-grey links, cold even in sunlight.',
  },
  locket: {
    name: "Tamsin's Locket",
    type: 'key',
    description: 'Engraved with a lantern. Tamsin will want this back.',
  },
}

export const STACK_LIMIT = 9

// Half the buy price (or value), rounded down. Key items can't be sold.
export function sellPrice(itemId) {
  const item = ITEMS[itemId]
  const base = item.price ?? item.value
  return base ? Math.floor(base / 2) : null
}

// "Herb" for one, "Herb ×3" for more.
export function itemLabel(itemId, qty = 1) {
  const { name } = ITEMS[itemId]
  return qty > 1 ? `${name} ×${qty}` : name
}
