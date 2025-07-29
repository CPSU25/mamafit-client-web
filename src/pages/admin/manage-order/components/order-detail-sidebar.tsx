import { OrderById } from '@/@types/manage-order.types'
import { Badge } from '@/components/ui/badge'
import { Separator } from '@/components/ui/separator'
import { Avatar, AvatarFallback, AvatarImage } from '@/components/ui/avatar'
import { Button } from '@/components/ui/button'

import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card'
import { ProductImageViewer } from '@/components/ui/image-viewer'
import { getStatusColor, getStatusLabel } from '../data/data'
import {
  MapPin,
  Package,
  Edit,
  Printer,
  X,
  Phone,
  Mail,
  Calendar,
  Clock,
  CreditCard,
  Truck,
  User,
  ShoppingBag,
  UserCheck
} from 'lucide-react'
import { useGetUserById } from '@/services/admin/manage-user.service'
import { useOrder, useOrderDetail } from '@/services/admin/manage-order.service'
import GoongMap from '@/components/Goong/GoongMap'
import dayjs from 'dayjs'
import { OrderAssignChargeDialog } from './order-assign-task-dialog'
import { useState } from 'react'

interface OrderDetailSidebarProps {
  order: OrderById | null
  isOpen: boolean
  onClose: () => void
}

