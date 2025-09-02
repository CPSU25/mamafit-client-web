import { Package, Clock, AlertTriangle, MessageSquare, ShoppingBag, User, MapPin, Phone, Calendar } from 'lucide-react'
import { Badge } from '@/components/ui/badge'
import { Avatar, AvatarFallback, AvatarImage } from '@/components/ui/avatar'
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card'
import { ProductImageViewer } from '@/components/ui/image-viewer'
import { SimpleVideoPlayer } from '@/components/video-viewer'

import { Dialog, DialogContent, DialogHeader, DialogTitle } from '@/components/ui/dialog'

import type { TicketList, TicketType } from '@/@types/ticket.types'
import { useGetUserById } from '@/services/admin/manage-user.service'

interface TicketDetailDialogProps {
  ticket: TicketList | null
  isOpen: boolean
  onClose: () => void
}

// Helper functions
const getTicketTypeLabel = (type: TicketType): string => {
  switch (type) {
    case 'WARRANTY_SERVICE':
      return 'Bảo hành'
    case 'DELIVERY_SERVICE':
      return 'Giao hàng'
    case 'OTHER':
      return 'Khác'
    default:
      return 'Không xác định'
  }
}

const getTicketTypeIcon = (type: TicketType) => {
  switch (type) {
    case 'WARRANTY_SERVICE':
      return Package
    case 'DELIVERY_SERVICE':
      return Clock
    case 'OTHER':
      return AlertTriangle
    default:
      return MessageSquare
  }
}

const getTicketTypeColor = (type: TicketType): string => {
  switch (type) {
    case 'WARRANTY_SERVICE':
      return 'bg-orange-100 text-orange-700 border-orange-200 dark:bg-orange-900/30 dark:text-orange-300 dark:border-orange-800'
    case 'DELIVERY_SERVICE':
      return 'bg-blue-100 text-blue-700 border-blue-200 dark:bg-blue-900/30 dark:text-blue-300 dark:border-blue-800'
    case 'OTHER':
      return 'bg-yellow-100 text-yellow-700 border-yellow-200 dark:bg-yellow-900/30 dark:text-yellow-300 dark:border-yellow-800'
    default:
      return 'bg-gray-100 text-gray-700 border-gray-200 dark:bg-gray-900/30 dark:text-gray-300 dark:border-gray-800'
  }
}

const formatCurrency = (amount: number) => {
  return new Intl.NumberFormat('vi-VN', {
    style: 'currency',
    currency: 'VND'
  }).format(amount)
}

