import { BranchOrderType } from '@/@types/branch-order.types'
import { OrderStatus } from '@/@types/manage-order.types'
import { Badge } from '@/components/ui/badge'
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card'
import { Separator } from '@/components/ui/separator'
import { Button } from '@/components/ui/button'
import { Avatar, AvatarFallback, AvatarImage } from '@/components/ui/avatar'
import { Skeleton } from '@/components/ui/skeleton'
import { ProductImageViewer } from '@/components/ui/image-viewer'
import { Package, User, CreditCard, Truck, Calendar, X, ExternalLink, Mail, Phone } from 'lucide-react'
import { format } from 'date-fns'
import { useNavigate } from 'react-router-dom'
import { useGetUserById } from '@/services/admin/manage-user.service'

interface BranchOrderDetailSidebarProps {
  order: BranchOrderType | null
  isOpen: boolean
  onClose: () => void
}

export function BranchOrderDetailSidebar({ order, isOpen, onClose }: BranchOrderDetailSidebarProps) {
  const navigate = useNavigate()
  console.log(order)
  // Fetch user information
  const { data: userData, isLoading: userLoading } = useGetUserById(order?.userId || '')

  if (!isOpen || !order) return null

  const getStatusBadge = (status: OrderStatus) => {
    const statusColors = {
      [OrderStatus.CREATED]: 'bg-gray-100 text-gray-800 dark:bg-gray-800 dark:text-gray-200',
      [OrderStatus.CONFIRMED]: 'bg-blue-100 text-blue-800 dark:bg-blue-800 dark:text-blue-200',
      [OrderStatus.IN_PROGRESS]: 'bg-yellow-100 text-yellow-800 dark:bg-yellow-800 dark:text-yellow-200',
      [OrderStatus.PACKAGING]: 'bg-purple-100 text-purple-800 dark:bg-purple-800 dark:text-purple-200',
      [OrderStatus.DELIVERING]: 'bg-orange-100 text-orange-800 dark:bg-orange-800 dark:text-orange-200',
      [OrderStatus.PICKUP_IN_PROGRESS]: 'bg-blue-100 text-blue-800 dark:bg-blue-800 dark:text-blue-200',
      [OrderStatus.RECEIVED_AT_BRANCH]: 'bg-green-100 text-green-800 dark:bg-green-800 dark:text-green-200',
      [OrderStatus.COMPLETED]: 'bg-green-100 text-green-800 dark:bg-green-800 dark:text-green-200',
      [OrderStatus.CANCELLED]: 'bg-red-100 text-red-800 dark:bg-red-800 dark:text-red-200',
      [OrderStatus.RETURNED]: 'bg-red-100 text-red-800 dark:bg-red-800 dark:text-red-200',
      [OrderStatus.AWAITING_PAID_REST]: 'bg-yellow-100 text-yellow-800 dark:bg-yellow-800 dark:text-yellow-200',
      [OrderStatus.AWAITING_PAID_WARRANTY]: 'bg-yellow-100 text-yellow-800 dark:bg-yellow-800 dark:text-yellow-200'
    }

    const statusLabels = {
      [OrderStatus.CREATED]: 'Đã tạo',
      [OrderStatus.CONFIRMED]: 'Đã xác nhận',
      [OrderStatus.IN_PROGRESS]: 'Đang xử lý',
      [OrderStatus.PACKAGING]: 'Đang đóng gói',
      [OrderStatus.DELIVERING]: 'Đang giao hàng',
      [OrderStatus.PICKUP_IN_PROGRESS]: 'Đang lấy hàng',
      [OrderStatus.RECEIVED_AT_BRANCH]: 'Đã nhận tại cửa hàng',
      [OrderStatus.COMPLETED]: 'Hoàn thành',
      [OrderStatus.CANCELLED]: 'Đã hủy',
      [OrderStatus.RETURNED]: 'Đã trả hàng',
      [OrderStatus.AWAITING_PAID_REST]: 'Chờ thanh toán còn lại',
      [OrderStatus.AWAITING_PAID_WARRANTY]: 'Chờ thanh toán bảo hành'
    }

    return <Badge className={`${statusColors[status]} font-medium`}>{statusLabels[status]}</Badge>
  }

  const handleNavigateToDetail = () => {
    navigate(`/system/branch/manage-branch-order/${order.id}`)
  }

  return (
    <div className='fixed top-0 right-0 h-full w-80 bg-background border-l border-border p-6 overflow-y-auto z-50 shadow-lg'>
      {/* Header with close button */}
      <div className='flex items-center justify-between mb-4'>
        <div className='flex items-center gap-2'>
          <Package className='h-5 w-5 text-violet-600' />
          <h2 className='text-lg font-semibold'>Chi tiết đơn hàng</h2>
        </div>
        <Button variant='ghost' size='sm' onClick={onClose}>
          <X className='h-4 w-4' />
        </Button>
      </div>

      <div className='space-y-6'>
        {/* Order Code */}
        <div>
          <Badge variant='outline' className='font-mono text-sm'>
            #{order.code}
          </Badge>
        </div>

        <Separator />

        {/* Navigate to Detail Page Button */}
        <Button onClick={handleNavigateToDetail} className='w-full bg-violet-600 hover:bg-violet-700 text-white'>
          <ExternalLink className='h-4 w-4 mr-2' />
          Xem chi tiết đầy đủ
        </Button>

        <Separator />

        {/* Order Status */}
        <Card>
          <CardHeader className='pb-3'>
            <CardTitle className='text-sm flex items-center gap-2'>
              <Package className='h-4 w-4' />
              Trạng thái đơn hàng
            </CardTitle>
          </CardHeader>
          <CardContent className='space-y-3'>
            <div className='flex justify-between items-center'>
              <span className='text-sm text-muted-foreground'>Trạng thái:</span>
              {getStatusBadge(order.status)}
            </div>
            <div className='flex justify-between items-center'>
              <span className='text-sm text-muted-foreground'>Loại đơn:</span>
              <Badge variant='secondary'>
                {order.type === 'NORMAL' ? 'Đơn thường' : order.type === 'WARRANTY' ? 'Bảo hành' : 'Thiết kế'}
              </Badge>
            </div>
          </CardContent>
        </Card>

        {/* Customer Info - View Only */}
        <Card>
          <CardHeader className='pb-3'>
            <CardTitle className='text-sm flex items-center gap-2'>
              <User className='h-4 w-4' />
              Thông tin khách hàng
            </CardTitle>
          </CardHeader>
          <CardContent className='space-y-3'>
            {userLoading ? (
              <div className='space-y-2'>
                <Skeleton className='h-4 w-32' />
                <Skeleton className='h-4 w-48' />
                <Skeleton className='h-4 w-40' />
              </div>
            ) : userData?.data ? (
              <div className='space-y-3'>
                <div className='flex items-center gap-3'>
                  <Avatar className='h-8 w-8'>
                    <AvatarImage
                      src={userData.data.profilePicture || undefined}
                      alt={userData.data.fullName || 'User Avatar'}
                    />
                    <AvatarFallback>{userData.data.fullName?.charAt(0).toUpperCase() || 'U'}</AvatarFallback>
                  </Avatar>
                  <div>
                    <div className='font-medium text-sm'>{userData.data.fullName || 'Chưa cập nhật'}</div>
                  </div>
                </div>
                <div className='flex items-center gap-2 text-sm'>
                  <Mail className='h-3 w-3 text-muted-foreground' />
                  <span className='text-muted-foreground'>{userData.data.userEmail}</span>
                </div>
                {userData.data.phoneNumber && (
                  <div className='flex items-center gap-2 text-sm'>
                    <Phone className='h-3 w-3 text-muted-foreground' />
                    <span className='text-muted-foreground'>{userData.data.phoneNumber}</span>
                  </div>
                )}
              </div>
            ) : (
              <div className='text-sm text-muted-foreground'>Không thể tải thông tin khách hàng</div>
            )}
          </CardContent>
        </Card>

        {/* Payment Info */}
        <Card>
          <CardHeader className='pb-3'>
            <CardTitle className='text-sm flex items-center gap-2'>
              <CreditCard className='h-4 w-4' />
              Thông tin thanh toán
            </CardTitle>
          </CardHeader>
          <CardContent className='space-y-3'>
            <div className='flex justify-between items-center'>
              <span className='text-sm text-muted-foreground'>Tổng tiền:</span>
              <span className='font-bold text-green-600'>
                {new Intl.NumberFormat('vi-VN', {
                  style: 'currency',
                  currency: 'VND'
                }).format(order.totalAmount || 0)}
              </span>
            </div>
            <div className='flex justify-between items-center'>
              <span className='text-sm text-muted-foreground'>Đã thanh toán:</span>
              <span className='font-medium'>
                {new Intl.NumberFormat('vi-VN', {
                  style: 'currency',
                  currency: 'VND'
                }).format(order.totalPaid || 0)}
              </span>
            </div>
            {order.paymentMethod && (
              <div className='flex justify-between items-center'>
                <span className='text-sm text-muted-foreground'>Phương thức:</span>
                <Badge variant='outline'>{order.paymentMethod === 'CASH' ? 'Tiền mặt' : 'Chuyển khoản'}</Badge>
              </div>
            )}
          </CardContent>
        </Card>

        {/* Delivery Info */}
        <Card>
          <CardHeader className='pb-3'>
            <CardTitle className='text-sm flex items-center gap-2'>
              <Truck className='h-4 w-4' />
              Thông tin giao hàng
            </CardTitle>
          </CardHeader>
          <CardContent className='space-y-3'>
            {order.deliveryMethod && (
              <div className='flex justify-between items-center'>
                <span className='text-sm text-muted-foreground'>Phương thức:</span>
                <Badge variant='outline'>
                  {order.deliveryMethod === 'DELIVERY' ? 'Giao hàng' : 'Lấy tại cửa hàng'}
                </Badge>
              </div>
            )}
            {order.shippingFee && (
              <div className='flex justify-between items-center'>
                <span className='text-sm text-muted-foreground'>Phí vận chuyển:</span>
                <span className='font-medium'>
                  {new Intl.NumberFormat('vi-VN', {
                    style: 'currency',
                    currency: 'VND'
                  }).format(order.shippingFee)}
                </span>
              </div>
            )}
            {order.trackingOrderCode && (
              <div className='flex justify-between items-center'>
                <span className='text-sm text-muted-foreground'>Mã vận đơn:</span>
                <Badge variant='outline' className='font-mono text-xs'>
                  {order.trackingOrderCode}
                </Badge>
              </div>
            )}
          </CardContent>
        </Card>

        {/* Dates */}
        <Card>
          <CardHeader className='pb-3'>
            <CardTitle className='text-sm flex items-center gap-2'>
              <Calendar className='h-4 w-4' />
              Thời gian
            </CardTitle>
          </CardHeader>
          <CardContent className='space-y-3'>
            <div className='flex justify-between items-center'>
              <span className='text-sm text-muted-foreground'>Ngày tạo:</span>
              <span className='text-sm font-medium'>{format(new Date(order.createdAt), 'dd/MM/yyyy HH:mm')}</span>
            </div>
            <div className='flex justify-between items-center'>
              <span className='text-sm text-muted-foreground'>Cập nhật:</span>
              <span className='text-sm font-medium'>{format(new Date(order.updatedAt), 'dd/MM/yyyy HH:mm')}</span>
            </div>
            {order.receivedAtBranch && (
              <div className='flex justify-between items-center'>
                <span className='text-sm text-muted-foreground'>Đã nhận tại cửa hàng:</span>
                <span className='text-sm font-medium text-green-600'>
                  {format(new Date(order.receivedAtBranch), 'dd/MM/yyyy HH:mm')}
                </span>
              </div>
            )}
          </CardContent>
        </Card>

        {/* Order Items */}
        <Card>
          <CardHeader className='pb-3'>
            <CardTitle className='text-sm'>Sản phẩm ({order.items.length})</CardTitle>
          </CardHeader>
          <CardContent className='space-y-3'>
            {order.items.map((item) => (
              <div key={item.id} className='border rounded-lg p-3 space-y-3'>
                <div className='flex gap-3'>
                  {/* Product Image */}
                  <div className='flex-shrink-0'>
                    {item.maternityDressDetail?.image || (item.preset?.images && item.preset.images.length > 0) ? (
                      <ProductImageViewer
                        src={item.maternityDressDetail?.image?.[0] || item.preset?.images?.[0] || ''}
                        alt={item.preset?.name || item.maternityDressDetail?.name || 'product'}
                        containerClassName='h-12 w-12 rounded-md overflow-hidden bg-muted shrink-0'
                        imgClassName='!w-full !h-full !object-cover'
                        fit='cover'
                        thumbnailClassName='h-12 w-12'
                      />
                    ) : (
                      <div className='w-16 h-16 bg-muted rounded-lg border flex items-center justify-center'>
                        <Package className='h-6 w-6 text-muted-foreground' />
                      </div>
                    )}
                  </div>

                  {/* Product Info */}
                  <div className='flex-1 min-w-0'>
                    <div className='flex justify-between items-start'>
                      <div className='flex-1'>
                        <div className='text-sm font-medium truncate'>
                          {item.maternityDressDetail?.name || item.preset?.name || 'Sản phẩm'}
                        </div>
                        {(item.maternityDressDetail?.sku || item.preset?.sku) && (
                          <div className='text-xs text-muted-foreground'>
                            SKU: {item.maternityDressDetail?.sku || item.preset?.sku}
                          </div>
                        )}
                        <div className='text-xs text-muted-foreground'>Số lượng: {item.quantity}</div>

                        {/* Additional info for maternityDressDetail */}
                        {item.maternityDressDetail && (
                          <div className='flex gap-2 mt-1'>
                            {item.maternityDressDetail.size && (
                              <Badge variant='outline' className='text-xs h-5'>
                                {item.maternityDressDetail.size}
                              </Badge>
                            )}
                            {item.maternityDressDetail.color && (
                              <Badge variant='outline' className='text-xs h-5'>
                                {item.maternityDressDetail.color}
                              </Badge>
                            )}
                          </div>
                        )}
                      </div>
                      <div className='text-sm font-bold ml-2'>
                        {new Intl.NumberFormat('vi-VN', {
                          style: 'currency',
                          currency: 'VND'
                        }).format(item.price)}
                      </div>
                    </div>
                  </div>
                </div>

                {/* Warranty info */}
                {item.warrantyDate && (
                  <div className='text-xs text-muted-foreground border-t pt-2'>
                    Bảo hành đến: {format(new Date(item.warrantyDate), 'dd/MM/yyyy')}
                  </div>
                )}
              </div>
            ))}
          </CardContent>
        </Card>
      </div>
    </div>
  )
}
