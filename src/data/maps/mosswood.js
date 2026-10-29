// Layout copied from MAPS.md. See the tile legend there.
export default {
  id: 'mosswood',
  name: 'Mosswood',
  tileset: 'forest',
  layout: [
    '####################',
    '#.....#..~~...#..S.#',
    '#..s..#..~~...#....#',
    '#.....#..~~...##M###',
    '#.....#..~~........#',
    '#.C......~~...w....#',
    '1........==........#',
    '1...s....~~...s....#',
    '#........~~........#',
    '#..##....~~..w..##.#',
    '#..##.s..~~.....##.#',
    '#........~~..s.....#',
    '#...s....~~.....C..#',
    '#........~~........#',
    '####################',
  ],
  warps: {
    1: { to: 'village', x: 18, y: 6 },
  },
  // Keyed by "x,y". Contents come from ITEMS.md.
  chests: {
    '2,5': { items: [{ item: 'wickOil', qty: 2 }] },
    '16,12': { items: [{ item: 'tonic', qty: 1 }] },
  },
}
