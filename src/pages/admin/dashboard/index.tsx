import { useCallback, useEffect, useState } from 'react'
import {
  TrendingUp,
  Users,
  Package,
  DollarSign,
  ShoppingCart,
  Building,
  Clock,
  AlertCircle,
  CheckCircle,
  Calendar,
  ArrowUpRight,
  ArrowDownRight,
  MoreVertical,
  Download,
  FileText
} from 'lucide-react'
import dayjs from 'dayjs'
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card'
import { Button } from '@/components/ui/button'
import { Badge } from '@/components/ui/badge'
import { Progress } from '@/components/ui/progress'
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select'
import { DropdownMenu, DropdownMenuContent, DropdownMenuItem, DropdownMenuTrigger } from '@/components/ui/dropdown-menu'

import { Avatar, AvatarFallback, AvatarImage } from '@/components/ui/avatar'
import { cn } from '@/lib/utils/utils'
import {
  PieChart,
  Pie,
  Cell,
  XAxis,
  YAxis,
  CartesianGrid,
  Tooltip,
  ResponsiveContainer,
  Legend,
  ComposedChart,
  Bar,
  Line
} from 'recharts'
import {
  useDashboardSummary,
  useRevenueAnalytics,
  useOrderStatus,
  useBranchTop,
  useRecentOrders,
  useNotifications
} from '@/services/admin/dashboard.service'
import { ErrorAlert } from './component/error-fallback'
import { toast } from 'sonner'
import { useNavigate } from 'react-router'
import { useAuth } from '@/context/auth-context'

// Color mapping for order status charts
const statusColors = ['#f59e0b', '#3b82f6', '#8b5cf6', '#10b981', '#ef4444']

// Status translation mapping
const getVietnameseStatus = (status: string): string => {
  const statusMapping: Record<string, string> = {
    CREATED: 'Đã tạo',
    PENDING: 'Chờ xử lý',
    IN_PROGRESS: 'Đang sản xuất',
    AWAITING_PAID_REST: 'Đợi thanh toán',
    PACKAGING: 'Đang đóng gói',
    DELIVERING: 'Đang giao hàng',
    COMPLETED: 'Hoàn thành',
    CANCELLED: 'Đã hủy',
    CONFIRMED: 'Đã Xác Nhận',
    RETURNED: 'Đã Trả Hàng',
    PICKUP_IN_PROGRESS: 'Đang Lấy Hàng',
    AWAITING_PAID_WARRANTY: 'Chờ Thanh Toán Bảo Hành',
    COMPLETED_WARRANTY: 'Hoàn Thành Bảo Hành',
    RECEIVED_AT_BRANCH: 'Nhận tại chi nhánh',
    PROCESSING: 'Đang xử lý',
    DELIVERED: 'Đã giao',
    REJECTED: 'Từ chối'
  }

  return statusMapping[status.toUpperCase()] || status
}

// Notification helper functions
// const getNotificationIcon = (type?: string) => {
//   const iconMapping: Record<string, React.ComponentType<{ className?: string }>> = {
//     PAYMENT: DollarSign,
//     ORDER_PROGRESS: Package,
//     WARRANTY: AlertCircle,
//     SYSTEM: TrendingUp
//   }

//   return iconMapping[type || 'SYSTEM'] || AlertCircle
// }

// const getNotificationColor = (type?: string) => {
//   const colorMapping: Record<string, string> = {
//     PAYMENT: 'text-green-500',
//     ORDER_PROGRESS: 'text-blue-500',
//     WARRANTY: 'text-yellow-500',
//     SYSTEM: 'text-violet-500'
//   }

//   return colorMapping[type || 'SYSTEM'] || 'text-gray-500'
// }

// const formatTimeAgo = (dateString: string): string => {
//   const date = dayjs(dateString)
//   const now = dayjs()
//   const diffMinutes = now.diff(date, 'minute')

//   if (diffMinutes < 1) return 'Vừa xong'
//   if (diffMinutes < 60) return `${diffMinutes} phút trước`

