import { STATUS_CONFIG, type StatusLevel } from "./status"

/**
 * LOT 카드(발행이력/추적 정전개·역전개)의 Y/N 체크 항목들로 상태 심각도를 정한다 —
 * 전부 Y면 정상, 전부 N이면 위험, 섞여 있으면 주의. 세 페이지가 체크 항목 개수만
 * 다르고(2개 또는 3개) 로직은 같아서 공용으로 뺐다. 실제 색상 값은 status.ts의
 * 공용 토큰을 그대로 쓴다.
 */
export function lotStatusLevel(checks: Array<string | null | undefined>): StatusLevel {
  const yes = checks.filter((c) => c === "Y").length
  if (yes === checks.length) return "normal"
  if (yes === 0) return "danger"
  return "caution"
}

export function lotAccentClass(checks: Array<string | null | undefined>): string {
  return STATUS_CONFIG[lotStatusLevel(checks)].accentClassName
}
