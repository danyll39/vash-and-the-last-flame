import village from '../src/data/maps/village.js'
import { parseMap } from '../src/logic/parseMap.js'

describe('village layout', () => {
  it('is 20 × 15', () => {
    expect(village.layout).toHaveLength(15)
    for (const row of village.layout) expect(row).toHaveLength(20)
  })
})

describe('parseMap', () => {
  const map = parseMap(village)

  it('finds the player start and replaces it with floor', () => {
    expect(map.start).toEqual({ x: 10, y: 11 })
    expect(map.tiles[11][10]).toBe('.')
  })

  it('turns NPC letters into objects standing on floor', () => {
    expect(map.objects).toContainEqual({
      type: 'npc',
      npcId: 'wick',
      x: 7,
      y: 6,
    })
    expect(map.objects).toContainEqual({
      type: 'npc',
      npcId: 'bren',
      x: 14,
      y: 11,
    })
    expect(map.objects).toContainEqual({
      type: 'npc',
      npcId: 'tamsin',
      x: 12,
      y: 3,
    })
    expect(map.tiles[6][7]).toBe('.')
  })

  it('records the chest and lantern', () => {
    expect(map.objects).toContainEqual({ type: 'chest', x: 15, y: 4 })
    expect(map.objects).toContainEqual({ type: 'lantern', x: 10, y: 6 })
  })

  it('keeps terrain letters as they are', () => {
    expect(map.tiles[0][9]).toBe('2')
    expect(map.tiles[1][9]).toBe('f')
    expect(map.tiles[4][3]).toBe('~')
  })

  it('turns enemy letters into enemy objects', () => {
    const tiny = parseMap({ id: 't', layout: ['.s.', 'w.M'] })
    expect(tiny.objects).toEqual([
      { type: 'enemy', enemyId: 'mossSlime', x: 1, y: 0 },
      { type: 'enemy', enemyId: 'thornWolf', x: 0, y: 1 },
      { type: 'miniBoss', x: 2, y: 1 },
    ])
  })
})
