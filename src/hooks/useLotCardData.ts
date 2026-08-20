import { useQuery } from "@tanstack/react-query"
import { mockCardData } from "@/mocks/lot"
import { sleep } from "@/mocks/utils"
import type { CardGubun } from "@/types/lotCardData"

export function useLotCardData<T>(gubun: CardGubun | null, lotNo: string | null) {
  return useQuery({
    queryKey: ["lot-card-data", gubun, lotNo],
    enabled: Boolean(gubun && lotNo),
    queryFn: async () => {
      await sleep(250)
      return mockCardData(gubun as CardGubun) as unknown as { status: "success"; lot_flow_list: T[] }
    },
  })
}
