import { useMemo, useState } from "react"
import { ArrowLeft, ArrowRight } from "lucide-react"

import { Button } from "@/components/ui/button"
import { Dialog, DialogContent, DialogHeader, DialogTitle } from "@/components/ui/dialog"
import { ChartCard } from "@/components/charts/ChartCard"
import { CountBarChart } from "@/components/charts/CountBarChart"
import { DataTable, type DataTableColumn } from "@/components/shared/DataTable"
import { DateRangeSearchBar } from "@/components/shared/DateRangeSearchBar"
import { ProxyImage } from "@/components/shared/ProxyImage"
import { StatTile } from "@/components/shared/StatTile"
import { exportRowsToCsv } from "@/lib/csvExport"
import { defaultDateRange } from "@/lib/dates"
import { useProductData } from "@/hooks/useProductData"
import type { ProductRow } from "@/types/product"

export function ProductQualityPage() {
  const initial = defaultDateRange()
  const [draftRange, setDraftRange] = useState(initial)
  const [appliedRange, setAppliedRange] = useState(initial)
  const [selected, setSelected] = useState<ProductRow | null>(null)

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

  // 스캔 시 바로 봐야 하는 값만 표에 남기고, 나머지(순번/일시/품번)는 이미 있는
  // "상세정보 보기" 모달로 옮긴다 (컬럼이 많아 LOT No/품명이 잘리던 문제 해결).
  const columns: DataTableColumn<ProductRow>[] = [
    { key: "date", header: "일자", width: "150px", render: (r) => r.GET_DATE },
    { key: "lot_no", header: "LOT No", width: "1fr", render: (r) => r.LOT_NO },
    { key: "item_nm", header: "품명", width: "1.5fr", render: (r) => r.ITEM_NM },
    {
      key: "detail",
      header: "상세정보",
      width: "100px",
      align: "center",
      render: (r) => (
        <Button size="sm" variant="outline" onClick={() => setSelected(r)}>
          보기
        </Button>
      ),
    },
  ]

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
        onSearch={() => setAppliedRange(draftRange)}
      />

      <div className="grid grid-cols-1 gap-4 sm:grid-cols-2">
        <StatTile label="사이클 카운트 (회)" value={summary?.CYCLECOUNT} accent="blue" />
        <StatTile label="불량품 수 (건)" value={lotNg} accent="red" />
      </div>

      <ChartCard
        title="완제품 검사이력"
        isLoading={isLoading || isFetching}
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

      <DataTable
        columns={columns}
        rows={sortedRows}
        getRowKey={(r, i) => `${r.ID}-${i}`}
        onExport={handleExport}
        isLoading={isLoading || isFetching}
        isError={isError}
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
