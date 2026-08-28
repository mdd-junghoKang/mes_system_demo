import { DataTable } from "@/components/shared/DataTable"
import { StatusBadge } from "@/components/shared/StatusBadge"
import { useAggInfo } from "@/hooks/useAggInfo"
import type { AggInfoRow } from "@/types/dashboard"

export function LineManagementPage() {
  const { data, isLoading, isError } = useAggInfo()
  const rows = data?.agg_info ?? []

  return (
    <div className="flex flex-col gap-4">
      <p className="text-sm text-muted-foreground">
        등록된 라인과 골재 타입, 가동 상태를 확인합니다. (읽기 전용 — 라인 설정 변경은 아직 지원되지 않습니다)
      </p>

      <DataTable<AggInfoRow>
        columns={[
          { key: "line", header: "라인", render: (r) => r.LINE_INFO, width: "1fr" },
          { key: "agg", header: "골재 타입", render: (r) => r.AGG_INFO, width: "1fr" },
          {
            key: "status",
            header: "가동 상태",
            render: (r) =>
              r.USE_YN === "N" ? (
                <StatusBadge level="unknown" label="중지" />
              ) : (
                <StatusBadge level="normal" label="가동" />
              ),
            width: "1fr",
            sortValue: (r) => (r.USE_YN === "N" ? 0 : 1),
          },
        ]}
        rows={rows}
        getRowKey={(r) => r.LINE_INFO}
        isLoading={isLoading}
        isError={isError}
        pagination={false}
      />
    </div>
  )
}
