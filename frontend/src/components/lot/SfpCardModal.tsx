import { Badge } from "@/components/ui/badge"
import { DialogContent, DialogHeader, DialogTitle } from "@/components/ui/dialog"
import { ProxyImage } from "@/components/shared/ProxyImage"
import type { SfpCardRow } from "@/types/lotCardData"

export function SfpCardModal({ row, colorQuality }: { row: SfpCardRow; colorQuality?: string }) {
  const isOk = (colorQuality ?? row.CYCLE_STATE ?? "").split("_")[0] === "OK"

  return (
    <DialogContent className="max-w-2xl">
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
        {row.GET_DATE} {row.GET_TIME} · {row.DATA_NAME}
      </p>
    </DialogContent>
  )
}
