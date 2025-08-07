import { Sidebar, SidebarContent, SidebarFooter, SidebarHeader, SidebarRail } from '@/components/ui/sidebar'
import { sidebarData } from './data/sidebar-data'
import { NavGroup } from './nav-group'
import { LogoHeader } from './logo-header-sidebar'
import { UserRole } from '@/@types/auth.type'
import { NavUser } from './nav-user'
import { useAuth } from '@/context/auth-context'
import { QuickActions } from './quick-action'
import { SystemStatus } from './system-status'

interface AppSidebarProps extends React.ComponentProps<typeof Sidebar> {
  role: UserRole
}

function AppSidebar({ role, ...props }: AppSidebarProps) {
  const currentRole = sidebarData.role.find((r) => r.name === role)
  const { userPermission } = useAuth()

  // Transform userPermission to match NavUser expected format
  const userInfo = userPermission
    ? {
        username: userPermission.userName,
        email: userPermission.userEmail,
        role: userPermission.roleName,
        avatar: userPermission.profilePicture || '/default-avatar.png'
      }
    : null

  // Show system status for admin and managers
  const showSystemStatus = ['Admin', 'BranchManager', 'Manager'].includes(role)

  return (
    <>
      <Sidebar
        collapsible='icon'
        variant='floating'
        className='border-r-0 bg-gradient-to-b from-violet-50/50 via-background to-background dark:from-violet-950/10'
        {...props}
      >
        <SidebarHeader className='border-b border-violet-100 dark:border-violet-900/20'>
          <LogoHeader />
          {showSystemStatus && <SystemStatus role={role} />}
        </SidebarHeader>

        <SidebarContent className='custom-sidebar-scrollbar'>
          {/* Quick Actions for frequently used features */}
          {currentRole && <QuickActions role={role} />}

          {currentRole?.navGroups.map((navGroup, index) => (
            <NavGroup key={index} title={navGroup.title} items={navGroup.items} />
          ))}
        </SidebarContent>

        <SidebarFooter className='border-t border-violet-100 dark:border-violet-900/20'>
          <NavUser user={userInfo} />
        </SidebarFooter>

        <SidebarRail className='bg-gradient-to-b from-violet-100/20 to-transparent dark:from-violet-900/10' />
      </Sidebar>

      {/* Custom Sidebar Scrollbar Styles */}
      <style>{`
        .custom-sidebar-scrollbar {
          scrollbar-width: thin;
          scrollbar-color: rgba(139, 92, 246, 0.3) transparent;
        }
        .custom-sidebar-scrollbar::-webkit-scrollbar {
          width: 6px;
        }
        .custom-sidebar-scrollbar::-webkit-scrollbar-track {
          background: transparent;
        }
        .custom-sidebar-scrollbar::-webkit-scrollbar-thumb {
          background-color: rgba(139, 92, 246, 0.3);
          border-radius: 3px;
        }
        .custom-sidebar-scrollbar::-webkit-scrollbar-thumb:hover {
          background-color: rgba(139, 92, 246, 0.5);
        }
      `}</style>
    </>
  )
}

export default AppSidebar
