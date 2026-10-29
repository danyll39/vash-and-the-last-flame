import BattleScreen from './components/battle/BattleScreen.jsx'
import TitleScreen from './components/ui/TitleScreen.jsx'
import WorldScreen from './components/world/WorldScreen.jsx'
import GameProvider from './state/GameProvider.jsx'
import { useGame } from './state/useGame.js'

function Screens() {
  const { state, dispatch } = useGame()

  if (state.screen === 'world') return <WorldScreen />
  if (state.screen === 'battle') return <BattleScreen />

  return <TitleScreen onStart={() => dispatch({ type: 'START_GAME' })} />
}

// `initialState` is only used by tests that start mid-game.
function App({ initialState }) {
  return (
    <GameProvider initialState={initialState}>
      <Screens />
    </GameProvider>
  )
}

export default App
