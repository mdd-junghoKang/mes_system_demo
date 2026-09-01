import { useQuery } from "@tanstack/react-query"
import { api } from "@/lib/api"
import type { CardGubun } from "@/types/lotCardData"

export function useLotCardData<T>(gubun: CardGubun | null, lotNo: string | null) {
  return useQuery({
    queryKey: ["lot-card-data", gubun, lotNo],
    enabled: Boolean(gubun && lotNo),
    queryFn: async () => {
      const res = await api.get<{ status: "success"; lot_flow_list: T[] }>(`/lot/card/${lotNo}`, {
        params: { gubun },
      })
      return res.data
    },
  })
}
