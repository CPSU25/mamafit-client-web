import { OrderById } from '@/@types/manage-order.types'
import { Badge } from '@/components/ui/badge'
import { Separator } from '@/components/ui/separator'
import { Avatar, AvatarFallback, AvatarImage } from '@/components/ui/avatar'
import { Button } from '@/components/ui/button'
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card'
import { ProductImageViewer } from '@/components/ui/image-viewer'
import { getItemTypeLabel, getStatusColor, getStatusLabel } from '../data/data'
import {
  MapPin,
  Package,
  X,
  Phone,
  Mail,
  Calendar,
  Clock,
  CreditCard,
  Truck,
  User,
  ShoppingBag,
  UserCheck,
  Ruler,
  CheckCircle2,
  Circle,
  Target,
  Palette,
  BarChart3
} from 'lucide-react'
import { useGetUserById } from '@/services/admin/manage-user.service'
import { useOrder } from '@/services/admin/manage-order.service'
import { useAdminOrderItemsWithTasks } from '@/services/admin/admin-task.service'
import GoongMap from '@/components/Goong/GoongMap'
import dayjs from 'dayjs'
import { useNavigate } from 'react-router-dom'
import { useAuth } from '@/context/auth-context'
import { useState } from 'react'
import { OrderAssignDialog } from './order-assign-dialog'
import StatusOrderTimeline from './milestone/status-timeline-orderItem'
import { useCreateShipping } from '@/services/global/ghtk.service'
import { GHTKOrder } from '@/@types/ghtk.types'
import { DeliveryOrderSuccessDialog } from '@/pages/staff/components/delivery-order-success-dialog'

interface OrderDetailSidebarProps {
  order: OrderById | null
  isOpen: boolean
  onClose: () => void
}

