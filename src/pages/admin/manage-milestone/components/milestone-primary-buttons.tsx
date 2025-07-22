import { Plus } from 'lucide-react'
import { Button } from '@/components/ui/button'
import { useMilestones } from '../context/milestones-context'

export function MilestonePrimaryButtons() {
  const { setOpen } = useMilestones()

  return (
    <div className='flex items-center space-x-2'>
      <Button
        onClick={() => setOpen('add')}
        className='bg-primary hover:bg-primary/90 text-primary-foreground shadow-sm'
      >
        <Plus className='h-4 w-4 mr-2' />
        Thêm Milestone
      </Button>
    </div>
  )
}
