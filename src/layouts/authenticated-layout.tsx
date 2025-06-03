import { Outlet } from 'react-router-dom'
import { UserRole } from '@/@types/user'
import { SidebarInset, SidebarProvider } from '@/components/ui/sidebar'
import { cn } from '@/lib/utils/utils'
import AppSidebar from '@/components/layout/app-sidebar'
import Cookies from 'js-cookie'
import { SearchProvider } from '@/context/search-context'

interface Props {
  children?: React.ReactNode
  role: UserRole
}

function AuthenticatedLayout({ role, children }: Props) {
  const defaultOpen = Cookies.get('sidebar_state') !== 'false'
  return (
    <SearchProvider>
      <SidebarProvider defaultOpen={defaultOpen}>
        {/* <SkipToMain /> */}
        <AppSidebar role={role} />
        <SidebarInset className='flex flex-1 flex-col transition-all duration-300 ease-in-out'>
          <div
            id='content'
            className={cn(
              'ml-auto w-full max-w-full',
              'peer-data-[state=collapsed]:w-[calc(100%-var(--sidebar-width-icon)-1rem)]',
              'peer-data-[state=expanded]:w-[calc(100%-var(--sidebar-width))]',
              'sm:transition-[width] sm:duration-200 sm:ease-linear',
              'flex h-svh flex-col',
              'group-data-[scroll-locked=1]/body:h-full',
              'has-[main.fixed-main]:group-data-[scroll-locked=1]/body:h-svh'
            )}
          >
            {children ? children : <Outlet />}
          </div>
          <footer className='border-t border-pink-100/50 dark:border-pink-800/30 bg-white/50 dark:bg-gray-950/50 p-4'>
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
export default AuthenticatedLayout
