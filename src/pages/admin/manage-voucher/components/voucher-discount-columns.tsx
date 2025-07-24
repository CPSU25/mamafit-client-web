import { ColumnDef } from '@tanstack/react-table'
import { Checkbox } from '@/components/ui/checkbox'
import { Badge } from '@/components/ui/badge'
import { VoucherDiscount } from '../data/schema'
import { DataTableColumnHeader } from '../../components/data-table-column-header'
import { VoucherTableRowActions } from './voucher-row-action'
import { Ticket, Calendar } from 'lucide-react'
import dayjs from 'dayjs'

// Helper function to get status badge variant and label for voucher discount
const getDiscountStatusBadge = (status: string, isDeleted: boolean) => {
  if (isDeleted) {
    return { variant: 'destructive' as const, label: 'Đã xóa', value: 'DELETED' }
  }

  switch (status) {
    case 'AVAILABLE':
      return { variant: 'default' as const, label: 'Khả dụng', value: 'AVAILABLE' }
    case 'USED':
      return { variant: 'secondary' as const, label: 'Đã sử dụng', value: 'USED' }
    case 'EXPIRED':
      return { variant: 'outline' as const, label: 'Hết hạn', value: 'EXPIRED' }
    case 'DISABLED':
      return { variant: 'destructive' as const, label: 'Vô hiệu hóa', value: 'DISABLED' }
    default:
      return { variant: 'secondary' as const, label: 'N/A', value: 'UNKNOWN' }
  }
}

export const voucherDiscountColumns: ColumnDef<VoucherDiscount>[] = [
  {
    id: 'select',
    header: ({ table }) => (
      <Checkbox
        checked={table.getIsAllPageRowsSelected() || (table.getIsSomePageRowsSelected() && 'indeterminate')}
        onCheckedChange={(value) => table.toggleAllPageRowsSelected(!!value)}
        aria-label='Select all'
        className='translate-y-[2px]'
      />
    ),
    cell: ({ row }) => (
      <Checkbox
        checked={row.getIsSelected()}
        onCheckedChange={(value) => row.toggleSelected(!!value)}
        aria-label='Select row'
        className='translate-y-[2px]'
      />
    ),
    enableSorting: false,
    enableHiding: false
  },
  {
    accessorKey: 'code',
    header: ({ column }) => <DataTableColumnHeader column={column} title='Mã voucher' />,
    cell: ({ row }) => {
      const code = row.getValue('code') as string
      const voucherBatchId = row.original.voucherBatchId
      return (
        <div className='flex items-center gap-3'>
          <div className='w-8 h-8 rounded-lg bg-green-100 flex items-center justify-center'>
            <Ticket className='h-4 w-4 text-green-600' />
          </div>
          <div className='flex flex-col'>
            <span className='font-medium text-sm font-mono'>{code}</span>
            <span className='text-xs text-muted-foreground'>Batch: {voucherBatchId.slice(-8)}</span>
          </div>
        </div>
      )
    },
    enableSorting: true,
    enableHiding: false
  },
  {
    accessorKey: 'voucherBatchId',
    header: ({ column }) => <DataTableColumnHeader column={column} title='Mã lô voucher' />,
    cell: ({ row }) => {
      const voucherBatchId = row.getValue('voucherBatchId') as string
      return (
        <div className='text-sm font-mono'>
          <span className='text-muted-foreground'>{voucherBatchId}</span>
        </div>
      )
    },
    enableSorting: true
  },
  {
    accessorKey: 'status',
    header: ({ column }) => <DataTableColumnHeader column={column} title='Trạng thái' />,
    cell: ({ row }) => {
      const status = row.getValue('status') as string
      const isDeleted = row.original.isDeleted

      const statusInfo = getDiscountStatusBadge(status, isDeleted)

      return (
        <Badge variant={statusInfo.variant} className='text-xs'>
          {statusInfo.label}
        </Badge>
      )
    },
    enableSorting: true,
    filterFn: (row, id, value) => {
      const status = row.getValue(id) as string
      const isDeleted = row.original.isDeleted

      const statusInfo = getDiscountStatusBadge(status, isDeleted)
      return value.includes(statusInfo.value)
    }
  },
  {
    accessorKey: 'isDeleted',
    header: ({ column }) => <DataTableColumnHeader column={column} title='Vô hiệu hóa' />,
    cell: ({ row }) => {
      const isDeleted = row.getValue('isDeleted') as boolean
      return (
        <div className='flex items-center gap-2'>
          <div className={`w-2 h-2 rounded-full ${isDeleted ? 'bg-red-500' : 'bg-green-500'}`} />
          <span className='text-sm'>{isDeleted ? 'Vô hiệu hóa' : 'Khả dụng'}</span>
        </div>
      )
    },
    enableSorting: true,
    filterFn: (row, id, value) => {
      const isDeleted = row.getValue(id) as boolean
      return value.includes(isDeleted ? 'true' : 'false')
    }
  },
  {
    accessorKey: 'createdAt',
    header: ({ column }) => <DataTableColumnHeader column={column} title='Ngày tạo' />,
    cell: ({ row }) => {
      const createdAt = row.getValue('createdAt') as string
      const updatedAt = row.original.updatedAt

      return (
        <div className='flex items-center gap-2 text-sm'>
          <Calendar className='h-3 w-3 text-muted-foreground' />
          <div className='flex flex-col'>
            <span className='text-xs'>Tạo: {dayjs(createdAt).format('DD/MM/YYYY HH:mm')}</span>
            <span className='text-xs text-muted-foreground'>
              Cập nhật: {dayjs(updatedAt).format('DD/MM/YYYY HH:mm')}
            </span>
          </div>
        </div>
      )
    },
    enableSorting: true
  },
  {
    accessorKey: 'createdBy',
    header: ({ column }) => <DataTableColumnHeader column={column} title='Người tạo' />,
    cell: ({ row }) => {
      const createdBy = row.getValue('createdBy') as string
      const updatedBy = row.original.updatedBy
      return (
        <div className='text-sm'>
          <div className='font-medium'>{createdBy}</div>
          {updatedBy && updatedBy !== createdBy && (
            <div className='text-xs text-muted-foreground'>Cập nhật: {updatedBy}</div>
          )}
        </div>
      )
    },
    enableSorting: true
  },
  {
    id: 'actions',
    cell: ({ row }) => <VoucherTableRowActions row={row} />,
    enableSorting: false,
    enableHiding: false
  }
]
