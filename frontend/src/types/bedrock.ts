export type BedrockStatusData = {
  NORMAL_RATE: number
  CAUTION_RATE: number
  DANGER_RATE: number
  TOTAL_COUNT: number
  NORMAL_COUNT: number
  CAUTION_COUNT: number
  DANGER_COUNT: number
}

export type BedrockAlarmRow = {
  WARNING_LEVEL: string
  AREA_CM: number
  TIME_AGO: string
}

export type BedrockHistoryRow = {
  GET_DATE: string
  GET_TIME: string
  AREA_CM: number
  WARNING_LEVEL: string
  ORIGIN_IMG_FILE_PATH: string
  RESULT_IMG_FILE_PATH: string
}

export type BedrockChartRow = {
  GET_DATE: string
  CAUTION_COUNT: number
  DANGER_COUNT: number
}

export type BedrockDatasResponse = {
  status: "success" | "error"
  message?: string
  status_data?: BedrockStatusData
  alarm_data?: BedrockAlarmRow[]
  history_data?: BedrockHistoryRow[]
  chart_data?: BedrockChartRow[]
}
