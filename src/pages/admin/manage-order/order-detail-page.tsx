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
  Ruler,
  UserCheck,
  BarChart3,
  Palette
} from 'lucide-react'

import { useOrder, useOrdersByDesignRequest } from '@/services/admin/manage-order.service'
import type { OrderItemType } from '@/@types/manage-order.types'
import { useGetUserById } from '@/services/admin/manage-user.service'
import GoongMap from '@/components/Goong/GoongMap'
import { getItemTypeLabel, getStatusColor, getStatusLabel } from './data/data'
import StatusOrderTimeline from './components/milestone/status-timeline-orderItem'
import { useAdminOrderItemsWithTasks } from '@/services/admin/admin-task.service'
import { OrderAssignDialog } from './components/order-assign-dialog'
import { useCreateShipping } from '@/services/global/ghtk.service'
import { GHTKOrder } from '@/@types/ghtk.types'
import { DeliveryOrderSuccessDialog } from '@/pages/staff/components/delivery-order-success-dialog'
import { useAuth } from '@/context/auth-context'

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
  { key: 'CREATED', label: 'Đơn hàng đã tạo', icon: ShoppingBag },
  { key: 'CONFIRMED', label: 'Đã xác nhận', icon: Package },
  { key: 'IN_PROGRESS', label: 'Đang sản xuất', icon: Package },
  { key: 'AWAITING_PAID_REST', label: 'Đang chờ thanh toán', icon: Package },
  { key: 'PACKAGING', label: 'Đóng gói', icon: Package },
  { key: 'DELIVERING', label: 'Đang giao hàng', icon: Truck },
  { key: 'COMPLETED', label: 'Đã hoàn thành', icon: Package },
  { key: 'CANCELLED', label: 'Đã hủy', icon: Package },
  { key: 'RETURNED', label: 'Đã trả lại', icon: Package }
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
  const { data: orderDetail } = useOrder(orderId ?? '')
  const { hasRole } = useAuth()
  const [selectedItemForAssign, setSelectedItemForAssign] = useState<string>('')
  const [assignChargeDialogOpen, setAssignChargeDialogOpen] = useState(false)
  const [shippingOrder, setShippingOrder] = useState<GHTKOrder | null>(null)
  const [showShippingDialog, setShowShippingDialog] = useState(false)

  // Sử dụng mutation hook để tạo shipping với React Query pattern
  const createShippingMutation = useCreateShipping()

  const orderItems = orderDetail?.data?.items || []
  const orderItemIds = orderItems.map((it) => it.id)
  const orderItemsData = useAdminOrderItemsWithTasks(orderItemIds, true)
  const firstDesignItem = orderItems.find((it) => it.itemType === 'DESIGN_REQUEST')
  const designRequestId = firstDesignItem?.designRequest?.id
  const { data: ordersByDesign, isLoading: loadingDesignOrders } = useOrdersByDesignRequest(designRequestId)
  const getAssignButtonProps = (itemId: string, itemIndex?: number) => {
    // Tìm index thực của item theo id để tránh sai lệch khi lọc danh sách
    const realIndex = orderItems.findIndex((it) => it.id === itemId)
    const itemQuery = orderItemsData[realIndex >= 0 ? realIndex : (itemIndex ?? 0)]
    const itemData = itemQuery?.data
    const hasMilestones = itemData?.milestones && itemData.milestones.length > 0

    return {
      text: itemQuery?.isLoading
        ? 'Đang tải...'
        : hasMilestones
          ? 'Giao nhiệm vụ cho nhân viên'
          : 'Chưa thể giao nhiệm vụ',
      disabled: itemQuery?.isLoading || !hasMilestones,
      onClick: () => {
        if (hasMilestones) {
          setSelectedItemForAssign(itemId)
          setAssignChargeDialogOpen(true)
        }
      }
    }
  }
  const handleAssignChargeSuccess = () => {
    // Refetch order detail data without page reload
    // The order detail query will automatically refetch when needed
    console.log('Assign charge success - data will be refetched automatically')
  }
  const getSelectedItemData = () => {
    const selectedIndex = orderItems.findIndex((item) => item.id === selectedItemForAssign)
    return selectedIndex >= 0 ? (orderItemsData[selectedIndex]?.data ?? null) : null
  }

  // Kiểm tra xem tất cả milestone của tất cả items đã hoàn thành chưa
  const areAllMilestonesCompleted = () => {
    if (orderItemsData.length === 0) return false

    return orderItemsData.every((itemQuery) => {
      if (itemQuery.isLoading || !itemQuery.data || !itemQuery.data.milestones) {
        return false
      }

      // Kiểm tra tất cả milestone của item này đã hoàn thành
      return itemQuery.data.milestones.every((milestone) => {
        // Kiểm tra tất cả task trong milestone đã hoàn thành (AdminMilestone dùng tasks thay vì maternityDressTasks)
        return milestone.tasks.every(
          (task) => task.detail.status === 'DONE' || task.detail.status === 'PASS' || task.detail.status === 'FAIL'
        )
      })
    })
  }

  // Xử lý tạo đơn shipping với React Query pattern
  const handleCreateShipping = () => {
    if (!order?.data?.id) return

    createShippingMutation.mutate(order.data.id, {
      onSuccess: (response) => {
        if (response.data.success) {
          setShippingOrder(response.data.order)
          setShowShippingDialog(true)
          // Toast và cache invalidation đã được xử lý trong service
        }
        // Error handling cũng đã được xử lý trong service
      }
    })
  }

  const navigate = useNavigate()
  const [chatMessage, setChatMessage] = useState('')
  const roleBasePath = hasRole('Admin') ? '/system/admin' : hasRole('Manager') ? '/system/manager' : '/system/admin'

  // Data fetching
  const { data: order, isLoading: orderLoading } = useOrder(orderId ?? '')
  const { data: user, isLoading: userLoading } = useGetUserById(order?.data?.userId ?? '')

  // Memoized computations
  const statusTimeline = useMemo(() => getStatusTimeline(order?.data?.status), [order?.data?.status])

  // Kiểm tra điều kiện tạo shipping
  const allMilestonesCompleted = areAllMilestonesCompleted()
  const canCreateShipping =
    allMilestonesCompleted && (order?.data?.status === 'IN_PROGRESS' || order?.data?.status === 'PACKAGING')

  // Event handlers
  const handleSendMessage = useCallback(() => {
    if (chatMessage.trim()) {
      console.log('Sending message:', chatMessage)
      setChatMessage('')
    }
  }, [chatMessage])

  const handleNavigateBack = useCallback(() => {
    navigate(`${roleBasePath}/manage-order`)
  }, [navigate, roleBasePath])

  // Loading state
  if (orderLoading || userLoading) {
    return (
      <Main>
        <div className='container mx-auto py-6'>
          <div className='flex items-center justify-center min-h-[400px]'>
            <div className='text-center space-y-2'>
              <div className='animate-spin rounded-full h-8 w-8 border-b-2 border-primary mx-auto' />
              <p className='text-muted-foreground'>Đang tải chi tiết đơn hàng...</p>
            </div>
          </div>
        </div>
      </Main>
    )
  }

  // Error state - no order found
  if (!order?.data) {
    return (
      <Main>
        <div className='container mx-auto py-6'>
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
        </div>
      </Main>
    )
  }

  return (
    <Main>
      <div className='container space-y-4'>
        <div className='relative overflow-hidden rounded-2xl border-2 border-violet-200 dark:border-violet-800 shadow-xl shadow-violet-100/50 dark:shadow-violet-900/20'>
          <div className='absolute inset-0 bg-gradient-to-r from-violet-600 via-violet-500 to-purple-600 dark:from-violet-700 dark:via-violet-600 dark:to-purple-700' />
          <div className='absolute inset-0 bg-gradient-to-b from-transparent via-white/10 to-white/20 dark:via-white/5 dark:to-white/10' />

          {/* Content */}
          <div className='relative p-6 text-white'>
            <div className='flex items-start justify-between mb-4'>
              <div className='space-y-2'>
                <div className='flex items-center space-x-2 mb-2'>
                  <div className='w-2 h-2 bg-white rounded-full animate-pulse' />
                  <span className='text-white/80 text-sm font-medium tracking-wide'>CHI TIẾT ĐƠN HÀNG</span>
                </div>
                <h1 className='text-2xl font-bold text-white drop-shadow-sm'>#{order.data.code}</h1>
                <p className='text-violet-100 text-sm'>Mã đơn hàng</p>
              </div>

              <Button
                size='sm'
                onClick={handleNavigateBack}
                className='bg-white/10 hover:bg-white/20 border border-white/20 backdrop-blur-sm text-white transition-all duration-200'
                variant='ghost'
              >
                <ChevronLeft className='h-4 w-4 mr-2' />
                Quay lại danh sách
              </Button>
            </div>

            <div className='flex items-center justify-between'>
              <div className='space-y-1'>
                <h3 className='text-lg font-bold text-white drop-shadow-sm'>
                  {getItemTypeLabel(order.data.items[0]?.itemType) || 'Đơn hàng'}
                </h3>
                <p className='text-violet-100 text-xs'>Loại đơn hàng</p>
              </div>
              <div className='flex items-center space-x-3'>
                <Badge
                  variant='secondary'
                  className={`${getStatusColor(order.data.status, 'order')} text-xs font-medium px-4 py-2 bg-white/90 dark:bg-white/80 text-violet-800 shadow-sm`}
                >
                  {getStatusLabel(order.data.status, 'order')}
                </Badge>
                <span className='text-xs text-violet-100 bg-white/10 px-3 py-2 rounded-full backdrop-blur-sm'>
                  {formatDate(order.data.createdAt)}
                </span>
              </div>
            </div>
          </div>
        </div>

        {/* Main Content Grid */}
        <div className='grid gap-4 lg:grid-cols-3'>
          {/* Left Column - Main Content */}
          <div className='lg:col-span-2 space-y-4'>
            {/* Customer Information - Enhanced violet theme */}
            {user?.data ? (
              <Card className='border-violet-200 dark:border-violet-800 shadow-lg shadow-violet-100/50 dark:shadow-violet-900/20 bg-gradient-to-br from-white via-violet-50/30 to-white dark:from-card dark:via-violet-950/10 dark:to-card'>
                <CardHeader className='pb-3'>
                  <CardTitle className='text-sm font-semibold flex items-center text-violet-700 dark:text-violet-300'>
                    <div className='w-8 h-8 bg-violet-100 dark:bg-violet-900/50 rounded-lg flex items-center justify-center mr-3'>
                      <User className='h-4 w-4 text-violet-600 dark:text-violet-400' />
                    </div>
                    Thông tin khách hàng
                  </CardTitle>
                </CardHeader>
                <CardContent className='space-y-3'>
                  <div className='flex items-center space-x-4'>
                    <Avatar className='h-12 w-12 ring-2 ring-violet-200 dark:ring-violet-700'>
                      <AvatarFallback className='text-sm bg-violet-100 dark:bg-violet-900 text-violet-600 dark:text-violet-300 font-semibold'>
                        {user.data.fullName?.charAt(0)?.toUpperCase() || 'U'}
                      </AvatarFallback>
                      <AvatarImage src={user.data.profilePicture} />
                    </Avatar>
                    <div className='flex-1 min-w-0'>
                      <h3 className='font-semibold text-sm text-foreground truncate'>{user.data.fullName}</h3>
                      <p className='text-xs text-muted-foreground flex items-center mt-1'>
                        <Mail className='h-3 w-3 mr-2 text-violet-500' />
                        {user.data.userEmail}
                      </p>
                    </div>
                  </div>

                  <div className='grid grid-cols-1 gap-3 pt-2'>
                    {user.data.phoneNumber && (
                      <div className='flex items-center text-xs text-muted-foreground bg-violet-50/50 dark:bg-violet-950/20 p-3 rounded-lg'>
                        <Phone className='h-4 w-4 mr-3 text-violet-500' />
                        <span>{user.data.phoneNumber}</span>
                      </div>
                    )}
                    {user.data.dateOfBirth && (
                      <div className='flex items-center text-xs text-muted-foreground bg-violet-50/50 dark:bg-violet-950/20 p-3 rounded-lg'>
                        <Calendar className='h-4 w-4 mr-3 text-violet-500' />
                        <span>{formatDate(user.data.dateOfBirth)}</span>
                      </div>
                    )}
                  </div>

                  {orderDetail?.data?.measurementDiary && (
                    <div className='border-t border-violet-200 dark:border-violet-800 pt-4 mt-4'>
                      <div className='flex items-center text-violet-700 dark:text-violet-300 mb-3'>
                        <Ruler className='h-4 w-4 mr-2' />
                        <span className='text-sm font-semibold'>Nhật ký số đo</span>
                      </div>
                      <div className='grid grid-cols-2 gap-3 text-sm'>
                        <div className='bg-violet-50 dark:bg-violet-950/30 p-3 rounded-lg'>
                          <span className='text-muted-foreground block text-xs'>Tuổi</span>
                          <span className='font-semibold text-violet-700 dark:text-violet-300'>
                            {orderDetail.data.measurementDiary.age}
                          </span>
                        </div>
                        <div className='bg-violet-50 dark:bg-violet-950/30 p-3 rounded-lg'>
                          <span className='text-muted-foreground block text-xs'>Chiều cao</span>
                          <span className='font-semibold text-violet-700 dark:text-violet-300'>
                            {orderDetail.data.measurementDiary.height} cm
                          </span>
                        </div>
                        <div className='bg-violet-50 dark:bg-violet-950/30 p-3 rounded-lg'>
                          <span className='text-muted-foreground block text-xs'>Cân nặng</span>
                          <span className='font-semibold text-violet-700 dark:text-violet-300'>
                            {orderDetail.data.measurementDiary.weight} kg
                          </span>
                        </div>
                        <div className='bg-violet-50 dark:bg-violet-950/30 p-3 rounded-lg'>
                          <span className='text-muted-foreground block text-xs'>3 vòng</span>
                          <span className='font-semibold text-violet-700 dark:text-violet-300'>
                            {orderDetail.data.measurementDiary.bust}/{orderDetail.data.measurementDiary.waist}/
                            {orderDetail.data.measurementDiary.hip}
                          </span>
                        </div>
                        <div className='col-span-2 bg-violet-50 dark:bg-violet-950/30 p-3 rounded-lg'>
                          <span className='text-muted-foreground block text-xs'>Ngày đầu kỳ kinh cuối</span>
                          <span className='font-semibold text-violet-700 dark:text-violet-300'>
                            {formatDate(orderDetail.data.measurementDiary.firstDateOfLastPeriod)}
                          </span>
                        </div>
                      </div>
                    </div>
                  )}
                </CardContent>
              </Card>
            ) : (
              <Card className='border-violet-200 dark:border-violet-800 shadow-lg'>
                <CardHeader className='pb-3'>
                  <CardTitle className='text-base font-semibold flex items-center text-violet-700 dark:text-violet-300'>
                    <div className='w-8 h-8 bg-violet-100 dark:bg-violet-900/50 rounded-lg flex items-center justify-center mr-3'>
                      <User className='h-4 w-4 text-violet-600 dark:text-violet-400' />
                    </div>
                    Customer Information
                  </CardTitle>
                </CardHeader>
                <CardContent>
                  <div className='flex items-center space-x-4'>
                    <div className='w-12 h-12 bg-violet-100 dark:bg-violet-900/50 rounded-full animate-pulse'></div>
                    <div className='flex-1 space-y-3'>
                      <div className='h-4 bg-violet-100 dark:bg-violet-900/50 rounded animate-pulse'></div>
                      <div className='h-3 bg-violet-100 dark:bg-violet-900/50 rounded w-2/3 animate-pulse'></div>
                    </div>
                  </div>
                </CardContent>
              </Card>
            )}

            {/* Measurements List - Enhanced design */}
            {orderDetail?.data?.measurementDiary?.measurements &&
              orderDetail.data.measurementDiary.measurements.length > 0 && (
                <Card className='border-violet-200 dark:border-violet-800 shadow-lg shadow-violet-100/50 dark:shadow-violet-900/20'>
                  <CardHeader className='pb-3'>
                    <CardTitle className='text-sm font-semibold flex items-center justify-between text-violet-700 dark:text-violet-300'>
                      <div className='flex items-center'>
                        <div className='w-8 h-8 bg-violet-100 dark:bg-violet-900/50 rounded-lg flex items-center justify-center mr-3'>
                          <Ruler className='h-4 w-4 text-violet-600 dark:text-violet-400' />
                        </div>
                        Lịch sử số đo
                      </div>
                      <Badge
                        variant='secondary'
                        className='text-xs bg-violet-100 text-violet-700 dark:bg-violet-900/50 dark:text-violet-300'
                      >
                        {orderDetail.data.measurementDiary.measurements.length} bản ghi
                      </Badge>
                    </CardTitle>
                  </CardHeader>
                  <CardContent className='space-y-3'>
                    {orderDetail.data.measurementDiary.measurements
                      .slice()
                      .sort((a, b) => new Date(b.createdAt).getTime() - new Date(a.createdAt).getTime())
                      .map((m, index) => (
                        <div
                          key={m.id}
                          className={`border-2 rounded-xl p-4 transition-all duration-200 ${
                            index === 0
                              ? 'border-violet-300 dark:border-violet-600 bg-gradient-to-br from-violet-50 via-white to-violet-50/50 dark:from-violet-950/30 dark:via-card dark:to-violet-950/20 shadow-md'
                              : 'border-violet-100 dark:border-violet-800 bg-card hover:border-violet-200 dark:hover:border-violet-700'
                          }`}
                        >
                          <div className='flex items-center justify-between mb-3'>
                            <div className='flex items-center space-x-2'>
                              {index === 0 && <div className='w-2 h-2 bg-violet-500 rounded-full animate-pulse' />}
                              <span className='text-xs font-medium text-violet-600 dark:text-violet-400'>
                                {index === 0 ? 'Cập nhật mới nhất' : 'Bản ghi trước'}
                              </span>
                            </div>
                            <div className='flex items-center space-x-2'>
                              {m.isLocked && (
                                <Badge className='text-[10px] bg-violet-500 hover:bg-violet-600'>Đã khóa</Badge>
                              )}
                              <span className='text-xs text-muted-foreground'>
                                {formatDate(m.updatedAt || m.createdAt)}
                              </span>
                            </div>
                          </div>
                          <div className='grid grid-cols-3 gap-3 text-xs'>
                            {[
                              { label: 'Vòng ngực', value: m.bust },
                              { label: 'Vòng eo', value: m.waist },
                              { label: 'Vòng hông', value: m.hip },
                              { label: 'Vai', value: m.shoulder },
                              { label: 'Cổ', value: m.neck },
                              { label: 'Dài váy', value: m.dressLength },
                              { label: 'Chu vi ngực', value: m.chestAround },
                              { label: 'Dài tay', value: m.sleeveLength },
                              { label: 'Rộng vai', value: m.shoulderWidth },
                              { label: 'Dài chân', value: m.legLength },
                              { label: 'Cạp quần', value: m.pantsWaist },
                              { label: 'Bụng', value: m.stomach },
                              { label: 'Đùi', value: m.thigh },
                              { label: 'Tuần thai', value: m.weekOfPregnancy },
                              { label: 'Cân nặng', value: m.weight }
                            ].map((item, idx) => (
                              <div key={idx} className='bg-violet-50/50 dark:bg-violet-950/20 p-2 rounded-lg'>
                                <div className='text-muted-foreground text-[10px] uppercase tracking-wide mb-1'>
                                  {item.label}
                                </div>
                                <div className='text-sm font-semibold text-violet-700 dark:text-violet-300'>
                                  {item.value}
                                </div>
                              </div>
                            ))}
                          </div>
                        </div>
                      ))}
                  </CardContent>
                </Card>
              )}

            {/* Shipping Address - Enhanced violet theme */}
            {order.data.address && (
              <Card className='border-violet-200 dark:border-violet-800 shadow-lg shadow-violet-100/50 dark:shadow-violet-900/20 bg-gradient-to-br from-white via-violet-50/30 to-white dark:from-card dark:via-violet-950/10 dark:to-card'>
                <CardHeader className='pb-3'>
                  <CardTitle className='text-base font-semibold flex items-center text-violet-700 dark:text-violet-300'>
                    <div className='w-8 h-8 bg-violet-100 dark:bg-violet-900/50 rounded-lg flex items-center justify-center mr-3'>
                      <MapPin className='h-5 w-5 text-violet-600 dark:text-violet-400' />
                    </div>
                    Địa chỉ giao hàng
                  </CardTitle>
                </CardHeader>
                <CardContent className='space-y-3'>
                  <div className='bg-violet-50/50 dark:bg-violet-950/20 p-4 rounded-xl border border-violet-200 dark:border-violet-700'>
                    <p className='text-sm font-semibold text-foreground mb-2'>{order.data.address.street}</p>
                    <p className='text-xs text-muted-foreground'>
                      {[order.data.address.ward, order.data.address.district, order.data.address.province]
                        .filter(Boolean)
                        .join(', ')}
                    </p>
                  </div>

                  {order.data.address.longitude && order.data.address.latitude && (
                    <div className='rounded-xl overflow-hidden border-2 border-violet-200 dark:border-violet-700 shadow-md'>
                      <GoongMap
                        center={[order.data.address.longitude, order.data.address.latitude]}
                        zoom={16}
                        className='h-48'
                      />
                    </div>
                  )}
                </CardContent>
              </Card>
            )}

            {/* Design Request - moved out as standalone Card(s) */}
            {(() => {
              const allItems = orderDetail?.data?.items || order.data.items || []
              const designItems = allItems.filter((it) => it.itemType === 'DESIGN_REQUEST')
              if (designItems.length === 0) return null
              return designItems.map((item, index) => (
                <Card
                  key={`design-${item.id}`}
                  className='border-violet-200 dark:border-violet-800 shadow-lg shadow-violet-100/50 dark:shadow-violet-900/20 overflow-hidden !p-0'
                >
                  {/* Header with gradient */}
                  <div className='bg-gradient-to-r from-violet-600 via-violet-500 to-purple-600 text-white p-4'>
                    <div className='flex items-center justify-between'>
                      <div className='flex items-center space-x-3'>
                        <div className='w-8 h-8 bg-white/20 rounded-xl flex items-center justify-center backdrop-blur-sm'>
                          <Palette className='w-4 h-4' />
                        </div>
                        <span className='font-bold text-lg'>Yêu cầu thiết kế</span>
                      </div>
                      <div className='flex items-center space-x-4'>
                        <span className='text-lg font-bold'>{formatCurrency(item.price)}</span>
                        <div className='w-8 h-8 bg-white/20 rounded-xl flex items-center justify-center backdrop-blur-sm'>
                          <span className='text-sm font-bold'>{item.quantity}</span>
                        </div>
                      </div>
                    </div>
                  </div>

                  {/* Content */}
                  <div className='p-4 space-y-3'>
                    {item.designRequest?.description && (
                      <div className='bg-white/80 dark:bg-card/80 backdrop-blur-sm border border-violet-200 dark:border-violet-700 rounded-xl p-4 shadow-sm'>
                        <div className='flex items-center space-x-2 mb-3'>
                          <div className='w-5 h-5 bg-violet-500 rounded-lg flex items-center justify-center'>
                            <svg className='w-3 h-3 text-white' fill='currentColor' viewBox='0 0 20 20'>
                              <path
                                fillRule='evenodd'
                                d='M18 10a8 8 0 11-16 0 8 8 0 0116 0zm-7-4a1 1 0 11-2 0 1 1 0 012 0zM9 9a1 1 0 000 2v3a1 1 0 001 1h1a1 1 0 100-2v-3a1 1 0 00-1-1H9z'
                                clipRule='evenodd'
                              />
                            </svg>
                          </div>
                          <span className='text-md font-semibold text-violet-700 dark:text-violet-300'>
                            Mô tả thiết kế
                          </span>
                        </div>
                        <p className='text-sm text-muted-foreground leading-relaxed pl-7'>
                          {item.designRequest.description}
                        </p>
                      </div>
                    )}

                    {item.designRequest?.images && item.designRequest.images.length > 0 && (
                      <div className='bg-white/80 dark:bg-card/80 backdrop-blur-sm border border-violet-200 dark:border-violet-700 rounded-xl p-4 shadow-sm'>
                        <div className='flex items-center space-x-2 mb-4'>
                          <div className='w-5 h-5 bg-violet-500 rounded-lg flex items-center justify-center'>
                            <svg className='w-3 h-3 text-white' fill='currentColor' viewBox='0 0 20 20'>
                              <path
                                fillRule='evenodd'
                                d='M4 3a2 2 0 00-2 2v10a2 2 0 002 2h12a2 2 0 002-2V5a2 2 0 00-2-2H4zm12 12H4l4-8 3 6 2-4 3 6z'
                                clipRule='evenodd'
                              />
                            </svg>
                          </div>
                          <span className='text-base font-semibold text-violet-700 dark:text-violet-300'>
                            Hình ảnh tham khảo ({item.designRequest.images.length})
                          </span>
                        </div>
                        <div className='grid grid-cols-4 gap-3 pl-7'>
                          {item.designRequest.images.map((imageUrl: string, imgIndex: number) => (
                            <ProductImageViewer
                              key={imgIndex}
                              src={imageUrl}
                              alt={`Design request image ${imgIndex + 1}`}
                              containerClassName='w-full h-40'
                              imgClassName='p-1'
                              fit='contain'
                            />
                          ))}
                        </div>
                      </div>
                    )}

                    {/* Status Timeline */}
                    <div className='bg-white/80 dark:bg-card/80 backdrop-blur-sm border border-violet-200 dark:border-violet-700 rounded-xl p-4 shadow-sm'>
                      <div className='flex items-center space-x-2 mb-3'>
                        <div className='w-5 h-5 bg-violet-500 rounded-lg flex items-center justify-center'>
                          <BarChart3 className='w-3 h-3 text-white' />
                        </div>
                        <span className='text-sm font-semibold text-violet-700 dark:text-violet-300'>Tiến độ</span>
                      </div>
                      <div className='pl-7'>
                        <StatusOrderTimeline orderItemId={item.id} />
                      </div>
                    </div>

                    {/* Assign button */}
                    <div className='pt-3 border-t border-violet-200 dark:border-violet-700'>
                      {(() => {
                        const buttonProps = getAssignButtonProps(item.id, index)
                        return (
                          <Button
                            size='sm'
                            onClick={buttonProps.onClick}
                            className='w-full bg-violet-600 hover:bg-violet-700 text-white shadow-lg shadow-violet-500/25'
                            disabled={buttonProps.disabled}
                          >
                            <UserCheck className='h-4 w-4 mr-2' />
                            {buttonProps.text}
                          </Button>
                        )
                      })()}
                    </div>
                  </div>
                </Card>
              ))
            })()}

            {/* Order Items / Orders generated from Design Request */}
            <Card className='border-violet-200 dark:border-violet-800 shadow-lg shadow-violet-100/50 dark:shadow-violet-900/20'>
              <CardHeader className='pb-3'>
                <CardTitle className='text-base font-semibold flex items-center justify-between text-violet-700 dark:text-violet-300'>
                  <div className='flex items-center'>
                    <div className='w-8 h-8 bg-violet-100 dark:bg-violet-900/50 rounded-lg flex items-center justify-center mr-3'>
                      <ShoppingBag className='h-4 w-4 text-violet-600 dark:text-violet-400' />
                    </div>
                    {designRequestId ? 'Đơn được tạo từ yêu cầu thiết kế này' : 'Sản phẩm trong đơn'}
                  </div>
                  <Badge
                    variant='secondary'
                    className='text-xs bg-violet-100 text-violet-700 dark:bg-violet-900/50 dark:text-violet-300'
                  >
                    {designRequestId
                      ? `${ordersByDesign?.data?.length || 0} đơn`
                      : (() => {
                          const allItems = orderDetail?.data?.items || order.data.items || []
                          return `${allItems.filter((it) => it.itemType !== 'DESIGN_REQUEST').length} sản phẩm`
                        })()}
                  </Badge>
                </CardTitle>
              </CardHeader>
              <CardContent className='space-y-4'>
                {designRequestId ? (
                  loadingDesignOrders ? (
                    <div className='text-center py-8 text-muted-foreground text-sm'>Đang tải danh sách đơn...</div>
                  ) : (ordersByDesign?.data || []).length > 0 ? (
                    (ordersByDesign?.data || []).map((od) => {
                      const items = (od as unknown as { items?: OrderItemType[] }).items || []
                      const first = items[0]
                      const previewImg = first?.preset?.images?.[0] || first?.maternityDressDetail?.image?.[0] || ''
                      const rawTitle = first?.preset?.name ?? first?.maternityDressDetail?.name
                      const title =
                        typeof rawTitle === 'string' && rawTitle.trim().length > 0
                          ? rawTitle
                          : first?.maternityDressDetail
                            ? 'Váy bầu chưa có tên'
                            : first?.itemType
                      const styleName = first?.preset?.styleName
                      const totalQty = items.reduce((sum, it) => sum + (it.quantity || 0), 0)
                      return (
                        <div
                          key={od.id}
                          className='p-4 rounded-xl border border-violet-200 dark:border-violet-700 bg-violet-50/40 dark:bg-violet-950/10 cursor-pointer hover:border-violet-300 dark:hover:border-violet-600 transition-colors'
                          onClick={() => navigate(`${roleBasePath}/manage-order/${od.id}`)}
                        >
                          <div className='flex items-center justify-between gap-4'>
                            <div className='flex-1 min-w-0'>
                              <div className='flex items-start gap-3'>
                                <ProductImageViewer
                                  src={previewImg}
                                  alt={title || 'Sản phẩm đơn hàng'}
                                  containerClassName='w-16 h-16 rounded-lg border-2 border-violet-200 dark:border-violet-700'
                                />
                                <div className='min-w-0'>
                                  <div className='font-semibold text-sm truncate'>#{od.code}</div>
                                  <div className='text-xs text-muted-foreground'>
                                    {formatDate(od.createdAt)} •{' '}
                                    {getStatusLabel(od.status as unknown as string, 'order')}
                                  </div>
                                  {title && (
                                    <div className='text-sm mt-1 truncate'>
                                      <span className='font-medium'>{title}</span>
                                      {styleName && (
                                        <span className='text-muted-foreground'> • Phong cách: {styleName}</span>
                                      )}
                                    </div>
                                  )}
                                  {first && (
                                    <div className='text-xs text-muted-foreground mt-1'>
                                      SL: {first.quantity} / Tổng SL: {totalQty}
                                    </div>
                                  )}
                                </div>
                              </div>
                            </div>
                            <div className='text-right shrink-0 space-y-1'>
                              <div className='text-sm font-bold text-violet-600 dark:text-violet-400'>
                                {formatCurrency(od.totalAmount || 0)}
                              </div>
                              <div className='flex items-center gap-2 justify-end'>
                                <Badge
                                  variant='outline'
                                  className={`${getStatusColor(od.status as unknown as string, 'order')} text-xs`}
                                >
                                  {getStatusLabel(od.status as unknown as string, 'order')}
                                </Badge>
                                <Badge
                                  variant='outline'
                                  className={`${getStatusColor(od.paymentStatus as unknown as string, 'payment')} text-xs`}
                                >
                                  {getStatusLabel(od.paymentStatus as unknown as string, 'payment')}
                                </Badge>
                                {od.deliveryMethod && (
                                  <span className='text-xs px-2 py-1 rounded-full bg-violet-100 dark:bg-violet-900/40 text-violet-700 dark:text-violet-300'>
                                    {od.deliveryMethod === 'DELIVERY' ? 'Giao hàng' : 'Nhận tại cửa hàng'}
                                  </span>
                                )}
                                <span className='text-xs px-2 py-1 rounded-full bg-violet-100 dark:bg-violet-900/40 text-violet-700 dark:text-violet-300'>
                                  {items.length} sản phẩm
                                </span>
                              </div>
                            </div>
                          </div>
                        </div>
                      )
                    })
                  ) : (
                    <div className='text-center py-12 text-muted-foreground'>
                      <div className='w-16 h-16 bg-violet-100 dark:bg-violet-900/50 rounded-2xl flex items-center justify-center mx-auto mb-4'>
                        <ShoppingBag className='h-8 w-8 text-violet-400' />
                      </div>
                      <p className='text-sm font-medium'>Không có đơn nào được tạo từ yêu cầu thiết kế này</p>
                    </div>
                  )
                ) : (orderDetail?.data?.items || order.data.items || []).filter(
                    (it) => it.itemType !== 'DESIGN_REQUEST'
                  ).length > 0 ? (
                  (orderDetail?.data?.items || order.data.items || [])
                    .filter((it) => it.itemType !== 'DESIGN_REQUEST')
                    .map((item, index) => {
                      const rawTitle = item.preset?.name ?? item.maternityDressDetail?.name
                      const titleText =
                        typeof rawTitle === 'string' && rawTitle.trim().length > 0
                          ? rawTitle
                          : item.maternityDressDetail
                            ? 'Váy bầu chưa có tên'
                            : item.itemType
                      const subtitleText = item.preset?.styleName
                        ? `Phong cách: ${item.preset.styleName}`
                        : item.maternityDressDetail
                          ? [
                              item.maternityDressDetail.color ? `Màu: ${item.maternityDressDetail.color}` : null,
                              item.maternityDressDetail.size ? `Size: ${item.maternityDressDetail.size}` : null,
                              item.maternityDressDetail.sku ? `SKU: ${item.maternityDressDetail.sku}` : null
                            ]
                              .filter(Boolean)
                              .join(' • ')
                          : null

                      return (
                        <div key={index} className='space-y-3'>
                          <div className='flex items-center space-x-4 p-4 bg-gradient-to-r from-violet-50 to-purple-50/50 dark:from-violet-950/30 dark:to-purple-950/20 rounded-xl border border-violet-200 dark:border-violet-700'>
                            <ProductImageViewer
                              src={item.preset?.images?.[0] || item.maternityDressDetail?.image?.[0] || ''}
                              alt={titleText}
                              containerClassName='aspect-square w-16 rounded-lg border-2 border-violet-200 dark:border-violet-700'
                              imgClassName='px-2'
                              fit='cover'
                            />
                            <div className='flex-1 min-w-0 space-y-1'>
                              <h4 className='font-semibold text-sm text-foreground truncate'>{titleText}</h4>
                              {subtitleText && (
                                <p className='text-xs text-muted-foreground truncate flex items-center'>
                                  <span className='w-1 h-1 bg-violet-400 rounded-full mr-2'></span>
                                  {subtitleText}
                                </p>
                              )}
                              <p className='text-sm font-bold text-violet-600 dark:text-violet-400'>
                                {formatCurrency(item.price)}
                              </p>
                            </div>
                            <div className='text-center'>
                              <div className='w-10 h-10 bg-violet-100 dark:bg-violet-900/50 rounded-xl flex items-center justify-center border border-violet-200 dark:border-violet-700'>
                                <span className='text-sm font-bold text-violet-600 dark:text-violet-400'>
                                  {item.quantity}
                                </span>
                              </div>
                            </div>
                          </div>

                          {/* Status Timeline */}
                          <div className='bg-white/80 dark:bg-card/80 backdrop-blur-sm border border-violet-200 dark:border-violet-700 rounded-xl p-4 shadow-sm'>
                            <div className='flex items-center space-x-2 mb-3'>
                              <div className='w-5 h-5 bg-violet-500 rounded-lg flex items-center justify-center'>
                                <BarChart3 className='w-3 h-3 text-white' />
                              </div>
                              <span className='text-sm font-semibold text-violet-700 dark:text-violet-300'>Tiến độ</span>
                            </div>
                            <StatusOrderTimeline orderItemId={item.id} />
                          </div>

                          {/* Assign button */}
                          <div className='pt-2 border-t border-violet-200 dark:border-violet-700'>
                            {(() => {
                              const buttonProps = getAssignButtonProps(item.id, index)
                              return (
                                <Button
                                  size='sm'
                                  onClick={buttonProps.onClick}
                                  className='w-full bg-violet-600 hover:bg-violet-700 text-white shadow-lg shadow-violet-500/25'
                                  disabled={buttonProps.disabled}
                                >
                                  <UserCheck className='h-4 w-4 mr-2' />
                                  {buttonProps.text}
                                </Button>
                              )
                            })()}
                          </div>
                        </div>
                      )
                    })
                ) : (
                  <div className='text-center py-8 text-muted-foreground'>
                    <div className='w-16 h-16 bg-violet-100 dark:bg-violet-900/50 rounded-2xl flex items-center justify-center mx-auto mb-4'>
                      <ShoppingBag className='h-8 w-8 text-violet-400' />
                    </div>
                    <p className='text-sm font-medium'>Không có sản phẩm trong đơn</p>
                    <p className='text-xs text-muted-foreground/60 mt-1'>Sản phẩm sẽ hiển thị tại đây</p>
                  </div>
                )}
              </CardContent>
            </Card>
          </div>

          {/* Right Column - Payment & Chat */}
          <div className='space-y-4'>
            {/* Payment Summary - Enhanced violet theme */}
            <Card className='border-violet-200 dark:border-violet-800 shadow-lg shadow-violet-100/50 dark:shadow-violet-900/20 bg-gradient-to-br from-white via-violet-50/30 to-white dark:from-card dark:via-violet-950/10 dark:to-card'>
              <CardHeader className='pb-3'>
                <div className='flex items-center justify-between'>
                  <CardTitle className='text-base font-semibold flex items-center text-violet-700 dark:text-violet-300'>
                    <div className='w-8 h-8 bg-violet-100 dark:bg-violet-900/50 rounded-lg flex items-center justify-center mr-3'>
                      <CreditCard className='h-5 w-5 text-violet-600 dark:text-violet-400' />
                    </div>
                    Thanh toán
                  </CardTitle>
                  {order.data.paymentStatus && (
                    <Badge
                      variant='outline'
                      className={`${getStatusColor(order.data.paymentStatus, 'payment')} text-xs px-3 py-1`}
                    >
                      {getStatusLabel(order.data.paymentStatus, 'payment')}
                    </Badge>
                  )}
                </div>
              </CardHeader>
              <CardContent className='space-y-3'>
                <div className='space-y-3 text-xs'>
                  {order.data.subTotalAmount && (
                    <div className='flex justify-between items-center p-3 bg-violet-50/50 dark:bg-violet-950/20 rounded-lg'>
                      <span className='text-muted-foreground'>Giá sản phẩm</span>
                      <span className='font-semibold'>{formatCurrency(order.data.subTotalAmount)}</span>
                    </div>
                  )}
                  {order.data.discountSubtotal !== 0 && order.data.discountSubtotal !== undefined && (
                    <div className='flex justify-between items-center p-3 bg-green-50 dark:bg-green-950/20 rounded-lg'>
                      <span className='text-muted-foreground'>Giảm giá</span>
                      <span className='text-green-600 font-semibold'>
                        -{formatCurrency(order.data.discountSubtotal)}
                      </span>
                    </div>
                  )}

                  <Separator className='bg-violet-200 dark:bg-violet-700' />

                  {order.data.depositSubtotal !== 0 && order.data.depositSubtotal !== undefined && (
                    <div className='flex justify-between items-center p-3 bg-violet-50/50 dark:bg-violet-950/20 rounded-lg'>
                      <span className='text-muted-foreground'>Đặt cọc</span>
                      <span className='font-semibold'>{formatCurrency(order.data.depositSubtotal)}</span>
                    </div>
                  )}
                  <div className='flex justify-between items-center p-3 bg-violet-50/50 dark:bg-violet-950/20 rounded-lg'>
                    <span className='text-muted-foreground'>Phí vận chuyển</span>
                    <span className='font-semibold'>
                      {order.data.shippingFee !== undefined && order.data.shippingFee !== 0
                        ? formatCurrency(order.data.shippingFee)
                        : '0 ₫'}
                    </span>
                  </div>
                  <div className='flex justify-between items-center p-3 bg-violet-50/50 dark:bg-violet-950/20 rounded-lg'>
                    <span className='text-muted-foreground'>Phí dịch vụ</span>
                    <span className='font-semibold'>
                      {order.data.serviceAmount !== 0 && order.data.serviceAmount !== undefined
                        ? formatCurrency(order.data.serviceAmount)
                        : '0 ₫'}
                    </span>
                  </div>

                  <Separator className='bg-violet-200 dark:bg-violet-700' />

                  <div className='flex justify-between items-center p-4 bg-gradient-to-r from-violet-100 to-purple-100 dark:from-violet-950/30 dark:to-purple-950/30 rounded-xl border border-violet-200 dark:border-violet-700'>
                    <span className='font-bold text-base text-violet-700 dark:text-violet-300'>Tổng cộng</span>
                    <span className='text-lg font-bold text-violet-600 dark:text-violet-400'>
                      {formatCurrency(order.data.totalAmount || 0)}
                    </span>
                  </div>

                  <div className='grid grid-cols-2 gap-2'>
                    <div className='p-3 bg-green-50 dark:bg-green-950/20 rounded-lg border border-green-200 dark:border-green-800'>
                      <span className='text-xs text-muted-foreground block mb-1'>Đã thanh toán</span>
                      <span className='text-green-600 font-bold text-base'>
                        {order.data.totalPaid !== undefined && order.data.totalPaid !== 0
                          ? formatCurrency(order.data.totalPaid)
                          : '0 ₫'}
                      </span>
                    </div>
                    <div className='p-3 bg-orange-50 dark:bg-orange-950/20 rounded-lg border border-orange-200 dark:border-orange-800'>
                      <span className='text-xs text-muted-foreground block mb-1'>Còn lại</span>
                      <span className='text-orange-600 font-bold text-base'>
                        {order.data.remainingBalance !== undefined && order.data.remainingBalance !== 0
                          ? formatCurrency(order.data.remainingBalance)
                          : '0 ₫'}
                      </span>
                    </div>
                  </div>
                </div>

                <div className='flex items-center justify-between pt-2 border-t border-violet-200 dark:border-violet-700'>
                  <div className='space-y-1'>
                    {order.data.paymentMethod && (
                      <span className='text-xs text-muted-foreground bg-violet-50 dark:bg-violet-950/30 px-3 py-1 rounded-full'>
                        {order.data.paymentMethod === 'CASH' ? 'Tiền mặt' : 'Chuyển khoản'}
                      </span>
                    )}
                  </div>
                  {order.data.deliveryMethod && (
                    <span className='text-xs text-muted-foreground bg-violet-50 dark:bg-violet-950/30 px-3 py-1 rounded-full'>
                      {order.data.deliveryMethod === 'DELIVERY' ? 'Giao hàng' : 'Nhận tại cửa hàng'}
                    </span>
                  )}
                </div>

                {/* Shipping Button */}
                {canCreateShipping && (
                  <div className='pt-3 border-t border-violet-200 dark:border-violet-700'>
                    <Button
                      onClick={handleCreateShipping}
                      disabled={createShippingMutation.isPending}
                      className='w-full bg-gradient-to-r from-green-600 to-emerald-600 hover:from-green-700 hover:to-emerald-700 text-white shadow-lg shadow-green-500/25 transition-all duration-200 disabled:opacity-50 disabled:cursor-not-allowed'
                      size='sm'
                    >
                      <Truck className='h-4 w-4 mr-2' />
                      {createShippingMutation.isPending ? 'Đang tạo đơn...' : 'Tạo đơn giao hàng'}
                    </Button>
                    <p className='text-xs text-center text-muted-foreground mt-2'>
                      {createShippingMutation.isPending
                        ? 'Đang xử lý yêu cầu tạo đơn giao hàng...'
                        : 'Tất cả milestone đã hoàn thành, có thể tạo đơn giao hàng'}
                    </p>
                    {createShippingMutation.isError && (
                      <p className='text-xs text-center text-red-500 mt-1'>Có lỗi xảy ra, vui lòng thử lại</p>
                    )}
                  </div>
                )}
              </CardContent>
            </Card>
            {/* Order Status Timeline - Enhanced violet theme */}
            <Card className='border-violet-200 dark:border-violet-800 shadow-lg shadow-violet-100/50 dark:shadow-violet-900/20 bg-gradient-to-br from-white via-violet-50/30 to-white dark:from-card dark:via-violet-950/10 dark:to-card'>
              <CardHeader className='pb-3'>
                <CardTitle className='text-base font-semibold flex items-center text-violet-700 dark:text-violet-300'>
                  <div className='w-8 h-8 bg-violet-100 dark:bg-violet-900/50 rounded-lg flex items-center justify-center mr-3'>
                    <Clock className='h-5 w-5 text-violet-600 dark:text-violet-400' />
                  </div>
                  Tiến trình trạng thái đơn hàng
                </CardTitle>
              </CardHeader>
              <CardContent>
                <div className='space-y-3'>
                  {statusTimeline.map((item, index) => {
                    const Icon = item.icon
                    const isLast = index === statusTimeline.length - 1
                    return (
                      <div key={index} className='flex items-start space-x-4 relative'>
                        {/* Timeline line */}
                        {!isLast && (
                          <div
                            className={`absolute left-4 top-12 w-0.5 h-8 ${
                              item.active
                                ? 'bg-gradient-to-b from-violet-500 to-violet-300'
                                : 'bg-violet-200 dark:bg-violet-800'
                            }`}
                          />
                        )}

                        {/* Status icon */}
                        <div
                          className={`w-8 h-8 rounded-xl flex items-center justify-center border-2 transition-all duration-300 ${
                            item.current
                              ? 'bg-violet-600 border-violet-600 text-white shadow-lg shadow-violet-500/30 scale-110'
                              : item.active
                                ? 'bg-violet-100 dark:bg-violet-900/50 border-violet-500 text-violet-600 dark:text-violet-400'
                                : 'bg-violet-50 dark:bg-violet-950/20 border-violet-200 dark:border-violet-800 text-violet-300 dark:text-violet-600'
                          }`}
                        >
                          {item.current ? (
                            <svg className='h-4 w-4' fill='currentColor' viewBox='0 0 20 20'>
                              <path
                                fillRule='evenodd'
                                d='M16.707 5.293a1 1 0 010 1.414l-8 8a1 1 0 01-1.414 0l-4-4a1 1 0 011.414-1.414L8 12.586l7.293-7.293a1 1 0 011.414 0z'
                                clipRule='evenodd'
                              />
                            </svg>
                          ) : item.active ? (
                            <div className='h-3 w-3 rounded-full bg-current' />
                          ) : (
                            <Icon className='h-3 w-3' />
                          )}
                        </div>

                        {/* Status content */}
                        <div className='flex-1 pb-4'>
                          <div
                            className={`p-3 rounded-xl border transition-all duration-200 ${
                              item.current
                                ? 'bg-gradient-to-r from-violet-50 to-purple-50 dark:from-violet-950/30 dark:to-purple-950/20 border-violet-300 dark:border-violet-600'
                                : item.active
                                  ? 'bg-violet-50/50 dark:bg-violet-950/10 border-violet-200 dark:border-violet-700'
                                  : 'bg-muted/30 border-muted-foreground/10'
                            }`}
                          >
                            <p
                              className={`text-sm font-semibold ${
                                item.current
                                  ? 'text-violet-700 dark:text-violet-300'
                                  : item.active
                                    ? 'text-foreground'
                                    : 'text-muted-foreground'
                              }`}
                            >
                              {item.label}
                            </p>
                            {item.current && (
                              <p className='text-xs text-violet-600 dark:text-violet-400 mt-1 flex items-center'>
                                <svg className='h-3 w-3 mr-1' fill='currentColor' viewBox='0 0 20 20'>
                                  <path
                                    fillRule='evenodd'
                                    d='M10 18a8 8 0 100-16 8 8 0 000 16zm1-12a1 1 0 10-2 0v4a1 1 0 00.293.707l2.828 2.829a1 1 0 101.415-1.415L11 9.586V6z'
                                    clipRule='evenodd'
                                  />
                                </svg>
                                Cập nhật lúc {formatDate(order.data.updatedAt)}
                              </p>
                            )}
                          </div>
                        </div>
                      </div>
                    )
                  })}
                </div>
              </CardContent>
            </Card>
            {/* Chat Section - Enhanced violet theme */}
            <Card className='border-violet-200 dark:border-violet-800 shadow-lg shadow-violet-100/50 dark:shadow-violet-900/20 bg-gradient-to-br from-white via-violet-50/30 to-white dark:from-card dark:via-violet-950/10 dark:to-card'>
              <CardHeader className='pb-3'>
                <CardTitle className='text-base font-semibold flex items-center text-violet-700 dark:text-violet-300'>
                  <div className='w-8 h-8 bg-violet-100 dark:bg-violet-900/50 rounded-lg flex items-center justify-center mr-3'>
                    <MessageSquare className='h-5 w-5 text-violet-600 dark:text-violet-400' />
                  </div>
                  Trò chuyện
                </CardTitle>
              </CardHeader>
              <CardContent className='space-y-3'>
                <div className='space-y-3 max-h-48 overflow-y-auto custom-scrollbar'>
                  {MOCK_CHAT_MESSAGES.map((msg) => (
                    <div
                      key={msg.id}
                      className={`p-3 rounded-lg transition-colors ${
                        msg.isCustomer
                          ? 'bg-violet-50/50 dark:bg-violet-950/20 border border-violet-200 dark:border-violet-700'
                          : 'bg-gradient-to-r from-violet-100 to-purple-100 dark:from-violet-900/40 dark:to-purple-900/40 ml-8 border border-violet-300 dark:border-violet-600'
                      }`}
                    >
                      <p className='font-medium text-sm text-violet-700 dark:text-violet-300'>{msg.sender}</p>
                      <p className='text-sm mt-1 text-foreground'>{msg.message}</p>
                      <span className='text-xs text-violet-500 dark:text-violet-400 mt-1 block'>{msg.time}</span>
                    </div>
                  ))}
                </div>

                <div className='flex gap-2'>
                  <Input
                    placeholder='Nhập tin nhắn...'
                    value={chatMessage}
                    onChange={(e) => setChatMessage(e.target.value)}
                    onKeyDown={(e) => e.key === 'Enter' && handleSendMessage()}
                    className='flex-1 border-violet-200 dark:border-violet-700 focus:border-violet-500 dark:focus:border-violet-400'
                  />
                  <Button
                    size='sm'
                    onClick={handleSendMessage}
                    className='bg-violet-600 hover:bg-violet-700 text-white shadow-lg shadow-violet-500/25'
                  >
                    <Send className='h-4 w-4' />
                  </Button>
                </div>
              </CardContent>
            </Card>
          </div>
        </div>
      </div>
      <OrderAssignDialog
        open={assignChargeDialogOpen}
        onOpenChange={setAssignChargeDialogOpen}
        orderItem={getSelectedItemData() || null}
        onSuccess={handleAssignChargeSuccess}
      />
      {/* Custom scrollbar styles */}
      <style>{`
        .custom-scrollbar::-webkit-scrollbar {
          width: 6px;
        }
        .custom-scrollbar::-webkit-scrollbar-track {
          background: rgb(245 243 255 / 0.3);
        }
        .custom-scrollbar::-webkit-scrollbar-thumb {
          background: rgb(139 92 246 / 0.4);
          border-radius: 3px;
        }
        .custom-scrollbar::-webkit-scrollbar-thumb:hover {
          background: rgb(139 92 246 / 0.6);
        }
        @media (prefers-color-scheme: dark) {
          .custom-scrollbar::-webkit-scrollbar-track {
            background: rgb(55 48 163 / 0.1);
          }
          .custom-scrollbar::-webkit-scrollbar-thumb {
            background: rgb(139 92 246 / 0.3);
          }
          .custom-scrollbar::-webkit-scrollbar-thumb:hover {
            background: rgb(139 92 246 / 0.5);
          }
        }
      `}</style>

      {/* Delivery Order Success Dialog */}
      <DeliveryOrderSuccessDialog
        open={showShippingDialog}
        onOpenChange={setShowShippingDialog}
        order={shippingOrder}
      />
    </Main>
  )
}
