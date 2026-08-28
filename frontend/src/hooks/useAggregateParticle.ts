import { useQuery } from "@tanstack/react-query"
import { api } from "@/lib/api"
import type { AggGraphResponse, AssembleRateResponse } from "@/types/dashboard"
import type { AggregateHistoryResponse } from "@/types/aggregate"

export function useAggregateParticle(startIso: string, endIso: string, lineInput: string | null) {
  return useQuery<{
    assemble: AssembleRateResponse
    graph: AggGraphResponse
    history: AggregateHistoryResponse
  }>({
    queryKey: ["aggregate-particle", startIso, endIso, lineInput],
    enabled: Boolean(startIso && endIso && lineInput),
    queryFn: async () => {
      const res = await api.get("/aggregate/particle", { params: { start: startIso, end: endIso, line: lineInput } })
      return res.data
    },
  })
}
