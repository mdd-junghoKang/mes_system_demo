export type SemiProductSummary = {
  CYCLECOUNT: number | null
  BAD: number | null
  DEFECTIVE: number | null
}

export type SemiProductGraphRow = {
  GET_DATE: string
  CYCLECOUNT: number
  DEFECTIVE: number
}

export type SemiProductRow = {
  GET_DATE: string
  GET_TIME: string
  DATA_NAME: string
  ITEM_CD: string
  ITEM_NM: string
  LOT_NO: string
  RESULT: "OK" | "NG" | string
  IMG_PATH: string
  COLOR_DATA: string
  DEFECT_DATA: string
}

export type SemiProductDatasResponse = {
  status: "success" | "error"
  message?: string
  summary_data?: SemiProductSummary[]
  graph_data?: SemiProductGraphRow[]
  row_data?: SemiProductRow[]
}
