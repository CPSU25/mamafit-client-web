import { ManageUserType } from '@/@types/admin.types'
import { OrderType } from '@/@types/manage-order.types'
import { DataTableColumnHeader } from '../../components/data-table-column-header'
import { Badge } from '@/components/ui/badge'
import { Checkbox } from '@/components/ui/checkbox'
import { ColumnDef } from '@tanstack/react-table'
import { Avatar, AvatarFallback, AvatarImage } from '@/components/ui/avatar'
import { getStatusColor, getStatusLabel } from '../data/data'
import { OrderTableRowAction } from './order-row-action'
import { format } from 'date-fns'

interface OrderColumnsProps {
  user?: ManageUserType[]
}
export const createOrderColumns = ({ user = [] }: OrderColumnsProps = {}): ColumnDef<OrderType>[] => [
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
    id: 'code',
    header: ({ column }) => <DataTableColumnHeader column={column} title='Mã đơn hàng' />,
    cell: ({ row }) => {
      const code = row.getValue('code') as string
      return (
        <div className='flex items-center'>
          <Badge variant='outline' className='text-sm font-mono'>
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
      const userId = row.getValue('customerInfor') as string
      const customer = user.find((u) => u.id === userId)
      return (
        <div className='flex items-center'>
          <Avatar className='h-8 w-8'>
            <AvatarFallback className='text-xs'>{customer?.fullName?.charAt(0)?.toUpperCase() || 'U'}</AvatarFallback>
            <AvatarImage src={customer?.profilePicture} />
          </Avatar>
          <div className='ml-2'>
            <p className='font-medium text-sm'>{customer?.fullName || 'N/A'}</p>
            <p className='text-xs text-muted-foreground'>{customer?.userEmail || 'N/A'}</p>
          </div>
        </div>
      )
    },
    enableSorting: false,
    enableHiding: true
  },
  {
    accessorKey: 'totalAmount',
    id: 'totalAmount',
    header: ({ column }) => <DataTableColumnHeader column={column} title='Tổng tiền' />,
    cell: ({ row }) => {
      const totalAmount = row.getValue('totalAmount') as number
      return (
        <div className='text-right font-medium'>
          {new Intl.NumberFormat('vi-VN', {
            style: 'currency',
            currency: 'VND'
          }).format(totalAmount)}
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
        <Badge variant='secondary' className={`text-xs ${getStatusColor(status, 'order')}`}>
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
        <Badge variant='secondary' className={`text-xs ${getStatusColor(paymentStatus, 'payment')}`}>
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
        <div className='text-sm text-muted-foreground'>{paymentMethod === 'CASH' ? 'Tiền mặt' : 'Chuyển khoản'}</div>
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
        return <div className='text-sm text-muted-foreground'>{format(date, 'dd/MM/yyyy HH:mm')}</div>
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
    cell: ({ row }) => <OrderTableRowAction row={row} />,
    enableSorting: false,
    enableHiding: false
  }
]
