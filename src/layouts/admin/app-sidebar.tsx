import {
  Sidebar,
  SidebarContent,
  SidebarFooter,
  SidebarHeader,
  SidebarRail,
} from '@/components/ui/sidebar'
// import { sidebarData } from './data/sidebar-data'

export function AppSidebar({ ...props }: React.ComponentProps<typeof Sidebar>) {
  return (
    <Sidebar collapsible='icon' variant='floating' {...props}>
      <SidebarHeader>
        <div>xin chao</div>
      </SidebarHeader>
      <SidebarContent>
        {/* {sidebarData.navGroups.map((props) => (
          <NavGroup key={props.title} {...props} />
        ))} */}
        Hi
      </SidebarContent>
      <SidebarFooter>
        xin chao
      </SidebarFooter>
      <SidebarRail />
    </Sidebar>
  )
}
