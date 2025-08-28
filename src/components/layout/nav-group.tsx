import { ReactNode } from 'react'
import { Link, useLocation } from 'react-router-dom'
import { ChevronRight, Circle } from 'lucide-react'
import { Collapsible, CollapsibleContent, CollapsibleTrigger } from '@/components/ui/collapsible'
import {
  SidebarGroup,
  SidebarGroupLabel,
  SidebarMenu,
  SidebarMenuButton,
  SidebarMenuItem,
  SidebarMenuSub,
  SidebarMenuSubButton,
  SidebarMenuSubItem,
  useSidebar
} from '@/components/ui/sidebar'
import { Badge } from '../ui/badge'
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuLabel,
  DropdownMenuSeparator,
  DropdownMenuTrigger
} from '../ui/dropdown-menu'
import { NavCollapsible, NavItem, NavLink, type NavGroup } from './types'
import { cn } from '@/lib/utils/utils'

export function NavGroup({ title, items }: NavGroup) {
  const { state } = useSidebar()
  const location = useLocation()
  const href = location.pathname + location.search

  return (
    <SidebarGroup className='relative'>
      {/* Enhanced group label with decorative line */}
      <div className='relative'>
        <SidebarGroupLabel className='text-xs font-semibold text-violet-600 dark:text-violet-400 uppercase tracking-wider flex items-center gap-2'>
          <span className='relative'>
            {title}
            <span className='absolute -bottom-1 left-0 right-0 h-px bg-gradient-to-r from-violet-300 to-transparent dark:from-violet-600' />
          </span>
        </SidebarGroupLabel>
      </div>

      <SidebarMenu className='mt-2'>
        {items.map((item) => {
          const key = `${item.title}-${item.url}`

          if (!item.items) return <SidebarMenuLink key={key} item={item} href={href} />

          if (state === 'collapsed') return <SidebarMenuCollapsedDropdown key={key} item={item} href={href} />

          return <SidebarMenuCollapsible key={key} item={item} href={href} />
        })}
      </SidebarMenu>
    </SidebarGroup>
  )
}

const NavBadge = ({ children }: { children: ReactNode }) => (
  <Badge className='rounded-full px-1.5 py-0 text-[10px] font-bold bg-violet-100 text-violet-700 dark:bg-violet-900/50 dark:text-violet-300 border-violet-200 dark:border-violet-800'>
    {children}
  </Badge>
)

const SidebarMenuLink = ({ item, href }: { item: NavLink; href: string }) => {
  const { setOpenMobile } = useSidebar()
  const isActive = checkIsActive(href, item)

  return (
    <SidebarMenuItem>
      <SidebarMenuButton
        asChild
        isActive={isActive}
        tooltip={item.title}
        className={cn(
          'group relative overflow-hidden transition-all duration-300',
          'hover:bg-violet-50 dark:hover:bg-violet-950/30',
          isActive && 'bg-violet-100 dark:bg-violet-950/50 text-violet-900 dark:text-violet-100 font-semibold'
        )}
      >
        <Link to={item.url} onClick={() => setOpenMobile(false)}>
          {/* Active indicator */}
          {isActive && (
            <span className='absolute left-0 top-0 bottom-0 w-1 bg-gradient-to-b from-violet-500 to-violet-600 dark:from-violet-400 dark:to-violet-500' />
          )}

          {/* Icon with animation */}
          {item.icon && (
            <item.icon
              className={cn(
                'transition-all duration-300',
                isActive
                  ? 'text-violet-600 dark:text-violet-400 scale-110'
                  : 'group-hover:text-violet-500 group-hover:scale-105'
              )}
            />
          )}

          <span className='flex-1'>{item.title}</span>

          {item.badge && <NavBadge>{item.badge}</NavBadge>}

          {/* Hover effect */}
          <span className='absolute inset-0 bg-gradient-to-r from-violet-100/0 via-violet-100/50 to-violet-100/0 dark:from-violet-900/0 dark:via-violet-900/20 dark:to-violet-900/0 translate-x-[-100%] group-hover:translate-x-[100%] transition-transform duration-700' />
        </Link>
      </SidebarMenuButton>
    </SidebarMenuItem>
  )
}

