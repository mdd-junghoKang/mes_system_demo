import { useState } from "react"

import { DataTable } from "@/components/shared/DataTable"
import { DateRangeSearchBar } from "@/components/shared/DateRangeSearchBar"
import { exportRowsToCsv } from "@/lib/csvExport"
import { defaultDateRange } from "@/lib/dates"
import { useStatsReport, type StatsReportRow } from "@/hooks/useStatsReport"

export function StatsReportPage() {
  const initial = defaultDateRange()
  const [draftRange, setDraftRange] = useState(initial)
  const [appliedRange, setAppliedRange] = useState(initial)

  const { data, isLoading, isFetching, isError } = useStatsReport(appliedRange.start, appliedRange.end)
  const rows = data ?? []

  function handleExport() {
    exportRowsToCsv(
      "stats-report.csv",
      ["구분", "항목", "값"],
      rows.map((r) => [r.category, r.label, r.value]),
    )
  }

  return (
    <div className="flex flex-col gap-4">
      <DateRangeSearchBar
        start={draftRange.start}
        end={draftRange.end}
        onStartChange={(v) => setDraftRange((r) => ({ ...r, start: v }))}
        onEndChange={(v) => setDraftRange((r) => ({ ...r, end: v }))}
        onSearch={() => setAppliedRange(draftRange)}
      />

      <p className="text-sm text-muted-foreground">
        선택한 기간의 품질/생산 핵심 지표를 한 화면에서 요약해서 보여줍니다.
      </p>

      <DataTable<StatsReportRow>
        columns={[
          { key: "category", header: "구분", render: (r) => r.category, width: "1fr" },
          { key: "label", header: "항목", render: (r) => r.label, width: "2fr" },
          { key: "value", header: "값", render: (r) => r.value, width: "1fr", align: "right" },
        ]}
        rows={rows}
        getRowKey={(r, i) => `${r.category}-${r.label}-${i}`}
        isLoading={isLoading || isFetching}
        isError={isError}
        onExport={handleExport}
        pagination={false}
      />
    </div>
  )
}
