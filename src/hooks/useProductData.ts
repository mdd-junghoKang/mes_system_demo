import { useQuery } from "@tanstack/react-query"
import { mockProductData } from "@/mocks/product"
import { sleep } from "@/mocks/utils"

export function useProductData(startIso: string, endIso: string) {
  return useQuery({
    queryKey: ["product-datas", startIso, endIso],
    enabled: Boolean(startIso && endIso),
    queryFn: async () => {
      await sleep(300)
      return mockProductData(startIso, endIso)
    },
  })
}
