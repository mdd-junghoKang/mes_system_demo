import { dateRange, pick, randomBetween, randomInt } from "./utils"
import type {
  DimensionResponse,
  DistributionsResponse,
  ItemListResponse,
  MaterialMonitoringResponse,
  ProdMonitoringResponse,
  QualitySummaryResponse,
} from "@/types/monitoring"

const ITEM_NAMES = ["BLANDING B01 -TS-", "BLANDING B02 -TS-", "FRONT PANEL A"]

export function mockProdMonitoring(): ProdMonitoringResponse {
  const row: Record<string, number | string> = {
    PLAY_YN: Math.random() > 0.1 ? "Y" : "N",
    HEIGHT: null as unknown as number,
    INJECT_001: "54",
    INJECT_002: pick(ITEM_NAMES),
    INJECT_003: randomInt(10000, 20000),
    INJECT_005: "23",
    INJECT_006: "BLANDING STON 1 8T M",
    INJECT_106: randomBetween(15, 25, 1),
    INJECT_107: randomBetween(1, 4, 1),
    INJECT_193: randomBetween(200, 260, 1),
  }
  for (let tag = 5; tag <= 13; tag++) row[`INJECT_Tag${String(tag).padStart(2, "0")}`] = randomBetween(78, 82, 1)
  for (let m = 202; m <= 211; m++) row[`INJECT_${m}`] = randomBetween(0, 10, 1)

  const now = new Date()
  const graph = (field1: string, field2: string) =>
    Array.from({ length: 20 }, (_, i) => {
      const t = new Date(now)
      t.setMinutes(t.getMinutes() - (20 - i) * 5)
      return {
        INDATE: `${String(t.getHours()).padStart(2, "0")}:${String(t.getMinutes()).padStart(2, "0")}`,
        [field1]: randomBetween(15, 25, 1),
        [field2]: randomBetween(1, 4, 1),
      }
    })

  return {
    status: "success",
    monitoring_list: {
      INJ_MONI: [row as never],
      INJ_MONI_GRAPH_1: graph("INJECT_153", "INJECT_157"),
      INJ_MONI_GRAPH_2: graph("INJECT_106", "INJECT_107"),
    },
  }
}

export function mockItemList(): ItemListResponse {
  return { status: "success", item_list: ITEM_NAMES.map((name) => ({ INJECT_002: name })) }
}

export function mockQualitySummary(): QualitySummaryResponse {
  return {
    status: "success",
    summary: {
      HEIGHT_1_AVG: randomBetween(79, 81, 2),
      HEIGHT_2_AVG: randomBetween(79, 81, 2),
      HEIGHT_3_AVG: randomBetween(79, 81, 2),
      CYCLE_TIME: randomBetween(15, 20, 1),
      PRESS_TIME: randomBetween(1, 3, 1),
      WEIGHT: randomBetween(220, 250, 1),
    },
  }
}

export function mockQualityDimension(start: string, end: string): DimensionResponse {
  const days = dateRange(start, end)
  return {
    status: "success",
    raw: days.map((day) => ({
      INDATE: day,
      HEIGHT_1_AVG: randomBetween(79, 81, 2),
      HEIGHT_2_AVG: randomBetween(79, 81, 2),
      HEIGHT_3_AVG: randomBetween(79, 81, 2),
      WEIGHT: randomBetween(220, 250, 1),
    })),
    limit: { HEIGHT: 80, UCL: 81.5, LCL: 78.5, AVG_VALUE: 80, CPK: randomBetween(1.1, 1.8, 2) },
  }
}

function histogram(min: number, max: number, bins: number, field: string) {
  const step = (max - min) / bins
  return Array.from({ length: bins }, (_, i) => ({
    [field]: Number((min + step * i).toFixed(1)),
    CNT: randomInt(1, 40),
  }))
}

export function mockDistributions(): DistributionsResponse {
  return {
    status: "success",
    cycle: histogram(14, 22, 8, "CYCLE_TIME"),
    press: histogram(1, 4, 6, "PRESS_TIME"),
    height1: histogram(78, 82, 8, "HEIGHT_1_AVG"),
    height2: histogram(78, 82, 8, "HEIGHT_2_AVG"),
    height3: histogram(78, 82, 8, "HEIGHT_3_AVG"),
    weight: histogram(210, 260, 8, "WEIGHT"),
  }
}

const MATERIALS = ["자갈6mm", "모래미장사", "자갈8mm", "석분", "흑시멘트", "조강시멘트", "슬래그파우더", "혼화제면처리제", "감수제", "레드", "블랙", "옐로우"]
const GUBUN_FOR = (name: string) =>
  ["자갈6mm", "모래미장사", "자갈8mm", "석분"].includes(name)
    ? "골재"
    : ["흑시멘트", "조강시멘트", "슬래그파우더"].includes(name)
      ? "시멘트"
      : ["혼화제면처리제", "감수제"].includes(name)
        ? "혼화제"
        : "안료"

export function mockMaterialMonitoring(): MaterialMonitoringResponse {
  const rows = MATERIALS.map((name) => {
    const set = randomBetween(300, 6000, 1)
    const act = Number((set * randomBetween(0.97, 1.03, 4)).toFixed(1))
    return {
      GUBUN: GUBUN_FOR(name),
      MAT_NAME: name,
      SET: set,
      ACT: act,
      DEF: Number((act - set).toFixed(1)),
      DEF_RATE: Number((((act - set) / set) * 100).toFixed(3)),
      ACC_RATE: randomBetween(98, 100.5, 1),
    }
  })

  const sumSet = rows.reduce((a, r) => a + r.SET, 0)
  const sumAct = rows.reduce((a, r) => a + r.ACT, 0)

  const byCategory = (cat: string, key: "SET" | "ACT") =>
    rows.filter((r) => r.GUBUN === cat).reduce((a, r) => a + r[key], 0)

  return {
    status: "success",
    monitoring_list: {
      SUMMARY: [
        {
          SUM_SET: Number(sumSet.toFixed(1)),
          SUM_ACT: Number(sumAct.toFixed(1)),
          SUM_DEF: Number((sumAct - sumSet).toFixed(1)),
          SUM_DEFRATE: Number((((sumAct - sumSet) / sumSet) * 100).toFixed(3)),
          QTY_MAT: rows.length,
        },
      ],
      GRAPH1: [
        {
          골재류_SET: byCategory("골재", "SET"),
          골재류_ACT: byCategory("골재", "ACT"),
          시멘트류_SET: byCategory("시멘트", "SET"),
          시멘트류_ACT: byCategory("시멘트", "ACT"),
          혼화제_SET: byCategory("혼화제", "SET"),
          혼화제_ACT: byCategory("혼화제", "ACT"),
          안료_SET: byCategory("안료", "SET"),
          안료_ACT: byCategory("안료", "ACT"),
        },
      ],
      GRAPH2: rows.map((r) => ({ MAT_NAME: r.MAT_NAME, DEF_RATE: r.DEF_RATE })),
      ROW: rows,
    },
  }
}
