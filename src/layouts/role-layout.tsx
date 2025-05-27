import { Outlet } from 'react-router-dom'
import { UserRole } from '@/types/user'
import { SidebarInset, SidebarProvider, SidebarTrigger } from '@/components/ui/sidebar'
import AppSidebar from './app-sidebar'
import { ModeToggle } from '@/components/mode-toggle'
import { Button } from '@/components/ui/button'
import { Avatar, AvatarFallback, AvatarImage } from '@/components/ui/avatar'
import { User } from 'lucide-react'
import { cn } from '@/lib/utils/utils'

interface RoleLayoutProps {
  role: UserRole
}
function Topbar() {
  return (
    <header className='sticky top-0 z-40 w-full border-b border-pink-100/50 dark:border-pink-800/30 bg-white/80 dark:bg-gray-950/80 backdrop-blur-sm'>
      <div className='flex h-16 items-center justify-between px-4 lg:px-6'>
        {/* Left side - Sidebar trigger and Admin label */}
        <div className='flex items-center gap-4'>
          <SidebarTrigger className='h-8 w-8 rounded-lg bg-white dark:bg-gray-800 shadow-md hover:shadow-lg transition-shadow border border-pink-100 dark:border-pink-800' />
          <div className='flex items-center gap-2'>
            <h1 className='text-xl font-semibold bg-gradient-to-r from-pink-600 to-sky-600 bg-clip-text text-transparent'>
              Admin
            </h1>
            <div className='hidden sm:block w-px h-6 bg-pink-200 dark:bg-pink-700'></div>
            <span className='hidden sm:inline-block text-sm text-gray-600 dark:text-gray-400'>Dashboard</span>
          </div>
        </div>

        {/* Right side - User avatar and dark mode toggle */}
        <div className='flex items-center gap-3'>
          <ModeToggle />

          <div className='flex items-center gap-3 pl-3 border-l border-pink-100 dark:border-pink-800'>
            <div className='hidden sm:block text-right'>
              <p className='text-sm font-medium text-gray-900 dark:text-gray-100'>Admin User</p>
              <p className='text-xs text-gray-500 dark:text-gray-400'>admin@mamafit.com</p>
            </div>

            <Button variant='ghost' size='sm' className='relative h-10 w-10 rounded-full'>
              <Avatar className='h-9 w-9 border-2 border-pink-200 dark:border-pink-700'>
                <AvatarImage src='/avatars/admin.png' alt='Admin' />
                <AvatarFallback className='bg-gradient-to-br from-pink-400 to-sky-400 text-white'>
                  <User className='h-4 w-4' />
                </AvatarFallback>
              </Avatar>
            </Button>
          </div>
        </div>
      </div>
    </header>
  )
}

function RoleLayout({ role }: RoleLayoutProps) {
  return (
    <SidebarProvider defaultOpen={true}>
      <div className='min-h-screen flex w-full bg-gradient-to-br from-pink-50/30 via-white to-sky-50/30 dark:from-gray-950 dark:via-gray-900 dark:to-gray-950'>
        <AppSidebar role={role} />

        <SidebarInset className='flex flex-1 flex-col'>
          <Topbar />

          <main className='flex-1 overflow-auto'>
            <div className='container mx-auto p-4 lg:p-6 space-y-6'>
              {/* Content wrapper with subtle background */}
              <div
                className={cn(
                  'min-h-[calc(100vh-8rem)] rounded-2xl',
                  'bg-white/60 dark:bg-gray-900/60 backdrop-blur-sm',
                  'border border-white/20 dark:border-gray-800/20',
                  'shadow-xl shadow-pink-100/20 dark:shadow-pink-900/20',
                  'p-6'
                )}
              >
                <Outlet />
              </div>
            </div>
          </main>

          {/* Decorative footer */}
          <footer className='border-t border-pink-100/50 dark:border-pink-800/30 bg-white/50 dark:bg-gray-950/50 p-4'>
            <div className='flex items-center justify-center'>
              <p className='text-xs text-gray-500 dark:text-gray-400'>
                © 2024 MamaFit. Made with ❤️ for expecting mothers.
              </p>
            </div>
          </footer>
        </SidebarInset>
      </div>
    </SidebarProvider>
  )
}
export default RoleLayout
