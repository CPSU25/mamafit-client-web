import { Row } from '@tanstack/react-table'
import { OrderType } from '@/@types/admin.types'
import { MoreHorizontal, Eye, Edit, Trash2, CheckCircle, Package } from 'lucide-react'
import { Button } from '@/components/ui/button'
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuLabel,
  DropdownMenuSeparator,
  DropdownMenuTrigger
} from '@/components/ui/dropdown-menu'
import { useOrders } from '../contexts/order-context'

interface OrderTableRowActionProps {
  row: Row<OrderType>
}

export function OrderTableRowAction({ row }: OrderTableRowActionProps) {
  const order = row.original
  const { setOpen, setCurrentRow } = useOrders()

  const handleViewDetails = () => {
    setCurrentRow(order)
    setOpen('view')
  }

  const handleEdit = () => {
    setCurrentRow(order)
    setOpen('edit')
  }

  const handleUpdateStatus = () => {
    setCurrentRow(order)
    setOpen('update')
  }

  const handleDelete = () => {
    setCurrentRow(order)
    setOpen('delete')
  }

  const handleAssignTask = () => {
    setCurrentRow(order)
    setOpen('assign-task')
  }

  const canEdit = !['COMPLETED', 'CANCELLED', 'RETURNED'].includes(order.status)
  const canDelete = ['CREATED', 'CONFIRMED'].includes(order.status)
  const canAssignTask = ['CONFIRMED', 'IN_DESIGN', 'IN_PRODUCTION'].includes(order.status)

  return (
    <DropdownMenu>
      <DropdownMenuTrigger asChild>
        <Button variant='ghost' className='flex h-8 w-8 p-0 data-[state=open]:bg-muted'>
          <MoreHorizontal className='h-4 w-4' />
          <span className='sr-only'>Mở menu</span>
        </Button>
      </DropdownMenuTrigger>
      <DropdownMenuContent align='end' className='w-[180px]'>
        <DropdownMenuLabel>Thao tác</DropdownMenuLabel>
        <DropdownMenuSeparator />

        <DropdownMenuItem onClick={handleViewDetails}>
          <Eye className='mr-2 h-4 w-4' />
          Xem chi tiết
        </DropdownMenuItem>

        {canEdit && (
          <DropdownMenuItem onClick={handleEdit}>
            <Edit className='mr-2 h-4 w-4' />
            Chỉnh sửa
          </DropdownMenuItem>
        )}

        <DropdownMenuItem onClick={handleUpdateStatus}>
          <CheckCircle className='mr-2 h-4 w-4' />
          Cập nhật trạng thái
        </DropdownMenuItem>

        {canAssignTask && (
          <DropdownMenuItem onClick={handleAssignTask}>
            <Package className='mr-2 h-4 w-4' />
            Giao nhiệm vụ
          </DropdownMenuItem>
        )}

        <DropdownMenuSeparator />

        {canDelete && (
          <DropdownMenuItem onClick={handleDelete} className='text-red-600 focus:text-red-600'>
            <Trash2 className='mr-2 h-4 w-4' />
            Xóa đơn hàng
          </DropdownMenuItem>
        )}
      </DropdownMenuContent>
    </DropdownMenu>
  )
}
