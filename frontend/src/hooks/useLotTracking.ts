import { useQuery } from "@tanstack/react-query"
import { mockFlowTracking, mockLotList } from "@/mocks/lot"
import { sleep } from "@/mocks/utils"

export function useLotSearch(lotNo: string, startIso: string, endIso: string) {
  return useQuery({
    queryKey: ["lot-search", lotNo, startIso, endIso],
    enabled: Boolean(startIso && endIso),
    queryFn: async () => {
      await sleep(300)
      return mockLotList(startIso, endIso, lotNo)
    },
  })
}

export function useMixSearch(mixerNo: string, startIso: string, endIso: string) {
  return useQuery({
    queryKey: ["mix-search", mixerNo, startIso, endIso],
    enabled: Boolean(startIso && endIso),
    queryFn: async () => {
      await sleep(300)
      return mockLotList(startIso, endIso, mixerNo, "MIX_NO")
    },
  })
}

export function useFlowTracking(lotNo: string | null) {
  return useQuery({
    queryKey: ["flow-tracking", lotNo],
    enabled: Boolean(lotNo),
    queryFn: async () => {
      await sleep(200)
      return mockFlowTracking(lotNo ?? "")
    },
  })
}
