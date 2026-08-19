export type AggInfoRow = {
  LINE_INFO: string
  AGG_INFO: string
  USE_YN: "Y" | "N"
}

export type AggInfoResponse = {
  agg_info: AggInfoRow[]
}

export type AssembleRateRow = {
  FINENESS_MODULUS: number
  SHAPE_INDEX: number
}

export type AssembleRateResponse = {
  assemble_rates: AssembleRateRow[]
}

// [id, label, value]
export type GraphRow = [number | string, string, number]

export type AggGraphResponse = {
  graph_data: {
    graph_a: GraphRow[]
    graph_p: GraphRow[]
  }
  assemble_data?: {
    low_line?: number
    high_line?: number
  }
}

export type BedrockStatusResponse = {
  status_data?: {
    DANGER_RATE: number
    DANGER_COUNT: number
  }
}

export type BedrockGraphResponse = {
  chart_data: {
    GET_DATE: string
    CAUTION_COUNT: number
    DANGER_COUNT: number
  }[]
}

export type SemiProductGraphResponse = {
  graph_data: {
    GET_DATE: string
    CYCLECOUNT: number
    DEFECTIVE: number
  }[]
}

export type ProductGraphResponse = {
  graph_data: {
    GET_DATE: string
    CYCLECOUNT: number
    LOTNG: number
  }[]
}

export type MainDashboardData = {
  assemble: AssembleRateResponse
  aggGraph: AggGraphResponse
  bedStatus: BedrockStatusResponse
  bedGraph: BedrockGraphResponse
  semi: SemiProductGraphResponse
  product: ProductGraphResponse
}
