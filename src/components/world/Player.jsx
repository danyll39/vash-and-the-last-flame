import Sprite from './Sprite.jsx'
import styles from './World.module.css'

// The Kenney characters only have one pose, so facing left mirrors the
// sprite. Facing up or down keeps the last left/right look.
function Player({ x, y, facing }) {
  return (
    <div
      className={`${styles.entity} ${styles.player}`}
      style={{ '--x': x, '--y': y }}
      data-testid="player"
      data-x={x}
      data-y={y}
      data-facing={facing}
    >
      <Sprite name="vash" flip={facing === 'left'} />
    </div>
  )
}

export default Player
