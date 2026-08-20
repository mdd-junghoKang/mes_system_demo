import { useEffect } from "react"
import { Outlet, useLocation } from "react-router-dom"
import { SidebarProvider, SidebarInset } from "@/components/ui/sidebar"
import { AppSidebar } from "@/components/app-sidebar"
import { AppTopbar } from "@/components/app-topbar"

export function AppShell() {
  const { pathname } = useLocation()

  // 사이드바 레이아웃 전체가 min-h-svh(최소 높이)라서 실제 스크롤은 <main> 내부가
  // 아니라 window(문서 전체)에서 일어난다. 그래서 사이드바로 다른 화면으로 이동해도
  // 이전 화면에서 내려가 있던 스크롤 위치가 그대로 남아 새 화면이 중간부터 보이는
  // 문제가 있었다. 경로가 바뀔 때마다 맨 위로 되돌린다.
  useEffect(() => {
    window.scrollTo({ top: 0 })
  }, [pathname])

  return (
    <SidebarProvider>
      <AppSidebar />
      <SidebarInset>
        <AppTopbar />
        <main className="flex-1 overflow-y-auto bg-muted/30 p-6">
          <Outlet />
        </main>
      </SidebarInset>
    </SidebarProvider>
  )
}
