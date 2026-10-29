import { useCallback } from 'react'
import { MAPS } from '../../data/maps/index.js'
import { useKeyboard } from '../../hooks/useKeyboard.js'
import { newSeed } from '../../logic/random.js'
import { useGame } from '../../state/useGame.js'
import Hud from '../ui/Hud.jsx'
import DialogueBox from './DialogueBox.jsx'
import MapObjects from './MapObjects.jsx'
import Player from './Player.jsx'
import TileMap from './TileMap.jsx'
import styles from './World.module.css'

function WorldScreen() {
  const { state, dispatch } = useGame()
  const { world, player, dialogue } = state
  const map = MAPS[world.mapId]

  // The seed decides group size if this step bumps into an enemy.
  const onMove = useCallback(
    (dir) => dispatch({ type: 'MOVE', dir, seed: newSeed() }),
    [dispatch],
  )
  const onInteract = useCallback(
    () => dispatch({ type: 'INTERACT' }),
    [dispatch],
  )
  const onCancel = useCallback(
    () => dispatch({ type: 'RETURN_TO_TITLE' }),
    [dispatch],
  )
  useKeyboard({ onMove, onInteract, onCancel })

  return (
    <main className={styles.screen}>
      <h1 className={styles.mapName}>{map.name}</h1>
      <Hud player={player} />
      <div
        className={styles.viewport}
        role="img"
        aria-label={`Map of ${map.name}. Use the arrow keys or WASD to walk, and Space to talk.`}
        style={{ '--map-w': map.width, '--map-h': map.height }}
      >
        <TileMap map={map} />
        <MapObjects map={map} world={world} />
        {/* Keyed by map so a warp doesn't animate across the screen. */}
        <Player
          key={world.mapId}
          x={world.x}
          y={world.y}
          facing={world.facing}
        />
        {dialogue && <DialogueBox dialogue={dialogue} />}
      </div>
      <p className={styles.hint}>
        Arrows / WASD to move · Space to talk · Esc for title
      </p>
    </main>
  )
}

export default WorldScreen
