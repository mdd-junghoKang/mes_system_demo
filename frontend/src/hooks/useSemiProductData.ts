import { useQuery } from "@tanstack/react-query"
import { api } from "@/lib/api"
import type { SemiProductDatasResponse } from "@/types/semiProduct"

export function useSemiProductData(startIso: string, endIso: string) {
  return useQuery<SemiProductDatasResponse>({
    queryKey: ["semi-product-datas", startIso, endIso],
    enabled: Boolean(startIso && endIso),
    queryFn: async () => {
      const res = await api.get<SemiProductDatasResponse>("/semi-product", { params: { start: startIso, end: endIso } })
      return res.data
    },
  })
}
