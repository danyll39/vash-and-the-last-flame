import { createContext, useContext, useReducer } from 'react'
import { createInitialState, gameReducer } from './gameReducer.js'

const GameContext = createContext(null)

export function GameProvider({ children }) {
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

// oxlint-disable-next-line react/only-export-components
export function useGame() {
  const value = useContext(GameContext)
  if (!value) throw new Error('useGame must be used inside <GameProvider>')
  return value
}
