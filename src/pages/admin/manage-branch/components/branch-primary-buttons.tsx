import { Building } from 'lucide-react'
import { Button } from '@/components/ui/button'
import { useBranch } from '../context/branch-context'
import { cn } from '@/lib/utils/utils'

export function BranchPrimaryButtons() {
  const { setOpen } = useBranch()
  return (
    <div className='flex items-center gap-2'>
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
          <Building className='h-4 w-4' />
          Thêm chi nhánh mới
          <span className='absolute -top-1 -right-1 h-2 w-2'>
            <span className='animate-ping absolute inline-flex h-full w-full rounded-full bg-white opacity-75'></span>
            <span className='relative inline-flex rounded-full h-2 w-2 bg-white'></span>
          </span>
        </span>
      </Button>
    </div>
  )
}
