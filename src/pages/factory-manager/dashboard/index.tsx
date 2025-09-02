import { useCallback, useState } from 'react'
import {
  Package,
  Factory,
  ShoppingCart,
  Building,
  Clock,
  AlertCircle,
  CheckCircle,
  Calendar,
  ArrowUpRight,
  ArrowDownRight,
  FileText,
  Scissors,
  Palette,
  Shield
} from 'lucide-react'
import dayjs from 'dayjs'
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card'
import { Button } from '@/components/ui/button'
import { Badge } from '@/components/ui/badge'
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select'

import { Avatar, AvatarFallback, AvatarImage } from '@/components/ui/avatar'
import { cn } from '@/lib/utils/utils'
import { useNavigate } from 'react-router'
import { useAuth } from '@/context/auth-context'
import { toast } from 'sonner'

// Import API services
import {
  useDashboardSummary,
  useOrderStatus,
  useRecentOrders,
  useNotifications
} from '@/services/admin/dashboard.service'

// Import components
import { ErrorAlert } from './component/error-fallback'
import { OrderStatusChart } from './component/order-status-chart'



// Format currency helper
const formatCurrency = (amount: number): string => {
  return new Intl.NumberFormat('vi-VN', {
    style: 'currency',
    currency: 'VND',
    minimumFractionDigits: 0,
    maximumFractionDigits: 0
  }).format(amount)
}



const getStatusBadge = (status: string) => {
  const statusConfig = {
    pending: { label: 'Chờ xử lý', variant: 'secondary' as const, icon: Clock },
    in_progress: { label: 'Đang SX', variant: 'default' as const, icon: AlertCircle },
    packaging: { label: 'Đóng gói', variant: 'outline' as const, icon: Package },
    completed: { label: 'Hoàn thành', variant: 'default' as const, icon: CheckCircle },
    cancelled: { label: 'Đã hủy', variant: 'destructive' as const, icon: AlertCircle }
  }

  const normalizedStatus = status.toLowerCase().replace('_', '_')
  const config = statusConfig[normalizedStatus as keyof typeof statusConfig] || statusConfig.pending
  const Icon = config.icon

  return (
    <Badge variant={config.variant} className='gap-1'>
      <Icon className='h-3 w-3' />
      {config.label}
    </Badge>
  )
}

