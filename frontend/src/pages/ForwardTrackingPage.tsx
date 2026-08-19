import { useState } from "react"

import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { DataTable, type DataTableColumn } from "@/components/shared/DataTable"
import { DateRangeSearchBar } from "@/components/shared/DateRangeSearchBar"
import { LotFlowVisualization } from "@/components/lot/LotFlowVisualization"
import { useFlowTracking, useLotSearch } from "@/hooks/useLotTracking"
import { defaultDateRange } from "@/lib/dates"
import type { LotTrackingRow } from "@/types/lot"

export function ForwardTrackingPage() {
  const initial = defaultDateRange()
  const [draftRange, setDraftRange] = useState(initial)
  const [appliedRange, setAppliedRange] = useState(initial)
  const [draftLotNo, setDraftLotNo] = useState("")
  const [appliedLotNo, setAppliedLotNo] = useState("")
  const [selectedLot, setSelectedLot] = useState<LotTrackingRow | null>(null)

  const { data, isLoading, isFetching } = useLotSearch(appliedLotNo, appliedRange.start, appliedRange.end)
  const { data: flow } = useFlowTracking(selectedLot?.LOT_NO ?? null)

  const rows = data?.lot_tracking_list ?? []

  const columns: DataTableColumn<LotTrackingRow>[] = [
    { key: "date", header: "작업일", width: "1fr", render: (r) => r.WORK_DATE },
    { key: "lot", header: "LOT No", width: "1fr", render: (r) => r.LOT_NO },
    { key: "order", header: "작업지시번호", width: "1fr", render: (r) => r.ORDER_NO },
    { key: "item_cd", header: "품번", width: "1fr", render: (r) => r.ITEM_CD },
    { key: "item_nm", header: "품명", width: "1.5fr", render: (r) => r.ITEM_NM },
    { key: "batch", header: "배치번호", width: "1fr", render: (r) => r.MIX_NO },
    { key: "color", header: "반제품 검사 여부", width: "1fr", align: "center", render: (r) => r.COLOR_QUALITY },
    {
      key: "appearance",
      header: "완제품 수집여부",
      width: "1fr",
      align: "center",
      render: (r) => r.APPEARANCE_QUALITY,
    },
  ]

  return (
    <div className="flex flex-col gap-4">
      <DateRangeSearchBar
        start={draftRange.start}
        end={draftRange.end}
        onStartChange={(v) => setDraftRange((r) => ({ ...r, start: v }))}
        onEndChange={(v) => setDraftRange((r) => ({ ...r, end: v }))}
        onSearch={() => {
          setAppliedRange(draftRange)
          setAppliedLotNo(draftLotNo)
        }}
      >
        <div className="grid gap-1.5">
          <Label htmlFor="fwd-lot-no">LOT Number</Label>
          <Input
            id="fwd-lot-no"
            value={draftLotNo}
            onChange={(e) => setDraftLotNo(e.target.value)}
            placeholder="LOT 번호"
            className="w-[200px]"
          />
        </div>
      </DateRangeSearchBar>

      <DataTable
        columns={columns}
        rows={rows}
        getRowKey={(r, i) => `${r.LOT_NO}-${i}`}
        onRowClick={setSelectedLot}
        isRowActive={(r) => r.LOT_NO === selectedLot?.LOT_NO}
      />
      {(isLoading || isFetching) && <p className="text-sm text-muted-foreground">불러오는 중...</p>}

      {selectedLot && <LotFlowVisualization lot={selectedLot} flowData={flow?.lot_flow_list} />}
    </div>
  )
}
