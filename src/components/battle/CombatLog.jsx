import styles from './Battle.module.css'

function CombatLog({ lines }) {
  return (
    <ol className={styles.log} aria-live="polite" data-testid="combat-log">
      {lines.map((line, i) => (
        // Lines can repeat ("You hit Moss Slime for 5."), so the index is
        // part of the key. The log only ever grows at the end.
        <li key={`${i}-${line}`}>{line}</li>
      ))}
    </ol>
  )
}

export default CombatLog
