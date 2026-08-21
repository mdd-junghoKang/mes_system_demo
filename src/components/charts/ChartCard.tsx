import type { ReactNode } from "react"
import { AlertCircle, type LucideIcon } from "lucide-react"
import { motion } from "motion/react"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { Skeleton } from "@/components/ui/skeleton"
import { cn } from "@/lib/utils"

type Props = {
  title: string
  icon?: LucideIcon
  badge?: ReactNode
  isLoading?: boolean
  /** 조회는 끝났지만(로딩 아님) 실패로 끝난 경우. "결과 없음"과 구분해서 보여준다. */
  isError?: boolean
  errorMessage?: string
  isEmpty?: boolean
  emptyMessage?: string
  height?: number
  children: ReactNode
}

export function ChartCard({
  title,
  icon: Icon,
  badge,
  isLoading,
  isError,
  errorMessage = "일시적인 오류로 데이터를 불러오지 못했습니다",
  isEmpty,
  emptyMessage = "해당되는 데이터가 없습니다",
  height = 320,
  children,
}: Props) {
  return (
    <motion.div
      initial={{ opacity: 0, y: 12 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ duration: 0.35, ease: "easeOut" }}
    >
      <Card className="flex flex-col">
        <CardHeader className="flex-row items-center justify-between space-y-0 pb-2">
          <CardTitle className="flex items-center gap-2 text-lg font-semibold">
            {Icon && <Icon className="size-4 text-muted-foreground" />}
            {title}
          {badge}
          </CardTitle>
        </CardHeader>
        <CardContent className={cn("relative shrink-0")} style={{ height }}>
          {isLoading ? (
            <Skeleton className="h-full w-full" />
          ) : isError ? (
            <div className="flex h-full flex-col items-center justify-center gap-2 text-sm text-destructive">
              <AlertCircle className="size-5" />
              {errorMessage}
            </div>
          ) : isEmpty ? (
            <div className="flex h-full items-center justify-center text-sm text-muted-foreground">
              {emptyMessage}
            </div>
          ) : (
            children
          )}
        </CardContent>
      </Card>
    </motion.div>
  )
}
