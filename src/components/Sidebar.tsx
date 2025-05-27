import { cn } from '@/lib/utils/utils'
import { Button } from '@/components/ui/button'
import { ScrollArea } from '@/components/ui/scroll-area'
import { Sheet, SheetContent, SheetTrigger } from '@/components/ui/sheet'
import {
  Menu,
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
  Award,
  ChevronLeft,
  ChevronRight
} from 'lucide-react'
import { Link, useLocation } from 'react-router-dom'
import { useState } from 'react'
import { UserRole } from '@/types/user'
import Logo from '/images/mamafit-splash-screen.png'

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
          title: 'POS',
          href: '/branch/pos',
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

export function Sidebar({ className, role }: SidebarProps) {
  const [open, setOpen] = useState(false)
  const [isCollapsed, setIsCollapsed] = useState(false)
  const location = useLocation()
  const sidebarItems = getSidebarItems(role)

  return (
    <>
      {/* Mobile Sidebar */}
      <Sheet open={open} onOpenChange={setOpen}>
        <SheetTrigger asChild>
          <Button
            variant='ghost'
            className='mr-2 px-0 text-base hover:bg-transparent focus-visible:bg-transparent focus-visible:ring-0 focus-visible:ring-offset-0 lg:hidden'
          >
            <Menu className='h-6 w-6' />
            <span className='sr-only'>Toggle Menu</span>
          </Button>
        </SheetTrigger>
        <SheetContent side='left' className='pl-1 pr-0 bg-gradient-to-br from-violet-50 to-purple-50'>
          <div className='px-7'>
            <Link to='/' className='flex items-center gap-3' onClick={() => setOpen(false)}>
              <div className='flex h-10 w-10 items-center justify-center rounded-xl bg-white shadow-sm'>
                <img src={Logo} alt='MamaFit logo' className='w-8 h-8 rounded-lg' />
              </div>
              <span className='font-bold text-violet-700 text-lg'>MamaFit</span>
            </Link>
          </div>
          <ScrollArea className='my-4 h-[calc(100vh-8rem)] pb-10'>
            <div className='flex flex-col space-y-2 px-3'>
              {sidebarItems.map((item) => (
                <Link
                  key={item.href}
                  to={item.href}
                  onClick={() => setOpen(false)}
                  className={cn(
                    'flex items-center rounded-xl px-4 py-3 text-sm font-medium transition-all hover:bg-white/60 hover:shadow-sm',
                    location.pathname === item.href
                      ? 'bg-white text-violet-700 shadow-sm border border-violet-100'
                      : 'text-violet-600'
                  )}
                >
                  {item.icon}
                  <span className='ml-3'>{item.title}</span>
                </Link>
              ))}
            </div>
          </ScrollArea>
        </SheetContent>
      </Sheet>

      {/* Desktop Sidebar */}
      <div
        className={cn(
          'hidden lg:block transition-all duration-300 bg-gradient-to-br from-violet-50 to-purple-50 border-r border-violet-100 rounded-r-3xl shadow-sm',
          isCollapsed ? 'w-20' : 'w-64',
          className
        )}
      >
        <div className='flex h-full flex-col'>
          {/* Header with Logo */}
          <div className='flex h-20 items-center justify-between px-6 border-b border-violet-100'>
            <Link to='/' className='flex items-center gap-3'>
              <div className='flex h-10 w-10 items-center justify-center rounded-xl bg-white shadow-sm'>
                <img src={Logo} alt='MamaFit logo' className='w-8 h-8 rounded-lg' />
              </div>
              {!isCollapsed && <span className='font-bold text-violet-700 text-lg'>MamaFit</span>}
            </Link>
            <Button
              variant='ghost'
              size='icon'
              onClick={() => setIsCollapsed(!isCollapsed)}
              className='h-8 w-8 text-violet-600 hover:bg-white/60 hover:text-violet-700 rounded-lg'
            >
              {isCollapsed ? <ChevronRight className='h-4 w-4' /> : <ChevronLeft className='h-4 w-4' />}
            </Button>
          </div>

          {/* Navigation Items */}
          <ScrollArea className='flex-1 px-4 py-6'>
            <div className='space-y-2'>
              {sidebarItems.map((item) => (
                <Link
                  key={item.href}
                  to={item.href}
                  className={cn(
                    'flex items-center rounded-xl px-4 py-3 text-sm font-medium transition-all hover:bg-white/60 hover:shadow-sm group relative',
                    location.pathname === item.href
                      ? 'bg-white text-violet-700 shadow-sm border border-violet-100'
                      : 'text-violet-600'
                  )}
                >
                  <div className='flex items-center justify-center w-5 h-5'>{item.icon}</div>
                  {!isCollapsed && <span className='ml-3 transition-opacity duration-300'>{item.title}</span>}
                  {isCollapsed && (
                    <div className='absolute left-16 bg-violet-900 text-white px-2 py-1 rounded-md text-xs opacity-0 group-hover:opacity-100 transition-opacity duration-300 pointer-events-none whitespace-nowrap z-50'>
                      {item.title}
                    </div>
                  )}
                </Link>
              ))}
            </div>
          </ScrollArea>
        </div>
      </div>
    </>
  )
}
