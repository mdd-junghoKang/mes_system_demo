export function sleep(ms: number) {
  return new Promise((resolve) => setTimeout(resolve, ms))
}

export type Rng = () => number

/** Deterministic PRNG so the same seed always produces the same sequence. */
function mulberry32(seed: number): Rng {
  let a = seed
  return function () {
    a |= 0
    a = (a + 0x6d2b79f5) | 0
    let t = Math.imul(a ^ (a >>> 15), 1 | a)
    t = (t + Math.imul(t ^ (t >>> 7), 61 | t)) ^ t
    return ((t ^ (t >>> 14)) >>> 0) / 4294967296
  }
}

function hashString(str: string): number {
  let hash = 0
  for (let i = 0; i < str.length; i++) {
    hash = (Math.imul(31, hash) + str.charCodeAt(i)) | 0
  }
  return hash
}

/**
 * Creates a seeded RNG so repeated mock calls with the same query params
 * (date/line/etc.) return the same values instead of re-randomizing on
 * every refetch. Pass the query key parts joined into one string.
 */
export function createRng(seed: string): Rng {
  return mulberry32(hashString(seed))
}

export function randomBetween(min: number, max: number, digits = 2, rng: Rng = Math.random) {
  const value = rng() * (max - min) + min
  return Number(value.toFixed(digits))
}

export function randomInt(min: number, max: number, rng: Rng = Math.random) {
  return Math.floor(rng() * (max - min + 1)) + min
}

export function pick<T>(items: readonly T[], rng: Rng = Math.random): T {
  return items[Math.floor(rng() * items.length)]
}

/** Inclusive list of calendar dates between two ISO ("YYYY-MM-DD") dates. */
export function dateRange(startIso: string, endIso: string): string[] {
  const start = new Date(startIso)
  const end = new Date(endIso)
  const days: string[] = []
  const cursor = new Date(start)
  while (cursor <= end) {
    days.push(cursor.toISOString().slice(0, 10))
    cursor.setDate(cursor.getDate() + 1)
  }
  return days.length > 0 ? days : [startIso]
}

export function timeLabels(count: number, startIso: string, rng: Rng = Math.random) {
  const base = new Date(startIso)
  return Array.from({ length: count }, (_, i) => {
    const d = new Date(base)
    d.setMinutes(d.getMinutes() + i * 37)
    const mm = String(d.getMonth() + 1).padStart(2, "0")
    const dd = String(d.getDate()).padStart(2, "0")
    const hh = String(d.getHours()).padStart(2, "0")
    const min = String(d.getMinutes()).padStart(2, "0")
    const ss = String(randomInt(0, 59, rng)).padStart(2, "0")
    return `${mm}-${dd} ${hh}:${min}:${ss}`
  })
}

export function batchNo(seedDate: string, index: number) {
  const digits = seedDate.replaceAll("-", "").slice(2)
  return `${digits}${String(1000 + index)}`
}
