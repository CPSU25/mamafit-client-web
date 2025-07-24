import { OrderById } from '@/@types/admin.types'
import { Badge } from '@/components/ui/badge'
import { Separator } from '@/components/ui/separator'
import { Avatar, AvatarFallback, AvatarImage } from '@/components/ui/avatar'
import { Button } from '@/components/ui/button'
import { ScrollArea } from '@/components/ui/scroll-area'
import { getStatusColor, getStatusLabel } from '../data/data'
import { MapPin, Package, Edit, Printer, X } from 'lucide-react'
import { useGetUserById } from '@/services/admin/manage-user.service'

interface OrderDetailSidebarProps {
  order: OrderById | null
  isOpen: boolean
  onClose: () => void
}

export function OrderDetailSidebar({ order, isOpen, onClose }: OrderDetailSidebarProps) {
  // Always call hooks unconditionally at the top level
  const { data: user } = useGetUserById(order?.userId ?? '')
  console.log(user)

  if (!order || !isOpen) return null

  const formatCurrency = (amount: number) => {
    return new Intl.NumberFormat('vi-VN', {
      style: 'currency',
      currency: 'VND'
    }).format(amount)
  }

  // Mock customer data - in real app, this would come from API
  //   const customer = {
  //     id: order.userId,
  //     fullName: 'Roy Smith',
  //     email: 'roy@testgmail.com',
  //     phone: '+820 58023O554A1',
  //     avatar: '',
  //     dateOfBirth: '28 Jan 2001, 24 years',
  //     gender: 'Male'
  //   }

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
    <>
      {/* Mobile Overlay */}
      <div className='fixed inset-0 bg-black/50 z-40 lg:hidden' onClick={onClose} />

      <div className='fixed top-0 right-0 w-80 lg:w-96 h-full bg-background border-l shadow-lg z-50 flex flex-col'>
        {/* Header */}
        <div className='p-6 border-b'>
          <div className='flex items-center justify-between mb-4'>
            <div>
              <h2 className='text-lg font-semibold'>#{order.code}</h2>
              <p className='text-sm text-muted-foreground'>Order ID</p>
            </div>
            <Button variant='ghost' size='sm' onClick={onClose}>
              <X className='h-4 w-4' />
            </Button>
          </div>

          {/* Customer Info Header */}
          <div className='flex items-center space-x-3'>
            <Avatar className='h-10 w-10'>
              <AvatarFallback>{user?.data?.fullName.charAt(0)}</AvatarFallback>
              <AvatarImage src={user?.data?.profilePicture} />
            </Avatar>
            <div>
              <h3 className='font-medium'>{user?.data?.fullName}</h3>
              <p className='text-sm text-muted-foreground'>{user?.data?.userEmail}</p>
            </div>
          </div>
        </div>

        {/* Scrollable Content */}
        <ScrollArea className='flex-1 p-6'>
          <div className='space-y-6'>
            {/* Order Items */}
            <div>
              <h4 className='font-medium mb-3 text-sm text-muted-foreground'>
                Đơn hàng ({orderItems.length} sản phẩm)
              </h4>
              <div className='space-y-3'>
                {orderItems.map((item, index) => (
                  <div key={index} className='flex items-center space-x-3 p-3 border rounded-lg'>
                    <div className='w-10 h-10 bg-gray-100 rounded-lg flex items-center justify-center'>
                      <Package className='h-5 w-5 text-gray-400' />
                    </div>
                    <div className='flex-1 min-w-0'>
                      <h4 className='font-medium text-sm truncate'>{item.name}</h4>
                      <p className='text-xs text-muted-foreground'>ID: {item.id}</p>
                      <p className='text-sm font-medium'>{formatCurrency(item.price)}</p>
                    </div>
                    <div className='text-center'>
                      <span className='text-sm font-medium'>{item.quantity}</span>
                      <p className='text-xs text-muted-foreground'>Item</p>
                    </div>
                  </div>
                ))}
              </div>
            </div>

            {/* Address */}
            <div>
              <h4 className='font-medium mb-3 text-sm text-muted-foreground flex items-center'>
                <MapPin className='h-4 w-4 mr-2' />
                Địa chỉ
              </h4>
              <p className='text-sm mb-3'>Test data 103909 Witamer CR, Niagara Falls, NY 14305, United States</p>

              {/* Map placeholder */}
              <div className='h-32 bg-gray-100 rounded-lg flex items-center justify-center'>
                <p className='text-xs text-muted-foreground'>Bản đồ</p>
              </div>
            </div>

            {/* Payment Details */}
            <div>
              <h4 className='font-medium mb-3 text-sm text-muted-foreground'>Chi tiết thanh toán</h4>
              <div className='space-y-2 text-sm'>
                <div className='flex justify-between'>
                  <span>Tạm tính</span>
                  <span>{formatCurrency(order.subTotalAmount || 270000)}</span>
                </div>
                <div className='flex justify-between'>
                  <span>Giảm giá</span>
                  <span>-{formatCurrency(order.discountSubtotal ?? 0)}</span>
                </div>
                <div className='flex justify-between'>
                  <span>Phí vận chuyển</span>
                  <span>{(order.shippingFee ?? 0 > 0) ? formatCurrency(order.shippingFee ?? 0) : 'MIỄN PHÍ'}</span>
                </div>
                <Separator />
                <div className='flex justify-between font-medium text-base'>
                  <span>Tổng cộng</span>
                  <span>{formatCurrency(order.totalAmount ?? 0)}</span>
                </div>
              </div>

              <Badge
                variant='secondary'
                className={`w-fit mt-2 ${getStatusColor(order.paymentStatus ?? '', 'payment')}`}
              >
                {getStatusLabel(order.paymentStatus ?? '', 'payment')}
              </Badge>

              <div className='mt-3 text-xs space-y-1'>
                <p>Net Banking: AmericaSpice Bank</p>
                <p>A/C No.: 200525XXXXXX5524</p>
                <Badge variant='default' className='bg-green-100 text-green-800 text-xs'>
                  Đã nhận
                </Badge>
              </div>
            </div>

            {/* Order Status Timeline */}
            <div>
              <h4 className='font-medium mb-3 text-sm text-muted-foreground'>Trạng thái đơn hàng</h4>
              <div className='space-y-3'>
                {statusTimeline.map((item, index) => (
                  <div key={index} className='flex items-start space-x-3'>
                    <div className={`w-2 h-2 rounded-full mt-2 ${item.active ? 'bg-primary' : 'bg-gray-300'}`} />
                    <div className='flex-1'>
                      <p className={`text-sm font-medium ${item.active ? 'text-foreground' : 'text-muted-foreground'}`}>
                        {item.status}
                      </p>
                      {item.date && <p className='text-xs text-muted-foreground'>{item.date}</p>}
                      {item.updatedBy && <p className='text-xs text-muted-foreground'>{item.updatedBy}</p>}
                    </div>
                  </div>
                ))}
              </div>
            </div>
          </div>
        </ScrollArea>

        {/* Footer Actions */}
        <div className='p-6 border-t space-y-3'>
          <Button className='w-full'>
            <Package className='h-4 w-4 mr-2' />
            Chấp nhận đơn hàng
          </Button>
          <div className='flex space-x-2'>
            <Button variant='outline' size='sm' className='flex-1'>
              <Edit className='h-4 w-4 mr-2' />
              Cập nhật
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
