import TitleScreen from './components/ui/TitleScreen.jsx'
import WorldScreen from './components/world/WorldScreen.jsx'
import { GameProvider, useGame } from './state/GameContext.jsx'

function Screens() {
  const { state, dispatch } = useGame()

  if (state.screen === 'world') return <WorldScreen />

  return <TitleScreen onStart={() => dispatch({ type: 'START_GAME' })} />
}

function App() {
  return (
    <GameProvider>
      <Screens />
    </GameProvider>
  )
}

export default App