//   const diffHours = now.diff(date, 'hour')
//   if (diffHours < 24) return `${diffHours} giờ trước`

//   const diffDays = now.diff(date, 'day')
//   if (diffDays < 7) return `${diffDays} ngày trước`

//   return date.format('DD/MM/YYYY')
// }

// Format currency helper
const formatCurrency = (amount: number): string => {
  return new Intl.NumberFormat('vi-VN', {
    style: 'currency',
    currency: 'VND',
    minimumFractionDigits: 0,
    maximumFractionDigits: 0
  }).format(amount)
}

export default function AdminDashboard() {
  const [timeRange, setTimeRange] = useState('month')
  const nagivate = useNavigate()
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
  const { hasRole } = useAuth()
  const roleBasePath = hasRole('Admin') ? '/system/admin' : hasRole('Manager') ? '/system/manager' : '/system/admin'
  const handleNavigateBack = useCallback(() => {
    nagivate(`${roleBasePath}/manage-order`)
  }, [nagivate, roleBasePath])


  // API calls
  const {
    data: summaryData,
    isLoading: summaryLoading,
    error: summaryError,
    refetch: refetchSummary
  } = useDashboardSummary({ startTime, endTime })
  const {
    data: revenueData,
    isLoading: revenueLoading,
    error: revenueError,
    refetch: refetchRevenue
  } = useRevenueAnalytics({
    range: timeRange === 'year' ? 'this_year' : 'this_month',
    compare: ''
  })
  const {
    data: orderStatusData,
    isLoading: orderStatusLoading,
    error: orderStatusError,
    refetch: refetchOrderStatus
  } = useOrderStatus({ range: timeRange })
  const {
    data: branchData,
    isLoading: branchLoading,
    error: branchError,
    refetch: refetchBranch
  } = useBranchTop({
    metric: 'revenue',
    limit: 5,
    range: timeRange
  })
  const {
    data: recentOrdersData,
    isLoading: recentOrdersLoading,
    error: recentOrdersError,
    refetch: refetchRecentOrders
  } = useRecentOrders({ limit: 4 })
  const {
    // data: notificationsData,
    isLoading: notificationsLoading,
    error: notificationsError,
    refetch: refetchNotifications
  } = useNotifications({ index: 1, pageSize: 5 })

  const loading =
    summaryLoading ||
    revenueLoading ||
    orderStatusLoading ||
    branchLoading ||
    recentOrdersLoading ||
    notificationsLoading
  const hasErrors =
    summaryError || revenueError || orderStatusError || branchError || recentOrdersError || notificationsError

  // Handle API errors with toast notifications
  useEffect(() => {
    if (summaryError) {
      toast.error('Không thể tải thống kê tổng quan', {
        description: 'Vui lòng kiểm tra kết nối và thử lại.'
      })
    }
    if (revenueError) {
      toast.error('Không thể tải dữ liệu doanh thu', {
        description: 'Biểu đồ doanh thu có thể không chính xác.'
      })
    }
    if (orderStatusError) {
      toast.error('Không thể tải trạng thái đơn hàng', {
        description: 'Biểu đồ trạng thái đơn hàng có thể không chính xác.'
      })
    }
    if (branchError) {
      toast.error('Không thể tải hiệu suất chi nhánh', {
        description: 'Dữ liệu chi nhánh có thể không chính xác.'
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
  }, [summaryError, revenueError, orderStatusError, branchError, recentOrdersError, notificationsError])

  // Retry all failed requests
  const retryAll = () => {
    if (summaryError) refetchSummary()
    if (revenueError) refetchRevenue()
    if (orderStatusError) refetchOrderStatus()
    if (branchError) refetchBranch()
    if (recentOrdersError) refetchRecentOrders()
    if (notificationsError) refetchNotifications()
  }

  // Process summary data for stats cards
  const totals = summaryData?.data?.totals
  const trends = summaryData?.data?.trends

  const statsCards = [
    {
      title: 'Tổng doanh thu',
      value: totals ? formatCurrency(totals.revenue) : formatCurrency(0),
      description: 'Kỳ này',
      icon: DollarSign,
      trend: trends?.revenuePct || 0,
      bgColor: 'bg-violet-50 dark:bg-violet-950/30',
      iconColor: 'text-violet-600 dark:text-violet-400',
      trendUp: (trends?.revenuePct || 0) >= 0
    },
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
      title: 'Khách hàng mới',
      value: totals?.newCustomer?.toString() || '0',
      description: 'Kỳ này',
      icon: Users,
      trend: trends?.newCustomersPct || 0,
      bgColor: 'bg-green-50 dark:bg-green-950/30',
      iconColor: 'text-green-600 dark:text-green-400',
      trendUp: (trends?.newCustomersPct || 0) >= 0
    },
    {
      title: 'Giá trị TB/đơn',
      value: totals ? formatCurrency(totals.avgOrderValue) : formatCurrency(0),
      description: 'So với kỳ trước',
      icon: TrendingUp,
      trend: trends?.aovPct || 0,
      bgColor: 'bg-orange-50 dark:bg-orange-950/30',
      iconColor: 'text-orange-600 dark:text-orange-400',
      trendUp: (trends?.aovPct || 0) >= 0
    }
  ]

  const getStatusBadge = (status: string) => {
    const statusConfig = {
      pending: { label: 'Chờ xử lý', variant: 'secondary' as const, icon: Clock },
      processing: { label: 'Đang SX', variant: 'default' as const, icon: AlertCircle },
      shipping: { label: 'Đang giao', variant: 'outline' as const, icon: Package },
      completed: { label: 'Hoàn thành', variant: 'default' as const, icon: CheckCircle },
      cancelled: { label: 'Đã hủy', variant: 'destructive' as const, icon: AlertCircle }
    }

    const config = statusConfig[status as keyof typeof statusConfig] || statusConfig.pending
    const Icon = config.icon

    return (
      <Badge variant={config.variant} className='gap-1'>
        <Icon className='h-3 w-3' />
        {config.label}
      </Badge>
    )
  }

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
          <h1 className='text-3xl font-bold tracking-tight'>Tổng quan hệ thống</h1>
          <p className='text-muted-foreground mt-1'>Xin chào Admin, đây là tổng quan hoạt động của MamaFit</p>
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
                    {stat.trend}%
                  </span>
                  <span className='text-xs text-muted-foreground ml-1'>{stat.description}</span>
                </div>
              </CardContent>
            </Card>
          )
        })}
      </div>

      {/* Charts Section */}
      <div className='grid gap-4 md:grid-cols-7'>
        {/* Revenue Chart */}
        <Card className='col-span-4'>
          <CardHeader>
            <div className='flex items-center justify-between'>
              <div>
                <CardTitle>Doanh thu theo tháng</CardTitle>
              </div>
              <DropdownMenu>
                <DropdownMenuTrigger asChild>
                  <Button variant='ghost' size='icon'>
                    <MoreVertical className='h-4 w-4' />
                  </Button>
                </DropdownMenuTrigger>
                <DropdownMenuContent align='end'>
                  <DropdownMenuItem>
                    <FileText className='h-4 w-4 mr-2' />
                    Xem chi tiết
                  </DropdownMenuItem>
                  <DropdownMenuItem>
                    <Download className='h-4 w-4 mr-2' />
                    Tải xuống
                  </DropdownMenuItem>
                </DropdownMenuContent>
              </DropdownMenu>
            </div>
          </CardHeader>
          <CardContent>
            {/* Mini Stats Row */}
            <div className='grid grid-cols-3 gap-4 mb-6'>
              <div className='text-center p-3 bg-gradient-to-r from-violet-50 to-purple-50 dark:from-violet-950/30 dark:to-purple-950/30 rounded-lg'>
                <div className='text-2xl font-bold text-violet-600 dark:text-violet-400'>
                  {totals ? formatCurrency(totals.revenue) : formatCurrency(0)}
                </div>
                <div className='text-xs text-muted-foreground'>Tổng doanh thu</div>
              </div>

              <div className='text-center p-3 bg-gradient-to-r from-blue-50 to-cyan-50 dark:from-blue-950/30 dark:to-cyan-950/30 rounded-lg'>
                <div className='text-2xl font-bold text-blue-600 dark:text-blue-400'>{totals?.orders || 0}</div>
                <div className='text-xs text-muted-foreground'>Tổng đơn hàng</div>
              </div>

              <div className='text-center p-3 bg-gradient-to-r from-emerald-50 to-green-50 dark:from-emerald-950/30 dark:to-green-950/30 rounded-lg'>
                <div className='text-2xl font-bold text-emerald-600 dark:text-emerald-400'>
                  {totals ? formatCurrency(totals.avgOrderValue) : formatCurrency(0)}
                </div>
                <div className='text-xs text-muted-foreground'>Giá trị TB/đơn</div>
              </div>
            </div>

            {/* Enhanced Combo Chart */}
            <ResponsiveContainer width='100%' height={320}>
              <ComposedChart data={revenueData?.data?.data || []} margin={{ top: 20, right: 30, left: 20, bottom: 5 }}>
                <defs>
                  <linearGradient id='colorRevenue' x1='0' y1='0' x2='0' y2='1'>
                    <stop offset='5%' stopColor='#8b5cf6' stopOpacity={0.8} />
                    <stop offset='95%' stopColor='#8b5cf6' stopOpacity={0.1} />
                  </linearGradient>
                  <linearGradient id='colorOrders' x1='0' y1='0' x2='0' y2='1'>
                    <stop offset='5%' stopColor='#3b82f6' stopOpacity={0.8} />
                    <stop offset='95%' stopColor='#3b82f6' stopOpacity={0.1} />
                  </linearGradient>
                </defs>
                <CartesianGrid strokeDasharray='3 3' className='stroke-muted/50' />
                <XAxis dataKey='month' className='text-xs' tick={{ fontSize: 11 }} tickLine={false} axisLine={false} />
                <YAxis
                  yAxisId='revenue'
                  className='text-xs'
                  tick={{ fontSize: 10 }}
                  tickLine={false}
                  axisLine={false}
                  tickFormatter={(value) => formatCurrency(value)}
                />
                <YAxis
                  yAxisId='orders'
                  orientation='right'
                  className='text-xs'
                  tick={{ fontSize: 10 }}
                  tickLine={false}
                  axisLine={false}
                />
                <Tooltip
                  content={({ active, payload, label }) => {
                    if (active && payload && payload.length) {
                      return (
                        <div className='bg-background/95 backdrop-blur-sm border rounded-lg shadow-lg p-3'>
                          <p className='font-medium text-sm mb-2'>{`Tháng ${label}`}</p>
                          {payload.map((entry, index) => (
                            <div key={index} className='flex items-center gap-2 text-xs'>
                              <div className='w-3 h-3 rounded-full' style={{ backgroundColor: entry.color }} />
                              <span className='text-muted-foreground'>{entry.name}:</span>
                              <span className='font-medium'>
                                {entry.dataKey === 'revenue'
                                  ? formatCurrency(entry.value as number)
                                  : `${entry.value} đơn`}
                              </span>
                            </div>
                          ))}
                        </div>
                      )
                    }
                    return null
                  }}
                />
                <Legend wrapperStyle={{ paddingTop: '20px' }} iconType='circle' />
                <Bar
                  yAxisId='revenue'
                  dataKey='revenue'
                  fill='url(#colorRevenue)'
                  stroke='#8b5cf6'
                  strokeWidth={1}
                  radius={[4, 4, 0, 0]}
                  name='Doanh thu'
                />
                <Line
                  yAxisId='orders'
                  type='monotone'
                  dataKey='orders'
                  stroke='#3b82f6'
                  strokeWidth={3}
                  dot={{ fill: '#3b82f6', strokeWidth: 2, r: 4 }}
                  activeDot={{ r: 6, stroke: '#3b82f6', strokeWidth: 2, fill: '#ffffff' }}
                  name='Số đơn hàng'
                />
                {revenueData?.data?.data?.[0]?.lastYear && (
                  <Line
                    yAxisId='revenue'
                    type='monotone'
                    dataKey='lastYear'
                    stroke='#94a3b8'
                    strokeWidth={2}
                    strokeDasharray='5 5'
                    dot={{ fill: '#94a3b8', strokeWidth: 2, r: 3 }}
                    name='Năm trước'
                  />
                )}
              </ComposedChart>
            </ResponsiveContainer>
          </CardContent>
        </Card>

        {/* Order Status Chart */}
        <Card className='col-span-3'>
          <CardHeader>
            <CardTitle>Trạng thái đơn hàng</CardTitle>
            <CardDescription>Tổng quan đơn hàng hiện tại</CardDescription>
          </CardHeader>
          <CardContent>
            <ResponsiveContainer width='100%' height={250}>
              <PieChart>
                <Pie
                  data={
                    orderStatusData?.data?.counts?.map((item, index) => ({
                      ...item,
                      name: getVietnameseStatus(item.status),
                      color: statusColors[index % statusColors.length]
                    })) || []
                  }
                  cx='50%'
                  cy='50%'
                  labelLine={false}
                  label={false}
                  outerRadius={90}
                  innerRadius={30}
                  fill='#8884d8'
                  dataKey='value'
                >
                  {(orderStatusData?.data?.counts || []).map((_, index) => (
                    <Cell key={`cell-${index}`} fill={statusColors[index % statusColors.length]} />
                  ))}
                </Pie>
                <Tooltip
                  formatter={(value: number, name: string) => [`${value} đơn`, name]}
                  contentStyle={{
                    backgroundColor: 'hsl(var(--background))',
                    border: '1px solid hsl(var(--border))',
                    borderRadius: '8px'
                  }}
                />
              </PieChart>
            </ResponsiveContainer>

            {/* Legend */}
            <div className='mt-6 grid grid-cols-2 gap-3'>
              {(orderStatusData?.data?.counts || []).map((item, index) => (
                <div key={index} className='flex items-center justify-between p-2 rounded-lg bg-muted/30'>
                  <div className='flex items-center gap-2'>
                    <div
                      className='w-3 h-3 rounded-full'
                      style={{ backgroundColor: statusColors[index % statusColors.length] }}
                    />
                    <span className='text-sm font-medium'>{getVietnameseStatus(item.status)}</span>
                  </div>
                  <div className='text-right'>
                    <div className='text-sm font-bold'>{item.value}</div>
                    <div className='text-xs text-muted-foreground'>
                      {orderStatusData?.data?.counts
                        ? `${((item.value / orderStatusData.data.counts.reduce((sum, i) => sum + i.value, 0)) * 100).toFixed(0)}%`
                        : '0%'}
                    </div>
                  </div>
                </div>
              ))}
            </div>
          </CardContent>
        </Card>
      </div>

      {/* Branch Performance & Recent Orders */}
      <div className='grid gap-4 md:grid-cols-7'>
        {/* Branch Performance */}
        <Card className='col-span-3'>
          <CardHeader>
            <CardTitle className='flex items-center gap-2'>
              <Building className='h-5 w-5 text-violet-600' />
              Hiệu suất chi nhánh
            </CardTitle>
            <CardDescription>Top 5 chi nhánh theo doanh thu</CardDescription>
          </CardHeader>
          <CardContent>
            <div className='space-y-3'>
              {(branchData?.data?.items || []).map((branch, index) => (
                <div
                  key={index}
                  className='relative p-4 rounded-lg border bg-gradient-to-r from-gray-50/50 to-gray-100/50 hover:from-violet-50/50 hover:to-purple-50/50 transition-all duration-200 hover:shadow-sm'
                >
                  {/* Ranking Badge */}
                  <div className='absolute -left-2 -top-2 w-6 h-6 rounded-full bg-violet-600 text-white text-xs font-bold flex items-center justify-center'>
                    {index + 1}
                  </div>

                  <div className='space-y-3'>
                    <div className='flex items-center justify-between'>
                      <div className='flex items-center gap-3'>
                        <div className='w-8 h-8 rounded-lg bg-violet-100 dark:bg-violet-900/30 flex items-center justify-center'>
                          <Building className='h-4 w-4 text-violet-600 dark:text-violet-400' />
                        </div>
                        <div>
                          <div className='font-semibold text-sm'>{branch.branchName}</div>
                          
                        </div>
                      </div>

                      <div className='text-right'>
                        <div className='font-bold text-sm'>{formatCurrency(branch.revenue)}</div>
                      </div>
                    </div>

                    <div className='space-y-1'>
                      <div className='flex justify-between text-xs text-muted-foreground'>
                        <span>Hiệu suất</span>
                        <span>
                          {branchData?.data?.items?.[0]
                            ? Math.round((branch.revenue / branchData.data.items[0].revenue) * 100)
                            : 0}
                          %
                        </span>
                      </div>
                      <Progress
                        value={
                          branchData?.data?.items?.[0] ? (branch.revenue / branchData.data.items[0].revenue) * 100 : 0
                        }
                        className='h-2'
                      />
                    </div>
                  </div>
                </div>
              ))}
            </div>
          </CardContent>
        </Card>

        {/* Recent Orders */}
        <Card className='col-span-4'>
          <CardHeader>
            <div className='flex items-center justify-between'>
              <div>
                <CardTitle className='flex items-center gap-2'>
                  <ShoppingCart className='h-5 w-5 text-blue-600' />
                  Đơn hàng gần đây
                </CardTitle>
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
                  className='p-4 rounded-lg border bg-gradient-to-r from-blue-50/30 to-cyan-50/30 hover:from-blue-50/50 hover:to-cyan-50/50 transition-all duration-200 hover:shadow-sm'
                  onClick={() => nagivate(`${roleBasePath}/manage-order/${order.id}`)}
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
      </div>

      {/* Notification Timeline */}
      {/* <Card>
        <CardHeader>
          <div className='flex items-center justify-between'>
            <div>
              <CardTitle>Thông báo gần đây</CardTitle>
              <CardDescription>Các thông báo mới nhất trong hệ thống</CardDescription>
            </div>
            <div className='flex items-center gap-2'>
              <Badge variant='outline' className='gap-1'>
                <div className='h-2 w-2 rounded-full bg-green-500 animate-pulse' />
                Live
              </Badge>
              <Button variant='outline' size='sm'>
                Xem tất cả
              </Button>
            </div>
          </div>
        </CardHeader>
        <CardContent>
          <div className='space-y-4'>
            {(notificationsData?.data?.items || []).map((notification) => {
              const Icon = getNotificationIcon(notification.type)
              const colorClass = getNotificationColor(notification.type)

              return (
                <div key={notification.id} className='flex gap-4'>
                  <div className={cn('p-2 rounded-lg bg-muted', colorClass)}>
                    <Icon className='h-4 w-4' />
                  </div>
                  <div className='flex-1 space-y-1'>
                    <div className='flex items-start justify-between'>
                      <p className='text-sm font-medium pr-2'>{notification.notificationTitle}</p>
                      {!notification.isRead && <div className='h-2 w-2 rounded-full bg-blue-500 mt-1 flex-shrink-0' />}
                    </div>
                    <p className='text-xs text-muted-foreground'>{notification.notificationContent}</p>
                    <div className='flex items-center justify-between'>
                      <p className='text-xs text-muted-foreground'>{formatTimeAgo(notification.createdAt)}</p>
                      <span className='text-xs text-muted-foreground'>bởi {notification.createdBy}</span>
                    </div>
                  </div>
                </div>
              )
            })}

            {(!notificationsData?.data?.items || notificationsData.data.items.length === 0) && (
              <div className='text-center py-8'>
                <AlertCircle className='h-12 w-12 text-muted-foreground mx-auto mb-4' />
                <p className='text-sm text-muted-foreground'>Không có thông báo nào</p>
              </div>
            )}
          </div>
        </CardContent>
      </Card> */}
    </div>
  )
}
