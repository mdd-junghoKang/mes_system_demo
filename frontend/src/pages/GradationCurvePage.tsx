import { useMemo, useState } from "react"
import { Search } from "lucide-react"

import { Button } from "@/components/ui/button"
import { Checkbox } from "@/components/ui/checkbox"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select"
import { ChartCard } from "@/components/charts/ChartCard"
import { GradationCurveChart } from "@/components/charts/GradationCurveChart"
import { LineSelector } from "@/components/shared/LineSelector"
import { useAggInfo, sortedActiveLines } from "@/hooks/useAggInfo"
import { SIEVE_FIELDS, useGradationCurve, useGradationCurveBatch } from "@/hooks/useGradationCurve"
import { toDateInputValue } from "@/lib/dates"

export function GradationCurvePage() {
  const [draftDate, setDraftDate] = useState(toDateInputValue(new Date()))
  const [appliedDate, setAppliedDate] = useState(draftDate)
  const [selectedLine, setSelectedLine] = useState<string | null>(null)
  const [dustOnly, setDustOnly] = useState(false)
  const [drilldownBatch, setDrilldownBatch] = useState("")

  const aggInfoQuery = useAggInfo()
  const lineFilter = (line: { AGG_INFO: string }) =>
    dustOnly ? line.AGG_INFO.endsWith("_dust") : !line.AGG_INFO.endsWith("_dust")
  const lines = aggInfoQuery.data ? sortedActiveLines(aggInfoQuery.data.agg_info).filter(lineFilter) : []
  const effectiveLine = selectedLine ?? lines[0]?.LINE_INFO ?? null

  const { data, isLoading, isFetching } = useGradationCurve(appliedDate, effectiveLine)
  const drilldown = useGradationCurveBatch(appliedDate, effectiveLine, drilldownBatch)

  const avgList = data?.avg_data_list ?? []
  const lowLine = data?.low_data_list?.slice(1, 8)
  const highLine = data?.high_data_list?.slice(1, 8)

  const series = useMemo(
    () =>
      (data?.avg_data_list ?? []).map((row) => ({
        label: `입도분포 ${row.BATCH_NO}`,
        data: SIEVE_FIELDS.map((field) => row[field]),
      })),
    [data],
  )

  const drilldownSeries = drilldown.data?.single_batch
    ? [{ label: `입도분포 ${drilldownBatch}`, data: drilldown.data.single_batch }]
    : []

  return (
    <div className="flex flex-col gap-4">
      <div className="flex flex-col gap-4 rounded-lg border bg-background p-4 lg:flex-row lg:items-end lg:justify-between">
        <div className="flex flex-col gap-4 sm:flex-row sm:items-end sm:flex-wrap">
          <div className="grid gap-1.5">
            <Label htmlFor="curve-date">날짜</Label>
            <Input
              id="curve-date"
              type="date"
              value={draftDate}
              onChange={(e) => setDraftDate(e.target.value)}
              className="w-[160px]"
            />
          </div>
          <label className="flex items-center gap-2 pb-1.5 text-sm">
            <Checkbox
              checked={dustOnly}
              onCheckedChange={(v) => {
                setDustOnly(v === true)
                setSelectedLine(null)
              }}
            />
            석분 라인만 보기
          </label>
          <LineSelector value={effectiveLine} onChange={setSelectedLine} filter={lineFilter} />
        </div>
        <Button onClick={() => setAppliedDate(draftDate)} className="gap-2">
          <Search className="size-4" />
          조회
        </Button>
      </div>

      <ChartCard
        title="골재 입도분포 곡선"
        isLoading={isLoading || isFetching}
        isEmpty={series.length === 0}
        height={400}
      >
        <GradationCurveChart series={series} lowLine={lowLine} highLine={highLine} />
      </ChartCard>

      <div className="flex items-end gap-3 rounded-lg border bg-background p-4">
        <div className="grid gap-1.5">
          <Label>배치별 상세 보기</Label>
          <Select value={drilldownBatch} onValueChange={(v) => v && setDrilldownBatch(v)}>
            <SelectTrigger className="w-[200px]">
              <SelectValue placeholder="배치 선택" />
            </SelectTrigger>
            <SelectContent>
              {avgList.map((row) => (
                <SelectItem key={row.BATCH_NO} value={String(row.BATCH_NO)}>
                  {row.BATCH_NO}
                </SelectItem>
              ))}
            </SelectContent>
          </Select>
        </div>
      </div>

      {drilldownBatch && (
        <ChartCard
          title={`배치 ${drilldownBatch} 상세`}
          isLoading={drilldown.isLoading}
          isEmpty={drilldownSeries.length === 0}
          height={340}
        >
          <GradationCurveChart series={drilldownSeries} lowLine={lowLine} highLine={highLine} />
        </ChartCard>
      )}
    </div>
  )
}
