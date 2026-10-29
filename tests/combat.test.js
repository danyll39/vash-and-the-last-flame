import {
  attackPower,
  calcDamage,
  defensePower,
  startBattle,
  takeTurn,
} from '../src/logic/combat.js'
import { createRng } from '../src/logic/random.js'

// rng() always returns 0.5: damage rolls add 0, and no % chance fires
// unless it is above 50%.
const steady = () => 0.5
const always = (value) => () => value

// Level 1 Vash: ATK 5 + Staff 2 = 7, DEF 2 + Cloth Coat 1 = 3.
function hero(overrides = {}) {
  return {
    name: 'Vash',
    hp: 30,
    maxHp: 30,
    light: 5,
    maxLight: 5,
    atk: 5,
    def: 2,
    weapon: 'staff',
    armor: 'clothCoat',
    inventory: {},
    ...overrides,
  }
}

function fight(enemyId, rng = steady) {
  return startBattle(enemyId, rng)
}

describe('stats and damage', () => {
  it('adds weapon and armor bonuses', () => {
    expect(attackPower(hero())).toBe(7)
    expect(defensePower(hero())).toBe(3)
  })

  it('damage is ATK − DEF with a −2..+2 roll, never below 1', () => {
    expect(calcDamage(7, 1, always(0.5))).toBe(6)
    expect(calcDamage(7, 1, always(0))).toBe(4)
    expect(calcDamage(7, 1, always(0.99))).toBe(8)
    expect(calcDamage(3, 20, always(0.5))).toBe(1)
  })
})

describe('startBattle', () => {
  it('rolls the group size and names duplicates A, B', () => {
    const pair = fight('mossSlime', always(0.99))
    expect(pair.enemies.map((e) => e.name)).toEqual([
      'Moss Slime A',
      'Moss Slime B',
    ])
    expect(pair.log).toEqual(['2 Moss Slimes appear!'])

    const single = fight('mossSlime', always(0))
    expect(single.enemies).toHaveLength(1)
    expect(single.log).toEqual(['A Moss Slime appears!'])
  })

  it('marks mini-boss fights', () => {
    const boar = fight('thornbackBoar')
    expect(boar.boss).toBe(true)
    expect(boar.log).toEqual(['The Thornback Boar blocks the way!'])
  })
})

describe('takeTurn: attacking', () => {
  it('you hit, then the enemy hits back', () => {
    const { battle, player } = takeTurn(
      fight('mossSlime', always(0)),
      hero(),
      { type: 'attack' },
      steady,
    )
    expect(battle.enemies[0].hp).toBe(12 - 6) // 7 ATK − 1 DEF
    expect(player.hp).toBe(30 - 3) // 6 ATK − 3 DEF
    expect(battle.log.slice(-2)).toEqual([
      'You hit Moss Slime for 6.',
      'Moss Slime hits you for 3.',
    ])
  })

  it('never changes the battle or player it was given', () => {
    const battle = fight('mossSlime', always(0))
    const player = hero()
    takeTurn(battle, player, { type: 'attack' }, steady)
    expect(battle.enemies[0].hp).toBe(12)
    expect(player.hp).toBe(30)
  })

  it('beating every enemy wins and totals the rewards', () => {
    let state = { battle: fight('mossSlime', always(0.99)), player: hero() }
    const strong = { ...state.player, atk: 30 }
    state = takeTurn(
      state.battle,
      strong,
      { type: 'attack', target: 0 },
      steady,
    )
    state = takeTurn(
      state.battle,
      state.player,
      { type: 'attack', target: 1 },
      steady,
    )
    expect(state.battle.phase).toBe('won')
    expect(state.battle.rewards).toEqual({ xp: 12, gold: 6 })
    expect(state.battle.log.at(-1)).toBe('Victory! 12 XP, 6 gold.')
  })

  it('reaching 0 HP loses', () => {
    const { battle, player } = takeTurn(
      fight('thornWolf'),
      hero({ hp: 2 }),
      { type: 'attack' },
      steady,
    )
    expect(player.hp).toBe(0)
    expect(battle.phase).toBe('lost')
    expect(battle.log.at(-1)).toBe('Everything goes dark…')
  })
})

