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
        className='h-9 text-pink-600 border-pink-200 hover:bg-pink-50 hover:text-pink-700 dark:text-pink-400 dark:border-pink-800 dark:hover:bg-pink-950/20'
      >
        <RefreshCw className='h-4 w-4 mr-2' />
        Làm mới
      </Button>
      <Button
        onClick={() => setOpen('add')}
        className='h-9 bg-gradient-to-r from-pink-500 to-pink-600 hover:from-pink-600 hover:to-pink-700 text-white shadow-lg hover:shadow-xl transition-all duration-300'
      >
        <Plus className='h-4 w-4 mr-2' />
        Thêm Đầm Bầu
      </Button>
    </div>
  )
}
