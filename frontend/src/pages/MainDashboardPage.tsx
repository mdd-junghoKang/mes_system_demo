import { useState } from "react"
import { AlertTriangle, Gauge, Recycle, ScanEye, Search, ShieldAlert } from "lucide-react"

import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { Badge } from "@/components/ui/badge"
import { cn } from "@/lib/utils"
import { ChartCard } from "@/components/charts/ChartCard"
import { TrendLineChart } from "@/components/charts/TrendLineChart"
import { CountBarChart } from "@/components/charts/CountBarChart"
import { LineSelector } from "@/components/shared/LineSelector"
import { useAggInfo, sortedActiveLines } from "@/hooks/useAggInfo"
import { useMainDashboardData } from "@/hooks/useMainDashboard"
import { defaultDateRange } from "@/lib/dates"

export function MainDashboardPage() {
  const initial = defaultDateRange()
  const [draftRange, setDraftRange] = useState(initial)
  const [appliedRange, setAppliedRange] = useState(initial)
  const [selectedLine, setSelectedLine] = useState<string | null>(null)

  const aggInfoQuery = useAggInfo()
  const lines = aggInfoQuery.data ? sortedActiveLines(aggInfoQuery.data.agg_info) : []
  const effectiveLine = selectedLine ?? lines[0]?.LINE_INFO ?? null

  const dashboardQuery = useMainDashboardData(appliedRange.start, appliedRange.end, effectiveLine)

  function handleSearch() {
    if (!draftRange.start || !draftRange.end || !effectiveLine) return
    setAppliedRange(draftRange)
  }

  const data = dashboardQuery.data
  const isLoading = dashboardQuery.isLoading || dashboardQuery.isFetching

  const graphA = data?.aggGraph.graph_data.graph_a ?? []
  const graphP = data?.aggGraph.graph_data.graph_p ?? []
  const lowLine = data?.aggGraph.assemble_data?.low_line
  const highLine = data?.aggGraph.assemble_data?.high_line

  const financeModulus = data?.assemble.assemble_rates[0]?.FINENESS_MODULUS
  const shapeIndex = data?.assemble.assemble_rates[0]?.SHAPE_INDEX

  const bedStatus = data?.bedStatus.status_data
  const bedChart = data?.bedGraph.chart_data ?? []
  const semiChart = data?.semi.graph_data ?? []
  const productChart = data?.product.graph_data ?? []

  return (
    <div className="flex flex-col gap-4">
      {/* Search bar */}
      <div className="flex flex-col gap-4 rounded-lg border bg-background p-4 lg:flex-row lg:items-end lg:justify-between">
        <div className="flex flex-col gap-4 sm:flex-row sm:items-end">
          <div className="grid gap-1.5">
            <Label htmlFor="start-date">시작일</Label>
            <Input
              id="start-date"
              type="date"
              value={draftRange.start}
              max={draftRange.end}
              onChange={(e) => setDraftRange((r) => ({ ...r, start: e.target.value }))}
              className="w-[160px]"
            />
          </div>
          <div className="grid gap-1.5">
            <Label htmlFor="end-date">종료일</Label>
            <Input
              id="end-date"
              type="date"
              value={draftRange.end}
              min={draftRange.start}
              onChange={(e) => setDraftRange((r) => ({ ...r, end: e.target.value }))}
              className="w-[160px]"
            />
          </div>
          <LineSelector value={effectiveLine} onChange={setSelectedLine} />
        </div>
        <Button onClick={handleSearch} className="gap-2">
          <Search className="size-4" />
          조회
        </Button>
      </div>

      {/* Row 1: agg quality + bedrock */}
      <div className="grid grid-cols-1 gap-4 xl:grid-cols-3">
        <ChartCard
          title="조립률"
          icon={Gauge}
          badge={
            financeModulus !== undefined && (
              <Badge variant="secondary">{financeModulus}%</Badge>
            )
          }
          isLoading={isLoading}
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
          isLoading={isLoading}
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

        <ChartCard
          title="기층몰탈 이물 검사이력"
          icon={ScanEye}
          badge={
            bedStatus && (
              <Badge
                className={cn(
                  bedStatus.DANGER_COUNT > 0
                    ? "bg-red-100 text-red-700 dark:bg-red-950 dark:text-red-300"
                    : "bg-emerald-100 text-emerald-700 dark:bg-emerald-950 dark:text-emerald-300",
                )}
                variant="secondary"
              >
                <ShieldAlert className="size-3" />
                위험 {bedStatus.DANGER_COUNT}건 ({bedStatus.DANGER_RATE?.toFixed(3)}%)
              </Badge>
            )
          }
          isLoading={isLoading}
          isEmpty={bedChart.length === 0}
          height={340}
        >
          <CountBarChart
            labels={bedChart.map((d) => d.GET_DATE)}
            series={[
              { label: "주의", data: bedChart.map((d) => d.CAUTION_COUNT), color: "#f59e0b" },
              { label: "위험", data: bedChart.map((d) => d.DANGER_COUNT), color: "#ef4444" },
            ]}
          />
        </ChartCard>
      </div>

      {/* Row 2: semi-product + product */}
      <div className="grid grid-cols-1 gap-4 xl:grid-cols-2">
        <ChartCard
          title="반제품 품질 검사이력"
          icon={Recycle}
          isLoading={isLoading}
          isEmpty={semiChart.length === 0}
          height={320}
        >
          <CountBarChart
            labels={semiChart.map((d) => d.GET_DATE)}
            series={[
              { label: "Cycle Count", data: semiChart.map((d) => d.CYCLECOUNT), color: "#4f7dd1" },
              { label: "Defective Count", data: semiChart.map((d) => d.DEFECTIVE), color: "#d9534f" },
            ]}
          />
        </ChartCard>

        <ChartCard
          title="완제품 검사이력"
          icon={AlertTriangle}
          isLoading={isLoading}
          isEmpty={productChart.length === 0}
          height={320}
        >
          <CountBarChart
            labels={productChart.map((d) => d.GET_DATE)}
            series={[
              { label: "Cycle Count", data: productChart.map((d) => d.CYCLECOUNT), color: "#636ae8" },
              { label: "LOT NG", data: productChart.map((d) => d.LOTNG), color: "#de3b40" },
            ]}
          />
        </ChartCard>
      </div>
    </div>
  )
}
