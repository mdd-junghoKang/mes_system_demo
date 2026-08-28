import { useQuery } from "@tanstack/react-query"
import { api } from "@/lib/api"
import type { AssembleGraphDataResponse, BatchInfoRow } from "@/types/aggregate"
import type { AssembleRateResponse } from "@/types/dashboard"

export type AssembleType = "A" | "P" | "select-none"

export function useGradationLookup(dateIso: string, lineInput: string | null, assembleType: AssembleType) {
  return useQuery<{
    batchInfo: BatchInfoRow[]
    assembleRate: AssembleRateResponse
    graph: AssembleGraphDataResponse
  }>({
    queryKey: ["gradation-lookup", dateIso, lineInput, assembleType],
    enabled: Boolean(dateIso && lineInput),
    queryFn: async () => {
      const res = await api.get("/aggregate/gradation-lookup", {
        params: { date: dateIso, line: lineInput, assemble_type: assembleType },
      })
      return res.data
    },
  })
}

export function useBatchImages(batchNo: string | null, lineInput: string | null) {
  return useQuery<{ image_rows: { real_path: string; ai_path: string }[] }>({
    queryKey: ["batch-images", batchNo, lineInput],
    enabled: Boolean(batchNo && lineInput),
    queryFn: async () => {
      const res = await api.get("/aggregate/images", { params: { batch_no: batchNo, line: lineInput } })
      return res.data
    },
  })
}
