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

/**
 * `new Date("2026-08-19")`는 UTC 자정으로 해석되는데, KST(UTC+9)에서는 그게 로컬로
 * "08-19 09:00"이 되어버린다 — 날짜 하나짜리 문자열은 로컬 자정으로 파싱하게 만든다.
 */
function parseLocalDate(iso: string): Date {
  return new Date(`${iso}T00:00:00`)
}

/** Inclusive list of calendar dates between two ISO ("YYYY-MM-DD") dates. */
export function dateRange(startIso: string, endIso: string): string[] {
  const start = parseLocalDate(startIso)
  const end = parseLocalDate(endIso)
  const days: string[] = []
  const cursor = new Date(start)
  while (cursor <= end) {
    const yyyy = cursor.getFullYear()
    const mm = String(cursor.getMonth() + 1).padStart(2, "0")
    const dd = String(cursor.getDate()).padStart(2, "0")
    days.push(`${yyyy}-${mm}-${dd}`)
    cursor.setDate(cursor.getDate() + 1)
  }
  return days.length > 0 ? days : [startIso]
}

export function timeLabels(count: number, startIso: string, rng: Rng = Math.random, intervalMin = 37) {
  const base = parseLocalDate(startIso)
  return Array.from({ length: count }, (_, i) => {
    const d = new Date(base)
    d.setMinutes(d.getMinutes() + i * intervalMin)
    const mm = String(d.getMonth() + 1).padStart(2, "0")
    const dd = String(d.getDate()).padStart(2, "0")
    const hh = String(d.getHours()).padStart(2, "0")
    const min = String(d.getMinutes()).padStart(2, "0")
    const ss = String(randomInt(0, 59, rng)).padStart(2, "0")
    return `${mm}-${dd} ${hh}:${min}:${ss}`
  })
}

/**
 * start~end(둘 다 포함) 구간을 `count`개 포인트로 고르게 나눌 때 필요한 분 간격을
 * 계산한다. 예전엔 이 계산 없이 그냥 37분 고정 간격에 60~120개 랜덤 개수를 썼는데,
 * 그러면 조회 기간이 짧을 땐 종료일을 넘겨서 다음 날짜까지 나오고, 반대로 기간이
 * 길면 다 못 채워서 뒷부분 날짜가 잘렸다. 개수는 그대로 두고 간격을 기간에 맞춰
 * 늘이거나 줄이면, 조회 기간이 얼마든 정확히 그 안에서만 데이터가 생성된다.
 */
export function intervalForRange(startIso: string, endIso: string, count: number): number {
  const start = parseLocalDate(startIso)
  const end = parseLocalDate(endIso)
  end.setDate(end.getDate() + 1) // end 날짜 끝(다음날 00:00 직전)까지 포함
  const totalMinutes = (end.getTime() - start.getTime()) / 60000
  return Math.max(1, Math.floor(totalMinutes / count))
}

export function batchNo(seedDate: string, index: number) {
  const digits = seedDate.replaceAll("-", "").slice(2)
  return `${digits}${String(1000 + index)}`
}
