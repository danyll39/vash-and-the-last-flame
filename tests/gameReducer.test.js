import { SCENES } from '../src/data/scenes.js'
import { objectKey } from '../src/logic/world.js'
import { createInitialState, gameReducer } from '../src/state/gameReducer.js'

// In the world with the opening scene already dismissed.
function inWorld(x, y, extra = {}) {
  const state = gameReducer(createInitialState(), { type: 'START_GAME' })
  return {
    ...state,
    dialogue: null,
    world: { ...state.world, x, y, ...extra },
  }
}

const reduce = (state, ...actions) => actions.reduce(gameReducer, state)

describe('starting the game', () => {
  it('starts on the title screen at the village start', () => {
    const state = createInitialState()
    expect(state.screen).toBe('title')
    expect(state.world).toMatchObject({ mapId: 'village', x: 10, y: 11 })
    expect(state.player).toMatchObject({ level: 1, hp: 30, gold: 30 })
  })

  it('START_GAME opens the world with the opening scene', () => {
    const state = gameReducer(createInitialState(), { type: 'START_GAME' })
    expect(state.screen).toBe('world')
    expect(state.dialogue.boxes).toBe(SCENES.opening)
  })

  it('closing the opening scene sets introDone', () => {
    let state = gameReducer(createInitialState(), { type: 'START_GAME' })
    for (let i = 0; i < SCENES.opening.length; i++) {
      state = gameReducer(state, { type: 'INTERACT' })
    }
    expect(state.dialogue).toBeNull()
    expect(state.world.flags.introDone).toBe(true)
  })
})

describe('MOVE', () => {
  it('steps onto open ground and faces that way', () => {
    const next = gameReducer(inWorld(10, 11), { type: 'MOVE', dir: 'up' })
    expect(next.world).toMatchObject({ x: 10, y: 10, facing: 'up' })
  })

  it('only turns the player when walking into a wall or an NPC', () => {
    expect(
      gameReducer(inWorld(1, 12), { type: 'MOVE', dir: 'left' }).world,
    ).toMatchObject({ x: 1, y: 12, facing: 'left' })
    expect(
      gameReducer(inWorld(8, 6), { type: 'MOVE', dir: 'left' }).world,
    ).toMatchObject({ x: 8, y: 6, facing: 'left' })
  })

  it('is locked while a dialogue box is open', () => {
    const talking = {
      ...inWorld(10, 11),
      dialogue: { boxes: [{ text: 'Hi' }], index: 0 },
    }
    expect(gameReducer(talking, { type: 'MOVE', dir: 'up' })).toBe(talking)
  })

  it('ignores MOVE on the title screen', () => {
    const state = createInitialState()
    expect(gameReducer(state, { type: 'MOVE', dir: 'up' })).toBe(state)
  })
})

describe('warps', () => {
  it('the east exit leads to Mosswood, and back', () => {
    const inForest = gameReducer(inWorld(18, 6), { type: 'MOVE', dir: 'right' })
    expect(inForest.world).toMatchObject({ mapId: 'mosswood', x: 1, y: 6 })

    const home = gameReducer(inForest, { type: 'MOVE', dir: 'left' })
    expect(home.world).toMatchObject({ mapId: 'village', x: 18, y: 6 })
  })

  it('a warp to a map that is not built yet is just a tile', () => {
    // Pretend the north fog has gone: stand right under the caves warp.
    const next = gameReducer(inWorld(9, 1), { type: 'MOVE', dir: 'up' })
    expect(next.world).toMatchObject({ mapId: 'village', x: 9, y: 0 })
  })
})

describe('INTERACT', () => {
  it('talks to the NPC in front of you', () => {
    const next = gameReducer(inWorld(8, 6, { facing: 'left' }), {
      type: 'INTERACT',
    })
    expect(next.dialogue.boxes[0]).toEqual({
      speaker: 'Wick',
      text: "Mosswood's east. Shrine's past the river, on the far side. Mind the boar.",
    })
  })

  it('Wick has new lines once Shrine 1 is lit', () => {
    const state = inWorld(8, 6, { facing: 'left', flags: { shrine1Lit: true } })
    const next = gameReducer(state, { type: 'INTERACT' })
    expect(next.dialogue.boxes[0].text).toMatch(/Brighter already/)
  })

  it('advances and then closes the dialogue', () => {
    const talking = gameReducer(inWorld(8, 6, { facing: 'left' }), {
      type: 'INTERACT',
    })
    const second = gameReducer(talking, { type: 'INTERACT' })
    expect(second.dialogue.index).toBe(1)
    expect(gameReducer(second, { type: 'INTERACT' }).dialogue).toBeNull()
  })

  it('does nothing when facing empty ground', () => {
    const state = inWorld(10, 11, { facing: 'up' })
    expect(gameReducer(state, { type: 'INTERACT' })).toBe(state)
  })

  it('reads the lantern hint', () => {
    const next = gameReducer(inWorld(9, 6, { facing: 'right' }), {
      type: 'INTERACT',
    })
    expect(next.dialogue.boxes[0].text).toMatch(/flickers weakly/)
  })
})

