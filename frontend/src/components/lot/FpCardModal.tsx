import { DialogContent, DialogHeader, DialogTitle } from "@/components/ui/dialog"
import { ProxyImage } from "@/components/shared/ProxyImage"
import type { FpCardRow } from "@/types/lotCardData"

export function FpCardModal({ row }: { row: FpCardRow }) {
  return (
    <DialogContent className="sm:max-w-xl">
      <DialogHeader>
        <DialogTitle>완제품 검사</DialogTitle>
      </DialogHeader>
      <div className="grid grid-cols-1 gap-4 sm:grid-cols-2">
        <ProxyImage path={row.ORIGIN_IMG_FILE_PATH} label="검사 이미지" className="h-56 w-full" />
        <div className="rounded-md border p-3 text-sm">
          <dl className="grid grid-cols-[auto_1fr] gap-x-3 gap-y-1.5">
            <dt className="text-muted-foreground">품번</dt>
            <dd>{row.ITEM_CD}</dd>
            <dt className="text-muted-foreground">LOT No</dt>
            <dd>{row.LOT_NO}</dd>
            <dt className="text-muted-foreground">검사일시</dt>
            <dd>
              {row.GET_DATE} {row.GET_TIME}
            </dd>
          </dl>
        </div>
      </div>
    </DialogContent>
  )
}
