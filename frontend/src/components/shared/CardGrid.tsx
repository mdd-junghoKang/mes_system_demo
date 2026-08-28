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
  /**
   * 카드 상단 강조바 색(Tailwind bg-* 클래스). 장식이 아니라 그 카드의 실제 상태를
   * 반영한다(합격/불량, 위험도 등) — StatTile의 accent bar와 같은 규칙을 카드뷰에도
   * 적용해서, 흰 배경+회색 텍스트만 있던 카드가 색 정보 없이 밋밋해 보이던 걸 보완한다.
   * 안 넘기면 브랜드 컬러를 옅게 준 중립 바가 나간다 — 실제 회색(border색)은 흰
   * 배경 카드에서 거의 안 보여서 상태 필드가 없는 페이지(완제품 검사 등)의 카드가
   * 밋밋해 보였다.
   */
  accentClassName?: (row: T) => string
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
  accentClassName,
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
                "overflow-hidden rounded-2xl border bg-background p-0 text-left shadow-sm ring-1 ring-black/5 transition-all hover:-translate-y-0.5 hover:shadow-lg dark:ring-white/10",
                active && "ring-2 ring-primary",
              )}
            >
              <div className={cn("h-1", accentClassName?.(row) ?? "bg-primary/30")} />
              <div className="p-4">{renderCard(row)}</div>
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
