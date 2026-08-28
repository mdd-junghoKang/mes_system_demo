import { useState } from "react"
import { ChevronRight, Factory, LogOut } from "lucide-react"
import { NavLink, useLocation, useNavigate } from "react-router-dom"

import { mainNavIcon, mainNavItem, navGroups } from "@/data/navigation"
import { useAuth } from "@/store/useAuth"
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
  useSidebar,
} from "@/components/ui/sidebar"
import { Collapsible, CollapsibleContent, CollapsibleTrigger } from "@/components/ui/collapsible"
import { Popover, PopoverContent, PopoverTrigger } from "@/components/ui/popover"
import { Button } from "@/components/ui/button"

// 하위 메뉴가 1개뿐인 그룹(기층몰탈 이물검사, 반제품 패턴/컬러검사, 완제품 검사,
// 통계/리포트, 시스템 관리)은 펼쳐봐야 항목이 하나뿐이라 아코디언으로 만들 이유가
// 없다 — 메인 대시보드처럼 그냥 한 줄짜리 바로가기 링크로 보여준다.
function SingleItemNavLink({ group, isActive }: { group: (typeof navGroups)[number]; isActive: boolean }) {
  const Icon = group.icon
  const path = group.items[0].path
  return (
    <SidebarGroup>
      <SidebarGroupContent>
        <SidebarMenu>
          <SidebarMenuItem>
            <SidebarMenuButton isActive={isActive} render={<NavLink to={path} />}>
              <Icon />
              <span>{group.label}</span>
            </SidebarMenuButton>
          </SidebarMenuItem>
        </SidebarMenu>
      </SidebarGroupContent>
    </SidebarGroup>
  )
}

// 사이드바가 아이콘 전용으로 접혀 있으면 그룹 라벨/서브메뉴가 전부 숨겨져서
// 실제로는 "메인 대시보드"만 아이콘으로 남고 나머지 그룹은 눌러도 아무 일도
// 일어나지 않았다. 접힌 상태에서는 그룹 아이콘을 누르면 하위 메뉴를 팝오버로
// 띄워서, 펼치지 않고도 바로 이동할 수 있게 한다.
function CollapsedGroupPopover({
  group,
  pathname,
  isGroupActive,
}: {
  group: (typeof navGroups)[number]
  pathname: string
  isGroupActive: boolean
}) {
  const Icon = group.icon
  return (
    <SidebarGroup>
      <SidebarMenu>
        <SidebarMenuItem>
          <Popover>
            <PopoverTrigger render={<SidebarMenuButton isActive={isGroupActive} />}>
              <Icon />
              <span>{group.label}</span>
            </PopoverTrigger>
            <PopoverContent side="right" align="start" className="w-56 p-1.5">
              <p className="px-2 py-1 text-xs font-medium text-muted-foreground">{group.label}</p>
              <div className="mt-1 flex flex-col gap-0.5">
                {group.items.map((item) => (
                  <Button
                    key={item.path}
                    variant={pathname === item.path ? "secondary" : "ghost"}
                    size="sm"
                    className="justify-start"
                    render={<NavLink to={item.path} />}
                  >
                    {item.label}
                  </Button>
                ))}
              </div>
            </PopoverContent>
          </Popover>
        </SidebarMenuItem>
      </SidebarMenu>
    </SidebarGroup>
  )
}

