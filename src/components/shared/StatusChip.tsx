import { CheckCircle2, HelpCircle, XCircle } from "lucide-react"

type Props = {
  label: string
  value: string | null | undefined
}

// 카드뷰에서 Y/N 같은 상태값을 텍스트 대신 아이콘+색으로 보여준다.
// 표 안 "Y"/"N" 글자보다 한눈에 스캔하기 쉬워서(=가시성) 카드뷰에 맞춰 새로 만들었다.
export function StatusChip({ label, value }: Props) {
  const isYes = value === "Y"
  const isNo = value === "N"

  return (
    <div className="flex flex-1 flex-col items-center gap-1">
      {isYes ? (
        <CheckCircle2 className="size-5 text-emerald-500" />
      ) : isNo ? (
        <XCircle className="size-5 text-red-400" />
      ) : (
        <HelpCircle className="size-5 text-muted-foreground/40" />
      )}
      <span className="text-center text-[11px] leading-tight text-muted-foreground">{label}</span>
    </div>
  )
}
