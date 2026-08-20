import { useState } from "react"
import { Search } from "lucide-react"

import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { ChartCard } from "@/components/charts/ChartCard"
import { CountBarChart } from "@/components/charts/CountBarChart"
import { MaterialDeviationChart } from "@/components/charts/MaterialDeviationChart"
import { DataTable, type DataTableColumn } from "@/components/shared/DataTable"
import { HourSelect } from "@/components/shared/HourSelect"
import { StatTile } from "@/components/shared/StatTile"
import { useMaterialMonitoring } from "@/hooks/useMaterialMonitoring"
import { defaultDateRange } from "@/lib/dates"
import type { MaterialDetailRow } from "@/types/monitoring"

const CATEGORIES = ["골재류", "시멘트류", "혼화제", "안료"] as const

export function MaterialMonitoringPage() {
  const initial = defaultDateRange()
  const [draft, setDraft] = useState({ ...initial, startHour: "00", endHour: "23" })
  const [applied, setApplied] = useState(draft)

  const { data, isLoading, isFetching, isError } = useMaterialMonitoring(
    applied.start,
    applied.startHour,
    applied.end,
    applied.endHour,
  )

  const summary = data?.monitoring_list?.SUMMARY?.[0]
  const category = data?.monitoring_list?.GRAPH1?.[0]
  const deviation = data?.monitoring_list?.GRAPH2 ?? []
  const rows = data?.monitoring_list?.ROW ?? []

  const columns: DataTableColumn<MaterialDetailRow>[] = [
    { key: "gubun", header: "카테고리", width: "1fr", render: (r) => r.GUBUN },
    { key: "name", header: "원자재명", width: "minmax(110px,1.5fr)", render: (r) => r.MAT_NAME },
    { key: "set", header: "설정량(kg)", width: "1fr", align: "right", render: (r) => r.SET },
    { key: "act", header: "실제량(kg)", width: "1fr", align: "right", render: (r) => r.ACT },
    { key: "def", header: "차이(kg)", width: "1fr", align: "right", render: (r) => r.DEF },
    { key: "def_rate", header: "차이율(%)", width: "1fr", align: "right", render: (r) => r.DEF_RATE },
    { key: "acc_rate", header: "정확도(%)", width: "1fr", align: "right", render: (r) => r.ACC_RATE },
  ]

  return (
    <div className="flex flex-col gap-4">
      <div className="flex flex-col gap-4 rounded-lg border bg-background p-4 lg:flex-row lg:items-end lg:justify-between">
        <div className="flex flex-col gap-4 sm:flex-row sm:items-end sm:flex-wrap">
          <div className="grid gap-1.5">
            <Label htmlFor="m-start">시작일</Label>
            <Input
              id="m-start"
              type="date"
              value={draft.start}
              onChange={(e) => setDraft((d) => ({ ...d, start: e.target.value }))}
              className="w-[150px]"
            />
          </div>
          <HourSelect value={draft.startHour} onChange={(v) => setDraft((d) => ({ ...d, startHour: v }))} />
          <div className="grid gap-1.5">
            <Label htmlFor="m-end">종료일</Label>
            <Input
              id="m-end"
              type="date"
              value={draft.end}
              onChange={(e) => setDraft((d) => ({ ...d, end: e.target.value }))}
              className="w-[150px]"
            />
          </div>
          <HourSelect value={draft.endHour} onChange={(v) => setDraft((d) => ({ ...d, endHour: v }))} />
        </div>
        <Button onClick={() => setApplied(draft)} className="gap-2">
          <Search className="size-4" />
          조회
        </Button>
      </div>

      <div className="grid grid-cols-1 gap-4 sm:grid-cols-3 lg:grid-cols-5">
        <StatTile
          label="설정 총량 (kg)"
          value={summary && Math.round(summary.SUM_SET)}
          accent="blue"
        />
        <StatTile
          label="실제 투입량 (kg)"
          value={summary && Math.round(summary.SUM_ACT)}
          accent="green"
        />
        <StatTile
          label="총 차이 (kg)"
          value={summary && Math.round(summary.SUM_DEF)}
          accent="red"
        />
        <StatTile label="차이율 (%)" value={summary?.SUM_DEFRATE} accent="amber" />
        <StatTile label="원자재 품목 (종)" value={summary?.QTY_MAT} accent="slate" />
      </div>

      <div className="grid grid-cols-1 gap-4 xl:grid-cols-2">
        <ChartCard
          title="카테고리별 설정 vs 실제"
          isLoading={isLoading || isFetching}
          isError={isError}
          isEmpty={!category}
          height={300}
        >
          <CountBarChart
            labels={[...CATEGORIES]}
            series={[
              {
                label: "설정량",
                data: CATEGORIES.map((c) => Number(category?.[`${c}_SET` as keyof typeof category] ?? 0)),
                color: "#76a9ff",
              },
              {
                label: "실제량",
                data: CATEGORIES.map((c) => Number(category?.[`${c}_ACT` as keyof typeof category] ?? 0)),
                color: "#63d08b",
              },
            ]}
          />
        </ChartCard>

        <ChartCard
          title="원자재별 차이율 (%)"
          isLoading={isLoading || isFetching}
          isError={isError}
          isEmpty={deviation.length === 0}
          height={300}
        >
          <MaterialDeviationChart
            labels={deviation.map((d) => d.MAT_NAME)}
            values={deviation.map((d) => d.DEF_RATE)}
          />
        </ChartCard>
      </div>

      <DataTable
        columns={columns}
        rows={rows}
        getRowKey={(r, i) => `${r.MAT_NAME}-${i}`}
        isLoading={isLoading || isFetching}
        isError={isError}
      />
    </div>
  )
}
