// Layout copied from MAPS.md. See the tile legend there.
export default {
  id: 'village',
  name: 'Candlebrook',
  tileset: 'town',
  layout: [
    '#########22#########',
    '#HHH.....ff.....HHH#',
    '#HHH............HHH#',
    '#...........T......#',
    '#..~~~.........C...#',
    '#..~~~...###.......#',
    '3f.....W..L#.......1',
    '3f.......###.......1',
    '#..................#',
    '#..HHH.......HHH...#',
    '#..HHH.......HHH...#',
    '#.........@...B....#',
    '#..................#',
    '#..................#',
    '####################',
  ],
  // The caves and the Spire don't exist until M7, and fog blocks those
  // exits anyway. A warp to a map that isn't built yet does nothing.
  warps: {
    1: { to: 'mosswood', x: 1, y: 6 },
    2: { to: 'caves', x: 9, y: 13 },
    3: { to: 'spire1', x: 9, y: 13 },
  },
  // Keyed by "x,y". Contents come from ITEMS.md.
  chests: {
    '15,4': { items: [{ item: 'herb', qty: 3 }] },
  },
}
