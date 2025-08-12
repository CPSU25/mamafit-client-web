import { useParams, useNavigate } from 'react-router-dom'
import { ArrowLeft, Package, DollarSign, MapPin, Ruler } from 'lucide-react'
import { Button } from '@/components/ui/button'
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card'
import { Badge } from '@/components/ui/badge'
import { Skeleton } from '@/components/ui/skeleton'
import { useStaffGetOrderTaskByOrderItemId } from '@/services/staff/staff-task.service'
import globalAPI from '@/apis/global.api'
import { useQuery } from '@tanstack/react-query'
import { OrderItemMilestoneTracker } from '@/pages/staff/manage-task/components/OrderItemMilestoneTracker'

export default function OrderItemDetailPage() {
  const { orderItemId } = useParams<{ orderItemId: string }>()
  const navigate = useNavigate()

  const { data: orderItemData, isLoading, isError } = useStaffGetOrderTaskByOrderItemId(orderItemId!)
  // Hook để lấy thông tin địa chỉ - sử dụng conditional query
  const { data: addressData, isLoading: isLoadingAddress } = useQuery({
    queryKey: ['address', orderItemData?.addressId],
    queryFn: () => globalAPI.getAddress(orderItemData!.addressId!),
    enabled: !!orderItemData?.addressId,
    select: (response) => response.data.data
  })

  if (!orderItemId) {
    return (
      <div className='container mx-auto p-8 text-center'>
        <h2 className='text-xl font-semibold text-red-500'>Order Item ID không hợp lệ</h2>
        <Button onClick={() => navigate('/system/staff/manage-task')} className='mt-4'>
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
        <Button onClick={() => navigate('/system/staff/manage-task')} className='mt-4'>
          Quay lại danh sách
        </Button>
      </div>
    )
  }

  const { preset, milestones, orderId, orderCode, measurement } = orderItemData

  const totalTasks = milestones.reduce((sum, milestone) => sum + milestone.maternityDressTasks.length, 0)
  const completedTasks = milestones.reduce(
    (sum, milestone) =>
      sum +
      milestone.maternityDressTasks.filter(
        (task) => task.status === 'DONE' || task.status === 'PASS' || task.status === 'FAIL'
      ).length,
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
          onClick={() => navigate('/system/staff/manage-task')}
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

      <div className='space-y-6'>
        {/* Top Row: Product Info, Measurements, Address */}
        <div className='grid grid-cols-1 lg:grid-cols-3 gap-6'>
          {/* Product Info */}
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
                    <span>Mã đơn hàng:</span>
                    <code className='text-xs bg-muted px-1 rounded'>{orderCode}</code>
                  </div>
                  <div className='flex items-center gap-2'>
                    <Package className='h-4 w-4 text-muted-foreground' />
                    <span>Status</span>
                    <code className='text-xs bg-muted px-1 rounded'>{orderItemData?.orderStatus}</code>
                  </div>

                  <div className='flex items-center gap-2'>
                    <Package className='h-4 w-4 text-muted-foreground' />
                    <span>Tên sản phẩm:</span>
                    <code className='text-xs bg-muted px-1 rounded'>{preset.styleName}</code>
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

          {/* Measurements */}
          <Card>
            <CardHeader>
              <CardTitle className='flex items-center gap-2'>
                <Ruler className='h-5 w-5' />
                Thông số đo cơ thể
              </CardTitle>
            </CardHeader>
            <CardContent className='space-y-3'>
              {measurement ? (
                <>
                  <div className='grid grid-cols-2 gap-2 text-sm'>
                    <div className='space-y-2'>
                      <div className='flex justify-between'>
                        <span className='text-muted-foreground'>Tuần thai:</span>
                        <span className='font-medium'>{measurement.weekOfPregnancy} tuần</span>
                      </div>
                      <div className='flex justify-between'>
                        <span className='text-muted-foreground'>Cân nặng:</span>
                        <span className='font-medium'>{measurement.weight} kg</span>
                      </div>
                      <div className='flex justify-between'>
                        <span className='text-muted-foreground'>Cổ:</span>
                        <span className='font-medium'>{measurement.neck} cm</span>
                      </div>
                      <div className='flex justify-between'>
                        <span className='text-muted-foreground'>Ngực:</span>
                        <span className='font-medium'>{measurement.bust} cm</span>
                      </div>
                      <div className='flex justify-between'>
                        <span className='text-muted-foreground'>Vòng ngực:</span>
                        <span className='font-medium'>{measurement.chestAround} cm</span>
                      </div>
                      <div className='flex justify-between'>
                        <span className='text-muted-foreground'>Áo khoác:</span>
                        <span className='font-medium'>{measurement.coat} cm</span>
                      </div>
                      <div className='flex justify-between'>
                        <span className='text-muted-foreground'>Bụng:</span>
                        <span className='font-medium'>{measurement.stomach} cm</span>
                      </div>
                    </div>
                    <div className='space-y-2'>
                      <div className='flex justify-between'>
                        <span className='text-muted-foreground'>Eo:</span>
                        <span className='font-medium'>{measurement.waist} cm</span>
                      </div>
                      <div className='flex justify-between'>
                        <span className='text-muted-foreground'>Eo quần:</span>
                        <span className='font-medium'>{measurement.pantsWaist} cm</span>
                      </div>
                      <div className='flex justify-between'>
                        <span className='text-muted-foreground'>Hông:</span>
                        <span className='font-medium'>{measurement.hip} cm</span>
                      </div>
                      <div className='flex justify-between'>
                        <span className='text-muted-foreground'>Đùi:</span>
                        <span className='font-medium'>{measurement.thigh} cm</span>
                      </div>
                      <div className='flex justify-between'>
                        <span className='text-muted-foreground'>Chiều dài váy:</span>
                        <span className='font-medium'>{measurement.dressLength} cm</span>
                      </div>
                      <div className='flex justify-between'>
                        <span className='text-muted-foreground'>Dài tay:</span>
                        <span className='font-medium'>{measurement.sleeveLength} cm</span>
                      </div>
                      <div className='flex justify-between'>
                        <span className='text-muted-foreground'>Vai:</span>
                        <span className='font-medium'>{measurement.shoulderWidth} cm</span>
                      </div>
                    </div>
                  </div>

                  {measurement.isLocked && (
                    <div className='mt-3 p-2 bg-yellow-50 border border-yellow-200 rounded-md'>
                      <p className='text-xs text-yellow-700 flex items-center gap-1'>
                        <span>🔒</span>
                        Thông số đã được khóa và không thể chỉnh sửa
                      </p>
                    </div>
                  )}
                </>
              ) : (
                <div className='text-center py-4 text-muted-foreground'>
                  <Ruler className='h-8 w-8 mx-auto mb-2 opacity-50' />
                  <p className='text-sm'>Chưa có thông số đo cơ thể</p>
                </div>
              )}
            </CardContent>
          </Card>

          {/* Address */}
          <Card>
            <CardHeader>
              <CardTitle className='flex items-center gap-2'>
                <MapPin className='h-5 w-5' />
                Địa chỉ giao hàng
              </CardTitle>
            </CardHeader>
            <CardContent>
              {isLoadingAddress ? (
                <div className='space-y-2'>
                  <Skeleton className='h-4 w-full' />
                  <Skeleton className='h-4 w-3/4' />
                  <Skeleton className='h-4 w-1/2' />
                </div>
              ) : addressData ? (
                <div className='space-y-3 text-sm'>
                  <div>
                    <p className='font-medium text-gray-900'>{addressData.street}</p>
                  </div>
                  <div className='space-y-1'>
                    <p className='text-gray-600'>
                      <span className='font-medium'>Phường/Xã:</span> {addressData.ward}
                    </p>
                    <p className='text-gray-600'>
                      <span className='font-medium'>Quận/Huyện:</span> {addressData.district}
                    </p>
                    <p className='text-gray-600'>
                      <span className='font-medium'>Tỉnh/Thành phố:</span> {addressData.province}
                    </p>
                  </div>

                  {addressData.isDefault && (
                    <div className='mt-3 p-2 bg-blue-50 border border-blue-200 rounded-md'>
                      <p className='text-xs text-blue-700 flex items-center gap-1'>
                        <span>⭐</span>
                        Địa chỉ mặc định
                      </p>
                    </div>
                  )}

                  <div className='mt-3 pt-3 border-t text-xs text-muted-foreground'>
                    <p>
                      Tọa độ: {addressData.latitude}, {addressData.longitude}
                    </p>
                  </div>
                </div>
              ) : (
                <div className='text-center py-4 text-muted-foreground'>
                  <MapPin className='h-8 w-8 mx-auto mb-2 opacity-50' />
                  <p className='text-sm'>Không có thông tin địa chỉ</p>
                </div>
              )}
            </CardContent>
          </Card>
        </div>

        {/* Bottom Row: Milestone Tracker */}
        <div className='w-full'>
          <OrderItemMilestoneTracker
            milestones={milestones}
            orderItemId={orderItemId}
            orderId={orderId}
            orderStatus={orderItemData?.orderStatus}
          />
        </div>
      </div>
    </div>
  )
}
