import { useQuery } from "@tanstack/react-query"
import { api } from "@/lib/api"
import type { AggInfoResponse } from "@/types/dashboard"

export function useAggInfo() {
  return useQuery<AggInfoResponse>({
    queryKey: ["agg-info"],
    queryFn: async () => {
      const res = await api.get<AggInfoResponse>("/aggregate/info")
      return res.data
    },
  })
}

export function sortedActiveLines(agg: { LINE_INFO: string; AGG_INFO: string; USE_YN: "Y" | "N" }[]) {
  return [...agg]
    .filter((row) => row.USE_YN !== "N")
    .sort((a, b) => {
      const numA = Number(a.LINE_INFO.split("_")[1])
      const numB = Number(b.LINE_INFO.split("_")[1])
      return numA - numB
    })
}
