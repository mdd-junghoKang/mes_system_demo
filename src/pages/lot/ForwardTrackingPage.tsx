import { useState } from "react"
import { MousePointerClick } from "lucide-react"

import { Label } from "@/components/ui/label"
import { AutocompleteInput } from "@/components/shared/AutocompleteInput"
import { CardGrid } from "@/components/shared/CardGrid"
import { DateRangeSearchBar } from "@/components/shared/DateRangeSearchBar"
import { StatusChip } from "@/components/shared/StatusChip"
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
  // LOT_NO만으로는 중복된 값이 있을 때 클릭한 카드가 아닌 다른 카드를 가리킬 수 있어서,
  // 문자열이 아니라 클릭된 행 객체 자체를 들고 있는다 (LotHistoryPage와 동일한 방식).
  const [selectedLot, setSelectedLot] = useState<LotTrackingRow | null>(null)
  const [searchNonce, setSearchNonce] = useState(0)

  const { data, isLoading, isFetching, isError } = useLotSearch(appliedLotNo, appliedRange.start, appliedRange.end)
  const { data: flow } = useFlowTracking(selectedLot?.LOT_NO ?? null)

  // 지금 선택된 기간에 실제로 있는 LOT 번호를 자동완성 후보로 쓴다.
  const suggestionsQuery = useLotSearch("", draftRange.start, draftRange.end)
  const lotSuggestions = [
    ...new Set((suggestionsQuery.data?.lot_tracking_list ?? []).map((r) => r.LOT_NO)),
  ]

  const rows = data?.lot_tracking_list ?? []
  const showLoading = isLoading || isFetching

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
          setSearchNonce((n) => n + 1)
        }}
      >
        <div className="grid gap-1.5">
          <Label htmlFor="fwd-lot-no">LOT Number</Label>
          <AutocompleteInput
            id="fwd-lot-no"
            value={draftLotNo}
            onChange={setDraftLotNo}
            suggestions={lotSuggestions}
            placeholder="LOT 번호"
            className="w-[200px]"
          />
        </div>
      </DateRangeSearchBar>

      {!showLoading && rows.length > 0 && (
        <p className="flex items-center gap-1.5 text-xs text-muted-foreground">
          <MousePointerClick className="size-3.5" />
          카드를 클릭하면 아래에서 LOT 공정 흐름을 확인할 수 있습니다
        </p>
      )}

      <CardGrid
        key={searchNonce}
        rows={rows}
        getRowKey={(r, i) => `${r.LOT_NO}-${i}`}
        onCardClick={setSelectedLot}
        isCardActive={(r) => r === selectedLot}
        isLoading={showLoading}
        isError={isError}
        renderCard={(row) => (
          <>
            <div className="flex items-start justify-between gap-2">
              <p className="text-lg font-bold tracking-tight">{row.LOT_NO}</p>
              <p className="shrink-0 text-xs text-muted-foreground">{row.WORK_DATE}</p>
            </div>
            <p className="mt-1 truncate text-sm text-muted-foreground" title={row.ITEM_NM}>
              {row.ITEM_NM}
            </p>
            <div className="mt-3 flex items-start gap-1 border-t pt-3">
              <StatusChip label="반제품 검사" value={row.COLOR_QUALITY} />
              <StatusChip label="완제품 수집" value={row.APPEARANCE_QUALITY} />
            </div>
          </>
        )}
      />

      {selectedLot && <LotFlowVisualization lot={selectedLot} flowData={flow?.lot_flow_list} />}
    </div>
  )
}