export function TicketDetailDialog({ ticket, isOpen, onClose }: TicketDetailDialogProps) {
  // Lấy thông tin user từ userId
  const { data: user } = useGetUserById(isOpen && ticket ? ticket.order.userId : '')

  if (!ticket) return null

  const TypeIcon = getTicketTypeIcon(ticket.type)

  return (
    <Dialog open={isOpen} onOpenChange={onClose}>
      <DialogContent className='sm:max-w-4xl max-h-[90vh] overflow-y-auto'>
        <DialogHeader>
          <div className='flex items-center gap-3'>
            <div className={`p-2 rounded-lg ${getTicketTypeColor(ticket.type)}`}>
              <TypeIcon className='h-5 w-5' />
            </div>
            <div>
              <DialogTitle className='text-xl'>Chi tiết Ticket</DialogTitle>
              <p className='text-sm text-muted-foreground'>{getTicketTypeLabel(ticket.type)}</p>
            </div>
          </div>
        </DialogHeader>

        <div className='space-y-6'>
          {/* Ticket Information */}
          <Card>
            <CardHeader>
              <CardTitle className='flex items-center gap-2'>
                <MessageSquare className='h-5 w-5 text-violet-600' />
                Thông tin Ticket
              </CardTitle>
            </CardHeader>
            <CardContent className='space-y-4'>
              <div>
                <label className='text-sm font-medium text-muted-foreground'>Tiêu đề</label>
                <p className='text-base font-medium'>{ticket.title}</p>
              </div>
              <div>
                <label className='text-sm font-medium text-muted-foreground'>Mô tả</label>
                <p className='text-sm text-muted-foreground whitespace-pre-wrap'>{ticket.description}</p>
              </div>
              <div>
                <label className='text-sm font-medium text-muted-foreground mr-5'>Loại</label>
                <Badge className={`${getTicketTypeColor(ticket.type)} mt-1`}>
                  <TypeIcon className='h-3 w-3 mr-1' />
                  {getTicketTypeLabel(ticket.type)}
                </Badge>
              </div>
              <div className='grid grid-cols-2 gap-4'>
                <div>
                  <label className='text-sm font-medium text-muted-foreground'>Ngày tạo</label>
                  <p className='text-sm text-muted-foreground'>
                    {new Date(ticket.createdAt).toLocaleDateString('vi-VN')}
                  </p>
                </div>
                <div>
                  <label className='text-sm font-medium text-muted-foreground'>Người tạo</label>
                  <p className='text-sm text-muted-foreground'>{ticket.createdBy || 'N/A'}</p>
                </div>
              </div>
            </CardContent>
          </Card>

          {/* Media Files */}
          {(ticket.images.length > 0 || ticket.videos.length > 0) && (
            <Card>
              <CardHeader>
                <CardTitle className='flex items-center gap-2'>
                  <Package className='h-5 w-5 text-blue-600' />
                  Tài liệu đính kèm
                </CardTitle>
              </CardHeader>
              <CardContent className='space-y-4'>
                {/* Images */}
                {ticket.images.length > 0 && (
                  <div>
                    <label className='text-sm font-medium text-muted-foreground mb-2 block'>Hình ảnh</label>
                    <div className='grid grid-cols-2 gap-3'>
                      {ticket.images.map((image, index) => (
                        <ProductImageViewer
                          key={index}
                          src={image}
                          alt={`Ticket image ${index + 1}`}
                          containerClassName='aspect-square'
                          imgClassName='object-cover'
                          fit='cover'
                        />
                      ))}
                    </div>
                  </div>
                )}

                {/* Videos */}
                {ticket.videos.length > 0 && (
                  <div>
                    <label className='text-sm font-medium text-muted-foreground mb-3 block'>
                      Video ({ticket.videos.length})
                    </label>
                    <div className='space-y-3'>
                      {ticket.videos.map((video, index) => (
                        <SimpleVideoPlayer
                          key={index}
                          src={video}
                          title={`Ticket video ${index + 1}`}
                          className='w-full'
                          height={200}
                        />
                      ))}
                    </div>
                  </div>
                )}
              </CardContent>
            </Card>
          )}

          {/* Order Information */}
          <Card>
            <CardHeader>
              <CardTitle className='flex items-center gap-2'>
                <ShoppingBag className='h-5 w-5 text-green-600' />
                Thông tin Đơn hàng
              </CardTitle>
            </CardHeader>
            <CardContent className='space-y-4'>
              <div className='grid grid-cols-2 gap-4'>
                <div>
                  <label className='text-sm font-medium text-muted-foreground'>Mã đơn hàng</label>
                  <p className='text-base font-medium'>#{ticket.order.code || 'N/A'}</p>
                </div>
                <div>
                  <label className='text-sm font-medium text-muted-foreground'>Tổng tiền</label>
                  <p className='text-base font-medium'>{formatCurrency(ticket.order.totalAmount || 0)}</p>
                </div>
              </div>

              {ticket.order.trackingOrderCode && (
                <div>
                  <label className='text-sm font-medium text-muted-foreground'>Mã tracking</label>
                  <p className='text-sm text-muted-foreground'>{ticket.order.trackingOrderCode}</p>
                </div>
              )}

              {ticket.order.discountSubtotal && ticket.order.discountSubtotal > 0 ? (
                <div>
                  <label className='text-sm font-medium text-muted-foreground'>Giảm giá</label>
                  <p className='text-sm text-muted-foreground text-green-600'>
                    -{formatCurrency(ticket.order.discountSubtotal)}
                  </p>
                </div>
              ) : null}

              {ticket.order.shippingFee && ticket.order.shippingFee > 0 && (
                <div>
                  <label className='text-sm font-medium text-muted-foreground'>Phí vận chuyển</label>
                  <p className='text-sm text-muted-foreground'>{formatCurrency(ticket.order.shippingFee)}</p>
                </div>
              )}

              {ticket.order.subTotalAmount && (
                <div>
                  <label className='text-sm font-medium text-muted-foreground'>Tổng tiền hàng</label>
                  <p className='text-sm text-muted-foreground'>{formatCurrency(ticket.order.subTotalAmount)}</p>
                </div>
              )}

              <div className='grid grid-cols-2 gap-4'>
                <div>
                  <label className='text-sm font-medium text-muted-foreground mr-5'>Trạng thái</label>
                  <Badge className='mt-1'>
                    {ticket.order.status === 'COMPLETED'
                      ? 'Hoàn thành'
                      : ticket.order.status === 'DELIVERING'
                        ? 'Đang giao'
                        : ticket.order.status === 'IN_PROGRESS'
                          ? 'Đang xử lý'
                          : ticket.order.status === 'CREATED'
                            ? 'Đã tạo'
                            : ticket.order.status || 'N/A'}
                  </Badge>
                </div>
                <div>
                  <label className='text-sm font-medium text-muted-foreground mr-5'>Trạng thái thanh toán</label>
                  <Badge className='mt-1' variant='outline'>
                    {ticket.order.paymentStatus === 'PAID_FULL'
                      ? 'Đã thanh toán đủ'
                      : ticket.order.paymentStatus === 'PAID_DEPOSIT'
                        ? 'Đã thanh toán đặt cọc'
                        : ticket.order.paymentStatus === 'PENDING'
                          ? 'Chưa thanh toán'
                          : ticket.order.paymentStatus || 'N/A'}
                  </Badge>
                </div>
                <div>
                  <label className='text-sm font-medium text-muted-foreground'>Phương thức thanh toán</label>
                  <p className='text-sm text-muted-foreground'>
                    {ticket.order.paymentMethod === 'ONLINE_BANKING'
                      ? 'Chuyển khoản'
                      : ticket.order.paymentMethod === 'CASH'
                        ? 'Tiền mặt'
                        : ticket.order.paymentMethod || 'N/A'}
                  </p>
                </div>
                <div>
                  <label className='text-sm font-medium text-muted-foreground'>Phương thức giao hàng</label>
                  <p className='text-sm text-muted-foreground'>
                    {ticket.order.deliveryMethod === 'PICK_UP'
                      ? 'Nhận tại cửa hàng'
                      : ticket.order.deliveryMethod === 'DELIVERY'
                        ? 'Giao hàng tận nơi'
                        : ticket.order.deliveryMethod || 'N/A'}
                  </p>
                </div>
              </div>

              {/* Order Items */}
              {ticket.order.items && ticket.order.items.length > 0 && (
                <div>
                  <label className='text-sm font-medium text-muted-foreground mb-2 block'>Sản phẩm</label>
                  <div className='space-y-3'>
                    {ticket.order.items.map((item, index) => (
                      <div
                        key={index}
                        className='flex items-center gap-3 p-3 border border-gray-200 dark:border-gray-700 rounded-lg'
                      >
                        {item.preset?.images && item.preset.images.length > 0 && (
                          <ProductImageViewer
                            src={item.preset.images[0]}
                            alt={item.preset.name || 'Product'}
                            containerClassName='w-16 h-16'
                            imgClassName='object-cover'
                            fit='cover'
                          />
                        )}
                        <div className='flex-1 min-w-0'>
                          <p className='font-medium truncate'>{item.preset?.name || 'N/A'}</p>
                          <p className='text-sm text-muted-foreground'>
                            Số lượng: {item.quantity} x {formatCurrency(item.preset?.price || 0)}
                          </p>
                        </div>
                      </div>
                    ))}
                  </div>
                </div>
              )}
            </CardContent>
          </Card>

          {/* Customer Information */}
          {user && (
            <Card>
              <CardHeader>
                <CardTitle className='flex items-center gap-2'>
                  <User className='h-5 w-5 text-purple-600' />
                  Thông tin Khách hàng
                </CardTitle>
              </CardHeader>
              <CardContent className='space-y-4'>
                <div className='flex items-center gap-3'>
                  <Avatar className='h-12 w-12'>
                    <AvatarImage src={user.data?.profilePicture || ''} />
                    <AvatarFallback>{user.data?.fullName?.[0] || user.data?.userName?.[0] || 'U'}</AvatarFallback>
                  </Avatar>
                  <div>
                    <p className='font-medium'>{user.data?.fullName || user.data?.userName || 'Khách hàng'}</p>
                    <p className='text-sm text-muted-foreground'>{user.data?.userEmail}</p>
                  </div>
                </div>

                {user.data?.phoneNumber && (
                  <div className='flex items-center gap-2 text-sm'>
                    <Phone className='h-4 w-4 text-muted-foreground' />
                    <span>{user.data.phoneNumber}</span>
                  </div>
                )}

                {ticket.order.addressId && (
                  <div className='flex items-start gap-2 text-sm'>
                    <MapPin className='h-4 w-4 text-muted-foreground mt-0.5' />
                    <span className='text-muted-foreground'>ID: {ticket.order.addressId}</span>
                  </div>
                )}

                {ticket.order.address && (
                  <div className='flex items-start gap-2 text-sm'>
                    <MapPin className='h-4 w-4 text-muted-foreground mt-0.5' />
                    <span className='text-muted-foreground'>{ticket.order.address}</span>
                  </div>
                )}
              </CardContent>
            </Card>
          )}

          {/* Order Timeline */}
          <Card>
            <CardHeader>
              <CardTitle className='flex items-center gap-2'>
                <Calendar className='h-5 w-5 text-indigo-600' />
                Trạng thái Đơn hàng
              </CardTitle>
            </CardHeader>
            <CardContent>
              <div className='space-y-3'>
                <div className='flex items-center gap-3'>
                  <div
                    className={`w-3 h-3 rounded-full ${
                      ticket.order.status === 'COMPLETED' ? 'bg-green-500' : 'bg-gray-300'
                    }`}
                  ></div>
                  <div>
                    <p className='text-sm font-medium'>Đã hoàn thành</p>
                    <p className='text-xs text-muted-foreground'>Đơn hàng đã được giao thành công</p>
                  </div>
                </div>
                <div className='flex items-center gap-3'>
                  <div
                    className={`w-3 h-3 rounded-full ${
                      ticket.order.status === 'DELIVERING' ? 'bg-blue-500' : 'bg-gray-300'
                    }`}
                  ></div>
                  <div>
                    <p className='text-sm font-medium'>Đang giao hàng</p>
                    <p className='text-xs text-muted-foreground'>Đơn hàng đang được vận chuyển</p>
                  </div>
                </div>
                <div className='flex items-center gap-3'>
                  <div
                    className={`w-3 h-3 rounded-full ${
                      ticket.order.status === 'IN_PROGRESS' ? 'bg-orange-500' : 'bg-gray-300'
                    }`}
                  ></div>
                  <div>
                    <p className='text-sm font-medium'>Đang xử lý</p>
                    <p className='text-xs text-muted-foreground'>Đơn hàng đang được xử lý</p>
                  </div>
                </div>
                <div className='flex items-center gap-3'>
                  <div
                    className={`w-3 h-3 rounded-full ${
                      ticket.order.status === 'CREATED' ? 'bg-yellow-500' : 'bg-gray-300'
                    }`}
                  ></div>
                  <div>
                    <p className='text-sm font-medium'>Đã tạo</p>
                    <p className='text-xs text-muted-foreground'>Đơn hàng đã được tạo</p>
                  </div>
                </div>
              </div>
            </CardContent>
          </Card>
        </div>
      </DialogContent>
    </Dialog>
  )
}
