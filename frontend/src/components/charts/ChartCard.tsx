import type { ReactNode } from "react"
import type { LucideIcon } from "lucide-react"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { Skeleton } from "@/components/ui/skeleton"
import { cn } from "@/lib/utils"

type Props = {
  title: string
  icon?: LucideIcon
  badge?: ReactNode
  isLoading?: boolean
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
  isEmpty,
  emptyMessage = "해당되는 데이터가 없습니다",
  height = 320,
  children,
}: Props) {
  return (
    <Card className="flex flex-col">
      <CardHeader className="flex-row items-center justify-between space-y-0 pb-2">
        <CardTitle className="flex items-center gap-2 text-sm font-semibold">
          {Icon && <Icon className="size-4 text-muted-foreground" />}
          {title}
        {badge}
        </CardTitle>
      </CardHeader>
      <CardContent className={cn("relative shrink-0")} style={{ height }}>
        {isLoading ? (
          <Skeleton className="h-full w-full" />
        ) : isEmpty ? (
          <div className="flex h-full items-center justify-center text-sm text-muted-foreground">
            {emptyMessage}
          </div>
        ) : (
          children
        )}
      </CardContent>
    </Card>
  )
}
