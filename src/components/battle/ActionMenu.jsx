import { useEffect, useRef, useState } from 'react'
import { ITEMS } from '../../data/items.js'
import { SKILLS, SKILL_ORDER } from '../../data/skills.js'
import { canUseSkill } from '../../logic/combat.js'
import styles from './Battle.module.css'

// Up/Down moves between buttons, Enter or Space picks one (native button
// behaviour), and Escape goes back from a sub-menu.
function moveFocus(container, step) {
  const buttons = [...container.querySelectorAll('button:not(:disabled)')]
  const current = buttons.indexOf(document.activeElement)
  const next = (current + step + buttons.length) % buttons.length
  buttons[next]?.focus()
}

function ActionMenu({ player, flags, boss, onChoose }) {
  const [menu, setMenu] = useState('main') // 'main' | 'skill' | 'item'
  const listRef = useRef(null)

  // Focus the first option whenever a menu opens.
  useEffect(() => {
    listRef.current?.querySelector('button:not(:disabled)')?.focus()
  }, [menu])

  function handleKeyDown(event) {
    if (event.key === 'ArrowDown') {
      event.preventDefault()
      moveFocus(listRef.current, 1)
    } else if (event.key === 'ArrowUp') {
      event.preventDefault()
      moveFocus(listRef.current, -1)
    } else if (event.key === 'Escape' && menu !== 'main') {
      setMenu('main')
    }
  }

  function choose(choice) {
    setMenu('main')
    onChoose(choice)
  }

  let options
  if (menu === 'skill') {
    options = SKILL_ORDER.filter(
      (id) => !SKILLS[id].requires || flags[SKILLS[id].requires],
    ).map((id) => ({
      key: id,
      label: `${SKILLS[id].name} (${SKILLS[id].cost} Light)`,
      hint: SKILLS[id].description,
      disabled: !canUseSkill(id, player, flags),
      onClick: () => choose({ type: 'skill', skill: id }),
    }))
  } else if (menu === 'item') {
    options = Object.entries(player.inventory)
      .filter(([id]) => ITEMS[id].type === 'consumable')
      .map(([id, qty]) => ({
        key: id,
        label: `${ITEMS[id].name} ×${qty}`,
        hint: ITEMS[id].description,
        disabled: Boolean(ITEMS[id].effect.flee && boss),
        onClick: () => choose({ type: 'item', item: id }),
      }))
  } else {
    options = [
      {
        key: 'attack',
        label: 'Attack',
        onClick: () => choose({ type: 'attack' }),
      },
      { key: 'skill', label: 'Skill', onClick: () => setMenu('skill') },
      { key: 'item', label: 'Item', onClick: () => setMenu('item') },
      {
        key: 'flee',
        label: 'Flee',
        disabled: boss,
        hint: boss ? "There's no running from this one." : undefined,
        onClick: () => choose({ type: 'flee' }),
      },
    ]
  }

  return (
    <nav
      className={styles.menu}
      aria-label={menu === 'main' ? 'Battle actions' : `${menu} menu`}
      onKeyDown={handleKeyDown}
    >
      <ul ref={listRef}>
        {options.map((option) => (
          <li key={option.key}>
            <button
              type="button"
              className={styles.menuButton}
              disabled={option.disabled}
              title={option.hint}
              onClick={option.onClick}
            >
              {option.label}
            </button>
          </li>
        ))}
        {options.length === 0 && (
          <li className={styles.empty}>Nothing to use.</li>
        )}
        {menu !== 'main' && (
          <li>
            <button
              type="button"
              className={`${styles.menuButton} ${styles.back}`}
              onClick={() => setMenu('main')}
            >
              Back
            </button>
          </li>
        )}
      </ul>
    </nav>
  )
}

export default ActionMenu
