import { useCallback } from 'react'
import { MAPS } from '../../data/maps/index.js'
import { useKeyboard } from '../../hooks/useKeyboard.js'
import { useGame } from '../../state/GameContext.jsx'
import Player from './Player.jsx'
import TileMap from './TileMap.jsx'
import styles from './World.module.css'

function WorldScreen() {
  const { state, dispatch } = useGame()
  const { world } = state
  const map = MAPS[world.mapId]

  const onMove = useCallback(
    (dir) => dispatch({ type: 'MOVE', dir }),
    [dispatch],
  )
  const onCancel = useCallback(
    () => dispatch({ type: 'RETURN_TO_TITLE' }),
    [dispatch],
  )
  useKeyboard({ onMove, onCancel })

  return (
    <main className={styles.screen}>
      <h1 className={styles.mapName}>{map.name}</h1>
      <div
        className={styles.viewport}
        role="img"
        aria-label={`Map of ${map.name}. Use the arrow keys or WASD to walk.`}
        style={{ '--map-w': map.width, '--map-h': map.height }}
      >
        <TileMap map={map} />
        <Player x={world.x} y={world.y} facing={world.facing} />
      </div>
      <p className={styles.hint}>Arrows / WASD to move · Esc for title</p>
    </main>
  )
}

export default WorldScreen
