import { useEffect, useState } from "react"

import { Badge } from "@/components/ui/badge"
import { AnimatedCard } from "@/components/shared/AnimatedCard"
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

  const { data, isLoading, isError } = useProdMonitoring()
  const current = data?.monitoring_list?.INJ_MONI?.[0]
  const graph1 = data?.monitoring_list?.INJ_MONI_GRAPH_1 ?? []
  const graph2 = data?.monitoring_list?.INJ_MONI_GRAPH_2 ?? []

  // current가 아직 없는 로딩 순간을 "이상발생"으로 잘못 취급하면 새로고침할 때마다
  // 빨간불이 잠깐 떴다가 정상으로 바뀌는 깜빡임이 생긴다. 데이터가 없는 동안은
  // 정상/이상 어느 쪽도 아닌 중립 상태로 둔다.
  const status = !current ? "unknown" : current.PLAY_YN === "Y" ? "normal" : "abnormal"
  const height = current?.HEIGHT ?? null

  return (
    <div className="flex flex-col gap-4">
      <AnimatedCard className="flex items-center justify-between">
        <div className="flex items-center gap-3">
          <span
            className={cn(
              "size-2.5 rounded-full",
              status === "normal" ? "bg-emerald-500" : status === "abnormal" ? "bg-red-500" : "bg-muted-foreground/40",
            )}
          />
          <span className="text-sm font-medium">
            {status === "normal" ? "정상운전" : status === "abnormal" ? "이상발생" : "확인 중"}
          </span>
          <Badge variant="outline">15초마다 자동 갱신</Badge>
        </div>
        <span className="text-sm text-muted-foreground">
          {now.toLocaleString("ko-KR", { hour12: false })}
        </span>
      </AnimatedCard>

      {/* 제품명/몰드명은 값 길이가 들쭉날쭉해서(예: "BLANDING STON 1 8T M") StatTile
          5개를 똑같은 폭으로 나란히 두면 긴 값만 줄바꿈되고 나머지 카드는 높이가
          맞춰지느라 아래쪽에 빈 공간이 남는다. 이름+번호를 한 카드로 묶어 넓은 폭을
          주고, truncate로 항상 한 줄을 유지해서 카드 높이가 흔들리지 않게 한다. */}
      <div className="grid grid-cols-1 gap-4 lg:grid-cols-3">
        <div className="grid grid-cols-1 gap-4 sm:grid-cols-2 lg:col-span-2">
          <AnimatedCard className="overflow-hidden">
            <p className="text-[11px] text-muted-foreground">제품명 · 제품번호</p>
            <p
              className="mt-1 truncate text-lg font-semibold"
              title={String(current?.["INJECT_002"] ?? "")}
            >
              {(current?.["INJECT_002"] as string) ?? "-"}
              <span className="ml-1.5 text-sm font-normal text-muted-foreground">
                ({(current?.["INJECT_001"] as string) ?? "-"})
              </span>
            </p>
          </AnimatedCard>
          <AnimatedCard className="overflow-hidden">
            <p className="text-[11px] text-muted-foreground">몰드명 · 몰드번호</p>
            <p
              className="mt-1 truncate text-lg font-semibold"
              title={String(current?.["INJECT_006"] ?? "")}
            >
              {(current?.["INJECT_006"] as string) ?? "-"}
              <span className="ml-1.5 text-sm font-normal text-muted-foreground">
                ({(current?.["INJECT_005"] as string) ?? "-"})
              </span>
            </p>
          </AnimatedCard>
        </div>
        <StatTile
          label="사이클카운트"
          value={current ? Number(current["INJECT_003"] ?? 0) : undefined}
          accent="blue"
        />
      </div>

      <div className="grid grid-cols-1 gap-4 sm:grid-cols-2">
        <AnimatedCard>
          <p className="text-sm text-muted-foreground">중량</p>
          <p className="mt-1 text-2xl font-semibold">{current?.["INJECT_193"] ?? "-"} Kg</p>
        </AnimatedCard>
        <div className="grid grid-cols-2 gap-4">
          <AnimatedCard>
            <p className="text-sm text-muted-foreground">사이클 타임</p>
            <p className="mt-1 text-2xl font-semibold">
              {current ? formatScaled(Number(current["INJECT_106"] ?? 0)) : "-"}s
            </p>
          </AnimatedCard>
          <AnimatedCard>
            <p className="text-sm text-muted-foreground">프레스 타임</p>
            <p className="mt-1 text-2xl font-semibold">
              {current ? formatScaled(Number(current["INJECT_107"] ?? 0)) : "-"}s
            </p>
          </AnimatedCard>
        </div>
      </div>

      <AnimatedCard>
        <p className="mb-2 text-sm font-semibold">
          Zone 두께 편차 ({height !== null ? `기준 ${height}mm` : "기준 정보 없음"})
        </p>
        <ZoneBarsGrid height={height} getValue={(tag) => Number(current?.[`INJECT_Tag${tag}`] ?? 0)} />
      </AnimatedCard>

      <div className="grid grid-cols-1 gap-4 sm:grid-cols-2">
        {/* 오른쪽엔 140px짜리 차트 카드가 2개 쌓여 있어서(헤더 포함 약 380px) 왼쪽
            "모션 속도" 카드가 원래 내용보다 큰 높이로 늘어난다. 세로 중앙 정렬은 제목
            바로 아래가 텅 비어 보여서 오히려 더 어색했다 — 대신 막대 자체를 키워서
            (두께·간격·글자 크기) 내용이 자연스럽게 더 채우도록 했다. */}
        <AnimatedCard>
          <p className="mb-3 text-sm font-semibold">모션 속도</p>
          <MotionGaugeBars getValue={(key) => Number(current?.[`INJECT_${key}`] ?? 0)} />
        </AnimatedCard>
        <div className="grid grid-cols-1 gap-4">
          <ChartCard
            title="사이클 타임 추이"
            isLoading={isLoading}
            isError={isError}
            isEmpty={graph1.length === 0}
            height={140}
          >
            <MiniLineChart
              labels={graph1.map((r) => r.INDATE)}
              values={graph1.map((r) => Number(r["INJECT_153"] ?? 0))}
              seriesLabel="사이클 타임"
              color="#2563eb"
            />
          </ChartCard>
          <ChartCard
            title="프레스 타임 추이"
            isLoading={isLoading}
            isError={isError}
            isEmpty={graph2.length === 0}
            height={140}
          >
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
