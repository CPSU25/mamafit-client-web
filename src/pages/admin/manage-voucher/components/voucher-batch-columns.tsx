import { ColumnDef } from '@tanstack/react-table'
import { Checkbox } from '@/components/ui/checkbox'
import { Badge } from '@/components/ui/badge'
import { VoucherBatch } from '../data/schema'
import { DataTableColumnHeader } from '../../components/data-table-column-header'
import { VoucherTableRowActions } from './voucher-row-action'
import { Ticket, Calendar } from 'lucide-react'
import dayjs from 'dayjs'

// Helper function to get status badge variant and label from status value
const getStatusBadgeFromValue = (status: string) => {
  switch (status) {
    case 'USED_UP':
      return { variant: 'destructive' as const, label: 'Hết voucher' }
    case 'PENDING':
      return { variant: 'secondary' as const, label: 'Chưa bắt đầu' }
    case 'EXPIRED':
      return { variant: 'outline' as const, label: 'Hết hạn' }
    case 'ACTIVE':
      return { variant: 'default' as const, label: 'Đang hoạt động' }
    default:
      return { variant: 'secondary' as const, label: 'N/A' }
  }
}

// Helper function to format discount type and value
const formatDiscountDisplay = (discountType: string, discountValue: number) => {
  if (discountType === 'PERCENTAGE') {
    return `${discountValue}%`
  }
  return `${discountValue.toLocaleString('vi-VN')} VND`
}

export const voucherBatchColumns: ColumnDef<VoucherBatch>[] = [
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
    accessorKey: 'batchCode',
    header: ({ column }) => <DataTableColumnHeader column={column} title='Mã lô' />,
    cell: ({ row }) => {
      const batchCode = row.getValue('batchCode') as string
      const batchName = row.original.batchName
      return (
        <div className='flex items-center gap-3'>
          <div className='w-8 h-8 rounded-lg bg-orange-100 flex items-center justify-center'>
            <Ticket className='h-4 w-4 text-orange-600' />
          </div>
          <div className='flex flex-col'>
            <span className='font-medium text-sm'>{batchCode}</span>
            <span className='text-xs text-muted-foreground'>{batchName}</span>
          </div>
        </div>
      )
    },
    enableSorting: true,
    enableHiding: false
  },
  {
    accessorKey: 'description',
    header: ({ column }) => <DataTableColumnHeader column={column} title='Mô tả' />,
    cell: ({ row }) => {
      const description = row.getValue('description') as string
      return (
        <div className='max-w-[200px]'>
          <span className='text-sm truncate block' title={description}>
            {description || '-'}
          </span>
        </div>
      )
    },
    enableSorting: false
  },
  {
    accessorKey: 'discountType',
    header: ({ column }) => <DataTableColumnHeader column={column} title='Loại giảm giá' />,
    cell: ({ row }) => {
      const discountType = row.getValue('discountType') as string

      return (
        <div className='flex items-center gap-2'>
          <Badge variant='outline' className='text-xs'>
            {discountType === 'PERCENTAGE' ? 'Phần trăm (%)' : 'Số tiền cố định'}
          </Badge>
        </div>
      )
    },
    enableSorting: true,
    filterFn: (row, id, value) => {
      return value.includes(row.getValue(id))
    }
  },
  {
    accessorKey: 'discountValue',
    header: ({ column }) => <DataTableColumnHeader column={column} title='Giá trị' />,
    cell: ({ row }) => {
      const discountType = row.original.discountType
      const discountValue = row.getValue('discountValue') as number
      const display = formatDiscountDisplay(discountType, discountValue)

      return <div className='font-medium text-sm'>{display}</div>
    },
    enableSorting: true
  },
  {
    accessorKey: 'totalQuantity',
    header: ({ column }) => <DataTableColumnHeader column={column} title='Số lượng' />,
    cell: ({ row }) => {
      const totalQuantity = row.getValue('totalQuantity') as number
      const remainingQuantity = row.original.remainingQuantity

      return (
        <div className='text-sm'>
          <div className='font-medium'>
            {remainingQuantity.toLocaleString('vi-VN')} / {totalQuantity.toLocaleString('vi-VN')}
          </div>
          <div className='text-xs text-muted-foreground'>Còn lại / Tổng số</div>
        </div>
      )
    },
    enableSorting: true
  },
  {
    accessorKey: 'startDate',
    header: ({ column }) => <DataTableColumnHeader column={column} title='Thời gian' />,
    cell: ({ row }) => {
      const startDate = row.getValue('startDate') as string
      const endDate = row.original.endDate

      return (
        <div className='flex items-center gap-2 text-sm'>
          <Calendar className='h-3 w-3 text-muted-foreground' />
          <div className='flex flex-col'>
            <span className='text-xs'>Từ: {dayjs(startDate).format('DD/MM/YYYY')}</span>
            <span className='text-xs'>Đến: {dayjs(endDate).format('DD/MM/YYYY')}</span>
          </div>
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

      const statusInfo = getStatusBadgeFromValue(status)

      return (
        <Badge variant={statusInfo.variant} className='text-xs'>
          {statusInfo.label}
        </Badge>
      )
    },
    enableSorting: false,
    filterFn: (row, id, value) => {
      const status = row.getValue(id) as string
      return value.includes(status)
    }
  },
  {
    accessorKey: 'createdAt',
    header: ({ column }) => <DataTableColumnHeader column={column} title='Ngày tạo' />,
    cell: ({ row }) => {
      const createdAt = row.getValue('createdAt') as string
      return <div className='text-sm text-muted-foreground'>{dayjs(createdAt).format('DD/MM/YYYY HH:mm')}</div>
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
