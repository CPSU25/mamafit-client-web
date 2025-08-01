import { useParams, useNavigate } from 'react-router-dom'
import { ArrowLeft, Package, DollarSign } from 'lucide-react'
import { Button } from '@/components/ui/button'
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card'
import { Badge } from '@/components/ui/badge'
import { Skeleton } from '@/components/ui/skeleton'
import { useGetOrderTaskByOrderItemId } from '@/services/global/order-task.service'
import { OrderItemMilestoneTracker } from '@/pages/staff/manage-task/components/OrderItemMilestoneTracker'

export default function OrderItemDetailPage() {
  const { orderItemId } = useParams<{ orderItemId: string }>()
  const navigate = useNavigate()

  const { data: orderItemData, isLoading, isError } = useGetOrderTaskByOrderItemId(orderItemId!)

  if (!orderItemId) {
    return (
      <div className='container mx-auto p-8 text-center'>
        <h2 className='text-xl font-semibold text-red-500'>Order Item ID không hợp lệ</h2>
        <Button onClick={() => navigate('/system/factory-staff/manage-task')} className='mt-4'>
          Quay lại danh sách
        </Button>
      </div>
    )
  }

  if (isLoading) {
    return (
      <div className='container mx-auto p-4 md:p-8 space-y-6'>
        <div className='flex items-center gap-4'>
          <Skeleton className='h-10 w-10 rounded' />
          <Skeleton className='h-8 w-64' />
        </div>
        <div className='grid grid-cols-1 lg:grid-cols-3 gap-6'>
          <div className='lg:col-span-1'>
            <Skeleton className='h-96 w-full rounded-lg' />
          </div>
          <div className='lg:col-span-2'>
            <Skeleton className='h-96 w-full rounded-lg' />
          </div>
        </div>
      </div>
    )
  }

  if (isError || !orderItemData) {
    return (
      <div className='container mx-auto p-8 text-center'>
        <div className='text-red-500 space-y-2'>
          <h2 className='text-xl font-semibold'>Không thể tải thông tin Order Item</h2>
          <p>Đã có lỗi xảy ra khi tải thông tin chi tiết.</p>
        </div>
        <Button onClick={() => navigate('/system/factory-staff/manage-task')} className='mt-4'>
          Quay lại danh sách
        </Button>
      </div>
    )
  }

  const { preset, milestones } = orderItemData
  const totalTasks = milestones.reduce((sum, milestone) => sum + milestone.maternityDressTasks.length, 0)
  const completedTasks = milestones.reduce(
    (sum, milestone) => sum + milestone.maternityDressTasks.filter((task) => task.status === 'DONE').length,
    0
  )
  const overallProgress = totalTasks > 0 ? Math.round((completedTasks / totalTasks) * 100) : 0

  return (
    <div className='container mx-auto p-4 md:p-8 space-y-6'>
      {/* Header */}
      <div className='flex items-center gap-4'>
        <Button
          variant='ghost'
          size='sm'
          onClick={() => navigate('/system/factory-staff/manage-task')}
          className='flex items-center gap-2'
        >
          <ArrowLeft className='h-4 w-4' />
          Quay lại
        </Button>
        <div>
          <h1 className='text-2xl font-bold'>Chi tiết Order Item</h1>
          <p className='text-muted-foreground'>
            {completedTasks}/{totalTasks} nhiệm vụ hoàn thành • {overallProgress}% tiến độ
          </p>
        </div>
      </div>

      <div className='grid grid-cols-1 lg:grid-cols-3 gap-6'>
        {/* Order Item Info */}
        <div className='lg:col-span-1'>
          <Card>
            <CardHeader>
              <CardTitle className='flex items-center gap-2'>
                <Package className='h-5 w-5' />
                Thông tin sản phẩm
              </CardTitle>
            </CardHeader>
            <CardContent className='space-y-4'>
              <div className='aspect-square w-full'>
                <img src={preset.images[0]} alt={preset.styleName} className='w-full h-full object-cover rounded-lg' />
              </div>

              <div className='space-y-3'>
                <div>
                  <h3 className='font-semibold text-lg'>{preset.styleName}</h3>
                  <Badge variant='secondary' className='mt-1'>
                    {preset.type}
                  </Badge>
                </div>

                <div className='space-y-2 text-sm'>
                  <div className='flex items-center gap-2'>
                    <DollarSign className='h-4 w-4 text-muted-foreground' />
                    <span className='font-medium'>
                      {new Intl.NumberFormat('vi-VN', {
                        style: 'currency',
                        currency: 'VND'
                      }).format(preset.price)}
                    </span>
                  </div>

                  <div className='flex items-center gap-2'>
                    <Package className='h-4 w-4 text-muted-foreground' />
                    <span>Order Item ID:</span>
                    <code className='text-xs bg-muted px-1 rounded'>{orderItemId}</code>
                  </div>

                  <div className='flex items-center gap-2'>
                    <Package className='h-4 w-4 text-muted-foreground' />
                    <span>Preset ID:</span>
                    <code className='text-xs bg-muted px-1 rounded'>{preset.id}</code>
                  </div>
                </div>

                <div className='pt-2 border-t'>
                  <div className='flex justify-between items-center'>
                    <span className='text-sm text-muted-foreground'>Tiến độ tổng thể</span>
                    <Badge variant={overallProgress === 100 ? 'default' : 'secondary'}>{overallProgress}%</Badge>
                  </div>
                  <div className='w-full bg-muted rounded-full h-2 mt-2'>
                    <div
                      className='bg-primary h-2 rounded-full transition-all duration-300'
                      style={{ width: `${overallProgress}%` }}
                    />
                  </div>
                </div>
              </div>
            </CardContent>
          </Card>
        </div>

        {/* Milestone Tracker */}
        <div className='lg:col-span-2'>
          <OrderItemMilestoneTracker milestones={milestones} orderItemId={orderItemId} />
        </div>
      </div>
    </div>
  )
}
