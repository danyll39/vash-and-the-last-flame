import { MAPS } from '../data/maps/index.js'
import { DIRECTIONS, canMoveTo } from '../logic/movement.js'

export function createInitialState() {
  const start = MAPS.village.start
  return {
    screen: 'title', // 'title' | 'world' (later: 'battle' | 'gameover' | 'credits')
    world: { mapId: 'village', x: start.x, y: start.y, facing: 'down' },
  }
}

export function gameReducer(state, action) {
  switch (action.type) {
    case 'START_GAME':
      return { ...createInitialState(), screen: 'world' }

    case 'RETURN_TO_TITLE':
      return { ...state, screen: 'title' }

    case 'MOVE': {
      const step = DIRECTIONS[action.dir]
      if (!step || state.screen !== 'world') return state

      const { world } = state
      const x = world.x + step.dx
      const y = world.y + step.dy
      // Turn to face the direction even when the move is blocked.
      if (!canMoveTo(MAPS[world.mapId], x, y)) {
        return { ...state, world: { ...world, facing: action.dir } }
      }
      return { ...state, world: { ...world, x, y, facing: action.dir } }
    }

    default:
      return state
  }
}
