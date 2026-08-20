import { useMemo, useState } from "react"
import { AlertOctagon, AlertTriangle, ShieldAlert } from "lucide-react"

import { Badge } from "@/components/ui/badge"
import { Button } from "@/components/ui/button"
import { Dialog, DialogContent, DialogHeader, DialogTitle } from "@/components/ui/dialog"
import { ChartCard } from "@/components/charts/ChartCard"
import { CountBarChart } from "@/components/charts/CountBarChart"
import { DataTable, type DataTableColumn } from "@/components/shared/DataTable"
import { DateRangeSearchBar } from "@/components/shared/DateRangeSearchBar"
import { ProxyImage } from "@/components/shared/ProxyImage"
import { StatTile } from "@/components/shared/StatTile"
import { cn } from "@/lib/utils"
import { defaultDateRange, formatCompactDate, formatCompactTime } from "@/lib/dates"
import { useBedrockData } from "@/hooks/useBedrockData"
import type { BedrockHistoryRow } from "@/types/bedrock"

// 알람 피드는 "지금 뭐가 떴는지" 빠르게 훑어보는 위젯이지, 전체를 다 보여주는 용도가
// 아니다. 실제 설비 이상 시 알람이 한꺼번에 몰릴 수 있어서 개수를 고정해두고, 전체
// 이력은 아래 페이지네이션 표(정렬 가능)에서 보게 한다.
const ALARM_FEED_LIMIT = 5

function levelBadgeClass(level: string) {
  if (level === "DANGER") return "bg-red-100 text-red-700 dark:bg-red-950 dark:text-red-300"
  if (level === "CAUTION") return "bg-amber-100 text-amber-700 dark:bg-amber-950 dark:text-amber-300"
  return "bg-emerald-100 text-emerald-700 dark:bg-emerald-950 dark:text-emerald-300"
}

export function BedrockQualityPage() {
  const initial = defaultDateRange()
  const [draftRange, setDraftRange] = useState(initial)
  const [appliedRange, setAppliedRange] = useState(initial)
  const [selected, setSelected] = useState<BedrockHistoryRow | null>(null)

  const { data, isLoading, isFetching, isError } = useBedrockData(appliedRange.start, appliedRange.end)

  const status = data?.status_data
  const alarms = (data?.alarm_data ?? []).slice(0, ALARM_FEED_LIMIT)
  const chart = data?.chart_data ?? []

  const sortedHistory = useMemo(() => {
    const copy = [...(data?.history_data ?? [])]
    copy.sort((a, b) => `${b.GET_DATE}${b.GET_TIME}`.localeCompare(`${a.GET_DATE}${a.GET_TIME}`))
    return copy
  }, [data])

  const columns: DataTableColumn<BedrockHistoryRow>[] = [
    { key: "date", header: "날짜", width: "1fr", render: (r) => formatCompactDate(r.GET_DATE) },
    { key: "time", header: "시간", width: "1fr", render: (r) => formatCompactTime(r.GET_TIME) },
    { key: "area", header: "이물 크기(cm)", width: "1fr", align: "right", render: (r) => r.AREA_CM },
    {
      key: "level",
      header: "경고레벨",
      width: "1fr",
      align: "center",
      // ag-grid 자체 정렬 기능을 그대로 쓴다 — 커스텀 토글 버튼 대신 sortValue만
      // 넘기면 헤더 클릭으로 정렬되고, DANGER가 오름차순에서 먼저 오도록 값만 매핑한다.
      sortValue: (r) => (r.WARNING_LEVEL === "DANGER" ? 0 : 1),
      render: (r) => (
        <Badge variant="secondary" className={levelBadgeClass(r.WARNING_LEVEL)}>
          {r.WARNING_LEVEL}
        </Badge>
      ),
    },
    {
      key: "image",
      header: "이미지",
      width: "1fr",
      align: "center",
      render: (r) => (
        <Button size="sm" variant="outline" onClick={() => setSelected(r)}>
          보기
        </Button>
      ),
    },
  ]

  return (
    <div className="flex flex-col gap-4">
      <DateRangeSearchBar
        start={draftRange.start}
        end={draftRange.end}
        onStartChange={(v) => setDraftRange((r) => ({ ...r, start: v }))}
        onEndChange={(v) => setDraftRange((r) => ({ ...r, end: v }))}
        onSearch={() => setAppliedRange(draftRange)}
      />

      <div className="grid grid-cols-1 gap-4 sm:grid-cols-4">
        <StatTile label="정상상태" value={status?.NORMAL_RATE} suffix="%" accent="green" />
        <StatTile label="주의레벨" value={status?.CAUTION_RATE} suffix="%" accent="amber" />
        <StatTile label="위험레벨" value={status?.DANGER_RATE} suffix="%" accent="red" />
        <StatTile label="총 검사량" value={status?.TOTAL_COUNT} suffix="건" accent="slate" />
      </div>

      <div className="grid grid-cols-1 gap-4 xl:grid-cols-3">
        <div className="xl:col-span-2">
          <ChartCard
            title="기층몰탈 이물 검사이력"
            icon={ShieldAlert}
            isLoading={isLoading || isFetching}
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
          <div className="flex items-center gap-2 border-b p-3 text-sm font-semibold">
            <AlertTriangle className="size-4 text-muted-foreground" />
            알람 피드
            <span className="font-normal text-muted-foreground">최근 {ALARM_FEED_LIMIT}건</span>
          </div>
          <div className="flex flex-1 flex-col justify-center gap-2.5 p-3">
            {alarms.length === 0 ? (
              <p className="py-8 text-center text-sm text-muted-foreground">알람이 없습니다</p>
            ) : (
              alarms.map((alarm, i) => {
                const isDanger = alarm.WARNING_LEVEL === "DANGER"
                const Icon = isDanger ? AlertOctagon : AlertTriangle
                return (
                  <div
                    key={i}
                    className={cn(
                      "flex items-center gap-3 rounded-md p-3 text-sm",
                      isDanger
                        ? "bg-red-50 dark:bg-red-950/40"
                        : "bg-amber-50 dark:bg-amber-950/40",
                    )}
                  >
                    <Icon
                      className={cn(
                        "size-4 shrink-0",
                        isDanger ? "text-red-600 dark:text-red-400" : "text-amber-600 dark:text-amber-400",
                      )}
                    />
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

      <DataTable
        columns={columns}
        rows={sortedHistory}
        getRowKey={(r, i) => `${r.GET_DATE}-${r.GET_TIME}-${i}`}
        isLoading={isLoading || isFetching}
        isError={isError}
      />

      <Dialog open={!!selected} onOpenChange={(open) => !open && setSelected(null)}>
        <DialogContent className="sm:max-w-2xl">
          <DialogHeader>
            <DialogTitle className="flex items-center gap-2">
              {selected && formatCompactDate(selected.GET_DATE)} {selected && formatCompactTime(selected.GET_TIME)}
              {selected && (
                <Badge variant="secondary" className={levelBadgeClass(selected.WARNING_LEVEL)}>
                  {selected.WARNING_LEVEL}
                </Badge>
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
