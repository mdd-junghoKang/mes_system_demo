import { useQuery } from "@tanstack/react-query"
import { mockAggGraph, mockAggregateHistory, mockAssembleRate } from "@/mocks/aggregate"
import { sleep } from "@/mocks/utils"

export function useAggregateParticle(startIso: string, endIso: string, lineInput: string | null) {
  return useQuery({
    queryKey: ["aggregate-particle", startIso, endIso, lineInput],
    enabled: Boolean(startIso && endIso && lineInput),
    queryFn: async () => {
      await sleep(300)
      const seed = `${startIso}|${endIso}|${lineInput}`
      return {
        assemble: mockAssembleRate(seed),
        graph: mockAggGraph(startIso, endIso, seed),
        history: mockAggregateHistory(startIso, endIso, seed),
      }
    },
  })
}
