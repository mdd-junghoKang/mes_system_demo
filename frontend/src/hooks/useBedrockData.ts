import { useQuery } from "@tanstack/react-query"
import { api } from "@/lib/api"
import type { BedrockDatasResponse } from "@/types/bedrock"

export function useBedrockData(startIso: string, endIso: string) {
  return useQuery<BedrockDatasResponse>({
    queryKey: ["bedrock-datas", startIso, endIso],
    enabled: Boolean(startIso && endIso),
    queryFn: async () => {
      const res = await api.get<BedrockDatasResponse>("/bedrock", { params: { start: startIso, end: endIso } })
      return res.data
    },
  })
}
