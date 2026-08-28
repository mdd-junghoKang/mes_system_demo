import { useQuery } from "@tanstack/react-query"
import { api } from "@/lib/api"
import type { ProductDatasResponse } from "@/types/product"

export function useProductData(startIso: string, endIso: string) {
  return useQuery<ProductDatasResponse>({
    queryKey: ["product-datas", startIso, endIso],
    enabled: Boolean(startIso && endIso),
    queryFn: async () => {
      const res = await api.get<ProductDatasResponse>("/product", { params: { start: startIso, end: endIso } })
      return res.data
    },
  })
}
