import { memo } from 'react'
import { tileLayers } from '../../data/tilesets.js'
import Sprite from './Sprite.jsx'
import styles from './World.module.css'

// The terrain never changes while you walk, so this only re-renders when
// the map itself changes. NPCs, chests and enemies are drawn by MapObjects.
function TileMap({ map }) {
  const cells = []
  for (let y = 0; y < map.height; y++) {
    for (let x = 0; x < map.width; x++) {
      cells.push(
        <div key={`${x},${y}`} className={styles.cell}>
          {tileLayers(map, x, y).map((layer, i) =>
            typeof layer === 'string' ? (
              <Sprite key={i} name={layer} />
            ) : (
              <span key={i} className={styles[layer.css]} />
            ),
          )}
        </div>,
      )
    }
  }

  return (
    <div className={styles.grid} data-testid="tile-grid">
      {cells}
    </div>
  )
}

export default memo(TileMap)
