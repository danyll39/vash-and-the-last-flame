// Battles need dice rolls, but reducers should give the same result
// every time they run (React's Strict Mode runs them twice in dev). So
// components roll a seed with newSeed(), send it in the action, and the
// reducer turns it into a repeatable stream of numbers with createRng().

export function newSeed() {
  return Math.floor(Math.random() * 2 ** 32)
}

// mulberry32: a tiny seeded generator returning floats in [0, 1).
export function createRng(seed = 1) {
  let a = seed >>> 0
  return function rng() {
    a = (a + 0x6d2b79f5) | 0
    let t = Math.imul(a ^ (a >>> 15), 1 | a)
    t = (t + Math.imul(t ^ (t >>> 7), 61 | t)) ^ t
    return ((t ^ (t >>> 14)) >>> 0) / 4294967296
  }
}

// Whole number from min to max, inclusive.
export function randInt(rng, min, max) {
  return min + Math.floor(rng() * (max - min + 1))
}
