import { useQuery } from "@tanstack/react-query"
import { api } from "@/lib/api"
import type { MaterialMonitoringResponse } from "@/types/monitoring"

export function useMaterialMonitoring(
  startDate: string,
  startTime: string,
  endDate: string,
  endTime: string,
) {
  return useQuery<MaterialMonitoringResponse>({
    queryKey: ["material-monitoring", startDate, startTime, endDate, endTime],
    enabled: Boolean(startDate && endDate),
    queryFn: async () => {
      const res = await api.get<MaterialMonitoringResponse>("/monitoring/material", {
        params: { start_date: startDate, start_time: startTime, end_date: endDate, end_time: endTime },
      })
      return res.data
    },
  })
}
