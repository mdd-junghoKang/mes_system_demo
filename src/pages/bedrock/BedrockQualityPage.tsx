import { useMemo, useState } from "react"
import { AlertOctagon, AlertTriangle, ShieldAlert } from "lucide-react"

import { Checkbox } from "@/components/ui/checkbox"
import { Dialog, DialogContent, DialogHeader, DialogTitle } from "@/components/ui/dialog"
import { ChartCard } from "@/components/charts/ChartCard"
import { CountBarChart } from "@/components/charts/CountBarChart"
import { CardGrid } from "@/components/shared/CardGrid"
import { DateRangeSearchBar } from "@/components/shared/DateRangeSearchBar"
import { ProxyImage } from "@/components/shared/ProxyImage"
import { StatTile } from "@/components/shared/StatTile"
import { StatusBadge } from "@/components/shared/StatusBadge"
import { cn } from "@/lib/utils"
import { defaultDateRange, formatCompactDate, formatCompactTime } from "@/lib/dates"
import { STATUS_CONFIG, type StatusLevel } from "@/lib/status"
import { useBedrockData } from "@/hooks/useBedrockData"
import type { BedrockHistoryRow } from "@/types/bedrock"

// 알람 피드는 "지금 뭐가 떴는지" 빠르게 훑어보는 위젯이지, 전체를 다 보여주는 용도가
// 아니다. 실제 설비 이상 시 알람이 한꺼번에 몰릴 수 있어서 개수를 고정해두고, 전체
// 이력은 아래 카드 목록(정렬 가능)에서 보게 한다.
const ALARM_FEED_LIMIT = 5

// WARNING_LEVEL은 이 화면 고유의 원시값이라 공용 status.ts에는 안 두고, 여기서만
// 공용 5단계(StatusLevel)로 매핑한다. 실제 색상/아이콘은 전부 status.ts 토큰을 쓴다.
function warningToLevel(level: string): StatusLevel {
  if (level === "DANGER") return "danger"
  if (level === "CAUTION") return "caution"
  return "normal"
}

