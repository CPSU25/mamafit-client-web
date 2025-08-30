import { Row } from '@tanstack/react-table'
import { MoreHorizontal, Trash2, Eye, UserPlus } from 'lucide-react'
import { Button } from '@/components/ui/button'
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuSeparator,
  DropdownMenuTrigger
} from '@/components/ui/dropdown-menu'
import { VoucherBatch, VoucherDiscount } from '../data/schema'
import { useVoucher } from '../contexts/voucher-context'

interface DataTableRowActionsProps<TData extends object> {
  row: Row<TData>
}

export function VoucherTableRowActions<TData extends object>({ row }: DataTableRowActionsProps<TData>) {
  const { setOpen, setCurrentVoucherBatch, setCurrentVoucherDiscount } = useVoucher()

  // Determine if this is a voucher batch or voucher discount
  const isVoucherBatch = 'batchName' in row.original
  const voucherBatch = isVoucherBatch ? (row.original as VoucherBatch) : null
  const voucherDiscount = !isVoucherBatch ? (row.original as VoucherDiscount) : null

  const handleView = () => {
    if (voucherBatch) {
      setCurrentVoucherBatch(voucherBatch)
      setOpen('view')
    } else if (voucherDiscount) {
      setCurrentVoucherDiscount(voucherDiscount)
      setOpen('view')
    }
  }

  const handleDelete = () => {
    if (voucherBatch) {
      setCurrentVoucherBatch(voucherBatch)
      setOpen('delete-batch')
    } else if (voucherDiscount) {
      setCurrentVoucherDiscount(voucherDiscount)
      setOpen('delete-discount')
    }
  }

  const handleAssignVoucher = () => {
    if (voucherBatch) {
      setCurrentVoucherBatch(voucherBatch)
      setOpen('assign-voucher')
    }
  }

  return (
    <DropdownMenu modal={false}>
      <DropdownMenuTrigger asChild>
        <Button variant='ghost' className='flex h-8 w-8 p-0 data-[state=open]:bg-muted'>
          <MoreHorizontal className='h-4 w-4' />
          <span className='sr-only'>Open menu</span>
        </Button>
      </DropdownMenuTrigger>
      <DropdownMenuContent align='end' className='w-[160px]'>
        <DropdownMenuItem onClick={handleView}>
          <Eye className='mr-2 h-4 w-4' />
          Xem chi tiết
        </DropdownMenuItem>
        {isVoucherBatch && (
          <DropdownMenuItem onClick={handleAssignVoucher}>
            <UserPlus className='mr-2 h-4 w-4' />
            Assign voucher
          </DropdownMenuItem>
        )}
        <DropdownMenuSeparator />
        <DropdownMenuItem onClick={handleDelete} className='text-destructive focus:text-destructive'>
          <Trash2 className='mr-2 h-4 w-4' />
          {isVoucherBatch ? 'Xóa lô voucher' : 'Vô hiệu hóa'}
        </DropdownMenuItem>
      </DropdownMenuContent>
    </DropdownMenu>
  )
}
