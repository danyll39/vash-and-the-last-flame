import { itemLabel, sellPrice } from '../src/data/items.js'
import { addItem } from '../src/logic/inventory.js'

const player = (inventory = {}, gold = 0) => ({ inventory, gold })

describe('addItem', () => {
  it('adds to an empty pack', () => {
    const { player: next, kept, overflow } = addItem(player(), 'herb', 3)
    expect(next.inventory).toEqual({ herb: 3 })
    expect(kept).toBe(3)
    expect(overflow).toBe(0)
  })

  it('stacks up to 9 and sells the rest for half price', () => {
    const result = addItem(player({ tonic: 8 }, 10), 'tonic', 3)
    expect(result.player.inventory.tonic).toBe(9)
    expect(result.overflow).toBe(2)
    expect(result.gold).toBe(24) // 2 × floor(25 / 2)
    expect(result.player.gold).toBe(34)
  })

  it('a full stack keeps nothing and sells everything', () => {
    const result = addItem(player({ herb: 9 }), 'herb', 1)
    expect(result.player.inventory.herb).toBe(9)
    expect(result.player.gold).toBe(4)
  })
})

describe('items data', () => {
  it('sell price is half the buy price or value, rounded down', () => {
    expect(sellPrice('herb')).toBe(4)
    expect(sellPrice('wickOil')).toBe(7)
    expect(sellPrice('emberblade')).toBe(150)
  })

  it('key items cannot be sold', () => {
    expect(sellPrice('locket')).toBeNull()
  })

  it('labels show a count only for more than one', () => {
    expect(itemLabel('tonic')).toBe('Tonic')
    expect(itemLabel('wickOil', 2)).toBe('Wick Oil ×2')
  })
})
