import { OrderById } from '@/@types/manage-order.types'
import { Badge } from '@/components/ui/badge'
import { Separator } from '@/components/ui/separator'
import { Avatar, AvatarFallback, AvatarImage } from '@/components/ui/avatar'
import { Button } from '@/components/ui/button'

import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card'
import { getStatusColor, getStatusLabel } from '../data/data'
import {
  MapPin,
  Package,
  Edit,
  Printer,
  X,
  Package2,
  Phone,
  Mail,
  Calendar,
  Clock,
  CreditCard,
  Truck,
  User,
  ShoppingBag
} from 'lucide-react'
import { useGetUserById } from '@/services/admin/manage-user.service'
import { useOrder } from '@/services/admin/manage-order.service'
import { useGetAddress } from '@/services/global/global.service'
import { useState, useEffect } from 'react'
import GoongMap from '@/components/Goong/GoongMap'
import dayjs from 'dayjs'

interface OrderDetailSidebarProps {
  order: OrderById | null
  isOpen: boolean
  onClose: () => void
}

export function OrderDetailSidebar({ order, isOpen, onClose }: OrderDetailSidebarProps) {
  const { data: user } = useGetUserById(order?.userId ?? '')
  const { data: orderDetail } = useOrder(order?.id ?? '')
  const { data: address } = useGetAddress(order?.addressId ?? '')
  console.log('serviceAmount', order)

  function ProductImage({ src, alt }: { src: string; alt: string }) {
    const [imgSrc, setImgSrc] = useState(src)
    const [hasError, setHasError] = useState(false)

    useEffect(() => {
      if (!src || src.trim() === '') {
        setHasError(true)
        setImgSrc('')
      } else {
        setImgSrc(src)
        setHasError(false)
      }
    }, [src])

    const handleError = () => {
      if (!hasError) {
        setHasError(true)
        setImgSrc('')
      }
    }

    if (!src || src.trim() === '' || hasError || !imgSrc) {
      return (
        <div className='w-12 h-12 rounded-lg bg-muted flex items-center justify-center'>
          <Package2 className='h-6 w-6 text-muted-foreground' />
        </div>
      )
    }

    return (
      <img
        src={imgSrc}
        alt={alt}
        className='w-12 h-12 rounded-lg object-cover border border-border'
        onError={handleError}
      />
    )
  }

  if (!isOpen) return null

  if (!order) return null

  const formatCurrency = (amount: number) => {
    return new Intl.NumberFormat('vi-VN', {
      style: 'currency',
      currency: 'VND'
    }).format(amount)
  }

  const formatDate = (dateString: string) => {
    return dayjs(dateString).format('DD/MM/YYYY HH:mm')
  }

  const getStatusTimeline = () => {
    const allStatuses = [
      { key: 'CREATED', label: 'Đơn hàng đã tạo', icon: ShoppingBag },
      { key: 'CONFIRMED', label: 'Đã xác nhận', icon: Package },
      { key: 'IN_DESIGN', label: 'Đang thiết kế', icon: Edit },
      { key: 'IN_PRODUCTION', label: 'Đang sản xuất', icon: Package },
      { key: 'IN_QC', label: 'Kiểm tra chất lượng', icon: Package },
      { key: 'PACKAGING', label: 'Đóng gói', icon: Package },
      { key: 'DELIVERING', label: 'Đang giao hàng', icon: Truck },
      { key: 'COMPLETED', label: 'Hoàn thành', icon: Package }
    ]

    const currentStatusIndex = allStatuses.findIndex((s) => s.key === order.status)

    return allStatuses.map((status, index) => ({
      ...status,
      active: index <= currentStatusIndex,
      current: status.key === order.status
    }))
  }

  const statusTimeline = getStatusTimeline()

  return (
    <>
      <div
        className={`fixed inset-0 bg-black/50 z-40 lg:hidden transition-opacity duration-300 ${
          isOpen ? 'opacity-100' : 'opacity-0 pointer-events-none'
        }`}
        onClick={onClose}
      />

      <div
        className={`fixed top-0 right-0 w-full sm:w-80 lg:w-96 h-full bg-background border-l shadow-xl z-50 transform transition-transform duration-300 ease-in-out ${
          isOpen ? 'translate-x-0' : 'translate-x-full'
        } flex flex-col`}
      >
        <div className='flex-shrink-0 p-4 border-b bg-background'>
          <div className='flex items-center justify-between mb-4'>
            <div>
              <h2 className='text-xl font-bold text-primary'>#{order.code}</h2>
              <p className='text-sm text-muted-foreground'>Mã đơn hàng</p>
            </div>
            <Button variant='ghost' size='sm' onClick={onClose} className='h-8 w-8 p-0'>
              <X className='h-4 w-4' />
            </Button>
          </div>

          <div className='flex items-center justify-between'>
            <Badge variant='outline' className={`${getStatusColor(order.status, 'order')} text-xs font-medium`}>
              {getStatusLabel(order.status, 'order')}
            </Badge>
            <span className='text-xs text-muted-foreground'>{formatDate(order.createdAt)}</span>
          </div>
        </div>

        <div className='flex-1 overflow-y-auto px-4 scroll-smooth'>
          <div className='space-y-4 py-4'>
            {user?.data ? (
              <Card>
                <CardHeader className='pb-3'>
                  <CardTitle className='text-sm font-medium flex items-center text-muted-foreground'>
                    <User className='h-4 w-4 mr-2' />
                    Thông tin khách hàng
                  </CardTitle>
                </CardHeader>
                <CardContent className='space-y-3'>
                  <div className='flex items-center space-x-3'>
                    <Avatar className='h-10 w-10'>
                      <AvatarFallback className='text-sm'>
                        {user.data.fullName?.charAt(0)?.toUpperCase() || 'U'}
                      </AvatarFallback>
                      <AvatarImage src={user.data.profilePicture} />
                    </Avatar>
                    <div className='flex-1 min-w-0'>
                      <h3 className='font-medium text-sm truncate'>{user.data.fullName}</h3>
                      <p className='text-xs text-muted-foreground flex items-center mt-1'>
                        <Mail className='h-3 w-3 mr-1' />
                        {user.data.userEmail}
                      </p>
                    </div>
                  </div>
                  {user.data.phoneNumber && (
                    <div className='flex items-center text-xs text-muted-foreground'>
                      <Phone className='h-3 w-3 mr-2' />
                      {user.data.phoneNumber}
                    </div>
                  )}
                  {user.data.dateOfBirth && (
                    <div className='flex items-center text-xs text-muted-foreground'>
                      <Calendar className='h-3 w-3 mr-2' />
                      {formatDate(user.data.dateOfBirth)}
                    </div>
                  )}
                </CardContent>
              </Card>
            ) : (
              <Card>
                <CardHeader className='pb-3'>
                  <CardTitle className='text-sm font-medium flex items-center text-muted-foreground'>
                    <User className='h-4 w-4 mr-2' />
                    Thông tin khách hàng
                  </CardTitle>
                </CardHeader>
                <CardContent>
                  <div className='flex items-center space-x-3'>
                    <div className='w-10 h-10 bg-muted rounded-full animate-pulse'></div>
                    <div className='flex-1 space-y-2'>
                      <div className='h-4 bg-muted rounded animate-pulse'></div>
                      <div className='h-3 bg-muted rounded w-2/3 animate-pulse'></div>
                    </div>
                  </div>
                </CardContent>
              </Card>
            )}

            <Card>
              <CardHeader className='pb-3'>
                <CardTitle className='text-sm font-medium flex items-center justify-between text-muted-foreground'>
                  <div className='flex items-center'>
                    <ShoppingBag className='h-4 w-4 mr-2' />
                    Sản phẩm đặt hàng
                  </div>
                  <Badge variant='secondary' className='text-xs'>
                    {orderDetail?.data?.items?.length || order.items?.length || 0} sản phẩm
                  </Badge>
                </CardTitle>
              </CardHeader>
              <CardContent className='space-y-3'>
                {(orderDetail?.data?.items || order.items || []).length > 0 ? (
                  (orderDetail?.data?.items || order.items || []).map((item, index) => (
                    <div key={index} className='flex items-center space-x-3 p-3 bg-muted/30 rounded-lg'>
                      <ProductImage
                        src={item.preset?.images?.[0] || ''}
                        alt={item.preset?.styleName || item.itemType}
                      />
                      <div className='flex-1 min-w-0'>
                        <h4 className='font-medium text-sm truncate'>{item.itemType}</h4>
                        {item.preset?.styleName && (
                          <p className='text-xs text-muted-foreground truncate'>{item.preset.styleName}</p>
                        )}
                        <p className='text-sm font-semibold text-primary'>{formatCurrency(item.price)}</p>
                      </div>
                      <div className='text-center'>
                        <div className='w-8 h-8 bg-primary/10 rounded-full flex items-center justify-center'>
                          <span className='text-xs font-bold text-primary'>{item.quantity}</span>
                        </div>
                      </div>
                    </div>
                  ))
                ) : (
                  <div className='text-center py-8 text-muted-foreground'>
                    <ShoppingBag className='h-12 w-12 mx-auto mb-4 opacity-20' />
                    <p className='text-sm'>Không có sản phẩm trong đơn hàng</p>
                  </div>
                )}
              </CardContent>
            </Card>

            {order.addressId && address?.data && (
              <Card>
                <CardHeader className='pb-3'>
                  <CardTitle className='text-sm font-medium flex items-center text-muted-foreground'>
                    <MapPin className='h-4 w-4 mr-2' />
                    Địa chỉ giao hàng
                  </CardTitle>
                </CardHeader>
                <CardContent className='space-y-3'>
                  <div className='text-sm space-y-1'>
                    <p className='font-medium'>{address.data.street}</p>
                    <p className='text-muted-foreground'>
                      {[address.data.ward, address.data.district, address.data.province].filter(Boolean).join(', ')}
                    </p>
                  </div>

                  <div className='rounded-lg overflow-hidden border'>
                    <GoongMap center={[address.data.longitude, address.data.latitude]} zoom={16} className='h-32' />
                  </div>
                </CardContent>
              </Card>
            )}

            <Card>
              <CardHeader className='pb-3'>
                <CardTitle className='text-sm font-medium flex items-center text-muted-foreground'>
                  <CreditCard className='h-4 w-4 mr-2' />
                  Chi tiết thanh toán
                </CardTitle>
              </CardHeader>
              <CardContent className='space-y-3'>
                <div className='space-y-2 text-sm'>
                  {order.subTotalAmount && (
                    <div className='flex justify-between'>
                      <span className='text-muted-foreground'>Giá tiền sản phẩm</span>
                      <span>{formatCurrency(order.subTotalAmount)}</span>
                    </div>
                  )}
                  {order.discountSubtotal !== 0 && order.discountSubtotal !== undefined && (
                    <div className='flex justify-between'>
                      <span className='text-muted-foreground'>Giảm giá</span>
                      <span className='text-green-600'>-{formatCurrency(order.discountSubtotal)}</span>
                    </div>
                  )}
                  <Separator />
                  {order.depositSubtotal !== 0 && order.depositSubtotal !== undefined && (
                    <div className='flex justify-between'>
                      <span className='text-muted-foreground'>Tiền đặt cọc</span>
                      <span>{formatCurrency(order.depositSubtotal)}</span>
                    </div>
                  )}
                  {order.shippingFee !== undefined && (
                    <div className='flex justify-between'>
                      <span className='text-muted-foreground'>Phí vận chuyển</span>
                      <span>
                        {order.shippingFee > 0 ? formatCurrency(order.shippingFee) : 'Không có phí vận chuyển'}
                      </span>
                    </div>
                  )}
                  {order.serviceAmount !== 0 && order.serviceAmount !== undefined ? (
                    <div className='flex justify-between'>
                      <span className='text-muted-foreground'>Phí dịch vụ</span>
                      <span>{formatCurrency(order?.serviceAmount)}</span>
                    </div>
                  ) : (
                    <div className='flex justify-between'>
                      <span className='text-muted-foreground'>Phí dịch vụ</span>
                      <span>0</span>
                    </div>
                  )}
                  <Separator />
                  <div className='flex justify-between font-semibold text-base'>
                    <span>Tổng cộng</span>
                    <span className='text-primary'>{formatCurrency(order.totalAmount || 0)}</span>
                  </div>
                  {order.totalPaid > 0 && (
                    <div className='flex justify-between text-sm'>
                      <span className='text-muted-foreground'>Đã thanh toán</span>
                      <span className='text-green-600 font-medium'>{formatCurrency(order.totalPaid)}</span>
                    </div>
                  )}
                  {order.remainingBalance && order.remainingBalance > 0 && (
                    <div className='flex justify-between text-sm'>
                      <span className='text-muted-foreground'>Còn lại</span>
                      <span className='text-orange-600 font-medium'>{formatCurrency(order.remainingBalance)}</span>
                    </div>
                  )}
                </div>

                <div className='flex items-center justify-between pt-2'>
                  <Badge
                    variant='outline'
                    className={`${getStatusColor(order.paymentStatus || '', 'payment')} text-xs`}
                  >
                    {getStatusLabel(order.paymentStatus || '', 'payment')}
                  </Badge>
                  {order.paymentMethod && (
                    <span className='text-xs text-muted-foreground'>
                      {order.paymentMethod === 'CASH' ? 'Tiền mặt' : 'Chuyển khoản'}
                    </span>
                  )}
                </div>
              </CardContent>
            </Card>

            <Card>
              <CardHeader className='pb-3'>
                <CardTitle className='text-sm font-medium flex items-center text-muted-foreground'>
                  <Clock className='h-4 w-4 mr-2' />
                  Trạng thái đơn hàng
                </CardTitle>
              </CardHeader>
              <CardContent>
                <div className='space-y-3'>
                  {statusTimeline.map((item, index) => {
                    const Icon = item.icon
                    return (
                      <div key={index} className='flex items-start space-x-3'>
                        <div
                          className={`w-8 h-8 rounded-full flex items-center justify-center border-2 ${
                            item.current
                              ? 'bg-primary border-primary text-primary-foreground'
                              : item.active
                                ? 'bg-primary/10 border-primary text-primary'
                                : 'bg-muted border-muted-foreground/20 text-muted-foreground'
                          }`}
                        >
                          <Icon className='h-3 w-3' />
                        </div>
                        <div className='flex-1 pb-3'>
                          <p
                            className={`text-sm font-medium ${
                              item.current ? 'text-primary' : item.active ? 'text-foreground' : 'text-muted-foreground'
                            }`}
                          >
                            {item.label}
                          </p>
                          {item.current && (
                            <p className='text-xs text-muted-foreground mt-1'>
                              Cập nhật lúc {formatDate(order.updatedAt)}
                            </p>
                          )}
                        </div>
                      </div>
                    )
                  })}
                </div>
              </CardContent>
            </Card>
          </div>
        </div>

        <div className='flex-shrink-0 p-4 border-t bg-background space-y-3'>
          <Button className='w-full' size='sm'>
            <Package className='h-4 w-4 mr-2' />
            Cập nhật trạng thái
          </Button>
          <div className='flex space-x-2'>
            <Button variant='outline' size='sm' className='flex-1'>
              <Edit className='h-4 w-4 mr-2' />
              Chỉnh sửa
            </Button>
            <Button variant='outline' size='sm' className='flex-1'>
              <Printer className='h-4 w-4 mr-2' />
              In hóa đơn
            </Button>
          </div>
        </div>
      </div>
    </>
  )
}
