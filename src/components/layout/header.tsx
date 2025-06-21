import React from 'react'
import { cn } from '@/lib/utils/utils'
import { Separator } from '@/components/ui/separator'
import { SidebarTrigger } from '@/components/ui/sidebar'
import { useLocation } from 'react-router-dom'
import { sidebarData } from './data/sidebar-data'
import { usePermission } from '@/services/auth/permission.service'

interface HeaderProps extends React.HTMLAttributes<HTMLElement> {
  fixed?: boolean
  title?: string
  subtitle?: string
  ref?: React.Ref<HTMLElement>
}

export const Header = ({ className, fixed, title, subtitle, children, ...props }: HeaderProps) => {
  const [offset, setOffset] = React.useState(0)
  const location = useLocation()
  const { userInfo } = usePermission()

  React.useEffect(() => {
    const onScroll = () => {
      setOffset(document.body.scrollTop || document.documentElement.scrollTop)
    }

    // Add scroll listener to the body
    document.addEventListener('scroll', onScroll, { passive: true })

    // Clean up the event listener on unmount
    return () => document.removeEventListener('scroll', onScroll)
  }, [])

  // Find active navigation item based on current path and user role
  const getActiveNavItem = () => {
    if (!userInfo?.role) return null

    const currentRole = sidebarData.role.find((role) => role.name === userInfo.role)
    if (!currentRole) return null

    const currentPath = location.pathname

    // Extract the last segment of the path for matching
    const pathSegments = currentPath.split('/').filter(Boolean)
    const lastSegment = pathSegments[pathSegments.length - 1] || 'dashboard'

    // Search through all nav groups and items
    for (const navGroup of currentRole.navGroups) {
      for (const navItem of navGroup.items) {
        // Direct URL match
        if (navItem.url === lastSegment) {
          return {
            title: navItem.title,
            groupTitle: navGroup.title
          }
        }

        // Check if it's a collapsible item with sub-items
        if ('items' in navItem && navItem.items) {
          for (const subItem of navItem.items) {
            if (subItem.url === lastSegment) {
              return {
                title: subItem.title,
                groupTitle: navGroup.title,
                parentTitle: navItem.title
              }
            }
          }
        }
      }
    }

    // Fallback to Dashboard if no match found
    return {
      title: 'Dashboard',
      groupTitle: currentRole.navGroups[0]?.title || 'Main'
    }
  }

  // Get page title based on navigation or custom prop
  const getPageTitle = () => {
    if (title) return title

    const activeNavItem = getActiveNavItem()
    return activeNavItem?.title || 'Dashboard'
  }

  // Get page subtitle based on navigation context or custom prop
  const getPageSubtitle = () => {
    if (subtitle) return subtitle

    const activeNavItem = getActiveNavItem()
    if (!activeNavItem) return 'Welcome to MamaFit'

    // Create contextual subtitle based on navigation structure
    const { groupTitle, parentTitle } = activeNavItem

    if (parentTitle) {
      return `${groupTitle} • ${parentTitle}`
    }

    return groupTitle
  }

  return (
    <header
      className={cn(
        'flex h-16 items-center justify-between px-6 py-3',
        'bg-gradient-to-r from-background via-background to-muted/20',
        'border-b border-border/50',
        fixed && 'header-fixed peer/header fixed z-50 w-[inherit] rounded-md',
        offset > 10 && fixed ? 'shadow-lg backdrop-blur-md bg-background/95' : 'shadow-none',
        className
      )}
      {...props}
    >
      {/* Left section - Navigation & Page Info */}
      <div className='flex items-center gap-4'>
        <div className='flex items-center gap-3'>
          <SidebarTrigger
            variant='outline'
            className='h-9 w-9 hover:bg-primary/10 hover:border-primary/30 transition-colors'
          />
          <Separator orientation='vertical' className='h-6 bg-border/60' />
        </div>

        <div className='flex flex-col'>
          <h1 className='text-lg font-semibold text-foreground leading-none'>{getPageTitle()}</h1>
          <p className='text-xs text-muted-foreground mt-0.5 hidden sm:block'>{getPageSubtitle()}</p>
        </div>
      </div>

      {/* Right section - Search, ModeToggle, Profile */}
      <div className='flex items-center gap-3'>{children}</div>
    </header>
  )
}

Header.displayName = 'Header'
