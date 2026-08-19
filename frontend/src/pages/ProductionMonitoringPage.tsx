import { useEffect, useState } from "react"

import { Badge } from "@/components/ui/badge"
import { ChartCard } from "@/components/charts/ChartCard"
import { MiniLineChart } from "@/components/charts/MiniLineChart"
import { StatTile } from "@/components/shared/StatTile"
import { ZoneBarsGrid } from "@/components/shared/ZoneBarsGrid"
import { MotionGaugeBars } from "@/components/shared/MotionGaugeBars"
import { useProdMonitoring } from "@/hooks/useProdMonitoring"
import { cn } from "@/lib/utils"

function formatScaled(raw: number) {
  const scaled = raw >= 10 ? raw / 10 : raw
  return Number(scaled.toFixed(2))
}

export function ProductionMonitoringPage() {
  const [now, setNow] = useState(new Date())
  useEffect(() => {
    const id = setInterval(() => setNow(new Date()), 1000)
    return () => clearInterval(id)
  }, [])

  const { data, isLoading } = useProdMonitoring()
  const current = data?.monitoring_list?.INJ_MONI?.[0]
  const graph1 = data?.monitoring_list?.INJ_MONI_GRAPH_1 ?? []
  const graph2 = data?.monitoring_list?.INJ_MONI_GRAPH_2 ?? []

  const isNormal = current?.PLAY_YN === "Y"
  const height = current?.HEIGHT ?? null

  return (
    <div className="flex flex-col gap-4">
      <div className="flex items-center justify-between rounded-lg border bg-background p-4">
        <div className="flex items-center gap-3">
          <span
            className={cn("size-2.5 rounded-full", isNormal ? "bg-emerald-500" : "bg-red-500")}
          />
          <span className="text-sm font-medium">{isNormal ? "정상운전" : "이상발생"}</span>
          <Badge variant="outline">15초마다 자동 갱신</Badge>
        </div>
        <span className="text-sm text-muted-foreground">
          {now.toLocaleString("ko-KR", { hour12: false })}
        </span>
      </div>

      <div className="grid grid-cols-1 gap-4 sm:grid-cols-3 lg:grid-cols-5">
        <StatTile label="제품명" value={current?.["INJECT_002"] as string} accent="slate" />
        <StatTile label="제품번호" value={current?.["INJECT_001"] as string} accent="slate" />
        <StatTile label="몰드명" value={current?.["INJECT_006"] as string} accent="slate" />
        <StatTile label="몰드번호" value={current?.["INJECT_005"] as string} accent="slate" />
        <StatTile
          label="사이클카운트"
          value={current ? Number(current["INJECT_003"] ?? 0) : undefined}
          accent="blue"
        />
      </div>

      <div className="grid grid-cols-1 gap-4 sm:grid-cols-2">
        <div className="rounded-lg border bg-background p-4">
          <p className="text-sm text-muted-foreground">중량</p>
          <p className="mt-1 text-2xl font-semibold">{current?.["INJECT_193"] ?? "-"} Kg</p>
        </div>
        <div className="grid grid-cols-2 gap-4">
          <div className="rounded-lg border bg-background p-4">
            <p className="text-sm text-muted-foreground">사이클 타임</p>
            <p className="mt-1 text-2xl font-semibold">
              {current ? formatScaled(Number(current["INJECT_106"] ?? 0)) : "-"}s
            </p>
          </div>
          <div className="rounded-lg border bg-background p-4">
            <p className="text-sm text-muted-foreground">프레스 타임</p>
            <p className="mt-1 text-2xl font-semibold">
              {current ? formatScaled(Number(current["INJECT_107"] ?? 0)) : "-"}s
            </p>
          </div>
        </div>
      </div>

      <div className="rounded-lg border bg-background p-4">
        <p className="mb-2 text-sm font-semibold">
          Zone 두께 편차 ({height !== null ? `기준 ${height}mm` : "기준 정보 없음"})
        </p>
        <ZoneBarsGrid height={height} getValue={(tag) => Number(current?.[`INJECT_Tag${tag}`] ?? 0)} />
      </div>

      <div className="grid grid-cols-1 gap-4 sm:grid-cols-2">
        <div className="rounded-lg border bg-background p-4">
          <p className="mb-2 text-sm font-semibold">모션 속도</p>
          <MotionGaugeBars getValue={(key) => Number(current?.[`INJECT_${key}`] ?? 0)} />
        </div>
        <div className="grid grid-cols-1 gap-4">
          <ChartCard title="사이클 타임 추이" isLoading={isLoading} isEmpty={graph1.length === 0} height={140}>
            <MiniLineChart
              labels={graph1.map((r) => r.INDATE)}
              values={graph1.map((r) => Number(r["INJECT_153"] ?? 0))}
              seriesLabel="사이클 타임"
              color="#2563eb"
            />
          </ChartCard>
          <ChartCard title="프레스 타임 추이" isLoading={isLoading} isEmpty={graph2.length === 0} height={140}>
            <MiniLineChart
              labels={graph2.map((r) => r.INDATE)}
              values={graph2.map((r) => Number(r["INJECT_106"] ?? 0))}
              seriesLabel="프레스 타임"
              color="#ea580c"
            />
          </ChartCard>
        </div>
      </div>
    </div>
  )
}
