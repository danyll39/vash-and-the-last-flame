import { useEffect, useRef } from 'react'
import styles from './TitleScreen.module.css'

function TitleScreen({ onStart }) {
  const startRef = useRef(null)

  // Focus Start so Enter or Space begins the game without a mouse.
  useEffect(() => {
    startRef.current?.focus()
  }, [])

  return (
    <main className={styles.screen}>
      <div className={styles.lantern} aria-hidden="true">
        <span className={styles.handle} />
        <span className={styles.body}>
          <span className={styles.flame} />
        </span>
        <span className={styles.base} />
      </div>

      <h1 className={styles.title}>Lanternhold</h1>
      <p className={styles.tagline}>
        Relight the valley before the dark takes it.
      </p>

      <nav className={styles.menu} aria-label="Main menu">
        <button
          ref={startRef}
          type="button"
          className={styles.button}
          onClick={onStart}
        >
          Start
        </button>
        {/* Continue is enabled once saving exists (M8). */}
        <button type="button" className={styles.button} disabled>
          Continue
        </button>
      </nav>

      <p className={styles.hint}>Arrows / WASD to move · Space to talk</p>
    </main>
  )
}

export default TitleScreen
