import styles from './Hud.module.css'

function Stat({ label, value }) {
  return (
    <div className={styles.stat}>
      <dt>{label}</dt>
      <dd>{value}</dd>
    </div>
  )
}

function Hud({ player }) {
  return (
    <dl className={styles.hud} aria-label="Status" data-testid="hud">
      <Stat label="Lv" value={player.level} />
      <Stat label="HP" value={`${player.hp}/${player.maxHp}`} />
      <Stat label="Light" value={`${player.light}/${player.maxLight}`} />
      <Stat label="Gold" value={player.gold} />
    </dl>
  )
}

export default Hud
