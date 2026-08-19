import { useQuery } from "@tanstack/react-query"
import { mockBedrockData } from "@/mocks/bedrock"
import { sleep } from "@/mocks/utils"

export function useBedrockData(startIso: string, endIso: string) {
  return useQuery({
    queryKey: ["bedrock-datas", startIso, endIso],
    enabled: Boolean(startIso && endIso),
    queryFn: async () => {
      await sleep(300)
      return mockBedrockData(startIso, endIso)
    },
  })
}
