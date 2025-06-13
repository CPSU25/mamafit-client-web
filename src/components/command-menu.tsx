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

export function CommandMenu() {
  const navigate = useNavigate()
  const { setTheme } = useTheme()
  const { open, setOpen } = useSearch()

  const runCommand = React.useCallback(
    (command: () => unknown) => {
      setOpen(false)
      command()
    },
    [setOpen]
  )
  return (
    <CommandDialog modal open={open} onOpenChange={setOpen}>
      <CommandInput placeholder='Type a command or search...' />
      <CommandList>
        <ScrollArea type='hover' className='h-72 pr-1'>
          <CommandEmpty>No results found.</CommandEmpty>
          {sidebarData.role
            .find((role) => role.name === 'Admin')
            ?.navGroups.map((group) => (
              <CommandGroup key={`group-${group.title}`} heading={group.title}>
                {group.items.map((navItem, navItemIndex) => {
                  if (navItem.url)
                    return (
                      <CommandItem
                        key={`nav-${navItem.url}-${navItemIndex}`}
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

                  return navItem.items?.map((subItem, subItemIndex) => (
                    <CommandItem
                      key={`sub-${navItem.title}-${subItem.url}-${navItemIndex}-${subItemIndex}`}
                      value={`${navItem.title}-${subItem.url}`}
                      onSelect={() => {
                        runCommand(() => navigate(subItem.url))
                      }}
                    >
                      <div className='mr-2 flex h-4 w-4 items-center justify-center'>
                        <ArrowRight className='text-muted-foreground/80 size-2' />
                      </div>
                      {navItem.title} <ChevronRight /> {subItem.title}
                    </CommandItem>
                  ))
                })}
              </CommandGroup>
            ))}
          <CommandSeparator />
          <CommandGroup heading='Theme'>
            <CommandItem key='theme-light' onSelect={() => runCommand(() => setTheme('light'))}>
              <Sun /> <span>Light</span>
            </CommandItem>
            <CommandItem key='theme-dark' onSelect={() => runCommand(() => setTheme('dark'))}>
              <Moon className='scale-90' />
              <span>Dark</span>
            </CommandItem>
            <CommandItem key='theme-system' onSelect={() => runCommand(() => setTheme('system'))}>
              <Laptop />
              <span>System</span>
            </CommandItem>
          </CommandGroup>
        </ScrollArea>
      </CommandList>
    </CommandDialog>
  )
}
