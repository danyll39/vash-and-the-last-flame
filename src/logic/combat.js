import { ENEMIES } from '../data/enemies.js'
import { ITEMS } from '../data/items.js'
import { SKILLS } from '../data/skills.js'
import { randInt } from './random.js'

export const FLEE_CHANCE = 0.6
const LOG_LIMIT = 6

// ---------- Stats ----------

export function attackPower(player) {
  return player.atk + (ITEMS[player.weapon]?.atk ?? 0)
}

export function defensePower(player) {
  return player.def + (ITEMS[player.armor]?.def ?? 0)
}

// README section 3: max(1, ATK − DEF + random(−2..2)).
export function calcDamage(atk, def, rng) {
  return Math.max(1, atk - def + randInt(rng, -2, 2))
}

function enemyDefense(enemy) {
  const data = ENEMIES[enemy.enemyId]
  const hardened = enemy.hardTurns > 0 ? data.special.amount : 0
  return data.def + hardened
}

export function livingEnemies(battle) {
  return battle.enemies.filter((enemy) => enemy.hp > 0)
}

export function canUseSkill(skillId, player, flags = {}) {
  const skill = SKILLS[skillId]
  if (skill.requires && !flags[skill.requires]) return false
  return player.light >= skill.cost
}

// ---------- Starting a battle ----------

export function startBattle(enemyId, rng, source = null) {
  const data = ENEMIES[enemyId]
  const [min, max] = data.group ?? [1, 1]
  const count = randInt(rng, min, max)

  const enemies = Array.from({ length: count }, (_, i) => ({
    uid: i,
    enemyId,
    name: count > 1 ? `${data.name} ${'ABC'[i]}` : data.name,
    hp: data.hp,
    maxHp: data.hp,
    t: 0, // how many turns this enemy has taken
    hardTurns: 0,
  }))

  const intro = data.boss
    ? `The ${data.name} blocks the way!`
    : count > 1
      ? `${count} ${data.name}s appear!`
      : `A ${data.name} appears!`

  return {
    enemies,
    boss: Boolean(data.boss),
    source, // which map object started this, so a win can remove it
    phase: 'choose', // 'choose' | 'won' | 'lost' | 'fled'
    stunned: false, // set by the Pale Crawler's web
    rewards: null,
    log: [intro],
  }
}

// ---------- The player's turn ----------

function pickTarget(battle, uid) {
  const living = livingEnemies(battle)
  return living.find((enemy) => enemy.uid === uid) ?? living[0]
}

function hitEnemy(enemy, damage, log) {
  enemy.hp = Math.max(0, enemy.hp - damage)
  if (enemy.hp === 0) log(`${enemy.name} is defeated!`)
}

// Returns 'ok' (turn used), 'invalid' (nothing happens), 'free' (a
// message, but the enemies don't act) or 'fled'.
function playerAction(battle, player, choice, rng, flags, log) {
  switch (choice.type) {
    case 'attack': {
      const target = pickTarget(battle, choice.target)
      let damage = calcDamage(attackPower(player), enemyDefense(target), rng)
      if (ENEMIES[target.enemyId].special?.effect === 'halfPhysical') {
        damage = Math.max(1, Math.floor(damage / 2))
      }
      log(`You hit ${target.name} for ${damage}.`)
      hitEnemy(target, damage, log)
      return 'ok'
    }

    case 'skill': {
      if (!canUseSkill(choice.skill, player, flags)) return 'invalid'
      player.light -= SKILLS[choice.skill].cost

      if (choice.skill === 'flare') {
        const target = pickTarget(battle, choice.target)
        const roll = calcDamage(attackPower(player), enemyDefense(target), rng)
        const damage = Math.floor(roll * 1.5)
        log(`Flare! ${target.name} takes ${damage}.`)
        hitEnemy(target, damage, log)
      } else if (choice.skill === 'mend') {
        const heal = Math.min(
          Math.floor(player.maxHp * 0.3),
          player.maxHp - player.hp,
        )
        player.hp += heal
        log(`Mend restores ${heal} HP.`)
      } else if (choice.skill === 'radiance') {
        log('Radiance!')
        for (const target of livingEnemies(battle)) {
          const damage = calcDamage(
            attackPower(player),
            enemyDefense(target),
            rng,
          )
          log(`${target.name} takes ${damage}.`)
          hitEnemy(target, damage, log)
        }
      }
      return 'ok'
    }

    case 'item': {
      const item = ITEMS[choice.item]
      if (!item || !player.inventory[choice.item]) return 'invalid'
      const { effect } = item

      if (effect.flee && battle.boss) {
        log("There's no running from this one.")
        return 'free'
      }

      player.inventory[choice.item] -= 1
      if (player.inventory[choice.item] === 0) {
        delete player.inventory[choice.item]
      }
      log(`You use a ${item.name}.`)

      if (effect.flee) {
        log('You got away!')
        return 'fled'
      }
      if (effect.hp) {
        const target =
          effect.hp === 'full' ? player.maxHp : player.hp + effect.hp
        const healed = Math.min(target, player.maxHp) - player.hp
        player.hp += healed
        log(`+${healed} HP.`)
      }
      if (effect.light) {
        const target =
          effect.light === 'full'
            ? player.maxLight
            : player.light + effect.light
        const gained = Math.min(target, player.maxLight) - player.light
        player.light += gained
        log(`+${gained} Light.`)
      }
      return 'ok'
    }

    case 'flee': {
      if (battle.boss) {
        log("There's no running from this one.")
        return 'free'
      }
      if (rng() < FLEE_CHANCE) {
        log('You got away!')
        return 'fled'
      }
      log("Couldn't escape!")
      return 'ok'
    }

    default:
      return 'invalid'
  }
}

