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

const nothingGone = () => false

// `isGone(obj)` lets the caller skip objects that have been removed,
// such as defeated enemies.
export function objectAt(map, x, y, isGone = nothingGone) {
  return (
    map.objects.find((obj) => obj.x === x && obj.y === y && !isGone(obj)) ??
    null
  )
}

export function canMoveTo(map, x, y, isGone = nothingGone) {
  if (x < 0 || y < 0 || x >= map.width || y >= map.height) return false
  if (!isWalkableTile(map.tiles[y][x])) return false
  // NPCs, chests, the lantern and enemies all stand in the way.
  return objectAt(map, x, y, isGone) === null
}
