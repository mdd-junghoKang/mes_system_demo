import type { ReactNode } from "react"
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

  return (
    <div className="overflow-hidden rounded-lg border bg-background">
      <div className={cn("h-1", accentBar[accent])} />
      <div className="flex items-center justify-between p-4">
        <div>
          <p className="whitespace-nowrap text-[11px] text-muted-foreground">{label}</p>
          {isEmpty ? (
            <p className="mt-1 text-sm text-muted-foreground">
              {emptyMessage ?? "해당되는 데이터가 없습니다"}
            </p>
          ) : (
            <p className="mt-1 text-2xl font-semibold tabular-nums">
              {typeof value === "number" ? value.toLocaleString() : value}
              {suffix && <span className="ml-1 text-base font-normal text-muted-foreground">{suffix}</span>}
            </p>
          )}
        </div>
        {icon && <div className="text-muted-foreground">{icon}</div>}
      </div>
    </div>
  )
}
