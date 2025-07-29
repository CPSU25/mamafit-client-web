import { useState } from 'react'
import { useParams, useNavigate } from 'react-router-dom'
import { Main } from '@/components/layout/main'
import { Button } from '@/components/ui/button'
import { Badge } from '@/components/ui/badge'
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card'
import { Separator } from '@/components/ui/separator'
import { Input } from '@/components/ui/input'
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
  Truck
} from 'lucide-react'
import { useOrder } from '@/services/admin/manage-order.service'
import { Avatar, AvatarFallback, AvatarImage } from '@/components/ui/avatar'
import { useGetUserById } from '@/services/admin/manage-user.service'
import { ProductImageViewer } from '@/components/ui/image-viewer'
import { getStatusColor, getStatusLabel } from './data/data'
import dayjs from 'dayjs'
import GoongMap from '@/components/Goong/GoongMap'

export default function OrderDetailPage() {
  const { orderId } = useParams()
  const navigate = useNavigate()
  const [chatMessage, setChatMessage] = useState('')
  const { data: order } = useOrder(orderId ?? '')
  const { data: user } = useGetUserById(order?.data?.userId ?? '')

  console.log('address', order?.data?.address)
  const formatCurrency = (amount: number) => {
    return new Intl.NumberFormat('vi-VN', {
      style: 'currency',
      currency: 'VND'
    }).format(amount)
  }

  const formatDate = (dateString: string | undefined | null) => {
    if (!dateString) return '-'
    try {
      const date = dayjs(dateString)
      if (!date.isValid()) return '-'
      return date.format('DD/MM/YYYY HH:mm')
    } catch {
      return '-'
    }
  }

  const getStatusTimeline = () => {
    const allStatuses = [
      { key: 'CREATED', label: 'Order Created', icon: ShoppingBag },
      { key: 'CONFIRMED', label: 'Confirmed Order', icon: Package },
      { key: 'IN_DESIGN', label: 'In Design', icon: Edit },
      { key: 'IN_PRODUCTION', label: 'In Production', icon: Package },
      { key: 'IN_QC', label: 'Quality Check', icon: Package },
      { key: 'PACKAGING', label: 'Packaging', icon: Package },
      { key: 'DELIVERING', label: 'Delivering', icon: Truck },
      { key: 'COMPLETED', label: 'Completed', icon: Package }
    ]

    const currentStatusIndex = allStatuses.findIndex((s) => s.key === order?.data?.status)

    return allStatuses.map((status, index) => ({
      ...status,
      active: index <= currentStatusIndex,
      current: status.key === order?.data?.status
    }))
  }

  // Mock data for chat (kept as requested)
  const orderData = {
    chatMessages: [
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
    ]
  }

  const handleSendMessage = () => {
    if (chatMessage.trim()) {
      // Handle send message logic here
      console.log('Sending message:', chatMessage)
      setChatMessage('')
    }
  }

  return (
    <Main>
      <div className='space-y-6'>
        {/* Breadcrumb */}
        <div className='flex items-center space-x-2 text-sm text-muted-foreground'>
          <Button variant='ghost' size='sm' onClick={() => navigate('/system/admin/manage-order')}>
            <ChevronLeft className='h-4 w-4 mr-1' />
            Dashboard
          </Button>
          <span>/</span>
          <span>Orders</span>
          <span>/</span>
          <span>Order Details</span>
        </div>

        {/* Header */}
        <div className='flex items-center justify-between'>
          <div className='space-y-1'>
            <h1 className='text-2xl font-bold'>Order Details #{order?.data?.code || 'Loading...'}</h1>
            {order?.data?.status && (
              <Badge variant='outline' className={`${getStatusColor(order.data.status, 'order')} text-sm`}>
                {getStatusLabel(order.data.status, 'order')}
              </Badge>
            )}
          </div>
          <div className='flex items-center space-x-2'>
            <Button variant='outline'>
              <Edit className='h-4 w-4 mr-2' />
              Update Status
            </Button>
            <Button variant='outline'>
              <Printer className='h-4 w-4 mr-2' />
              Print Invoice
            </Button>
          </div>
        </div>

        {/* Order Info */}
        <div className='flex items-center justify-between'>
          <div className='text-sm text-muted-foreground'>Created: {formatDate(order?.data?.createdAt)}</div>
          <Button size='sm' onClick={() => navigate('/system/admin/manage-order')}>
            Back to Orders
          </Button>
        </div>

        {/* Main Content */}
        <div className='grid grid-cols-3 gap-6'>
          {/* Left Column */}
          <div className='col-span-2 space-y-6'>
            {/* Customer Information */}
            {user?.data && (
              <Card>
                <CardHeader>
                  <CardTitle className='text-lg font-medium flex items-center'>
                    <User className='h-5 w-5 mr-2' />
                    Customer Information
                  </CardTitle>
                </CardHeader>
                <CardContent>
                  <div className='flex items-center space-x-4 mb-4'>
                    <Avatar className='h-12 w-12'>
                      <AvatarFallback className='text-sm'>
                        {user.data.fullName?.charAt(0)?.toUpperCase() || 'U'}
                      </AvatarFallback>
                      <AvatarImage src={user.data.profilePicture} />
                    </Avatar>
                    <div className='flex-1'>
                      <h3 className='font-semibold text-lg'>{user.data.fullName}</h3>
                      <p className='text-muted-foreground flex items-center mt-1'>
                        <Mail className='h-4 w-4 mr-2' />
                        {user.data.userEmail}
                      </p>
                    </div>
                  </div>

                  <div className='grid grid-cols-1 md:grid-cols-2 gap-4'>
                    {user.data.phoneNumber && (
                      <div className='flex items-center space-x-2 text-sm'>
                        <Phone className='h-4 w-4 text-muted-foreground' />
                        <span>{user.data.phoneNumber}</span>
                      </div>
                    )}
                    {user.data.dateOfBirth && (
                      <div className='flex items-center space-x-2 text-sm'>
                        <Calendar className='h-4 w-4 text-muted-foreground' />
                        <span>{formatDate(user.data.dateOfBirth)}</span>
                      </div>
                    )}
                  </div>
                </CardContent>
              </Card>
            )}

            {/* Shipping Address */}
            {order?.data?.address && order.data.address !== null && (
              <Card>
                <CardHeader>
                  <CardTitle className='text-lg font-medium flex items-center'>
                    <MapPin className='h-5 w-5 mr-2' />
                    Shipping Address
                  </CardTitle>
                </CardHeader>
                <CardContent>
                  <div className='space-y-4'>
                    <div className='text-sm space-y-1'>
                      <p className='font-medium'>{order.data.address.street}</p>
                      <p className='text-muted-foreground'>
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

                    <Button variant='outline' size='sm'>
                      <Edit className='h-4 w-4 mr-2' />
                      Edit Address
                    </Button>
                  </div>
                </CardContent>
              </Card>
            )}

            {/* Order Items */}
            <Card>
              <CardHeader>
                <CardTitle className='text-lg font-medium flex items-center justify-between'>
                  <div className='flex items-center'>
                    <ShoppingBag className='h-5 w-5 mr-2' />
                    Order Items
                  </div>
                  <Badge variant='secondary' className='text-xs'>
                    {order?.data?.items?.length || 0} items
                  </Badge>
                </CardTitle>
              </CardHeader>
              <CardContent>
                <div className='space-y-4'>
                  {order?.data?.items && order.data.items.length > 0 ? (
                    order.data.items.map((item, index) => {
                      if (item.itemType === 'DESIGN_REQUEST') {
                        return (
                          <div
                            key={index}
                            className='border border-primary/20 bg-gradient-to-br from-primary/5 via-primary/3 to-accent/10 rounded-xl overflow-hidden shadow-sm'
                          >
                            <div className='px-4 py-3 bg-primary text-primary-foreground'>
                              <div className='flex items-center justify-between'>
                                <div className='flex items-center space-x-2'>
                                  <div className='w-6 h-6 bg-white/20 rounded-full flex items-center justify-center'>
                                    <svg className='w-3 h-3' fill='currentColor' viewBox='0 0 20 20'>
                                      <path d='M13.586 3.586a2 2 0 112.828 2.828l-.793.793-2.828-2.828.793-.793zM11.379 5.793L3 14.172V17h2.828l8.38-8.379-2.83-2.828z' />
                                    </svg>
                                  </div>
                                  <span className='font-medium text-sm'>Design Request</span>
                                </div>
                                <div className='flex items-center space-x-3'>
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
                                  <div className='flex items-center space-x-2 mb-2'>
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
                                    <span className='text-sm font-medium text-foreground'>Description</span>
                                  </div>
                                  <p className='text-sm text-muted-foreground leading-relaxed pl-6'>
                                    {item.designRequest.description}
                                  </p>
                                </div>
                              )}

                              {item.designRequest?.images && item.designRequest.images.length > 0 && (
                                <div className='bg-card/80 backdrop-blur-sm border border-border rounded-lg p-4 shadow-sm'>
                                  <div className='flex items-center space-x-2 mb-4'>
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
                                    <span className='text-sm font-medium text-foreground'>
                                      Reference Images ({item.designRequest.images.length})
                                    </span>
                                  </div>

                                  {/* Improved image gallery */}
                                  <div className='w-full'>
                                    {item.designRequest.images.length === 1 ? (
                                      // Single image - centered with max width
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
                                      // Two images - balanced layout
                                      <div className='grid grid-cols-2 gap-4'>
                                        {item.designRequest.images.map((imageUrl: string, imgIndex: number) => (
                                          <div key={imgIndex} className='w-full'>
                                            <ProductImageViewer
                                              src={imageUrl}
                                              alt={`Design request image ${imgIndex + 1}`}
                                              thumbnailClassName='w-full aspect-square rounded-lg border border-border shadow-sm hover:shadow-md transition-shadow'
                                            />
                                          </div>
                                        ))}
                                      </div>
                                    ) : item.designRequest.images.length === 3 ? (
                                      // Three images - 2 on top, 1 centered below
                                      <div className='space-y-4'>
                                        <div className='grid grid-cols-2 gap-4'>
                                          {item.designRequest.images
                                            .slice(0, 2)
                                            .map((imageUrl: string, imgIndex: number) => (
                                              <div key={imgIndex} className='w-full'>
                                                <ProductImageViewer
                                                  src={imageUrl}
                                                  alt={`Design request image ${imgIndex + 1}`}
                                                  className='w-full aspect-square rounded-lg border border-border shadow-sm hover:shadow-md transition-shadow'
                                                />
                                              </div>
                                            ))}
                                        </div>
                                        <div className='flex justify-center'>
                                          <div className='w-1/2'>
                                            <ProductImageViewer
                                              src={item.designRequest.images[2]}
                                              alt='Design request image 3'
                                              className='w-full aspect-square rounded-lg border border-border shadow-sm hover:shadow-md transition-shadow'
                                            />
                                          </div>
                                        </div>
                                      </div>
                                    ) : (
                                      // Four or more images - 2x2 grid
                                      <div className='grid grid-cols-2 gap-4'>
                                        {item.designRequest.images.map((imageUrl: string, imgIndex: number) => (
                                          <div key={imgIndex} className='w-full'>
                                            <ProductImageViewer
                                              src={imageUrl}
                                              alt={`Design request image ${imgIndex + 1}`}
                                              className='w-full aspect-square rounded-lg border border-border shadow-sm hover:shadow-md transition-shadow'
                                            />
                                          </div>
                                        ))}
                                      </div>
                                    )}
                                  </div>
                                </div>
                              )}
                            </div>
                          </div>
                        )
                      } else {
                        return (
                          <div key={index} className='flex items-center justify-between p-4 border rounded-lg'>
                            <div className='flex items-center space-x-4'>
                              <ProductImageViewer
                                src={item.preset?.images?.[0] || item.maternityDressDetail?.images?.[0] || ''}
                                alt={item.preset?.styleName || item.maternityDressDetail?.name || item.itemType}
                                className='w-12 h-12'
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
                            <div className='flex items-center space-x-4'>
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
                        )
                      }
                    })
                  ) : (
                    <div className='text-center py-8 text-muted-foreground'>
                      <ShoppingBag className='h-12 w-12 mx-auto mb-4 opacity-20' />
                      <p className='text-sm'>No items in order</p>
                    </div>
                  )}
                </div>
              </CardContent>
            </Card>

            {/* Order Status */}
            <Card>
              <CardHeader>
                <CardTitle className='text-lg font-medium flex items-center'>
                  <Clock className='h-5 w-5 mr-2' />
                  Order Status
                </CardTitle>
              </CardHeader>
              <CardContent>
                {/* Current Status Badge */}
                <div className='mb-6'>
                  <Badge
                    variant='outline'
                    className={`${getStatusColor(order?.data?.status || '', 'order')} text-sm font-medium`}
                  >
                    {getStatusLabel(order?.data?.status || '', 'order')}
                  </Badge>
                  <p className='text-xs text-muted-foreground mt-2'>
                    Last updated: {formatDate(order?.data?.updatedAt)}
                  </p>
                </div>

                {/* Status Timeline */}
                <div className='space-y-4'>
                  {getStatusTimeline().map((item, index) => {
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
                              Updated at {formatDate(order?.data?.updatedAt)}
                            </p>
                          )}
                        </div>
                      </div>
                    )
                  })}
                </div>

                <div className='mt-6 space-y-2'>
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

          {/* Right Column */}
          <div className='space-y-6'>
            {/* Payment Summary */}
            <Card>
              <CardHeader>
                <CardTitle className='text-lg font-medium flex items-center justify-between'>
                  <div className='flex items-center'>
                    <CreditCard className='h-5 w-5 mr-2' />
                    Payment Details
                  </div>
                  {order?.data?.paymentStatus && (
                    <Badge
                      variant='outline'
                      className={`${getStatusColor(order.data.paymentStatus, 'payment')} text-xs`}
                    >
                      {getStatusLabel(order.data.paymentStatus, 'payment')}
                    </Badge>
                  )}
                </CardTitle>
              </CardHeader>
              <CardContent className='space-y-3'>
                {order?.data?.subTotalAmount && (
                  <div className='flex justify-between text-sm'>
                    <span className='text-muted-foreground'>Product Price</span>
                    <span className='font-medium'>{formatCurrency(order.data.subTotalAmount)}</span>
                  </div>
                )}

                {order?.data?.discountSubtotal && order.data.discountSubtotal !== 0 && (
                  <div className='flex justify-between text-sm'>
                    <span className='text-muted-foreground'>Discount</span>
                    <span className='text-green-600 font-medium'>-{formatCurrency(order.data.discountSubtotal)}</span>
                  </div>
                )}

                {order?.data?.depositSubtotal && order.data.depositSubtotal !== 0 && (
                  <div className='flex justify-between text-sm'>
                    <span className='text-muted-foreground'>Deposit</span>
                    <span>{formatCurrency(order.data.depositSubtotal)}</span>
                  </div>
                )}

                {order?.data?.serviceAmount && order.data.serviceAmount !== 0 && (
                  <div className='flex justify-between text-sm'>
                    <span className='text-muted-foreground'>Service Fee</span>
                    <span>{formatCurrency(order.data.serviceAmount)}</span>
                  </div>
                )}

                <div className='flex justify-between text-sm'>
                  <span className='text-muted-foreground'>Shipping Fee</span>
                  <span>
                    {order?.data?.shippingFee && order.data.shippingFee > 0
                      ? formatCurrency(order.data.shippingFee)
                      : 'Free'}
                  </span>
                </div>

                <Separator />

                <div className='flex justify-between font-semibold text-base'>
                  <span>Total Amount</span>
                  <span className='text-primary'>{formatCurrency(order?.data?.totalAmount || 0)}</span>
                </div>

                {order?.data?.totalPaid && order.data.totalPaid !== 0 && (
                  <div className='flex justify-between text-sm'>
                    <span className='text-muted-foreground'>Paid</span>
                    <span className='text-green-600 font-medium'>{formatCurrency(order.data.totalPaid)}</span>
                  </div>
                )}

                {order?.data?.remainingBalance && order.data.remainingBalance !== 0 && (
                  <div className='flex justify-between text-sm'>
                    <span className='text-muted-foreground'>Remaining</span>
                    <span className='text-orange-600 font-medium'>{formatCurrency(order.data.remainingBalance)}</span>
                  </div>
                )}

                <Separator />

                <div className='space-y-2'>
                  <h4 className='font-medium text-sm'>Payment Information</h4>
                  {order?.data?.paymentMethod && (
                    <div className='flex justify-between text-sm'>
                      <span className='text-muted-foreground'>Payment Method</span>
                      <span>{order.data.paymentMethod === 'CASH' ? 'Cash' : 'Bank Transfer'}</span>
                    </div>
                  )}
                  {order?.data?.deliveryMethod && (
                    <div className='flex justify-between text-sm'>
                      <span className='text-muted-foreground'>Delivery Method</span>
                      <span>{order.data.deliveryMethod === 'DELIVERY' ? 'Delivery' : 'Pickup'}</span>
                    </div>
                  )}
                  {order?.data?.paymentType && (
                    <div className='flex justify-between text-sm'>
                      <span className='text-muted-foreground'>Payment Type</span>
                      <span>{order.data.paymentType}</span>
                    </div>
                  )}
                </div>

                <div className='flex space-x-2 mt-4'>
                  <Button variant='default' size='sm' className='flex-1'>
                    <Printer className='h-4 w-4 mr-2' />
                    Print Invoice
                  </Button>
                  <Button variant='outline' size='sm' className='flex-1'>
                    <Edit className='h-4 w-4 mr-2' />
                    Edit
                  </Button>
                </div>
              </CardContent>
            </Card>

            {/* Chat */}
            <Card>
              <CardHeader>
                <CardTitle className='flex items-center'>
                  <MessageSquare className='h-4 w-4 mr-2' />
                  Chat
                </CardTitle>
              </CardHeader>
              <CardContent>
                <div className='space-y-3'>
                  <div className='space-y-3 max-h-48 overflow-y-auto'>
                    {orderData.chatMessages.map((msg) => (
                      <div
                        key={msg.id}
                        className={`p-3 rounded-lg ${
                          msg.isCustomer ? 'bg-gray-100' : 'bg-primary text-primary-foreground ml-8'
                        }`}
                      >
                        <p className='font-medium text-sm'>{msg.sender}</p>
                        <p className='text-sm'>{msg.message}</p>
                        <span className='text-xs opacity-70'>{msg.time}</span>
                      </div>
                    ))}
                  </div>

                  <div className='flex space-x-2'>
                    <Input
                      placeholder='Type your message...'
                      value={chatMessage}
                      onChange={(e) => setChatMessage(e.target.value)}
                      onKeyPress={(e) => e.key === 'Enter' && handleSendMessage()}
                      className='flex-1'
                    />
                    <Button size='sm' onClick={handleSendMessage}>
                      <Send className='h-4 w-4' />
                    </Button>
                  </div>
                </div>
              </CardContent>
            </Card>
          </div>
        </div>
      </div>
    </Main>
  )
}
