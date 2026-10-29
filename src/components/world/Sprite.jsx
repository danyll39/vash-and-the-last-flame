import { SHEETS, SHEET_COLS, SPRITES } from '../../data/tilesets.js'
import styles from './World.module.css'

function Sprite({ name, flip = false, className = '' }) {
  const [sheet, index] = SPRITES[name]
  return (
    <span
      className={`${styles.sprite} ${flip ? styles.flip : ''} ${className}`}
      style={{
        backgroundImage: `url(${SHEETS[sheet]})`,
        '--col': index % SHEET_COLS,
        '--row': Math.floor(index / SHEET_COLS),
      }}
    />
  )
}

export default Sprite
