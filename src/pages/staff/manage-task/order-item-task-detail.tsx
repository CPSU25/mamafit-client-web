import { useParams, useNavigate } from 'react-router-dom'
import { ArrowLeft, Package, DollarSign, MapPin, Ruler, Clock, Tag, AlertCircle } from 'lucide-react'
import { Button } from '@/components/ui/button'
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card'
import { Badge } from '@/components/ui/badge'
import { Skeleton } from '@/components/ui/skeleton'
import { useStaffGetOrderTaskByOrderItemId } from '@/services/staff/staff-task.service'
import globalAPI from '@/apis/global.api'
import { useQuery } from '@tanstack/react-query'
import { OrderItemMilestoneTracker } from '@/pages/staff/manage-task/components/OrderItemMilestoneTracker'
import dayjs from 'dayjs'

import { AddOnOption } from './tasks/types'
import { ProductImageViewer } from '@/components/ui/image-viewer'
import { getStatusColor, getStatusLabel } from '@/pages/admin/manage-order/data/data'

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
        <h2 className='text-xl font-semibold text-red-500'>Sản phẩm không hợp lệ</h2>
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
          <h2 className='text-xl font-semibold'>Không thể tải thông tin sản phẩm trong đơn hàng</h2>
          <p>Đã có lỗi xảy ra khi tải thông tin chi tiết.</p>
        </div>
        <Button onClick={() => navigate('/system/staff/manage-task')} className='mt-4'>
          Quay lại danh sách
        </Button>
      </div>
    )
  }

  const { preset, milestones, orderId, orderCode, measurement, orderItem, maternityDressDetail } = orderItemData

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

  const totalAddOnPrice =
    orderItem?.addOnOptions?.reduce((sum: number, addon: AddOnOption) => sum + addon.price, 0) || 0

  const basePrice = preset?.price ?? maternityDressDetail?.price ?? 0
  const totalPrice = basePrice + totalAddOnPrice

  const displayName = preset?.styleName ?? maternityDressDetail?.name ?? '—'
  const displaySku = preset?.sku ?? maternityDressDetail?.sku ?? '—'
  const displayType = preset?.type ?? 'READY_TO_BUY'
  const displayImage = preset?.images?.[0] ?? maternityDressDetail?.image?.[0] ?? ''

  return (
    <div className='container mx-auto p-4 md:p-8 space-y-6'>
      <div className='bg-gradient-to-r from-blue-50 to-indigo-50 rounded-xl p-6 border border-blue-200'>
        <div className='flex items-center justify-between'>
          <div className='flex items-center gap-4'>
            <Button
              variant='ghost'
              size='sm'
              onClick={() => navigate('/system/staff/manage-task')}
              className='flex items-center gap-2 hover:bg-blue-100'
            >
              <ArrowLeft className='h-4 w-4' />
              Quay lại
            </Button>
            <div>
              <h1 className='text-3xl font-bold text-gray-900'>Chi tiết Order Item</h1>
              <div className='flex items-center gap-4 mt-2'>
                <Badge
                  variant='secondary'
                  className={`${getStatusColor(orderItemData.orderStatus, 'order')} text-xs font-medium px-4 py-2 bg-white/90 dark:bg-white/80 text-violet-800 shadow-sm`}
                >
                  {getStatusLabel(orderItemData.orderStatus, 'order')}
                </Badge>
                <span className='text-muted-foreground'>
                  {completedTasks}/{totalTasks} nhiệm vụ hoàn thành
                </span>
                <span className='text-muted-foreground'>•</span>
                <span className='text-muted-foreground'>{overallProgress}% tiến độ</span>
              </div>
            </div>
          </div>

          <div className='relative'>
            <div className='w-20 h-20 rounded-full bg-blue-100 flex items-center justify-center'>
              <div className='w-16 h-16 rounded-full bg-white flex items-center justify-center'>
                <span className='text-xl font-bold text-blue-600'>{overallProgress}%</span>
              </div>
            </div>
            <div
              className='absolute inset-0 rounded-full border-4 border-blue-500'
              style={{
                background: `conic-gradient(from 0deg, #3b82f6 ${overallProgress * 3.6}deg, #e5e7eb ${overallProgress * 3.6}deg)`
              }}
            />
          </div>
        </div>
      </div>

      <div className='space-y-6'>
        <div className='grid grid-cols-1 lg:grid-cols-3 gap-6'>
          <Card className='shadow-lg border-0 bg-gradient-to-br from-white to-gray-50'>
            <CardHeader className='pb-4'>
              <CardTitle className='flex items-center gap-2 text-lg'>
                <Package className='h-5 w-5 text-blue-600' />
                Thông tin sản phẩm
              </CardTitle>
            </CardHeader>
            <CardContent className='space-y-4'>
              <div className='aspect-square w-full rounded-xl overflow-hidden shadow-md '>
                <ProductImageViewer
                  src={displayImage}
                  alt={displayName}
                  containerClassName='aspect-square w-110 rounded-lg border-2 border-violet-200 dark:border-violet-700'
                  imgClassName='px-2'
                  fit='contain'
                />
              </div>

              <div className='space-y-4'>
                <div className='text-center'>
                  <h3 className='font-bold text-xl text-gray-900 mb-2'>{displayName}</h3>
                  <div className='flex items-center justify-center gap-2'>
                    <Badge variant='secondary' className='px-3 py-1'>
                      {displayType}
                    </Badge>
                    <Badge variant='outline' className='px-3 py-1'>
                      SKU: {displaySku}
                    </Badge>
                  </div>

                  {maternityDressDetail && !preset && (
                    <div className='mt-3 space-y-2'>
                      <div className='flex items-center justify-center gap-2'>
                        <Badge variant='outline' className='px-2 py-1 text-xs'>
                          Size: {maternityDressDetail.size}
                        </Badge>
                        <Badge variant='outline' className='px-2 py-1 text-xs'>
                          Màu: {maternityDressDetail.color}
                        </Badge>
                      </div>
                      <div className='text-sm text-muted-foreground'>Số lượng: {maternityDressDetail.quantity}</div>
                    </div>
                  )}
                </div>

                <div className='bg-gradient-to-r from-green-50 to-emerald-50 p-4 rounded-lg border border-green-200'>
                  <div className='text-center'>
                    <div className='flex items-center justify-center gap-2 mb-2'>
                      <DollarSign className='h-5 w-5 text-green-600' />
                      <span className='text-2xl font-bold text-green-700'>
                        {new Intl.NumberFormat('vi-VN', {
                          style: 'currency',
                          currency: 'VND'
                        }).format(totalPrice)}
                      </span>
                    </div>
                    {totalAddOnPrice > 0 && (
                      <div className='text-sm text-green-600'>
                        <span>
                          Giá gốc:{' '}
                          {new Intl.NumberFormat('vi-VN', { style: 'currency', currency: 'VND' }).format(basePrice)}
                        </span>
                        <br />
                        <span>
                          Add-ons: +
                          {new Intl.NumberFormat('vi-VN', { style: 'currency', currency: 'VND' }).format(
                            totalAddOnPrice
                          )}
                        </span>
                      </div>
                    )}
                  </div>
                </div>

                <div className='space-y-3 text-sm bg-gray-50 p-3 rounded-lg'>
                  <div className='flex items-center gap-2'>
                    <Package className='h-4 w-4 text-muted-foreground' />
                    <span className='font-medium'>Mã đơn hàng:</span>
                    <code className='text-xs bg-white px-2 py-1 rounded border'>{orderCode}</code>
                  </div>
                  <div className='flex items-center gap-2'>
                    <Tag className='h-4 w-4 text-muted-foreground' />
                    <span className='font-medium'>Số lượng:</span>
                    <Badge variant='outline'>{orderItemData.orderItem?.quantity || 1}</Badge>
                  </div>
                  <div className='flex items-center gap-2'>
                    <Clock className='h-4 w-4 text-muted-foreground' />
                    <span className='font-medium'>Ngày tạo:</span>
                    <span className='text-xs'>
                      {dayjs(orderItemData.orderItem?.createdAt).format('DD/MM/YYYY HH:mm')}
                    </span>
                  </div>
                </div>
              </div>
            </CardContent>
          </Card>

          <Card className='shadow-lg border-0 bg-gradient-to-br from-white to-purple-50'>
            <CardHeader className='pb-4'>
              <CardTitle className='flex items-center gap-2 text-lg'>
                <Tag className='h-5 w-5 text-purple-600' />
                Tùy chọn bổ sung
                {orderItem?.addOnOptions && orderItem.addOnOptions.length > 0 && (
                  <Badge variant='secondary' className='ml-auto'>
                    {orderItem.addOnOptions.length}
                  </Badge>
                )}
              </CardTitle>
            </CardHeader>
            <CardContent className='space-y-4'>
              {orderItem?.addOnOptions && orderItem.addOnOptions.length > 0 ? (
                <div className='space-y-4'>
                  {orderItem.addOnOptions.map((addon) => (
                    <div
                      key={addon.id}
                      className='bg-white p-4 rounded-lg border border-purple-200 shadow-md hover:shadow-lg transition-shadow duration-200'
                    >
                      <div className='flex items-start justify-between mb-3'>
                        <div className='flex-1'>
                          <h4 className='font-bold text-gray-900 text-base mb-1'>{addon.name}</h4>
                          <p className='text-sm text-gray-600 leading-relaxed'>{addon.description}</p>
                        </div>
                        <Badge
                          variant='outline'
                          className='ml-3 px-3 py-1 bg-green-50 text-green-700 border-green-200 font-semibold'
                        >
                          +{new Intl.NumberFormat('vi-VN', { style: 'currency', currency: 'VND' }).format(addon.price)}
                        </Badge>
                      </div>

                      <div className='space-y-2'>
                        <div className='flex items-center gap-2'>
                          <span className='text-xs font-medium text-gray-500'>Vị trí:</span>
                          <Badge
                            variant='secondary'
                            className='px-2 py-1 text-xs bg-purple-100 text-purple-700 border-purple-200'
                          >
                            {addon.position.name}
                          </Badge>
                        </div>

                        <div className='flex items-center gap-2'>
                          <span className='text-xs font-medium text-gray-500'>Kích thước:</span>
                          <Badge
                            variant='secondary'
                            className='px-2 py-1 text-xs bg-blue-100 text-blue-700 border-blue-200'
                          >
                            {addon.size.name}
                          </Badge>
                        </div>

                        <div className='flex items-center gap-2'>
                          <span className='text-xs font-medium text-gray-500'>Loại dịch vụ:</span>
                          <Badge
                            variant='outline'
                            className='px-2 py-1 text-xs bg-gray-100 text-gray-700 border-gray-200'
                          >
                            {addon.itemServiceType}
                          </Badge>
                        </div>
                      </div>

                      <div className='mt-3 pt-3 border-t border-gray-100 text-xs text-gray-400'>
                        <div className='flex items-center justify-between'>
                          <span>Tạo bởi: {addon.createdBy}</span>
                          <span>Cập nhật: {dayjs(addon.updatedAt).format('DD/MM/YYYY')}</span>
                        </div>
                      </div>
                    </div>
                  ))}
                </div>
              ) : (
                <div className='text-center py-8 text-muted-foreground'>
                  <Tag className='h-12 w-12 mx-auto mb-3 opacity-50' />
                  <p className='text-sm'>Không có tùy chọn bổ sung</p>
                </div>
              )}
            </CardContent>
          </Card>

          <Card className='shadow-lg border-0 bg-gradient-to-br from-white to-orange-50'>
            <CardHeader className='pb-4'>
              <CardTitle className='flex items-center gap-2 text-lg'>
                <Ruler className='h-5 w-5 text-orange-600' />
                Thông số đo cơ thể
              </CardTitle>
            </CardHeader>
            <CardContent className='space-y-4'>
              {measurement ? (
                <>
                  <div className='grid grid-cols-2 gap-3 text-sm'>
                    <div className='space-y-2'>
                      <div className='flex justify-between items-center p-2 bg-orange-50 rounded'>
                        <span className='text-muted-foreground'>Tuần thai:</span>
                        <span className='font-semibold text-orange-700'>{measurement.weekOfPregnancy} tuần</span>
                      </div>
                      <div className='flex justify-between items-center p-2 bg-orange-50 rounded'>
                        <span className='text-muted-foreground'>Cân nặng:</span>
                        <span className='font-semibold text-orange-700'>{measurement.weight} kg</span>
                      </div>
                      <div className='flex justify-between items-center p-2 bg-orange-50 rounded'>
                        <span className='text-muted-foreground'>Ngực:</span>
                        <span className='font-semibold text-orange-700'>{measurement.bust} cm</span>
                      </div>
                      <div className='flex justify-between items-center p-2 bg-orange-50 rounded'>
                        <span className='text-muted-foreground'>Bụng:</span>
                        <span className='font-semibold text-orange-700'>{measurement.stomach} cm</span>
                      </div>
                      <div className='flex justify-between items-center p-2 bg-orange-50 rounded'>
                        <span className='text-muted-foreground'>Eo:</span>
                        <span className='font-semibold text-orange-700'>{measurement.waist} cm</span>
                      </div>
                      <div className='flex justify-between items-center p-2 bg-orange-50 rounded'>
                        <span className='text-muted-foreground'>Hông:</span>
                        <span className='font-semibold text-orange-700'>{measurement.hip} cm</span>
                      </div>
                    </div>
                    <div className='space-y-2'>
                      <div className='flex justify-between items-center p-2 bg-orange-50 rounded'>
                        <span className='text-muted-foreground'>Cổ:</span>
                        <span className='font-semibold text-orange-700'>{measurement.neck} cm</span>
                      </div>
                      <div className='flex justify-between items-center p-2 bg-orange-50 rounded'>
                        <span className='text-muted-foreground'>Vai:</span>
                        <span className='font-semibold text-orange-700'>{measurement.shoulderWidth} cm</span>
                      </div>
                      <div className='flex justify-between items-center p-2 bg-orange-50 rounded'>
                        <span className='text-muted-foreground'>Dài tay:</span>
                        <span className='font-semibold text-orange-700'>{measurement.sleeveLength} cm</span>
                      </div>
                      <div className='flex justify-between items-center p-2 bg-orange-50 rounded'>
                        <span className='text-muted-foreground'>Chiều dài váy:</span>
                        <span className='font-semibold text-orange-700'>{measurement.dressLength} cm</span>
                      </div>
                      <div className='flex justify-between items-center p-2 bg-orange-50 rounded'>
                        <span className='text-muted-foreground'>Đùi:</span>
                        <span className='font-semibold text-orange-700'>{measurement.thigh} cm</span>
                      </div>
                      <div className='flex justify-between items-center p-2 bg-orange-50 rounded'>
                        <span className='text-muted-foreground'>Eo quần:</span>
                        <span className='font-semibold text-orange-700'>{measurement.pantsWaist} cm</span>
                      </div>
                    </div>
                  </div>

                  {measurement.isLocked && (
                    <div className='mt-4 p-3 bg-yellow-50 border border-yellow-200 rounded-lg'>
                      <div className='flex items-center gap-2'>
                        <AlertCircle className='h-4 w-4 text-yellow-600' />
                        <p className='text-xs text-yellow-700 font-medium'>
                          Thông số đã được khóa và không thể chỉnh sửa
                        </p>
                      </div>
                    </div>
                  )}
                </>
              ) : (
                <div className='text-center py-8 text-muted-foreground'>
                  <Ruler className='h-12 w-12 mx-auto mb-3 opacity-50' />
                  <p className='text-sm'>Chưa có thông số đo cơ thể</p>
                </div>
              )}
            </CardContent>
          </Card>
        </div>

        <Card className='shadow-lg border-0 bg-gradient-to-br from-white to-green-50'>
          <CardHeader>
            <CardTitle className='flex items-center gap-2 text-lg'>
              <MapPin className='h-5 w-5 text-green-600' />
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
              <div className='space-y-4'>
                <div className='bg-green-50 p-4 rounded-lg border border-green-200'>
                  <p className='font-semibold text-gray-900 text-lg mb-2'>{addressData.street}</p>
                  <div className='grid grid-cols-1 md:grid-cols-3 gap-3 text-sm'>
                    <div className='flex items-center gap-2'>
                      <span className='text-muted-foreground'>Phường/Xã:</span>
                      <span className='font-medium text-green-700'>{addressData.ward}</span>
                    </div>
                    <div className='flex items-center gap-2'>
                      <span className='text-muted-foreground'>Quận/Huyện:</span>
                      <span className='font-medium text-green-700'>{addressData.district}</span>
                    </div>
                    <div className='flex items-center gap-2'>
                      <span className='text-muted-foreground'>Tỉnh/Thành phố:</span>
                      <span className='font-medium text-green-700'>{addressData.province}</span>
                    </div>
                  </div>
                </div>

                <div className='flex items-center justify-between'>
                  {addressData.isDefault && (
                    <Badge className='bg-blue-100 text-blue-700 border-blue-200 px-3 py-1'>
                      <span className='mr-1'>⭐</span>
                      Địa chỉ mặc định
                    </Badge>
                  )}
                  <div className='text-xs text-muted-foreground'>
                    Tọa độ: {addressData.latitude}, {addressData.longitude}
                  </div>
                </div>
              </div>
            ) : (
              <div className='text-center py-8 text-muted-foreground'>
                <MapPin className='h-12 w-12 mx-auto mb-3 opacity-50' />
                <p className='text-sm'>Không có thông tin địa chỉ</p>
              </div>
            )}
          </CardContent>
        </Card>

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
