import { DialogContent, DialogHeader, DialogTitle } from "@/components/ui/dialog"
import { DataTable, type DataTableColumn } from "@/components/shared/DataTable"
import type { AggCardRow } from "@/types/lotCardData"

export function AggCardModal({ rows }: { rows: AggCardRow[] }) {
  const columns: DataTableColumn<AggCardRow>[] = [
    { key: "line", header: "라인", width: "1fr", render: (r) => r.LINE_INFO },
    { key: "a_avg", header: "조립률 평균", width: "1fr", align: "right", render: (r) => r.A_AVG_VALUE },
    { key: "a_max", header: "조립률 최대", width: "1fr", align: "right", render: (r) => r.A_MAX_VALUE },
    { key: "a_min", header: "조립률 최소", width: "1fr", align: "right", render: (r) => r.A_MIN_VALUE },
    { key: "p_avg", header: "입형률 평균", width: "1fr", align: "right", render: (r) => r.P_AVG_VALUE },
    { key: "p_max", header: "입형률 최대", width: "1fr", align: "right", render: (r) => r.P_MAX_VALUE },
    { key: "p_min", header: "입형률 최소", width: "1fr", align: "right", render: (r) => r.P_MIN_VALUE },
  ]

  return (
    <DialogContent className="max-w-3xl">
      <DialogHeader>
        <DialogTitle>골재입도 상세</DialogTitle>
      </DialogHeader>
      <DataTable columns={columns} rows={rows} getRowKey={(r, i) => `${r.LINE_INFO}-${i}`} maxHeight={360} />
    </DialogContent>
  )
}
