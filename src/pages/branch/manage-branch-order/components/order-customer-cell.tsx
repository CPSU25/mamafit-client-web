import { BranchOrderType } from '@/@types/branch-order.types'
import { useGetUserById } from '@/services/admin/manage-user.service'
import { Avatar, AvatarFallback, AvatarImage } from '@/components/ui/avatar'

interface OrderCustomerCellProps {
  order: BranchOrderType
}

export function OrderCustomerCell({ order }: OrderCustomerCellProps) {
  const { data: userResponse } = useGetUserById(order.userId)
  const customer = userResponse?.data

  return (
    <div className='flex items-center space-x-3'>
      <Avatar className='h-10 w-10 ring-2 ring-violet-200 dark:ring-violet-700'>
        <AvatarFallback className='text-sm bg-violet-100 dark:bg-violet-900 text-violet-600 dark:text-violet-300 font-semibold'>
          {customer?.fullName?.charAt(0)?.toUpperCase() || 'U'}
        </AvatarFallback>
        <AvatarImage src={customer?.profilePicture || ''} />
      </Avatar>
      <div className='min-w-0 flex-1'>
        <p className='font-semibold text-sm text-foreground truncate'>{customer?.fullName || 'Đang tải...'}</p>
        <p className='text-xs text-muted-foreground truncate'>{customer?.userEmail || 'Đang tải...'}</p>
      </div>
    </div>
  )
}
