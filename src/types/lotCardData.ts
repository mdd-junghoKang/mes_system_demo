export type CardGubun = "AGG" | "MIX" | "MOLD" | "SFP" | "CURING" | "FP"

export type AggCardRow = {
  LINE_INFO: string
  BATCH_NO: string
  A_AVG_VALUE: number
  A_MAX_VALUE: number
  A_MIN_VALUE: number
  P_AVG_VALUE: number
  P_MAX_VALUE: number
  P_MIN_VALUE: number
}

export type MixCardRow = {
  GUBUN: string
  MAT_NAME: string
  SET: number
  ACT: number
  DEF: number
  DEF_RATE: number
  ACC_RATE: number
}

export type MoldCardRow = {
  HEIGHT: number | null
  ITEM_CD: string
  LOT_NO: string
  ORDER_NO: string
  [key: `INJECT_${string}`]: number | string
}

export type SfpCardRow = {
  IMG_PATH: string
  COLOR_DATA: string
  DEFECT_DATA: string
  CYCLE_ID: string
  CYCLE_STATE: string
  DATA_NAME: string
  GET_DATE: string
  GET_TIME: string
  ITEM_GN: string
  ITEM_SN: string
}

export type CuringCardRow = {
  DATETIME: string
  ZONE_1: number
  ZONE_2: number
  ZONE_3: number
  ZONE_4: number
  ZONE_5: number
  ZONE_6: number
}

export type FpCardRow = {
  GET_DATE: string
  GET_TIME: string
  ORIGIN_IMG_FILE_PATH: string
  LOT_NO: string
  ITEM_CD: string
}

export type CardDataResponse<T> = {
  status: "success" | "error"
  message?: string
  lot_flow_list?: T[]
}