function ExpandedGroupAccordion({
  group,
  pathname,
  open,
  onOpenChange,
}: {
  group: (typeof navGroups)[number]
  pathname: string
  open: boolean
  onOpenChange: (open: boolean) => void
}) {
  const Icon = group.icon
  return (
    <SidebarGroup>
      <Collapsible open={open} onOpenChange={onOpenChange} className="group/collapsible">
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
                  <SidebarMenuSubButton isActive={pathname === item.path} render={<NavLink to={item.path} />}>
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
}

export function AppSidebar() {
  const location = useLocation()
  const navigate = useNavigate()
  const { logout } = useAuth()
  const { state } = useSidebar()
  const isCollapsed = state === "collapsed"

  const multiItemGroups = navGroups.filter((group) => group.items.length > 1)

  // Collapsible의 defaultOpen은 "처음 한 번만" 쓰이는 값인데, 매 렌더마다 현재
  // 라우트로 다시 계산해서 넘기면 base-ui가 "uncontrolled → controlled 전환" 경고를
  // 내고 그룹이 사용자 의도와 다르게 열리고 닫힐 수 있다. 그룹별 열림 상태를 직접
  // 들고 있는 controlled 컴포넌트로 바꾸고, 활성 라우트가 속한 그룹만 자동으로 연다.
  const [openGroups, setOpenGroups] = useState<Record<string, boolean>>(() =>
    Object.fromEntries(
      multiItemGroups.map((group) => [
        group.label,
        group.items.some((item) => location.pathname === item.path),
      ]),
    ),
  )

  // 라우트가 바뀔 때만(다른 상태 변경 시에는 안 건드리고) 활성 그룹을 자동으로
  // 연다 — useEffect+setState 대신 렌더 중 이전 값과 비교하는 방식(React가 권장하는
  // "adjust state during render" 패턴)을 쓰면 추가 렌더 한 번을 아낄 수 있다.
  // prevPathname 없이 "활성 그룹이 항상 열려 있어야 한다"고만 체크하면, 사용자가
  // 활성 그룹을 수동으로 접어도 렌더될 때마다 다시 펴져버린다 — 그래서 "방금 막
  // 이동했을 때"만 열도록 이전 경로와 비교한다.
  const [prevPathname, setPrevPathname] = useState(location.pathname)
  if (location.pathname !== prevPathname) {
    setPrevPathname(location.pathname)
    const activeGroup = navGroups.find(
      (group) => group.items.length > 1 && group.items.some((item) => location.pathname === item.path),
    )
    if (activeGroup && !openGroups[activeGroup.label]) {
      setOpenGroups((prev) => ({ ...prev, [activeGroup.label]: true }))
    }
  }

  async function handleLogout() {
    await logout()
    navigate("/login", { replace: true })
  }

  return (
    <Sidebar collapsible="icon">
      <SidebarHeader className="border-b px-3 py-3 group-data-[collapsible=icon]:px-2">
        <div className="flex items-center gap-2 px-1 group-data-[collapsible=icon]:px-0">
          <div className="flex h-8 w-8 shrink-0 items-center justify-center rounded-full bg-primary text-primary-foreground">
            <Factory className="size-4" />
          </div>
          <div className="flex flex-col leading-tight group-data-[collapsible=icon]:hidden">
            <span className="text-sm font-semibold">옥천산업 A-QMS</span>
            <span className="text-xs text-sidebar-foreground/60">품질관리 시스템</span>
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
          if (group.items.length === 1) {
            return (
              <SingleItemNavLink
                key={group.label}
                group={group}
                isActive={location.pathname === group.items[0].path}
              />
            )
          }

          const isGroupActive = group.items.some((item) => location.pathname === item.path)

          return isCollapsed ? (
            <CollapsedGroupPopover
              key={group.label}
              group={group}
              pathname={location.pathname}
              isGroupActive={isGroupActive}
            />
          ) : (
            <ExpandedGroupAccordion
              key={group.label}
              group={group}
              pathname={location.pathname}
              open={openGroups[group.label] ?? false}
              onOpenChange={(open) => setOpenGroups((prev) => ({ ...prev, [group.label]: open }))}
            />
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
        <p className="px-3 pb-1 text-[11px] text-sidebar-foreground/40 group-data-[collapsible=icon]:hidden">
          ver 1.0.0 · © Okcheon Industry Co., Ltd.
        </p>
      </SidebarFooter>
    </Sidebar>
  )
}
