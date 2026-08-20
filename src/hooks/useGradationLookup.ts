import { useQuery } from "@tanstack/react-query"
import {
  mockAssembleGraphData,
  mockBatchInfo,
  mockImageRows,
  mockLookupAssembleRate,
} from "@/mocks/aggregate"
import { sleep } from "@/mocks/utils"
import type { AssembleGraphDataResponse } from "@/types/aggregate"

export type AssembleType = "A" | "P" | "select-none"

export function useGradationLookup(dateIso: string, lineInput: string | null, assembleType: AssembleType) {
  return useQuery({
    queryKey: ["gradation-lookup", dateIso, lineInput, assembleType],
    enabled: Boolean(dateIso && lineInput),
    queryFn: async () => {
      await sleep(300)
      const seed = `${dateIso}|${lineInput}|${assembleType}`
      return {
        batchInfo: mockBatchInfo(dateIso, seed),
        assembleRate: assembleType !== "select-none" ? mockLookupAssembleRate(seed) : { assemble_rates: [] },
        graph: (assembleType !== "select-none"
          ? mockAssembleGraphData(assembleType, dateIso, seed)
          : { graph_data: [] }) as AssembleGraphDataResponse,
      }
    },
  })
}

export function useBatchImages(batchNo: string | null, lineInput: string | null) {
  return useQuery({
    queryKey: ["batch-images", batchNo, lineInput],
    enabled: Boolean(batchNo && lineInput),
    queryFn: async () => {
      await sleep(200)
      return mockImageRows()
    },
  })
}
