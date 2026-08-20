export type ProdMonitoringRow = {
  PLAY_YN: "Y" | "N"
  HEIGHT: number | null
  [key: `INJECT_${string}`]: number | string
}

export type ProdGraphRow = {
  INDATE: string
  [key: `INJECT_${string}`]: number | string
}

export type ProdMonitoringResponse = {
  status: "success" | "error"
  message?: string
  monitoring_list?: {
    INJ_MONI?: ProdMonitoringRow[]
    INJ_MONI_GRAPH_1?: ProdGraphRow[]
    INJ_MONI_GRAPH_2?: ProdGraphRow[]
  }
}

export type ItemRow = { INJECT_002: string }
export type ItemListResponse = { status: "success" | "error"; item_list?: ItemRow[] }

export type QualitySummary = {
  HEIGHT_1_AVG: number
  HEIGHT_2_AVG: number
  HEIGHT_3_AVG: number
  CYCLE_TIME: number
  PRESS_TIME: number
  WEIGHT: number
}
export type QualitySummaryResponse = { status: "success" | "error"; summary?: QualitySummary | null }

export type DimensionRawRow = {
  INDATE: string
  HEIGHT_1_AVG: number
  HEIGHT_2_AVG: number
  HEIGHT_3_AVG: number
  WEIGHT: number
}
export type DimensionLimit = { HEIGHT: number; UCL: number; LCL: number; AVG_VALUE: number; CPK: number }
export type DimensionResponse = {
  status: "success" | "error"
  raw?: DimensionRawRow[]
  limit?: DimensionLimit | null
}

export type DistributionRow = Record<string, number>
export type DistributionsResponse = {
  status: "success" | "error"
  cycle?: DistributionRow[]
  press?: DistributionRow[]
  height1?: DistributionRow[]
  height2?: DistributionRow[]
  height3?: DistributionRow[]
  weight?: DistributionRow[]
}

export type MaterialSummary = {
  SUM_SET: number
  SUM_ACT: number
  SUM_DEF: number
  SUM_DEFRATE: number
  QTY_MAT: number
}
export type MaterialCategoryRow = {
  골재류_SET: number
  골재류_ACT: number
  시멘트류_SET: number
  시멘트류_ACT: number
  혼화제_SET: number
  혼화제_ACT: number
  안료_SET: number
  안료_ACT: number
}
export type MaterialDeviationRow = { MAT_NAME: string; DEF_RATE: number }
export type MaterialDetailRow = {
  GUBUN: string
  MAT_NAME: string
  SET: number
  ACT: number
  DEF: number
  DEF_RATE: number
  ACC_RATE: number
}
export type MaterialMonitoringResponse = {
  status: "success" | "error"
  monitoring_list?: {
    SUMMARY?: MaterialSummary[]
    GRAPH1?: MaterialCategoryRow[]
    GRAPH2?: MaterialDeviationRow[]
    ROW?: MaterialDetailRow[]
  }
}
