import { Plus } from 'lucide-react'
import { Button } from '@/components/ui/button'
import { useVoucher } from '../contexts/voucher-context'

export function VoucherPrimaryButtons() {
  const { setOpen, activeTab } = useVoucher()

  return (
    <div className='flex items-center space-x-2'>
      {activeTab === 'batch' && (
        <Button
          onClick={() => setOpen('add-batch')}
          className='bg-primary hover:bg-primary/90 text-primary-foreground shadow-sm'
        >
          <Plus className='h-4 w-4 mr-2' />
          Thêm lô voucher
        </Button>
      )}

      {activeTab === 'discount' && (
        <div className='text-sm text-muted-foreground italic'>Voucher được tạo tự động khi tạo lô voucher</div>
      )}
    </div>
  )
}
