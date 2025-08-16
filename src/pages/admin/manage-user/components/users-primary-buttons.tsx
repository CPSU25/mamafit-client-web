import { UserPlus } from 'lucide-react'
import { Button } from '@/components/ui/button'
import { useUsers } from '../context/users-context'
import { cn } from '@/lib/utils/utils'
// import {
//   DropdownMenu,
//   DropdownMenuContent,
//   DropdownMenuItem,
//   DropdownMenuLabel,
//   DropdownMenuSeparator,
//   DropdownMenuTrigger
// } from '@/components/ui/dropdown-menu'

export function UsersPrimaryButtons() {
  const { setOpen } = useUsers()
  return (
    <div className='flex items-center gap-2'>
      {/* <DropdownMenu>
        <DropdownMenuTrigger asChild>
          <Button
            variant='outline'
            size='default'
            className='border-violet-200 dark:border-violet-800 hover:bg-violet-50 dark:hover:bg-violet-950/30 hover:border-violet-300 dark:hover:border-violet-700 transition-all duration-200'
            data-action-button='true'
          >
            <Download className='h-4 w-4 mr-2' />
            Xuất/Nhập
          </Button>
        </DropdownMenuTrigger>
        <DropdownMenuContent align='end' className='w-48'>
          <DropdownMenuLabel>Thao tác dữ liệu</DropdownMenuLabel>
          <DropdownMenuSeparator />
          <DropdownMenuItem className='cursor-pointer'>
            <Download className='h-4 w-4 mr-2 text-violet-600' />
            Xuất Excel
          </DropdownMenuItem>
          <DropdownMenuItem className='cursor-pointer'>
            <Download className='h-4 w-4 mr-2 text-violet-600' />
            Xuất CSV
          </DropdownMenuItem>
          <DropdownMenuSeparator />
          <DropdownMenuItem className='cursor-pointer'>
            <Upload className='h-4 w-4 mr-2 text-violet-600' />
            Nhập từ Excel
          </DropdownMenuItem>
          <DropdownMenuItem className='cursor-pointer'>
            <Upload className='h-4 w-4 mr-2 text-violet-600' />
            Nhập từ CSV
          </DropdownMenuItem>
        </DropdownMenuContent>
      </DropdownMenu> */}

      {/* <Button
        variant='outline'
        size='icon'
        className='border-violet-200 dark:border-violet-800 hover:bg-violet-50 dark:hover:bg-violet-950/30 hover:border-violet-300 dark:hover:border-violet-700 transition-all duration-200'
        data-action-button='true'
      >
        <Filter className='h-4 w-4' />
      </Button>

      <Button
        onClick={() => setOpen('invite')}
        variant='outline'
        className='space-x-1 border-violet-200 dark:border-violet-800 hover:bg-violet-50 dark:hover:bg-violet-950/30'
        data-action-button='true'
      >
        <span>Invite User</span> <MailPlus size={18} />
      </Button> */}
      <Button
        onClick={() => setOpen('add')}
        className={cn(
          'relative overflow-hidden',
          'bg-gradient-to-r from-violet-500 to-violet-600',
          'hover:from-violet-600 hover:to-violet-700',
          'text-white font-semibold',
          'shadow-lg hover:shadow-xl',
          'transition-all duration-300',
          'group'
        )}
        data-action-button='true'
      >
        <span className='relative flex items-center gap-2'>
          <UserPlus className='h-4 w-4' />
          Thêm tài khoản hệ thống
          <span className='absolute -top-1 -right-1 h-2 w-2'>
            <span className='animate-ping absolute inline-flex h-full w-full rounded-full bg-white opacity-75'></span>
            <span className='relative inline-flex rounded-full h-2 w-2 bg-white'></span>
          </span>
        </span>
      </Button>
    </div>
  )
}
