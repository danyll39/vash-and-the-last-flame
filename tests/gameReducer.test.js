import { createInitialState, gameReducer } from '../src/state/gameReducer.js'

function inWorld(x, y) {
  const state = gameReducer(createInitialState(), { type: 'START_GAME' })
  return { ...state, world: { ...state.world, x, y } }
}

describe('gameReducer', () => {
  it('starts on the title screen at the village start', () => {
    const state = createInitialState()
    expect(state.screen).toBe('title')
    expect(state.world).toMatchObject({ mapId: 'village', x: 10, y: 11 })
  })

  it('START_GAME switches to the world', () => {
    expect(
      gameReducer(createInitialState(), { type: 'START_GAME' }).screen,
    ).toBe('world')
  })

  it('MOVE steps onto open ground and faces that way', () => {
    const next = gameReducer(inWorld(10, 11), { type: 'MOVE', dir: 'up' })
    expect(next.world).toMatchObject({ x: 10, y: 10, facing: 'up' })
  })

  it('MOVE into a wall only turns the player', () => {
    const next = gameReducer(inWorld(1, 12), { type: 'MOVE', dir: 'left' })
    expect(next.world).toMatchObject({ x: 1, y: 12, facing: 'left' })
  })

  it('MOVE into an NPC only turns the player', () => {
    const next = gameReducer(inWorld(8, 6), { type: 'MOVE', dir: 'left' })
    expect(next.world).toMatchObject({ x: 8, y: 6, facing: 'left' })
  })

  it('ignores MOVE on the title screen', () => {
    const state = createInitialState()
    expect(gameReducer(state, { type: 'MOVE', dir: 'up' })).toBe(state)
  })

  it('RETURN_TO_TITLE goes back to the title', () => {
    expect(
      gameReducer(inWorld(10, 11), { type: 'RETURN_TO_TITLE' }).screen,
    ).toBe('title')
  })
})
