export function toDateInputValue(date: Date) {
  const y = date.getFullYear()
  const m = String(date.getMonth() + 1).padStart(2, "0")
  const d = String(date.getDate()).padStart(2, "0")
  return `${y}-${m}-${d}`
}

export function defaultDateRange() {
  const end = new Date()
  const start = new Date()
  start.setDate(start.getDate() - 3)
  return { start: toDateInputValue(start), end: toDateInputValue(end) }
}

export function defaultMonthRange() {
  const end = new Date()
  const start = new Date()
  start.setMonth(start.getMonth() - 1)
  return { start: toDateInputValue(start), end: toDateInputValue(end) }
}

/** "YYYY-MM-DD" -> "YYMMDD" */
export function toYYMMDD(isoDate: string) {
  return isoDate.slice(2).replaceAll("-", "")
}

/** "YYYY-MM-DD" -> "YYYYMMDD" */
export function toYYYYMMDD(isoDate: string) {
  return isoDate.replaceAll("-", "")
}

/** "YYYYMMDD" -> "YYYY-MM-DD" (이미 변환된 값은 그대로 둔다) */
export function formatCompactDate(value: string) {
  if (!/^\d{8}$/.test(value)) return value
  return `${value.slice(0, 4)}-${value.slice(4, 6)}-${value.slice(6, 8)}`
}

/** "HHMMSS" -> "HH:MM:SS" (이미 변환된 값은 그대로 둔다) */
export function formatCompactTime(value: string) {
  if (!/^\d{6}$/.test(value)) return value
  return `${value.slice(0, 2)}:${value.slice(2, 4)}:${value.slice(4, 6)}`
}
