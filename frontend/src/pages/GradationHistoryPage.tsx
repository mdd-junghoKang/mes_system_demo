import { useState } from "react"

import { ChartCard } from "@/components/charts/ChartCard"
import { HistoryRangeChart } from "@/components/charts/HistoryRangeChart"
import { DateRangeSearchBar } from "@/components/shared/DateRangeSearchBar"
import { LineSelector } from "@/components/shared/LineSelector"
import { useAggInfo, sortedActiveLines } from "@/hooks/useAggInfo"
import { useGradationHistory } from "@/hooks/useGradationHistory"
import { defaultMonthRange } from "@/lib/dates"

export function GradationHistoryPage() {
  const initial = defaultMonthRange()
  const [draftRange, setDraftRange] = useState(initial)
  const [appliedRange, setAppliedRange] = useState(initial)
  const [selectedLine, setSelectedLine] = useState<string | null>(null)

  const aggInfoQuery = useAggInfo()
  const lines = aggInfoQuery.data ? sortedActiveLines(aggInfoQuery.data.agg_info) : []
  const effectiveLine = selectedLine ?? lines[0]?.LINE_INFO ?? null

  const { data, isLoading, isFetching } = useGradationHistory(
    appliedRange.start,
    appliedRange.end,
    effectiveLine,
  )

  const rows = data?.history.history_data ?? []
  const lowLine = data?.graph.assemble_data?.low_line
  const highLine = data?.graph.assemble_data?.high_line

  return (
    <div className="flex flex-col gap-4">
      <DateRangeSearchBar
        start={draftRange.start}
        end={draftRange.end}
        onStartChange={(v) => setDraftRange((r) => ({ ...r, start: v }))}
        onEndChange={(v) => setDraftRange((r) => ({ ...r, end: v }))}
        onSearch={() => setAppliedRange(draftRange)}
      >
        <LineSelector value={effectiveLine} onChange={setSelectedLine} />
      </DateRangeSearchBar>

      <ChartCard
        title="골재 입도분포 History"
        isLoading={isLoading || isFetching}
        isEmpty={rows.length === 0}
        height={420}
      >
        <HistoryRangeChart
          labels={rows.map((r) => r.BATCH_NO)}
          ranges={rows.map((r) => [r.A_MIN_VALUE, r.A_MAX_VALUE])}
          averages={rows.map((r) => r.A_AVG_VALUE)}
          lowLine={lowLine}
          highLine={highLine}
        />
      </ChartCard>
    </div>
  )
}
