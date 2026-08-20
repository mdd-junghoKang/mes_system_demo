import { useLocation } from "react-router-dom"
import { SidebarTrigger } from "@/components/ui/sidebar"
import { Separator } from "@/components/ui/separator"
import { mainNavItem, navGroups } from "@/data/navigation"

function usePageTitle() {
  const { pathname } = useLocation()

  if (pathname === mainNavItem.path) {
    return { title: mainNavItem.label, section: undefined as string | undefined }
  }

  for (const group of navGroups) {
    const match = group.items.find((item) => item.path === pathname)
    if (match) return { title: match.label, section: group.label }
  }

  return { title: "Inoblock A-QMS", section: undefined }
}

export function AppTopbar() {
  const { title, section } = usePageTitle()

  return (
    <header className="flex h-14 shrink-0 items-center gap-2 border-b bg-background px-4">
      <SidebarTrigger />
      <Separator orientation="vertical" className="mr-1 h-4" />
      <div className="flex items-baseline gap-2">
        {section && (
          <>
            <span className="text-sm text-muted-foreground">{section}</span>
            <span className="text-sm text-muted-foreground">/</span>
          </>
        )}
        <h1 className="text-base font-semibold">{title}</h1>
      </div>
    </header>
  )
}
