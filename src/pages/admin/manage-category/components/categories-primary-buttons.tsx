import { Plus } from 'lucide-react'
import { Button } from '@/components/ui/button'
import { useCategories } from '../context/categories-context'

export function CategoriesPrimaryButtons() {
  const { setOpen } = useCategories()

  return (
    <div className='flex items-center space-x-2'>
      <Button
        onClick={() => setOpen('add')}
        className='bg-primary hover:bg-primary/90 text-primary-foreground shadow-sm'
      >
        <Plus className='h-4 w-4 mr-2' />
        Thêm Danh Mục
      </Button>
    </div>
  )
}
