import { useQuery } from "@tanstack/react-query"
import { mockAggInfo } from "@/mocks/aggregate"
import { sleep } from "@/mocks/utils"

export function useAggInfo() {
  return useQuery({
    queryKey: ["agg-info"],
    queryFn: async () => {
      await sleep(150)
      return mockAggInfo()
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
