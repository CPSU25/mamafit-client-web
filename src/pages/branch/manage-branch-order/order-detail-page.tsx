import { useState, useMemo, useCallback } from 'react'
import { useParams, useNavigate } from 'react-router-dom'
import dayjs from 'dayjs'

import { Main } from '@/components/layout/main'
import { Button } from '@/components/ui/button'
import { Badge } from '@/components/ui/badge'
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card'
import { Separator } from '@/components/ui/separator'
import { Input } from '@/components/ui/input'
import { Avatar, AvatarFallback, AvatarImage } from '@/components/ui/avatar'
import { ProductImageViewer } from '@/components/ui/image-viewer'

import {
  ChevronLeft,
  Edit,
  Printer,
  Calendar,
  Mail,
  Phone,
  MapPin,
  MessageSquare,
  Send,
  Package,
  ShoppingBag,
  User,
  CreditCard,
  Clock,
  Truck,
  UserCheck
} from 'lucide-react'

import { useOrder, useOrderDetail } from '@/services/admin/manage-order.service'
import { useGetUserById } from '@/services/admin/manage-user.service'

import GoongMap from '@/components/Goong/GoongMap'
// import { OrderAssignDialog } from './components/order-assign-dialog'
import { getStatusColor, getStatusLabel } from './data/data'

// Constants
const CURRENCY_LOCALE = 'vi-VN'
const CURRENCY_CODE = 'VND'
const DATE_FORMAT = 'DD/MM/YYYY HH:mm'

// Mock data for chat (will be replaced with real data later)
const MOCK_CHAT_MESSAGES = [
  {
    id: 1,
    sender: 'Alex Smith',
    message: 'Hi!',
    time: '9:00 pm',
    isCustomer: true
  },
  {
    id: 2,
    sender: 'Mr. Jack Mario',
    message: 'Adminiuix is amazing and we thank you. How can we thank you.',
    time: '9:10 pm',
    isCustomer: false
  }
] as const

// Status timeline configuration
const ORDER_STATUS_FLOW = [
  { key: 'CREATED', label: 'Order Created', icon: ShoppingBag },
  { key: 'CONFIRMED', label: 'Confirmed Order', icon: Package },
  { key: 'IN_DESIGN', label: 'In Design', icon: Edit },
  { key: 'IN_PRODUCTION', label: 'In Production', icon: Package },
  { key: 'IN_QC', label: 'Quality Check', icon: Package },
  { key: 'PACKAGING', label: 'Packaging', icon: Package },
  { key: 'DELIVERING', label: 'Delivering', icon: Truck },
  { key: 'COMPLETED', label: 'Completed', icon: Package }
] as const

/**
 * Utility functions
 */
const formatCurrency = (amount: number): string => {
  return new Intl.NumberFormat(CURRENCY_LOCALE, {
    style: 'currency',
    currency: CURRENCY_CODE
  }).format(amount)
}

const formatDate = (dateString: string | undefined | null): string => {
  if (!dateString) return '-'
  try {
    const date = dayjs(dateString)
    if (!date.isValid()) return '-'
    return date.format(DATE_FORMAT)
  } catch {
    return '-'
  }
}

/**
 * Get status timeline for order progression
 */
const getStatusTimeline = (currentStatus?: string) => {
  const currentStatusIndex = ORDER_STATUS_FLOW.findIndex((s) => s.key === currentStatus)

  return ORDER_STATUS_FLOW.map((status, index) => ({
    ...status,
    active: index <= currentStatusIndex,
    current: status.key === currentStatus
  }))
}

/**
 * Order Detail Page Component
 */
