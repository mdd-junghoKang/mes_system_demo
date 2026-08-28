import { useState } from "react"
import { Search } from "lucide-react"

import { Button } from "@/components/ui/button"
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
import { HistogramChart } from "@/components/charts/HistogramChart"
import { SpcTrendChart } from "@/components/charts/SpcTrendChart"
import { TrendLineChart } from "@/components/charts/TrendLineChart"
import { HourSelect } from "@/components/shared/HourSelect"
import { StatTile } from "@/components/shared/StatTile"
import { useQualityDetail, useQualityItems } from "@/hooks/useQualityMonitoring"
import { defaultDateRange } from "@/lib/dates"

function distributionSeries(rows: Record<string, number>[] | undefined, valueField: string) {
  if (!rows) return { labels: [], counts: [] }
  return { labels: rows.map((r) => r[valueField]), counts: rows.map((r) => r.CNT) }
}

// 치수 요약 타일은 아래 SPC 차트와 같은 UCL/LCL 기준으로 판정한다 — 기준 없이
// 그냥 파란색을 기본값으로 깔면 색이 아무 의미도 전달하지 못한다.
function dimensionAccent(
  value: number | undefined,
  lcl: number | undefined,
  ucl: number | undefined,
): "green" | "red" | "slate" {
  if (value === undefined || lcl === undefined || ucl === undefined) return "slate"
  return value >= lcl && value <= ucl ? "green" : "red"
}