const SidebarMenuCollapsible = ({ item, href }: { item: NavCollapsible; href: string }) => {
  const { setOpenMobile } = useSidebar()
  const isActive = checkIsActive(href, item, true)

  return (
    <Collapsible asChild defaultOpen={isActive} className='group/collapsible'>
      <SidebarMenuItem>
        <CollapsibleTrigger asChild>
          <SidebarMenuButton
            tooltip={item.title}
            className={cn(
              'group relative overflow-hidden transition-all duration-300',
              'hover:bg-violet-50 dark:hover:bg-violet-950/30',
              isActive && 'bg-violet-50 dark:bg-violet-950/30 text-violet-900 dark:text-violet-100'
            )}
          >
            {/* Icon */}
            {item.icon && (
              <item.icon
                className={cn(
                  'transition-all duration-300',
                  isActive ? 'text-violet-600 dark:text-violet-400' : 'group-hover:text-violet-500'
                )}
              />
            )}

            <span className='flex-1'>{item.title}</span>

            {item.badge && <NavBadge>{item.badge}</NavBadge>}

            {/* Chevron with rotation animation */}
            <ChevronRight className='ml-auto size-4 text-violet-400 transition-transform duration-300 group-data-[state=open]/collapsible:rotate-90' />
          </SidebarMenuButton>
        </CollapsibleTrigger>

        <CollapsibleContent className='CollapsibleContent'>
          <SidebarMenuSub className='ml-3 border-l-2 border-violet-100 dark:border-violet-900/50'>
            {item.items
              .filter((subItem) => !subItem.disabled)
              .map((subItem) => {
                if (!('url' in subItem) || !subItem.url) {
                  return null
                }
                const isSubActive = checkIsActive(href, subItem)
                return (
                  <SidebarMenuSubItem key={subItem.title}>
                    <SidebarMenuSubButton
                      asChild
                      isActive={isSubActive}
                      className={cn(
                        'relative pl-6 transition-all duration-300',
                        'hover:bg-violet-50 dark:hover:bg-violet-950/30',
                        isSubActive &&
                          'bg-violet-100 dark:bg-violet-950/50 text-violet-900 dark:text-violet-100 font-semibold'
                      )}
                    >
                      <Link to={subItem.url} onClick={() => setOpenMobile(false)}>
                        {/* Active dot indicator */}
                        <Circle
                          className={cn(
                            'absolute left-[-7px] size-2.5 transition-all duration-300',
                            isSubActive ? 'fill-violet-500 text-violet-500' : 'text-violet-200 dark:text-violet-800'
                          )}
                        />

                        {subItem.icon && <subItem.icon className='size-4' />}
                        <span>{subItem.title}</span>
                        {subItem.badge && <NavBadge>{subItem.badge}</NavBadge>}
                      </Link>
                    </SidebarMenuSubButton>
                  </SidebarMenuSubItem>
                )
              })}
          </SidebarMenuSub>
        </CollapsibleContent>
      </SidebarMenuItem>
    </Collapsible>
  )
}

const SidebarMenuCollapsedDropdown = ({ item, href }: { item: NavCollapsible; href: string }) => {
  const isActive = checkIsActive(href, item, true)

  return (
    <SidebarMenuItem>
      <DropdownMenu>
        <DropdownMenuTrigger asChild>
          <SidebarMenuButton
            tooltip={item.title}
            isActive={isActive}
            className={cn(
              'transition-all duration-300',
              'hover:bg-violet-50 dark:hover:bg-violet-950/30',
              isActive && 'bg-violet-100 dark:bg-violet-950/50 text-violet-900 dark:text-violet-100'
            )}
          >
            {item.icon && <item.icon />}
          </SidebarMenuButton>
        </DropdownMenuTrigger>

        <DropdownMenuContent
          side='right'
          align='start'
          sideOffset={8}
          className='w-56 border-violet-200 dark:border-violet-800'
        >
          <DropdownMenuLabel className='text-violet-600 dark:text-violet-400'>{item.title}</DropdownMenuLabel>
          <DropdownMenuSeparator className='bg-violet-100 dark:bg-violet-900' />

          {item.items
            .filter((sub) => !sub.disabled)
            .map((sub) => {
              if (!('url' in sub) || !sub.url) {
                return null
              }

              return (
                <DropdownMenuItem
                  key={`${sub.title}-${sub.url}`}
                  asChild
                  className={cn(
                    'cursor-pointer transition-colors',
                    checkIsActive(href, sub) &&
                      'bg-violet-100 dark:bg-violet-900/50 text-violet-900 dark:text-violet-100'
                  )}
                >
                  <Link to={sub.url} className='flex items-center gap-2'>
                    {sub.icon && <sub.icon className='size-4' />}
                    <span className='flex-1'>{sub.title}</span>
                    {sub.badge && (
                      <span className='text-xs font-bold text-violet-600 dark:text-violet-400'>{sub.badge}</span>
                    )}
                  </Link>
                </DropdownMenuItem>
              )
            })}
        </DropdownMenuContent>
      </DropdownMenu>
    </SidebarMenuItem>
  )
}

function checkIsActive(href: string, item: NavItem, mainNav = false) {
  return (
    href === item.url ||
    href.split('?')[0] === item.url ||
    !!item?.items?.filter((i) => i.url === href).length ||
    (mainNav && href.split('/')[1] !== '' && href.split('/')[1] === item?.url?.split('/')[1])
  )
}
