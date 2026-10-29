// Skills cost Light. Numbers from README section 3 and ENEMIES.md.
export const SKILLS = {
  flare: {
    name: 'Flare',
    cost: 2,
    description: '1.5× damage to one enemy.',
  },
  mend: {
    name: 'Mend',
    cost: 3,
    description: 'Heal 30% of your max HP.',
  },
  radiance: {
    name: 'Radiance',
    cost: 5,
    requires: 'shrine2Lit',
    description: 'Hit every enemy.',
  },
}

export const SKILL_ORDER = ['flare', 'mend', 'radiance']
