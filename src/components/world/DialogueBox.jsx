import styles from './World.module.css'

function DialogueBox({ dialogue }) {
  const box = dialogue.boxes[dialogue.index]
  const isLast = dialogue.index === dialogue.boxes.length - 1

  return (
    <section
      className={styles.dialogue}
      aria-live="polite"
      data-testid="dialogue"
    >
      {box.speaker && <p className={styles.speaker}>{box.speaker}</p>}
      <p
        className={
          box.speaker ? styles.line : `${styles.line} ${styles.narration}`
        }
      >
        {box.text}
      </p>
      <p className={styles.advance} aria-hidden="true">
        {isLast ? '■' : '▼'} Space
      </p>
    </section>
  )
}

export default DialogueBox
