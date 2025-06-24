import { Building } from 'lucide-react'
import { Button } from '@/components/ui/button'
import { useBranch } from '../context/branch-context'

export function BranchPrimaryButtons() {
  const { setOpen } = useBranch()
  return (
    <div className='flex gap-2'>
      <Button className='space-x-1' onClick={() => setOpen('add')}>
        <span>Add Branch</span> <Building size={18} />
      </Button>
    </div>
  )
}
