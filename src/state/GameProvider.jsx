import { useReducer } from 'react'
import { GameContext } from './gameContext.js'
import { createInitialState, gameReducer } from './gameReducer.js'

function GameProvider({ children }) {
  const [state, dispatch] = useReducer(
    gameReducer,
    undefined,
    createInitialState,
  )
  return (
    <GameContext.Provider value={{ state, dispatch }}>
      {children}
    </GameContext.Provider>
  )
}

export default GameProvider