// ---------- The enemies' turn ----------

function enemyAct(enemy, battle, player, rng, log) {
  const data = ENEMIES[enemy.enemyId]
  const special = data.special ?? {}
  enemy.t += 1
  if (enemy.hardTurns > 0) enemy.hardTurns -= 1

  // every: harden or web on a fixed schedule, instead of attacking.
  if (
    special.type === 'every' &&
    enemy.t >= special.startTurn &&
    (enemy.t - special.startTurn) % special.every === 0
  ) {
    if (special.effect === 'harden') enemy.hardTurns = special.turns
    if (special.effect === 'web') battle.stunned = true
    log(special.text)
    return
  }

  let multiplier = 1

  // cycle: attack, warn (no attack), big hit, and repeat.
  if (special.type === 'cycle') {
    const step = ((enemy.t - 1) % special.length) + 1
    if (step === special.warnTurn) {
      log(special.warnText)
      return
    }
    if (step === special.hitTurn) {
      multiplier = special.multiplier
      if (special.hitText) log(special.hitText)
    }
  }

  if (special.type === 'chance' && rng() < special.chance) {
    if (special.effect === 'heal') {
      enemy.hp = Math.min(enemy.maxHp, enemy.hp + special.amount)
      log(special.text)
      return
    }
    if (special.effect === 'multiplier') {
      multiplier = special.multiplier
      log(special.text)
    }
    if (special.effect === 'drainLight') {
      player.light = Math.max(0, player.light - special.amount)
      log(special.text)
    }
  }

  const damage = Math.floor(
    multiplier * calcDamage(data.atk, defensePower(player), rng),
  )
  player.hp = Math.max(0, player.hp - damage)
  log(`${enemy.name} hits you for ${damage}.`)
}

function rewardsFor(battle) {
  return battle.enemies.reduce(
    (total, enemy) => ({
      xp: total.xp + ENEMIES[enemy.enemyId].xp,
      gold: total.gold + ENEMIES[enemy.enemyId].gold,
    }),
    { xp: 0, gold: 0 },
  )
}

// ---------- One full round ----------

// The player acts, then every living enemy acts. Returns new copies of
// the battle and player; the originals are never changed.
export function takeTurn(battle, player, choice, rng, flags = {}) {
  if (battle.phase !== 'choose') return { battle, player }

  const next = {
    ...battle,
    enemies: battle.enemies.map((enemy) => ({ ...enemy })),
  }
  const hero = { ...player, inventory: { ...player.inventory } }
  const lines = []
  const log = (line) => lines.push(line)
  const done = () => ({
    battle: { ...next, log: [...battle.log, ...lines].slice(-LOG_LIMIT) },
    player: hero,
  })

  if (next.stunned) {
    next.stunned = false
    log("You're stuck in the web and can't move!")
  } else {
    const result = playerAction(next, hero, choice, rng, flags, log)
    if (result === 'invalid') return { battle, player }
    if (result === 'free') return done()
    if (result === 'fled') {
      next.phase = 'fled'
      return done()
    }
  }

  if (livingEnemies(next).length === 0) {
    next.phase = 'won'
    next.rewards = rewardsFor(next)
    log(`Victory! ${next.rewards.xp} XP, ${next.rewards.gold} gold.`)
    return done()
  }

  for (const enemy of livingEnemies(next)) {
    enemyAct(enemy, next, hero, rng, log)
    if (hero.hp === 0) {
      next.phase = 'lost'
      log('Everything goes dark…')
      break
    }
  }
  return done()
}
