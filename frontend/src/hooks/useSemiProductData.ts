import { useQuery } from "@tanstack/react-query"
import { mockSemiProductData } from "@/mocks/semiProduct"
import { sleep } from "@/mocks/utils"

export function useSemiProductData(startIso: string, endIso: string) {
  return useQuery({
    queryKey: ["semi-product-datas", startIso, endIso],
    enabled: Boolean(startIso && endIso),
    queryFn: async () => {
      await sleep(300)
      return mockSemiProductData(startIso, endIso)
    },
  })
}
