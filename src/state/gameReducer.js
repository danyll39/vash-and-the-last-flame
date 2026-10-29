import { LANTERN_DIALOGUE, NPC_DIALOGUE, NPC_NAMES } from '../data/dialogue.js'
import { itemLabel } from '../data/items.js'
import { MAPS } from '../data/maps/index.js'
import { SCENES } from '../data/scenes.js'
import { startBattle, takeTurn } from '../logic/combat.js'
import { linesToBoxes, openDialogue, pickDialogue } from '../logic/dialogue.js'
import { addItem } from '../logic/inventory.js'
import { DIRECTIONS, canMoveTo, objectAt } from '../logic/movement.js'
import { createRng } from '../logic/random.js'
import { isObjectGone, objectKey } from '../logic/world.js'

export function createInitialState() {
  const start = MAPS.village.start
  return {
    screen: 'title', // 'title' | 'world' | 'battle' (later: 'credits')
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
      defeatedEnemies: [], // cleared on every warp, so enemies respawn
      defeatedBosses: [],
    },
    dialogue: null, // { boxes: [{ speaker?, text }], index, then } while talking
    battle: null, // see logic/combat.js startBattle()
  }
}

const goneChecker = (world, map) => (obj) => isObjectGone(world, map, obj)

function move(state, dir, seed) {
  const step = DIRECTIONS[dir]
  const { world } = state
  const map = MAPS[world.mapId]
  const x = world.x + step.dx
  const y = world.y + step.dy
  const isGone = goneChecker(world, map)

  if (!canMoveTo(map, x, y, isGone)) {
    // Bumping into an enemy starts a fight.
    const target = objectAt(map, x, y, isGone)
    const enemyId =
      target?.type === 'enemy'
        ? target.enemyId
        : target?.type === 'miniBoss'
          ? map.boss?.enemyId
          : null
    if (enemyId) {
      const source = { type: target.type, key: objectKey(map.id, x, y) }
      return {
        ...state,
        screen: 'battle',
        world: { ...world, facing: dir },
        battle: startBattle(enemyId, createRng(seed), source),
      }
    }
    // Otherwise just turn to face it.
    return { ...state, world: { ...world, facing: dir } }
  }

  // Stepping onto a warp tile moves you to the linked map. Regular
  // enemies respawn whenever you change maps.
  const warp = map.warps[map.tiles[y][x]]
  if (warp && MAPS[warp.to]) {
    return {
      ...state,
      world: {
        ...world,
        mapId: warp.to,
        x: warp.x,
        y: warp.y,
        facing: dir,
        defeatedEnemies: [],
      },
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
  const key = objectKey(map.id, chest.x, chest.y)
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
  const target = objectAt(
    map,
    world.x + step.dx,
    world.y + step.dy,
    goneChecker(world, map),
  )
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

  // Shrines come alive in M7. Enemies are fought by walking into them.
  return state
}

function endBattle(state) {
  const { battle, player, world } = state
  const back = { ...state, screen: 'world', battle: null }

  if (battle.phase === 'won') {
    const { xp, gold } = battle.rewards
    const defeated =
      battle.source?.type === 'miniBoss'
        ? {
            defeatedBosses: [
              ...world.defeatedBosses,
              battle.enemies[0].enemyId,
            ],
          }
        : battle.source
          ? { defeatedEnemies: [...world.defeatedEnemies, battle.source.key] }
          : {}
    return {
      ...back,
      // Leveling up from XP arrives in M4.
      player: { ...player, xp: player.xp + xp, gold: player.gold + gold },
      world: { ...world, ...defeated },
    }
  }

  if (battle.phase === 'lost') {
    // STORY.md: wake up in the village, fully healed, half your gold gone.
    const start = MAPS.village.start
    return {
      ...back,
      player: {
        ...player,
        hp: player.maxHp,
        light: player.maxLight,
        gold: Math.floor(player.gold / 2),
      },
      world: {
        ...world,
        mapId: 'village',
        x: start.x,
        y: start.y,
        facing: 'down',
        defeatedEnemies: [],
      },
      dialogue: openDialogue([
        {
          text: 'You wake up in the village. Wick is frowning. Half your gold is gone.',
        },
      ]),
    }
  }

  // Fled: back where you were, and the enemy is still there.
  return back
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
      return move(state, action.dir, action.seed)

    case 'INTERACT':
      if (state.screen !== 'world') return state
      return interact(state)

    case 'BATTLE_CHOICE': {
      if (state.screen !== 'battle' || !state.battle) return state
      const { battle, player } = takeTurn(
        state.battle,
        state.player,
        action.choice,
        createRng(action.seed),
        state.world.flags,
      )
      return { ...state, battle, player }
    }

    case 'END_BATTLE':
      if (state.screen !== 'battle' || state.battle?.phase === 'choose') {
        return state
      }
      return endBattle(state)

    default:
      return state
  }
}
