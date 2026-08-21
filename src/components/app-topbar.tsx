import { useLocation } from "react-router-dom"
import { SidebarTrigger } from "@/components/ui/sidebar"
import { Separator } from "@/components/ui/separator"
import { mainNavItem, navGroups } from "@/data/navigation"

function usePageTitle() {
  const { pathname } = useLocation()

  if (pathname === mainNavItem.path) {
    return mainNavItem.label
  }

  for (const group of navGroups) {
    const match = group.items.find((item) => item.path === pathname)
    if (match) return match.label
  }

  return "옥천산업 A-QMS"
}

export function AppTopbar() {
  const title = usePageTitle()

  return (
    <header className="flex h-14 shrink-0 items-center gap-2 border-b bg-background px-4">
      <SidebarTrigger />
      <Separator orientation="vertical" className="mr-1 h-4" />
      <h1 className="text-2xl font-bold tracking-tight">{title}</h1>
    </header>
  )
}
