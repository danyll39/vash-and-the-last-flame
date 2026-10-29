import { useState } from 'react'
import TitleScreen from './components/ui/TitleScreen.jsx'

// Screens: 'title' | 'world' (later: 'battle' | 'gameover' | 'credits').
// This moves into gameReducer in M1.
function App() {
  const [screen, setScreen] = useState('title')

  if (screen === 'world') {
    return (
      <main className="placeholder">
        <p>The world map arrives in Milestone 1.</p>
        <button type="button" onClick={() => setScreen('title')}>
          Back to title
        </button>
      </main>
    )
  }

  return <TitleScreen onStart={() => setScreen('world')} />
}

export default App
