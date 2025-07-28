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
  Plus,
  Minus,
  MessageSquare,
  Send,
  Package
} from 'lucide-react'
import { useOrder } from '@/services/admin/manage-order.service'
import { Avatar, AvatarFallback, AvatarImage } from '@radix-ui/react-avatar'
import { useGetUserById } from '@/services/admin/manage-user.service'
import { useGetAddress } from '@/services/global/global.service'

export default function OrderDetailPage() {
  const { orderId } = useParams()
  const navigate = useNavigate()
  const [chatMessage, setChatMessage] = useState('')
  const { data: order } = useOrder(orderId ?? '')
  const { data: user } = useGetUserById(order?.data?.userId ?? '')
  const { data: address } = useGetAddress(order?.data?.addressId ?? '')
  // Mock data cho order detail
  const orderData = {
    id: 'ODR115560',
    code: 'ODR115560',
    date: '15 March 2025 06:15:00 AM',
    source: 'Cart',
    status: 'Ready to Ship',
    customer: {
      id: 'CUST001',
      name: 'Roy Smith',
      email: 'roy@testgmail.com',
      phone: '+820 58023O554A1',
      avatar: '',
      dateOfBirth: '28 Jan 2001, 24 years',
      gender: 'Male',
      type: 'Prime Customer'
    },
    shippingAddress: {
      address: 'Test data 103909 Witamer CR, Niagara Falls, NY 14305, United States'
    },
    items: [
      {
        id: 'RT15246630',
        name: 'Bracelet Platinum plated',
        image: '/placeholder-bracelet.jpg',
        price: 65.0,
        quantity: 1
      },
      {
        id: 'RT15246185O',
        name: 'Sandals women low heel',
        image: '/placeholder-sandals.jpg',
        price: 55.0,
        quantity: 1
      },
      {
        id: 'RT15249630',
        name: 'Light Bulb WiFi BT connect',
        image: '/placeholder-bulb.jpg',
        price: 48.0,
        quantity: 3
      },
      {
        id: 'RT15246745',
        name: 'Sandals women High heel',
        image: '/placeholder-heels.jpg',
        price: 63.0,
        quantity: 3
      }
    ],
    payment: {
      subTotal: 270.0,
      discount: 10.0,
      shippingCharge: 0.0,
      giftPackaging: 0.0,
      total: 261.0,
      status: 'Paid',
      method: 'Net Banking: AmericaSpice Bank',
      accountNumber: '200525XXXXXX5524',
      transactionId: 'FGDFG44G5G6G4D1G...'
    },
    statusTimeline: [
      { status: 'Order Placed', date: '26 March 2025 8:00 am', updatedBy: 'Customer', completed: true },
      { status: 'Accepted', date: '26 March 2025 12:00 pm', updatedBy: 'Store Owner', completed: true },
      { status: 'Ready to Ship', date: '27 March 2025 9:30 am', updatedBy: 'Distributer', completed: false },
      { status: 'Shipped', date: '28 March 2025 9:00 pm', updatedBy: 'Delivery Partner', completed: false },
      { status: 'Delivered', date: '', updatedBy: '', completed: false }
    ],
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
    ],
    tracking: {
      code: 'ROK#554623324',
      courier: 'Delivaari courier service',
      estimatedDelivery: '3 days on 20 March 2025'
    }
  }

  const statusTimeline = ['CREATED', 'CONFIRMED', 'SHIPPED', 'DELIVERED', 'CANCELLED']
  const handleQuantityChange = (itemId: string, change: number) => {
    // Handle quantity change logic here
    console.log(`Item ${itemId} quantity change: ${change}`)
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
          <div>
            <h1 className='text-2xl font-bold'>Order Details #{order?.data?.code}</h1>
          </div>
          <div className='flex items-center space-x-2'>
            <Button variant='outline'>
              <Edit className='h-4 w-4 mr-2' />
              Update
            </Button>
            <Button variant='outline'>
              <Printer className='h-4 w-4 mr-2' />
              Print Invoice
            </Button>
          </div>
        </div>

        {/* Order Info */}
        <div className='flex items-center justify-between'>
          <div className='text-sm text-muted-foreground'>{order?.data?.createdAt}</div>
          <Button size='sm'>New Order</Button>
        </div>

        {/* Main Content */}
        <div className='grid grid-cols-3 gap-6'>
          {/* Left Column */}
          <div className='col-span-2 space-y-6'>
            {/* Customer Information */}
            <Card>
              <CardHeader>
                <div className='flex items-center justify-between'>
                  <CardTitle className='flex items-center'>
                    <div className='flex items-center'>
                      <Avatar className='h-8 w-8'>
                        <AvatarFallback className='text-xs'>
                          {user?.data.fullName?.charAt(0)?.toUpperCase() || 'U'}
                        </AvatarFallback>
                        <AvatarImage src={user?.data?.profilePicture} />
                      </Avatar>
                      <div className='ml-2'>
                        <p className='font-medium text-sm'>{user?.data?.fullName || 'N/A'}</p>
                        <p className='text-xs text-muted-foreground'>{user?.data?.userEmail || 'N/A'}</p>
                      </div>
                    </div>
                  </CardTitle>
                </div>
              </CardHeader>
              <CardContent>
                <div className='grid grid-cols-2 gap-4 text-sm'>
                  <div className='flex items-center space-x-2'>
                    <Calendar className='h-4 w-4 text-muted-foreground' />
                    <span>{user?.data.dateOfBirth || 'N/A'}</span>
                  </div>
                  <div className='flex items-center space-x-2'>
                    <Mail className='h-4 w-4 text-muted-foreground' />
                    <span>{user?.data?.userEmail || 'N/A'}</span>
                  </div>
                  <div className='flex items-center space-x-2'>
                    <Phone className='h-4 w-4 text-muted-foreground' />
                    <span>{user?.data?.phoneNumber || 'N/A'}</span>
                  </div>
                </div>
                <Button variant='outline' size='sm' className='mt-4'>
                  <Edit className='h-4 w-4 mr-2' />
                  Edit Customer
                </Button>
              </CardContent>
            </Card>

            {/* Shipping Address */}
            <Card>
              <CardHeader>
                <CardTitle>Shipping Address</CardTitle>
              </CardHeader>
              <CardContent>
                <div className='space-y-4'>
                  <p className='text-sm'>
                    {address?.data?.street}, {address?.data?.ward}, {address?.data?.district}, {address?.data?.province}
                  </p>
                  <Button variant='outline' size='sm'>
                    <Edit className='h-4 w-4 mr-2' />
                    Edit Address
                  </Button>
                </div>
              </CardContent>
            </Card>

            {/* Order Items */}
            <Card>
              <CardHeader>
                <CardTitle>Order ({order?.data?.items.length} Items)</CardTitle>
              </CardHeader>
              <CardContent>
                <div className='space-y-4'>
                  {orderData.items.map((item) => (
                    <div key={item.id} className='flex items-center justify-between p-4 border rounded-lg'>
                      <div className='flex items-center space-x-4'>
                        <div className='w-12 h-12 bg-gray-100 rounded-lg flex items-center justify-center'>
                          <Package className='h-6 w-6 text-gray-400' />
                        </div>
                        <div>
                          <h4 className='font-medium'>{item.name}</h4>
                          <p className='text-sm text-muted-foreground'>ID: {item.id}</p>
                        </div>
                      </div>
                      <div className='flex items-center space-x-4'>
                        <div className='flex items-center space-x-2'>
                          <Button
                            variant='outline'
                            size='sm'
                            className='h-8 w-8 p-0'
                            onClick={() => handleQuantityChange(item.id, -1)}
                          >
                            <Minus className='h-4 w-4' />
                          </Button>
                          <span className='w-8 text-center'>{item.quantity}</span>
                          <Button
                            variant='outline'
                            size='sm'
                            className='h-8 w-8 p-0'
                            onClick={() => handleQuantityChange(item.id, 1)}
                          >
                            <Plus className='h-4 w-4' />
                          </Button>
                        </div>
                        <div className='text-right'>
                          <p className='font-medium'>${item.price.toFixed(2)}</p>
                          <p className='text-xs text-muted-foreground'>{item.quantity} Item</p>
                        </div>
                      </div>
                    </div>
                  ))}
                </div>
              </CardContent>
            </Card>

            {/* Order Status */}
            <Card>
              <CardHeader>
                <CardTitle>Order Status</CardTitle>
              </CardHeader>
              <CardContent>
                {/* Status Progress Bar */}
                <div className='relative mb-6'>
                  <div className='flex justify-between mb-2'>
                    {statusTimeline.map((status, index) => (
                      <div key={index} className='text-xs text-center'>
                        <div
                          className={`w-3 h-3 rounded-full mx-auto mb-1 ${
                            status === order?.data?.status ? 'bg-primary' : 'bg-gray-300'
                          }`}
                        />
                        <span className={status === order?.data?.status ? 'text-foreground' : 'text-muted-foreground'}>
                          {status}
                        </span>
                      </div>
                    ))}
                  </div>
                  <div className='w-full h-1 bg-gray-200 rounded'>
                    <div className='w-3/5 h-1 bg-primary rounded' />
                  </div>
                </div>

                {/* Status Timeline Table */}
                <div className='space-y-2'>
                  <div className='grid grid-cols-3 gap-4 text-sm font-medium border-b pb-2'>
                    <span>Date</span>
                    <span>Status</span>
                    <span>Updated by</span>
                  </div>
                  {statusTimeline.map((status, index) => (
                    <div key={index} className='grid grid-cols-3 gap-4 text-sm py-2'>
                      <span>{order?.data?.createdAt}</span>
                      <span>{status}</span>
                      <span>{order?.data?.createdBy}</span>
                    </div>
                  ))}
                </div>

                <Button className='w-full mt-4' variant='default'>
                  Ready to Ship
                </Button>
                <Button variant='link' className='w-full text-red-600'>
                  ← Return
                </Button>
              </CardContent>
            </Card>

            {/* Shipment Tracking */}
            <Card>
              <CardHeader>
                <CardTitle>Shipment Tracking</CardTitle>
              </CardHeader>
              <CardContent>
                <div className='space-y-4'>
                  <p className='text-sm'>
                    Item pickup scheduled with {orderData.tracking.courier}. Tracking Code: {orderData.tracking.code}
                  </p>
                  <p className='text-sm text-muted-foreground'>
                    Tentative timeline for delivery is {orderData.tracking.estimatedDelivery}
                  </p>

                  {/* Map Placeholder */}
                  <div className='h-48 bg-gray-100 rounded-lg flex items-center justify-center'>
                    <div className='text-center'>
                      <MapPin className='h-8 w-8 mx-auto mb-2 text-gray-400' />
                      <p className='text-sm text-muted-foreground'>Map View</p>
                    </div>
                  </div>

                  <Button variant='outline' className='w-full'>
                    Send Tracking Code
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
                <CardTitle className='flex items-center justify-between'>
                  <span>
                    {new Intl.NumberFormat('vi-VN', { style: 'currency', currency: 'VND' }).format(
                      order?.data?.totalPaid ?? 0
                    )}
                  </span>
                  <Badge className='bg-green-100 text-green-800'>{order?.data?.paymentStatus}</Badge>
                </CardTitle>
              </CardHeader>
              <CardContent className='space-y-3'>
                <div className='flex justify-between text-sm font-bold'>
                  <span>Product Price</span>
                  <span>
                    {new Intl.NumberFormat('vi-VN', { style: 'currency', currency: 'VND' }).format(
                      order?.data?.subTotalAmount ?? 0
                    )}
                  </span>
                </div>
                <div className='flex justify-between text-sm'>
                  <span>Discount Fee</span>
                  <span>
                    -
                    {new Intl.NumberFormat('vi-VN', { style: 'currency', currency: 'VND' }).format(
                      order?.data?.discountSubtotal ?? 0
                    )}
                  </span>
                </div>
                <Separator />
                <div className='flex justify-between text-sm'>
                  <span>Deposit</span>
                  <span>
                    {new Intl.NumberFormat('vi-VN', { style: 'currency', currency: 'VND' }).format(
                      order?.data?.depositSubtotal ?? 0
                    )}
                  </span>
                </div>
                <div className='flex justify-between text-sm'>
                  <span>Service Fee</span>
                  <span>
                    {new Intl.NumberFormat('vi-VN', { style: 'currency', currency: 'VND' }).format(
                      order?.data?.serviceAmount ?? 0
                    )}
                  </span>
                </div>
                <div className='flex justify-between text-sm'>
                  <span>Shipping Charge</span>
                  <span>
                    {order?.data?.shippingFee === 0
                      ? 'FREE'
                      : `${new Intl.NumberFormat('vi-VN', { style: 'currency', currency: 'VND' }).format(order?.data?.shippingFee ?? 0)}`}
                  </span>
                </div>

                <Separator />
                <div className='flex justify-between font-medium'>
                  <span>Total Paid</span>
                  <span>
                    {new Intl.NumberFormat('vi-VN', { style: 'currency', currency: 'VND' }).format(
                      order?.data?.totalPaid ?? 0
                    )}
                  </span>
                </div>
                <div className='flex justify-between text-sm font-medium'>
                  <span>Remaining Balance</span>
                  <span>
                    {new Intl.NumberFormat('vi-VN', { style: 'currency', currency: 'VND' }).format(
                      order?.data?.remainingBalance ?? 0
                    )}
                  </span>
                </div>

                <Separator />
                <div className='flex justify-between text-sm'>
                  <span>Total Amount</span>
                  <span>
                    {new Intl.NumberFormat('vi-VN', { style: 'currency', currency: 'VND' }).format(
                      order?.data?.totalAmount ?? 0
                    )}
                  </span>
                </div>

                <div className='mt-4 space-y-2'>
                  <h4 className='font-medium text-sm'>Payment details</h4>
                  <div className='text-xs space-y-1'>
                    <div className='flex justify-between text-sm'>
                      <span>Payment Method</span>
                      <span>{order?.data?.paymentMethod}</span>
                    </div>
                    <div className='flex justify-between text-sm'>
                      <span>Delivery Method</span>
                      <span>{order?.data?.deliveryMethod}</span>
                    </div>
                    <div className='flex justify-between text-sm'>
                      <span>Payment Type</span>
                      <span>{order?.data?.paymentType}</span>
                    </div>
                    <div className='flex space-x-2 mt-3'>
                      <Button variant='default' size='sm' className='flex-1'>
                        <Package className='h-4 w-4 mr-2' />
                        Invoice
                      </Button>
                      <Button variant='outline' size='sm' className='flex-1'>
                        Invoice
                      </Button>
                    </div>
                  </div>
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
