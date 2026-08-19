import type { ReactNode } from "react"
import { Download } from "lucide-react"
import { Button } from "@/components/ui/button"
import { cn } from "@/lib/utils"

export type DataTableColumn<T> = {
  key: string
  header: ReactNode
  render: (row: T) => ReactNode
  /**
   * CSS grid track for this column, e.g. "120px" or "minmax(160px,1fr)".
   * Defaults to an even, flexible share of the row — give text/description
   * columns "1fr" or a wider minmax so short numeric columns don't get
   * stretched by the browser's native table auto-layout (which is what
   * this grid-based table replaces).
   */
  width?: string
  align?: "left" | "right" | "center"
  className?: string
}

type Props<T> = {
  columns: DataTableColumn<T>[]
  rows: T[]
  getRowKey: (row: T, index: number) => string | number
  onRowClick?: (row: T) => void
  isRowActive?: (row: T) => boolean
  maxHeight?: number
  emptyMessage?: string
  onExport?: () => void
  /**
   * Constrains the table+card to a max width (e.g. "56rem") instead of
   * always stretching to fill the page. Use this when the columns are few
   * and short — forcing sparse content to span a wide container just
   * pushes left-aligned text and right-aligned numbers apart, leaving one
   * big dead gap in the middle. Omit for tables with enough columns/content
   * to fill the width naturally.
   */
  maxWidth?: string
}

const alignClass = { left: "text-left", right: "text-right", center: "text-center" } as const

export function DataTable<T>({
  columns,
  rows,
  getRowKey,
  onRowClick,
  isRowActive,
  maxHeight = 480,
  emptyMessage = "해당되는 데이터가 없습니다",
  onExport,
  maxWidth,
}: Props<T>) {
  const gridTemplateColumns = columns.map((c) => c.width ?? "minmax(96px,1fr)").join(" ")

  return (
    <div className="overflow-hidden rounded-lg border bg-background" style={maxWidth ? { maxWidth } : undefined}>
      {onExport && (
        <div className="flex justify-end border-b p-2">
          <Button variant="outline" size="sm" className="gap-1.5" onClick={onExport}>
            <Download className="size-3.5" />
            내보내기
          </Button>
        </div>
      )}
      <div
        className={cn(
          "bg-background overflow-x-auto overflow-y-auto",
          onExport && "m-2 rounded-lg border",
        )}
        style={{ maxHeight }}
      >
        <div role="table" className="min-w-full text-sm">
          <div
            role="row"
            className="sticky top-0 z-10 grid border-b bg-muted"
            style={{ gridTemplateColumns }}
          >
            {columns.map((col) => (
              <div
                key={col.key}
                role="columnheader"
                className={cn(
                  "h-10 flex items-center px-3 text-xs font-semibold text-muted-foreground whitespace-nowrap",
                  alignClass[col.align ?? "left"],
                  col.align === "right" && "justify-end",
                  col.align === "center" && "justify-center",
                  col.className,
                )}
              >
                {col.header}
              </div>
            ))}
          </div>

          {rows.length === 0 ? (
            <div className="flex h-24 items-center justify-center text-muted-foreground">
              {emptyMessage}
            </div>
          ) : (
            rows.map((row, index) => (
              <div
                key={getRowKey(row, index)}
                role="row"
                onClick={() => onRowClick?.(row)}
                className={cn(
                  "grid border-b transition-colors hover:bg-muted/50",
                  onRowClick && "cursor-pointer",
                  isRowActive?.(row) && "bg-accent",
                )}
                style={{ gridTemplateColumns }}
              >
                {columns.map((col) => (
                  <div
                    key={col.key}
                    role="cell"
                    className={cn(
                      "flex items-center px-3 py-2 whitespace-nowrap",
                      alignClass[col.align ?? "left"],
                      col.align === "right" && "justify-end",
                      col.align === "center" && "justify-center",
                      col.className,
                    )}
                  >
                    {col.render(row)}
                  </div>
                ))}
              </div>
            ))
          )}
        </div>
      </div>
    </div>
  )
}
