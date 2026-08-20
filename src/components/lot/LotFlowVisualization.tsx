import { useState } from "react"
import { ChevronRight, MousePointerClick } from "lucide-react"

import { Dialog } from "@/components/ui/dialog"
import { cn } from "@/lib/utils"
import { useLotCardData } from "@/hooks/useLotCardData"
import { FLOW_STEP_LABELS, type FlowTrackingRow, type LotTrackingRow } from "@/types/lot"
import type {
  AggCardRow,
  CardGubun,
  CuringCardRow,
  FpCardRow,
  MixCardRow,
  MoldCardRow,
  SfpCardRow,
} from "@/types/lotCardData"

import { AggCardModal } from "./AggCardModal"
import { MixCardModal } from "./MixCardModal"
import { MoldCardModal } from "./MoldCardModal"
import { SfpCardModal } from "./SfpCardModal"
import { CuringCardModal } from "./CuringCardModal"
import { FpCardModal } from "./FpCardModal"

type Step = {
  gubun: string
  label: string
  cardGubun?: CardGubun
}

const STEPS: Step[] = [
  { gubun: "001", label: FLOW_STEP_LABELS["001"], cardGubun: "AGG" },
  { gubun: "002", label: FLOW_STEP_LABELS["002"], cardGubun: "MIX" },
  { gubun: "003", label: FLOW_STEP_LABELS["003"], cardGubun: "MOLD" },
  { gubun: "004", label: FLOW_STEP_LABELS["004"], cardGubun: "SFP" },
  { gubun: "005", label: FLOW_STEP_LABELS["005"], cardGubun: "CURING" },
  { gubun: "006", label: FLOW_STEP_LABELS["006"] },
  { gubun: "007", label: FLOW_STEP_LABELS["007"], cardGubun: "FP" },
]

type Props = {
  lot: LotTrackingRow
  flowData: FlowTrackingRow[] | undefined
}

export function LotFlowVisualization({ lot, flowData }: Props) {
  const [activeModal, setActiveModal] = useState<CardGubun | null>(null)
  const cardQuery = useLotCardData<unknown>(activeModal, lot.LOT_NO)
  const rows = (cardQuery.data?.lot_flow_list ?? []) as unknown[]

  return (
    <div className="rounded-lg border bg-background p-4">
      <div className="mb-3 flex flex-wrap items-center justify-between gap-2">
        <p className="text-sm font-semibold">LOT {lot.LOT_NO} 공정 흐름</p>
        <p className="flex items-center gap-1.5 text-xs text-muted-foreground">
          <MousePointerClick className="size-3.5" />
          "상세보기"가 표시된 단계를 클릭하면 상세 정보를 볼 수 있습니다
        </p>
      </div>

      <dl className="mb-4 grid grid-cols-2 gap-x-4 gap-y-1.5 rounded-md bg-muted/30 p-3 text-sm sm:grid-cols-3">
        <div className="flex justify-between gap-2 sm:block sm:space-y-0.5">
          <dt className="text-muted-foreground">작업지시번호</dt>
          <dd>{lot.ORDER_NO}</dd>
        </div>
        <div className="flex justify-between gap-2 sm:block sm:space-y-0.5">
          <dt className="text-muted-foreground">품번</dt>
          <dd>{lot.ITEM_CD}</dd>
        </div>
        <div className="flex justify-between gap-2 sm:block sm:space-y-0.5">
          <dt className="text-muted-foreground">배치번호</dt>
          <dd>{lot.MIX_NO}</dd>
        </div>
      </dl>

      <div className="flex flex-wrap items-stretch gap-1">
        {STEPS.map((step, i) => {
          const stepFlow = flowData?.filter((r) => r.GUBUN === step.gubun) ?? []
          const clickable = Boolean(step.cardGubun)
          return (
            <div key={step.gubun} className="flex items-center gap-1">
              <div className="flex w-32 flex-col gap-1.5">
                <button
                  type="button"
                  disabled={!clickable}
                  onClick={() => step.cardGubun && setActiveModal(step.cardGubun)}
                  className={cn(
                    "flex h-16 flex-col items-center justify-center gap-0.5 rounded-md border text-xs font-medium transition-colors",
                    clickable
                      ? "cursor-pointer border-primary/20 bg-primary/10 text-primary hover:bg-primary/15"
                      : "cursor-default border-transparent bg-muted text-muted-foreground",
                  )}
                >
                  {step.label}
                  {clickable && <span className="text-[10px] font-normal opacity-70">상세보기</span>}
                </button>
                <div className="min-h-16 rounded-md border bg-muted/30 p-1.5 text-[10px] text-muted-foreground">
                  {stepFlow.length === 0 ? (
                    <p>데이터 없음</p>
                  ) : (
                    stepFlow.map((r, idx) => (
                      <div key={idx} className="flex justify-between gap-1">
                        <span>{r.TYPE}</span>
                        <span className="text-foreground">{r.VALUE}</span>
                      </div>
                    ))
                  )}
                </div>
              </div>
              {i < STEPS.length - 1 && <ChevronRight className="size-4 shrink-0 text-muted-foreground" />}
            </div>
          )
        })}
      </div>

      <Dialog open={!!activeModal} onOpenChange={(open) => !open && setActiveModal(null)}>
        {activeModal === "AGG" && <AggCardModal rows={rows as AggCardRow[]} />}
        {activeModal === "MIX" && <MixCardModal rows={rows as MixCardRow[]} />}
        {activeModal === "MOLD" && rows.length > 0 && <MoldCardModal row={rows[0] as MoldCardRow} />}
        {activeModal === "SFP" && rows.length > 0 && (
          <SfpCardModal row={rows[0] as SfpCardRow} colorQuality={lot.COLOR_QUALITY} />
        )}
        {activeModal === "CURING" && <CuringCardModal rows={rows as CuringCardRow[]} />}
        {activeModal === "FP" && rows.length > 0 && <FpCardModal row={rows[0] as FpCardRow} />}
      </Dialog>
    </div>
  )
}