export function OrderDetailSidebar({ order, isOpen, onClose }: OrderDetailSidebarProps) {
  const navigate = useNavigate()
  const { hasRole } = useAuth()
  const { data: user } = useGetUserById(isOpen ? (order?.userId ?? '') : '')
  const { data: orderDetail } = useOrder(isOpen ? (order?.id ?? '') : '')
  const [selectedItemForAssign, setSelectedItemForAssign] = useState<string>('')
  const [assignChargeDialogOpen, setAssignChargeDialogOpen] = useState(false)
  const [shippingOrder, setShippingOrder] = useState<GHTKOrder | null>(null)
  const [showShippingDialog, setShowShippingDialog] = useState(false)

  // Sử dụng mutation hook để tạo shipping với React Query pattern
  const createShippingMutation = useCreateShipping()

  // Auto-load data cho tất cả items khi sidebar mở (dynamic, không hardcode)
  const orderItems = (isOpen && (orderDetail?.data?.items || order?.items)) || []
  const orderItemIds = orderItems.map((it) => it.id)
  const orderItemsData = useAdminOrderItemsWithTasks(orderItemIds, isOpen)

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
      { key: 'CONFIRMED', label: 'Đã xác nhận', icon: Package },
      { key: 'IN_PROGRESS', label: 'Đang sản xuất', icon: Package },
      { key: 'AWAITING_PAID_REST', label: 'Đang chờ thanh toán', icon: Package },
      { key: 'PACKAGING', label: 'Đóng gói', icon: Package },
      { key: 'DELIVERING', label: 'Đang giao hàng', icon: Truck },
      { key: 'COMPLETED', label: 'Đã hoàn thành', icon: Package },
      { key: 'CANCELLED', label: 'Đã hủy', icon: Package },
      { key: 'RETURNED', label: 'Đã trả lại', icon: Package }
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

  const getAssignButtonProps = (itemId: string, itemIndex: number) => {
    const itemQuery = orderItemsData[itemIndex]
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
    if (!order?.id) return

    createShippingMutation.mutate(order.id, {
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

  const allMilestonesCompleted = areAllMilestonesCompleted()
  const canCreateShipping = allMilestonesCompleted && (order?.status === 'IN_PROGRESS' || order?.status === 'PACKAGING')

  return (
    <>
      {/* Backdrop overlay - Enhanced with violet theme */}
      <div
        className={`fixed inset-0 bg-gradient-to-br from-violet-950/40 via-black/60 to-violet-950/40 backdrop-blur-sm z-40 lg:hidden transition-all duration-500 ${
          isOpen ? 'opacity-100' : 'opacity-0 pointer-events-none'
        }`}
        onClick={onClose}
      />

      {/* Sidebar container - Enhanced violet theme */}
      <div
        className={`fixed top-0 right-0 w-full sm:w-96 lg:w-[28rem] xl:w-[32rem] h-full bg-gradient-to-br from-background via-violet-50/30 to-background dark:from-background dark:via-violet-950/20 dark:to-background border-l-2 border-violet-200 dark:border-violet-800 shadow-2xl shadow-violet-500/10 dark:shadow-violet-900/20 z-50 transform transition-all duration-500 ease-out ${
          isOpen ? 'translate-x-0' : 'translate-x-full'
        } flex flex-col backdrop-blur-xl`}
      >
        {/* Header section - Enhanced with violet gradient */}
        <div className='flex-shrink-0 relative overflow-hidden'>
          {/* Background gradient decoration */}
          <div className='absolute inset-0 bg-gradient-to-r from-violet-600 via-violet-500 to-purple-600 dark:from-violet-700 dark:via-violet-600 dark:to-purple-700' />
          <div className='absolute inset-0 bg-gradient-to-b from-transparent via-white/10 to-white/20 dark:via-white/5 dark:to-white/10' />

          {/* Content */}
          <div className='relative p-6 text-white'>
            <div className='flex items-start justify-between mb-6'>
              <div className='space-y-1'>
                <div className='flex items-center space-x-2 mb-2'>
                  <div className='w-2 h-2 bg-white rounded-full animate-pulse' />
                  <span className='text-white/80 text-sm font-medium tracking-wide'>ORDER DETAILS</span>
                </div>
                <h2 className='text-2xl font-bold text-white drop-shadow-sm'>#{orderDetail?.data.code}</h2>
                <p className='text-violet-100 text-sm'>Order Code</p>
              </div>

              <Button
                variant='ghost'
                size='sm'
                onClick={onClose}
                className='h-10 w-10 p-0 bg-white/10 hover:bg-white/20 border border-white/20 backdrop-blur-sm text-white transition-all duration-200'
              >
                <X className='h-5 w-5' />
              </Button>
            </div>

            <div className='flex items-center justify-between'>
              <div className='space-y-1'>
                <h3 className='text-xl font-bold text-white drop-shadow-sm'>
                  {getItemTypeLabel(orderDetail?.data.items?.[0]?.itemType ?? '')}
                </h3>
                <p className='text-violet-100 text-sm'>Order Type</p>
              </div>
              <div className='flex items-center space-x-3'>
                <Badge
                  variant='secondary'
                  className={`${getStatusColor(order.status, 'order')} text-xs font-medium px-3 py-1 bg-white/90 dark:bg-white/80 text-violet-800 shadow-sm`}
                >
                  {getStatusLabel(order.status, 'order')}
                </Badge>
                <span className='text-xs text-violet-100 bg-white/10 px-2 py-1 rounded-full backdrop-blur-sm'>
                  {formatDate(order.createdAt)}
                </span>
              </div>
            </div>
          </div>
        </div>

        {/* Scrollable content */}
        <div className='flex-1 overflow-y-auto px-6 scroll-smooth custom-scrollbar'>
          <div className='space-y-6 py-6'>
            {/* Customer Information - Enhanced card design */}
            {user?.data ? (
              <Card className='border-violet-200 dark:border-violet-800 shadow-lg shadow-violet-100/50 dark:shadow-violet-900/20 bg-gradient-to-br from-white via-violet-50/30 to-white dark:from-card dark:via-violet-950/10 dark:to-card'>
                <CardHeader className='pb-4'>
                  <CardTitle className='text-base font-semibold flex items-center text-violet-700 dark:text-violet-300'>
                    <div className='w-8 h-8 bg-violet-100 dark:bg-violet-900/50 rounded-lg flex items-center justify-center mr-3'>
                      <User className='h-4 w-4 text-violet-600 dark:text-violet-400' />
                    </div>
                    Customer Information
                  </CardTitle>
                </CardHeader>
                <CardContent className='space-y-4'>
                  <div className='flex items-center space-x-4'>
                    <Avatar className='h-12 w-12 ring-2 ring-violet-200 dark:ring-violet-700'>
                      <AvatarFallback className='text-sm bg-violet-100 dark:bg-violet-900 text-violet-600 dark:text-violet-300 font-semibold'>
                        {user.data.fullName?.charAt(0)?.toUpperCase() || 'U'}
                      </AvatarFallback>
                      <AvatarImage src={user.data.profilePicture || ""} />
                    </Avatar>
                    <div className='flex-1 min-w-0'>
                      <h3 className='font-semibold text-base text-foreground truncate'>{user.data.fullName}</h3>
                      <p className='text-sm text-muted-foreground flex items-center mt-1'>
                        <Mail className='h-3 w-3 mr-2 text-violet-500' />
                        {user.data.userEmail}
                      </p>
                    </div>
                  </div>

                  <div className='grid grid-cols-1 gap-3 pt-2'>
                    {user.data.phoneNumber && (
                      <div className='flex items-center text-sm text-muted-foreground bg-violet-50/50 dark:bg-violet-950/20 p-3 rounded-lg'>
                        <Phone className='h-4 w-4 mr-3 text-violet-500' />
                        <span>{user.data.phoneNumber}</span>
                      </div>
                    )}
                    {user.data.dateOfBirth && (
                      <div className='flex items-center text-sm text-muted-foreground bg-violet-50/50 dark:bg-violet-950/20 p-3 rounded-lg'>
                        <Calendar className='h-4 w-4 mr-3 text-violet-500' />
                        <span>{formatDate(user.data.dateOfBirth)}</span>
                      </div>
                    )}
                  </div>

                  {orderDetail?.data?.measurementDiary && (
                    <div className='border-t border-violet-200 dark:border-violet-800 pt-4 mt-4'>
                      <div className='flex items-center text-violet-700 dark:text-violet-300 mb-3'>
                        <Ruler className='h-4 w-4 mr-2' />
                        <span className='text-sm font-semibold'>Measurement Diary</span>
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
                <CardHeader className='pb-4'>
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
                  <CardHeader className='pb-4'>
                    <CardTitle className='text-base font-semibold flex items-center justify-between text-violet-700 dark:text-violet-300'>
                      <div className='flex items-center'>
                        <div className='w-8 h-8 bg-violet-100 dark:bg-violet-900/50 rounded-lg flex items-center justify-center mr-3'>
                          <Ruler className='h-4 w-4 text-violet-600 dark:text-violet-400' />
                        </div>
                        Measurements History
                      </div>
                      <Badge
                        variant='secondary'
                        className='text-xs bg-violet-100 text-violet-700 dark:bg-violet-900/50 dark:text-violet-300'
                      >
                        {orderDetail.data.measurementDiary.measurements.length} records
                      </Badge>
                    </CardTitle>
                  </CardHeader>
                  <CardContent className='space-y-4'>
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
                                {index === 0 ? 'Latest Update' : 'Previous Record'}
                              </span>
                            </div>
                            <div className='flex items-center space-x-2'>
                              {m.isLocked && (
                                <Badge className='text-[10px] bg-violet-500 hover:bg-violet-600'>Locked</Badge>
                              )}
                              <span className='text-xs text-muted-foreground'>
                                {formatDate(m.updatedAt || m.createdAt)}
                              </span>
                            </div>
                          </div>
                          <div className='grid grid-cols-3 gap-3 text-xs'>
                            {[
                              { label: 'Bust', value: m.bust },
                              { label: 'Waist', value: m.waist },
                              { label: 'Hip', value: m.hip },
                              { label: 'Shoulder', value: m.shoulder },
                              { label: 'Neck', value: m.neck },
                              { label: 'Dress', value: m.dressLength },
                              { label: 'Chest around', value: m.chestAround },
                              { label: 'Sleeve', value: m.sleeveLength },
                              { label: 'Shoulder width', value: m.shoulderWidth },
                              { label: 'Leg length', value: m.legLength },
                              { label: 'Pants waist', value: m.pantsWaist },
                              { label: 'Stomach', value: m.stomach },
                              { label: 'Thigh', value: m.thigh },
                              { label: 'Tuần thai', value: m.weekOfPregnancy },
                              { label: 'Weight', value: m.weight }
                            ].map((item, idx) => (
                              <div key={idx} className='bg-violet-50/50 dark:bg-violet-950/20 p-2 rounded-lg'>
                                <div className='text-muted-foreground text-[10px] uppercase tracking-wide mb-1'>
                                  {item.label}
                                </div>
                                <div className='font-semibold text-violet-700 dark:text-violet-300'>{item.value}</div>
                              </div>
                            ))}
                          </div>
                        </div>
                      ))}
                  </CardContent>
                </Card>
              )}

            {/* Order Items - Enhanced design */}
            <Card className='border-violet-200 dark:border-violet-800 shadow-lg shadow-violet-100/50 dark:shadow-violet-900/20'>
              <CardHeader className='pb-4'>
                <CardTitle className='text-base font-semibold flex items-center justify-between text-violet-700 dark:text-violet-300'>
                  <div className='flex items-center'>
                    <div className='w-8 h-8 bg-violet-100 dark:bg-violet-900/50 rounded-lg flex items-center justify-center mr-3'>
                      <ShoppingBag className='h-4 w-4 text-violet-600 dark:text-violet-400' />
                    </div>
                    Order Items
                  </div>
                  <Badge
                    variant='secondary'
                    className='text-xs bg-violet-100 text-violet-700 dark:bg-violet-900/50 dark:text-violet-300'
                  >
                    {orderDetail?.data?.items?.length || order.items?.length || 0} items
                  </Badge>
                </CardTitle>
              </CardHeader>
              <CardContent className='space-y-5'>
                {(orderDetail?.data?.items || order.items || []).length > 0 ? (
                  (orderDetail?.data?.items || order.items || []).map((item, index) => {
                    if (item.itemType === 'DESIGN_REQUEST') {
                      return (
                        <div
                          key={index}
                          className='border-2 border-violet-200 dark:border-violet-700 bg-gradient-to-br from-violet-50 via-white to-purple-50/50 dark:from-violet-950/20 dark:via-card dark:to-purple-950/10 rounded-2xl overflow-hidden shadow-lg shadow-violet-100/50 dark:shadow-violet-900/20'
                        >
                          {/* Header with gradient */}
                          <div className='px-5 py-4 bg-gradient-to-r from-violet-600 via-violet-500 to-purple-600 text-white'>
                            <div className='flex items-center justify-between'>
                              <div className='flex items-center space-x-3'>
                                <div className='w-8 h-8 bg-white/20 rounded-xl flex items-center justify-center backdrop-blur-sm'>
                                  <Palette className='w-4 h-4' />
                                </div>
                                <span className='font-semibold text-sm'>Yêu cầu thiết kế</span>
                              </div>
                              <div className='flex items-center space-x-4'>
                                <span className='text-xl font-bold'>{formatCurrency(item.price)}</span>
                                <div className='w-8 h-8 bg-white/20 rounded-xl flex items-center justify-center backdrop-blur-sm'>
                                  <span className='text-sm font-bold'>{item.quantity}</span>
                                </div>
                              </div>
                            </div>
                          </div>

                          {/* Content */}
                          <div className='p-5 space-y-4'>
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
                                  <span className='text-sm font-semibold text-violet-700 dark:text-violet-300'>
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
                                  <span className='text-sm font-semibold text-violet-700 dark:text-violet-300'>
                                    Hình ảnh tham khảo ({item.designRequest.images.length})
                                  </span>
                                </div>
                                <div className='grid grid-cols-4 gap-3 pl-7'>
                                  {item.designRequest.images.map((imageUrl: string, imgIndex: number) => (
                                    <ProductImageViewer
                                      key={imgIndex}
                                      src={imageUrl}
                                      alt={`Design request image ${imgIndex + 1}`}
                                      containerClassName='aspect-square w-16 rounded-lg border-2 border-violet-200 dark:border-violet-700'
                                      imgClassName='p-1'
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
                                <span className='text-sm font-semibold text-violet-700 dark:text-violet-300'>
                                  Progress Status
                                </span>
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
                        </div>
                      )
                    } else {
                      const rawTitle = item.preset?.name ?? item.maternityDressDetail?.name
                      const titleText =
                        typeof rawTitle === 'string' && rawTitle.trim().length > 0
                          ? rawTitle
                          : item.maternityDressDetail
                            ? 'Váy bầu chưa có tên'
                            : item.itemType
                      const subtitleText = item.preset?.styleName
                        ? `Style: ${item.preset.styleName}`
                        : item.maternityDressDetail
                          ? [
                              item.maternityDressDetail.color ? `Color: ${item.maternityDressDetail.color}` : null,
                              item.maternityDressDetail.size ? `Size: ${item.maternityDressDetail.size}` : null,
                              item.maternityDressDetail.sku ? `SKU: ${item.maternityDressDetail.sku}` : null
                            ]
                              .filter(Boolean)
                              .join(' • ')
                          : null
                      return (
                        <div key={index} className='space-y-4'>
                          <div className='flex items-center space-x-4 p-4 bg-gradient-to-r from-violet-50 to-purple-50/50 dark:from-violet-950/30 dark:to-purple-950/20 rounded-xl border border-violet-200 dark:border-violet-700'>
                            <ProductImageViewer
                              src={item.preset?.images?.[0] || item.maternityDressDetail?.image?.[0] || ''}
                              alt={titleText}
                              containerClassName='aspect-square w-16 rounded-lg border-2 border-violet-200 dark:border-violet-700'
                              imgClassName='px-2'
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
                              <span className='text-sm font-semibold text-violet-700 dark:text-violet-300'>
                                Progress Status
                              </span>
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
                    }
                  })
                ) : (
                  <div className='text-center py-12 text-muted-foreground'>
                    <div className='w-16 h-16 bg-violet-100 dark:bg-violet-900/50 rounded-2xl flex items-center justify-center mx-auto mb-4'>
                      <ShoppingBag className='h-8 w-8 text-violet-400' />
                    </div>
                    <p className='text-sm font-medium'>No items in order</p>
                    <p className='text-xs text-muted-foreground/60 mt-1'>Order items will appear here</p>
                  </div>
                )}
              </CardContent>
            </Card>

            {/* Shipping Address - Enhanced with map */}
            {orderDetail?.data?.address && orderDetail?.data?.address !== null && (
              <Card className='border-violet-200 dark:border-violet-800 shadow-lg shadow-violet-100/50 dark:shadow-violet-900/20'>
                <CardHeader className='pb-4'>
                  <CardTitle className='text-base font-semibold flex items-center text-violet-700 dark:text-violet-300'>
                    <div className='w-8 h-8 bg-violet-100 dark:bg-violet-900/50 rounded-lg flex items-center justify-center mr-3'>
                      <MapPin className='h-4 w-4 text-violet-600 dark:text-violet-400' />
                    </div>
                    Shipping Address
                  </CardTitle>
                </CardHeader>
                <CardContent className='space-y-4'>
                  <div className='bg-violet-50/50 dark:bg-violet-950/20 p-4 rounded-xl border border-violet-200 dark:border-violet-700'>
                    <p className='font-semibold text-foreground mb-2'>{orderDetail?.data?.address.street}</p>
                    <p className='text-sm text-muted-foreground'>
                      {[
                        orderDetail?.data?.address.ward,
                        orderDetail?.data?.address.district,
                        orderDetail?.data?.address.province
                      ]
                        .filter(Boolean)
                        .join(', ')}
                    </p>
                  </div>

                  <div className='rounded-xl overflow-hidden border-2 border-violet-200 dark:border-violet-700 shadow-md'>
                    <GoongMap
                      center={[orderDetail?.data?.address.longitude, orderDetail?.data?.address.latitude]}
                      zoom={16}
                      className='h-40'
                    />
                  </div>
                </CardContent>
              </Card>
            )}

            {/* Payment Details - Enhanced design */}
            <Card className='border-violet-200 dark:border-violet-800 shadow-lg shadow-violet-100/50 dark:shadow-violet-900/20'>
              <CardHeader className='pb-4'>
                <CardTitle className='text-base font-semibold flex items-center text-violet-700 dark:text-violet-300'>
                  <div className='w-8 h-8 bg-violet-100 dark:bg-violet-900/50 rounded-lg flex items-center justify-center mr-3'>
                    <CreditCard className='h-4 w-4 text-violet-600 dark:text-violet-400' />
                  </div>
                  Payment Details
                </CardTitle>
              </CardHeader>
              <CardContent className='space-y-4'>
                <div className='space-y-3 text-sm'>
                  {order.subTotalAmount && (
                    <div className='flex justify-between items-center p-3 bg-violet-50/50 dark:bg-violet-950/20 rounded-lg'>
                      <span className='text-muted-foreground'>Product Price</span>
                      <span className='font-semibold'>{formatCurrency(order.subTotalAmount)}</span>
                    </div>
                  )}
                  {order.discountSubtotal !== 0 && order.discountSubtotal !== undefined && (
                    <div className='flex justify-between items-center p-3 bg-green-50 dark:bg-green-950/20 rounded-lg'>
                      <span className='text-muted-foreground'>Discount</span>
                      <span className='text-green-600 font-semibold'>-{formatCurrency(order.discountSubtotal)}</span>
                    </div>
                  )}

                  <Separator className='bg-violet-200 dark:bg-violet-700' />

                  {order.depositSubtotal !== 0 && order.depositSubtotal !== undefined && (
                    <div className='flex justify-between items-center p-3 bg-violet-50/50 dark:bg-violet-950/20 rounded-lg'>
                      <span className='text-muted-foreground'>Deposit</span>
                      <span className='font-semibold'>{formatCurrency(order.depositSubtotal)}</span>
                    </div>
                  )}
                  <div className='flex justify-between items-center p-3 bg-violet-50/50 dark:bg-violet-950/20 rounded-lg'>
                    <span className='text-muted-foreground'>Shipping Fee</span>
                    <span className='font-semibold'>
                      {order.shippingFee !== undefined && order.shippingFee !== 0
                        ? formatCurrency(order.shippingFee)
                        : '0 ₫'}
                    </span>
                  </div>
                  <div className='flex justify-between items-center p-3 bg-violet-50/50 dark:bg-violet-950/20 rounded-lg'>
                    <span className='text-muted-foreground'>Service Fee</span>
                    <span className='font-semibold'>
                      {order.serviceAmount !== 0 && order.serviceAmount !== undefined
                        ? formatCurrency(order?.serviceAmount)
                        : '0 ₫'}
                    </span>
                  </div>

                  <Separator className='bg-violet-200 dark:bg-violet-700' />

                  <div className='flex justify-between items-center p-4 bg-gradient-to-r from-violet-100 to-purple-100 dark:from-violet-950/30 dark:to-purple-950/30 rounded-xl border border-violet-200 dark:border-violet-700'>
                    <span className='font-bold text-lg text-violet-700 dark:text-violet-300'>Total</span>
                    <span className='text-xl font-bold text-violet-600 dark:text-violet-400'>
                      {formatCurrency(order.totalAmount || 0)}
                    </span>
                  </div>

                  <div className='grid grid-cols-2 gap-3'>
                    <div className='p-3 bg-green-50 dark:bg-green-950/20 rounded-lg border border-green-200 dark:border-green-800'>
                      <span className='text-xs text-muted-foreground block mb-1'>Paid</span>
                      <span className='text-green-600 font-bold text-lg'>
                        {order.totalPaid !== undefined && order.totalPaid !== 0
                          ? formatCurrency(order.totalPaid)
                          : '0 ₫'}
                      </span>
                    </div>
                    <div className='p-3 bg-orange-50 dark:bg-orange-950/20 rounded-lg border border-orange-200 dark:border-orange-800'>
                      <span className='text-xs text-muted-foreground block mb-1'>Remaining</span>
                      <span className='text-orange-600 font-bold text-lg'>
                        {order.remainingBalance !== undefined && order.remainingBalance !== 0
                          ? formatCurrency(order.remainingBalance)
                          : '0 ₫'}
                      </span>
                    </div>
                  </div>
                </div>

                <div className='flex items-center justify-between pt-3 border-t border-violet-200 dark:border-violet-700'>
                  <Badge
                    variant='outline'
                    className={`${getStatusColor(order.paymentStatus || '', 'payment')} text-xs px-3 py-1`}
                  >
                    {getStatusLabel(order.paymentStatus || '', 'payment')}
                  </Badge>
                  {order.paymentMethod !== undefined && (
                    <span className='text-xs text-muted-foreground bg-violet-50 dark:bg-violet-950/30 px-3 py-1 rounded-full'>
                      {order.paymentMethod === 'CASH' ? 'Cash' : 'Bank Transfer'}
                    </span>
                  )}
                </div>
              </CardContent>
            </Card>

            {/* Order Status Timeline - Enhanced design */}
            <Card className='border-violet-200 dark:border-violet-800 shadow-lg shadow-violet-100/50 dark:shadow-violet-900/20'>
              <CardHeader className='pb-4'>
                <CardTitle className='text-base font-semibold flex items-center text-violet-700 dark:text-violet-300'>
                  <div className='w-8 h-8 bg-violet-100 dark:bg-violet-900/50 rounded-lg flex items-center justify-center mr-3'>
                    <Clock className='h-4 w-4 text-violet-600 dark:text-violet-400' />
                  </div>
                  Order Status Timeline
                </CardTitle>
              </CardHeader>
              <CardContent>
                <div className='space-y-4'>
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
                            <CheckCircle2 className='h-4 w-4' />
                          ) : item.active ? (
                            <Circle className='h-3 w-3 fill-current' />
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
                                <Target className='h-3 w-3 mr-1' />
                                Updated at {formatDate(order.updatedAt)}
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
          </div>
        </div>

        {/* Action buttons footer - Enhanced violet theme */}
        <div className='flex-shrink-0 relative overflow-hidden'>
          {/* Background gradient */}
          <div className='absolute inset-0 bg-gradient-to-r from-violet-50 via-white to-violet-50 dark:from-violet-950/30 dark:via-background dark:to-violet-950/30' />

          {/* Content */}
          <div className='relative p-6 border-t-2 border-violet-200 dark:border-violet-800'>
            <div className='grid gap-2'>
              <Button
                variant='outline'
                onClick={() => {
                  const roleBasePath = hasRole('Admin')
                    ? '/system/admin'
                    : hasRole('Manager')
                      ? '/system/manager'
                      : '/system/admin'
                  navigate(`${roleBasePath}/manage-order/${order.id}`)
                }}
                className='w-full border-violet-300 text-violet-700 dark:text-violet-300'
                size='sm'
              >
                <Package className='h-4 w-4 mr-2' />
                Xem chi tiết đơn hàng
              </Button>

              {canCreateShipping && (
                <div>
                  <Button
                    onClick={handleCreateShipping}
                    disabled={createShippingMutation.isPending}
                    className='w-full bg-gradient-to-r from-green-600 to-emerald-600 hover:from-green-700 hover:to-emerald-700 text-white shadow-lg shadow-green-500/25 transition-all duration-200 disabled:opacity-50 disabled:cursor-not-allowed'
                    size='sm'
                  >
                    <Truck className='h-4 w-4 mr-2' />
                    {createShippingMutation.isPending ? 'Đang tạo đơn...' : 'Tạo đơn shipping'}
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
            </div>
          </div>
        </div>
      </div>

      <OrderAssignDialog
        open={assignChargeDialogOpen}
        onOpenChange={setAssignChargeDialogOpen}
        orderItem={getSelectedItemData() || null}
        onSuccess={handleAssignChargeSuccess}
      />

      <DeliveryOrderSuccessDialog
        open={showShippingDialog}
        onOpenChange={setShowShippingDialog}
        order={shippingOrder}
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
    </>
  )
}