export default function OrderDetailPage() {
  const { orderId } = useParams()
  const navigate = useNavigate()
  const [chatMessage, setChatMessage] = useState('')
  //  const [assignChargeDialogOpen, setAssignChargeDialogOpen] = useState(false)

  // Data fetching
  const { data: order, isLoading: orderLoading } = useOrder(orderId ?? '')
  const { data: user, isLoading: userLoading } = useGetUserById(order?.data?.userId ?? '')
  const { data: orderDetailItem, isLoading: orderDetailLoading } = useOrderDetail(order?.data?.items?.[0]?.id ?? '')

  // Memoized computations
  const statusTimeline = useMemo(() => getStatusTimeline(order?.data?.status), [order?.data?.status])

  // Event handlers
  const handleSendMessage = useCallback(() => {
    if (chatMessage.trim()) {
      console.log('Sending message:', chatMessage)
      setChatMessage('')
    }
  }, [chatMessage])

  // const handleAssignChargeSuccess = useCallback(() => {
  //   console.log('Assign charge success - data will be refetched automatically')
  // }, [])

  const handleNavigateBack = useCallback(() => {
    navigate('/system/admin/manage-order')
  }, [navigate])

  // Loading state
  if (orderLoading || userLoading || orderDetailLoading) {
    return (
      <Main className='p-6'>
        <div className='flex items-center justify-center min-h-[400px]'>
          <div className='text-center space-y-2'>
            <div className='animate-spin rounded-full h-8 w-8 border-b-2 border-primary mx-auto' />
            <p className='text-muted-foreground'>Đang tải chi tiết đơn hàng...</p>
          </div>
        </div>
      </Main>
    )
  }

  // Error state - no order found
  if (!order?.data) {
    return (
      <Main className='p-6'>
        <div className='flex items-center justify-center min-h-[400px]'>
          <div className='text-center space-y-4'>
            <Package className='h-16 w-16 text-muted-foreground mx-auto' />
            <div>
              <h3 className='text-lg font-semibold'>Không tìm thấy đơn hàng</h3>
              <p className='text-muted-foreground'>Đơn hàng với ID {orderId} không tồn tại hoặc đã bị xóa.</p>
            </div>
            <Button onClick={handleNavigateBack} variant='outline'>
              <ChevronLeft className='h-4 w-4 mr-2' />
              Quay lại danh sách
            </Button>
          </div>
        </div>
      </Main>
    )
  }

  return (
    <Main className='p-6'>
      <div className='space-y-6'>
        {/* Page Header */}
        <div className='flex flex-col gap-4 md:flex-row md:items-center md:justify-between'>
          <div className='space-y-2'>
            <h1 className='text-2xl font-bold tracking-tight'>Order Details #{order.data.code}</h1>
            {order.data.status && (
              <Badge variant='outline' className={`${getStatusColor(order.data.status, 'order')} text-sm font-medium`}>
                {getStatusLabel(order.data.status, 'order')}
              </Badge>
            )}
          </div>

          <div className='flex items-center gap-2'>
            <Button variant='outline' size='sm'>
              <Edit className='h-4 w-4 mr-2' />
              Update Status
            </Button>
            <Button variant='outline' size='sm'>
              <Printer className='h-4 w-4 mr-2' />
              Print Invoice
            </Button>
          </div>
        </div>

        {/* Order Metadata */}
        <div className='flex flex-col gap-2 text-sm text-muted-foreground md:flex-row md:items-center md:justify-between'>
          <div>Created: {formatDate(order.data.createdAt)}</div>
          <Button size='sm' onClick={handleNavigateBack} variant='ghost'>
            Back to Orders
          </Button>
        </div>

        {/* Main Content Grid */}
        <div className='grid gap-6 lg:grid-cols-3'>
          {/* Left Column - Main Content */}
          <div className='lg:col-span-2 space-y-6'>
            {/* Customer Information */}
            {user?.data && (
              <Card className='border-0 shadow-sm'>
                <CardHeader className='pb-4'>
                  <CardTitle className='text-lg font-medium flex items-center gap-2'>
                    <User className='h-5 w-5' />
                    Customer Information
                  </CardTitle>
                </CardHeader>
                <CardContent className='space-y-4'>
                  <div className='flex items-center gap-4'>
                    <Avatar className='h-12 w-12'>
                      <AvatarFallback className='text-sm'>
                        {user.data.fullName?.charAt(0)?.toUpperCase() || 'U'}
                      </AvatarFallback>
                      <AvatarImage src={user.data.profilePicture} />
                    </Avatar>
                    <div className='flex-1 space-y-1'>
                      <h3 className='font-semibold text-lg'>{user.data.fullName}</h3>
                      <p className='text-muted-foreground flex items-center gap-2'>
                        <Mail className='h-4 w-4' />
                        {user.data.userEmail}
                      </p>
                    </div>
                  </div>

                  <div className='grid gap-3 md:grid-cols-2'>
                    {user.data.phoneNumber && (
                      <div className='flex items-center gap-2 text-sm'>
                        <Phone className='h-4 w-4 text-muted-foreground' />
                        <span>{user.data.phoneNumber}</span>
                      </div>
                    )}
                    {user.data.dateOfBirth && (
                      <div className='flex items-center gap-2 text-sm'>
                        <Calendar className='h-4 w-4 text-muted-foreground' />
                        <span>{formatDate(user.data.dateOfBirth)}</span>
                      </div>
                    )}
                  </div>
                </CardContent>
              </Card>
            )}

            {/* Shipping Address */}
            {order.data.address && (
              <Card className='border-0 shadow-sm'>
                <CardHeader className='pb-4'>
                  <CardTitle className='text-lg font-medium flex items-center gap-2'>
                    <MapPin className='h-5 w-5' />
                    Shipping Address
                  </CardTitle>
                </CardHeader>
                <CardContent className='space-y-4'>
                  <div className='space-y-2'>
                    <p className='font-medium'>{order.data.address.street}</p>
                    <p className='text-muted-foreground text-sm'>
                      {[order.data.address.ward, order.data.address.district, order.data.address.province]
                        .filter(Boolean)
                        .join(', ')}
                    </p>
                  </div>

                  {order.data.address.longitude && order.data.address.latitude && (
                    <div className='rounded-lg overflow-hidden border'>
                      <GoongMap
                        center={[order.data.address.longitude, order.data.address.latitude]}
                        zoom={16}
                        className='h-48'
                      />
                    </div>
                  )}

                  <Button variant='outline' size='sm' className='w-full'>
                    <Edit className='h-4 w-4 mr-2' />
                    Edit Address
                  </Button>
                </CardContent>
              </Card>
            )}

            {/* Order Items */}
            <Card className='border-0 shadow-sm'>
              <CardHeader className='pb-4'>
                <div className='flex items-center justify-between'>
                  <CardTitle className='text-lg font-medium flex items-center gap-2'>
                    <ShoppingBag className='h-5 w-5' />
                    Order Items
                  </CardTitle>
                  <div className='flex items-center gap-2'>
                    <Badge variant='secondary' className='text-xs'>
                      {order.data.items?.length || 0} items
                    </Badge>
                    {order.data.items?.[0]?.itemType === 'DESIGN_REQUEST' && orderDetailItem?.data && (
                      <Button
                        size='sm'
                        variant='outline'
                        // onClick={() => setAssignChargeDialogOpen(true)}
                        className='h-8 px-3 text-xs'
                      >
                        <UserCheck className='h-4 w-4 mr-2' />
                        Assign Charge
                      </Button>
                    )}
                  </div>
                </div>
              </CardHeader>
              <CardContent className='space-y-4'>
                {order.data.items && order.data.items.length > 0 ? (
                  order.data.items.map((item, index) => (
                    <div key={index} className='space-y-4'>
                      {item.itemType === 'DESIGN_REQUEST' ? (
                        // Design Request Item
                        <div className='border border-primary/20 bg-gradient-to-br from-primary/5 via-primary/3 to-accent/10 rounded-xl overflow-hidden shadow-sm'>
                          <div className='px-4 py-3 bg-primary text-primary-foreground'>
                            <div className='flex items-center justify-between'>
                              <div className='flex items-center gap-2'>
                                <div className='w-6 h-6 bg-white/20 rounded-full flex items-center justify-center'>
                                  <svg className='w-3 h-3' fill='currentColor' viewBox='0 0 20 20'>
                                    <path d='M13.586 3.586a2 2 0 112.828 2.828l-.793.793-2.828-2.828.793-.793zM11.379 5.793L3 14.172V17h2.828l8.38-8.379-2.83-2.828z' />
                                  </svg>
                                </div>
                                <span className='font-medium text-sm'>Design Request</span>
                              </div>
                              <div className='flex items-center gap-3'>
                                <span className='text-lg font-bold'>{formatCurrency(item.price)}</span>
                                <div className='w-7 h-7 bg-white/20 rounded-full flex items-center justify-center backdrop-blur-sm'>
                                  <span className='text-xs font-bold'>{item.quantity}</span>
                                </div>
                              </div>
                            </div>
                          </div>

                          <div className='p-4 space-y-4'>
                            {item.designRequest?.description && (
                              <div className='bg-card/80 backdrop-blur-sm border border-border rounded-lg p-3 shadow-sm'>
                                <div className='flex items-center gap-2 mb-2'>
                                  <div className='w-4 h-4 bg-primary rounded-full flex items-center justify-center'>
                                    <svg
                                      className='w-2 h-2 text-primary-foreground'
                                      fill='currentColor'
                                      viewBox='0 0 20 20'
                                    >
                                      <path
                                        fillRule='evenodd'
                                        d='M18 10a8 8 0 11-16 0 8 8 0 0116 0zm-7-4a1 1 0 11-2 0 1 1 0 012 0zM9 9a1 1 0 000 2v3a1 1 0 001 1h1a1 1 0 100-2v-3a1 1 0 00-1-1H9z'
                                        clipRule='evenodd'
                                      />
                                    </svg>
                                  </div>
                                  <span className='text-sm font-medium'>Description</span>
                                </div>
                                <p className='text-sm text-muted-foreground leading-relaxed pl-6'>
                                  {item.designRequest.description}
                                </p>
                              </div>
                            )}

                            {item.designRequest?.images && item.designRequest.images.length > 0 && (
                              <div className='bg-card/80 backdrop-blur-sm border border-border rounded-lg p-4 shadow-sm'>
                                <div className='flex items-center gap-2 mb-4'>
                                  <div className='w-4 h-4 bg-primary rounded-full flex items-center justify-center'>
                                    <svg
                                      className='w-2 h-2 text-primary-foreground'
                                      fill='currentColor'
                                      viewBox='0 0 20 20'
                                    >
                                      <path
                                        fillRule='evenodd'
                                        d='M4 3a2 2 0 00-2 2v10a2 2 0 002 2h12a2 2 0 002-2V5a2 2 0 00-2-2H4zm12 12H4l4-8 3 6 2-4 3 6z'
                                        clipRule='evenodd'
                                      />
                                    </svg>
                                  </div>
                                  <span className='text-sm font-medium'>
                                    Reference Images ({item.designRequest.images.length})
                                  </span>
                                </div>

                                <div className='w-full'>
                                  {item.designRequest.images.length === 1 ? (
                                    <div className='flex justify-center'>
                                      <div className='w-full max-w-md'>
                                        <ProductImageViewer
                                          src={item.designRequest.images[0]}
                                          alt='Design request image'
                                          thumbnailClassName='w-full aspect-square rounded-lg border border-border shadow-sm hover:shadow-md transition-shadow'
                                        />
                                      </div>
                                    </div>
                                  ) : item.designRequest.images.length === 2 ? (
                                    <div className='grid grid-cols-2 gap-4'>
                                      {item.designRequest.images.map((imageUrl: string, imgIndex: number) => (
                                        <ProductImageViewer
                                          key={imgIndex}
                                          src={imageUrl}
                                          alt={`Design request image ${imgIndex + 1}`}
                                          thumbnailClassName='w-full aspect-square rounded-lg border border-border shadow-sm hover:shadow-md transition-shadow'
                                        />
                                      ))}
                                    </div>
                                  ) : item.designRequest.images.length === 3 ? (
                                    <div className='space-y-4'>
                                      <div className='grid grid-cols-2 gap-4'>
                                        {item.designRequest.images
                                          .slice(0, 2)
                                          .map((imageUrl: string, imgIndex: number) => (
                                            <ProductImageViewer
                                              key={imgIndex}
                                              src={imageUrl}
                                              alt={`Design request image ${imgIndex + 1}`}
                                              thumbnailClassName='w-full aspect-square rounded-lg border border-border shadow-sm hover:shadow-md transition-shadow'
                                            />
                                          ))}
                                      </div>
                                      <div className='flex justify-center'>
                                        <div className='w-1/2'>
                                          <ProductImageViewer
                                            src={item.designRequest.images[2]}
                                            alt='Design request image 3'
                                            thumbnailClassName='w-full aspect-square rounded-lg border border-border shadow-sm hover:shadow-md transition-shadow'
                                          />
                                        </div>
                                      </div>
                                    </div>
                                  ) : (
                                    <div className='grid grid-cols-2 gap-4'>
                                      {item.designRequest.images.map((imageUrl: string, imgIndex: number) => (
                                        <ProductImageViewer
                                          key={imgIndex}
                                          src={imageUrl}
                                          alt={`Design request image ${imgIndex + 1}`}
                                          thumbnailClassName='w-full aspect-square rounded-lg border border-border shadow-sm hover:shadow-md transition-shadow'
                                        />
                                      ))}
                                    </div>
                                  )}
                                </div>
                              </div>
                            )}

                            <div className='pt-4 border-t border-border'>
                              <Button
                                size='sm'
                                // onClick={() => setAssignChargeDialogOpen(true)}
                                className='w-full'
                                disabled={!orderDetailItem?.data}
                              >
                                <UserCheck className='h-4 w-4 mr-2' />
                                Giao việc cho Milestone
                              </Button>
                            </div>
                          </div>
                        </div>
                      ) : (
                        // Regular Item (PRESET/READY_TO_BUY)
                        <div className='border rounded-lg p-4 space-y-4'>
                          <div className='flex items-center justify-between'>
                            <div className='flex items-center gap-4'>
                              <ProductImageViewer
                                src={item.preset?.images?.[0] || item.maternityDressDetail?.image?.[0] || ''}
                                alt={item.preset?.styleName || item.maternityDressDetail?.name || item.itemType}
                                thumbnailClassName='w-12 h-12 rounded-md'
                              />
                              <div>
                                <h4 className='font-medium'>{item.itemType}</h4>
                                <p className='text-sm text-muted-foreground'>ID: {item.id}</p>
                                {item.preset?.styleName && (
                                  <p className='text-xs text-muted-foreground'>{item.preset.styleName}</p>
                                )}
                                {item.maternityDressDetail?.name && (
                                  <p className='text-xs text-muted-foreground'>{item.maternityDressDetail.name}</p>
                                )}
                              </div>
                            </div>
                            <div className='flex items-center gap-4'>
                              <div className='text-center'>
                                <div className='w-8 h-8 bg-primary/10 rounded-full flex items-center justify-center'>
                                  <span className='text-xs font-bold text-primary'>{item.quantity}</span>
                                </div>
                              </div>
                              <div className='text-right'>
                                <p className='font-medium'>{formatCurrency(item.price)}</p>
                                <p className='text-xs text-muted-foreground'>
                                  {item.quantity} Item{item.quantity > 1 ? 's' : ''}
                                </p>
                              </div>
                            </div>
                          </div>

                          <div className='pt-2 border-t border-border'>
                            <Button
                              size='sm'
                              //  onClick={() => setAssignChargeDialogOpen(true)}
                              className='w-full'
                              disabled={!orderDetailItem?.data}
                            >
                              <UserCheck className='h-4 w-4 mr-2' />
                              Giao việc cho Milestone
                            </Button>
                          </div>
                        </div>
                      )}
                    </div>
                  ))
                ) : (
                  <div className='text-center py-8 text-muted-foreground'>
                    <ShoppingBag className='h-12 w-12 mx-auto mb-4 opacity-20' />
                    <p className='text-sm'>No items in order</p>
                  </div>
                )}
              </CardContent>
            </Card>

            {/* Order Status Timeline */}
            <Card className='border-0 shadow-sm'>
              <CardHeader className='pb-4'>
                <CardTitle className='text-lg font-medium flex items-center gap-2'>
                  <Clock className='h-5 w-5' />
                  Order Status
                </CardTitle>
              </CardHeader>
              <CardContent className='space-y-6'>
                {/* Current Status */}
                <div className='space-y-2'>
                  <Badge
                    variant='outline'
                    className={`${getStatusColor(order.data.status, 'order')} text-sm font-medium`}
                  >
                    {getStatusLabel(order.data.status, 'order')}
                  </Badge>
                  <p className='text-xs text-muted-foreground'>Last updated: {formatDate(order.data.updatedAt)}</p>
                </div>

                {/* Status Timeline */}
                <div className='space-y-4'>
                  {statusTimeline.map((item, index) => {
                    const Icon = item.icon
                    return (
                      <div key={index} className='flex items-start gap-3'>
                        <div
                          className={`w-8 h-8 rounded-full flex items-center justify-center border-2 transition-colors ${
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
                              Updated at {formatDate(order.data.updatedAt)}
                            </p>
                          )}
                        </div>
                      </div>
                    )
                  })}
                </div>

                <div className='space-y-2 pt-4 border-t'>
                  <Button className='w-full'>
                    <Package className='h-4 w-4 mr-2' />
                    Update Status
                  </Button>
                  <Button variant='outline' className='w-full'>
                    <Edit className='h-4 w-4 mr-2' />
                    Edit Order
                  </Button>
                </div>
              </CardContent>
            </Card>
          </div>

          {/* Right Column - Payment & Chat */}
          <div className='space-y-6'>
            {/* Payment Summary */}
            <Card className='border-0 shadow-sm'>
              <CardHeader className='pb-4'>
                <div className='flex items-center justify-between'>
                  <CardTitle className='text-lg font-medium flex items-center gap-2'>
                    <CreditCard className='h-5 w-5' />
                    Payment Details
                  </CardTitle>
                  {order.data.paymentStatus && (
                    <Badge
                      variant='outline'
                      className={`${getStatusColor(order.data.paymentStatus, 'payment')} text-xs`}
                    >
                      {getStatusLabel(order.data.paymentStatus, 'payment')}
                    </Badge>
                  )}
                </div>
              </CardHeader>
              <CardContent className='space-y-4'>
                {/* Price Breakdown */}
                <div className='space-y-3'>
                  {order.data.subTotalAmount && (
                    <div className='flex justify-between text-sm'>
                      <span className='text-muted-foreground'>Product Price</span>
                      <span className='font-medium'>{formatCurrency(order.data.subTotalAmount)}</span>
                    </div>
                  )}

                  {order.data.discountSubtotal && order.data.discountSubtotal !== 0 && (
                    <div className='flex justify-between text-sm'>
                      <span className='text-muted-foreground'>Discount</span>
                      <span className='text-green-600 font-medium'>-{formatCurrency(order.data.discountSubtotal)}</span>
                    </div>
                  )}

                  {order.data.depositSubtotal && order.data.depositSubtotal !== 0 && (
                    <div className='flex justify-between text-sm'>
                      <span className='text-muted-foreground'>Deposit</span>
                      <span>{formatCurrency(order.data.depositSubtotal)}</span>
                    </div>
                  )}

                  {order.data.serviceAmount && order.data.serviceAmount !== 0 && (
                    <div className='flex justify-between text-sm'>
                      <span className='text-muted-foreground'>Service Fee</span>
                      <span>{formatCurrency(order.data.serviceAmount)}</span>
                    </div>
                  )}

                  <div className='flex justify-between text-sm'>
                    <span className='text-muted-foreground'>Shipping Fee</span>
                    <span>
                      {order.data.shippingFee && order.data.shippingFee > 0
                        ? formatCurrency(order.data.shippingFee)
                        : 'Free'}
                    </span>
                  </div>
                </div>

                <Separator />

                {/* Total */}
                <div className='flex justify-between font-semibold text-base'>
                  <span>Total Amount</span>
                  <span className='text-primary'>{formatCurrency(order.data.totalAmount || 0)}</span>
                </div>

                {/* Payment Status */}
                <div className='space-y-2'>
                  {order.data.totalPaid && order.data.totalPaid !== 0 && (
                    <div className='flex justify-between text-sm'>
                      <span className='text-muted-foreground'>Paid</span>
                      <span className='text-green-600 font-medium'>{formatCurrency(order.data.totalPaid)}</span>
                    </div>
                  )}

                  {order.data.remainingBalance && order.data.remainingBalance !== 0 && (
                    <div className='flex justify-between text-sm'>
                      <span className='text-muted-foreground'>Remaining</span>
                      <span className='text-orange-600 font-medium'>{formatCurrency(order.data.remainingBalance)}</span>
                    </div>
                  )}
                </div>

                <Separator />

                {/* Payment Information */}
                <div className='space-y-3'>
                  <h4 className='font-medium text-sm'>Payment Information</h4>
                  {order.data.paymentMethod && (
                    <div className='flex justify-between text-sm'>
                      <span className='text-muted-foreground'>Payment Method</span>
                      <span>{order.data.paymentMethod === 'CASH' ? 'Cash' : 'Bank Transfer'}</span>
                    </div>
                  )}
                  {order.data.deliveryMethod && (
                    <div className='flex justify-between text-sm'>
                      <span className='text-muted-foreground'>Delivery Method</span>
                      <span>{order.data.deliveryMethod === 'DELIVERY' ? 'Delivery' : 'Pickup'}</span>
                    </div>
                  )}
                  {order.data.paymentType && (
                    <div className='flex justify-between text-sm'>
                      <span className='text-muted-foreground'>Payment Type</span>
                      <span>{order.data.paymentType}</span>
                    </div>
                  )}
                </div>

                {/* Action Buttons */}
                <div className='flex gap-2 pt-4 border-t'>
                  <Button variant='default' size='sm' className='flex-1'>
                    <Printer className='h-4 w-4 mr-2' />
                    Print
                  </Button>
                  <Button variant='outline' size='sm' className='flex-1'>
                    <Edit className='h-4 w-4 mr-2' />
                    Edit
                  </Button>
                </div>
              </CardContent>
            </Card>

            {/* Chat Section */}
            <Card className='border-0 shadow-sm'>
              <CardHeader className='pb-4'>
                <CardTitle className='text-lg font-medium flex items-center gap-2'>
                  <MessageSquare className='h-5 w-5' />
                  Chat
                </CardTitle>
              </CardHeader>
              <CardContent className='space-y-4'>
                <div className='space-y-3 max-h-48 overflow-y-auto'>
                  {MOCK_CHAT_MESSAGES.map((msg) => (
                    <div
                      key={msg.id}
                      className={`p-3 rounded-lg transition-colors ${
                        msg.isCustomer ? 'bg-muted/50' : 'bg-primary/10 text-primary-foreground ml-8'
                      }`}
                    >
                      <p className='font-medium text-sm'>{msg.sender}</p>
                      <p className='text-sm mt-1'>{msg.message}</p>
                      <span className='text-xs opacity-70 mt-1 block'>{msg.time}</span>
                    </div>
                  ))}
                </div>

                <div className='flex gap-2'>
                  <Input
                    placeholder='Type your message...'
                    value={chatMessage}
                    onChange={(e) => setChatMessage(e.target.value)}
                    onKeyDown={(e) => e.key === 'Enter' && handleSendMessage()}
                    className='flex-1'
                  />
                  <Button size='sm' onClick={handleSendMessage}>
                    <Send className='h-4 w-4' />
                  </Button>
                </div>
              </CardContent>
            </Card>
          </div>
        </div>

        {/* Assign Charge Dialog */}
        {/* <OrderAssignDialog
          open={assignChargeDialogOpen}
          onOpenChange={setAssignChargeDialogOpen}
          orderItem={orderDetailItem?.data as any}
          onSuccess={handleAssignChargeSuccess}
        /> */}
      </div>
    </Main>
  )
}
