import { Sidebar, SidebarContent, SidebarFooter, SidebarHeader, SidebarRail } from '@/components/ui/sidebar'
import Logo from '/images/mamafit-splash-screen.png'
import { sidebarData } from './data/sidebar-data'
import { NavGroup } from './nav-group'
import { UserRole } from '@/types/user'

interface AppSidebarProps extends React.ComponentProps<typeof Sidebar> {
  role: UserRole
}

function AppSidebar2({ role, ...props }: AppSidebarProps) {
  // Tìm role tương ứng trong sidebarData
  const currentRole = sidebarData.role.find((r) => r.name === role)

  return (
    <Sidebar collapsible='icon' variant='floating' {...props}>
      <SidebarHeader>
        <div className='bg-sidebar-primary text-sidebar-primary-foreground flex aspect-square size-8 items-center justify-center rounded-lg'>
          <img src={Logo} className='size-4' />
        </div>
      </SidebarHeader>
      <SidebarContent>
        {/* Render NavGroups theo role */}
        {currentRole?.navGroups.map((navGroup, index) => (
          <NavGroup key={index} title={navGroup.title} items={navGroup.items} />
        ))}
      </SidebarContent>
      <SidebarFooter>{/* <NavUser user={sidebarData.user} /> */}</SidebarFooter>
      <SidebarRail />
    </Sidebar>
  )
}
export default AppSidebar2
