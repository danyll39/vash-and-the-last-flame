// Checks a dialogue entry's `when` against the game state.
// Supported: { flag }, { hasItem }, { quest: [id, status] }.
export function matches(when, state) {
  if (!when) return true
  if (when.flag && !state.world.flags[when.flag]) return false
  if (when.hasItem && !state.player.inventory[when.hasItem]) return false
  if (when.quest) {
    const [id, status] = when.quest
    if ((state.quests?.[id]?.status ?? 'locked') !== status) return false
  }
  return true
}

export function pickDialogue(entries, state) {
  return entries.find((entry) => matches(entry.when, state)) ?? null
}

// Builds the dialogue state the DialogueBox shows. `then` runs when the
// last box closes, for example { setFlag: 'introDone' }.
export function openDialogue(boxes, then = null) {
  return { boxes, index: 0, then }
}

export function linesToBoxes(lines, speaker) {
  return lines.map((text) => (speaker ? { speaker, text } : { text }))
}
