import { useReducer } from 'react'
import { GameContext } from './gameContext.js'
import { createInitialState, gameReducer } from './gameReducer.js'

// `initialState` lets tests start in the middle of the game, such as
// halfway through a battle.
function GameProvider({ children, initialState }) {
  const [state, dispatch] = useReducer(
    gameReducer,
    initialState,
    (preset) => preset ?? createInitialState(),
  )
  return (
    <GameContext.Provider value={{ state, dispatch }}>
      {children}
    </GameContext.Provider>
  )
}

export default GameProvider
