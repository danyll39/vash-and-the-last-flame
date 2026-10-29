// Turns a map's ASCII layout into terrain tiles plus a list of objects.
// Entity letters (NPCs, chests, enemies...) become floor tiles, and an
// object is recorded for each one, so the layout stays the only source of truth.

const ENEMY_CHARS = {
  s: 'mossSlime',
  w: 'thornWolf',
  b: 'caveBat',
  r: 'stoneBeetle',
  z: 'shade',
  k: 'ashKnight',
}

const NPC_CHARS = { W: 'wick', B: 'bren', T: 'tamsin' }

const OBJECT_CHARS = {
  C: 'chest',
  S: 'shrine',
  L: 'lantern',
  M: 'miniBoss',
  K: 'finalBoss',
}

export function parseMap(map) {
  const objects = []
  let start = null

  const tiles = map.layout.map((row, y) =>
    [...row].map((ch, x) => {
      if (ENEMY_CHARS[ch]) {
        objects.push({ type: 'enemy', enemyId: ENEMY_CHARS[ch], x, y })
        return '.'
      }
      if (NPC_CHARS[ch]) {
        objects.push({ type: 'npc', npcId: NPC_CHARS[ch], x, y })
        return '.'
      }
      if (OBJECT_CHARS[ch]) {
        objects.push({ type: OBJECT_CHARS[ch], x, y })
        return '.'
      }
      if (ch === '@') {
        start = { x, y }
        return '.'
      }
      return ch
    }),
  )

  return {
    id: map.id,
    name: map.name,
    tileset: map.tileset,
    width: tiles[0].length,
    height: tiles.length,
    tiles,
    objects,
    start,
    warps: map.warps ?? {},
    chests: map.chests ?? {},
    boss: map.boss ?? null,
  }
}
