import { randomBetween, randomInt, timeLabels, dateRange, batchNo } from "./utils"
import type { AggGraphResponse, AssembleRateResponse, AggInfoResponse } from "@/types/dashboard"
import type {
  AggregateHistoryResponse,
  AssembleGraphDataResponse,
  BatchInfoRow,
  GradationGraphResponse,
} from "@/types/aggregate"

export const MOCK_LINES: AggInfoResponse["agg_info"] = [
  { LINE_INFO: "LINE_01", AGG_INFO: "6mm", USE_YN: "Y" },
  { LINE_INFO: "LINE_03", AGG_INFO: "8mm", USE_YN: "Y" },
  { LINE_INFO: "LINE_04", AGG_INFO: "8mm", USE_YN: "Y" },
  { LINE_INFO: "LINE_05", AGG_INFO: "석분", USE_YN: "Y" },
  { LINE_INFO: "LINE_06", AGG_INFO: "석분", USE_YN: "Y" },
  { LINE_INFO: "LINE_07", AGG_INFO: "10mm", USE_YN: "Y" },
]

export function mockAggInfo(): AggInfoResponse {
  return { agg_info: MOCK_LINES }
}

export function mockAssembleRate(): AssembleRateResponse {
  return {
    assemble_rates: [
      { FINENESS_MODULUS: randomBetween(5.5, 5.75), SHAPE_INDEX: randomBetween(59, 64) },
    ],
  }
}

export function mockAggGraph(start: string, _end: string): AggGraphResponse {
  const labels = timeLabels(randomInt(60, 120), start)
  const lowA = 5.55
  const highA = 5.85
  return {
    graph_data: {
      graph_a: labels.map((t, i) => [i, t, randomBetween(lowA + 0.05, highA - 0.05, 2)]),
      graph_p: labels.map((t, i) => [i, t, randomBetween(58, 65, 2)]),
    },
    assemble_data: { low_line: lowA, high_line: highA },
  }
}

export function mockAggregateHistory(start: string, end: string): AggregateHistoryResponse {
  const days = dateRange(start, end)
  return {
    status: "success",
    history_data: days.map((day, i) => {
      const aAvg = randomBetween(5.55, 5.72)
      const pAvg = randomBetween(60, 63)
      return {
        BATCH_NO: batchNo(day, i),
        GETHERING_TIME: `${day} ${String(randomInt(6, 18)).padStart(2, "0")}:${String(randomInt(0, 59)).padStart(2, "0")}:${String(randomInt(0, 59)).padStart(2, "0")}`,
        A_AVG_VALUE: aAvg,
        A_MAX_VALUE: Number((aAvg + randomBetween(0.05, 0.15)).toFixed(2)),
        A_MIN_VALUE: Number((aAvg - randomBetween(0.05, 0.15)).toFixed(2)),
        P_AVG_VALUE: pAvg,
        P_MAX_VALUE: Number((pAvg + randomBetween(1, 3)).toFixed(2)),
        P_MIN_VALUE: Number((pAvg - randomBetween(1, 3)).toFixed(2)),
      }
    }),
  }
}

export function mockLookupAssembleRate(): AssembleRateResponse {
  return mockAssembleRate()
}

export function mockBatchInfo(date: string): BatchInfoRow[] {
  return Array.from({ length: randomInt(8, 16) }, (_, i) => {
    const avg = randomBetween(5.5, 5.75)
    return {
      BATCH_NO: batchNo(date, i),
      GETHERING_TIME: `${date} ${String(randomInt(6, 18)).padStart(2, "0")}:${String(i).padStart(2, "0")}:00`,
      AVG_VALUE: avg,
      MAX_VALUE: Number((avg + 0.1).toFixed(2)),
      MIN_VALUE: Number((avg - 0.1).toFixed(2)),
    }
  })
}

export function mockAssembleGraphData(assembleType: "A" | "P" | "select-none", date: string): AssembleGraphDataResponse {
  const points = randomInt(20, 40)
  const isA = assembleType === "A"
  return {
    status: "success",
    graph_data: Array.from({ length: points }, (_, i) => ({
      GETHERING_TIME: `${date} ${String(6 + Math.floor((i / points) * 12)).padStart(2, "0")}:${String((i * 7) % 60).padStart(2, "0")}:00`,
      AVG_VALUE: isA ? randomBetween(5.55, 5.75) : randomBetween(59, 64),
    })),
    assemble_data: isA ? { low_line: 5.55, high_line: 5.85 } : undefined,
  }
}

const SIEVE_KEYS = [
  "PASS_00_15",
  "PASS_00_30",
  "PASS_00_60",
  "PASS_01_20",
  "PASS_02_25",
  "PASS_05_00",
  "PASS_10_00",
] as const

function mockSieveCurve() {
  // Roughly increasing pass-rate curve, matching real gradation shapes
  return {
    PASS_00_15: 0,
    PASS_00_30: 0,
    PASS_00_60: 0,
    PASS_01_20: randomBetween(0, 1),
    PASS_02_25: randomBetween(0.5, 4),
    PASS_05_00: randomBetween(28, 55),
    PASS_10_00: 100,
  }
}

export function mockGradationCurve(date: string, batchNoParam: string | null): GradationGraphResponse {
  if (batchNoParam) {
    const curve = mockSieveCurve()
    return {
      status: "success",
      single_batch: SIEVE_KEYS.map((k) => curve[k]),
      low_data_list: ["L", 0, 0, 0, 0, 0, 20, 100, 5.55] as unknown as number[],
      high_data_list: ["H", 1, 3, 4, 5, 10, 60, 100, 5.85] as unknown as number[],
    }
  }

  return {
    status: "success",
    avg_data_list: Array.from({ length: randomInt(40, 70) }, (_, i) => ({
      BATCH_NO: Number(batchNo(date, i)),
      ...mockSieveCurve(),
    })),
    low_data_list: ["L", 0, 0, 0, 0, 0, 20, 100, 5.55] as unknown as number[],
    high_data_list: ["H", 1, 3, 4, 5, 10, 60, 100, 5.85] as unknown as number[],
  }
}

export function mockImageRows() {
  return {
    image_rows: Array.from({ length: 6 }, () => ({
      real_path: "",
      ai_path: "",
    })),
  }
}
