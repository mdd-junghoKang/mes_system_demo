import { useQuery } from "@tanstack/react-query"
import { api } from "@/lib/api"
import type { GradationGraphResponse } from "@/types/aggregate"

export function useGradationCurve(dateIso: string, lineInput: string | null) {
  return useQuery<GradationGraphResponse>({
    queryKey: ["gradation-curve", dateIso, lineInput],
    enabled: Boolean(dateIso && lineInput),
    queryFn: async () => {
      const res = await api.get<GradationGraphResponse>("/aggregate/gradation-curve", {
        params: { date: dateIso, line: lineInput },
      })
      return res.data
    },
  })
}

export function useGradationCurveBatch(dateIso: string, lineInput: string | null, batchNo: string) {
  return useQuery<GradationGraphResponse>({
    queryKey: ["gradation-curve-batch", dateIso, lineInput, batchNo],
    enabled: Boolean(dateIso && lineInput && batchNo),
    queryFn: async () => {
      const res = await api.get<GradationGraphResponse>("/aggregate/gradation-curve", {
        params: { date: dateIso, line: lineInput, batch_no: batchNo },
      })
      return res.data
    },
  })
}

export const SIEVE_LABELS = ["0.15", "0.3", "0.6", "1.2", "2.5", "5", "10"]
export const SIEVE_FIELDS = [
  "PASS_00_15",
  "PASS_00_30",
  "PASS_00_60",
  "PASS_01_20",
  "PASS_02_25",
  "PASS_05_00",
  "PASS_10_00",
] as const