export function BedrockQualityPage() {
  const initial = defaultDateRange()
  const [draftRange, setDraftRange] = useState(initial)
  const [appliedRange, setAppliedRange] = useState(initial)
  const [selected, setSelected] = useState<BedrockHistoryRow | null>(null)
  const [dangerFirst, setDangerFirst] = useState(false)
  const [searchNonce, setSearchNonce] = useState(0)

  const { data, isLoading, isFetching, isError } = useBedrockData(appliedRange.start, appliedRange.end)

  const status = data?.status_data
  const alarms = (data?.alarm_data ?? []).slice(0, ALARM_FEED_LIMIT)
  const chart = data?.chart_data ?? []
  const showLoading = isLoading || isFetching

  const sortedHistory = useMemo(() => {
    const copy = [...(data?.history_data ?? [])]
    copy.sort((a, b) => `${b.GET_DATE}${b.GET_TIME}`.localeCompare(`${a.GET_DATE}${a.GET_TIME}`))
    if (dangerFirst) {
      copy.sort((a, b) => (a.WARNING_LEVEL === "DANGER" ? -1 : 0) - (b.WARNING_LEVEL === "DANGER" ? -1 : 0))
    }
    return copy
  }, [data, dangerFirst])

  return (
    <div className="flex flex-col gap-4">
      <DateRangeSearchBar
        start={draftRange.start}
        end={draftRange.end}
        onStartChange={(v) => setDraftRange((r) => ({ ...r, start: v }))}
        onEndChange={(v) => setDraftRange((r) => ({ ...r, end: v }))}
        onSearch={() => {
          setAppliedRange(draftRange)
          setSearchNonce((n) => n + 1)
        }}
      />

      <div className="grid grid-cols-1 gap-4 sm:grid-cols-4">
        <StatTile label="정상상태 (%)" value={status?.NORMAL_RATE} accent="green" />
        <StatTile label="주의레벨 (%)" value={status?.CAUTION_RATE} accent="amber" />
        <StatTile label="위험레벨 (%)" value={status?.DANGER_RATE} accent="red" />
        <StatTile label="총 검사량 (건)" value={status?.TOTAL_COUNT} accent="slate" />
      </div>

      <div className="grid grid-cols-1 gap-4 xl:grid-cols-3">
        <div className="xl:col-span-2">
          <ChartCard
            title="기층몰탈 이물 검사이력"
            icon={ShieldAlert}
            isLoading={showLoading}
            isError={isError}
            isEmpty={chart.length === 0}
            height={320}
          >
            <CountBarChart
              labels={chart.map((d) => d.GET_DATE)}
              series={[
                { label: "주의", data: chart.map((d) => d.CAUTION_COUNT), color: "#f59e0b" },
                { label: "위험", data: chart.map((d) => d.DANGER_COUNT), color: "#ef4444" },
              ]}
            />
          </ChartCard>
        </div>

        <div className="flex h-full flex-col rounded-lg border bg-background">
          <div className="flex items-center gap-2 border-b p-3">
            <AlertTriangle className="size-4 text-muted-foreground" />
            <span className="text-lg font-semibold">알람 피드</span>
            <span className="text-sm text-muted-foreground">최근 {ALARM_FEED_LIMIT}건</span>
          </div>
          <div className="flex flex-1 flex-col justify-center gap-2.5 p-3">
            {alarms.length === 0 ? (
              <p className="py-8 text-center text-sm text-muted-foreground">알람이 없습니다</p>
            ) : (
              alarms.map((alarm, i) => {
                const isDanger = alarm.WARNING_LEVEL === "DANGER"
                const Icon = isDanger ? AlertOctagon : AlertTriangle
                const level = warningToLevel(alarm.WARNING_LEVEL)
                return (
                  <div
                    key={i}
                    className={cn(
                      "flex items-center gap-3 rounded-md p-3 text-sm",
                      isDanger ? "bg-red-50 dark:bg-red-950/40" : "bg-amber-50 dark:bg-amber-950/40",
                    )}
                  >
                    <Icon className={cn("size-4 shrink-0", STATUS_CONFIG[level].textClassName)} />
                    <span className="flex-1 font-medium">
                      이물 <span className="tabular-nums">{alarm.AREA_CM}cm</span> 감지
                    </span>
                    <span className="shrink-0 text-xs text-muted-foreground">{alarm.TIME_AGO}</span>
                  </div>
                )
              })
            )}
          </div>
        </div>
      </div>

      <label className="flex items-center gap-2 text-sm">
        <Checkbox checked={dangerFirst} onCheckedChange={(v) => setDangerFirst(v === true)} />
        위험(DANGER) 먼저 보기
      </label>

      <CardGrid
        key={searchNonce}
        rows={sortedHistory}
        getRowKey={(r, i) => `${r.GET_DATE}-${r.GET_TIME}-${i}`}
        onCardClick={setSelected}
        accentClassName={(r) => STATUS_CONFIG[warningToLevel(r.WARNING_LEVEL)].accentClassName}
        isLoading={showLoading}
        isError={isError}
        renderCard={(row) => (
          <div className="flex flex-col gap-3">
            <p className="text-sm text-muted-foreground">
              {formatCompactDate(row.GET_DATE)} {formatCompactTime(row.GET_TIME)}
            </p>
            <p className="text-3xl font-bold tracking-tight">
              {row.AREA_CM}
              <span className="ml-1 text-sm font-normal text-muted-foreground">cm</span>
            </p>
            <StatusBadge level={warningToLevel(row.WARNING_LEVEL)} label={row.WARNING_LEVEL} className="w-fit" />
          </div>
        )}
      />

      <Dialog open={!!selected} onOpenChange={(open) => !open && setSelected(null)}>
        <DialogContent className="sm:max-w-2xl">
          <DialogHeader>
            <DialogTitle className="flex items-center gap-2">
              {selected && formatCompactDate(selected.GET_DATE)} {selected && formatCompactTime(selected.GET_TIME)}
              {selected && (
                <StatusBadge level={warningToLevel(selected.WARNING_LEVEL)} label={selected.WARNING_LEVEL} />
              )}
            </DialogTitle>
          </DialogHeader>
          {selected && (
            <div className="grid grid-cols-1 gap-4 sm:grid-cols-2">
              <ProxyImage path={selected.ORIGIN_IMG_FILE_PATH} label="원본 이미지" className="h-56 w-full" />
              <ProxyImage path={selected.RESULT_IMG_FILE_PATH} label="검출 결과" className="h-56 w-full" />
            </div>
          )}
        </DialogContent>
      </Dialog>
    </div>
  )
}
