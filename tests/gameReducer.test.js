import { SCENES } from '../src/data/scenes.js'
import {
  chestKey,
  createInitialState,
  gameReducer,
} from '../src/state/gameReducer.js'

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
    expect(opened.world.openedChests).toContain(chestKey('village', 15, 4))
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
