import { useState } from "react"
import { Gauge, Search } from "lucide-react"
import { toast } from "sonner"

import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select"
import { ChartCard } from "@/components/charts/ChartCard"
import { TrendLineChart } from "@/components/charts/TrendLineChart"
import { DataTable, type DataTableColumn } from "@/components/shared/DataTable"
import { LineSelector } from "@/components/shared/LineSelector"
import { cn } from "@/lib/utils"
import { useAggInfo, sortedActiveLines } from "@/hooks/useAggInfo"
import { type AssembleType, useBatchImages, useGradationLookup } from "@/hooks/useGradationLookup"
import { copyImagePath } from "@/lib/imageProxy"
import { extractProxyPath } from "@/lib/proxyPath"
import { toDateInputValue } from "@/lib/dates"
import type { BatchInfoRow } from "@/types/aggregate"

export function GradationLookupPage() {
  const [draftDate, setDraftDate] = useState(toDateInputValue(new Date()))
  const [appliedDate, setAppliedDate] = useState(draftDate)
  const [selectedLine, setSelectedLine] = useState<string | null>(null)
  const [assembleType, setAssembleType] = useState<AssembleType>("A")
  const [selectedBatch, setSelectedBatch] = useState<BatchInfoRow | null>(null)

  const aggInfoQuery = useAggInfo()
  const lines = aggInfoQuery.data ? sortedActiveLines(aggInfoQuery.data.agg_info) : []
  const effectiveLine = selectedLine ?? lines[0]?.LINE_INFO ?? null

  const { data, isLoading, isFetching } = useGradationLookup(appliedDate, effectiveLine, assembleType)
  const { data: images } = useBatchImages(selectedBatch?.BATCH_NO ?? null, effectiveLine)

  const rate = data?.assembleRate.assemble_rates?.[0]
  const graph = data?.graph.graph_data ?? []
  const lowLine = assembleType === "A" ? data?.graph.assemble_data?.low_line : undefined
  const highLine = assembleType === "A" ? data?.graph.assemble_data?.high_line : undefined
  const batches = data?.batchInfo ?? []
  const chartTitle = assembleType === "P" ? "입형률" : "조립률"

  function isOutOfSpec(avg: number) {
    return typeof lowLine === "number" && typeof highLine === "number" && (avg < lowLine || avg > highLine)
  }

  const columns: DataTableColumn<BatchInfoRow>[] = [
    { key: "batch", header: "Batch No", width: "1fr", render: (r) => r.BATCH_NO },
    { key: "time", header: "Time", width: "1.6fr", render: (r) => r.GETHERING_TIME },
    {
      key: "avg",
      header: "평균",
      width: "1fr",
      align: "right",
      render: (r) => (
        <span className={cn(isOutOfSpec(r.AVG_VALUE) && "font-semibold text-red-600 dark:text-red-400")}>
          {r.AVG_VALUE}
        </span>
      ),
    },
    { key: "max", header: "최대", width: "1fr", align: "right", render: (r) => r.MAX_VALUE },
    { key: "min", header: "최소", width: "1fr", align: "right", render: (r) => r.MIN_VALUE },
  ]

  async function handleImageClick(proxyUrl: string) {
    const ok = await copyImagePath(extractProxyPath(proxyUrl))
    if (ok) toast.success("이미지 경로가 복사되었습니다")
  }

  return (
    <div className="flex flex-col gap-4">
      <div className="flex flex-col gap-4 rounded-lg border bg-background p-4 lg:flex-row lg:items-end lg:justify-between">
        <div className="flex flex-col gap-4 sm:flex-row sm:items-end sm:flex-wrap">
          <div className="grid gap-1.5">
            <Label htmlFor="lookup-date">날짜</Label>
            <Input
              id="lookup-date"
              type="date"
              value={draftDate}
              onChange={(e) => setDraftDate(e.target.value)}
              className="w-[160px]"
            />
          </div>
          <div className="grid gap-1.5">
            <Label>조립 유형</Label>
            <Select value={assembleType} onValueChange={(v) => setAssembleType(v as AssembleType)}>
              <SelectTrigger className="w-[140px]">
                <SelectValue />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="select-none">선택안함</SelectItem>
                <SelectItem value="A">조립률 (A)</SelectItem>
                <SelectItem value="P">입형률 (P)</SelectItem>
              </SelectContent>
            </Select>
          </div>
          <LineSelector value={effectiveLine} onChange={setSelectedLine} />
        </div>
        <Button onClick={() => setAppliedDate(draftDate)} className="gap-2">
          <Search className="size-4" />
          조회
        </Button>
      </div>

      {assembleType !== "select-none" && (
        <>
          <div className="grid grid-cols-1 gap-4 sm:grid-cols-2">
            <div className="rounded-lg border bg-background p-4">
              <p className="text-sm text-muted-foreground">조립률</p>
              <p className="mt-1 text-2xl font-semibold">
                {rate?.FINENESS_MODULUS !== undefined ? `${rate.FINENESS_MODULUS}%` : "해당되는 데이터가 없습니다"}
              </p>
            </div>
            <div className="rounded-lg border bg-background p-4">
              <p className="text-sm text-muted-foreground">입형률</p>
              <p className="mt-1 text-2xl font-semibold">
                {rate?.SHAPE_INDEX !== undefined ? `${rate.SHAPE_INDEX}%` : "해당되는 데이터가 없습니다"}
              </p>
            </div>
          </div>

          <ChartCard
            title={chartTitle}
            icon={Gauge}
            isLoading={isLoading || isFetching}
            isEmpty={graph.length === 0}
            height={340}
          >
            <TrendLineChart
              labels={graph.map((r) => r.GETHERING_TIME)}
              data={graph.map((r) => r.AVG_VALUE ?? 0)}
              seriesLabel="AVG_VALUE"
              yTitle={chartTitle}
              lowLine={lowLine}
              highLine={highLine}
            />
          </ChartCard>
        </>
      )}

      <DataTable
        columns={columns}
        rows={batches}
        getRowKey={(r, i) => `${r.BATCH_NO}-${i}`}
        onRowClick={setSelectedBatch}
        isRowActive={(r) => r.BATCH_NO === selectedBatch?.BATCH_NO}
      />

      {selectedBatch && (
        <div className="grid grid-cols-1 gap-4 sm:grid-cols-2">
          <div className="rounded-lg border bg-background p-4">
            <p className="mb-3 text-sm font-semibold">분석 이미지 (AI)</p>
            <div className="grid grid-cols-3 gap-2">
              {(images?.image_rows ?? []).map((row, i) => (
                <img
                  key={i}
                  src={row.ai_path}
                  loading="lazy"
                  className="aspect-square cursor-pointer rounded-md border object-cover"
                  onClick={() => handleImageClick(row.ai_path)}
                />
              ))}
              {(!images?.image_rows || images.image_rows.length === 0) && (
                <p className="col-span-3 py-6 text-center text-sm text-muted-foreground">
                  이미지가 없습니다
                </p>
              )}
            </div>
          </div>
          <div className="rounded-lg border bg-background p-4">
            <p className="mb-3 text-sm font-semibold">실제 이미지</p>
            <div className="grid grid-cols-3 gap-2">
              {(images?.image_rows ?? []).map((row, i) => (
                <img
                  key={i}
                  src={row.real_path}
                  loading="lazy"
                  className="aspect-square cursor-pointer rounded-md border object-cover"
                  onClick={() => handleImageClick(row.real_path)}
                />
              ))}
              {(!images?.image_rows || images.image_rows.length === 0) && (
                <p className="col-span-3 py-6 text-center text-sm text-muted-foreground">
                  이미지가 없습니다
                </p>
              )}
            </div>
          </div>
        </div>
      )}
    </div>
  )
}
