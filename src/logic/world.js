// Keys and checks shared by the reducer and the map components.

// "mosswood:4,7". Used for opened chests and defeated enemies.
export function objectKey(mapId, x, y) {
  return `${mapId}:${x},${y}`
}

// Regular enemies stay gone until you leave the map (they respawn on a
// warp). Mini-bosses stay gone for good.
export function isObjectGone(world, map, obj) {
  if (obj.type === 'enemy') {
    return world.defeatedEnemies.includes(objectKey(map.id, obj.x, obj.y))
  }
  if (obj.type === 'miniBoss') {
    return world.defeatedBosses.includes(map.boss?.enemyId)
  }
  return false
}
