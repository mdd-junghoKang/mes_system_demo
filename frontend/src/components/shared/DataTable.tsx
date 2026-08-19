import { useMemo, type ReactNode } from "react"
import { Download } from "lucide-react"
import {
  AllCommunityModule,
  ModuleRegistry,
  themeQuartz,
  type ColDef,
  type GetRowIdParams,
  type ICellRendererParams,
  type RowClassParams,
  type RowClickedEvent,
  type ValueGetterParams,
} from "ag-grid-community"
import { AgGridReact } from "ag-grid-react"

import { Button } from "@/components/ui/button"

ModuleRegistry.registerModules([AllCommunityModule])

const ROW_HEIGHT = 36
const HEADER_HEIGHT = 40

/**
 * shadcn 디자인 토큰에 맞춘 AG Grid 테마.
 * 값을 `var(--...)`로 넘기므로 `.dark` 클래스가 붙으면 다크모드가 자동으로 따라온다.
 */
const gridTheme = themeQuartz.withParams({
  fontFamily: "inherit",
  fontSize: "0.875rem",
  backgroundColor: "var(--background)",
  foregroundColor: "var(--foreground)",
  borderColor: "var(--border)",
  accentColor: "var(--primary)",
  browserColorScheme: "inherit",
  headerBackgroundColor: "var(--muted)",
  headerTextColor: "var(--muted-foreground)",
  headerFontSize: "0.75rem",
  headerFontWeight: 600,
  headerHeight: HEADER_HEIGHT,
  rowHeight: ROW_HEIGHT,
  oddRowBackgroundColor: "transparent",
  rowHoverColor: "color-mix(in oklab, var(--muted) 50%, transparent)",
  selectedRowBackgroundColor: "var(--accent)",
  wrapperBorderRadius: "0.5rem",
  cellHorizontalPadding: "0.75rem",
  chromeBackgroundColor: "var(--muted)",
})

export type DataTableColumn<T> = {
  key: string
  header: ReactNode
  render: (row: T) => ReactNode
  /**
   * 컬럼 폭. `"1fr"`(비율) 또는 `"120px"`(고정) 형태. 미지정 시 비율 1.
   * CSS grid 시절 표기를 그대로 받아서 AG Grid의 flex/width로 환산한다.
   */
  width?: string
  align?: "left" | "right" | "center"
  className?: string
  /**
   * 정렬에 쓸 원시값. 생략하면 `render()` 결과가 문자열·숫자일 때 그 값으로 정렬한다.
   * (JSX를 반환하는 컬럼은 이 값을 주지 않으면 정렬되지 않는다)
   */
  sortValue?: (row: T) => string | number | null
  /** 기본값: 정렬 가능한 값이 있으면 true */
  sortable?: boolean
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
  /** 표를 이 폭까지만 늘린다. 컬럼이 적어 가로가 비어 보일 때 사용. */
  maxWidth?: string
  /** 페이지네이션 사용 (기본: 끄고 스크롤) */
  pagination?: boolean
  pageSize?: number
  /** 컬럼 헤더 아래 필터 입력줄 표시 */
  floatingFilter?: boolean
}

/** `"1fr"` / `"1.5fr"` / `"120px"` / `"minmax(160px,1fr)"` → AG Grid 폭 설정 */
function parseWidth(width?: string): Pick<ColDef, "flex" | "width" | "minWidth"> {
  if (!width) return { flex: 1, minWidth: 96 }

  const minmax = width.match(/^minmax\(\s*(\d+)px\s*,\s*([\d.]+)fr\s*\)$/)
  if (minmax) return { flex: Number(minmax[2]), minWidth: Number(minmax[1]) }

  const fr = width.match(/^([\d.]+)fr$/)
  if (fr) return { flex: Number(fr[1]), minWidth: 96 }

  const px = width.match(/^(\d+)px$/)
  if (px) return { width: Number(px[1]), minWidth: Number(px[1]) }

  return { flex: 1, minWidth: 96 }
}

