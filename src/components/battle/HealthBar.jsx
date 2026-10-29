import styles from './Battle.module.css'

// The fill width animates (see .fill in Battle.module.css), so hits and
// heals slide instead of jumping.
function HealthBar({ label, value, max, kind = 'hp' }) {
  const percent = max > 0 ? Math.round((value / max) * 100) : 0
  const low = kind === 'hp' && percent <= 30

  return (
    <div className={styles.bar}>
      <span className={styles.barLabel}>{label}</span>
      <span
        className={styles.track}
        role="meter"
        aria-label={label}
        aria-valuemin={0}
        aria-valuemax={max}
        aria-valuenow={value}
      >
        <span
          className={`${styles.fill} ${styles[kind]} ${low ? styles.low : ''}`}
          style={{ width: `${percent}%` }}
        />
      </span>
      <span className={styles.barValue}>
        {value}/{max}
      </span>
    </div>
  )
}

export default HealthBar
