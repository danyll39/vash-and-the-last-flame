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

const INTERACT_KEYS = new Set([' ', 'Enter', 'e'])

// Holding a key repeats far faster than walking should, so steps are
// limited to one per STEP_MS.
const STEP_MS = 140

export function useKeyboard({ onMove, onInteract, onCancel }) {
  const lastStep = useRef(0)

  useEffect(() => {
    function handleKeyDown(event) {
      if (event.ctrlKey || event.metaKey || event.altKey) return
      const key = event.key.length === 1 ? event.key.toLowerCase() : event.key

      const dir = MOVE_KEYS[key]
      if (dir) {
        event.preventDefault() // stop arrow keys scrolling the page
        const now = performance.now()
        if (event.repeat && now - lastStep.current < STEP_MS) return
        lastStep.current = now
        onMove?.(dir)
        return
      }

      if (INTERACT_KEYS.has(key)) {
        event.preventDefault() // stop Space scrolling the page
        // Holding Space shouldn't race through a whole conversation.
        if (!event.repeat) onInteract?.()
        return
      }

      if (key === 'Escape') onCancel?.()
    }

    window.addEventListener('keydown', handleKeyDown)
    return () => window.removeEventListener('keydown', handleKeyDown)
  }, [onMove, onInteract, onCancel])
}
