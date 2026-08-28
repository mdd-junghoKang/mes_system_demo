import { DialogContent, DialogHeader, DialogTitle } from "@/components/ui/dialog"
import { DataTable, type DataTableColumn } from "@/components/shared/DataTable"
import type { MixCardRow } from "@/types/lotCardData"

export function MixCardModal({ rows }: { rows: MixCardRow[] }) {
  const columns: DataTableColumn<MixCardRow>[] = [
    { key: "gubun", header: "카테고리", width: "1fr", render: (r) => r.GUBUN },
    { key: "name", header: "원자재명", width: "minmax(110px,1.5fr)", render: (r) => r.MAT_NAME },
    { key: "set", header: "설정량", width: "1fr", align: "right", render: (r) => r.SET },
    { key: "act", header: "실제량", width: "1fr", align: "right", render: (r) => r.ACT },
    { key: "def", header: "차이", width: "1fr", align: "right", render: (r) => r.DEF },
    { key: "def_rate", header: "차이율", width: "1fr", align: "right", render: (r) => `${r.DEF_RATE}%` },
    { key: "acc_rate", header: "정확도", width: "1fr", align: "right", render: (r) => `${r.ACC_RATE}%` },
  ]

  return (
    <DialogContent className="sm:max-w-3xl">
      <DialogHeader>
        <DialogTitle>믹싱 상세 (원자재별 배합 상세)</DialogTitle>
      </DialogHeader>
      <DataTable columns={columns} rows={rows} getRowKey={(r, i) => `${r.MAT_NAME}-${i}`} maxHeight={360} />
    </DialogContent>
  )
}
