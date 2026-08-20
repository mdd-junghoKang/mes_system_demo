import { dateRange, randomBetween, randomInt } from "./utils"
import type { BedrockDatasResponse } from "@/types/bedrock"

// MES 이물검사에서 흔히 쓰는 방식대로, 경고레벨을 이물 크기(cm) 기준값으로 판정한다.
// 실제 기준값은 나중에 백엔드/설비 스펙에 맞춰 조정될 자리표시자다.
const DANGER_THRESHOLD_CM = 3.0

function warningLevelFor(areaCm: number): "DANGER" | "CAUTION" {
  return areaCm >= DANGER_THRESHOLD_CM ? "DANGER" : "CAUTION"
}

export function mockBedrockData(start: string, end: string): BedrockDatasResponse {
  const days = dateRange(start, end)
  const caution = days.map(() => randomInt(0, 6))
  const danger = days.map(() => randomInt(0, 2))
  const totalDanger = danger.reduce((a, b) => a + b, 0)
  const totalCaution = caution.reduce((a, b) => a + b, 0)
  const total = randomInt(400, 900) + totalDanger + totalCaution
  const normal = total - totalDanger - totalCaution

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
    alarm_data: Array.from({ length: Math.min(8, totalDanger + totalCaution) }, () => {
      const areaCm = randomBetween(0.5, 4.5, 2)
      return {
        WARNING_LEVEL: warningLevelFor(areaCm),
        AREA_CM: areaCm,
        TIME_AGO: `${randomInt(1, 55)}분 전`,
      }
    }),
    history_data: days.flatMap((day) =>
      Array.from({ length: randomInt(0, 3) }, () => {
        const areaCm = randomBetween(0.3, 4.8, 2)
        return {
          GET_DATE: day.replaceAll("-", ""),
          GET_TIME: `${String(randomInt(0, 23)).padStart(2, "0")}${String(randomInt(0, 59)).padStart(2, "0")}${String(randomInt(0, 59)).padStart(2, "0")}`,
          AREA_CM: areaCm,
          WARNING_LEVEL: warningLevelFor(areaCm),
          ORIGIN_IMG_FILE_PATH: "",
          RESULT_IMG_FILE_PATH: "",
        }
      }),
    ),
    chart_data: days.map((day, i) => ({
      GET_DATE: day,
      CAUTION_COUNT: caution[i],
      DANGER_COUNT: danger[i],
    })),
  }
}
