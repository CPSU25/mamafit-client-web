import React from 'react'
import { cn } from '@/lib/utils/utils'
import { Separator } from '@/components/ui/separator'
import { SidebarTrigger } from '@/components/ui/sidebar'
import { useLocation } from 'react-router-dom'
import { sidebarData } from './data/sidebar-data'
import { useAuth } from '@/context/auth-context'
import { Bell, Settings, Menu, Package2 } from 'lucide-react'
import { Button } from '@/components/ui/button'
import { DropdownMenu, DropdownMenuContent, DropdownMenuItem, DropdownMenuTrigger } from '@/components/ui/dropdown-menu'
import { Badge } from '@/components/ui/badge'
import { ModeToggle } from '../mode-toggle'

interface HeaderProps extends React.HTMLAttributes<HTMLElement> {
  fixed?: boolean
  title?: string
  subtitle?: string
  ref?: React.Ref<HTMLElement>
}

export const Header = ({ className, fixed, title, subtitle, children, ...props }: HeaderProps) => {
  const [offset, setOffset] = React.useState(0)
  const location = useLocation()
  const { userPermission } = useAuth()

  React.useEffect(() => {
    const onScroll = () => {
      setOffset(document.body.scrollTop || document.documentElement.scrollTop)
    }

    document.addEventListener('scroll', onScroll, { passive: true })
    return () => document.removeEventListener('scroll', onScroll)
  }, [])

  // Find active navigation item based on current path and user role
  const getActiveNavItem = () => {
    if (!userPermission?.roleName) return null

    const currentRole = sidebarData.role.find((role) => role.name === userPermission.roleName)
    if (!currentRole) return null

    const currentPath = location.pathname
    const pathSegments = currentPath.split('/').filter(Boolean)
    // Xử lý cho nested routes như /system/admin/manage-order/design-request
    const relevantPath = pathSegments.slice(2).join('/') || 'dashboard' // Bỏ qua /system/admin

    // Tìm exact match trước
    for (const navGroup of currentRole.navGroups) {
      for (const navItem of navGroup.items) {
        if (navItem.url === relevantPath) {
          return {
            title: navItem.title,
            groupTitle: navGroup.title,
            icon: navItem.icon
          }
        }

        if ('items' in navItem && navItem.items) {
          for (const subItem of navItem.items) {
            if (subItem.url === relevantPath) {
              return {
                title: subItem.title,
                groupTitle: navGroup.title,
                parentTitle: navItem.title,
                icon: subItem.icon || navItem.icon
              }
            }
          }
        }
      }
    }

    // Nếu không tìm thấy exact match, kiểm tra xem có phải là dynamic route không
    // Ví dụ: manage-order/123 -> hiển thị "Chi tiết đơn hàng"
    const basePath = relevantPath.split('/')[0]

    // Xử lý đặc biệt cho manage-order/:orderId
    if (basePath === 'manage-order' && relevantPath.split('/').length > 1) {
      // Đây là route chi tiết đơn hàng
      return {
        title: 'Chi tiết đơn hàng',
        groupTitle: 'Quản lý hệ thống',
        parentTitle: 'Quản lý đơn hàng',
        icon: Package2 // Sử dụng icon từ parent route
      }
    }

    // Tìm parent route cho các trường hợp khác
    for (const navGroup of currentRole.navGroups) {
      for (const navItem of navGroup.items) {
        if (navItem.url === basePath) {
          return {
            title: navItem.title,
            groupTitle: navGroup.title,
            icon: navItem.icon
          }
        }

        if ('items' in navItem && navItem.items) {
          for (const subItem of navItem.items) {
            if (subItem.url === basePath) {
              return {
                title: subItem.title,
                groupTitle: navGroup.title,
                parentTitle: navItem.title,
                icon: subItem.icon || navItem.icon
              }
            }
          }
        }
      }
    }

    return {
      title: 'Dashboard',
      groupTitle: currentRole.navGroups[0]?.title || 'Main'
    }
  }

  const getPageTitle = () => {
    if (title) return title
    const activeNavItem = getActiveNavItem()
    return activeNavItem?.title || 'Dashboard'
  }

  const getPageSubtitle = () => {
    if (subtitle) return subtitle
    const activeNavItem = getActiveNavItem()
    if (!activeNavItem) return 'Chào mừng đến với MamaFit'

    const { groupTitle, parentTitle } = activeNavItem
    if (parentTitle) {
      return `${groupTitle} • ${parentTitle}`
    }
    return groupTitle
  }

  const PageIcon = getActiveNavItem()?.icon

  return (
    <header
      className={cn(
        'flex h-16 items-center justify-between px-4 lg:px-6 py-3',
        'bg-background/95 backdrop-blur supports-[backdrop-filter]:bg-background/60',
        'border-b border-violet-100 dark:border-violet-900/20',
        fixed && 'header-fixed peer/header fixed z-40 w-[inherit]',
        offset > 10 && fixed ? 'shadow-lg shadow-violet-100/50 dark:shadow-violet-900/20' : 'shadow-none',
        className
      )}
      {...props}
    >
      {/* Left section - Navigation & Page Info */}
      <div className='flex items-center gap-3 lg:gap-4 flex-1'>
        <div className='flex items-center gap-2 lg:gap-3'>
          <SidebarTrigger
            variant='ghost'
            className={cn(
              'h-9 w-9',
              'hover:bg-violet-100 dark:hover:bg-violet-900/30',
              'hover:text-violet-600 dark:hover:text-violet-400',
              'transition-all duration-200'
            )}
          >
            <Menu className='h-5 w-5' />
          </SidebarTrigger>

          <Separator orientation='vertical' className='h-6 bg-violet-200 dark:bg-violet-800 hidden lg:block' />
        </div>

        {/* Page info with icon */}
        <div className='flex items-center gap-3 flex-1'>
          {PageIcon && (
            <div className='hidden lg:flex h-10 w-10 items-center justify-center rounded-lg bg-violet-100 dark:bg-violet-900/30'>
              <PageIcon className='h-5 w-5 text-violet-600 dark:text-violet-400' />
            </div>
          )}

          <div className='flex flex-col'>
            <h1 className='text-base lg:text-lg font-bold text-foreground leading-none'>{getPageTitle()}</h1>
            <p className='text-xs text-muted-foreground mt-0.5 hidden sm:block'>{getPageSubtitle()}</p>
          </div>
        </div>
      </div>

      {/* Right section - Actions */}
      <div className='flex items-center gap-2 lg:gap-3'>
        {/* Notifications */}
        <DropdownMenu>
          <DropdownMenuTrigger asChild>
            <Button
              variant='ghost'
              size='icon'
              className='relative h-9 w-9 hover:bg-violet-100 dark:hover:bg-violet-900/30'
            >
              <Bell className='h-5 w-5' />
              <span className='absolute top-1 right-1'>
                <span className='relative flex h-2 w-2'>
                  <span className='animate-ping absolute inline-flex h-full w-full rounded-full bg-red-400 opacity-75' />
                  <span className='relative inline-flex rounded-full h-2 w-2 bg-red-500' />
                </span>
              </span>
            </Button>
          </DropdownMenuTrigger>
          <DropdownMenuContent align='end' className='w-80'>
            <div className='flex items-center justify-between p-3 border-b'>
              <h3 className='font-semibold'>Thông báo</h3>
              <Badge
                variant='secondary'
                className='bg-violet-100 text-violet-700 dark:bg-violet-900/50 dark:text-violet-300'
              >
                3 mới
              </Badge>
            </div>
            <div className='max-h-96 overflow-y-auto'>
              <DropdownMenuItem className='p-3 cursor-pointer'>
                <div className='flex flex-col gap-1'>
                  <p className='text-sm font-medium'>Đơn hàng mới #1234</p>
                  <p className='text-xs text-muted-foreground'>Khách hàng vừa đặt váy bầu tùy chỉnh</p>
                  <p className='text-xs text-violet-600 dark:text-violet-400'>5 phút trước</p>
                </div>
              </DropdownMenuItem>
              <DropdownMenuItem className='p-3 cursor-pointer'>
                <div className='flex flex-col gap-1'>
                  <p className='text-sm font-medium'>Lịch hẹn sắp tới</p>
                  <p className='text-xs text-muted-foreground'>Bạn có lịch đo tại chi nhánh Q1 lúc 14:00</p>
                  <p className='text-xs text-violet-600 dark:text-violet-400'>30 phút trước</p>
                </div>
              </DropdownMenuItem>
              <DropdownMenuItem className='p-3 cursor-pointer'>
                <div className='flex flex-col gap-1'>
                  <p className='text-sm font-medium'>Thiết kế được duyệt</p>
                  <p className='text-xs text-muted-foreground'>Thiết kế váy #789 đã được khách hàng chấp nhận</p>
                  <p className='text-xs text-violet-600 dark:text-violet-400'>1 giờ trước</p>
                </div>
              </DropdownMenuItem>
            </div>
            <div className='p-2 border-t'>
              <Button
                variant='ghost'
                className='w-full justify-center text-violet-600 dark:text-violet-400 hover:bg-violet-50 dark:hover:bg-violet-950/30'
              >
                Xem tất cả thông báo
              </Button>
            </div>
          </DropdownMenuContent>
        </DropdownMenu>

        {/* Quick settings */}
        <Button variant='ghost' size='icon' className='h-9 w-9 hover:bg-violet-100 dark:hover:bg-violet-900/30'>
          <Settings className='h-5 w-5' />
        </Button>
        <ModeToggle />

        {/* Custom children */}
        {children}
      </div>
    </header>
  )
}

Header.displayName = 'Header'
