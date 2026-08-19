import { useQuery } from "@tanstack/react-query"
import { mockAggGraph, mockAggregateHistory } from "@/mocks/aggregate"
import { sleep } from "@/mocks/utils"

export function useGradationHistory(startIso: string, endIso: string, lineInput: string | null) {
  return useQuery({
    queryKey: ["gradation-history", startIso, endIso, lineInput],
    enabled: Boolean(startIso && endIso && lineInput),
    queryFn: async () => {
      await sleep(300)
      return {
        history: mockAggregateHistory(startIso, endIso),
        graph: mockAggGraph(startIso, endIso),
      }
    },
  })
}
