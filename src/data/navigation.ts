import type { LucideIcon } from "lucide-react"
import {
  LayoutDashboard,
  Boxes,
  ScanSearch,
  Palette,
  PackageCheck,
  Route,
  Activity,
  BarChart3,
  Settings,
} from "lucide-react"

export type NavLeaf = {
  label: string
  path: string
}

export type NavGroup = {
  label: string
  icon: LucideIcon
  items: NavLeaf[]
}

export const mainNavItem: NavLeaf = { label: "메인 대시보드", path: "/main" }

export const navGroups: NavGroup[] = [
  {
    label: "AI 골재 입도분석",
    icon: Boxes,
    items: [
      { label: "골재입도 분석", path: "/aggregate/particle" },
      { label: "Gradation Lookup", path: "/aggregate/gradation/lookup" },
      { label: "Gradation Curve", path: "/aggregate/gradation/curve" },
      { label: "Gradation History", path: "/aggregate/history" },
    ],
  },
  {
    label: "기층몰탈 이물검사",
    icon: ScanSearch,
    items: [{ label: "기층몰탈 이물검사이력", path: "/bedrock/quality/history" }],
  },
  {
    label: "반제품 패턴/컬러검사",
    icon: Palette,
    items: [{ label: "반제품 품질검사 이력", path: "/semi-product/quality/emotional" }],
  },
  {
    label: "완제품 검사",
    icon: PackageCheck,
    items: [{ label: "완제품 검사이력", path: "/product/quality/emotional" }],
  },
  {
    label: "LOT 추적관리",
    icon: Route,
    items: [
      { label: "LOT 발행이력", path: "/lot/history" },
      { label: "LOT 추적(정전개)", path: "/lot/tracking/forward" },
      { label: "LOT 추적(역전개)", path: "/lot/tracking/backward" },
    ],
  },
  {
    label: "실시간 모니터링",
    icon: Activity,
    items: [
      { label: "생산정보 모니터링", path: "/monitoring/production" },
      { label: "품질정보 모니터링", path: "/monitoring/quality" },
      { label: "원자재 사용량 관리", path: "/monitoring/materials" },
    ],
  },
  {
    label: "통계/리포트",
    icon: BarChart3,
    items: [{ label: "통계 리포트", path: "/report/summary" }],
  },
  {
    label: "시스템 관리",
    icon: Settings,
    items: [{ label: "라인/설비 관리", path: "/system/lines" }],
  },
]

export const mainNavIcon: LucideIcon = LayoutDashboard
