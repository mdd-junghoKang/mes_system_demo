import { useMemo, useState } from "react"
import { ArrowLeft, ArrowRight, Download } from "lucide-react"

import { Button } from "@/components/ui/button"
import { Checkbox } from "@/components/ui/checkbox"
import { Dialog, DialogContent, DialogHeader, DialogTitle } from "@/components/ui/dialog"
import { ChartCard } from "@/components/charts/ChartCard"
import { CountBarChart } from "@/components/charts/CountBarChart"
import { CardGrid } from "@/components/shared/CardGrid"
import { DateRangeSearchBar } from "@/components/shared/DateRangeSearchBar"
import { ProxyImage } from "@/components/shared/ProxyImage"
import { StatTile } from "@/components/shared/StatTile"
import { StatusBadge } from "@/components/shared/StatusBadge"
import { exportRowsToCsv } from "@/lib/csvExport"
import { defaultDateRange } from "@/lib/dates"
import { STATUS_CONFIG, type StatusLevel } from "@/lib/status"
import { useSemiProductData } from "@/hooks/useSemiProductData"
import type { SemiProductRow } from "@/types/semiProduct"

function resultToLevel(result: string): StatusLevel {
  return result === "NG" ? "danger" : "normal"
}

export function SemiProductQualityPage() {
  const initial = defaultDateRange()
  const [draftRange, setDraftRange] = useState(initial)
  const [appliedRange, setAppliedRange] = useState(initial)
  const [sortResultFirst, setSortResultFirst] = useState(false)
  const [selected, setSelected] = useState<SemiProductRow | null>(null)
  const [searchNonce, setSearchNonce] = useState(0)

  const { data, isLoading, isFetching, isError } = useSemiProductData(appliedRange.start, appliedRange.end)

  const summary = data?.summary_data?.[0]
  const graph = data?.graph_data ?? []

  const sortedRows = useMemo(() => {
    const copy = [...(data?.row_data ?? [])]
    copy.sort((a, b) => `${b.GET_DATE}${b.GET_TIME}`.localeCompare(`${a.GET_DATE}${a.GET_TIME}`))
    if (sortResultFirst) {
      copy.sort((a, b) => (a.RESULT === "NG" ? -1 : 0) - (b.RESULT === "NG" ? -1 : 0))
    }
    return copy
  }, [data, sortResultFirst])

  const selectedIndex = selected ? sortedRows.indexOf(selected) : -1
  const showLoading = isLoading || isFetching

  function handleExport() {
    exportRowsToCsv(
      "semi-product-quality.csv",
      ["작업일", "작업시간", "순번", "품번", "품명", "LOT No", "합격여부"],
      sortedRows.map((r) => [r.GET_DATE, r.GET_TIME, r.DATA_NAME, r.ITEM_CD, r.ITEM_NM, r.LOT_NO, r.RESULT]),
    )
  }

  return (
    <div className="flex flex-col gap-4">
      <DateRangeSearchBar
        start={draftRange.start}
        end={draftRange.end}
        onStartChange={(v) => setDraftRange((r) => ({ ...r, start: v }))}
        onEndChange={(v) => setDraftRange((r) => ({ ...r, end: v }))}
        onSearch={() => {
          setAppliedRange(draftRange)
          setSearchNonce((n) => n + 1)
        }}
      />

      <div className="grid grid-cols-1 gap-4 sm:grid-cols-3">
        <StatTile label="사이클 카운트 (회)" value={summary?.CYCLECOUNT} accent="blue" />
        <StatTile label="불량 블록 (건)" value={summary?.BAD} accent="amber" />
        <StatTile label="불량품 수 (건)" value={summary?.DEFECTIVE} accent="red" />
      </div>

      <ChartCard
        title="반제품 품질 검사이력"
        isLoading={showLoading}
        isError={isError}
        isEmpty={graph.length === 0}
        height={300}
      >
        <CountBarChart
          labels={graph.map((d) => d.GET_DATE)}
          series={[
            { label: "사이클 카운트", data: graph.map((d) => d.CYCLECOUNT), color: "#4f7dd1" },
            { label: "불량품 수", data: graph.map((d) => d.DEFECTIVE), color: "#d9534f" },
          ]}
        />
      </ChartCard>

      <div className="flex items-center justify-between">
        <label className="flex items-center gap-2 text-sm">
          <Checkbox
            checked={sortResultFirst}
            onCheckedChange={(v) => setSortResultFirst(v === true)}
          />
          불량(NG) 먼저 보기
        </label>
        <Button variant="outline" size="sm" className="gap-1.5" onClick={handleExport}>
          <Download className="size-3.5" />
          내보내기
        </Button>
      </div>

      <CardGrid
        key={searchNonce}
        rows={sortedRows}
        getRowKey={(r, i) => `${r.GET_DATE}-${r.GET_TIME}-${i}`}
        onCardClick={setSelected}
        accentClassName={(r) => STATUS_CONFIG[resultToLevel(r.RESULT)].accentClassName}
        isLoading={showLoading}
        isError={isError}
        renderCard={(row) => (
          <div className="flex flex-col gap-3">
            <p className="truncate text-lg font-bold tracking-tight" title={row.ITEM_NM}>
              {row.ITEM_NM}
            </p>
            <div className="flex flex-col gap-0.5">
              <p className="text-sm text-muted-foreground">{row.LOT_NO}</p>
              <p className="text-xs text-muted-foreground">
                {row.GET_DATE} {row.GET_TIME}
              </p>
            </div>
            <StatusBadge level={resultToLevel(row.RESULT)} label={row.RESULT} className="w-fit" />
          </div>
        )}
      />

      <Dialog open={!!selected} onOpenChange={(open) => !open && setSelected(null)}>
        <DialogContent className="sm:max-w-2xl">
          <DialogHeader>
            <div className="flex items-center justify-between">
              <DialogTitle className="flex items-center gap-2">
                {selected?.ITEM_NM}
                {selected && <StatusBadge level={resultToLevel(selected.RESULT)} label={selected.RESULT} />}
              </DialogTitle>
              <div className="flex gap-1">
                <Button
                  size="icon-sm"
                  variant="outline"
                  disabled={selectedIndex <= 0}
                  onClick={() => setSelected(sortedRows[selectedIndex - 1])}
                >
                  <ArrowLeft className="size-4" />
                </Button>
                <Button
                  size="icon-sm"
                  variant="outline"
                  disabled={selectedIndex < 0 || selectedIndex >= sortedRows.length - 1}
                  onClick={() => setSelected(sortedRows[selectedIndex + 1])}
                >
                  <ArrowRight className="size-4" />
                </Button>
              </div>
            </div>
          </DialogHeader>
          {selected && (
            <div className="grid grid-cols-1 gap-4 sm:grid-cols-2">
              <ProxyImage path={selected.IMG_PATH} label="원본 이미지" className="h-40 w-full" />
              <ProxyImage path={selected.DEFECT_DATA} label="패턴 검사" className="h-40 w-full" />
              <div className="rounded-md border p-3 text-sm">
                <dl className="grid grid-cols-[auto_1fr] gap-x-3 gap-y-1.5">
                  <dt className="whitespace-nowrap text-muted-foreground">작업시간</dt>
                  <dd>{selected.GET_TIME}</dd>
                  <dt className="whitespace-nowrap text-muted-foreground">순번</dt>
                  <dd>{selected.DATA_NAME}</dd>
                  <dt className="whitespace-nowrap text-muted-foreground">제품번호</dt>
                  <dd>{selected.ITEM_CD}</dd>
                  <dt className="whitespace-nowrap text-muted-foreground">LOT No</dt>
                  <dd>{selected.LOT_NO}</dd>
                  <dt className="whitespace-nowrap text-muted-foreground">검사결과</dt>
                  <dd>{selected.RESULT}</dd>
                </dl>
              </div>
              <ProxyImage path={selected.COLOR_DATA} label="컬러 검사" className="h-40 w-full" />
            </div>
          )}
        </DialogContent>
      </Dialog>
    </div>
  )
}
