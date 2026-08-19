import { useMemo, useState } from "react"
import { AlertTriangle, ShieldAlert } from "lucide-react"

import { Badge } from "@/components/ui/badge"
import { Button } from "@/components/ui/button"
import { Dialog, DialogContent, DialogHeader, DialogTitle } from "@/components/ui/dialog"
import { ChartCard } from "@/components/charts/ChartCard"
import { CountBarChart } from "@/components/charts/CountBarChart"
import { DataTable, type DataTableColumn } from "@/components/shared/DataTable"
import { DateRangeSearchBar } from "@/components/shared/DateRangeSearchBar"
import { ProxyImage } from "@/components/shared/ProxyImage"
import { SortableHeader } from "@/components/shared/SortableHeader"
import { StatTile } from "@/components/shared/StatTile"
import { cn } from "@/lib/utils"
import { defaultDateRange } from "@/lib/dates"
import { useBedrockData } from "@/hooks/useBedrockData"
import type { BedrockHistoryRow } from "@/types/bedrock"

function levelBadgeClass(level: string) {
  if (level === "DANGER") return "bg-red-100 text-red-700 dark:bg-red-950 dark:text-red-300"
  if (level === "CAUTION") return "bg-amber-100 text-amber-700 dark:bg-amber-950 dark:text-amber-300"
  return "bg-emerald-100 text-emerald-700 dark:bg-emerald-950 dark:text-emerald-300"
}

export function BedrockQualityPage() {
  const initial = defaultDateRange()
  const [draftRange, setDraftRange] = useState(initial)
  const [appliedRange, setAppliedRange] = useState(initial)
  const [dangerFirst, setDangerFirst] = useState(false)
  const [selected, setSelected] = useState<BedrockHistoryRow | null>(null)

  const { data, isLoading, isFetching } = useBedrockData(appliedRange.start, appliedRange.end)

  const status = data?.status_data
  const alarms = data?.alarm_data ?? []
  const chart = data?.chart_data ?? []

  const sortedHistory = useMemo(() => {
    const copy = [...(data?.history_data ?? [])]
    copy.sort((a, b) => `${b.GET_DATE}${b.GET_TIME}`.localeCompare(`${a.GET_DATE}${a.GET_TIME}`))
    if (dangerFirst) {
      copy.sort((a, b) => (a.WARNING_LEVEL === "DANGER" ? -1 : 0) - (b.WARNING_LEVEL === "DANGER" ? -1 : 0))
    }
    return copy
  }, [data, dangerFirst])

  const columns: DataTableColumn<BedrockHistoryRow>[] = [
    { key: "date", header: "날짜", width: "1fr", render: (r) => r.GET_DATE },
    { key: "time", header: "시간", width: "1fr", render: (r) => r.GET_TIME },
    { key: "area", header: "이물 크기(cm)", width: "1fr", align: "right", render: (r) => r.AREA_CM },
    {
      key: "level",
      width: "1fr",
      align: "center",
      header: <SortableHeader label="경고레벨" onClick={() => setDangerFirst((v) => !v)} />,
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

        <div className="rounded-lg border bg-background">
          <div className="flex items-center gap-2 border-b p-3 text-sm font-semibold">
            <AlertTriangle className="size-4 text-muted-foreground" />
            알람 피드
          </div>
          <div className="flex max-h-[320px] flex-col gap-2 overflow-y-auto p-3">
            {alarms.length === 0 ? (
              <p className="py-8 text-center text-sm text-muted-foreground">알람이 없습니다</p>
            ) : (
              alarms.map((alarm, i) => (
                <div key={i} className="flex items-center gap-2 rounded-md border p-2 text-sm">
                  <span
                    className={cn(
                      "size-2 shrink-0 rounded-full",
                      alarm.WARNING_LEVEL === "DANGER" ? "bg-red-500" : "bg-amber-500",
                    )}
                  />
                  <span className="flex-1">이물 {alarm.AREA_CM}cm 감지</span>
                  <span className="text-xs text-muted-foreground">{alarm.TIME_AGO}</span>
                </div>
              ))
            )}
          </div>
        </div>
      </div>

      <DataTable
        columns={columns}
        rows={sortedHistory}
        getRowKey={(r, i) => `${r.GET_DATE}-${r.GET_TIME}-${i}`}
      />

      <Dialog open={!!selected} onOpenChange={(open) => !open && setSelected(null)}>
        <DialogContent className="sm:max-w-2xl">
          <DialogHeader>
            <DialogTitle className="flex items-center gap-2">
              {selected?.GET_DATE} {selected?.GET_TIME}
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
