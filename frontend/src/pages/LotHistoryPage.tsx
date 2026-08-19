import { useState } from "react"

import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { DataTable, type DataTableColumn } from "@/components/shared/DataTable"
import { DateRangeSearchBar } from "@/components/shared/DateRangeSearchBar"
import { useFlowTracking, useLotSearch } from "@/hooks/useLotTracking"
import { defaultDateRange } from "@/lib/dates"
import { FLOW_STEP_LABELS, type LotTrackingRow } from "@/types/lot"

export function LotHistoryPage() {
  const initial = defaultDateRange()
  const [draftRange, setDraftRange] = useState(initial)
  const [appliedRange, setAppliedRange] = useState(initial)
  const [draftLotNo, setDraftLotNo] = useState("")
  const [appliedLotNo, setAppliedLotNo] = useState("")
  const [selectedLot, setSelectedLot] = useState<string | null>(null)

  const { data, isLoading, isFetching } = useLotSearch(appliedLotNo, appliedRange.start, appliedRange.end)
  const { data: flow } = useFlowTracking(selectedLot)

  const rows = data?.lot_tracking_list ?? []

  const columns: DataTableColumn<LotTrackingRow>[] = [
    { key: "date", header: "작업일", width: "1fr", render: (r) => r.WORK_DATE },
    { key: "lot", header: "LOT No", width: "1fr", render: (r) => r.LOT_NO },
    { key: "order", header: "작업지시번호", width: "1fr", render: (r) => r.MIX_NO },
    { key: "item_cd", header: "품번", width: "1fr", render: (r) => r.ITEM_CD },
    { key: "item_nm", header: "품명", width: "1.3fr", render: (r) => r.ITEM_NM },
    { key: "batch", header: "배치번호", width: "1fr", render: (r) => r.ORDER_NO },
    { key: "color", header: "반제품 검사 여부", width: "1fr", align: "center", render: (r) => r.COLOR_QUALITY },
    { key: "curing", header: "양생온도", width: "1fr", align: "right", render: (r) => r.CURING_LOG },
    {
      key: "appearance",
      header: "완제품 수집여부",
      width: "1fr",
      align: "center",
      render: (r) => r.APPEARANCE_QUALITY,
    },
    { key: "finished", header: "큐빙정보", width: "1fr", align: "center", render: (r) => r.FINISHED_LOT },
  ]

  const stepRows = Object.entries(FLOW_STEP_LABELS)

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
          <Label htmlFor="lot-no">LOT Number</Label>
          <Input
            id="lot-no"
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
        onRowClick={(r) => setSelectedLot(r.LOT_NO)}
        isRowActive={(r) => r.LOT_NO === selectedLot}
      />
      {(isLoading || isFetching) && <p className="text-sm text-muted-foreground">불러오는 중...</p>}

      {selectedLot && (
        <div className="rounded-lg border bg-background p-4">
          <p className="mb-3 text-sm font-semibold">LOT {selectedLot} 공정 흐름</p>
          <div className="grid grid-cols-1 gap-3 sm:grid-cols-2 lg:grid-cols-4">
            {stepRows.map(([gubun, label]) => {
              const stepData = flow?.lot_flow_list?.filter((r) => r.GUBUN === gubun) ?? []
              return (
                <div key={gubun} className="rounded-md border bg-muted/30 p-3">
                  <p className="mb-2 text-xs font-semibold text-muted-foreground">{label}</p>
                  {stepData.length === 0 ? (
                    <p className="text-xs text-muted-foreground">데이터 없음</p>
                  ) : (
                    <dl className="space-y-1">
                      {stepData.map((r, i) => (
                        <div key={i} className="flex justify-between gap-2 text-xs">
                          <dt className="text-muted-foreground">{r.TYPE}</dt>
                          <dd>{r.VALUE}</dd>
                        </div>
                      ))}
                    </dl>
                  )}
                </div>
              )
            })}
          </div>
        </div>
      )}
    </div>
  )
}