describe('takeTurn: enemy special moves', () => {
  it('Moss Slime sometimes heals instead of attacking', () => {
    const { battle, player } = takeTurn(
      fight('mossSlime', always(0)),
      hero(),
      { type: 'attack' },
      always(0.1), // below the 20% chance
    )
    expect(battle.enemies[0].hp).toBe(12 - 4 + 3) // hit for 4, healed 3
    expect(player.hp).toBe(30)
    expect(battle.log.at(-1)).toBe('The slime soaks up the moss.')
  })

  it('Thornback Boar: attack, warn, then charge for double damage', () => {
    let state = {
      battle: fight('thornbackBoar'),
      player: hero({ hp: 99, maxHp: 99 }),
    }
    const hpAfter = []
    for (let i = 0; i < 3; i++) {
      state = takeTurn(state.battle, state.player, { type: 'attack' }, steady)
      hpAfter.push(state.player.hp)
    }
    // 10 ATK − 3 DEF = 7, then nothing, then 14.
    expect(hpAfter).toEqual([92, 92, 78])
    expect(state.battle.log).toContain('The boar paws the ground…')
    expect(state.battle.log).toContain('The boar charges!')
  })

  it('Shade takes half damage from plain attacks but full from Flare', () => {
    const strong = hero({ atk: 18, light: 5 }) // 20 ATK vs 6 DEF = 14
    const hit = takeTurn(
      fight('shade', always(0)),
      strong,
      { type: 'attack' },
      steady,
    )
    expect(hit.battle.enemies[0].hp).toBe(40 - 7)

    const flare = takeTurn(
      fight('shade', always(0)),
      strong,
      { type: 'skill', skill: 'flare' },
      steady,
    )
    expect(flare.battle.enemies[0].hp).toBe(40 - 21)
  })

  it('Stone Beetle hardens on its first turn, raising DEF by 5', () => {
    const strong = hero({ atk: 18 }) // 20 ATK
    let state = takeTurn(
      fight('stoneBeetle'),
      strong,
      { type: 'attack' },
      steady,
    )
    expect(state.battle.enemies[0].hp).toBe(40 - 10) // 20 − 10 DEF
    expect(state.battle.log.at(-1)).toBe('The beetle hardens its shell.')
    state = takeTurn(state.battle, state.player, { type: 'attack' }, steady)
    expect(state.battle.enemies[0].hp).toBe(30 - 5) // 20 − 15 DEF
  })

  it("Pale Crawler's web makes you lose your next turn", () => {
    let state = {
      battle: fight('paleCrawler'),
      player: hero({ hp: 500, maxHp: 500 }),
    }
    for (let i = 0; i < 4; i++) {
      state = takeTurn(state.battle, state.player, { type: 'attack' }, steady)
    }
    expect(state.battle.stunned).toBe(true)
    const crawlerHp = state.battle.enemies[0].hp
    state = takeTurn(state.battle, state.player, { type: 'attack' }, steady)
    expect(state.battle.enemies[0].hp).toBe(crawlerHp) // no hit landed
    expect(state.battle.log).toContain(
      "You're stuck in the web and can't move!",
    )
    expect(state.battle.stunned).toBe(false)
  })

  it('Cave Bat can drain Light as it attacks', () => {
    const { player } = takeTurn(
      fight('caveBat'),
      hero({ hp: 99, maxHp: 99 }),
      { type: 'attack' },
      always(0.1),
    )
    expect(player.light).toBe(5 - 2 - 2) // two bats, 2 each
  })
})

describe('takeTurn: skills', () => {
  it('Flare costs 2 Light and deals 1.5× damage', () => {
    const { battle, player } = takeTurn(
      fight('thornWolf'),
      hero(),
      { type: 'skill', skill: 'flare' },
      steady,
    )
    expect(player.light).toBe(3)
    expect(battle.enemies[0].hp).toBe(20 - Math.floor(5 * 1.5))
  })

  it('Mend heals 30% of max HP without going over', () => {
    const { player } = takeTurn(
      fight('mossSlime', always(0)),
      hero({ hp: 10 }),
      { type: 'skill', skill: 'mend' },
      steady,
    )
    expect(player.light).toBe(2)
    expect(player.hp).toBe(10 + 9 - 3) // healed 9, then the slime hit for 3
  })

  it('not enough Light does nothing at all', () => {
    const battle = fight('mossSlime', always(0))
    const player = hero({ light: 1 })
    const result = takeTurn(
      battle,
      player,
      { type: 'skill', skill: 'flare' },
      steady,
    )
    expect(result.battle).toBe(battle)
    expect(result.player).toBe(player)
  })

  it('Radiance needs Shrine 2 and hits every enemy', () => {
    const battle = fight('mossSlime', always(0.99))
    const player = hero({ light: 5 })
    const choice = { type: 'skill', skill: 'radiance' }
    expect(takeTurn(battle, player, choice, steady).battle).toBe(battle)

    const lit = takeTurn(battle, player, choice, steady, { shrine2Lit: true })
    expect(lit.battle.enemies.map((e) => e.hp)).toEqual([6, 6])
    expect(lit.player.light).toBe(0)
  })
})

describe('takeTurn: items and fleeing', () => {
  it('a Herb heals 20 and is used up', () => {
    const { player } = takeTurn(
      fight('mossSlime', always(0)),
      hero({ hp: 5, inventory: { herb: 1 } }),
      { type: 'item', item: 'herb' },
      steady,
    )
    expect(player.inventory.herb).toBeUndefined()
    expect(player.hp).toBe(5 + 20 - 3)
  })

  it('fleeing works 60% of the time', () => {
    const away = takeTurn(
      fight('thornWolf'),
      hero(),
      { type: 'flee' },
      always(0.5),
    )
    expect(away.battle.phase).toBe('fled')

    const stuck = takeTurn(
      fight('thornWolf'),
      hero(),
      { type: 'flee' },
      always(0.7),
    )
    expect(stuck.battle.phase).toBe('choose')
    expect(stuck.player.hp).toBeLessThan(30) // the wolf got a turn
  })

  it('there is no fleeing a boss, and it costs no turn', () => {
    const { battle, player } = takeTurn(
      fight('thornbackBoar'),
      hero(),
      { type: 'flee' },
      always(0),
    )
    expect(battle.phase).toBe('choose')
    expect(player.hp).toBe(30)
    expect(battle.log.at(-1)).toBe("There's no running from this one.")
  })

  it('a Smoke Bomb always escapes, but not from a boss', () => {
    const bag = hero({ inventory: { smokeBomb: 1 } })
    const choice = { type: 'item', item: 'smokeBomb' }
    expect(
      takeTurn(fight('thornWolf'), bag, choice, always(0.99)).battle.phase,
    ).toBe('fled')

    const boss = takeTurn(fight('thornbackBoar'), bag, choice, steady)
    expect(boss.battle.phase).toBe('choose')
    expect(boss.player.inventory.smokeBomb).toBe(1)
  })
})

describe('random', () => {
  it('the same seed gives the same rolls', () => {
    const a = createRng(42)
    const b = createRng(42)
    expect([a(), a(), a()]).toEqual([b(), b(), b()])
  })
})
