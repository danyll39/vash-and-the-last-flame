// Kenney sprite sheets: 16×16 tiles packed 12 columns × 11 rows.
export const SHEETS = {
  town: '/assets/tiny-town/tilemap_packed.png',
  dungeon: '/assets/tiny-dungeon/tilemap_packed.png',
}
export const SHEET_COLS = 12
export const SHEET_ROWS = 11

// [sheet, tile index]. Index = row * 12 + column on the packed sheet.
export const SPRITES = {
  grass: ['town', 0],
  grassTuft: ['town', 1],
  grassFlowers: ['town', 2],
  dirt: ['town', 25],
  tree: ['town', 28],
  stone: ['dungeon', 40],
  roofLeft: ['town', 52],
  roofMid: ['town', 53],
  roofRight: ['town', 54],
  wallWindow: ['town', 84],
  wallDoor: ['town', 85],
  lantern: ['town', 93],
  chest: ['dungeon', 89],
  wick: ['dungeon', 84],
  bren: ['dungeon', 86],
  tamsin: ['dungeon', 99],
  vash: ['dungeon', 112],
}

const NPC_SPRITES = { wick: 'wick', bren: 'bren', tamsin: 'tamsin' }

export function objectSprite(obj) {
  if (obj.type === 'npc') return NPC_SPRITES[obj.npcId]
  if (obj.type === 'chest') return 'chest'
  if (obj.type === 'lantern') return 'lantern'
  return null
}

// A few grass tiles get tufts or flowers. Seeded by position, so the
// pattern is the same every time the map is drawn.
function grassAt(x, y) {
  const n = (x * 7 + y * 13) % 23
  if (n === 0) return 'grassFlowers'
  if (n === 5 || n === 17) return 'grassTuft'
  return 'grass'
}

// Houses are 3 wide × 2 tall blocks of 'H': roof on top, wall below
// with a door in the middle.
function houseAt(tiles, x, y) {
  const isHouse = (cx, cy) => tiles[cy]?.[cx] === 'H'
  const top = !isHouse(x, y - 1)
  const left = !isHouse(x - 1, y)
  const right = !isHouse(x + 1, y)
  if (top) return left ? 'roofLeft' : right ? 'roofRight' : 'roofMid'
  return left || right ? 'wallWindow' : 'wallDoor'
}

// Returns the layers for one cell, bottom first. Strings are sprite
// names; { css } entries are drawn with CSS instead (water, fog).
export function tileLayers(map, x, y) {
  const ch = map.tiles[y][x]
  const ground = grassAt(x, y)
  const onEdge =
    x === 0 || y === 0 || x === map.width - 1 || y === map.height - 1

  switch (ch) {
    case '#':
      // Trees around the edge; low stone walls inside (like the lantern plinth).
      return onEdge ? [ground, 'tree'] : [ground, 'stone']
    case 'H':
      return [ground, houseAt(map.tiles, x, y)]
    case '~':
      return [{ css: 'water' }]
    case 'f':
      return [ground, { css: 'fog' }]
    case '1':
    case '2':
    case '3':
      return ['dirt']
    default:
      return [ground]
  }
}
