import { MAPS } from '../src/data/maps/index.js'
import { canMoveTo, isWalkableTile } from '../src/logic/movement.js'

const village = MAPS.village

describe('isWalkableTile', () => {
  it('allows floor, bridges, warps and stairs', () => {
    for (const ch of ['.', '=', '1', '2', '3', 'U', 'D']) {
      expect(isWalkableTile(ch)).toBe(true)
    }
  })

  it('blocks walls, water, houses and fog', () => {
    for (const ch of ['#', '~', 'H', 'f']) {
      expect(isWalkableTile(ch)).toBe(false)
    }
  })
})

describe('canMoveTo (village)', () => {
  it('allows open grass', () => {
    expect(canMoveTo(village, 10, 10)).toBe(true)
  })

  it('blocks the tree border and anything off the map', () => {
    expect(canMoveTo(village, 0, 5)).toBe(false)
    expect(canMoveTo(village, -1, 5)).toBe(false)
    expect(canMoveTo(village, 20, 5)).toBe(false)
    expect(canMoveTo(village, 5, 15)).toBe(false)
  })

  it('blocks water, houses and fog', () => {
    expect(canMoveTo(village, 3, 4)).toBe(false) // pond
    expect(canMoveTo(village, 2, 1)).toBe(false) // house
    expect(canMoveTo(village, 9, 1)).toBe(false) // north fog
  })

  it('blocks NPCs, chests and the lantern', () => {
    expect(canMoveTo(village, 7, 6)).toBe(false) // Old Wick
    expect(canMoveTo(village, 15, 4)).toBe(false) // chest
    expect(canMoveTo(village, 10, 6)).toBe(false) // lantern
  })

  it('allows the east exit warp', () => {
    expect(canMoveTo(village, 19, 6)).toBe(true)
  })
})
