export function sleep(ms: number) {
  return new Promise((resolve) => setTimeout(resolve, ms))
}

export function randomBetween(min: number, max: number, digits = 2) {
  const value = Math.random() * (max - min) + min
  return Number(value.toFixed(digits))
}

export function randomInt(min: number, max: number) {
  return Math.floor(Math.random() * (max - min + 1)) + min
}

export function pick<T>(items: readonly T[]): T {
  return items[Math.floor(Math.random() * items.length)]
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

export function timeLabels(count: number, startIso: string) {
  const base = new Date(startIso)
  return Array.from({ length: count }, (_, i) => {
    const d = new Date(base)
    d.setMinutes(d.getMinutes() + i * 37)
    const mm = String(d.getMonth() + 1).padStart(2, "0")
    const dd = String(d.getDate()).padStart(2, "0")
    const hh = String(d.getHours()).padStart(2, "0")
    const min = String(d.getMinutes()).padStart(2, "0")
    const ss = String(randomInt(0, 59)).padStart(2, "0")
    return `${mm}-${dd} ${hh}:${min}:${ss}`
  })
}

export function batchNo(seedDate: string, index: number) {
  const digits = seedDate.replaceAll("-", "").slice(2)
  return `${digits}${String(1000 + index)}`
}
