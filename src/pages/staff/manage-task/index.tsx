import { ProductTaskTracker } from '@/pages/staff/manage-task/components/ProductTaskTracker'
import { TaskStatus as StaffTaskStatus } from '@/pages/staff/manage-task/tasks/types'
import { useGetOrderTasks, useUpdateTaskStatus } from '@/services/global/order-task.service'
import { Skeleton } from '@/components/ui/skeleton'

export default function StaffTasksPage() {
  const { data: orderItems, isLoading, isError } = useGetOrderTasks()
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
        <div className='text-center space-y-2'>
          <Skeleton className='h-8 w-64 mx-auto rounded-lg' />
          <Skeleton className='h-4 w-96 mx-auto rounded-lg' />
        </div>
        <div className='space-y-4'>
          <Skeleton className='h-32 w-full rounded-lg' />
          <Skeleton className='h-32 w-full rounded-lg' />
          <Skeleton className='h-32 w-full rounded-lg' />
        </div>
      </div>
    )
  }

  if (isError) {
    return (
      <div className='container mx-auto p-8 text-center'>
        <div className='text-red-500 space-y-2'>
          <h2 className='text-xl font-semibold'>Lỗi tải dữ liệu</h2>
          <p>Đã có lỗi xảy ra khi tải danh sách công việc được giao.</p>
        </div>
      </div>
    )
  }

  const totalOrderItems = orderItems?.length || 0
  const completedTasks =
    orderItems?.reduce((count, item) => {
      const completed = item.milestones.reduce((milestoneCount, milestone) => {
        return milestoneCount + milestone.maternityDressTasks.filter((task) => task.status === 'DONE').length
      }, 0)
      return count + completed
    }, 0) || 0

  const totalTasks =
    orderItems?.reduce((count, item) => {
      const total = item.milestones.reduce((milestoneCount, milestone) => {
        return milestoneCount + milestone.maternityDressTasks.length
      }, 0)
      return count + total
    }, 0) || 0

  return (
    <div className='container mx-auto p-4 md:p-8'>
      <div className='space-y-8'>
        <div className='text-center space-y-2'>
          <h1 className='text-3xl font-bold tracking-tight'>Công việc được giao</h1>
          <p className='text-muted-foreground'>
            Quản lý {totalOrderItems} sản phẩm được giao • {completedTasks}/{totalTasks} nhiệm vụ hoàn thành
          </p>
        </div>

        {totalOrderItems === 0 ? (
          <div className='text-center py-12'>
            <div className='text-muted-foreground space-y-2'>
              <h3 className='text-lg font-medium'>Chưa có công việc được giao</h3>
              <p>Bạn chưa được giao bất kỳ công việc nào.</p>
            </div>
          </div>
        ) : (
          <ProductTaskTracker
            productGroups={orderItems || []}
            onTaskStatusChange={handleTaskStatusChange}
            isUpdating={updateTaskStatusMutation.isPending}
          />
        )}
      </div>
    </div>
  )
}
