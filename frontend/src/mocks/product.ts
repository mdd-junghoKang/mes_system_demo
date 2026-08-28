import { dateRange, pick, randomInt } from "./utils"
import type { ProductDatasResponse } from "@/types/product"

const ITEM_NAMES = ["완제품 6mm형", "완제품 8mm형", "완제품 10mm형"]

export function mockProductData(start: string, end: string): ProductDatasResponse {
  const days = dateRange(start, end)
  const graph = days.map((day) => {
    const cycle = randomInt(60, 180)
    return { GET_DATE: day, CYCLECOUNT: cycle, LOTNG: randomInt(0, Math.round(cycle * 0.04)) }
  })
  const totalCycle = graph.reduce((a, r) => a + r.CYCLECOUNT, 0)
  const totalNg = graph.reduce((a, r) => a + r.LOTNG, 0)

  return {
    status: "success",
    summary_data: [{ CYCLECOUNT: totalCycle, LOTOK: totalCycle - totalNg, LOTNG: totalNg }],
    graph_data: graph,
    row_data: days.flatMap((day, di) =>
      Array.from({ length: randomInt(1, 3) }, (_, i) => ({
        ID: di * 10 + i + 1,
        GET_DATE: day,
        GET_TIME: `${String(randomInt(6, 20)).padStart(2, "0")}:${String(randomInt(0, 59)).padStart(2, "0")}:00`,
        LOT_NO: `L${day.replaceAll("-", "")}${String(i + 1).padStart(2, "0")}`,
        ITEM_CD: `FP-${2000 + di * 10 + i}`,
        ITEM_NM: pick(ITEM_NAMES),
        ORIGIN_IMG_FILE_PATH: "",
      })),
    ),
  }
}
