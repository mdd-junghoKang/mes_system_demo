import type { ReactNode } from "react"
import { motion } from "motion/react"
import { cn } from "@/lib/utils"

type Props = {
  label: string
  value: string | number | null | undefined
  accent?: "primary" | "blue" | "green" | "red" | "amber" | "slate"
  emptyMessage?: string
  icon?: ReactNode
  /** 값 아래에 작게 보여줄 보조 문구 (예: "정상 범위 5.55~5.85%"). */
  caption?: string
}

// "primary"(브랜드 teal)는 그 그룹에서 가장 중요한 핵심 지표 하나에만 쓴다.
// 실제 판정 기준(정상/주의/위험)이 있을 때만 green/amber/red를 쓰고, 판정 근거
// 없이 그냥 보여주기만 하는 수치는 slate로 둔다 — 예전엔 별 의미 없이 죄다
// blue를 기본값으로 썼는데, 그러면 색이 아무 정보도 전달 못 하고 화면만
// 단조로워진다.
const accentBar: Record<NonNullable<Props["accent"]>, string> = {
  primary: "bg-primary",
  blue: "bg-blue-500",
  green: "bg-emerald-500",
  red: "bg-red-500",
  amber: "bg-amber-500",
  slate: "bg-slate-500",
}

export function StatTile({ label, value, accent = "slate", emptyMessage, icon, caption }: Props) {
  const isEmpty = value === null || value === undefined || value === ""
  const displayValue = typeof value === "number" ? value.toLocaleString() : (value ?? "")
  // 값이 길면(자릿수가 큰 숫자 등) text-3xl로 고정 시 카드 밖으로 넘쳐 잘린다.
  // 길이에 따라 폰트를 한 단계씩 줄여서 줄바꿈 없이 항상 한 줄에 들어가게 한다.
  // KPI 숫자는 "멀리서도 바로 읽혀야 한다"는 요구사항 때문에 일반 텍스트보다
  // 확실히 큰 폭(text-3xl 기준)으로 잡는다.
  const valueSizeClass =
    String(displayValue).length > 11 ? "text-xl" : String(displayValue).length > 8 ? "text-2xl" : "text-3xl"

  return (
    <motion.div
      initial={{ opacity: 0, y: 12 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ duration: 0.35, ease: "easeOut" }}
      className="overflow-hidden rounded-lg border bg-background"
    >
      <div className={cn("h-1", accentBar[accent])} />
      <div className="flex items-center justify-between p-4">
        {/* flex 자식은 기본 min-width:auto라서 overflow-hidden인 카드 안에서도 안 줄어드는데,
            값은 줄바꿈 없이 한 줄을 유지해야 해서(대시보드 카드 스타일) min-w-0 + 길이 기반
            폰트 축소(valueSizeClass)로 항상 한 줄 안에 들어가게 한다. */}
        <div className="min-w-0">
          {/* 단위는 값 옆(suffix)이 아니라 라벨에 괄호로 적는다 — 이렇게 해야 값 자릿수가
              늘어나도 레이아웃이 안 흔들린다. 단위가 필요하면 label="정상상태 (%)"처럼 넘긴다. */}
          <p className="truncate text-xs text-muted-foreground" title={label}>
            {label}
          </p>
          {isEmpty ? (
            <p className="mt-1 text-sm text-muted-foreground">
              {emptyMessage ?? "해당되는 데이터가 없습니다"}
            </p>
          ) : (
            <>
              <p className={cn("mt-1 whitespace-nowrap font-semibold tabular-nums", valueSizeClass)}>
                {displayValue}
              </p>
              {caption && <p className="mt-0.5 truncate text-xs text-muted-foreground">{caption}</p>}
            </>
          )}
        </div>
        {icon && <div className="text-muted-foreground">{icon}</div>}
      </div>
    </motion.div>
  )
}
