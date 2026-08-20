import { useMemo, type ReactNode } from "react"
import { AlertCircle, Download } from "lucide-react"
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
import { Skeleton } from "@/components/ui/skeleton"

ModuleRegistry.registerModules([AllCommunityModule])

const ROW_HEIGHT = 40
const HEADER_HEIGHT = 44

/**
 * shadcn 디자인 토큰에 맞춘 AG Grid 테마.
 * 값을 `var(--...)`로 넘기므로 `.dark` 클래스가 붙으면 다크모드가 자동으로 따라온다.
 */
const gridTheme = themeQuartz.withParams({
  fontFamily: "inherit",
  fontSize: "1rem",
  backgroundColor: "var(--background)",
  foregroundColor: "var(--foreground)",
  borderColor: "var(--border)",
  accentColor: "var(--primary)",
  browserColorScheme: "inherit",
  headerBackgroundColor: "var(--muted)",
  headerTextColor: "var(--muted-foreground)",
  headerFontSize: "0.875rem",
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
  /**
   * 페이지네이션 사용 (기본: 켬). 한 페이지 분량만 렌더링되니 표 안에서 세로 스크롤이
   * 생기지 않는다. 전체 행이 pageSize 이하면 페이지네이션 컨트롤 자체가 자동으로 숨겨진다.
   * 명시적으로 false를 주면 기존처럼 maxHeight 안에서 스크롤하는 방식으로 돌아간다.
   */
  pagination?: boolean
  pageSize?: number
  /** 컬럼 헤더 아래 필터 입력줄 표시 */
  floatingFilter?: boolean
  /** 조회 중일 때 표 위에 로딩 오버레이 표시 */
  isLoading?: boolean
  /** 조회는 끝났지만(로딩 아님) 실패로 끝난 경우. "결과 없음"과 구분해서 보여준다. */
  isError?: boolean
  errorMessage?: string
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
  pagination = true,
  pageSize = 10,
  floatingFilter = false,
  isLoading = false,
  isError = false,
  errorMessage = "일시적인 오류로 데이터를 불러오지 못했습니다",
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
          // cellStyle이 정렬을 위해 display:flex를 쓰는데, flex 아이템은 기본적으로
          // min-width:auto라서 내용이 넘쳐도 안 줄어들어 AG Grid의 기본 ellipsis가 먹지
          // 않는다(그냥 잘리기만 하고 "..."이 안 붙음). 문자열/숫자 값은 min-w-0 + truncate
          // span으로 감싸서 실제로 줄어들 수 있게 한다.
          cellRenderer: (p: ICellRendererParams<T>) => {
            if (p.data === undefined) return null
            const rendered = col.render(p.data)
            return typeof rendered === "string" || typeof rendered === "number" ? (
              <span className="min-w-0 truncate">{rendered}</span>
            ) : (
              rendered
            )
          },
          valueGetter: (p: ValueGetterParams<T>) => {
            if (!p.data) return null
            if (col.sortValue) return col.sortValue(p.data)
            const value = col.render(p.data)
            return typeof value === "string" || typeof value === "number" ? value : null
          },
          // 값이 잘려도 마우스오버로 전체 내용을 확인할 수 있게 항상 툴팁을 붙인다.
          tooltipValueGetter: (p) => (p.value != null ? String(p.value) : null),
          wrapHeaderText: true,
          autoHeaderHeight: true,
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

  // 전체 행이 pageSize 이하면 넘길 페이지가 없으므로 페이지네이션 컨트롤 자체를 숨긴다.
  const showPagination = pagination && rows.length > pageSize

  // pagination=false로 기존 스크롤 방식을 쓸 때만 maxHeight로 높이를 제한한다.
  // 내용이 maxHeight 안에 들어가면 AG Grid의 autoHeight에 맡긴다. 높이를 직접 계산하면
  // 1~2px만 모자라도 불필요한 세로 스크롤바가 생기고, 그게 가로 폭을 잡아먹어
  // 가로 스크롤바까지 연쇄로 만들어낸다.
  const bodyHeight = rows.length > 0 ? rows.length * ROW_HEIGHT : 96
  const contentHeight = HEADER_HEIGHT + (floatingFilter ? HEADER_HEIGHT : 0) + bodyHeight

  // 페이지네이션 중일 땐 실제 렌더링된 행 수(마지막 페이지는 적을 수 있음)가 아니라
  // pageSize 기준으로 높이를 고정한다. autoHeight에 맡기면 페이지를 넘길 때마다 표 높이가
  // 들쭉날쭉해져서 아래쪽 레이아웃이 같이 흔들린다.
  const PAGING_FOOTER_HEIGHT = 48
  const pagedHeight =
    HEADER_HEIGHT + (floatingFilter ? HEADER_HEIGHT : 0) + pageSize * ROW_HEIGHT + PAGING_FOOTER_HEIGHT

  // showPagination이 아니면(페이지네이션이 꺼져 있거나, 켜져 있어도 한 페이지뿐이면)
  // maxHeight 기준으로 판단한다 — 페이지네이션이 켜져 있다고 무조건 autoHeight로 가면
  // 호출부가 넘긴 maxHeight(예: 모달 안 표의 360px 캡)가 무시된다.
  const useAutoHeight = showPagination ? false : rows.length > 0 && contentHeight <= maxHeight
  const fixedHeight = showPagination ? pagedHeight : Math.min(maxHeight, contentHeight)

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
        style={useAutoHeight ? undefined : { height: fixedHeight }}
        className={onExport ? "m-2" : undefined}
      >
        {/* 차트(ChartCard)는 로딩 중일 때 스켈레톤으로 바뀌는데, 표만 스피너를 쓰면
            같은 화면 안에서 로딩 표현이 따로 놀아서 표도 스켈레톤으로 통일한다. */}
        {isLoading ? (
          <Skeleton style={{ height: fixedHeight }} className="w-full" />
        ) : isError ? (
          <div
            style={{ height: fixedHeight }}
            className="flex w-full flex-col items-center justify-center gap-2 text-sm text-destructive"
          >
            <AlertCircle className="size-5" />
            {errorMessage}
          </div>
        ) : (
          <AgGridReact<T>
            theme={gridTheme}
            domLayout={useAutoHeight ? "autoHeight" : "normal"}
            // 이 테마의 스크롤바는 보이지 않는(overlay) 스타일이라 그리드가 자체적으로
            // 폭을 잘못 계산해서, 세로 스크롤이 생기면 마지막 컬럼이 스크롤바 트랙 밑으로
            // 밀려 들어가 가려졌다. 실제 스크롤바 폭을 명시해 그 폭만큼 미리 비워두게 한다.
            scrollbarWidth={16}
            columnDefs={colDefs}
            rowData={rows}
            getRowId={(p: GetRowIdParams<T>) =>
              String(getRowKey(p.data, rowIndexMap.get(p.data) ?? 0))
            }
            rowHeight={ROW_HEIGHT}
            headerHeight={HEADER_HEIGHT}
            suppressCellFocus
            animateRows={false}
            pagination={showPagination}
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
        )}
      </div>
    </div>
  )
}
