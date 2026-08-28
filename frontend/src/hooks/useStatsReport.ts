import { useQuery } from "@tanstack/react-query"
import { mockAssembleRate } from "@/mocks/aggregate"
import { mockBedrockData } from "@/mocks/bedrock"
import { mockSemiProductData } from "@/mocks/semiProduct"
import { mockProductData } from "@/mocks/product"
import { sleep } from "@/mocks/utils"

export type StatsReportRow = {
  category: string
  label: string
  value: string
}

export function useStatsReport(start: string, end: string) {
  return useQuery<StatsReportRow[]>({
    queryKey: ["stats-report", start, end],
    enabled: Boolean(start && end),
    queryFn: async () => {
      await sleep(300)

      const seed = `${start}|${end}`
      const assemble = mockAssembleRate(seed)
      const bedrock = mockBedrockData(start, end)
      const semi = mockSemiProductData(start, end)
      const product = mockProductData(start, end)

      const semiCycle = (semi.graph_data ?? []).reduce((sum, d) => sum + d.CYCLECOUNT, 0)
      const semiDefect = (semi.graph_data ?? []).reduce((sum, d) => sum + d.DEFECTIVE, 0)
      const productCycle = (product.graph_data ?? []).reduce((sum, d) => sum + d.CYCLECOUNT, 0)
      const productNg = (product.graph_data ?? []).reduce((sum, d) => sum + d.LOTNG, 0)
      const bed = bedrock.status_data

      return [
        {
          category: "골재 품질",
          label: "평균 조립률 (F.M)",
          value: `${assemble.assemble_rates[0]?.FINENESS_MODULUS ?? "-"}%`,
        },
        {
          category: "골재 품질",
          label: "평균 입형률",
          value: `${assemble.assemble_rates[0]?.SHAPE_INDEX ?? "-"}%`,
        },
        {
          category: "기층몰탈",
          label: "총 검사량",
          value: `${bed?.TOTAL_COUNT ?? 0}건`,
        },
        {
          category: "기층몰탈",
          label: "위험 건수 (위험률)",
          value: `${bed?.DANGER_COUNT ?? 0}건 (${bed?.DANGER_RATE ?? 0}%)`,
        },
        {
          category: "반제품",
          label: "사이클 카운트 합계",
          value: `${semiCycle.toLocaleString()}회`,
        },
        {
          category: "반제품",
          label: "불량품 수 합계",
          value: `${semiDefect.toLocaleString()}건`,
        },
        {
          category: "완제품",
          label: "사이클 카운트 합계",
          value: `${productCycle.toLocaleString()}회`,
        },
        {
          category: "완제품",
          label: "LOT NG 합계",
          value: `${productNg.toLocaleString()}건`,
        },
      ]
    },
  })
}
