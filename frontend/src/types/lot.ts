export type LotTrackingRow = {
  WORK_DATE: string
  LOT_NO: string
  MIX_NO: string
  ITEM_CD: string
  ITEM_NM: string
  ORDER_NO: string
  COLOR_QUALITY: string
  CURING_LOG: string
  APPEARANCE_QUALITY: string
  FINISHED_LOT: string
}

export type LotTrackingResponse = {
  status: "success" | "error"
  message?: string
  lot_tracking_list?: LotTrackingRow[]
  mix_tracking_list?: LotTrackingRow[]
}

export type FlowTrackingRow = {
  GUBUN: string
  TYPE: string
  VALUE: string
}

export type FlowTrackingResponse = {
  status: "success" | "error"
  message?: string
  lot_flow_list?: FlowTrackingRow[]
}

export const FLOW_STEP_LABELS: Record<string, string> = {
  "001": "골재입도",
  "002": "믹싱",
  "003": "성형",
  "004": "반제품 검사",
  "005": "양생",
  "006": "OCR리딩",
  "007": "완제품 검사",
}
