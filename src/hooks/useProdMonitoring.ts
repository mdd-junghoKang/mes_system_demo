import { useQuery } from "@tanstack/react-query"
import { mockProdMonitoring } from "@/mocks/monitoring"
import { sleep } from "@/mocks/utils"

export function useProdMonitoring() {
  return useQuery({
    queryKey: ["prod-monitoring"],
    queryFn: async () => {
      await sleep(200)
      return mockProdMonitoring()
    },
    refetchInterval: 15_000,
  })
}
