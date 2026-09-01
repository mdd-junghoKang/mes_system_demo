import { useQuery } from "@tanstack/react-query"
import { api } from "@/lib/api"
import type { FlowTrackingResponse, LotTrackingResponse } from "@/types/lot"

async function fetchLotTracking(
  start: string,
  end: string,
  query: string,
  field: "LOT_NO" | "MIX_NO" = "LOT_NO",
): Promise<LotTrackingResponse> {
  const res = await api.get<LotTrackingResponse>("/lot/tracking", { params: { start, end, query, field } })
  return res.data
}

export function useLotSearch(lotNo: string, startIso: string, endIso: string) {
  return useQuery({
    queryKey: ["lot-search", lotNo, startIso, endIso],
    enabled: Boolean(startIso && endIso),
    queryFn: () => fetchLotTracking(startIso, endIso, lotNo),
  })
}

export function useMixSearch(mixerNo: string, startIso: string, endIso: string) {
  return useQuery({
    queryKey: ["mix-search", mixerNo, startIso, endIso],
    enabled: Boolean(startIso && endIso),
    queryFn: () => fetchLotTracking(startIso, endIso, mixerNo, "MIX_NO"),
  })
}

export function useFlowTracking(lotNo: string | null) {
  return useQuery<FlowTrackingResponse>({
    queryKey: ["flow-tracking", lotNo],
    enabled: Boolean(lotNo),
    queryFn: async () => {
      const res = await api.get<FlowTrackingResponse>(`/lot/flow/${lotNo}`)
      return res.data
    },
  })
}
