import { useQuery } from "@tanstack/react-query"
import { api } from "@/lib/api"
import type { DimensionResponse, DistributionsResponse, ItemListResponse, QualitySummaryResponse } from "@/types/monitoring"

export function useQualityItems(start: string, end: string) {
  return useQuery<ItemListResponse>({
    queryKey: ["quality-items", start, end],
    enabled: Boolean(start && end),
    queryFn: async () => {
      const res = await api.get<ItemListResponse>("/monitoring/quality/items", { params: { start, end } })
      return res.data
    },
  })
}

export function useQualityDetail(start: string, end: string, itemCd: string | null) {
  return useQuery<{ summary: QualitySummaryResponse; dimension: DimensionResponse; distributions: DistributionsResponse }>({
    queryKey: ["quality-detail", start, end, itemCd],
    enabled: Boolean(start && end && itemCd),
    queryFn: async () => {
      const res = await api.get("/monitoring/quality/detail", { params: { start, end, item_cd: itemCd ?? "" } })
      return res.data
    },
  })
}
