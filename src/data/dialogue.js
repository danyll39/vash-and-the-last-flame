// Lines from STORY.md, section 5. The first entry whose `when` matches is
// used; an entry without `when` is the fallback. Quest entries (Bren's
// Pest Control, Tamsin's Lost Locket) arrive with the quest system in M6.

export const NPC_NAMES = { wick: 'Wick', bren: 'Bren', tamsin: 'Tamsin' }

export const NPC_DIALOGUE = {
  wick: [
    {
      when: { flag: 'shrine2Lit' },
      lines: [
        "Two flames lit. The Spire's open, west road. Whatever's up there, it's been waiting for you.",
        'Take Tonics. Take Elixirs. Take a nap first, honestly.',
      ],
    },
    {
      when: { flag: 'shrine1Lit' },
      lines: [
        'Look at that lantern! Brighter already. Burned the fog right off the north road.',
        "The second shrine's in the Gloam Caves. It's dark down there. You'll be fine. Probably.",
      ],
    },
    {
      lines: [
        "Mosswood's east. Shrine's past the river, on the far side. Mind the boar.",
        "No, I don't know which boar. There's always a boar.",
      ],
    },
  ],
  bren: [
    {
      lines: [
        "Welcome to Bren's! If it's not on the shelf, you didn't need it.",
      ],
    },
  ],
  tamsin: [
    {
      lines: [
        "Duchess thinks I'm overreacting about the dark. Duchess eats fences.",
      ],
    },
  ],
}

// The lantern doubles as a hint system (STORY.md, section 5).
export const LANTERN_DIALOGUE = [
  {
    when: { flag: 'shrine3Lit' },
    lines: [
      "The lantern hums contentedly. If you didn't know better, you'd say it was smiling.",
    ],
  },
  {
    when: { flag: 'shrine2Lit' },
    lines: ['Bright and steady. The west fog is gone. The Spire waits.'],
  },
  {
    when: { flag: 'shrine1Lit' },
    lines: ['Brighter now. The north fog has burned away. The caves are open.'],
  },
  {
    lines: [
      'The great lantern flickers weakly. East, past the gate, is Mosswood.',
    ],
  },
]
