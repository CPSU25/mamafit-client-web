import { useState } from 'react'
import { BranchOrderType } from '@/@types/branch-order.types'
import { OrderStatus } from '@/@types/manage-order.types'
import { Button } from '@/components/ui/button'
import { DropdownMenu, DropdownMenuContent, DropdownMenuItem, DropdownMenuTrigger } from '@/components/ui/dropdown-menu'
import { MoreHorizontal, Package, CheckCircle2 } from 'lucide-react'
import { useBranchOrders } from '../contexts/branch-order-context'

interface BranchOrderRowActionsProps {
  order: BranchOrderType
}

export function BranchOrderRowActions({ order }: BranchOrderRowActionsProps) {
  const [open, setOpen] = useState(false)
  const { setOpen: setDialog, setCurrentRow } = useBranchOrders()

  const canReceive = [OrderStatus.DELIVERING, OrderStatus.PICKUP_IN_PROGRESS].includes(order.status)
  const canComplete = [OrderStatus.RECEIVED_AT_BRANCH].includes(order.status)

  const handleReceive = () => {
    setCurrentRow(order)
    setDialog('receive')
    setOpen(false)
  }

  const handleComplete = () => {
    setCurrentRow(order)
    setDialog('complete')
    setOpen(false)
  }

  // Nếu không có hành động nào có thể thực hiện, không hiển thị menu
  if (!canReceive && !canComplete) {
    return (
      <div className='flex justify-center'>
        <span className='text-xs text-muted-foreground'>Không có hành động</span>
      </div>
    )
  }

  return (
    <DropdownMenu open={open} onOpenChange={setOpen}>
      <DropdownMenuTrigger asChild>
        <Button variant='ghost' className='h-8 w-8 p-0'>
          <span className='sr-only'>Mở menu</span>
          <MoreHorizontal className='h-4 w-4' />
        </Button>
      </DropdownMenuTrigger>
      <DropdownMenuContent align='end' className='w-56'>
        {canReceive && (
          <DropdownMenuItem onClick={handleReceive} className='cursor-pointer'>
            <Package className='mr-2 h-4 w-4 text-blue-600' />
            Nhận được hàng
          </DropdownMenuItem>
        )}
        {canComplete && (
          <DropdownMenuItem onClick={handleComplete} className='cursor-pointer'>
            <CheckCircle2 className='mr-2 h-4 w-4 text-green-600' />
            Hoàn thành đơn hàng
          </DropdownMenuItem>
        )}
      </DropdownMenuContent>
    </DropdownMenu>
  )
}
