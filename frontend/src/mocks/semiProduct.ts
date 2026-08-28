import { dateRange, pick, randomInt } from "./utils"
import type { SemiProductDatasResponse } from "@/types/semiProduct"

const ITEM_NAMES = ["기층몰탈 A형", "기층몰탈 B형", "성형 반제품 C", "성형 반제품 D"]

export function mockSemiProductData(start: string, end: string): SemiProductDatasResponse {
  const days = dateRange(start, end)
  const graph = days.map((day) => {
    const cycle = randomInt(80, 220)
    return { GET_DATE: day, CYCLECOUNT: cycle, DEFECTIVE: randomInt(0, Math.round(cycle * 0.06)) }
  })
  const totalCycle = graph.reduce((a, r) => a + r.CYCLECOUNT, 0)
  const totalDefective = graph.reduce((a, r) => a + r.DEFECTIVE, 0)

  return {
    status: "success",
    summary_data: [{ CYCLECOUNT: totalCycle, BAD: Math.round(totalDefective * 0.4), DEFECTIVE: totalDefective }],
    graph_data: graph,
    row_data: days.flatMap((day, di) =>
      Array.from({ length: randomInt(1, 4) }, (_, i) => ({
        GET_DATE: day,
        GET_TIME: `${String(randomInt(6, 20)).padStart(2, "0")}:${String(randomInt(0, 59)).padStart(2, "0")}:00`,
        DATA_NAME: `${di + 1}-${i + 1}`,
        ITEM_CD: `SFP-${1000 + di * 10 + i}`,
        ITEM_NM: pick(ITEM_NAMES),
        LOT_NO: `L${day.replaceAll("-", "")}${String(i + 1).padStart(2, "0")}`,
        RESULT: Math.random() > 0.85 ? "NG" : "OK",
        IMG_PATH: "",
        COLOR_DATA: "",
        DEFECT_DATA: "",
      })),
    ),
  }
}
