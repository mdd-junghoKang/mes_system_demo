import { useState } from "react"
import { Link } from "react-router-dom"
import {
  AlertOctagon,
  AlertTriangle,
  ChevronRight,
  Factory,
  Gauge,
  Recycle,
  Route,
  Ruler,
  ScanEye,
  Search,
  ShieldAlert,
} from "lucide-react"

import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { Badge } from "@/components/ui/badge"
import { StatusBadge } from "@/components/shared/StatusBadge"
import { cn } from "@/lib/utils"
import { ChartCard } from "@/components/charts/ChartCard"
import { TrendLineChart } from "@/components/charts/TrendLineChart"
import { CountBarChart } from "@/components/charts/CountBarChart"
import { LineSelector } from "@/components/shared/LineSelector"
import { StatTile } from "@/components/shared/StatTile"
import { STATUS_CONFIG } from "@/lib/status"
import { lotAccentClass, lotStatusLevel } from "@/lib/lotStatus"
import { useAggInfo, sortedActiveLines } from "@/hooks/useAggInfo"
import { useMainDashboardData } from "@/hooks/useMainDashboard"
import { useLotSearch } from "@/hooks/useLotTracking"
import { defaultDateRange } from "@/lib/dates"

// 패널 헤더의 "전체보기"는 장식이 아니라 실제 해당 기능의 전체 화면(카드뷰)으로
// 이동하는 링크다 — 메인 대시보드는 "요약"까지만 보여주고, 상세 조작/조치는
// 각 기능의 전용 화면에서 하게 한다.
function PanelViewAllLink({ to }: { to: string }) {
  return (
    <Link
      to={to}
      className="ml-auto flex shrink-0 items-center gap-0.5 text-sm text-muted-foreground hover:text-foreground"
    >
      전체보기
      <ChevronRight className="size-3.5" />
    </Link>
  )
}

// 알람 피드는 최근 상황을 빠르게 훑는 용도라 개수를 고정해둔다. 전체 이력은
// 기층몰탈 품질 검사 화면(카드뷰)에서 확인한다.
const ALARM_FEED_LIMIT = 5
const RECENT_LOT_LIMIT = 5

