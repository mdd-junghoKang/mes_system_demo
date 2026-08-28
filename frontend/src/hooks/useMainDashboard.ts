import { useQuery } from "@tanstack/react-query"
import { mockAssembleRate, mockAggGraph } from "@/mocks/aggregate"
import { mockBedrockData } from "@/mocks/bedrock"
import { mockSemiProductData } from "@/mocks/semiProduct"
import { mockProductData } from "@/mocks/product"
import { sleep } from "@/mocks/utils"
import type { MainDashboardData } from "@/types/dashboard"

export function useMainDashboardData(startIso: string, endIso: string, lineInput: string | null) {
  return useQuery<MainDashboardData>({
    queryKey: ["main-dashboard", startIso, endIso, lineInput],
    enabled: Boolean(startIso && endIso && lineInput),
    refetchInterval: 5 * 60 * 1000,
    queryFn: async () => {
      await sleep(300)

      const seed = `${startIso}|${endIso}|${lineInput}`
      const bedrock = mockBedrockData(startIso, endIso)
      const semi = mockSemiProductData(startIso, endIso)
      const product = mockProductData(startIso, endIso)

      return {
        assemble: mockAssembleRate(seed),
        aggGraph: mockAggGraph(startIso, endIso, seed),
        bedStatus: { status_data: bedrock.status_data },
        bedAlarms: bedrock.alarm_data ?? [],
        bedGraph: { chart_data: bedrock.chart_data ?? [] },
        semi: { graph_data: semi.graph_data ?? [] },
        product: { graph_data: product.graph_data ?? [] },
      }
    },
  })
}
