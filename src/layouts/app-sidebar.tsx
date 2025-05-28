import {
  Sidebar,
  SidebarContent,
  SidebarHeader,
  SidebarMenu,
  SidebarMenuButton,
  SidebarMenuItem,
  useSidebar
} from '@/components/ui/sidebar'
import {
  LayoutDashboard,
  User,
  Users,
  Settings,
  ShoppingCart,
  Package,
  Palette,
  FolderOpen,
  Factory,
  Package2,
  Award
} from 'lucide-react'
import { UserRole } from '@/types/user'
import Logo from '/images/mamafit-splash-screen.png'
import { cn } from '@/lib/utils/utils'
import { Link } from 'react-router'
import { useLocation } from 'react-router-dom'
// import { sidebarData } from './data/sidebar-data'
interface SidebarProps extends React.HTMLAttributes<HTMLDivElement> {
  className?: string
  role: UserRole
}

interface SidebarItem {
  title: string
  href: string
  icon: React.ReactNode
}

const getSidebarItems = (role: UserRole): SidebarItem[] => {
  const commonItems: SidebarItem[] = [
    {
      title: 'Dashboard',
      href: `/${role.split('_')[0]}/dashboard`,
      icon: <LayoutDashboard className='h-5 w-5' />
    },
    {
      title: 'Profile',
      href: `/${role.split('_')[0]}/profile`,
      icon: <User className='h-5 w-5' />
    }
  ]

  switch (role) {
    case 'admin':
      return [
        ...commonItems,
        {
          title: 'Users',
          href: '/admin/users',
          icon: <Users className='h-5 w-5' />
        },
        {
          title: 'Settings',
          href: '/admin/settings',
          icon: <Settings className='h-5 w-5' />
        }
      ]
    case 'branch_manager':
      return [
        ...commonItems,
        {
          title: 'Cashier',
          href: '/branch/cashier',
          icon: <ShoppingCart className='h-5 w-5' />
        },
        {
          title: 'Orders',
          href: '/branch/orders',
          icon: <Package className='h-5 w-5' />
        },
        {
          title: 'Inventory',
          href: '/branch/inventory',
          icon: <Package2 className='h-5 w-5' />
        }
      ]
    case 'designer':
      return [
        ...commonItems,
        {
          title: 'Designs',
          href: '/designer/designs',
          icon: <Palette className='h-5 w-5' />
        },
        {
          title: 'Projects',
          href: '/designer/projects',
          icon: <FolderOpen className='h-5 w-5' />
        }
      ]
    case 'factory_manager':
      return [
        ...commonItems,
        {
          title: 'Production',
          href: '/factory/production',
          icon: <Factory className='h-5 w-5' />
        },
        {
          title: 'Materials',
          href: '/factory/materials',
          icon: <Package className='h-5 w-5' />
        },
        {
          title: 'Quality',
          href: '/factory/quality',
          icon: <Award className='h-5 w-5' />
        }
      ]
    default:
      return commonItems
  }
}
function MamaFitLogo({ role }: { role: UserRole }) {
  const { state } = useSidebar()
  const isCollapsed = state === 'collapsed'
  return (
    <div
      className={cn(
        'flex items-center transition-all duration-300 ease-in-out',
        isCollapsed ? 'justify-center px-2 py-5' : 'gap-4 px-6 py-8'
      )}
    >
      <div
        className={cn(
          'flex items-center justify-center rounded-2xl bg-gradient-to-br from-violet-100/80 to-violet-200/60 dark:from-violet-900/40 dark:to-violet-800/30 shadow-xl ring-1 ring-violet-200/40 dark:ring-violet-700/30 backdrop-blur-sm border border-white/20 dark:border-violet-700/20 transition-all duration-300',
          isCollapsed ? 'h-9 w-9' : 'h-12 w-12'
        )}
      >
        <img
          src={Logo}
          alt='Mamafit logo'
          className={cn('rounded-xl transition-all duration-300 object-cover', isCollapsed ? 'w-5 h-5' : 'w-10 h-10')}
        />
      </div>
      {!isCollapsed && (
        <div className='flex flex-col transition-all duration-300 ease-in-out'>
          <span className='text-lg font-bold bg-gradient-to-r from-violet-600 to-violet-800 dark:from-violet-400 dark:to-violet-300 bg-clip-text text-transparent drop-shadow-sm'>
            MamaFit
          </span>
          <span className='text-xs text-violet-600/80 dark:text-violet-400/80 font-medium capitalize drop-shadow-sm'>
            {role.replace('_', ' ')}
          </span>
        </div>
      )}
    </div>
  )
}