export function OrderDetailSidebar({ order, isOpen, onClose }: OrderDetailSidebarProps) {
  const { data: user } = useGetUserById(order?.userId ?? '')
  const { data: orderDetail } = useOrder(order?.id ?? '')
  const { data: orderDetailItem } = useOrderDetail(orderDetail?.data?.items[0].id ?? '')
  const [assignChargeDialogOpen, setAssignChargeDialogOpen] = useState(false)
  console.log(orderDetailItem)

  if (!isOpen) return null

  if (!order) return null

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
      { key: 'CREATED', label: 'Đơn hàng đã tạo', icon: ShoppingBag },
      { key: 'CONFIRMED', label: 'Comfirmed Order', icon: Package },
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

  const handleAssignChargeSuccess = () => {
    // Refetch order detail data without page reload
    // The order detail query will automatically refetch when needed
    console.log('Assign charge success - data will be refetched automatically')
  }

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
              <h2 className='text-xl font-bold text-primary'>#{orderDetail?.data.code}</h2>
              <p className='text-sm text-muted-foreground'>Order Code</p>
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
                <CardHeader className='pb-1'>
                  <CardTitle className='text-sm font-medium flex items-center text-muted-foreground'>
                    <User className='h-4 w-4 mr-2' />
                    Customer Information
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
                    Customer Information
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
                    Order Items
                  </div>
                  <div className='flex items-center space-x-2'>
                    <Badge variant='secondary' className='text-xs'>
                      {orderDetail?.data?.items?.length || order.items?.length || 0} items
                    </Badge>
                    {orderDetail?.data?.items?.[0]?.itemType === 'DESIGN_REQUEST' && orderDetailItem?.data && (
                      <Button
                        size='sm'
                        variant='outline'
                        onClick={() => setAssignChargeDialogOpen(true)}
                        className='h-6 px-2 text-xs'
                      >
                        <UserCheck className='h-3 w-3 mr-1' />
                        Assign
                      </Button>
                    )}
                  </div>
                </CardTitle>
              </CardHeader>
              <CardContent className='space-y-4'>
                {(orderDetail?.data?.items || order.items || []).length > 0 ? (
                  (orderDetail?.data?.items || order.items || []).map((item, index) => {
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
                              <div className='bg-card/80 backdrop-blur-sm border border-border rounded-lg p-3 shadow-sm'>
                                <div className='flex items-center space-x-2 mb-3'>
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
                                    Hình ảnh tham khảo ({item.designRequest.images.length})
                                  </span>
                                </div>
                                <div className='grid grid-cols-4 gap-2 pl-6'>
                                  {item.designRequest.images.map((imageUrl: string, imgIndex: number) => (
                                    <ProductImageViewer
                                      key={imgIndex}
                                      src={imageUrl}
                                      alt={`Design request image ${imgIndex + 1}`}
                                      className='aspect-square'
                                    />
                                  ))}
                                </div>
                              </div>
                            )}

                            {/* Assign Charge Button for Design Request */}
                            <div className='pt-2 border-t border-border'>
                              <Button
                                size='sm'
                                onClick={() => setAssignChargeDialogOpen(true)}
                                className='w-full'
                                disabled={!orderDetailItem?.data}
                              >
                                <UserCheck className='h-4 w-4 mr-2' />
                                Giao việc cho Milestone
                              </Button>
                            </div>
                          </div>
                        </div>
                      )
                    } else {
                      return (
                        <div key={index} className='space-y-3'>
                          <div className='flex items-center space-x-3 p-3 bg-muted/30 rounded-lg'>
                            <ProductImageViewer
                              src={item.preset?.images?.[0] || item.maternityDressDetail?.images?.[0] || ''}
                              alt={item.preset?.styleName || item.maternityDressDetail?.name || item.itemType}
                            />
                            <div className='flex-1 min-w-0'>
                              <h4 className='font-medium text-sm truncate'>{item.itemType}</h4>
                              {item.preset?.styleName && (
                                <p className='text-xs text-muted-foreground truncate'>{item.preset.styleName}</p>
                              )}
                              {item.maternityDressDetail?.name && (
                                <p className='text-xs text-muted-foreground truncate'>
                                  {item.maternityDressDetail.name}
                                </p>
                              )}
                              <p className='text-sm font-semibold text-primary'>{formatCurrency(item.price)}</p>
                            </div>
                            <div className='text-center'>
                              <div className='w-8 h-8 bg-primary/10 rounded-full flex items-center justify-center'>
                                <span className='text-xs font-bold text-primary'>{item.quantity}</span>
                              </div>
                            </div>
                          </div>

                          {/* Assign Charge Button for PRESET/READY_TO_BUY items */}
                          <div className='pt-2 border-t border-border'>
                            <Button
                              size='sm'
                              onClick={() => setAssignChargeDialogOpen(true)}
                              className='w-full'
                              disabled={!orderDetailItem?.data}
                            >
                              <UserCheck className='h-4 w-4 mr-2' />
                              Giao việc cho Milestone
                            </Button>
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
              </CardContent>
            </Card>

            {orderDetail?.data?.address && orderDetail?.data?.address !== null && (
              <Card>
                <CardHeader className='pb-3'>
                  <CardTitle className='text-sm font-medium flex items-center text-muted-foreground'>
                    <MapPin className='h-4 w-4 mr-2' />
                    Shipping Address
                  </CardTitle>
                </CardHeader>
                <CardContent className='space-y-3'>
                  <div className='text-sm space-y-1'>
                    <p className='font-medium'>{orderDetail?.data?.address.street}</p>
                    <p className='text-muted-foreground'>
                      {[
                        orderDetail?.data?.address.ward,
                        orderDetail?.data?.address.district,
                        orderDetail?.data?.address.province
                      ]
                        .filter(Boolean)
                        .join(', ')}
                    </p>
                  </div>

                  <div className='rounded-lg overflow-hidden border'>
                    <GoongMap
                      center={[orderDetail?.data?.address.longitude, orderDetail?.data?.address.latitude]}
                      zoom={16}
                      className='h-32'
                    />
                  </div>
                </CardContent>
              </Card>
            )}

            <Card>
              <CardHeader className='pb-3'>
                <CardTitle className='text-sm font-medium flex items-center text-muted-foreground'>
                  <CreditCard className='h-4 w-4 mr-2' />
                  Payment Details
                </CardTitle>
              </CardHeader>
              <CardContent className='space-y-3'>
                <div className='space-y-2 text-sm'>
                  {order.subTotalAmount && (
                    <div className='flex justify-between'>
                      <span className='text-muted-foreground'>Product Price</span>
                      <span>{formatCurrency(order.subTotalAmount)}</span>
                    </div>
                  )}
                  {order.discountSubtotal !== 0 && order.discountSubtotal !== undefined && (
                    <div className='flex justify-between'>
                      <span className='text-muted-foreground'>Discount</span>
                      <span className='text-green-600'>-{formatCurrency(order.discountSubtotal)}</span>
                    </div>
                  )}
                  <Separator />
                  {order.depositSubtotal !== 0 && order.depositSubtotal !== undefined && (
                    <div className='flex justify-between'>
                      <span className='text-muted-foreground'>Deposit</span>
                      <span>{formatCurrency(order.depositSubtotal)}</span>
                    </div>
                  )}
                  {order.shippingFee !== undefined && order.shippingFee !== 0 ? (
                    <div className='flex justify-between'>
                      <span className='text-muted-foreground'>Shipping Fee</span>
                      <span>{formatCurrency(order.shippingFee)}</span>
                    </div>
                  ) : (
                    <div className='flex justify-between'>
                      <span className='text-muted-foreground'>Shipping Fee</span>
                      <span>0</span>
                    </div>
                  )}
                  {order.serviceAmount !== 0 && order.serviceAmount !== undefined ? (
                    <div className='flex justify-between'>
                      <span className='text-muted-foreground'>Service Fee</span>
                      <span>{formatCurrency(order?.serviceAmount)}</span>
                    </div>
                  ) : (
                    <div className='flex justify-between'>
                      <span className='text-muted-foreground'>Service Fee</span>
                      <span>0</span>
                    </div>
                  )}
                  <Separator />
                  <div className='flex justify-between font-semibold text-base'>
                    <span>Total</span>
                    <span className='text-primary'>{formatCurrency(order.totalAmount || 0)}</span>
                  </div>
                  {order.totalPaid !== undefined && order.totalPaid !== 0 ? (
                    <div className='flex justify-between text-sm'>
                      <span className='text-muted-foreground'>Paid</span>
                      <span className='text-green-600 font-medium'>{formatCurrency(order.totalPaid)}</span>
                    </div>
                  ) : (
                    <div className='flex justify-between'>
                      <span className='text-muted-foreground'>Paid</span>
                      <span>0</span>
                    </div>
                  )}
                  {order.remainingBalance !== undefined && order.remainingBalance !== 0 ? (
                    <div className='flex justify-between text-sm'>
                      <span className='text-muted-foreground'>Remaining</span>
                      <span className='text-orange-600 font-medium'>{formatCurrency(order.remainingBalance)}</span>
                    </div>
                  ) : (
                    <div className='flex justify-between'>
                      <span className='text-muted-foreground'>Remaining</span>
                      <span>0</span>
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
                  {order.paymentMethod !== undefined && (
                    <span className='text-xs text-muted-foreground'>
                      {order.paymentMethod === 'CASH' ? 'Cash' : 'Bank Transfer'}
                    </span>
                  )}
                </div>
              </CardContent>
            </Card>

            <Card>
              <CardHeader className='pb-3'>
                <CardTitle className='text-sm font-medium flex items-center text-muted-foreground'>
                  <Clock className='h-4 w-4 mr-2' />
                  Order Status
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
                              Updated at {formatDate(order.updatedAt)}
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
            Update Status
          </Button>
          <div className='flex space-x-2'>
            <Button variant='outline' size='sm' className='flex-1'>
              <Edit className='h-4 w-4 mr-2' />
              Edit
            </Button>
            <Button variant='outline' size='sm' className='flex-1'>
              <Printer className='h-4 w-4 mr-2' />
              Print Invoice
            </Button>
          </div>
        </div>
      </div>
      <OrderAssignChargeDialog
        open={assignChargeDialogOpen}
        onOpenChange={setAssignChargeDialogOpen}
        orderItem={orderDetailItem?.data || null}
        onSuccess={handleAssignChargeSuccess}
      />
    </>
  )
}
