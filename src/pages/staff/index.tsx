import { ProductTaskTracker } from '@/pages/staff/components/ProductTaskTracker'
import { TaskStatus as StaffTaskStatus } from '@/pages/staff/tasks/types'
import { useGetOrderTasks, useUpdateTaskStatus } from '@/services/global/order-task.service'
import { Skeleton } from '@/components/ui/skeleton'

export default function StaffTasksPage() {
  const { data: productGroups, isLoading, isError } = useGetOrderTasks()
  const updateTaskStatusMutation = useUpdateTaskStatus()

  const handleTaskStatusChange = (taskId: string, status: StaffTaskStatus, orderItemId?: string) => {
    if (!orderItemId) {
      console.error('orderItemId is required for updating task status')
      return
    }

    console.log(`Cập nhật task ${taskId} thành trạng thái ${status} cho orderItem ${orderItemId}`)

    updateTaskStatusMutation.mutate({
      dressTaskId: taskId,
      orderItemId: orderItemId,
      status: status
    })
  }

  if (isLoading) {
    return (
      <div className='container mx-auto p-4 md:p-8 space-y-8'>
        <Skeleton className='h-[200px] w-full rounded-lg' />
        <div className='space-y-4'>
          <Skeleton className='h-8 w-1/3 rounded-lg' />
          <Skeleton className='h-24 w-full rounded-lg' />
          <Skeleton className='h-24 w-full rounded-lg' />
          <Skeleton className='h-24 w-full rounded-lg' />
        </div>
      </div>
    )
  }

  if (isError) {
    return (
      <div className='container mx-auto p-8 text-center text-red-500'>Đã có lỗi xảy ra khi tải dữ liệu công việc.</div>
    )
  }

  return (
    <div className='container mx-auto p-4 md:p-8'>
      <div className='space-y-8'>
        <div className='text-center'>
          <h1 className='text-3xl font-bold tracking-tight'>Theo dõi Công việc</h1>
          <p className='text-muted-foreground mt-2'>Quản lý tiến độ thực hiện các sản phẩm được giao</p>
        </div>

        <ProductTaskTracker
          productGroups={productGroups || []}
          onTaskStatusChange={handleTaskStatusChange}
          isUpdating={updateTaskStatusMutation.isPending}
        />
      </div>
    </div>
  )
}