export function SidebarItem({ role }: { role: UserRole }) {
  const sidebarItems = getSidebarItems(role)
  const { state } = useSidebar()
  const isCollapsed = state === 'collapsed'
  const location = useLocation()

  return (
    <div className={cn('transition-all duration-300 ease-in-out', isCollapsed ? 'px-2 py-2' : 'px-4 py-2')}>
      <SidebarMenu className='space-y-1'>
        {sidebarItems.map((item) => {
          const isActive = location.pathname === item.href || location.pathname.startsWith(item.href + '/')
          return (
            <SidebarMenuItem key={item.title}>
              <SidebarMenuButton
                asChild
                tooltip={isCollapsed ? item.title : undefined}
                className={cn(
                  'group relative rounded-2xl transition-all duration-300 ease-in-out',
                  'hover:bg-gradient-to-r hover:from-violet-50 hover:to-violet-100/50 dark:hover:from-violet-950/30 dark:hover:to-violet-900/20',
                  'hover:shadow-lg hover:shadow-violet-200/20 dark:hover:shadow-violet-900/10',
                  'hover:scale-[1.02] hover:backdrop-blur-sm',
                  'border border-transparent hover:border-violet-200/30 dark:hover:border-violet-700/30',
                  isCollapsed ? 'h-10 w-10 mx-auto justify-center' : 'h-14 w-full',
                  isActive && [
                    'bg-gradient-to-r from-violet-100 to-violet-50 dark:from-violet-900/40 dark:to-violet-800/30',
                    'shadow-lg shadow-violet-200/30 dark:shadow-violet-900/20',
                    'border-violet-200/50 dark:border-violet-700/40',
                    'text-violet-700 dark:text-violet-300 font-semibold',
                    'ring-1 ring-violet-200/20 dark:ring-violet-700/20'
                  ],
                  !isActive && 'text-gray-700 dark:text-gray-300'
                )}
              >
                <Link
                  to={item.href}
                  className={cn(
                    'flex items-center w-full transition-all duration-300',
                    isCollapsed ? 'justify-center' : 'gap-4 px-4'
                  )}
                >
                  <div
                    className={cn(
                      'flex-shrink-0 transition-all duration-200',
                      isActive && 'text-violet-600 dark:text-violet-400 scale-110'
                    )}
                  >
                    {item.icon}
                  </div>
                  {!isCollapsed && (
                    <span className='font-medium text-sm tracking-wide transition-all duration-300'>{item.title}</span>
                  )}
                  {isActive && !isCollapsed && (
                    <div className='ml-auto w-2 h-2 rounded-full bg-violet-500 dark:bg-violet-400 animate-pulse' />
                  )}
                </Link>
              </SidebarMenuButton>
            </SidebarMenuItem>
          )
        })}
      </SidebarMenu>
    </div>
  )
}
function AppSidebar({ className, role }: SidebarProps) {
  const { state } = useSidebar()
  const isCollapsed = state === 'collapsed'

  return (
    <div className=''>
      <Sidebar
        variant='sidebar'
        collapsible='icon'
        style={
          {
            '--sidebar-width-icon': '5rem' //tùy chỉnh chiều rộng khi thu gọn
          } as React.CSSProperties
        }
        className={cn(
          // Frosted glass effect with backdrop blur
          'border-r border-violet-200/40 dark:border-violet-700/30',
          'bg-white/30 dark:bg-violet-950/20',
          'backdrop-blur-xl backdrop-saturate-150',
          'supports-[backdrop-filter]:bg-white/20 supports-[backdrop-filter]:dark:bg-violet-950/10',

          // Glassmorphism enhancements
          'shadow-2xl shadow-violet-200/30 dark:shadow-violet-900/40',
          'ring-1 ring-violet-200/30 dark:ring-violet-700/25',
          'ring-inset',

          // Modern rounded corners and overflow
          'rounded-2xl overflow-hidden',

          // Subtle gradient overlay for depth
          'before:absolute before:inset-0 before:bg-gradient-to-b',
          'before:from-violet-50/20 before:via-transparent before:to-violet-100/10',
          'dark:before:from-violet-900/10 dark:before:via-transparent dark:before:to-violet-800/5',
          'before:pointer-events-none before:rounded-2xl',

          // Ensure relative positioning for pseudo-elements
          'relative',

          // Smooth transitions for width changes
          'transition-all duration-300 ease-in-out',

          className
        )}
      >
        <SidebarHeader className='border-b border-violet-200/30 dark:border-violet-800/30 bg-white/60 dark:bg-gray-950/60 backdrop-blur-md rounded-t-2xl'>
          <MamaFitLogo role={role} />
        </SidebarHeader>

        <SidebarContent className={cn('transition-all duration-300 ease-in-out', isCollapsed ? 'py-4' : 'py-6')}>
          <SidebarItem role={role} />
        </SidebarContent>

        {/* Decorative elements - adjust for collapsed state */}
        <div
          className={cn(
            'absolute bottom-8 h-px bg-gradient-to-r from-transparent via-violet-300/40 dark:via-violet-600/40 to-transparent transition-all duration-300',
            isCollapsed ? 'left-3 right-3' : 'left-6 right-6'
          )}
        />
        <div className='absolute bottom-4 left-1/2 transform -translate-x-1/2'>
          <div className='flex space-x-2'>
            <div className='w-2 h-2 bg-violet-400/60 dark:bg-violet-500/60 rounded-full animate-pulse' />
            <div className='w-2 h-2 bg-violet-500/60 dark:bg-violet-400/60 rounded-full animate-pulse delay-75' />
            <div className='w-2 h-2 bg-violet-600/60 dark:bg-violet-300/60 rounded-full animate-pulse delay-150' />
          </div>
        </div>
      </Sidebar>
    </div>
  )
}
export default AppSidebar