export function QualityMonitoringPage() {
  const initial = defaultDateRange()
  const [draftRange, setDraftRange] = useState(initial)
  const [appliedRange, setAppliedRange] = useState(initial)
  const [startHour, setStartHour] = useState("00")
  const [endHour, setEndHour] = useState("23")
  const [itemCd, setItemCd] = useState("")

  const itemsQuery = useQualityItems(appliedRange.start, appliedRange.end)
  const uniqueItems = Array.from(new Set((itemsQuery.data?.item_list ?? []).map((r) => r.INJECT_002)))
  const effectiveItemCd = itemCd || uniqueItems[0] || ""

  const { data, isLoading, isFetching, isError } = useQualityDetail(
    appliedRange.start,
    appliedRange.end,
    effectiveItemCd,
  )

  const summary = data?.summary.summary
  const raw = data?.dimension.raw ?? []
  const limit = data?.dimension.limit
  const dist = data?.distributions

  const cycleDist = distributionSeries(dist?.cycle, "CYCLE_TIME")
  const pressDist = distributionSeries(dist?.press, "PRESS_TIME")
  const h1Dist = distributionSeries(dist?.height1, "HEIGHT_1_AVG")
  const h2Dist = distributionSeries(dist?.height2, "HEIGHT_2_AVG")
  const h3Dist = distributionSeries(dist?.height3, "HEIGHT_3_AVG")
  const weightDist = distributionSeries(dist?.weight, "WEIGHT")

  return (
    <div className="flex flex-col gap-4">
      <div className="flex flex-col gap-4 rounded-lg border bg-background p-4 lg:flex-row lg:items-end lg:justify-between">
        <div className="flex flex-col gap-4 sm:flex-row sm:items-end sm:flex-wrap">
          <div className="grid gap-1.5">
            <Label htmlFor="q-start">시작일</Label>
            <Input
              id="q-start"
              type="date"
              value={draftRange.start}
              onChange={(e) => setDraftRange((r) => ({ ...r, start: e.target.value }))}
              className="w-[150px]"
            />
          </div>
          <HourSelect value={startHour} onChange={setStartHour} />
          <div className="grid gap-1.5">
            <Label htmlFor="q-end">종료일</Label>
            <Input
              id="q-end"
              type="date"
              value={draftRange.end}
              onChange={(e) => setDraftRange((r) => ({ ...r, end: e.target.value }))}
              className="w-[150px]"
            />
          </div>
          <HourSelect value={endHour} onChange={setEndHour} />
          <div className="grid gap-1.5">
            <Label>품목</Label>
            <Select value={effectiveItemCd} onValueChange={(v) => v && setItemCd(v)}>
              <SelectTrigger className="w-60">
                <SelectValue placeholder="품목 선택" />
              </SelectTrigger>
              <SelectContent>
                {uniqueItems.map((name) => (
                  <SelectItem key={name} value={name}>
                    {name}
                  </SelectItem>
                ))}
              </SelectContent>
            </Select>
          </div>
        </div>
        <Button onClick={() => setAppliedRange(draftRange)} className="gap-2">
          <Search className="size-4" />
          조회
        </Button>
      </div>

      <div className="grid grid-cols-1 gap-4 sm:grid-cols-2 lg:grid-cols-3">
        <StatTile
          label="평균 치수1 (mm)"
          value={summary?.HEIGHT_1_AVG}
          accent={dimensionAccent(summary?.HEIGHT_1_AVG, limit?.LCL, limit?.UCL)}
        />
        <StatTile
          label="평균 치수2 (mm)"
          value={summary?.HEIGHT_2_AVG}
          accent={dimensionAccent(summary?.HEIGHT_2_AVG, limit?.LCL, limit?.UCL)}
        />
        <StatTile
          label="평균 치수3 (mm)"
          value={summary?.HEIGHT_3_AVG}
          accent={dimensionAccent(summary?.HEIGHT_3_AVG, limit?.LCL, limit?.UCL)}
        />
        <StatTile label="평균 사이클타임 (sec)" value={summary?.CYCLE_TIME} accent="slate" />
        <StatTile label="평균 프레스타임 (sec)" value={summary?.PRESS_TIME} accent="slate" />
        <StatTile label="평균 중량 (Kg)" value={summary?.WEIGHT} accent="slate" />
      </div>

      <ChartCard
        title={limit ? `${limit.HEIGHT}T 치수 추이` : "치수 추이"}
        isLoading={isLoading || isFetching}
        isError={isError}
        isEmpty={raw.length === 0}
        height={340}
      >
        <SpcTrendChart
          labels={raw.map((r) => r.INDATE)}
          dim1={raw.map((r) => r.HEIGHT_1_AVG)}
          dim2={raw.map((r) => r.HEIGHT_2_AVG)}
          dim3={raw.map((r) => r.HEIGHT_3_AVG)}
          yTitle="치수 (mm)"
          ucl={limit?.UCL}
          lcl={limit?.LCL}
          avg={limit?.AVG_VALUE}
        />
      </ChartCard>
      {limit && (
        <div className="grid grid-cols-2 gap-4 sm:grid-cols-4">
          <StatTile label="UCL" value={limit.UCL} accent="slate" />
          <StatTile label="평균" value={limit.AVG_VALUE} accent="slate" />
          <StatTile label="LCL" value={limit.LCL} accent="slate" />
          <StatTile label="CPK" value={limit.CPK} accent="slate" />
        </div>
      )}

      <div className="grid grid-cols-1 gap-4 sm:grid-cols-3">
        <ChartCard title="치수1 분포" isLoading={isLoading} isError={isError} isEmpty={h1Dist.labels.length === 0} height={240}>
          <HistogramChart labels={h1Dist.labels} counts={h1Dist.counts} />
        </ChartCard>
        <ChartCard title="치수2 분포" isLoading={isLoading} isError={isError} isEmpty={h2Dist.labels.length === 0} height={240}>
          <HistogramChart labels={h2Dist.labels} counts={h2Dist.counts} color="#16a34a" />
        </ChartCard>
        <ChartCard title="치수3 분포" isLoading={isLoading} isError={isError} isEmpty={h3Dist.labels.length === 0} height={240}>
          <HistogramChart labels={h3Dist.labels} counts={h3Dist.counts} color="#ea580c" />
        </ChartCard>
        <ChartCard title="사이클타임 분포" isLoading={isLoading} isError={isError} isEmpty={cycleDist.labels.length === 0} height={240}>
          <HistogramChart labels={cycleDist.labels} counts={cycleDist.counts} color="#7c3aed" />
        </ChartCard>
        <ChartCard title="프레스타임 분포" isLoading={isLoading} isError={isError} isEmpty={pressDist.labels.length === 0} height={240}>
          <HistogramChart labels={pressDist.labels} counts={pressDist.counts} color="#0891b2" />
        </ChartCard>
        <ChartCard title="중량 분포" isLoading={isLoading} isError={isError} isEmpty={weightDist.labels.length === 0} height={240}>
          <HistogramChart labels={weightDist.labels} counts={weightDist.counts} color="#db2777" />
        </ChartCard>
      </div>

      <ChartCard title="중량 추이" isLoading={isLoading} isError={isError} isEmpty={raw.length === 0} height={260}>
        <TrendLineChart
          labels={raw.map((r) => r.INDATE)}
          data={raw.map((r) => r.WEIGHT)}
          seriesLabel="WEIGHT"
          yTitle="중량 (Kg)"
        />
      </ChartCard>
    </div>
  )
}
