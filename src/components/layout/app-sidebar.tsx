import { Sidebar, SidebarContent, SidebarFooter, SidebarHeader, SidebarRail } from '@/components/ui/sidebar'
import { sidebarData } from './data/sidebar-data'
import { NavGroup } from './nav-group'
import { LogoHeader } from './logo-header-sidebar'
import { UserRole } from '@/@types/auth.type'
import { NavUser } from './nav-user'
import { useAuth } from '@/context/auth-context'

interface AppSidebarProps extends React.ComponentProps<typeof Sidebar> {
  role: UserRole
}

function AppSidebar({ role, ...props }: AppSidebarProps) {
  const currentRole = sidebarData.role.find((r) => r.name === role)
  const { userPermission } = useAuth()

  // Transform userPermission to match NavUser expected format
  const userInfo = userPermission ? {
    username: userPermission.userName,
    email: userPermission.userEmail,
    role: userPermission.roleName,
    avatar: userPermission.profilePicture || '/default-avatar.png'
  } : null

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
        <NavUser user={userInfo} />
      </SidebarFooter>
      <SidebarRail />
    </Sidebar>
  )
}
export default AppSidebar
