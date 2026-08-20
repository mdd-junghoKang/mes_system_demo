import type { ReactNode } from "react"
import { useState } from "react"
import { AlertCircle } from "lucide-react"
import { motion } from "motion/react"

import { Button } from "@/components/ui/button"
import { Skeleton } from "@/components/ui/skeleton"
import { cn } from "@/lib/utils"

type Props<T> = {
  rows: T[]
  getRowKey: (row: T, index: number) => string | number
  renderCard: (row: T) => ReactNode
  onCardClick?: (row: T) => void
  isCardActive?: (row: T) => boolean
  isLoading?: boolean
  isError?: boolean
  errorMessage?: string
  emptyMessage?: string
  /** 처음에 보여줄 개수 + "더보기" 클릭 시 늘어나는 개수 (기본 9 = 3x3) */
  initialVisible?: number
  skeletonCount?: number
}

/**
 * DataTable(표)의 카드뷰 버전. LOT 발행이력에서 처음 만든 패턴 — 개별 레코드를
 * 카드로 보여주고, 로딩/에러/빈 상태를 표와 동일한 스타일로 처리하며, 숫자
 * 페이지네이션 대신 "더보기"로 일부만 먼저 보여준다(카드가 많을 때 한 번에
 * 다 렌더링하면 부담스럽다는 피드백에 따라 initialVisible만큼씩 배치로 늘림).
 * 카드 안 내용은 페이지마다 다르므로 renderCard로 받는다.
 */
export function CardGrid<T>({
  rows,
  getRowKey,
  renderCard,
  onCardClick,
  isCardActive,
  isLoading,
  isError,
  errorMessage = "일시적인 오류로 데이터를 불러오지 못했습니다",
  emptyMessage = "해당되는 데이터가 없습니다",
  initialVisible = 9,
  skeletonCount = 6,
}: Props<T>) {
  const [visibleCount, setVisibleCount] = useState(initialVisible)
  // rows 참조가 바뀌면(=새 조회 결과) 렌더 중 비교해서 다시 처음 개수로 리셋한다.
  const [prevRows, setPrevRows] = useState(rows)
  if (rows !== prevRows) {
    setPrevRows(rows)
    setVisibleCount(initialVisible)
  }

  if (isLoading) {
    return (
      <div className="grid grid-cols-1 gap-3 sm:grid-cols-2 lg:grid-cols-3">
        {Array.from({ length: skeletonCount }).map((_, i) => (
          <Skeleton key={i} className="h-42 w-full rounded-2xl" />
        ))}
      </div>
    )
  }

  if (isError) {
    return (
      <div className="flex flex-col items-center gap-2 rounded-2xl border py-16 text-sm text-destructive">
        <AlertCircle className="size-5" />
        {errorMessage}
      </div>
    )
  }

  if (rows.length === 0) {
    return (
      <div className="rounded-2xl border py-16 text-center text-sm text-muted-foreground">
        {emptyMessage}
      </div>
    )
  }

  const visibleRows = rows.slice(0, visibleCount)

  return (
    <>
      <div className="grid grid-cols-1 gap-3 sm:grid-cols-2 lg:grid-cols-3">
        {visibleRows.map((row, i) => {
          const active = isCardActive?.(row) ?? false
          return (
            <motion.button
              key={getRowKey(row, i)}
              type="button"
              onClick={() => onCardClick?.(row)}
              initial={{ opacity: 0, y: 10 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.25, delay: Math.min(i * 0.03, 0.3), ease: "easeOut" }}
              className={cn(
                "rounded-2xl border bg-background p-4 text-left shadow-sm transition-all hover:-translate-y-0.5 hover:shadow-md",
                active && "ring-2 ring-primary",
              )}
            >
              {renderCard(row)}
            </motion.button>
          )
        })}
      </div>

      {rows.length > visibleCount && (
        <div className="flex justify-center">
          <Button
            variant="outline"
            onClick={() => setVisibleCount((c) => Math.min(c + initialVisible, rows.length))}
          >
            {Math.min(initialVisible, rows.length - visibleCount)}개 더보기 ({visibleCount}/{rows.length})
          </Button>
        </div>
      )}
    </>
  )
}
