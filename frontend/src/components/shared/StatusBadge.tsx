import { AlertOctagon, AlertTriangle, CheckCircle2, HelpCircle, OctagonX } from "lucide-react"

import { Badge } from "@/components/ui/badge"
import { cn } from "@/lib/utils"
import { STATUS_CONFIG, type StatusLevel } from "@/lib/status"

const ICONS: Record<StatusLevel, typeof CheckCircle2> = {
  normal: CheckCircle2,
  caution: AlertTriangle,
  danger: AlertOctagon,
  stop: OctagonX,
  unknown: HelpCircle,
}

type Props = {
  level: StatusLevel
  /** 화면에 보여줄 텍스트 (기본값은 한글 라벨). 원본 값을 그대로 보여줘야 할 때
      (예: "DANGER", "NG" 같은 코드성 표시)는 여기에 넘긴다. */
  label?: string
  className?: string
}

/** 색만으로 상태를 구분하지 않도록 아이콘 모양도 같이 준다(색약 접근성). */
export function StatusBadge({ level, label, className }: Props) {
  const config = STATUS_CONFIG[level]
  const Icon = ICONS[level]
  return (
    <Badge variant="secondary" className={cn("gap-1", config.badgeClassName, className)}>
      <Icon className="size-3" />
      {label ?? config.label}
    </Badge>
  )
}
