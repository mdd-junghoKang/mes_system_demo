import { createRng, dateRange, randomBetween, randomInt } from "./utils"
import type { BedrockDatasResponse } from "@/types/bedrock"

// MES 이물검사에서 흔히 쓰는 방식대로, 경고레벨을 이물 크기(cm) 기준값으로 판정한다.
// 실제 기준값은 나중에 백엔드/설비 스펙에 맞춰 조정될 자리표시자다.
const DANGER_THRESHOLD_CM = 3.0

function warningLevelFor(areaCm: number): "DANGER" | "CAUTION" {
  return areaCm >= DANGER_THRESHOLD_CM ? "DANGER" : "CAUTION"
}

function formatTimeAgo(now: Date, at: Date): string {
  const diffMin = Math.max(1, Math.round((now.getTime() - at.getTime()) / 60000))
  if (diffMin < 60) return `${diffMin}분 전`
  const diffHour = Math.round(diffMin / 60)
  if (diffHour < 24) return `${diffHour}시간 전`
  return `${Math.round(diffHour / 24)}일 전`
}

export function mockBedrockData(start: string, end: string): BedrockDatasResponse {
  const rng = createRng(`bedrock|${start}|${end}`)
  const days = dateRange(start, end)
  const now = new Date()

  // 이물 감지 이벤트를 하나의 목록으로만 만들고, 상태 요약/차트/알람 피드/카드
  // 이력을 전부 이 목록에서 파생시킨다. 예전엔 이 네 가지를 각자 따로
  // randomBetween/randomInt로 생성해서 — 알람 피드에 뜬 값이 아래 카드 목록에는
  // 없고, 차트의 위험·주의 건수와 실제 카드 개수도 서로 안 맞는 문제가 있었다.
  const events = days.flatMap((day) =>
    Array.from({ length: randomInt(0, 3, rng) }, () => {
      const areaCm = randomBetween(0.3, 4.8, 2, rng)
      const hh = randomInt(0, 23, rng)
      const mm = randomInt(0, 59, rng)
      const ss = randomInt(0, 59, rng)
      const at = new Date(
        `${day}T${String(hh).padStart(2, "0")}:${String(mm).padStart(2, "0")}:${String(ss).padStart(2, "0")}`,
      )
      return {
        at,
        GET_DATE: day.replaceAll("-", ""),
        GET_TIME: `${String(hh).padStart(2, "0")}${String(mm).padStart(2, "0")}${String(ss).padStart(2, "0")}`,
        AREA_CM: areaCm,
        WARNING_LEVEL: warningLevelFor(areaCm),
      }
    }),
  )

  const totalDanger = events.filter((e) => e.WARNING_LEVEL === "DANGER").length
  const totalCaution = events.filter((e) => e.WARNING_LEVEL === "CAUTION").length
  const total = randomInt(400, 900, rng) + totalDanger + totalCaution
  const normal = total - totalDanger - totalCaution

  const mostRecentFirst = [...events].sort((a, b) => b.at.getTime() - a.at.getTime())

  return {
    status: "success",
    status_data: {
      NORMAL_RATE: Number(((normal / total) * 100).toFixed(3)),
      CAUTION_RATE: Number(((totalCaution / total) * 100).toFixed(3)),
      DANGER_RATE: Number(((totalDanger / total) * 100).toFixed(3)),
      TOTAL_COUNT: total,
      NORMAL_COUNT: normal,
      CAUTION_COUNT: totalCaution,
      DANGER_COUNT: totalDanger,
    },
    alarm_data: mostRecentFirst.slice(0, 8).map((e) => ({
      WARNING_LEVEL: e.WARNING_LEVEL,
      AREA_CM: e.AREA_CM,
      TIME_AGO: formatTimeAgo(now, e.at),
    })),
    history_data: events.map((e) => ({
      GET_DATE: e.GET_DATE,
      GET_TIME: e.GET_TIME,
      AREA_CM: e.AREA_CM,
      WARNING_LEVEL: e.WARNING_LEVEL,
      ORIGIN_IMG_FILE_PATH: "",
      RESULT_IMG_FILE_PATH: "",
    })),
    chart_data: days.map((day) => {
      const dayKey = day.replaceAll("-", "")
      return {
        GET_DATE: day,
        CAUTION_COUNT: events.filter((e) => e.GET_DATE === dayKey && e.WARNING_LEVEL === "CAUTION").length,
        DANGER_COUNT: events.filter((e) => e.GET_DATE === dayKey && e.WARNING_LEVEL === "DANGER").length,
      }
    }),
  }
}
