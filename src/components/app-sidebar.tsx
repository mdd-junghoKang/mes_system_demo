import { useEffect, useState } from "react"
import { ChevronRight, LogOut } from "lucide-react"
import { NavLink, useLocation, useNavigate } from "react-router-dom"

import sidebarLogo from "@/assets/sidebar-logo.png"
import { mainNavIcon, mainNavItem, navGroups } from "@/data/navigation"
import { useAuth } from "@/hooks/useAuth"
import {
  Sidebar,
  SidebarContent,
  SidebarFooter,
  SidebarGroup,
  SidebarGroupContent,
  SidebarGroupLabel,
  SidebarHeader,
  SidebarMenu,
  SidebarMenuButton,
  SidebarMenuItem,
  SidebarMenuSub,
  SidebarMenuSubButton,
  SidebarMenuSubItem,
} from "@/components/ui/sidebar"
import { Collapsible, CollapsibleContent, CollapsibleTrigger } from "@/components/ui/collapsible"

export function AppSidebar() {
  const location = useLocation()
  const navigate = useNavigate()
  const { logout } = useAuth()

  // Collapsible의 defaultOpen은 "처음 한 번만" 쓰이는 값인데, 매 렌더마다 현재
  // 라우트로 다시 계산해서 넘기면 base-ui가 "uncontrolled → controlled 전환" 경고를
  // 내고 그룹이 사용자 의도와 다르게 열리고 닫힐 수 있다. 그룹별 열림 상태를 직접
  // 들고 있는 controlled 컴포넌트로 바꾸고, 활성 라우트가 속한 그룹만 자동으로 연다.
  const [openGroups, setOpenGroups] = useState<Record<string, boolean>>(() =>
    Object.fromEntries(
      navGroups.map((group) => [
        group.label,
        group.items.some((item) => location.pathname === item.path),
      ]),
    ),
  )

  useEffect(() => {
    const activeGroup = navGroups.find((group) =>
      group.items.some((item) => location.pathname === item.path),
    )
    if (!activeGroup) return
    setOpenGroups((prev) => (prev[activeGroup.label] ? prev : { ...prev, [activeGroup.label]: true }))
  }, [location.pathname])

  async function handleLogout() {
    await logout()
    navigate("/login", { replace: true })
  }

  return (
    <Sidebar collapsible="icon">
      <SidebarHeader className="border-b px-3 py-3">
        <div className="flex items-center gap-2 px-1">
          <img
            src={sidebarLogo}
            alt="Inoblock"
            className="h-8 w-8 shrink-0 object-contain group-data-[collapsible=icon]:h-6 group-data-[collapsible=icon]:w-6"
          />
          <div className="flex flex-col leading-tight group-data-[collapsible=icon]:hidden">
            <span className="text-sm font-semibold">Inoblock A-QMS</span>
            <span className="text-xs text-muted-foreground">품질관리 시스템</span>
          </div>
        </div>
      </SidebarHeader>

      <SidebarContent>
        <SidebarGroup>
          <SidebarGroupContent>
            <SidebarMenu>
              <SidebarMenuItem>
                <SidebarMenuButton
                  isActive={location.pathname === mainNavItem.path}
                  render={<NavLink to={mainNavItem.path} />}
                >
                  {(() => {
                    const Icon = mainNavIcon
                    return <Icon />
                  })()}
                  <span>{mainNavItem.label}</span>
                </SidebarMenuButton>
              </SidebarMenuItem>
            </SidebarMenu>
          </SidebarGroupContent>
        </SidebarGroup>

        {navGroups.map((group) => {
          const Icon = group.icon

          return (
            <SidebarGroup key={group.label}>
              <Collapsible
                open={openGroups[group.label] ?? false}
                onOpenChange={(open) =>
                  setOpenGroups((prev) => ({ ...prev, [group.label]: open }))
                }
                className="group/collapsible"
              >
                <SidebarGroupLabel render={<CollapsibleTrigger className="flex w-full items-center gap-2" />}>
                  <Icon className="size-4" />
                  <span className="flex-1 text-left">{group.label}</span>
                  <ChevronRight className="size-4 transition-transform group-data-open/collapsible:rotate-90" />
                </SidebarGroupLabel>
                <CollapsibleContent>
                  <SidebarGroupContent>
                    <SidebarMenuSub className="mx-0 border-l-0 px-2">
                      {group.items.map((item) => (
                        <SidebarMenuSubItem key={item.path}>
                          <SidebarMenuSubButton
                            isActive={location.pathname === item.path}
                            render={<NavLink to={item.path} />}
                          >
                            <span>{item.label}</span>
                          </SidebarMenuSubButton>
                        </SidebarMenuSubItem>
                      ))}
                    </SidebarMenuSub>
                  </SidebarGroupContent>
                </CollapsibleContent>
              </Collapsible>
            </SidebarGroup>
          )
        })}
      </SidebarContent>

      <SidebarFooter className="border-t">
        <SidebarMenu>
          <SidebarMenuItem>
            <SidebarMenuButton onClick={handleLogout}>
              <LogOut />
              <span>로그아웃</span>
            </SidebarMenuButton>
          </SidebarMenuItem>
        </SidebarMenu>
      </SidebarFooter>
    </Sidebar>
  )
}
