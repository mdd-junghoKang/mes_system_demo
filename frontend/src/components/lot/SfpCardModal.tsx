import { Badge } from "@/components/ui/badge"
import { DialogContent, DialogHeader, DialogTitle } from "@/components/ui/dialog"
import { ProxyImage } from "@/components/shared/ProxyImage"
import { formatCompactDate, formatCompactTime } from "@/lib/dates"
import type { SfpCardRow } from "@/types/lotCardData"

export function SfpCardModal({ row, colorQuality }: { row: SfpCardRow; colorQuality?: string }) {
  // colorQuality는 LotFlowVisualization이 넘겨주는 "반제품 검사 여부"(Y/N)이고,
  // row.CYCLE_STATE는 이 카드 자체의 판정값("OK"/"NG")이라 표기 형식이 다르다.
  // 그대로 "OK"랑만 비교하면 colorQuality가 있을 때 항상 NG로 잘못 표시된다.
  const source = colorQuality ?? row.CYCLE_STATE ?? ""
  const isOk = source === "Y" || source.split("_")[0] === "OK"

  return (
    <DialogContent className="sm:max-w-2xl">
      <DialogHeader>
        <DialogTitle className="flex items-center gap-2">
          반제품 검사
          <Badge variant={isOk ? "secondary" : "destructive"}>{isOk ? "OK" : "NG"}</Badge>
        </DialogTitle>
      </DialogHeader>
      <div className="grid grid-cols-1 gap-4 sm:grid-cols-3">
        <ProxyImage path={row.IMG_PATH} label="원본 이미지" className="h-40 w-full" />
        <ProxyImage path={row.DEFECT_DATA} label="패턴 검사" className="h-40 w-full" />
        <ProxyImage path={row.COLOR_DATA} label="컬러 검사" className="h-40 w-full" />
      </div>
      <p className="text-xs text-muted-foreground">
        {formatCompactDate(row.GET_DATE)} {formatCompactTime(row.GET_TIME)} · {row.DATA_NAME}
      </p>
    </DialogContent>
  )
}
