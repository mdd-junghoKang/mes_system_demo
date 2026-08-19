import { useMemo, useState } from "react"
import { Gauge } from "lucide-react"

import { Badge } from "@/components/ui/badge"
import { ChartCard } from "@/components/charts/ChartCard"
import { TrendLineChart } from "@/components/charts/TrendLineChart"
import { DataTable, type DataTableColumn } from "@/components/shared/DataTable"
import { DateRangeSearchBar } from "@/components/shared/DateRangeSearchBar"
import { LineSelector } from "@/components/shared/LineSelector"
import { useAggInfo, sortedActiveLines } from "@/hooks/useAggInfo"
import { useAggregateParticle } from "@/hooks/useAggregateParticle"
import { exportRowsToCsv } from "@/lib/csvExport"
import { defaultDateRange } from "@/lib/dates"
import type { AggregateHistoryRow } from "@/types/aggregate"

export function AggregateParticlePage() {
  const initial = defaultDateRange()
  const [draftRange, setDraftRange] = useState(initial)
  const [appliedRange, setAppliedRange] = useState(initial)
  const [selectedLine, setSelectedLine] = useState<string | null>(null)

  const aggInfoQuery = useAggInfo()
  const lines = aggInfoQuery.data ? sortedActiveLines(aggInfoQuery.data.agg_info) : []
  const effectiveLine = selectedLine ?? lines[0]?.LINE_INFO ?? null

  const { data, isLoading, isFetching } = useAggregateParticle(
    appliedRange.start,
    appliedRange.end,
    effectiveLine,
  )

  const graphA = data?.graph.graph_data?.graph_a ?? []
  const graphP = data?.graph.graph_data?.graph_p ?? []
  const lowLine = data?.graph.assemble_data?.low_line
  const highLine = data?.graph.assemble_data?.high_line
  const financeModulus = data?.assemble.assemble_rates?.[0]?.FINENESS_MODULUS
  const shapeIndex = data?.assemble.assemble_rates?.[0]?.SHAPE_INDEX

  const historyRows = useMemo(
    () =>
      [...(data?.history.history_data ?? [])].sort((a, b) =>
        b.GETHERING_TIME.localeCompare(a.GETHERING_TIME),
      ),
    [data],
  )

  const tableColumns: DataTableColumn<AggregateHistoryRow>[] = useMemo(
    () => [
      {
        key: "seq",
        header: "순번",
        width: "70px",
        render: (r) => historyRows.indexOf(r) + 1,
      },
      { key: "date", header: "날짜", width: "1fr", render: (r) => r.GETHERING_TIME.slice(0, 10) },
      { key: "time", header: "Time", width: "1fr", render: (r) => r.GETHERING_TIME.slice(11) },
      { key: "a_avg", header: "조립률 평균", width: "1fr", align: "right", render: (r) => r.A_AVG_VALUE },
      { key: "a_max", header: "조립률 최대", width: "1fr", align: "right", render: (r) => r.A_MAX_VALUE },
      { key: "a_min", header: "조립률 최소", width: "1fr", align: "right", render: (r) => r.A_MIN_VALUE },
      { key: "p_avg", header: "입형률 평균", width: "1fr", align: "right", render: (r) => r.P_AVG_VALUE },
      { key: "p_max", header: "입형률 최대", width: "1fr", align: "right", render: (r) => r.P_MAX_VALUE },
      { key: "p_min", header: "입형률 최소", width: "1fr", align: "right", render: (r) => r.P_MIN_VALUE },
    ],
    [historyRows],
  )

  function handleExport() {
    exportRowsToCsv(
      "aggregate-particle.csv",
      ["순번", "날짜", "Time", "조립률 평균", "조립률 최대", "조립률 최소", "입형률 평균", "입형률 최대", "입형률 최소"],
      historyRows.map((r, i) => [
        i + 1,
        r.GETHERING_TIME.slice(0, 10),
        r.GETHERING_TIME.slice(11),
        r.A_AVG_VALUE,
        r.A_MAX_VALUE,
        r.A_MIN_VALUE,
        r.P_AVG_VALUE,
        r.P_MAX_VALUE,
        r.P_MIN_VALUE,
      ]),
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
      >
        <LineSelector value={effectiveLine} onChange={setSelectedLine} />
      </DateRangeSearchBar>

      <div className="grid grid-cols-1 gap-4 sm:grid-cols-2">
        <ChartCard
          title="조립률"
          icon={Gauge}
          badge={financeModulus !== undefined && <Badge variant="secondary">{financeModulus}%</Badge>}
          isLoading={isLoading || isFetching}
          isEmpty={graphA.length === 0}
          height={340}
        >
          <TrendLineChart
            labels={graphA.map((r) => r[1])}
            data={graphA.map((r) => r[2])}
            seriesLabel="F.M"
            yTitle="조립률 (%)"
            lowLine={lowLine}
            highLine={highLine}
          />
        </ChartCard>

        <ChartCard
          title="입형률"
          icon={Gauge}
          badge={shapeIndex !== undefined && <Badge variant="secondary">{shapeIndex}%</Badge>}
          isLoading={isLoading || isFetching}
          isEmpty={graphP.length === 0}
          height={340}
        >
          <TrendLineChart
            labels={graphP.map((r) => r[1])}
            data={graphP.map((r) => r[2])}
            seriesLabel="AVG_VALUE"
            yTitle="입형률"
          />
        </ChartCard>
      </div>

      <DataTable
        columns={tableColumns}
        rows={historyRows}
        getRowKey={(r, i) => `${r.BATCH_NO}-${i}`}
        onExport={handleExport}
      />
    </div>
  )
}
