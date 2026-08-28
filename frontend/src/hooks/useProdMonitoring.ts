import { useQuery } from "@tanstack/react-query"
import { api } from "@/lib/api"
import type { ProdMonitoringResponse } from "@/types/monitoring"

export function useProdMonitoring() {
  return useQuery<ProdMonitoringResponse>({
    queryKey: ["prod-monitoring"],
    queryFn: async () => {
      const res = await api.get<ProdMonitoringResponse>("/monitoring/production")
      return res.data
    },
    refetchInterval: 15_000,
  })
}
