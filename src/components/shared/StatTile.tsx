import type { ReactNode } from "react"
import { motion } from "motion/react"
import { cn } from "@/lib/utils"

type Props = {
  label: string
  value: string | number | null | undefined
  suffix?: string
  accent?: "blue" | "green" | "red" | "amber" | "slate"
  emptyMessage?: string
  icon?: ReactNode
}

const accentBar: Record<NonNullable<Props["accent"]>, string> = {
  blue: "bg-blue-500",
  green: "bg-emerald-500",
  red: "bg-red-500",
  amber: "bg-amber-500",
  slate: "bg-slate-500",
}

export function StatTile({ label, value, suffix, accent = "blue", emptyMessage, icon }: Props) {
  const isEmpty = value === null || value === undefined || value === ""
  const displayValue = typeof value === "number" ? value.toLocaleString() : (value ?? "")
  const fullText = suffix ? `${displayValue} ${suffix}` : String(displayValue)
  // 값+단위를 한 줄로 유지하되, 자릿수가 큰 값("41,987.6 kg")까지 text-2xl로 두면
  // 카드 밖으로 넘쳐 잘린다. 길이에 따라 폰트를 한 단계씩 줄여서 항상 한 줄에 들어가게 한다.
  const valueSizeClass = fullText.length > 11 ? "text-lg" : fullText.length > 8 ? "text-xl" : "text-2xl"
  const suffixSizeClass = fullText.length > 8 ? "text-sm" : "text-base"

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
          <p className="whitespace-nowrap text-[11px] text-muted-foreground">{label}</p>
          {isEmpty ? (
            <p className="mt-1 text-sm text-muted-foreground">
              {emptyMessage ?? "해당되는 데이터가 없습니다"}
            </p>
          ) : (
            <p className={cn("mt-1 whitespace-nowrap font-semibold tabular-nums", valueSizeClass)}>
              {displayValue}
              {suffix && (
                <span className={cn("ml-1 font-normal text-muted-foreground", suffixSizeClass)}>{suffix}</span>
              )}
            </p>
          )}
        </div>
        {icon && <div className="text-muted-foreground">{icon}</div>}
      </div>
    </motion.div>
  )
}
