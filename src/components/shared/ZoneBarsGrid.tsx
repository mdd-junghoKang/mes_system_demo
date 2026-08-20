import { cn } from "@/lib/utils"

function zoneColor(diff: number) {
  if (diff >= 2) return "bg-red-500"
  if (diff >= 1) return "bg-amber-500"
  return "bg-emerald-500"
}

const ZONE_TAGS = ["05", "06", "07", "08", "09", "10", "11", "12", "13"]

type Props = {
  height: number | null | undefined
  getValue: (tag: string) => number
}

export function ZoneBarsGrid({ height, getValue }: Props) {
  const hasReference = typeof height === "number" && height > 0

  return (
    <div className="grid grid-cols-3 gap-2 sm:grid-cols-9">
      {ZONE_TAGS.map((tag) => {
        const value = getValue(tag)
        const diff = hasReference ? Math.abs(value - height) : null
        return (
          <div key={tag} className="flex flex-col items-center gap-1 rounded-md border p-2">
            <span className="text-[10px] text-muted-foreground">Z{tag}</span>
            <span
              className={cn("size-2 rounded-full", diff === null ? "bg-muted-foreground/30" : zoneColor(diff))}
            />
            <span className="text-xs font-medium">{value}</span>
          </div>
        )
      })}
    </div>
  )
}
