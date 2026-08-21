/**
 * 앱 전체에서 쓰는 상태 심각도 5단계와 그 색상 값(토큰)을 한 곳에 정의한다.
 * 페이지마다 "위험=빨강"을 각자 다시 고르지 않도록 — 실제로 BedrockQualityPage,
 * SemiProductQualityPage, LOT 카드가 전부 조금씩 다른 빨강/초록을 쓰고 있었다.
 * 색을 바꾸고 싶으면 이 파일 하나만 고치면 전체 화면에 반영된다.
 */
export type StatusLevel = "normal" | "caution" | "danger" | "stop" | "unknown"

type StatusConfig = {
  /** 라벨을 따로 안 넘겼을 때 쓸 기본 한글 표시명 */
  label: string
  /** 아이콘/텍스트 단독 색상 (예: StatusChip의 체크/엑스 아이콘) */
  textClassName: string
  /** 옅은 배경 + 진한 텍스트 — Badge 같은 pill 형태에 쓴다 */
  badgeClassName: string
  /** 꽉 찬 배경색 — 카드 상단 강조바, 점(dot) 등에 쓴다 */
  accentClassName: string
}

export const STATUS_CONFIG: Record<StatusLevel, StatusConfig> = {
  normal: {
    label: "정상",
    textClassName: "text-emerald-500",
    badgeClassName: "bg-emerald-100 text-emerald-700 dark:bg-emerald-950 dark:text-emerald-300",
    accentClassName: "bg-emerald-500",
  },
  caution: {
    label: "주의",
    textClassName: "text-amber-500",
    badgeClassName: "bg-amber-100 text-amber-700 dark:bg-amber-950 dark:text-amber-300",
    accentClassName: "bg-amber-500",
  },
  danger: {
    label: "위험",
    textClassName: "text-red-500",
    badgeClassName: "bg-red-100 text-red-700 dark:bg-red-950 dark:text-red-300",
    accentClassName: "bg-red-500",
  },
  stop: {
    label: "정지",
    textClassName: "text-red-700",
    badgeClassName: "bg-red-200 text-red-900 dark:bg-red-900 dark:text-red-100",
    accentClassName: "bg-red-700",
  },
  unknown: {
    label: "알 수 없음",
    textClassName: "text-muted-foreground/50",
    badgeClassName: "bg-muted text-muted-foreground",
    accentClassName: "bg-border",
  },
}
