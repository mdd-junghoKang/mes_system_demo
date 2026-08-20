import { useState } from "react"
import { MousePointerClick } from "lucide-react"

import { Label } from "@/components/ui/label"
import { AutocompleteInput } from "@/components/shared/AutocompleteInput"
import { DataTable, type DataTableColumn } from "@/components/shared/DataTable"
import { DateRangeSearchBar } from "@/components/shared/DateRangeSearchBar"
import { LotFlowVisualization } from "@/components/lot/LotFlowVisualization"
import { useFlowTracking, useMixSearch } from "@/hooks/useLotTracking"
import { defaultDateRange } from "@/lib/dates"
import type { LotTrackingRow } from "@/types/lot"

export function BackwardTrackingPage() {
  const initial = defaultDateRange()
  const [draftRange, setDraftRange] = useState(initial)
  const [appliedRange, setAppliedRange] = useState(initial)
  const [draftMixerNo, setDraftMixerNo] = useState("")
  const [appliedMixerNo, setAppliedMixerNo] = useState("")
  const [selectedLot, setSelectedLot] = useState<LotTrackingRow | null>(null)

  const { data, isLoading, isFetching, isError } = useMixSearch(appliedMixerNo, appliedRange.start, appliedRange.end)
  const { data: flow } = useFlowTracking(selectedLot?.LOT_NO ?? null)

  // 지금 선택된 기간에 실제로 있는 믹서 번호를 자동완성 후보로 쓴다.
  const suggestionsQuery = useMixSearch("", draftRange.start, draftRange.end)
  const mixerSuggestions = [
    ...new Set((suggestionsQuery.data?.mix_tracking_list ?? []).map((r) => r.MIX_NO)),
  ]

  const rows = data?.mix_tracking_list ?? []

  // 스캔 시 바로 봐야 하는 값만 표에 남기고, 작업지시번호/품번/배치번호는 행 클릭 시
  // 공정 흐름 패널에 뜨는 "코드 정보"로 옮긴다 (컬럼이 많아 가로 스크롤이 생기던 문제 해결).
  const columns: DataTableColumn<LotTrackingRow>[] = [
    { key: "date", header: "작업일", width: "minmax(150px,1fr)", render: (r) => r.WORK_DATE },
    { key: "lot", header: "LOT No", width: "minmax(160px,1.1fr)", render: (r) => r.LOT_NO },
    { key: "item_nm", header: "품명", width: "minmax(180px,1.5fr)", render: (r) => r.ITEM_NM },
    {
      key: "color",
      header: "반제품 검사",
      width: "minmax(150px,0.8fr)",
      align: "center",
      render: (r) => r.COLOR_QUALITY,
    },
    {
      key: "appearance",
      header: "완제품 수집",
      width: "minmax(150px,0.8fr)",
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
          setAppliedMixerNo(draftMixerNo)
        }}
      >
        <div className="grid gap-1.5">
          <Label htmlFor="mixer-no">Mixer Number</Label>
          <AutocompleteInput
            id="mixer-no"
            value={draftMixerNo}
            onChange={setDraftMixerNo}
            suggestions={mixerSuggestions}
            placeholder="믹서 번호"
            className="w-[200px]"
          />
        </div>
      </DateRangeSearchBar>

      {rows.length > 0 && (
        <p className="flex items-center gap-1.5 text-xs text-muted-foreground">
          <MousePointerClick className="size-3.5" />
          행을 클릭하면 아래에서 LOT 공정 흐름을 확인할 수 있습니다
        </p>
      )}

      <DataTable
        columns={columns}
        rows={rows}
        getRowKey={(r, i) => `${r.LOT_NO}-${i}`}
        onRowClick={setSelectedLot}
        isRowActive={(r) => r.LOT_NO === selectedLot?.LOT_NO}
        isLoading={isLoading || isFetching}
        isError={isError}
      />

      {selectedLot && <LotFlowVisualization lot={selectedLot} flowData={flow?.lot_flow_list} />}
    </div>
  )
}
