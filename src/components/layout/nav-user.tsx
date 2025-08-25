import { Link } from 'react-router-dom'
import {
  Bell,
  ChevronsUpDown,
  // CreditCard,
  LogOut,
  // Sparkles,
  // User,
  Heart
  // Settings,
  // HelpCircle,
  // Moon,
  // Sun
} from 'lucide-react'
import { Avatar, AvatarFallback, AvatarImage } from '@/components/ui/avatar'
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuGroup,
  DropdownMenuItem,
  DropdownMenuLabel,
  DropdownMenuSeparator,
  DropdownMenuTrigger
} from '@/components/ui/dropdown-menu'
import { SidebarMenu, SidebarMenuButton, SidebarMenuItem, useSidebar } from '@/components/ui/sidebar'
import { useLogout } from '@/services/auth/logout.service'
import { cn } from '@/lib/utils/utils'

export function NavUser({ user }: { user: { username: string; email: string; avatar: string; role: string } | null }) {
  const { isMobile, state } = useSidebar()
  const isCollapsed = state === 'collapsed'
  const { logoutMutation, isPending } = useLogout()

  // Logic handleLogout và getRoleDisplay của bạn được giữ nguyên
  const handleLogout = () => {
    try {
      const authStorage = localStorage.getItem('auth-storage')
      if (authStorage) {
        const parsedStorage = JSON.parse(authStorage)
        const refreshToken = parsedStorage.state.refreshToken
        if (refreshToken) logoutMutation.mutate({ refreshToken })
      }
    } catch (error) {
      console.error('Failed to get refreshToken from localStorage:', error)
    }
  }
  const getRoleDisplay = (role: string) => {
    const roleConfig = {
      Admin: { name: 'Quản trị viên', color: 'bg-red-500' },
      BranchManager: { name: 'Quản lý chi nhánh', color: 'bg-blue-500' },
      Designer: { name: 'Nhà thiết kế', color: 'bg-purple-500' },
      Manager: { name: 'Quản lý sản xuất', color: 'bg-green-500' },
      Staff: { name: 'Nhân viên', color: 'bg-yellow-500' },
      Customer: { name: 'Khách hàng', color: 'bg-violet-500' }
    }
    return roleConfig[role as keyof typeof roleConfig] || { name: role, color: 'bg-gray-500' }
  }
  const roleDisplay = user ? getRoleDisplay(user.role) : null

  return (
    <SidebarMenu>
      <SidebarMenuItem>
        <DropdownMenu>
          <DropdownMenuTrigger asChild>
            <SidebarMenuButton
              // Bỏ size='lg' để đồng bộ kích thước
              tooltip={isCollapsed ? user?.username : undefined}
              className={cn(
                'group relative overflow-hidden transition-all duration-300',
                'hover:bg-violet-50 dark:hover:bg-violet-950/30',
                'data-[state=open]:bg-violet-50 dark:data-[state=open]:bg-violet-950/30'
              )}
            >
              {/* Avatar with online indicator */}
              <div className='relative'>
                <Avatar className='h-9 w-9 rounded-xl ring-2 ring-violet-200 dark:ring-violet-800 transition-all group-hover:ring-violet-300 dark:group-hover:ring-violet-700'>
                  <AvatarImage src={user?.avatar} alt={user?.username} />
                  <AvatarFallback className='rounded-xl bg-gradient-to-br from-violet-400 to-violet-600 text-white font-bold'>
                    {user?.username?.[0]?.toUpperCase() || 'U'}
                  </AvatarFallback>
                </Avatar>
                <span className='absolute bottom-0 right-0 h-3 w-3 rounded-full bg-green-500 border-2 border-white dark:border-gray-900' />
              </div>

              {/* User info - Ẩn khi thu gọn */}
              {!isCollapsed && (
                <div className='grid flex-1 text-left text-sm leading-tight'>
                  <span className='truncate font-semibold text-foreground'>{user?.username}</span>
                  <div className='flex items-center gap-1.5'>
                    <span className='truncate text-xs text-muted-foreground'>{user?.email}</span>
                  </div>
                </div>
              )}

              {/* Chevron - Ẩn khi thu gọn */}
              {!isCollapsed && (
                <ChevronsUpDown className='ml-auto size-4 text-violet-400 transition-transform group-hover:rotate-180 duration-300' />
              )}
            </SidebarMenuButton>
          </DropdownMenuTrigger>
          {/* DropdownMenuContent giữ nguyên */}
          <DropdownMenuContent
            className='w-[--radix-dropdown-menu-trigger-width] min-w-64 rounded-xl border-violet-200 dark:border-violet-800'
            side={isMobile ? 'bottom' : 'right'}
            align='end'
            sideOffset={8}
          >
            {/* User header in dropdown */}
            <DropdownMenuLabel className='p-0 font-normal'>
              <div className='flex items-center gap-3 px-3 py-3 bg-gradient-to-r from-violet-50 to-violet-100/50 dark:from-violet-950/50 dark:to-violet-900/30 rounded-t-xl'>
                <Avatar className='h-12 w-12 rounded-xl ring-2 ring-violet-300 dark:ring-violet-700'>
                  <AvatarImage src={user?.avatar} alt={user?.username} />
                  <AvatarFallback className='rounded-xl bg-gradient-to-br from-violet-400 to-violet-600 text-white font-bold text-lg'>
                    {user?.username?.[0]?.toUpperCase() || 'U'}
                  </AvatarFallback>
                </Avatar>
                <div className='grid flex-1'>
                  <span className='truncate font-bold text-base'>{user?.username}</span>
                  <span className='truncate text-xs text-muted-foreground'>{user?.email}</span>
                  {roleDisplay && (
                    <div className='flex items-center gap-1 mt-1'>
                      <span className={cn('h-2 w-2 rounded-full', roleDisplay.color)} />
                      <span className='text-xs font-medium text-violet-600 dark:text-violet-400'>
                        {roleDisplay.name}
                      </span>
                    </div>
                  )}
                </div>
              </div>
            </DropdownMenuLabel>
            <DropdownMenuSeparator className='bg-violet-100 dark:bg-violet-900' />
            {/* <DropdownMenuGroup>
              <DropdownMenuItem className='cursor-pointer group/item'>
                <div className='flex items-center gap-2 w-full'>
                  <Sparkles className='size-4 text-yellow-500 group-hover/item:animate-pulse' />
                  <span className='flex-1'>Nâng cấp Premium</span>
                  <span className='text-xs bg-gradient-to-r from-yellow-400 to-yellow-600 text-white px-2 py-0.5 rounded-full font-bold'>
                    PRO
                  </span>
                </div>
              </DropdownMenuItem>
            </DropdownMenuGroup> */}
            <DropdownMenuSeparator className='bg-violet-100 dark:bg-violet-900' />
            <DropdownMenuGroup>
              {/* <DropdownMenuItem asChild className='cursor-pointer'>
                <Link to='/settings/account' className='flex items-center gap-2'>
                  <User className='size-4' />
                  <span>Thông tin cá nhân</span>
                </Link>
              </DropdownMenuItem> */}
              <DropdownMenuItem asChild className='cursor-pointer'>
                <Link to='/settings/preferences' className='flex items-center gap-2'>
                  <Heart className='size-4' />
                  <span>Tùy chỉnh</span>
                </Link>
              </DropdownMenuItem>
              {/* <DropdownMenuItem asChild className='cursor-pointer'>
                <Link to='/settings/billing' className='flex items-center gap-2'>
                  <CreditCard className='size-4' />
                  <span>Thanh toán</span>
                </Link>
              </DropdownMenuItem> */}
              <DropdownMenuItem asChild className='cursor-pointer'>
                <Link to='/settings/notifications' className='flex items-center gap-2'>
                  <Bell className='size-4' />
                  <span>Thông báo</span>
                  <span className='ml-auto text-xs bg-red-500 text-white size-5 rounded-full flex items-center justify-center font-bold'>
                    3
                  </span>
                </Link>
              </DropdownMenuItem>
            </DropdownMenuGroup>
            <DropdownMenuSeparator className='bg-violet-100 dark:bg-violet-900' />
            {/* <DropdownMenuGroup>
              <DropdownMenuItem asChild className='cursor-pointer'>
                <Link to='/settings' className='flex items-center gap-2'>
                  <Settings className='size-4' />
                  <span>Cài đặt</span>
                </Link>
              </DropdownMenuItem>
              <DropdownMenuItem
                className='cursor-pointer'
                onClick={() => setTheme(theme === 'dark' ? 'light' : 'dark')}
              >
                {theme === 'dark' ? (
                  <>
                    <Sun className='size-4' />
                    <span>Chế độ sáng</span>
                  </>
                ) : (
                  <>
                    <Moon className='size-4' />
                    <span>Chế độ tối</span>
                  </>
                )}
              </DropdownMenuItem>
              <DropdownMenuItem asChild className='cursor-pointer'>
                <Link to='/help' className='flex items-center gap-2'>
                  <HelpCircle className='size-4' />
                  <span>Trợ giúp</span>
                </Link>
              </DropdownMenuItem>
            </DropdownMenuGroup> */}
            <DropdownMenuSeparator className='bg-violet-100 dark:bg-violet-900' />
            <DropdownMenuItem
              onClick={handleLogout}
              disabled={isPending}
              className='cursor-pointer text-red-600 dark:text-red-400 hover:bg-red-50 dark:hover:bg-red-950/30 focus:bg-red-50 dark:focus:bg-red-950/30'
            >
              {isPending ? (
                <>
                  <div className='size-4 animate-spin rounded-full border-2 border-red-500 border-t-transparent' />
                  <span>Đang đăng xuất...</span>
                </>
              ) : (
                <>
                  <LogOut className='size-4' />
                  <span>Đăng xuất</span>
                </>
              )}
            </DropdownMenuItem>
          </DropdownMenuContent>
        </DropdownMenu>
      </SidebarMenuItem>
    </SidebarMenu>
  )
}
