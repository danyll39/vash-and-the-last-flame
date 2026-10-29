import { LANTERN_DIALOGUE, NPC_DIALOGUE, NPC_NAMES } from '../data/dialogue.js'
import { itemLabel } from '../data/items.js'
import { MAPS } from '../data/maps/index.js'
import { SCENES } from '../data/scenes.js'
import { linesToBoxes, openDialogue, pickDialogue } from '../logic/dialogue.js'
import { addItem } from '../logic/inventory.js'
import { DIRECTIONS, canMoveTo, objectAt } from '../logic/movement.js'

export function createInitialState() {
  const start = MAPS.village.start
  return {
    screen: 'title', // 'title' | 'world' (later: 'battle' | 'gameover' | 'credits')
    // Level 1 stats from ENEMIES.md, section 1. Starting kit from ITEMS.md.
    player: {
      name: 'Vash',
      level: 1,
      xp: 0,
      hp: 30,
      maxHp: 30,
      light: 5,
      maxLight: 5,
      atk: 5,
      def: 2,
      gold: 30,
      weapon: 'staff',
      armor: 'clothCoat',
      inventory: {},
    },
    world: {
      mapId: 'village',
      x: start.x,
      y: start.y,
      facing: 'down',
      flags: {},
      openedChests: [],
    },
    dialogue: null, // { boxes: [{ speaker?, text }], index, then } while talking
  }
}

export function chestKey(mapId, x, y) {
  return `${mapId}:${x},${y}`
}

function move(state, dir) {
  const step = DIRECTIONS[dir]
  const { world } = state
  const map = MAPS[world.mapId]
  const x = world.x + step.dx
  const y = world.y + step.dy

  // Turn to face the direction even when the move is blocked.
  if (!canMoveTo(map, x, y)) {
    return { ...state, world: { ...world, facing: dir } }
  }

  // Stepping onto a warp tile moves you to the linked map.
  const warp = map.warps[map.tiles[y][x]]
  if (warp && MAPS[warp.to]) {
    return {
      ...state,
      world: { ...world, mapId: warp.to, x: warp.x, y: warp.y, facing: dir },
    }
  }

  return { ...state, world: { ...world, x, y, facing: dir } }
}

function advanceDialogue(state) {
  const { dialogue } = state
  if (dialogue.index + 1 < dialogue.boxes.length) {
    return { ...state, dialogue: { ...dialogue, index: dialogue.index + 1 } }
  }

  // Last box: close it and run its `then`.
  let next = { ...state, dialogue: null }
  if (dialogue.then?.setFlag) {
    next = {
      ...next,
      world: {
        ...next.world,
        flags: { ...next.world.flags, [dialogue.then.setFlag]: true },
      },
    }
  }
  return next
}

function openChest(state, map, chest) {
  const key = chestKey(map.id, chest.x, chest.y)
  if (state.world.openedChests.includes(key)) {
    return {
      ...state,
      dialogue: openDialogue([{ text: 'Empty. You already got this one.' }]),
    }
  }

  const contents = map.chests[`${chest.x},${chest.y}`] ?? {}
  let player = state.player
  const boxes = []

  for (const { item, qty } of contents.items ?? []) {
    const result = addItem(player, item, qty)
    player = result.player
    boxes.push({ text: `You found ${itemLabel(item, qty)}!` })
    if (result.overflow) {
      boxes.push({ text: `Your pack is full. Sold for ${result.gold} gold.` })
    }
  }
  if (contents.gold) {
    player = { ...player, gold: player.gold + contents.gold }
    boxes.push({ text: `You found ${contents.gold} gold!` })
  }

  return {
    ...state,
    player,
    world: { ...state.world, openedChests: [...state.world.openedChests, key] },
    dialogue: openDialogue(boxes.length ? boxes : [{ text: 'Empty.' }]),
  }
}

function interact(state) {
  if (state.dialogue) return advanceDialogue(state)

  const { world } = state
  const map = MAPS[world.mapId]
  const step = DIRECTIONS[world.facing]
  const target = objectAt(map, world.x + step.dx, world.y + step.dy)
  if (!target) return state

  if (target.type === 'npc') {
    const entry = pickDialogue(NPC_DIALOGUE[target.npcId], state)
    if (!entry) return state
    const boxes = linesToBoxes(entry.lines, NPC_NAMES[target.npcId])
    return { ...state, dialogue: openDialogue(boxes) }
  }

  if (target.type === 'chest') return openChest(state, map, target)

  if (target.type === 'lantern') {
    const entry = pickDialogue(LANTERN_DIALOGUE, state)
    return { ...state, dialogue: openDialogue(linesToBoxes(entry.lines)) }
  }

  // Enemies, shrines and bosses come alive in M3 and M7.
  return state
}

export function gameReducer(state, action) {
  switch (action.type) {
    case 'START_GAME': {
      const fresh = createInitialState()
      return {
        ...fresh,
        screen: 'world',
        dialogue: openDialogue(SCENES.opening, { setFlag: 'introDone' }),
      }
    }

    case 'RETURN_TO_TITLE':
      return { ...state, screen: 'title' }

    case 'MOVE':
      // Movement is locked while a dialogue box is open.
      if (state.screen !== 'world' || state.dialogue) return state
      if (!DIRECTIONS[action.dir]) return state
      return move(state, action.dir)

    case 'INTERACT':
      if (state.screen !== 'world') return state
      return interact(state)

    default:
      return state
  }
}
