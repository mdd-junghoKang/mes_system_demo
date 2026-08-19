import { useQuery } from "@tanstack/react-query"
import { mockDistributions, mockItemList, mockQualityDimension, mockQualitySummary } from "@/mocks/monitoring"
import { sleep } from "@/mocks/utils"

export function useQualityItems(start: string, end: string) {
  return useQuery({
    queryKey: ["quality-items", start, end],
    enabled: Boolean(start && end),
    queryFn: async () => {
      await sleep(150)
      return mockItemList()
    },
  })
}

export function useQualityDetail(start: string, end: string, itemCd: string | null) {
  return useQuery({
    queryKey: ["quality-detail", start, end, itemCd],
    enabled: Boolean(start && end && itemCd),
    queryFn: async () => {
      await sleep(300)
      return {
        summary: mockQualitySummary(),
        dimension: mockQualityDimension(start, end),
        distributions: mockDistributions(),
      }
    },
  })
}
