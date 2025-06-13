import React from 'react'
import { cn } from '@/lib/utils/utils'
import { Separator } from '@/components/ui/separator'
import { SidebarTrigger } from '@/components/ui/sidebar'

interface HeaderProps extends React.HTMLAttributes<HTMLElement> {
  fixed?: boolean
  ref?: React.Ref<HTMLElement>
}

export const Header = ({ className, fixed, children, ...props }: HeaderProps) => {
  const [offset, setOffset] = React.useState(0)

  React.useEffect(() => {
    const onScroll = () => {
      setOffset(document.body.scrollTop || document.documentElement.scrollTop)
    }

    // Add scroll listener to the body
    document.addEventListener('scroll', onScroll, { passive: true })

    // Clean up the event listener on unmount
    return () => document.removeEventListener('scroll', onScroll)
  }, [])

  return (
    <header
      className={cn(
        'flex h-14 items-center justify-between px-4 py-2',
        fixed && 'header-fixed peer/header fixed z-50 w-[inherit] rounded-md',
        offset > 10 && fixed ? 'shadow-sm' : 'shadow-none',
        className
      )}
      {...props}
    >
      {/* Left section - Logo/Brand */}
      <div className='flex items-center gap-3'>
        <SidebarTrigger variant='outline' className='h-8 w-8' />
        <Separator orientation='vertical' className='h-5' />
        <div className='flex items-center'>
          <h1 className='text-base font-medium text-gray-800'>Product</h1>
        </div>
      </div>

      {/* Right section - Search, ModeToggle, Profile */}
      <div className='flex items-center'>{children}</div>
    </header>
  )
}

Header.displayName = 'Header'
