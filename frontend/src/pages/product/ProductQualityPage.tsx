import { useMemo, useState } from "react"
import { ArrowLeft, ArrowRight, Download } from "lucide-react"

import { Button } from "@/components/ui/button"
import { Dialog, DialogContent, DialogHeader, DialogTitle } from "@/components/ui/dialog"
import { ChartCard } from "@/components/charts/ChartCard"
import { CountBarChart } from "@/components/charts/CountBarChart"
import { CardGrid } from "@/components/shared/CardGrid"
import { DateRangeSearchBar } from "@/components/shared/DateRangeSearchBar"
import { ProxyImage } from "@/components/shared/ProxyImage"
import { StatTile } from "@/components/shared/StatTile"
import { categoryAccentClass } from "@/lib/categoryColor"
import { exportRowsToCsv } from "@/lib/csvExport"
import { defaultDateRange } from "@/lib/dates"
import { useProductData } from "@/hooks/useProductData"
import type { ProductRow } from "@/types/product"

export function ProductQualityPage() {
  const initial = defaultDateRange()
  const [draftRange, setDraftRange] = useState(initial)
  const [appliedRange, setAppliedRange] = useState(initial)
  const [selected, setSelected] = useState<ProductRow | null>(null)
  const [searchNonce, setSearchNonce] = useState(0)

  const { data, isLoading, isFetching, isError } = useProductData(appliedRange.start, appliedRange.end)

  const summary = data?.summary_data?.[0]
  const graph = data?.graph_data ?? []
  const lotNg = summary?.LOTNG ?? summary?.LOGNG

  const sortedRows = useMemo(
    () =>
      [...(data?.row_data ?? [])].sort((a, b) =>
        `${b.GET_DATE}${b.GET_TIME}`.localeCompare(`${a.GET_DATE}${a.GET_TIME}`),
      ),
    [data],
  )

  const selectedIndex = selected ? sortedRows.indexOf(selected) : -1
  const showLoading = isLoading || isFetching

  function handleExport() {
    exportRowsToCsv(
      "product-quality.csv",
      ["순번", "일자", "일시", "LOT No", "품번", "품명"],
      sortedRows.map((r) => [r.ID, r.GET_DATE, r.GET_TIME, r.LOT_NO, r.ITEM_CD, r.ITEM_NM]),
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

      <div className="grid grid-cols-1 gap-4 sm:grid-cols-2">
        <StatTile label="사이클 카운트 (회)" value={summary?.CYCLECOUNT} accent="primary" />
        <StatTile label="불량품 수 (건)" value={lotNg} accent="red" />
      </div>

      <ChartCard
        title="완제품 검사이력"
        isLoading={showLoading}
        isError={isError}
        isEmpty={graph.length === 0}
        height={300}
      >
        <CountBarChart
          labels={graph.map((d) => d.GET_DATE)}
          series={[
            { label: "사이클 카운트", data: graph.map((d) => d.CYCLECOUNT), color: "#636ae8" },
            { label: "불량품 수", data: graph.map((d) => d.LOTNG), color: "#de3b40" },
          ]}
        />
      </ChartCard>

      <div className="flex justify-end">
        <Button variant="outline" size="sm" className="gap-1.5" onClick={handleExport}>
          <Download className="size-3.5" />
          내보내기
        </Button>
      </div>

      <CardGrid
        key={searchNonce}
        rows={sortedRows}
        getRowKey={(r, i) => `${r.ID}-${i}`}
        onCardClick={setSelected}
        accentClassName={(r) => categoryAccentClass(r.ITEM_NM || "")}
        isLoading={showLoading}
        isError={isError}
        renderCard={(row) => (
          <div className="flex flex-col gap-3">
            <p className="truncate text-lg font-bold tracking-tight" title={row.ITEM_NM || "품명 없음"}>
              {row.ITEM_NM || "품명 없음"}
            </p>
            <div className="flex flex-col gap-0.5">
              <p className="text-sm text-muted-foreground">{row.LOT_NO}</p>
              <p className="text-xs text-muted-foreground">
                {row.GET_DATE} {row.GET_TIME}
              </p>
            </div>
          </div>
        )}
      />

      <Dialog open={!!selected} onOpenChange={(open) => !open && setSelected(null)}>
        <DialogContent className="sm:max-w-xl">
          <DialogHeader>
            <div className="flex items-center justify-between">
              <DialogTitle>완제품 검사정보</DialogTitle>
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
              <ProxyImage path={selected.ORIGIN_IMG_FILE_PATH} label="검사 이미지" className="h-56 w-full" />
              <div className="rounded-md border p-3 text-sm">
                <dl className="grid grid-cols-[auto_1fr] gap-x-3 gap-y-1.5">
                  <dt className="text-muted-foreground">순번</dt>
                  <dd>{selected.ID}</dd>
                  <dt className="text-muted-foreground">품번</dt>
                  <dd>{selected.ITEM_CD}</dd>
                  <dt className="text-muted-foreground">품명</dt>
                  <dd>{selected.ITEM_NM || "없음"}</dd>
                  <dt className="text-muted-foreground">LOT No</dt>
                  <dd>{selected.LOT_NO}</dd>
                  <dt className="text-muted-foreground">검사일시</dt>
                  <dd>
                    {selected.GET_DATE} {selected.GET_TIME}
                  </dd>
                </dl>
              </div>
            </div>
          )}
        </DialogContent>
      </Dialog>
    </div>
  )
}