describe('chests', () => {
  // The village chest at (15, 4) holds 3 Herbs. Stand below it, facing up.
  const besideChest = () => inWorld(15, 5, { facing: 'up' })

  it('gives its items once and is remembered as opened', () => {
    const opened = gameReducer(besideChest(), { type: 'INTERACT' })
    expect(opened.player.inventory.herb).toBe(3)
    expect(opened.dialogue.boxes[0].text).toBe('You found Herb ×3!')
    expect(opened.world.openedChests).toContain(objectKey('village', 15, 4))
  })

  it('is empty the second time', () => {
    const again = reduce(
      besideChest(),
      { type: 'INTERACT' }, // open
      { type: 'INTERACT' }, // close the message
      { type: 'INTERACT' }, // open again
    )
    expect(again.player.inventory.herb).toBe(3)
    expect(again.dialogue.boxes[0].text).toBe(
      'Empty. You already got this one.',
    )
  })

  it('sells what does not fit in a full stack', () => {
    const state = besideChest()
    state.player = { ...state.player, inventory: { herb: 8 }, gold: 30 }
    const opened = gameReducer(state, { type: 'INTERACT' })
    expect(opened.player.inventory.herb).toBe(9)
    expect(opened.player.gold).toBe(30 + 2 * 4) // 2 Herbs sold at 4 gold each
    expect(opened.dialogue.boxes[1].text).toBe(
      'Your pack is full. Sold for 8 gold.',
    )
  })
})

describe('RETURN_TO_TITLE', () => {
  it('goes back to the title', () => {
    expect(
      gameReducer(inWorld(10, 11), { type: 'RETURN_TO_TITLE' }).screen,
    ).toBe('title')
  })
})

describe('battles', () => {
  // A Moss Slime stands at (3, 2) in Mosswood. Start just below it.
  function belowSlime() {
    const state = inWorld(3, 3, { mapId: 'mosswood' })
    return state
  }

  function bump(state, seed = 1) {
    return gameReducer(state, { type: 'MOVE', dir: 'up', seed })
  }

  // Finish the current fight with an unbeatable hero.
  function winFight(state) {
    let next = { ...state, player: { ...state.player, atk: 99 } }
    while (next.battle.phase === 'choose') {
      next = gameReducer(next, {
        type: 'BATTLE_CHOICE',
        choice: { type: 'attack' },
        seed: 7,
      })
    }
    return next
  }

  it('walking into an enemy starts a battle', () => {
    const next = bump(belowSlime())
    expect(next.screen).toBe('battle')
    expect(next.battle.enemies[0].enemyId).toBe('mossSlime')
    expect(next.battle.source).toEqual({
      type: 'enemy',
      key: objectKey('mosswood', 3, 2),
    })
    expect(next.world).toMatchObject({ x: 3, y: 3, facing: 'up' })
  })

  it('winning gives XP and gold and removes the enemy until you leave', () => {
    const won = winFight(bump(belowSlime()))
    const back = gameReducer(won, { type: 'END_BATTLE' })
    const rewards = won.battle.rewards

    expect(back.screen).toBe('world')
    expect(back.player.xp).toBe(rewards.xp)
    expect(back.player.gold).toBe(30 + rewards.gold)
    expect(back.world.defeatedEnemies).toEqual([objectKey('mosswood', 3, 2)])

    // The slime's tile is free now.
    const stepped = gameReducer(back, { type: 'MOVE', dir: 'up' })
    expect(stepped.world).toMatchObject({ x: 3, y: 2 })
  })

  it('defeated enemies respawn after a warp', () => {
    const won = gameReducer(winFight(bump(belowSlime())), {
      type: 'END_BATTLE',
    })
    const atExit = { ...won, world: { ...won.world, x: 1, y: 6 } }
    const village = gameReducer(atExit, { type: 'MOVE', dir: 'left' })
    expect(village.world.mapId).toBe('village')
    expect(village.world.defeatedEnemies).toEqual([])
  })

  it('beating the Thornback Boar keeps it gone for good', () => {
    // The Boar stands at (16, 3); start below it.
    const state = inWorld(16, 4, { mapId: 'mosswood' })
    const fightStarted = bump(state)
    expect(fightStarted.battle.boss).toBe(true)

    const back = gameReducer(winFight(fightStarted), { type: 'END_BATTLE' })
    expect(back.world.defeatedBosses).toEqual(['thornbackBoar'])
    expect(back.world.defeatedEnemies).toEqual([])
  })

  it('losing wakes you in the village with full HP and half your gold', () => {
    const fighting = bump(belowSlime())
    const lost = {
      ...fighting,
      player: { ...fighting.player, gold: 31, hp: 1 },
      battle: { ...fighting.battle, phase: 'lost' },
    }
    const next = gameReducer(lost, { type: 'END_BATTLE' })
    expect(next.screen).toBe('world')
    expect(next.player).toMatchObject({ hp: 30, light: 5, gold: 15 })
    expect(next.world).toMatchObject({ mapId: 'village', x: 10, y: 11 })
    expect(next.dialogue.boxes[0].text).toMatch(/Wick is frowning/)
  })

  it('fleeing returns you to the map with the enemy still there', () => {
    const fighting = bump(belowSlime())
    const fled = { ...fighting, battle: { ...fighting.battle, phase: 'fled' } }
    const next = gameReducer(fled, { type: 'END_BATTLE' })
    expect(next.screen).toBe('world')
    expect(next.world.defeatedEnemies).toEqual([])
  })

  it('END_BATTLE does nothing while the fight is still going', () => {
    const fighting = bump(belowSlime())
    expect(gameReducer(fighting, { type: 'END_BATTLE' })).toBe(fighting)
  })
})
