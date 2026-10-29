import { STACK_LIMIT, sellPrice } from '../data/items.js'

// Adds items to the pack. Anything past the stack limit is sold on the
// spot (ITEMS.md: "Your pack is full. Sold for N gold."), so nothing is lost.
export function addItem(player, itemId, qty = 1) {
  const have = player.inventory[itemId] ?? 0
  const kept = Math.max(0, Math.min(qty, STACK_LIMIT - have))
  const overflow = qty - kept
  const gold = overflow * (sellPrice(itemId) ?? 0)

  return {
    player: {
      ...player,
      gold: player.gold + gold,
      inventory: kept
        ? { ...player.inventory, [itemId]: have + kept }
        : player.inventory,
    },
    kept,
    overflow,
    gold,
  }
}
