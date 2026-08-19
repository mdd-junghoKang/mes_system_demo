export type AggregateHistoryRow = {
  BATCH_NO: string
  GETHERING_TIME: string
  A_AVG_VALUE: number
  A_MAX_VALUE: number
  A_MIN_VALUE: number
  P_AVG_VALUE: number
  P_MAX_VALUE: number
  P_MIN_VALUE: number
}

export type AggregateHistoryResponse = {
  status: "success" | "error"
  message?: string
  history_data?: AggregateHistoryRow[]
}

export type BatchInfoRow = {
  BATCH_NO: string
  GETHERING_TIME: string
  AVG_VALUE: number
  MAX_VALUE: number
  MIN_VALUE: number
}

export type AssembleGraphPoint = {
  GETHERING_TIME: string
  AVG_VALUE: number | null
}

export type AssembleGraphDataResponse = {
  status: "success" | "error"
  message?: string
  graph_data?: AssembleGraphPoint[]
  assemble_data?: { low_line?: number; high_line?: number }
}

export type ImageRow = {
  real_path: string
  ai_path: string
}

export type AggregateImageResponse = {
  image_rows?: ImageRow[]
}

export type GradationAvgRow = {
  BATCH_NO: number
  PASS_00_15: number
  PASS_00_30: number
  PASS_00_60: number
  PASS_01_20: number
  PASS_02_25: number
  PASS_05_00: number
  PASS_10_00: number
}

export type GradationGraphResponse = {
  status: "success" | "error"
  message?: string
  avg_data_list?: GradationAvgRow[]
  single_batch?: number[]
  low_data_list?: number[]
  high_data_list?: number[]
}
