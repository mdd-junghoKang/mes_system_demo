import { DialogContent, DialogHeader, DialogTitle } from "@/components/ui/dialog"
import { ZoneBarsGrid } from "@/components/shared/ZoneBarsGrid"
import { MotionGaugeBars } from "@/components/shared/MotionGaugeBars"
import type { MoldCardRow } from "@/types/lotCardData"

export function MoldCardModal({ row }: { row: MoldCardRow }) {
  const height = row.HEIGHT !== undefined && row.HEIGHT !== null ? Number(row.HEIGHT) : null
  const weight = row.INJECT_193

  return (
    <DialogContent className="sm:max-w-3xl">
      <DialogHeader>
        <DialogTitle>성형 상세</DialogTitle>
      </DialogHeader>

      <div className="grid grid-cols-1 gap-4 sm:grid-cols-2">
        <div className="rounded-md border p-3">
          <p className="text-xs text-muted-foreground">중량</p>
          <p className="text-2xl font-semibold">{weight} Kg</p>
        </div>
        <div className="rounded-md border p-3 text-xs text-muted-foreground">
          품번 {row.ITEM_CD} · LOT {row.LOT_NO} · 지시번호 {row.ORDER_NO}
        </div>
      </div>

      <div>
        <p className="mb-2 text-xs font-medium text-muted-foreground">
          Zone 두께 편차 ({height !== null ? `기준 ${height}mm` : "기준 정보 없음"})
        </p>
        <ZoneBarsGrid height={height} getValue={(tag) => Number(row[`INJECT_Tag${tag}`] ?? 0)} />
      </div>

      <div>
        <p className="mb-2 text-xs font-medium text-muted-foreground">모션 속도</p>
        <MotionGaugeBars getValue={(key) => Number(row[`INJECT_${key}`] ?? 0)} />
      </div>
    </DialogContent>
  )
}
