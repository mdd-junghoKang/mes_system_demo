export type ProductSummary = {
  CYCLECOUNT: number | null
  LOTOK: number | null
  LOGNG?: number | null
  LOTNG?: number | null
}

export type ProductGraphRow = {
  GET_DATE: string
  CYCLECOUNT: number
  LOTNG: number
}

export type ProductRow = {
  ID: string | number
  GET_DATE: string
  GET_TIME: string
  LOT_NO: string
  ITEM_CD: string
  ITEM_NM: string
  ORIGIN_IMG_FILE_PATH: string
}

export type ProductDatasResponse = {
  status: "success" | "error"
  message?: string
  summary_data?: ProductSummary[]
  graph_data?: ProductGraphRow[]
  row_data?: ProductRow[]
}
