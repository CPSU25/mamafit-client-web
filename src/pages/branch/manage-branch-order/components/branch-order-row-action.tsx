// order-row-action.tsx - Enhanced Row Actions
import { Row } from '@tanstack/react-table'
import { BranchOrderType } from '@/@types/branch-order.types'
import { MoreHorizontal, Eye, Edit, Trash2, CheckCircle, ExternalLink, Users } from 'lucide-react'
import { Button } from '@/components/ui/button'
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuLabel,
  DropdownMenuSeparator,
  DropdownMenuTrigger
} from '@/components/ui/dropdown-menu'
import { useBranchOrders } from '../contexts/branch-order-context'

interface BranchOrderTableRowActionProps<TData> {
  row: Row<TData>
}

export function BranchOrderTableRowAction<TData>({ row }: BranchOrderTableRowActionProps<TData>) {
  const order = row.original as BranchOrderType
  const { setOpen, setCurrentRow } = useBranchOrders()

  const handleViewDetails = () => {
    setCurrentRow(order)
    setOpen('view')
  }

  const handleViewDetailPage = () => {
    // Branch manager detail page route (if available later). For now, open sidebar.
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
  const canAssignTask = ['CONFIRMED', 'IN_DESIGN', 'IN_PRODUCTION', 'CREATED'].includes(order.status)

  return (
    <DropdownMenu>
      <DropdownMenuTrigger asChild>
        <Button 
          variant='ghost' 
          className='flex h-9 w-9 p-0 data-[state=open]:bg-violet-100 dark:data-[state=open]:bg-violet-950/30 hover:bg-violet-50 dark:hover:bg-violet-950/20 transition-colors duration-200'
        >
          <MoreHorizontal className='h-4 w-4 text-violet-600 dark:text-violet-400' />
          <span className='sr-only'>Mở menu</span>
        </Button>
      </DropdownMenuTrigger>
      <DropdownMenuContent 
        align='end' 
        className='w-[220px] border-violet-200 dark:border-violet-800 shadow-lg bg-white/95 dark:bg-card/95 backdrop-blur-sm'
      >
        <DropdownMenuLabel className='text-violet-700 dark:text-violet-300 font-semibold'>
          Thao tác đơn hàng
        </DropdownMenuLabel>
        <DropdownMenuSeparator className='bg-violet-200 dark:bg-violet-800' />

        <DropdownMenuItem 
          onClick={handleViewDetails}
          className='hover:bg-violet-50 dark:hover:bg-violet-950/30 focus:bg-violet-50 dark:focus:bg-violet-950/30 cursor-pointer'
        >
          <Eye className='mr-3 h-4 w-4 text-violet-600 dark:text-violet-400' />
          <div>
            <div className='font-medium'>Xem chi tiết</div>
            <div className='text-xs text-muted-foreground'>Mở sidebar chi tiết</div>
          </div>
        </DropdownMenuItem>

        <DropdownMenuItem 
          onClick={handleViewDetailPage}
          className='hover:bg-violet-50 dark:hover:bg-violet-950/30 focus:bg-violet-50 dark:focus:bg-violet-950/30 cursor-pointer'
        >
          <ExternalLink className='mr-3 h-4 w-4 text-violet-600 dark:text-violet-400' />
          <div>
            <div className='font-medium'>Trang chi tiết</div>
            <div className='text-xs text-muted-foreground'>Mở trang đầy đủ</div>
          </div>
        </DropdownMenuItem>

        {canEdit && (
          <DropdownMenuItem 
            onClick={handleEdit}
            className='hover:bg-violet-50 dark:hover:bg-violet-950/30 focus:bg-violet-50 dark:focus:bg-violet-950/30 cursor-pointer'
          >
            <Edit className='mr-3 h-4 w-4 text-blue-600 dark:text-blue-400' />
            <div>
              <div className='font-medium'>Chỉnh sửa</div>
              <div className='text-xs text-muted-foreground'>Sửa thông tin đơn hàng</div>
            </div>
          </DropdownMenuItem>
        )}

        <DropdownMenuItem 
          onClick={handleUpdateStatus}
          className='hover:bg-violet-50 dark:hover:bg-violet-950/30 focus:bg-violet-50 dark:focus:bg-violet-950/30 cursor-pointer'
        >
          <CheckCircle className='mr-3 h-4 w-4 text-green-600 dark:text-green-400' />
          <div>
            <div className='font-medium'>Cập nhật trạng thái</div>
            <div className='text-xs text-muted-foreground'>Thay đổi trạng thái đơn hàng</div>
          </div>
        </DropdownMenuItem>

        {canAssignTask && (
          <DropdownMenuItem 
            onClick={handleAssignTask}
            className='hover:bg-violet-50 dark:hover:bg-violet-950/30 focus:bg-violet-50 dark:focus:bg-violet-950/30 cursor-pointer'
          >
            <Users className='mr-3 h-4 w-4 text-orange-600 dark:text-orange-400' />
            <div>
              <div className='font-medium'>Giao nhiệm vụ</div>
              <div className='text-xs text-muted-foreground'>Phân công cho nhân viên</div>
            </div>
          </DropdownMenuItem>
        )}

        <DropdownMenuSeparator className='bg-violet-200 dark:bg-violet-800' />

        {canDelete && (
          <DropdownMenuItem 
            onClick={handleDelete} 
            className='text-red-600 focus:text-red-600 hover:bg-red-50 dark:hover:bg-red-950/30 focus:bg-red-50 dark:focus:bg-red-950/30 cursor-pointer'
          >
            <Trash2 className='mr-3 h-4 w-4' />
            <div>
              <div className='font-medium'>Xóa đơn hàng</div>
              <div className='text-xs text-muted-foreground'>Xóa vĩnh viễn đơn hàng</div>
            </div>
          </DropdownMenuItem>
        )}
      </DropdownMenuContent>
    </DropdownMenu>
  )
}