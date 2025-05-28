import { Sidebar, SidebarContent, SidebarFooter, SidebarHeader, SidebarRail } from '@/components/ui/sidebar'
import { sidebarData } from './data/sidebar-data'
import { NavGroup } from './nav-group'
import { LogoHeader } from './logo-header-sidebar'
import { UserRole } from '@/types/user'
import { NavUser } from './nav-user'

interface AppSidebarProps extends React.ComponentProps<typeof Sidebar> {
  role: UserRole
}

function AppSidebar({ role, ...props }: AppSidebarProps) {
  // Tìm role tương ứng trong sidebarData
  const currentRole = sidebarData.role.find((r) => r.name === role)

  return (
    <Sidebar collapsible='icon' variant='floating' {...props}>
      <SidebarHeader>
        <LogoHeader />
      </SidebarHeader>
      <SidebarContent>
        {currentRole?.navGroups.map((navGroup, index) => (
          <NavGroup key={index} title={navGroup.title} items={navGroup.items} />
        ))}
      </SidebarContent>
      <SidebarFooter>
        <NavUser user={sidebarData.user} />
      </SidebarFooter>
      <SidebarRail />
    </Sidebar>
  )
}
export default AppSidebar
