import React from 'react'
import { useNavigate } from 'react-router-dom'
import { ArrowRight, ChevronRight, Laptop, Moon, Sun } from 'lucide-react'
import { useSearch } from '@/context/search-context'
import { useTheme } from '@/components/providers/theme.provider'
import {
  CommandDialog,
  CommandEmpty,
  CommandGroup,
  CommandInput,
  CommandItem,
  CommandList,
  CommandSeparator
} from '@/components/ui/command'
import { sidebarData } from '@/components/layout/data/sidebar-data'
import { ScrollArea } from './ui/scroll-area'
import { usePermission } from '@/services/auth/permission.service'

export function CommandMenu() {
  const navigate = useNavigate()
  const { setTheme } = useTheme()
  const { open, setOpen } = useSearch()
  const { userInfo } = usePermission()

  // Get current user role, fallback to 'Admin' if not available
  const currentUserRole = userInfo?.role || 'Admin'

  const runCommand = React.useCallback(
    (command: () => unknown) => {
      setOpen(false)
      command()
    },
    [setOpen]
  )

  // Find the current role's nav groups
  const currentRoleData = sidebarData.role.find((role) => role.name === currentUserRole)

  return (
    <CommandDialog modal open={open} onOpenChange={setOpen}>
      <CommandInput placeholder='Type a command or search...' />
      <CommandList>
        <ScrollArea type='hover' className='h-72 pr-1'>
          <CommandEmpty>No results found.</CommandEmpty>
          {currentRoleData?.navGroups.map((group, groupIndex) => (
            <CommandGroup key={`${currentUserRole}-group-${group.title}-${groupIndex}`} heading={group.title}>
              {group.items.map((navItem, navItemIndex) => {
                if (navItem.url) {
                  return (
                    <CommandItem
                      key={`${currentUserRole}-nav-${navItem.url}-${navItemIndex}`}
                      value={navItem.title}
                      onSelect={() => {
                        runCommand(() => navigate(navItem.url))
                      }}
                    >
                      <div className='mr-2 flex h-4 w-4 items-center justify-center'>
                        <ArrowRight className='text-muted-foreground/80 size-2' />
                      </div>
                      {navItem.title}
                    </CommandItem>
                  )
                }

                // Handle sub-items
                return (
                  navItem.items?.map((subItem, subItemIndex) => (
                    <CommandItem
                      key={`${currentUserRole}-sub-${navItem.title}-${subItem.url}-${navItemIndex}-${subItemIndex}`}
                      value={`${navItem.title} ${subItem.title}`}
                      onSelect={() => {
                        runCommand(() => navigate(subItem.url))
                      }}
                    >
                      <div className='mr-2 flex h-4 w-4 items-center justify-center'>
                        <ArrowRight className='text-muted-foreground/80 size-2' />
                      </div>
                      {navItem.title} <ChevronRight className='mx-1 h-3 w-3' /> {subItem.title}
                    </CommandItem>
                  )) || []
                )
              })}
            </CommandGroup>
          ))}
          <CommandSeparator />
          <CommandGroup heading='Theme'>
            <CommandItem key='theme-light' onSelect={() => runCommand(() => setTheme('light'))}>
              <Sun className='mr-2 h-4 w-4' />
              <span>Light</span>
            </CommandItem>
            <CommandItem key='theme-dark' onSelect={() => runCommand(() => setTheme('dark'))}>
              <Moon className='mr-2 h-4 w-4 scale-90' />
              <span>Dark</span>
            </CommandItem>
            <CommandItem key='theme-system' onSelect={() => runCommand(() => setTheme('system'))}>
              <Laptop className='mr-2 h-4 w-4' />
              <span>System</span>
            </CommandItem>
          </CommandGroup>
        </ScrollArea>
      </CommandList>
    </CommandDialog>
  )
}
