import { Button } from '@/components/ui/button'
import { Plus, RefreshCw } from 'lucide-react'
import { useMaternityDress } from '../context/maternity-dress-context'
import { useQueryClient } from '@tanstack/react-query'
import { maternityDressKeys } from '@/services/admin/maternity-dress.service'

export function MaternityDressPrimaryButtons() {
  const { setOpen } = useMaternityDress()
  const queryClient = useQueryClient()

  const handleRefresh = () => {
    queryClient.invalidateQueries({ queryKey: maternityDressKeys.all })
  }

  return (
    <div className='flex items-center gap-2'>
      <Button
        variant='outline'
        size='sm'
        onClick={handleRefresh}
        className='h-9 text-violet-600 border-violet-200 hover:bg-violet-50 hover:text-violet-700 dark:text-violet-400 dark:border-violet-800 dark:hover:bg-violet-950/20'
      >
        <RefreshCw className='h-4 w-4 mr-2' />
        Làm mới
      </Button>
      <Button
        onClick={() => setOpen('add')}
        className='h-9 bg-gradient-to-r from-violet-500 to-violet-600 hover:from-violet-600 hover:to-violet-700 text-white shadow-lg hover:shadow-xl transition-all duration-300'
      >
        <Plus className='h-4 w-4 mr-2' />
        Thêm Đầm Bầu
      </Button>
    </div>
  )
}
