import { Outlet } from 'react-router-dom'
import { UserRole } from '@/@types/auth.type'
import { SidebarInset, SidebarProvider } from '@/components/ui/sidebar'
import { cn } from '@/lib/utils/utils'
import AppSidebar from '@/components/layout/app-sidebar'
import Cookies from 'js-cookie'
import { SearchProvider } from '@/context/search-context'
import { Header } from '@/components/layout/header'
import { Search } from '@/components/search'
import { ModeToggle } from '@/components/mode-toggle'
import { NotificationDropdown } from '@/components/notification-dropdown'

interface Props {
  children?: React.ReactNode
  role: UserRole
}

function SystemLayout({ role, children }: Props) {
  const defaultOpen = Cookies.get('sidebar_state') !== 'false'
  return (
    <SearchProvider>
      <SidebarProvider defaultOpen={defaultOpen}>
        <AppSidebar role={role} />
        <SidebarInset className='flex flex-1 flex-col transition-all duration-300 ease-in-out'>
          <Header>
            <div className='flex items-center gap-3 flex-1 justify-end max-w-lg'>
              <div className='flex-1 max-w-sm'>
                <Search placeholder='Search...' />
              </div>
              <div className='flex items-center gap-2'>
                <NotificationDropdown />
                <ModeToggle />
              </div>
            </div>
          </Header>

          <div
            id='content'
            className={cn(
              'ml-auto w-full max-w-full flex-1',
              'peer-data-[state=collapsed]:w-[calc(100%-var(--sidebar-width-icon)-1rem)]',
              'peer-data-[state=expanded]:w-[calc(100%-var(--sidebar-width))]',
              'sm:transition-[width] sm:duration-200 sm:ease-linear',
              'flex flex-col px-6 py-6',
              'group-data-[scroll-locked=1]/body:h-full',
              'has-[main.fixed-main]:group-data-[scroll-locked=1]/body:h-svh'
            )}
          >
            {children ? children : <Outlet />}
          </div>

          <footer className='border-t bg-muted/30 px-6 py-4 mt-auto'>
            <div className='flex items-center justify-center'>
              <p className='text-xs text-muted-foreground'>© 2025 MamaFit. Made with ❤️ for expecting mothers.</p>
            </div>
          </footer>
        </SidebarInset>
      </SidebarProvider>
    </SearchProvider>
  )
}
export default SystemLayout
