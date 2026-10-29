import { useEffect, useRef, useState } from 'react'
import { SPRITES } from '../../data/tilesets.js'
import { MAPS } from '../../data/maps/index.js'
import { livingEnemies } from '../../logic/combat.js'
import { newSeed } from '../../logic/random.js'
import { useGame } from '../../state/useGame.js'
import Sprite from '../world/Sprite.jsx'
import ActionMenu from './ActionMenu.jsx'
import CombatLog from './CombatLog.jsx'
import HealthBar from './HealthBar.jsx'
import styles from './Battle.module.css'

const PHASE_BUTTON = {
  won: 'Continue',
  fled: 'Continue',
  lost: 'Wake up',
}

// Without a pause, an Enter pressed to attack can land on this button the
// moment the fight ends, and the result flashes by unread.
const RESULT_DELAY_MS = 600

function ResultButton({ label, onClick }) {
  const [ready, setReady] = useState(false)
  const ref = useRef(null)

  useEffect(() => {
    const id = setTimeout(() => setReady(true), RESULT_DELAY_MS)
    return () => clearTimeout(id)
  }, [])

  useEffect(() => {
    if (ready) ref.current?.focus()
  }, [ready])

  return (
    <div className={styles.menu}>
      <button
        ref={ref}
        type="button"
        className={styles.menuButton}
        disabled={!ready}
        onClick={onClick}
      >
        {label}
      </button>
    </div>
  )
}

function BattleScreen() {
  const { state, dispatch } = useGame()
  const { battle, player, world } = state
  const living = livingEnemies(battle)

  // Which enemy Attack and Flare hit. Left/Right changes it.
  const [targetUid, setTargetUid] = useState(living[0]?.uid)
  const target = living.find((e) => e.uid === targetUid) ?? living[0]

  useEffect(() => {
    if (battle.phase !== 'choose') return undefined
    function handleKeyDown(event) {
      if (event.key !== 'ArrowLeft' && event.key !== 'ArrowRight') return
      event.preventDefault()
      const index = living.indexOf(target)
      const step = event.key === 'ArrowRight' ? 1 : -1
      const next = living[(index + step + living.length) % living.length]
      if (next) setTargetUid(next.uid)
    }
    window.addEventListener('keydown', handleKeyDown)
    return () => window.removeEventListener('keydown', handleKeyDown)
  }, [battle.phase, living, target])

  function choose(choice) {
    dispatch({
      type: 'BATTLE_CHOICE',
      choice: { ...choice, target: target?.uid },
      seed: newSeed(),
    })
  }

  return (
    <main className={styles.screen}>
      <h1 className={styles.title}>
        {battle.boss ? 'Boss battle' : 'Battle'} · {MAPS[world.mapId].name}
      </h1>

      <section className={styles.enemies} aria-label="Enemies">
        {battle.enemies.map((enemy) => {
          const isTarget = battle.phase === 'choose' && enemy === target
          return (
            <button
              key={enemy.uid}
              type="button"
              className={`${styles.enemy} ${enemy.hp === 0 ? styles.defeated : ''} ${isTarget ? styles.targeted : ''}`}
              disabled={enemy.hp === 0 || battle.phase !== 'choose'}
              aria-pressed={isTarget}
              onClick={() => setTargetUid(enemy.uid)}
              data-testid="enemy"
            >
              <span className={styles.enemyArt}>
                {SPRITES[enemy.enemyId] ? (
                  <Sprite name={enemy.enemyId} />
                ) : (
                  <span className={styles.placeholder} />
                )}
              </span>
              <span className={styles.enemyName}>
                {isTarget && <span aria-hidden="true">▶ </span>}
                {enemy.name}
              </span>
              <HealthBar label="HP" value={enemy.hp} max={enemy.maxHp} />
            </button>
          )
        })}
      </section>

      <section className={styles.panel}>
        <div className={styles.hero}>
          <p className={styles.heroName}>{player.name}</p>
          <HealthBar label="HP" value={player.hp} max={player.maxHp} />
          <HealthBar
            label="Light"
            value={player.light}
            max={player.maxLight}
            kind="light"
          />
        </div>

        <CombatLog lines={battle.log} />

        {battle.phase === 'choose' ? (
          <ActionMenu
            player={player}
            flags={world.flags}
            boss={battle.boss}
            onChoose={choose}
          />
        ) : (
          <ResultButton
            label={PHASE_BUTTON[battle.phase]}
            onClick={() => dispatch({ type: 'END_BATTLE' })}
          />
        )}
      </section>

      <p className={styles.hint}>
        ↑↓ choose · Enter to act · ←→ change target · Esc to go back
      </p>
    </main>
  )
}

export default BattleScreen