export function MainDashboardPage() {
  const initial = defaultDateRange()
  const [draftRange, setDraftRange] = useState(initial)
  const [appliedRange, setAppliedRange] = useState(initial)
  const [selectedLine, setSelectedLine] = useState<string | null>(null)

  const aggInfoQuery = useAggInfo()
  const allLines = aggInfoQuery.data?.agg_info ?? []
  const lines = aggInfoQuery.data ? sortedActiveLines(aggInfoQuery.data.agg_info) : []
  const effectiveLine = selectedLine ?? lines[0]?.LINE_INFO ?? null

  const dashboardQuery = useMainDashboardData(appliedRange.start, appliedRange.end, effectiveLine)
  const lotQuery = useLotSearch("", appliedRange.start, appliedRange.end)

  function handleSearch() {
    if (!draftRange.start || !draftRange.end || !effectiveLine) return
    setAppliedRange(draftRange)
  }

  const data = dashboardQuery.data
  const isLoading = dashboardQuery.isLoading || dashboardQuery.isFetching
  const isError = dashboardQuery.isError

  const graphA = data?.aggGraph.graph_data.graph_a ?? []
  const graphP = data?.aggGraph.graph_data.graph_p ?? []
  const lowLine = data?.aggGraph.assemble_data?.low_line
  const highLine = data?.aggGraph.assemble_data?.high_line

  const financeModulus = data?.assemble.assemble_rates[0]?.FINENESS_MODULUS
  const shapeIndex = data?.assemble.assemble_rates[0]?.SHAPE_INDEX
  const fmInRange =
    financeModulus !== undefined && lowLine !== undefined && highLine !== undefined
      ? financeModulus >= lowLine && financeModulus <= highLine
      : undefined

  const bedStatus = data?.bedStatus.status_data
  // 위험(DANGER)을 먼저 보여줘야 "지금 뭐가 제일 급한지"가 바로 보인다 — 알람 피드는
  // 단순 시간순 로그가 아니라 우선순위 중심의 요약이어야 한다.
  const bedAlarms = [...(data?.bedAlarms ?? [])]
    .sort((a, b) => (a.WARNING_LEVEL === "DANGER" ? -1 : 0) - (b.WARNING_LEVEL === "DANGER" ? -1 : 0))
    .slice(0, ALARM_FEED_LIMIT)
  const bedChart = data?.bedGraph.chart_data ?? []
  const semiChart = data?.semi.graph_data ?? []
  const productChart = data?.product.graph_data ?? []

  const recentLots = [...(lotQuery.data?.lot_tracking_list ?? [])]
    .sort((a, b) => `${b.WORK_DATE}${b.LOT_NO}`.localeCompare(`${a.WORK_DATE}${a.LOT_NO}`))
    .slice(0, RECENT_LOT_LIMIT)

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

      {/* 핵심 지표 */}
      <div className="grid grid-cols-2 gap-4 lg:grid-cols-4">
        <StatTile
          label="조립률 (F.M)"
          value={financeModulus}
          accent={fmInRange === undefined ? "blue" : fmInRange ? "green" : "amber"}
          icon={<Gauge className="size-5" />}
          caption={lowLine !== undefined && highLine !== undefined ? `정상 범위 ${lowLine}~${highLine}%` : undefined}
        />
        <StatTile label="입형률" value={shapeIndex} accent="slate" icon={<Ruler className="size-5" />} />
        <StatTile
          label="기층몰탈 위험 (건)"
          value={bedStatus?.DANGER_COUNT}
          accent={bedStatus && bedStatus.DANGER_COUNT > 0 ? "red" : "green"}
          icon={<ShieldAlert className="size-5" />}
        />
        <StatTile
          label="기층몰탈 총 검사량 (건)"
          value={bedStatus?.TOTAL_COUNT}
          accent="slate"
          icon={<ScanEye className="size-5" />}
        />
      </div>

      {/* 조립률 추이 — 가장 중요한 지표라 전체 폭으로 크게 보여준다 */}
      <ChartCard
        title="조립률 추이"
        icon={Gauge}
        badge={financeModulus !== undefined && <Badge variant="secondary">{financeModulus}%</Badge>}
        isLoading={isLoading}
        isError={isError}
        isEmpty={graphA.length === 0}
        height={340}
      >
        <TrendLineChart
          labels={graphA.map((r) => r[1])}
          data={graphA.map((r) => r[2])}
          seriesLabel="F.M"
          yTitle="조립률 (%)"
          valueSuffix="%"
          lowLine={lowLine}
          highLine={highLine}
        />
      </ChartCard>

      {/* 알람 피드 + 라인별 상태 */}
      <div className="grid grid-cols-1 gap-4 lg:grid-cols-2">
        <div className="flex h-full flex-col rounded-lg border bg-background">
          <div className="flex items-center gap-2 border-b p-3">
            <AlertTriangle className="size-4 text-muted-foreground" />
            <span className="text-lg font-semibold">알람 피드</span>
            <span className="text-sm text-muted-foreground">최근 {ALARM_FEED_LIMIT}건</span>
            <PanelViewAllLink to="/bedrock/quality/history" />
          </div>
          <div className="flex flex-1 flex-col justify-center gap-2.5 p-3">
            {bedAlarms.length === 0 ? (
              <p className="py-8 text-center text-sm text-muted-foreground">알람이 없습니다</p>
            ) : (
              bedAlarms.map((alarm, i) => {
                const isDanger = alarm.WARNING_LEVEL === "DANGER"
                const Icon = isDanger ? AlertOctagon : AlertTriangle
                const level = isDanger ? "danger" : "caution"
                return (
                  <div
                    key={i}
                    className={cn(
                      "flex items-center gap-3 rounded-md p-3 text-sm",
                      isDanger ? "bg-red-50 dark:bg-red-950/40" : "bg-amber-50 dark:bg-amber-950/40",
                    )}
                  >
                    <Icon className={cn("size-4 shrink-0", STATUS_CONFIG[level].textClassName)} />
                    <StatusBadge level={level} label={alarm.WARNING_LEVEL} className="shrink-0" />
                    <span className="flex-1 truncate font-medium">
                      이물 <span className="tabular-nums">{alarm.AREA_CM}cm</span> 감지
                    </span>
                    <span className="shrink-0 text-xs text-muted-foreground">{alarm.TIME_AGO}</span>
                  </div>
                )
              })
            )}
          </div>
        </div>

        <div className="flex h-full flex-col rounded-lg border bg-background">
          <div className="flex items-center gap-2 border-b p-3">
            <Factory className="size-4 text-muted-foreground" />
            <span className="text-lg font-semibold">라인별 상태</span>
            <PanelViewAllLink to="/system/lines" />
          </div>
          <div className="grid flex-1 grid-cols-2 gap-2.5 p-3 sm:grid-cols-3">
            {allLines.length === 0 ? (
              <p className="col-span-full py-8 text-center text-sm text-muted-foreground">라인 정보가 없습니다</p>
            ) : (
              allLines.map((line) => {
                const active = line.USE_YN !== "N"
                return (
                  <div
                    key={line.LINE_INFO}
                    className={cn(
                      "flex flex-col gap-1 rounded-md p-3",
                      active ? "bg-emerald-50 dark:bg-emerald-950/40" : "bg-muted",
                    )}
                  >
                    <div className="flex items-center gap-1.5">
                      <span className={cn("size-2 rounded-full", active ? "bg-emerald-500" : "bg-slate-400")} />
                      <span className="text-sm font-medium">{line.LINE_INFO}</span>
                    </div>
                    <span className="text-xs text-muted-foreground">
                      {line.AGG_INFO} · {active ? "가동" : "중지"}
                    </span>
                  </div>
                )
              })
            )}
          </div>
        </div>
      </div>

      {/* 최근 LOT 발행이력 */}
      <div className="flex flex-col rounded-lg border bg-background">
        <div className="flex items-center gap-2 border-b p-3">
          <Route className="size-4 text-muted-foreground" />
          <span className="text-lg font-semibold">최근 LOT 발행이력</span>
          <PanelViewAllLink to="/lot/history" />
        </div>
        <div className="grid grid-cols-1 gap-2.5 p-3 sm:grid-cols-3 lg:grid-cols-5">
          {recentLots.length === 0 ? (
            <p className="col-span-full py-8 text-center text-sm text-muted-foreground">LOT 이력이 없습니다</p>
          ) : (
            recentLots.map((lot) => (
              <Link
                key={lot.LOT_NO}
                to="/lot/history"
                className="overflow-hidden rounded-lg border ring-1 ring-black/5 transition-all hover:-translate-y-0.5 hover:shadow-md dark:ring-white/10"
              >
                <div
                  className={cn(
                    "h-1",
                    lotAccentClass([lot.COLOR_QUALITY, lot.APPEARANCE_QUALITY, lot.FINISHED_LOT]),
                  )}
                />
                <div className="p-3">
                  <p className="truncate text-sm font-bold tracking-tight">{lot.LOT_NO}</p>
                  <p className="mt-0.5 truncate text-xs text-muted-foreground">{lot.ITEM_NM}</p>
                  <p className="mt-1.5 text-xs text-muted-foreground">
                    {STATUS_CONFIG[lotStatusLevel([lot.COLOR_QUALITY, lot.APPEARANCE_QUALITY, lot.FINISHED_LOT])]
                      .label}
                  </p>
                </div>
              </Link>
            ))
          )}
        </div>
      </div>

      {/* 보조 지표 */}
      <div className="grid grid-cols-1 gap-4 xl:grid-cols-2">
        <ChartCard title="입형률 추이" icon={Gauge} isLoading={isLoading} isError={isError} isEmpty={graphP.length === 0} height={280}>
          <TrendLineChart
            labels={graphP.map((r) => r[1])}
            data={graphP.map((r) => r[2])}
            seriesLabel="AVG_VALUE"
            yTitle="입형률 (%)"
            valueSuffix="%"
          />
        </ChartCard>

        <ChartCard
          title="기층몰탈 이물 검사이력"
          icon={ScanEye}
          isLoading={isLoading}
          isError={isError}
          isEmpty={bedChart.length === 0}
          height={280}
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

      <div className="grid grid-cols-1 gap-4 xl:grid-cols-2">
        <ChartCard
          title="반제품 품질 검사이력"
          icon={Recycle}
          isLoading={isLoading}
          isError={isError}
          isEmpty={semiChart.length === 0}
          height={280}
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
          isError={isError}
          isEmpty={productChart.length === 0}
          height={280}
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
