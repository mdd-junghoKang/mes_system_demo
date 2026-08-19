import { useMemo, useState } from "react"
import { ArrowLeft, ArrowRight } from "lucide-react"

import { Badge } from "@/components/ui/badge"
import { Button } from "@/components/ui/button"
import { Dialog, DialogContent, DialogHeader, DialogTitle } from "@/components/ui/dialog"
import { ChartCard } from "@/components/charts/ChartCard"
import { CountBarChart } from "@/components/charts/CountBarChart"
import { DataTable, type DataTableColumn } from "@/components/shared/DataTable"
import { DateRangeSearchBar } from "@/components/shared/DateRangeSearchBar"
import { ProxyImage } from "@/components/shared/ProxyImage"
import { SortableHeader } from "@/components/shared/SortableHeader"
import { StatTile } from "@/components/shared/StatTile"
import { exportRowsToCsv } from "@/lib/csvExport"
import { defaultDateRange } from "@/lib/dates"
import { useSemiProductData } from "@/hooks/useSemiProductData"
import type { SemiProductRow } from "@/types/semiProduct"

export function SemiProductQualityPage() {
  const initial = defaultDateRange()
  const [draftRange, setDraftRange] = useState(initial)
  const [appliedRange, setAppliedRange] = useState(initial)
  const [sortResultFirst, setSortResultFirst] = useState(false)
  const [selected, setSelected] = useState<SemiProductRow | null>(null)

  const { data, isLoading, isFetching } = useSemiProductData(appliedRange.start, appliedRange.end)

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

  const columns: DataTableColumn<SemiProductRow>[] = [
    { key: "date", header: "작업일", width: "110px", render: (r) => r.GET_DATE },
    { key: "time", header: "작업시간", width: "90px", render: (r) => r.GET_TIME },
    { key: "seq", header: "순번", width: "80px", render: (r) => r.DATA_NAME },
    { key: "item_cd", header: "품번", width: "1fr", render: (r) => r.ITEM_CD },
    { key: "item_nm", header: "품명", width: "1.5fr", render: (r) => r.ITEM_NM },
    { key: "lot_no", header: "LOT No", width: "1fr", render: (r) => r.LOT_NO },
    {
      key: "result",
      width: "110px",
      align: "center",
      header: <SortableHeader label="합격여부" onClick={() => setSortResultFirst((v) => !v)} />,
      render: (r) => (
        <span className={r.RESULT === "NG" ? "font-medium text-red-600" : ""}>{r.RESULT}</span>
      ),
    },
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
        onSearch={() => setAppliedRange(draftRange)}
      />

      <div className="grid grid-cols-1 gap-4 sm:grid-cols-3">
        <StatTile label="사이클 카운트" value={summary?.CYCLECOUNT} accent="blue" />
        <StatTile label="불량 블록" value={summary?.BAD} accent="amber" />
        <StatTile label="불량품 수" value={summary?.DEFECTIVE} accent="red" />
      </div>

      <ChartCard
        title="반제품 품질 검사이력"
        isLoading={isLoading || isFetching}
        isEmpty={graph.length === 0}
        height={300}
      >
        <CountBarChart
          labels={graph.map((d) => d.GET_DATE)}
          series={[
            { label: "Cycle Count", data: graph.map((d) => d.CYCLECOUNT), color: "#4f7dd1" },
            { label: "Defective Count", data: graph.map((d) => d.DEFECTIVE), color: "#d9534f" },
          ]}
        />
      </ChartCard>

      <DataTable
        columns={columns}
        rows={sortedRows}
        getRowKey={(r, i) => `${r.GET_DATE}-${r.GET_TIME}-${i}`}
        onExport={handleExport}
      />

      <Dialog open={!!selected} onOpenChange={(open) => !open && setSelected(null)}>
        <DialogContent className="max-w-2xl">
          <DialogHeader>
            <div className="flex items-center justify-between">
              <DialogTitle className="flex items-center gap-2">
                {selected?.ITEM_NM}
                <Badge variant={selected?.RESULT === "NG" ? "destructive" : "secondary"}>
                  {selected?.RESULT}
                </Badge>
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
                  <dt className="text-muted-foreground">작업시간</dt>
                  <dd>{selected.GET_TIME}</dd>
                  <dt className="text-muted-foreground">제품번호</dt>
                  <dd>{selected.ITEM_CD}</dd>
                  <dt className="text-muted-foreground">LOT No</dt>
                  <dd>{selected.LOT_NO}</dd>
                  <dt className="text-muted-foreground">검사결과</dt>
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
