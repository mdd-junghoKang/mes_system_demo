import { useState } from "react"
import { ChevronRight } from "lucide-react"

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
      <p className="mb-4 text-sm font-semibold">LOT {lot.LOT_NO} 공정 흐름</p>
      <div className="flex flex-wrap items-stretch gap-1">
        {STEPS.map((step, i) => {
          const stepFlow = flowData?.filter((r) => r.GUBUN === step.gubun) ?? []
          return (
            <div key={step.gubun} className="flex items-center gap-1">
              <div className="flex w-32 flex-col gap-1.5">
                <button
                  type="button"
                  disabled={!step.cardGubun}
                  onClick={() => step.cardGubun && setActiveModal(step.cardGubun)}
                  className={cn(
                    "flex h-16 flex-col items-center justify-center rounded-md text-xs font-medium text-white transition-colors",
                    step.cardGubun ? "cursor-pointer bg-blue-600 hover:bg-blue-700" : "cursor-default bg-slate-400",
                  )}
                >
                  {step.label}
                </button>
                <div className="min-h-16 rounded-md bg-slate-900 p-1.5 text-[10px] text-slate-100">
                  {stepFlow.length === 0 ? (
                    <p className="text-slate-400">데이터 없음</p>
                  ) : (
                    stepFlow.map((r, idx) => (
                      <div key={idx} className="flex justify-between gap-1">
                        <span className="text-slate-400">{r.TYPE}</span>
                        <span>{r.VALUE}</span>
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
