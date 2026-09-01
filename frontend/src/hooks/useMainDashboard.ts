import { useQuery } from "@tanstack/react-query"
import { api } from "@/lib/api"
import type { MainDashboardData } from "@/types/dashboard"

export function useMainDashboardData(startIso: string, endIso: string, lineInput: string | null) {
  return useQuery<MainDashboardData>({
    queryKey: ["main-dashboard", startIso, endIso, lineInput],
    enabled: Boolean(startIso && endIso && lineInput),
    refetchInterval: 5 * 60 * 1000,
    queryFn: async () => {
      const res = await api.get<MainDashboardData>("/dashboard", {
        params: { start: startIso, end: endIso, line: lineInput },
      })
      return res.data
    },
  })
}
