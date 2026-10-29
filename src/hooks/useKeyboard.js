import { useEffect, useRef } from 'react'

const MOVE_KEYS = {
  ArrowUp: 'up',
  ArrowDown: 'down',
  ArrowLeft: 'left',
  ArrowRight: 'right',
  w: 'up',
  s: 'down',
  a: 'left',
  d: 'right',
}

// Holding a key repeats far faster than walking should, so steps are
// limited to one per STEP_MS.
const STEP_MS = 140

export function useKeyboard({ onMove, onCancel }) {
  const lastStep = useRef(0)

  useEffect(() => {
    function handleKeyDown(event) {
      if (event.ctrlKey || event.metaKey || event.altKey) return

      const dir = MOVE_KEYS[event.key] ?? MOVE_KEYS[event.key.toLowerCase()]
      if (dir) {
        event.preventDefault() // stop arrow keys scrolling the page
        const now = performance.now()
        if (event.repeat && now - lastStep.current < STEP_MS) return
        lastStep.current = now
        onMove?.(dir)
        return
      }

      if (event.key === 'Escape') onCancel?.()
    }

    window.addEventListener('keydown', handleKeyDown)
    return () => window.removeEventListener('keydown', handleKeyDown)
  }, [onMove, onCancel])
}
