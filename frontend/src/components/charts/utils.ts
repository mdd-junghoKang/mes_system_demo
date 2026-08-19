/**
 * Chart.js의 `ticks.maxTicksLimit`에 대응하는 Recharts `XAxis interval` 값.
 * Recharts는 "몇 개까지 표시"가 아니라 "몇 개를 건너뛸지"를 받으므로 변환이 필요하다.
 */
export function tickInterval(count: number, maxTicks: number) {
  if (count <= maxTicks) return 0
  return Math.ceil(count / maxTicks) - 1
}

/** 값 범위에 15% 여백을 준 Y축 domain. Chart.js 시절 각 차트가 중복 계산하던 로직. */
export function paddedDomain(values: number[]): [number, number] {
  if (values.length === 0) return [0, 1]
  const min = Math.min(...values)
  const max = Math.max(...values)
  const padding = Math.max((max - min) * 0.15, 0.1)
  return [Math.floor(min - padding), Math.ceil(max + padding)]
}

export const AXIS_TICK = { fontSize: 11, fill: "#6b7280" } as const
export const GRID_STROKE = "#e5e7eb"
export const LEGEND_STYLE = { fontSize: 11 } as const
