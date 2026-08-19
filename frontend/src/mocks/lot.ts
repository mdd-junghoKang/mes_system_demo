import { dateRange, pick, randomBetween, randomInt } from "./utils"
import type { FlowTrackingResponse, LotTrackingResponse } from "@/types/lot"
import type {
  AggCardRow,
  CardGubun,
  CuringCardRow,
  FpCardRow,
  MixCardRow,
  MoldCardRow,
  SfpCardRow,
} from "@/types/lotCardData"

const ITEM_NAMES = ["6mm 골재블록", "8mm 골재블록", "10mm 골재블록"]
const YN = ["Y", "N"] as const

export function mockLotList(start: string, end: string, lotNo: string): LotTrackingResponse {
  const days = dateRange(start, end)
  const rows = days.flatMap((day, di) =>
    Array.from({ length: randomInt(1, 3) }, (_, i) => {
      const lot = `L${day.replaceAll("-", "")}${String(i + 1).padStart(2, "0")}`
      return {
        WORK_DATE: day,
        LOT_NO: lot,
        MIX_NO: `MIX-${1000 + di * 10 + i}`,
        ITEM_CD: `ITM-${3000 + di}`,
        ITEM_NM: pick(ITEM_NAMES),
        ORDER_NO: `ORD-${4000 + di * 10 + i}`,
        COLOR_QUALITY: pick(YN),
        CURING_LOG: `${randomInt(18, 32)}℃`,
        APPEARANCE_QUALITY: pick(YN),
        FINISHED_LOT: pick(YN),
      }
    }),
  )
  const filtered = lotNo ? rows.filter((r) => r.LOT_NO.includes(lotNo)) : rows
  return { status: "success", lot_tracking_list: filtered, mix_tracking_list: filtered }
}

const FLOW_TYPE_SAMPLES: Record<string, string[]> = {
  "001": ["조립률", "입형률"],
  "002": ["설정량", "실제량"],
  "003": ["중량", "두께"],
  "004": ["OK/NG", "검사시각"],
  "005": ["ZONE 평균온도"],
  "006": ["인식률"],
  "007": ["검사시각", "결과"],
}

export function mockFlowTracking(_lotNo: string): FlowTrackingResponse {
  const rows = Object.entries(FLOW_TYPE_SAMPLES).flatMap(([gubun, types]) =>
    types.map((type) => ({
      GUBUN: gubun,
      TYPE: type,
      VALUE: `${randomBetween(1, 100, 1)}`,
    })),
  )
  return { status: "success", lot_flow_list: rows }
}

function mockAggCard(): AggCardRow[] {
  return Array.from({ length: 4 }, (_, i) => ({
    LINE_INFO: `LINE_0${i + 1}`,
    BATCH_NO: `B-${1000 + i}`,
    A_AVG_VALUE: randomBetween(5.5, 5.75),
    A_MAX_VALUE: randomBetween(5.75, 5.9),
    A_MIN_VALUE: randomBetween(5.3, 5.5),
    P_AVG_VALUE: randomBetween(59, 64),
    P_MAX_VALUE: randomBetween(64, 68),
    P_MIN_VALUE: randomBetween(54, 59),
  }))
}

const MATERIALS = ["자갈6mm", "모래미장사", "자갈8mm", "석분", "흑시멘트", "조강시멘트", "혼화제면처리제", "감수제"]

function mockMixCard(): MixCardRow[] {
  return MATERIALS.map((name, i) => {
    const set = randomBetween(500, 6000, 1)
    const act = Number((set * randomBetween(0.97, 1.03, 4)).toFixed(1))
    return {
      GUBUN: i < 4 ? "골재" : i < 6 ? "시멘트" : "혼화제",
      MAT_NAME: name,
      SET: set,
      ACT: act,
      DEF: Number((act - set).toFixed(1)),
      DEF_RATE: Number((((act - set) / set) * 100).toFixed(3)),
      ACC_RATE: randomBetween(98, 100.5, 1),
    }
  })
}

function mockMoldCard(): MoldCardRow {
  const row: MoldCardRow = {
    HEIGHT: 80,
    ITEM_CD: "ITM-3000",
    LOT_NO: "L2026041601",
    ORDER_NO: "ORD-4000",
    INJECT_001: "54",
    INJECT_193: randomBetween(200, 260, 1),
  }
  for (let tag = 5; tag <= 13; tag++) {
    row[`INJECT_Tag${String(tag).padStart(2, "0")}`] = randomBetween(78, 82, 1)
  }
  for (let m = 202; m <= 211; m++) {
    row[`INJECT_${m}`] = randomBetween(0, 10, 1)
  }
  return row
}

function mockSfpCard(): SfpCardRow {
  return {
    IMG_PATH: "",
    COLOR_DATA: "",
    DEFECT_DATA: "",
    CYCLE_ID: "CYC-0001",
    CYCLE_STATE: Math.random() > 0.85 ? "NG" : "OK",
    DATA_NAME: "1-1",
    GET_DATE: "20260416",
    GET_TIME: "093000",
    ITEM_GN: "GN-01",
    ITEM_SN: "SN-01",
  }
}

function mockCuringCard(): CuringCardRow[] {
  return Array.from({ length: 24 }, (_, i) => ({
    DATETIME: `04-16 ${String(i).padStart(2, "0")}:00`,
    ZONE_1: randomBetween(45, 60),
    ZONE_2: randomBetween(45, 60),
    ZONE_3: randomBetween(45, 60),
    ZONE_4: randomBetween(45, 60),
    ZONE_5: randomBetween(45, 60),
    ZONE_6: randomBetween(45, 60),
  }))
}

function mockFpCard(): FpCardRow {
  return {
    GET_DATE: "2026-04-16",
    GET_TIME: "14:22:00",
    ORIGIN_IMG_FILE_PATH: "",
    LOT_NO: "L2026041601",
    ITEM_CD: "ITM-3000",
  }
}

export function mockCardData(gubun: CardGubun) {
  switch (gubun) {
    case "AGG":
      return { status: "success" as const, lot_flow_list: mockAggCard() }
    case "MIX":
      return { status: "success" as const, lot_flow_list: mockMixCard() }
    case "MOLD":
      return { status: "success" as const, lot_flow_list: [mockMoldCard()] }
    case "SFP":
      return { status: "success" as const, lot_flow_list: [mockSfpCard()] }
    case "CURING":
      return { status: "success" as const, lot_flow_list: mockCuringCard() }
    case "FP":
      return { status: "success" as const, lot_flow_list: [mockFpCard()] }
  }
}
