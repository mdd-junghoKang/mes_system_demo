import { useQuery } from "@tanstack/react-query"
import { api } from "@/lib/api"
import type { AggGraphResponse } from "@/types/dashboard"
import type { AggregateHistoryResponse } from "@/types/aggregate"

export function useGradationHistory(startIso: string, endIso: string, lineInput: string | null) {
  return useQuery<{ history: AggregateHistoryResponse; graph: AggGraphResponse }>({
    queryKey: ["gradation-history", startIso, endIso, lineInput],
    enabled: Boolean(startIso && endIso && lineInput),
    queryFn: async () => {
      const res = await api.get("/aggregate/gradation-history", {
        params: { start: startIso, end: endIso, line: lineInput },
      })
      return res.data
    },
  })
}
