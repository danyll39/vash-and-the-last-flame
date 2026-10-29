import { NPC_DIALOGUE } from '../src/data/dialogue.js'
import { matches, pickDialogue } from '../src/logic/dialogue.js'

const state = ({ flags = {}, inventory = {}, quests = {} } = {}) => ({
  world: { flags },
  player: { inventory },
  quests,
})

describe('matches', () => {
  it('an entry with no condition always matches', () => {
    expect(matches(undefined, state())).toBe(true)
  })

  it('checks flags, items and quest status', () => {
    expect(matches({ flag: 'shrine1Lit' }, state())).toBe(false)
    expect(
      matches({ flag: 'shrine1Lit' }, state({ flags: { shrine1Lit: true } })),
    ).toBe(true)
    expect(
      matches({ hasItem: 'locket' }, state({ inventory: { locket: 1 } })),
    ).toBe(true)
    expect(matches({ quest: ['lostLocket', 'locked'] }, state())).toBe(true)
    expect(
      matches(
        { quest: ['lostLocket', 'active'] },
        state({ quests: { lostLocket: { status: 'active' } } }),
      ),
    ).toBe(true)
  })
})

describe('pickDialogue', () => {
  it('uses the first matching entry, newest story state first', () => {
    const both = state({ flags: { shrine1Lit: true, shrine2Lit: true } })
    expect(pickDialogue(NPC_DIALOGUE.wick, both).lines[0]).toMatch(
      /Two flames lit/,
    )
  })

  it('falls back to the entry with no condition', () => {
    expect(pickDialogue(NPC_DIALOGUE.wick, state()).lines[0]).toMatch(
      /Mosswood's east/,
    )
  })

  it('every NPC has a fallback line', () => {
    for (const entries of Object.values(NPC_DIALOGUE)) {
      expect(entries.at(-1).when).toBeUndefined()
    }
  })
})
