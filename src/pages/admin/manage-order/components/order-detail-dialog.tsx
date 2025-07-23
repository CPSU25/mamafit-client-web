import { OrderType } from '@/@types/admin.types'
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogDescription } from '@/components/ui/dialog'
import { Badge } from '@/components/ui/badge'
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card'
import { Separator } from '@/components/ui/separator'
import { Avatar, AvatarFallback, AvatarImage } from '@/components/ui/avatar'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import { getStatusColor, getStatusLabel } from '../data/data'
import { MapPin, Phone, Mail, Calendar, Package, MessageSquare, User, Edit, Printer, X } from 'lucide-react'
import { format } from 'date-fns'

interface OrderDetailDialogProps {
  open: boolean
  onOpenChange: (open: boolean) => void
  order: OrderType | null
  mode: 'view' | 'edit'
}

export function OrderDetailDialog({ open, onOpenChange, order }: OrderDetailDialogProps) {
  if (!order) return null

  const formatCurrency = (amount: number) => {
    return new Intl.NumberFormat('vi-VN', {
      style: 'currency',
      currency: 'VND'
    }).format(amount)
  }

  // Mock customer data - in real app, this would come from API
  const customer = {
    id: order.userId,
    fullName: 'Roy Smith',
    email: 'roy@testgmail.com',
    phone: '+820 58023O554A1',
    avatar: '',
    dateOfBirth: '28 Jan 2001, 24 years',
    gender: 'Male'
  }

  // Mock order items - in real app, this would come from order.items
  const orderItems = [
    {
      id: 'RT15246630',
      name: 'Bracelet Platinum plated',
      image: '/placeholder-image.jpg',
      price: 65000,
      quantity: 1
    },
    {
      id: 'RT15246630',
      name: 'Sandals women low heel',
      image: '/placeholder-image.jpg',
      price: 55000,
      quantity: 1
    },
    {
      id: 'RT15249630',
      name: 'Light Bulb WiFi BT connect',
      image: '/placeholder-image.jpg',
      price: 48000,
      quantity: 3
    },
    {
      id: 'RT15246745',
      name: 'Sandals women High heel',
      image: '/placeholder-image.jpg',
      price: 63000,
      quantity: 3
    }
  ]

  // Mock status timeline
  const statusTimeline = [
    { status: 'Order Placed', date: '26 March 2025 8:00 am', updatedBy: 'Customer', active: true },
    { status: 'Accepted', date: '26 March 2025 12:00 pm', updatedBy: 'Store Owner', active: true },
    { status: 'Ready to Ship', date: '27 March 2025 9:30 am', updatedBy: 'Distributer', active: true },
    { status: 'Shipped', date: '28 March 2025 9:00 pm', updatedBy: 'Delivery Partner', active: false },
    { status: 'Delivered', date: '', updatedBy: '', active: false }
  ]

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className='max-w-6xl max-h-[95vh] overflow-y-auto p-0'>
        <DialogHeader className='p-6 pb-0'>
          <div className='flex items-center justify-between'>
            <div className='flex items-center space-x-3'>
              <div>
                <DialogTitle className='text-xl'>Chi tiết đơn hàng #{order.code}</DialogTitle>
                <DialogDescription className='flex items-center space-x-2 mt-1'>
                  <span>{format(new Date(order.orderDate), 'dd/MM/yyyy HH:mm')} từ Cart</span>
                  <Badge variant='secondary' className={`text-xs ${getStatusColor(order.status, 'order')}`}>
                    {getStatusLabel(order.status, 'order')}
                  </Badge>
                </DialogDescription>
              </div>
            </div>
            <div className='flex items-center space-x-2'>
              <Button variant='outline' size='sm'>
                <Edit className='h-4 w-4 mr-2' />
                Cập nhật
              </Button>
              <Button variant='outline' size='sm'>
                <Printer className='h-4 w-4 mr-2' />
                In hóa đơn
              </Button>
              <Button variant='ghost' size='sm' onClick={() => onOpenChange(false)}>
                <X className='h-4 w-4' />
              </Button>
            </div>
          </div>
        </DialogHeader>

        <div className='grid grid-cols-3 gap-6 p-6'>
          {/* Left Column - Order Items */}
          <div className='col-span-2 space-y-6'>
            <Card>
              <CardHeader>
                <CardTitle className='flex items-center'>
                  <Package className='h-5 w-5 mr-2' />
                  Đơn hàng ({orderItems.length} sản phẩm)
                </CardTitle>
              </CardHeader>
              <CardContent>
                <div className='space-y-4'>
                  {orderItems.map((item, index) => (
                    <div key={index} className='flex items-center space-x-4 p-3 border rounded-lg'>
                      <div className='w-12 h-12 bg-gray-100 rounded-lg flex items-center justify-center'>
                        <Package className='h-6 w-6 text-gray-400' />
                      </div>
                      <div className='flex-1'>
                        <h4 className='font-medium'>{item.name}</h4>
                        <p className='text-sm text-muted-foreground'>ID: {item.id}</p>
                      </div>
                      <div className='flex items-center space-x-4'>
                        <div className='flex items-center space-x-2'>
                          <Button variant='outline' size='sm' className='h-6 w-6 p-0'>
                            -
                          </Button>
                          <span className='w-8 text-center'>{item.quantity}</span>
                          <Button variant='outline' size='sm' className='h-6 w-6 p-0'>
                            +
                          </Button>
                        </div>
                        <div className='text-right'>
                          <p className='font-medium'>{formatCurrency(item.price)}</p>
                          <p className='text-xs text-muted-foreground'>{item.quantity} item</p>
                        </div>
                      </div>
                    </div>
                  ))}
                </div>
              </CardContent>
            </Card>

            {/* Customer Information */}
            <Card>
              <CardHeader>
                <CardTitle className='flex items-center'>
                  <User className='h-5 w-5 mr-2' />
                  Thông tin khách hàng
                </CardTitle>
              </CardHeader>
              <CardContent>
                <div className='flex items-start space-x-4'>
                  <Avatar className='h-12 w-12'>
                    <AvatarFallback>{customer.fullName.charAt(0)}</AvatarFallback>
                    <AvatarImage src={customer.avatar} />
                  </Avatar>
                  <div className='flex-1 space-y-2'>
                    <h3 className='font-medium'>{customer.fullName}</h3>
                    <p className='text-sm text-muted-foreground'>Prime Customer</p>
                    <div className='grid grid-cols-2 gap-4 text-sm'>
                      <div className='flex items-center space-x-2'>
                        <Calendar className='h-4 w-4' />
                        <span>{customer.dateOfBirth}</span>
                      </div>
                      <div className='flex items-center space-x-2'>
                        <Mail className='h-4 w-4' />
                        <span>{customer.email}</span>
                      </div>
                      <div className='flex items-center space-x-2'>
                        <Phone className='h-4 w-4' />
                        <span>{customer.phone}</span>
                      </div>
                      <div className='flex items-center space-x-2'>
                        <User className='h-4 w-4' />
                        <span>{customer.gender}</span>
                      </div>
                    </div>
                    <Button variant='outline' size='sm'>
                      <Edit className='h-4 w-4 mr-2' />
                      Chỉnh sửa khách hàng
                    </Button>
                  </div>
                </div>
              </CardContent>
            </Card>

            {/* Shipping Address */}
            <Card>
              <CardHeader>
                <CardTitle className='flex items-center'>
                  <MapPin className='h-5 w-5 mr-2' />
                  Địa chỉ giao hàng
                </CardTitle>
              </CardHeader>
              <CardContent>
                <div className='space-y-4'>
                  <div>
                    <p className='font-medium'>Test data 103909 Witamer CR, Niagara Falls, NY 14305, United States</p>
                    <Button variant='outline' size='sm' className='mt-2'>
                      <Edit className='h-4 w-4 mr-2' />
                      Chỉnh sửa địa chỉ
                    </Button>
                  </div>

                  {/* Map placeholder */}
                  <div className='h-48 bg-gray-100 rounded-lg flex items-center justify-center'>
                    <p className='text-muted-foreground'>Bản đồ sẽ được hiển thị ở đây</p>
                  </div>
                </div>
              </CardContent>
            </Card>
          </div>

          {/* Right Column - Order Summary & Status */}
          <div className='space-y-6'>
            {/* Order Summary */}
            <Card>
              <CardHeader>
                <CardTitle className='text-lg'>Tổng cộng {formatCurrency(order.totalAmount)}</CardTitle>
                <Badge variant='secondary' className={`w-fit ${getStatusColor(order.paymentStatus, 'payment')}`}>
                  {getStatusLabel(order.paymentStatus, 'payment')}
                </Badge>
              </CardHeader>
              <CardContent className='space-y-3'>
                <div className='flex justify-between'>
                  <span>Tạm tính</span>
                  <span>{formatCurrency(order.subTotalAmount || 270000)}</span>
                </div>
                <div className='flex justify-between'>
                  <span>Giảm giá</span>
                  <span>-{formatCurrency(order.discountSubtotal)}</span>
                </div>
                <div className='flex justify-between'>
                  <span>Phí vận chuyển</span>
                  <span>{order.shippingFee > 0 ? formatCurrency(order.shippingFee) : 'MIỄN PHÍ'}</span>
                </div>
                <div className='flex justify-between'>
                  <span>Đóng gói quà</span>
                  <span>0.00</span>
                </div>
                <Separator />
                <div className='flex justify-between font-medium text-lg'>
                  <span>Tổng cộng</span>
                  <span>{formatCurrency(order.totalAmount)}</span>
                </div>

                <div className='mt-4 space-y-2'>
                  <h4 className='font-medium'>Chi tiết thanh toán</h4>
                  <div className='text-sm space-y-1'>
                    <p>Net Banking: AmericaSpice Bank</p>
                    <p>A/C No.: 200525XXXXXX5524</p>
                    <p>Transaction.: FGDFG44G5G6G4D1G...</p>
                    <Badge variant='default' className='bg-green-100 text-green-800'>
                      Đã nhận
                    </Badge>
                  </div>
                  <div className='flex space-x-2'>
                    <Button variant='default' size='sm' className='flex-1'>
                      Hóa đơn
                    </Button>
                    <Button variant='outline' size='sm' className='flex-1'>
                      Hóa đơn
                    </Button>
                  </div>
                </div>
              </CardContent>
            </Card>

            {/* Order Status Timeline */}
            <Card>
              <CardHeader>
                <CardTitle>Trạng thái đơn hàng</CardTitle>
              </CardHeader>
              <CardContent>
                <div className='space-y-4'>
                  {statusTimeline.map((item, index) => (
                    <div key={index} className='flex items-start space-x-3'>
                      <div className={`w-3 h-3 rounded-full mt-1 ${item.active ? 'bg-primary' : 'bg-gray-300'}`} />
                      <div className='flex-1'>
                        <p className={`font-medium ${item.active ? 'text-foreground' : 'text-muted-foreground'}`}>
                          {item.status}
                        </p>
                        {item.date && <p className='text-xs text-muted-foreground'>{item.date}</p>}
                        {item.updatedBy && <p className='text-xs text-muted-foreground'>{item.updatedBy}</p>}
                      </div>
                    </div>
                  ))}
                </div>

                <Button className='w-full mt-4'>
                  <Package className='h-4 w-4 mr-2' />
                  Chấp nhận đơn hàng
                </Button>
              </CardContent>
            </Card>

            {/* Chat Section */}
            <Card>
              <CardHeader>
                <CardTitle className='flex items-center'>
                  <MessageSquare className='h-5 w-5 mr-2' />
                  Chat
                </CardTitle>
              </CardHeader>
              <CardContent>
                <div className='space-y-3'>
                  <div className='text-sm space-y-2'>
                    <div className='bg-gray-100 p-2 rounded'>
                      <p className='font-medium'>Alex Smith</p>
                      <p>Hi!</p>
                      <span className='text-xs text-muted-foreground'>9:00 pm</span>
                    </div>
                    <div className='bg-primary text-primary-foreground p-2 rounded ml-8'>
                      <p className='font-medium'>Mr. Jack Mario</p>
                      <p>Adminiuix is amazing and we thank you. How can we thank you.</p>
                      <span className='text-xs opacity-70'>9:10 pm</span>
                    </div>
                  </div>
                  <div className='flex space-x-2'>
                    <Input placeholder='Nhập tin nhắn...' className='flex-1' />
                    <Button size='sm'>Gửi</Button>
                  </div>
                </div>
              </CardContent>
            </Card>
          </div>
        </div>
      </DialogContent>
    </Dialog>
  )
}
