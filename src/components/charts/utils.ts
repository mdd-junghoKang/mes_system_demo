/**
 * Chart.js의 `ticks.maxTicksLimit`에 대응하는 Recharts `XAxis interval` 값.
 * Recharts는 "몇 개까지 표시"가 아니라 "몇 개를 건너뛸지"를 받으므로 변환이 필요하다.
 */
export function tickInterval(count: number, maxTicks: number) {
  if (count <= maxTicks) return 0
  return Math.ceil(count / maxTicks) - 1
}

/**
 * 값 범위에 15% 여백을 준 Y축 domain. 예전엔 항상 정수로 반올림했는데, 5.3~5.9처럼
 * 1 미만 소수 단위로 촘촘한 데이터에 정수 반올림([5,6])을 적용하면 여전히 여백이
 * 남는다. 데이터 범위 크기에 맞는 자리수(step)로 반올림해서 더 촘촘하게 맞춘다.
 */
export function paddedDomain(values: number[]): [number, number] {
  if (values.length === 0) return [0, 1]
  const min = Math.min(...values)
  const max = Math.max(...values)
  const range = max - min
  const padding = Math.max(range * 0.15, 0.1)
  const step = Math.pow(10, Math.floor(Math.log10(padding)))
  // step 나눗셈은 부동소수점 오차(5.300000000000001 등)를 남기고, 그 값이 축 눈금에
  // 그대로 노출되면 좁은 축 폭 안에서 숫자가 길게 잘려 보인다. step의 자리수만큼 반올림한다.
  const decimals = Math.max(0, -Math.floor(Math.log10(step)))
  const lo = Number((Math.floor((min - padding) / step) * step).toFixed(decimals))
  const hi = Number((Math.ceil((max + padding) / step) * step).toFixed(decimals))
  return [lo, hi]
}

// "08-17 09:00:57"(mock의 MM-DD 형식)와 "2026-08-17 09:00:00"(YYYY-MM-DD 형식) 둘 다 받는다.
// 연도가 있으면 앞 두 자리(세기)는 버리고 "YY-MM-DD"로 줄인다 — "2026"까지 다 보여줄
// 필요는 없다.
const SHORT_DATE_TIME_RE = /^(\d{2}-\d{2}) (\d{2}:\d{2})(?::\d{2})?$/
const FULL_DATE_TIME_RE = /^\d{2}(\d{2}-\d{2}-\d{2}) (\d{2}:\d{2})(?::\d{2})?$/

function matchDateTime(label: string) {
  return label.match(FULL_DATE_TIME_RE) ?? label.match(SHORT_DATE_TIME_RE)
}

/** `items`에서 최대 `maxCount`개를 간격이 고르게 되도록 뽑는다(그 이하면 전부 반환). */
function sampleEvenly<T>(items: T[], maxCount: number): T[] {
  if (items.length <= maxCount) return items
  const step = (items.length - 1) / (maxCount - 1)
  return Array.from({ length: maxCount }, (_, i) => items[Math.round(i * step)])
}

/**
 * "MM-DD HH:MM(:SS)?" / "YYYY-MM-DD HH:MM(:SS)?" 라벨에서 실제 눈금으로 쓸 값과 그
 * 표시 형식(날짜만 / 시간만)을 함께 정한다. recharts의 `interval`에 맡기면 그냥 행
 * 개수 기준으로 균등 추출하는 거라, 같은 날짜가 여러 눈금에 중복으로 찍히거나(예:
 * "08-17"이 두 번) 반대로 하루가 통째로 비는 경우가 생긴다. 대신 "날짜 하나당 눈금
 * 하나"를 기본으로 삼는다:
 * - 날짜 종류가 maxTicks 이하면 그 날짜들을 전부 눈금으로 쓴다 (예: 4일치 조회면 4개).
 * - maxTicks를 넘으면 날짜 목록 자체를 maxTicks개로 고르게 추려서 쓴다.
 * - 날짜가 하루뿐이면(상세 페이지처럼 하루치만 보는 경우) 날짜 표시는 의미가 없으니
 *   시간을 최대 maxTicks개 고르게 뽑아 보여준다.
 * 형식이 안 맞는 라벨이 하나라도 있으면 원래 행 개수 기준 균등 추출로 되돌아간다.
 */
export function buildDateTimeTicks(
  labels: string[],
  maxTicks = 5,
): { ticks: string[]; format: (label: string) => string } {
  const matches = labels.map(matchDateTime)
  if (matches.some((m) => !m)) {
    const indices = sampleEvenly(
      labels.map((_, i) => i),
      maxTicks,
    )
    return { ticks: indices.map((i) => labels[i]), format: (label) => label }
  }

  const firstIndexByDate = new Map<string, number>()
  matches.forEach((m, i) => {
    const date = m![1]
    if (!firstIndexByDate.has(date)) firstIndexByDate.set(date, i)
  })
  const distinctDates = [...firstIndexByDate.keys()]

  if (distinctDates.length <= 1) {
    const indices = sampleEvenly(
      labels.map((_, i) => i),
      maxTicks,
    )
    return {
      ticks: indices.map((i) => labels[i]),
      format: (label) => matchDateTime(label)?.[2] ?? label,
    }
  }

  const chosenDates = sampleEvenly(distinctDates, maxTicks)
  const indices = chosenDates.map((d) => firstIndexByDate.get(d)!)
  return {
    ticks: indices.map((i) => labels[i]),
    format: (label) => matchDateTime(label)?.[1] ?? label,
  }
}

export const AXIS_TICK = { fontSize: 11, fill: "#6b7280" } as const
export const GRID_STROKE = "#e5e7eb"
export const LEGEND_STYLE = { fontSize: 11 } as const