const headerAlignClass = {
  left: undefined,
  right: "dt-header-right",
  center: "dt-header-center",
} as const

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
  pagination = false,
  pageSize = 50,
  floatingFilter = false,
}: Props<T>) {
  // getRowKey는 (row, index)를 받지만 AG Grid의 getRowId에는 index가 없어서
  // 행 객체 -> 원래 인덱스 맵을 만들어 넘긴다.
  const rowIndexMap = useMemo(() => {
    const map = new Map<T, number>()
    rows.forEach((row, i) => map.set(row, i))
    return map
  }, [rows])

  const colDefs = useMemo<ColDef<T>[]>(
    () =>
      columns.map((col) => {
        const firstRendered = rows.length > 0 ? col.render(rows[0]) : undefined
        const renderIsPrimitive =
          typeof firstRendered === "string" || typeof firstRendered === "number"
        const sortable = col.sortable ?? (col.sortValue != null || renderIsPrimitive)

        return {
          colId: col.key,
          headerName: typeof col.header === "string" ? col.header : col.key,
          headerComponent:
            typeof col.header === "string" ? undefined : () => <>{col.header}</>,
          headerClass: headerAlignClass[col.align ?? "left"],
          cellClass: col.className,
          cellRenderer: (p: ICellRendererParams<T>) =>
            p.data === undefined ? null : col.render(p.data),
          valueGetter: (p: ValueGetterParams<T>) => {
            if (!p.data) return null
            if (col.sortValue) return col.sortValue(p.data)
            const value = col.render(p.data)
            return typeof value === "string" || typeof value === "number" ? value : null
          },
          sortable,
          filter: floatingFilter && sortable,
          resizable: true,
          cellStyle: {
            display: "flex",
            alignItems: "center",
            justifyContent:
              col.align === "right"
                ? "flex-end"
                : col.align === "center"
                  ? "center"
                  : "flex-start",
            whiteSpace: "nowrap",
          },
          ...parseWidth(col.width),
        }
      }),
    // rows는 첫 행의 render 결과로 정렬 가능 여부를 판단할 때만 쓴다.
    [columns, rows, floatingFilter],
  )

  // 기존 CSS Grid 표처럼 "내용만큼 자라되 maxHeight에서 멈춤" 동작.
  // 내용이 maxHeight 안에 들어가면 AG Grid의 autoHeight에 맡긴다. 높이를 직접 계산하면
  // 1~2px만 모자라도 불필요한 세로 스크롤바가 생기고, 그게 가로 폭을 잡아먹어
  // 가로 스크롤바까지 연쇄로 만들어낸다.
  const bodyHeight = rows.length > 0 ? rows.length * ROW_HEIGHT : 96
  const contentHeight =
    HEADER_HEIGHT + (floatingFilter ? HEADER_HEIGHT : 0) + bodyHeight + (pagination ? 48 : 0)
  const useAutoHeight = rows.length > 0 && !pagination && contentHeight <= maxHeight

  return (
    <div
      className="overflow-hidden rounded-lg border bg-background"
      style={maxWidth ? { maxWidth } : undefined}
    >
      {onExport && (
        <div className="flex justify-end border-b p-2">
          <Button variant="outline" size="sm" className="gap-1.5" onClick={onExport}>
            <Download className="size-3.5" />
            내보내기
          </Button>
        </div>
      )}
      <div
        style={useAutoHeight ? undefined : { height: Math.min(maxHeight, contentHeight) }}
        className={onExport ? "m-2" : undefined}
      >
        <AgGridReact<T>
          theme={gridTheme}
          domLayout={useAutoHeight ? "autoHeight" : "normal"}
          columnDefs={colDefs}
          rowData={rows}
          getRowId={(p: GetRowIdParams<T>) =>
            String(getRowKey(p.data, rowIndexMap.get(p.data) ?? 0))
          }
          rowHeight={ROW_HEIGHT}
          headerHeight={HEADER_HEIGHT}
          suppressCellFocus
          animateRows={false}
          pagination={pagination}
          paginationPageSize={pageSize}
          paginationPageSizeSelector={false}
          overlayNoRowsTemplate={`<span class="text-sm text-muted-foreground">${emptyMessage}</span>`}
          onRowClicked={(e: RowClickedEvent<T>) => e.data && onRowClick?.(e.data)}
          rowClassRules={{
            "dt-row-clickable": () => Boolean(onRowClick),
            "dt-row-active": (p: RowClassParams<T>) =>
              Boolean(p.data && isRowActive?.(p.data)),
          }}
          defaultColDef={{ floatingFilter }}
        />
      </div>
    </div>
  )
}
