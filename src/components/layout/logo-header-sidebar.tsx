import * as React from 'react'
import { SidebarMenu, SidebarMenuButton, SidebarMenuItem } from '@/components/ui/sidebar'
import Logo from '/images/mamafit-splash-screen.png'

export function LogoHeader() {
  return (
    <SidebarMenu>
      <SidebarMenuItem>
        <SidebarMenuButton size='lg' className='hover:bg-sidebar-accent hover:text-sidebar-accent-foreground'>
          <div className='bg-violet-50 flex aspect-square size-8 items-center justify-center rounded-lg shadow-lg'>
            <img src={Logo} className='size-8' />
          </div>
          <div className='ml-1 grid flex-1 text-left text-sm leading-tight'>
            <span className='truncate font-semibold text-lg'>MamaFit</span>
            <span className='truncate text-xs text-sidebar-muted-foreground'>Maternity Dress & Custom Dress</span>
          </div>
        </SidebarMenuButton>
      </SidebarMenuItem>
    </SidebarMenu>
  )
}
