import { useQuery } from "@tanstack/react-query"
import { mockMaterialMonitoring } from "@/mocks/monitoring"
import { sleep } from "@/mocks/utils"

export function useMaterialMonitoring(
  startDate: string,
  startTime: string,
  endDate: string,
  endTime: string,
) {
  return useQuery({
    queryKey: ["material-monitoring", startDate, startTime, endDate, endTime],
    enabled: Boolean(startDate && endDate),
    queryFn: async () => {
      await sleep(300)
      return mockMaterialMonitoring()
    },
  })
}
