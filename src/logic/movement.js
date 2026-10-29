export const DIRECTIONS = {
  up: { dx: 0, dy: -1 },
  down: { dx: 0, dy: 1 },
  left: { dx: -1, dy: 0 },
  right: { dx: 1, dy: 0 },
}

// Floor, bridge, warps and stairs. Everything else (walls, water,
// houses, fog) blocks movement.
const WALKABLE = new Set(['.', '=', '1', '2', '3', 'U', 'D'])

export function isWalkableTile(ch) {
  return WALKABLE.has(ch)
}

export function objectAt(map, x, y) {
  return map.objects.find((obj) => obj.x === x && obj.y === y) ?? null
}

export function canMoveTo(map, x, y) {
  if (x < 0 || y < 0 || x >= map.width || y >= map.height) return false
  if (!isWalkableTile(map.tiles[y][x])) return false
  // NPCs, chests, the lantern and enemies all stand in the way.
  return objectAt(map, x, y) === null
}
