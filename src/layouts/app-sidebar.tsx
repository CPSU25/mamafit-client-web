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
    <div className='flex items-center gap-3 px-4 py-6'>
      <div className='flex h-14 w-14 items-center justify-center rounded-full bg-white shadow-md '>
        <img src={Logo} alt='Mamafit logo' className='w-full h-full' />
      </div>
      {!isCollapsed && (
        <div className='flex flex-col'>
          <span className='text-lg font-bold bg-gradient-to-r from-pink-600 to-purple-600 bg-clip-text text-transparent'>
            MamaFit
          </span>
          <span className='text-xs text-gray-500 dark:text-gray-400'>{role}</span>
        </div>
      )}
    </div>
  )
}
function SidebarItem({ role }: { role: UserRole }) {
  const sidebarItems = getSidebarItems(role)
  const { state } = useSidebar()
  const isCollapsed = state === 'collapsed'
  return (
    <div className='px-3 py-2'>
      <SidebarMenu className='space-y-2'>
        {sidebarItems.map((item) => {
          const isActive = window.location.pathname === item.href
          return (
            <SidebarMenuItem key={item.title}>
              <SidebarMenuButton
                asChild
                tooltip={isCollapsed ? item.title : undefined}
                className={cn(
                  'group relative h-12 rounded-xl transition-all duration-200',
                  'hover:bg-gradient-to-r hover:from-pink-50 hover:to-sky-50 dark:hover:from-pink-950/20 dark:hover:to-sky-950/20',
                  'hover:shadow-md hover:scale-[1.02]',
                  isActive && [
                    'bg-gradient-to-r from-pink-100 to-sky-100 dark:from-pink-900/30 dark:to-sky-900/30',
                    'shadow-lg border border-pink-200/50 dark:border-pink-700/50',
                    'text-pink-700 dark:text-pink-300 font-medium'
                  ]
                )}
              >
                <a href={item.href} className='flex items-center gap-3 w-full'>
                  <div className='flex-shrink-0'>{item.icon}</div>
                  {!isCollapsed && <span className='font-medium'>{item.title}</span>}
                </a>
              </SidebarMenuButton>
            </SidebarMenuItem>
          )
        })}
      </SidebarMenu>
    </div>
  )
}
function AppSidebar({ className, role }: SidebarProps) {
  return (
    <Sidebar
      variant='sidebar'
      className={cn(
      'border-r border-pink-200 dark:border-pink-800/30',
      'bg-gradient-to-b from-white via-pink-50/30 to-sky-50/30',
      'dark:from-gray-950 dark:via-pink-950/10 dark:to-sky-950/10',
      'rounded-2xl', // Added rounded corners
      className
      )}
    >
      <SidebarHeader className='border-b border-pink-100/50 dark:border-pink-800/30 bg-white/50 dark:bg-gray-950/50'>
        <MamaFitLogo role={role} />
      </SidebarHeader>

      <SidebarContent className='py-4'>
        <SidebarItem role={role} />
      </SidebarContent>

      {/* Decorative elements */}
      <div className='absolute bottom-4 left-4 right-4 h-px bg-gradient-to-r from-transparent via-pink-200 dark:via-pink-700 to-transparent opacity-50' />
      <div className='absolute bottom-2 left-1/2 transform -translate-x-1/2'>
        <div className='flex space-x-1'>
          <div className='w-1 h-1 bg-pink-300 dark:bg-pink-600 rounded-full opacity-60'></div>
          <div className='w-1 h-1 bg-sky-300 dark:bg-sky-600 rounded-full opacity-60'></div>
          <div className='w-1 h-1 bg-purple-300 dark:bg-purple-600 rounded-full opacity-60'></div>
        </div>
      </div>
    </Sidebar>
  )
}
export default AppSidebar
