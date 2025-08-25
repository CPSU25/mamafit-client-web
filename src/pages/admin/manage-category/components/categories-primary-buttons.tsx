// categories-primary-buttons.tsx - Enhanced Primary Action Buttons
import { Plus } from 'lucide-react'
import { Button } from '@/components/ui/button'
import { useCategories } from '../context/categories-context'

import { cn } from '@/lib/utils/utils'

export function CategoriesPrimaryButtons() {
  const { setOpen } = useCategories()

  return (
    <div className='flex items-center gap-2'>
      {/* Export/Import Dropdown */}
      {/* <DropdownMenu>
        <DropdownMenuTrigger asChild>
          <Button
            variant='outline'
            size='default'
            className='border-violet-200 dark:border-violet-800 hover:bg-violet-50 dark:hover:bg-violet-950/30 hover:border-violet-300 dark:hover:border-violet-700 transition-all duration-200'
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

      {/* Filter Button */}
      {/* <Button
        variant='outline'
        size='icon'
        className='border-violet-200 dark:border-violet-800 hover:bg-violet-50 dark:hover:bg-violet-950/30 hover:border-violet-300 dark:hover:border-violet-700 transition-all duration-200'
      >
        <Filter className='h-4 w-4' />
      </Button> */}

      {/* Main Add Button with Enhanced Styling */}
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
      >
        {/* Animated background effect */}
        <span className='absolute inset-0 bg-gradient-to-r from-violet-400 to-violet-500 opacity-0 group-hover:opacity-100 transition-opacity duration-300' />

        {/* Button content */}
        <span className='relative flex items-center gap-2'>
          <Plus className='h-4 w-4 group-hover:rotate-90 transition-transform duration-300' />
          Thêm Danh Mục
          {/* Sparkle effect */}
          <span className='absolute -top-1 -right-1 h-2 w-2'>
            <span className='animate-ping absolute inline-flex h-full w-full rounded-full bg-white opacity-75'></span>
            <span className='relative inline-flex rounded-full h-2 w-2 bg-white'></span>
          </span>
        </span>
      </Button>
    </div>
  )
}
