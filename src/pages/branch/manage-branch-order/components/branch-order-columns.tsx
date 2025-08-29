// order-columns.tsx - Enhanced Order Table Columns
import { BranchOrderType } from '@/@types/branch-order.types'
import { DataTableColumnHeader } from '../../components/data-table-column-header'
import { Badge } from '@/components/ui/badge'
import { Checkbox } from '@/components/ui/checkbox'
import { ColumnDef } from '@tanstack/react-table'
import { getStatusColor, getStatusLabel } from '../data/data'
import { BranchOrderRowActions } from './branch-order-row-actions'
import { OrderCustomerCell } from './order-customer-cell'
import { format } from 'date-fns'

export const createBranchOrderColumns = (): ColumnDef<BranchOrderType>[] => [
  {
    id: 'select',
    header: ({ table }) => (
      <Checkbox
        checked={table.getIsAllPageRowsSelected() || (table.getIsSomePageRowsSelected() && 'indeterminate')}
        onCheckedChange={(value) => table.toggleAllPageRowsSelected(!!value)}
        aria-label='Select all'
        className='translate-y-[2px] border-violet-300 data-[state=checked]:bg-violet-600 data-[state=checked]:border-violet-600'
      />
    ),
    cell: ({ row }) => (
      <Checkbox
        checked={row.getIsSelected()}
        onCheckedChange={(value) => row.toggleSelected(!!value)}
        aria-label='Select row'
        className='translate-y-[2px] border-violet-300 data-[state=checked]:bg-violet-600 data-[state=checked]:border-violet-600'
      />
    ),
    enableSorting: false,
    enableHiding: false
  },
  {
    accessorKey: 'code',
    id: 'code',
    header: ({ column }) => <DataTableColumnHeader column={column} title='Mã đơn hàng' />,
    cell: ({ row }) => {
      const code = row.getValue('code') as string
      return (
        <div className='flex items-center'>
          <Badge
            variant='outline'
            className='text-sm font-mono bg-violet-50 text-violet-700 border-violet-200 dark:bg-violet-950/30 dark:text-violet-300 dark:border-violet-800 px-3 py-1'
          >
            #{code}
          </Badge>
        </div>
      )
    },
    enableSorting: true,
    enableHiding: false
  },
  {
    accessorKey: 'userId',
    id: 'customerInfor',
    header: ({ column }) => <DataTableColumnHeader column={column} title='Khách hàng' />,
    cell: ({ row }) => {
      return <OrderCustomerCell order={row.original} />
    },
    enableSorting: false,
    enableHiding: true
  },
  {
    accessorKey: 'totalAmount',
    id: 'totalAmount',
    header: ({ column }) => <DataTableColumnHeader column={column} title='Tổng tiền' />,
    cell: ({ row }) => {
      const totalAmount = (row.getValue('totalAmount') as number) ?? 0
      return (
        <div className='item-center'>
          <div className='font-bold text-violet-700 dark:text-violet-300 '>
            {new Intl.NumberFormat('vi-VN', {
              style: 'currency',
              currency: 'VND'
            }).format(totalAmount)}
          </div>
        </div>
      )
    },
    enableSorting: true,
    enableHiding: true
  },
  {
    accessorKey: 'status',
    id: 'status',
    header: ({ column }) => <DataTableColumnHeader column={column} title='Trạng thái' />,
    cell: ({ row }) => {
      const status = row.getValue('status') as string
      return (
        <Badge variant='secondary' className={`text-xs font-medium px-3 py-1 ${getStatusColor(status, 'order')}`}>
          <div
            className={`w-2 h-2 rounded-full mr-2 ${
              status === 'COMPLETED'
                ? 'bg-green-500'
                : status === 'IN_PRODUCTION'
                  ? 'bg-blue-500'
                  : status === 'CONFIRMED'
                    ? 'bg-yellow-500'
                    : 'bg-gray-400'
            }`}
          />
          {getStatusLabel(status, 'order')}
        </Badge>
      )
    },
    enableSorting: true,
    enableHiding: true
  },
  {
    accessorKey: 'paymentStatus',
    id: 'paymentStatus',
    header: ({ column }) => <DataTableColumnHeader column={column} title='Thanh toán' />,
    cell: ({ row }) => {
      const paymentStatus = row.getValue('paymentStatus') as string
      return (
        <Badge
          variant='secondary'
          className={`text-xs font-medium px-3 py-1 ${getStatusColor(paymentStatus, 'payment')}`}
        >
          <div
            className={`w-2 h-2 rounded-full mr-2 ${
              paymentStatus === 'PAID_FULL'
                ? 'bg-green-500'
                : paymentStatus === 'PAID_DEPOSIT' || paymentStatus === 'PAID_DEPOSIT_COMPLETED'
                  ? 'bg-yellow-500'
                  : paymentStatus === 'FAILED' || paymentStatus === 'CANCELED'
                    ? 'bg-red-500'
                    : 'bg-gray-400'
            }`}
          />
          {getStatusLabel(paymentStatus, 'payment')}
        </Badge>
      )
    },
    enableSorting: true,
    enableHiding: true
  },
  {
    accessorKey: 'paymentMethod',
    id: 'paymentMethod',
    header: ({ column }) => <DataTableColumnHeader column={column} title='Phương thức' />,
    cell: ({ row }) => {
      const paymentMethod = row.getValue('paymentMethod') as string
      return (
        <div className='text-sm'>
          <Badge
            variant='outline'
            className='bg-violet-50 text-violet-700 border-violet-200 dark:bg-violet-950/30 dark:text-violet-300 dark:border-violet-700'
          >
            {paymentMethod === 'CASH' ? '💵 Tiền mặt' : '🏦 Chuyển khoản'}
          </Badge>
        </div>
      )
    },
    enableSorting: false,
    enableHiding: true
  },
  {
    accessorKey: 'createdAt',
    id: 'createdAt',
    header: ({ column }) => <DataTableColumnHeader column={column} title='Ngày đặt' />,
    cell: ({ row }) => {
      const createdAt = row.getValue('createdAt') as string
      try {
        if (!createdAt) return <div className='text-sm text-muted-foreground'>-</div>
        const date = new Date(createdAt)
        if (isNaN(date.getTime())) return <div className='text-sm text-muted-foreground'>-</div>

        const now = new Date()
        const diffInHours = Math.abs(now.getTime() - date.getTime()) / (1000 * 60 * 60)
        const isRecent = diffInHours < 24

        return (
          <div className='text-sm'>
            <div
              className={`font-medium ${isRecent ? 'text-violet-600 dark:text-violet-400' : 'text-muted-foreground'}`}
            >
              {format(date, 'dd/MM/yyyy')}
            </div>
            <div className='text-xs text-muted-foreground'>
              {format(date, 'HH:mm')}
              {isRecent && (
                <span className='ml-1 inline-flex items-center'>
                  <div className='w-1 h-1 bg-violet-500 rounded-full animate-pulse' />
                </span>
              )}
            </div>
          </div>
        )
      } catch {
        return <div className='text-sm text-muted-foreground'>-</div>
      }
    },
    enableSorting: true,
    enableHiding: true
  },
  {
    id: 'actions',
    header: 'Thao tác',
    cell: ({ row }) => <BranchOrderRowActions order={row.original} />,
    enableSorting: false,
    enableHiding: false
  }
]