export default function FactoryManagerDashboard() {
  const [timeRange, setTimeRange] = useState('month')
  const navigate = useNavigate()
  const { hasRole } = useAuth()
  const roleBasePath = hasRole('Manager') ? '/system/manager' : '/system/manager'

  const handleNavigateBack = useCallback(() => {
    navigate(`${roleBasePath}/manage-order`)
  }, [navigate, roleBasePath])

  // Calculate date range based on timeRange
  const getDateRange = () => {
    const today = dayjs()
    let startTime: string
    const endTime: string = today.endOf('day').toISOString()

    switch (timeRange) {
      case 'today':
        startTime = today.startOf('day').toISOString()
        break
      case 'week':
        startTime = today.startOf('week').toISOString()
        break
      case 'month':
        startTime = today.startOf('month').toISOString()
        break
      case 'quarter':
        startTime = today.startOf('month').subtract(2, 'month').toISOString()
        break
      case 'year':
        startTime = today.startOf('year').toISOString()
        break
      default:
        startTime = today.startOf('month').toISOString()
    }

    return { startTime, endTime }
  }

  const { startTime, endTime } = getDateRange()

  // API calls
  const {
    data: summaryData,
    isLoading: summaryLoading,
    error: summaryError,
    refetch: refetchSummary
  } = useDashboardSummary({ startTime, endTime })
  
  const {
    data: orderStatusData,
    isLoading: orderStatusLoading,
    error: orderStatusError,
    refetch: refetchOrderStatus
  } = useOrderStatus({ range: timeRange })
  
  const {
    data: recentOrdersData,
    isLoading: recentOrdersLoading,
    error: recentOrdersError,
    refetch: refetchRecentOrders
  } = useRecentOrders({ limit: 4 })
  
  const {
    isLoading: notificationsLoading,
    error: notificationsError,
    refetch: refetchNotifications
  } = useNotifications({ index: 1, pageSize: 5 })

  const loading = summaryLoading || orderStatusLoading || recentOrdersLoading || notificationsLoading
  const hasErrors = summaryError || orderStatusError || recentOrdersError || notificationsError

  // Handle API errors with toast notifications
  if (summaryError) {
    toast.error('Không thể tải thống kê tổng quan', {
      description: 'Vui lòng kiểm tra kết nối và thử lại.'
    })
  }
  if (orderStatusError) {
    toast.error('Không thể tải trạng thái đơn hàng', {
      description: 'Biểu đồ trạng thái đơn hàng có thể không chính xác.'
    })
  }
  if (recentOrdersError) {
    toast.error('Không thể tải đơn hàng gần đây', {
      description: 'Danh sách đơn hàng có thể không cập nhật.'
    })
  }
  if (notificationsError) {
    toast.error('Không thể tải thông báo', {
      description: 'Danh sách thông báo có thể không cập nhật.'
    })
  }

  // Retry all failed requests
  const retryAll = () => {
    if (summaryError) refetchSummary()
    if (orderStatusError) refetchOrderStatus()
    if (recentOrdersError) refetchRecentOrders()
    if (notificationsError) refetchNotifications()
  }

  // Process summary data for stats cards
  const totals = summaryData?.data?.totals
  const trends = summaryData?.data?.trends

  // Production-focused stats cards (using real API data)
  const statsCards = [
    {
      title: 'Tổng đơn hàng',
      value: totals?.orders?.toString() || '0',
      description: 'Kỳ này',
      icon: ShoppingCart,
      trend: trends?.ordersPct || 0,
      bgColor: 'bg-blue-50 dark:bg-blue-950/30',
      iconColor: 'text-blue-600 dark:text-blue-400',
      trendUp: (trends?.ordersPct || 0) >= 0
    },
    {
      title: 'Đơn hoàn thành',
      value: orderStatusData?.data?.counts?.find(item => item.status === 'COMPLETED')?.value?.toString() || '0',
      description: 'Kỳ này',
      icon: CheckCircle,
      trend: 0, // No trend data available for completed orders
      bgColor: 'bg-green-50 dark:bg-green-950/30',
      iconColor: 'text-green-600 dark:text-green-400',
      trendUp: true
    },
    {
      title: 'Đơn đang sản xuất',
      value: orderStatusData?.data?.counts?.find(item => item.status === 'IN_PROGRESS')?.value?.toString() || '0',
      description: 'Hiện tại',
      icon: Factory,
      trend: 0,
      bgColor: 'bg-purple-50 dark:bg-purple-950/30',
      iconColor: 'text-purple-600 dark:text-purple-400',
      trendUp: true
    },
    {
      title: 'Đơn chờ xử lý',
      value: orderStatusData?.data?.counts?.find(item => item.status === 'PENDING')?.value?.toString() || '0',
      description: 'Cần xử lý',
      icon: Clock,
      trend: 0,
      bgColor: 'bg-orange-50 dark:bg-orange-950/30',
      iconColor: 'text-orange-600 dark:text-orange-400',
      trendUp: false
    }
  ]

  if (loading) {
    return (
      <div className='flex items-center justify-center h-screen'>
        <div className='animate-spin rounded-full h-12 w-12 border-b-2 border-violet-600'></div>
      </div>
    )
  }

  return (
    <div className='space-y-6 p-6'>
      {/* Error Alert */}
      {hasErrors && (
        <ErrorAlert
          title='Một số dữ liệu không thể tải'
          description='Một phần dashboard có thể không hiển thị chính xác do lỗi kết nối.'
          onRetry={retryAll}
        />
      )}

      {/* Header */}
      <div className='flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4'>
        <div>
          <h1 className='text-3xl font-bold tracking-tight'>Tổng quan sản xuất</h1>
          <p className='text-muted-foreground mt-1'>Xin chào Manager, đây là tổng quan hoạt động sản xuất của MamaFit</p>
        </div>

        <div className='flex items-center gap-2'>
          <Select value={timeRange} onValueChange={setTimeRange}>
            <SelectTrigger className='w-[140px]'>
              <Calendar className='h-4 w-4 mr-2' />
              <SelectValue />
            </SelectTrigger>
            <SelectContent>
              <SelectItem value='today'>Hôm nay</SelectItem>
              <SelectItem value='week'>Tuần này</SelectItem>
              <SelectItem value='month'>Tháng này</SelectItem>
              <SelectItem value='quarter'>Quý này</SelectItem>
              <SelectItem value='year'>Năm nay</SelectItem>
            </SelectContent>
          </Select>
        </div>
      </div>

      {/* Stats Cards */}
      <div className='grid gap-4 md:grid-cols-2 lg:grid-cols-4'>
        {statsCards.map((stat, index) => {
          const Icon = stat.icon
          return (
            <Card key={index} className='hover:shadow-lg transition-shadow'>
              <CardHeader className='flex flex-row items-center justify-between space-y-0 pb-2'>
                <CardTitle className='text-sm font-medium'>{stat.title}</CardTitle>
                <div className={cn('p-2 rounded-lg', stat.bgColor)}>
                  <Icon className={cn('h-4 w-4', stat.iconColor)} />
                </div>
              </CardHeader>
              <CardContent>
                <div className='text-2xl font-bold'>{stat.value}</div>
                <div className='flex items-center mt-2'>
                  {stat.trendUp ? (
                    <ArrowUpRight className='h-4 w-4 text-green-500 mr-1' />
                  ) : (
                    <ArrowDownRight className='h-4 w-4 text-red-500 mr-1' />
                  )}
                  <span className={cn('text-xs font-medium', stat.trendUp ? 'text-green-500' : 'text-red-500')}>
                    +{stat.trend}%
                  </span>
                  <span className='text-xs text-muted-foreground ml-1'>{stat.description}</span>
                </div>
              </CardContent>
            </Card>
          )
        })}
      </div>

      {/* Order Status Chart */}
      <OrderStatusChart orderStatusData={orderStatusData} />

      {/* Recent Orders */}
      <Card>
        <CardHeader>
          <div className='flex items-center justify-between'>
            <div>
              <CardTitle className='flex items-center gap-2'>
                <ShoppingCart className='h-5 w-5 text-blue-600' />
                Đơn hàng gần đây
              </CardTitle>
              <CardDescription>Danh sách đơn hàng mới nhất cần xử lý</CardDescription>
            </div>
            <Button variant='outline' size='sm' className='gap-2' onClick={handleNavigateBack}>
              <FileText className='h-4 w-4' />
              Xem tất cả
            </Button>
          </div>
        </CardHeader>
        <CardContent>
          <div className='space-y-3'>
            {(recentOrdersData?.data?.items || []).map((order, index) => (
              <div
                key={order.id}
                className='p-4 rounded-lg border bg-gradient-to-r from-blue-50/30 to-cyan-50/30 hover:from-blue-50/50 hover:to-cyan-50/50 transition-all duration-200 hover:shadow-sm cursor-pointer'
                onClick={() => navigate(`${roleBasePath}/manage-order/${order.id}`)}
              >
                <div className='flex items-center justify-between'>
                  <div className='flex items-center gap-3 flex-1'>
                    <div className='relative'>
                      <Avatar className='h-10 w-10 border-2 border-blue-200'>
                        <AvatarImage src={order.customer.avatar} />
                        <AvatarFallback className='bg-blue-100 text-blue-700 font-semibold'>
                          {order.customer.name
                            .split(' ')
                            .map((n) => n[0])
                            .join('')}
                        </AvatarFallback>
                      </Avatar>
                      <div className='absolute -bottom-1 -right-1 w-5 h-5 rounded-full bg-blue-600 text-white text-xs font-bold flex items-center justify-center'>
                        {index + 1}
                      </div>
                    </div>

                    <div className='flex-1 min-w-0'>
                      <div className='flex items-center gap-2 mb-1'>
                        <p className='font-semibold text-sm truncate'>{order.customer.name}</p>
                        <Badge variant='outline' className='text-xs'>
                          {order.code}
                        </Badge>
                      </div>

                      <div className='grid grid-cols-2 gap-4 text-xs text-muted-foreground'>
                        <div className='flex items-center gap-1'>
                          <Package className='h-3 w-3' />
                          <span className='truncate'>
                            {order.primaryItem.maternityDressName || order.primaryItem.presetName || 'Sản phẩm'}
                          </span>
                        </div>
                        <div className='flex items-center gap-1'>
                          <Building className='h-3 w-3' />
                          <span className='truncate'>{order.branch?.name || 'Online'}</span>
                        </div>
                      </div>
                    </div>
                  </div>

                  <div className='text-right flex flex-col items-end gap-2'>
                    <div className='font-bold text-sm'>{formatCurrency(order.amount)}</div>
                    {getStatusBadge(order.status || 'pending')}
                  </div>
                </div>
              </div>
            ))}

            {/* Empty state */}
            {(!recentOrdersData?.data?.items || recentOrdersData.data.items.length === 0) && (
              <div className='text-center py-8'>
                <ShoppingCart className='h-12 w-12 text-muted-foreground mx-auto mb-4' />
                <p className='text-sm text-muted-foreground'>Không có đơn hàng nào</p>
              </div>
            )}
          </div>
        </CardContent>
      </Card>

      {/* Quick Actions */}
      <Card>
        <CardHeader>
          <CardTitle className='flex items-center gap-2'>
            <Factory className='h-5 w-5 text-violet-600' />
            Thao tác nhanh
          </CardTitle>
          <CardDescription>Các chức năng quản lý sản xuất thường dùng</CardDescription>
        </CardHeader>
        <CardContent>
          <div className='grid gap-4 md:grid-cols-2 lg:grid-cols-4'>
            <Button
              variant='outline'
              className='h-20 flex flex-col gap-2'
              onClick={() => navigate(`${roleBasePath}/manage-production`)}
            >
              <Scissors className='h-6 w-6' />
              <span className='text-sm'>Quản lý sản phẩm</span>
            </Button>
            <Button
              variant='outline'
              className='h-20 flex flex-col gap-2'
              onClick={() => navigate(`${roleBasePath}/manage-template`)}
            >
              <Palette className='h-6 w-6' />
              <span className='text-sm'>Quản lý mẫu</span>
            </Button>
            <Button
              variant='outline'
              className='h-20 flex flex-col gap-2'
              onClick={() => navigate(`${roleBasePath}/manage-order`)}
            >
              <Package className='h-6 w-6' />
              <span className='text-sm'>Quản lý đơn hàng</span>
            </Button>
            <Button
              variant='outline'
              className='h-20 flex flex-col gap-2'
              onClick={() => navigate(`${roleBasePath}/manage-warranty`)}
            >
              <Shield className='h-6 w-6' />
              <span className='text-sm'>Quản lý bảo hành</span>
            </Button>
          </div>
        </CardContent>
      </Card>
    </div>
  )
}
