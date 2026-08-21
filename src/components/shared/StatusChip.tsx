import { CheckCircle2, HelpCircle, XCircle } from "lucide-react"

import { cn } from "@/lib/utils"
import { STATUS_CONFIG } from "@/lib/status"

type Props = {
  label: string
  value: string | null | undefined
}

// 카드뷰에서 Y/N 같은 상태값을 텍스트 대신 아이콘+색으로 보여준다.
// 표 안 "Y"/"N" 글자보다 한눈에 스캔하기 쉬워서(=가시성) 카드뷰에 맞춰 새로 만들었다.
// 색은 status.ts의 공용 토큰을 쓴다 — 다른 페이지의 위험/정상 색과 항상 같은 값이 되도록.
export function StatusChip({ label, value }: Props) {
  const isYes = value === "Y"
  const isNo = value === "N"

  return (
    <div className="flex flex-1 flex-col items-center gap-1">
      {isYes ? (
        <CheckCircle2 className={cn("size-5", STATUS_CONFIG.normal.textClassName)} />
      ) : isNo ? (
        <XCircle className={cn("size-5", STATUS_CONFIG.danger.textClassName)} />
      ) : (
        <HelpCircle className={cn("size-5", STATUS_CONFIG.unknown.textClassName)} />
      )}
      <span className="text-center text-[11px] leading-tight text-muted-foreground">{label}</span>
    </div>
  )
}
