import { Outlet } from 'react-router-dom'
import { UserRole } from '@/@types/user'
import { SidebarInset, SidebarProvider } from '@/components/ui/sidebar'
import { cn } from '@/lib/utils/utils'
import AppSidebar from '@/components/layout/app-sidebar'
import Cookies from 'js-cookie'
import { SearchProvider } from '@/context/search-context'
import { Header } from '@/components/layout/header'
import { Search } from '@/components/search'
import { ModeToggle } from '@/components/mode-toggle'
import { ProfileDropdown } from '@/components/profile-dropdown'

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
          <div className='pt-4 px-4 pb-2 bg-gray-50/50'>
            <Header className='bg-white rounded-lg shadow-sm border border-gray-200/50'>
              <div className='flex items-center space-x-3 flex-1 justify-end max-w-lg'>
                <div className='flex-1 max-w-sm'>
                  <Search placeholder='Search...' />
                </div>
                <div className='flex items-center space-x-2'>
                  <ModeToggle />
                  <ProfileDropdown />
                </div>
              </div>
            </Header>
          </div>

          <div
            id='content'
            className={cn(
              'ml-auto w-full max-w-full flex-1',
              'peer-data-[state=collapsed]:w-[calc(100%-var(--sidebar-width-icon)-1rem)]',
              'peer-data-[state=expanded]:w-[calc(100%-var(--sidebar-width))]',
              'sm:transition-[width] sm:duration-200 sm:ease-linear',
              'flex flex-col px-4 pb-4',
              'group-data-[scroll-locked=1]/body:h-full',
              'has-[main.fixed-main]:group-data-[scroll-locked=1]/body:h-svh'
            )}
          >
            {children ? children : <Outlet />}
          </div>

          <footer className='border-t border-pink-100/50 dark:border-pink-800/30 bg-white/50 dark:bg-gray-950/50 p-4 mt-auto'>
            <div className='flex items-center justify-center'>
              <p className='text-xs text-gray-500 dark:text-gray-400'>
                © 2025 MamaFit. Made with ❤️ for expecting mothers.
              </p>
            </div>
          </footer>
        </SidebarInset>
      </SidebarProvider>
    </SearchProvider>
  )
}
export default SystemLayout
