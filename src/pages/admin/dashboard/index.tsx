import { useEffect, useState } from 'react'
import {
  TrendingUp,
  Users,
  Package,
  DollarSign,
  ShoppingCart,
  Building,
  UserCheck,
  Clock,
  AlertCircle,
  CheckCircle,
  Calendar,
  ArrowUpRight,
  ArrowDownRight,
  MoreVertical,
  Download,
  FileText,
  Filter
} from 'lucide-react'
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card'
import { Button } from '@/components/ui/button'
import { Badge } from '@/components/ui/badge'
import { Progress } from '@/components/ui/progress'
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select'
import { DropdownMenu, DropdownMenuContent, DropdownMenuItem, DropdownMenuTrigger } from '@/components/ui/dropdown-menu'
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from '@/components/ui/table'
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
  Area,
  AreaChart
} from 'recharts'

// Mock data for charts
const revenueData = [
  { month: 'T1', revenue: 180000000, orders: 45, lastYear: 150000000 },
  { month: 'T2', revenue: 220000000, orders: 62, lastYear: 180000000 },
  { month: 'T3', revenue: 195000000, orders: 51, lastYear: 170000000 },
  { month: 'T4', revenue: 280000000, orders: 78, lastYear: 210000000 },
  { month: 'T5', revenue: 320000000, orders: 95, lastYear: 250000000 },
  { month: 'T6', revenue: 310000000, orders: 89, lastYear: 260000000 }
]

const orderStatusData = [
  { name: 'Chờ xác nhận', value: 12, color: '#f59e0b' },
  { name: 'Đang sản xuất', value: 28, color: '#3b82f6' },
  { name: 'Đang giao', value: 8, color: '#8b5cf6' },
  { name: 'Hoàn thành', value: 45, color: '#10b981' },
  { name: 'Đã hủy', value: 3, color: '#ef4444' }
]

const branchPerformance = [
  { branch: 'Q1', revenue: 120000000, orders: 32, growth: 15 },
  { branch: 'Q3', revenue: 95000000, orders: 28, growth: 8 },
  { branch: 'Q7', revenue: 85000000, orders: 24, growth: -5 },
  { branch: 'Bình Thạnh', revenue: 75000000, orders: 19, growth: 12 },
  { branch: 'Thủ Đức', revenue: 65000000, orders: 15, growth: 20 }
]

export default function AdminDashboard() {
  const [timeRange, setTimeRange] = useState('month')
  const [loading, setLoading] = useState(true)

  useEffect(() => {
    // Simulate loading
    setTimeout(() => setLoading(false), 1000)
  }, [])

  // Calculate statistics
  const totalRevenue = revenueData.reduce((sum, item) => sum + item.revenue, 0)
  const totalOrders = revenueData.reduce((sum, item) => sum + item.orders, 0)
  const avgOrderValue = totalRevenue / totalOrders

  const statsCards = [
    {
      title: 'Tổng doanh thu',
      value: `${(totalRevenue / 1000000).toFixed(0)}M`,
      description: 'Tháng này',
      icon: DollarSign,
      trend: 12.5,
      bgColor: 'bg-violet-50 dark:bg-violet-950/30',
      iconColor: 'text-violet-600 dark:text-violet-400',
      trendUp: true
    },
    {
      title: 'Tổng đơn hàng',
      value: totalOrders.toString(),
      description: '6 tháng qua',
      icon: ShoppingCart,
      trend: 8.2,
      bgColor: 'bg-blue-50 dark:bg-blue-950/30',
      iconColor: 'text-blue-600 dark:text-blue-400',
      trendUp: true
    },
    {
      title: 'Khách hàng mới',
      value: '256',
      description: 'Tháng này',
      icon: Users,
      trend: 15.3,
      bgColor: 'bg-green-50 dark:bg-green-950/30',
      iconColor: 'text-green-600 dark:text-green-400',
      trendUp: true
    },
    {
      title: 'Giá trị TB/đơn',
      value: `${(avgOrderValue / 1000000).toFixed(1)}M`,
      description: 'Tăng so với tháng trước',
      icon: TrendingUp,
      trend: 5.4,
      bgColor: 'bg-orange-50 dark:bg-orange-950/30',
      iconColor: 'text-orange-600 dark:text-orange-400',
      trendUp: false
    }
  ]

  const recentOrders = [
    {
      id: '#ORD-2024-001',
      customer: 'Nguyễn Thị Mai',
      avatar: '/avatars/01.png',
      product: 'Váy bầu cổ tròn',
      branch: 'Chi nhánh Q1',
      amount: 2500000,
      status: 'processing',
      date: '2024-01-15'
    },
    {
      id: '#ORD-2024-002',
      customer: 'Trần Thị Hoa',
      avatar: '/avatars/02.png',
      product: 'Váy bầu dự tiệc',
      branch: 'Chi nhánh Q3',
      amount: 3800000,
      status: 'completed',
      date: '2024-01-14'
    },
    {
      id: '#ORD-2024-003',
      customer: 'Lê Thị Lan',
      avatar: '/avatars/03.png',
      product: 'Set váy bầu công sở',
      branch: 'Chi nhánh Q7',
      amount: 4200000,
      status: 'pending',
      date: '2024-01-14'
    },
    {
      id: '#ORD-2024-004',
      customer: 'Phạm Thị Hương',
      avatar: '/avatars/04.png',
      product: 'Váy bầu maxi',
      branch: 'Chi nhánh Bình Thạnh',
      amount: 2900000,
      status: 'shipping',
      date: '2024-01-13'
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

    const config = statusConfig[status as keyof typeof statusConfig]
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

          <Button variant='outline' size='icon'>
            <Filter className='h-4 w-4' />
          </Button>

          <Button>
            <Download className='h-4 w-4 mr-2' />
            Xuất báo cáo
          </Button>
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
                <CardDescription>So sánh với năm trước</CardDescription>
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
            <ResponsiveContainer width='100%' height={300}>
              <AreaChart data={revenueData}>
                <defs>
                  <linearGradient id='colorRevenue' x1='0' y1='0' x2='0' y2='1'>
                    <stop offset='5%' stopColor='#8b5cf6' stopOpacity={0.8} />
                    <stop offset='95%' stopColor='#8b5cf6' stopOpacity={0} />
                  </linearGradient>
                  <linearGradient id='colorLastYear' x1='0' y1='0' x2='0' y2='1'>
                    <stop offset='5%' stopColor='#94a3b8' stopOpacity={0.8} />
                    <stop offset='95%' stopColor='#94a3b8' stopOpacity={0} />
                  </linearGradient>
                </defs>
                <CartesianGrid strokeDasharray='3 3' className='stroke-muted' />
                <XAxis dataKey='month' className='text-xs' />
                <YAxis className='text-xs' tickFormatter={(value) => `${(value / 1000000).toFixed(0)}M`} />
                <Tooltip
                  formatter={(value: number) => `${(value / 1000000).toFixed(0)}M VNĐ`}
                  contentStyle={{
                    backgroundColor: 'hsl(var(--background))',
                    border: '1px solid hsl(var(--border))',
                    borderRadius: '8px'
                  }}
                />
                <Legend />
                <Area
                  type='monotone'
                  dataKey='revenue'
                  stroke='#8b5cf6'
                  fillOpacity={1}
                  fill='url(#colorRevenue)'
                  name='Năm nay'
                />
                <Area
                  type='monotone'
                  dataKey='lastYear'
                  stroke='#94a3b8'
                  fillOpacity={1}
                  fill='url(#colorLastYear)'
                  name='Năm trước'
                />
              </AreaChart>
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
            <ResponsiveContainer width='100%' height={300}>
              <PieChart>
                <Pie
                  data={orderStatusData}
                  cx='50%'
                  cy='50%'
                  labelLine={false}
                  label={({ name, percent }) => `${name}: ${(percent * 100).toFixed(0)}%`}
                  outerRadius={80}
                  fill='#8884d8'
                  dataKey='value'
                >
                  {orderStatusData.map((entry, index) => (
                    <Cell key={`cell-${index}`} fill={entry.color} />
                  ))}
                </Pie>
                <Tooltip />
              </PieChart>
            </ResponsiveContainer>

            {/* Legend */}
            <div className='mt-4 space-y-2'>
              {orderStatusData.map((item, index) => (
                <div key={index} className='flex items-center justify-between'>
                  <div className='flex items-center gap-2'>
                    <div className='w-3 h-3 rounded-full' style={{ backgroundColor: item.color }} />
                    <span className='text-sm'>{item.name}</span>
                  </div>
                  <span className='text-sm font-medium'>{item.value}</span>
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
            <CardTitle>Hiệu suất chi nhánh</CardTitle>
            <CardDescription>Top 5 chi nhánh theo doanh thu</CardDescription>
          </CardHeader>
          <CardContent>
            <div className='space-y-4'>
              {branchPerformance.map((branch, index) => (
                <div key={index} className='space-y-2'>
                  <div className='flex items-center justify-between'>
                    <div className='flex items-center gap-2'>
                      <Building className='h-4 w-4 text-muted-foreground' />
                      <span className='font-medium'>{branch.branch}</span>
                    </div>
                    <div className='flex items-center gap-2'>
                      <span className='text-sm text-muted-foreground'>{(branch.revenue / 1000000).toFixed(0)}M</span>
                      <Badge variant={branch.growth > 0 ? 'default' : 'destructive'} className='text-xs'>
                        {branch.growth > 0 ? '+' : ''}
                        {branch.growth}%
                      </Badge>
                    </div>
                  </div>
                  <Progress value={(branch.revenue / branchPerformance[0].revenue) * 100} className='h-2' />
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
                <CardTitle>Đơn hàng gần đây</CardTitle>
                <CardDescription>Cập nhật realtime</CardDescription>
              </div>
              <Button variant='outline' size='sm'>
                Xem tất cả
              </Button>
            </div>
          </CardHeader>
          <CardContent>
            <Table>
              <TableHeader>
                <TableRow>
                  <TableHead>Khách hàng</TableHead>
                  <TableHead>Sản phẩm</TableHead>
                  <TableHead>Chi nhánh</TableHead>
                  <TableHead>Trạng thái</TableHead>
                  <TableHead className='text-right'>Giá trị</TableHead>
                </TableRow>
              </TableHeader>
              <TableBody>
                {recentOrders.map((order) => (
                  <TableRow key={order.id}>
                    <TableCell>
                      <div className='flex items-center gap-2'>
                        <Avatar className='h-8 w-8'>
                          <AvatarImage src={order.avatar} />
                          <AvatarFallback>
                            {order.customer
                              .split(' ')
                              .map((n) => n[0])
                              .join('')}
                          </AvatarFallback>
                        </Avatar>
                        <div>
                          <p className='text-sm font-medium'>{order.customer}</p>
                          <p className='text-xs text-muted-foreground'>{order.id}</p>
                        </div>
                      </div>
                    </TableCell>
                    <TableCell className='text-sm'>{order.product}</TableCell>
                    <TableCell className='text-sm'>{order.branch}</TableCell>
                    <TableCell>{getStatusBadge(order.status)}</TableCell>
                    <TableCell className='text-right font-medium'>{(order.amount / 1000000).toFixed(1)}M</TableCell>
                  </TableRow>
                ))}
              </TableBody>
            </Table>
          </CardContent>
        </Card>
      </div>

      {/* Activity Timeline */}
      <Card>
        <CardHeader>
          <div className='flex items-center justify-between'>
            <div>
              <CardTitle>Hoạt động gần đây</CardTitle>
              <CardDescription>Các hoạt động quan trọng trong hệ thống</CardDescription>
            </div>
            <Badge variant='outline' className='gap-1'>
              <div className='h-2 w-2 rounded-full bg-green-500 animate-pulse' />
              Live
            </Badge>
          </div>
        </CardHeader>
        <CardContent>
          <div className='space-y-4'>
            {[
              {
                icon: UserCheck,
                title: 'Nhân viên mới được thêm',
                description: 'Nguyễn Văn A vừa được thêm vào chi nhánh Q1',
                time: '5 phút trước',
                color: 'text-blue-500'
              },
              {
                icon: Package,
                title: 'Đơn hàng #2024-001 hoàn thành',
                description: 'Khách hàng Nguyễn Thị Mai đã nhận hàng thành công',
                time: '15 phút trước',
                color: 'text-green-500'
              },
              {
                icon: AlertCircle,
                title: 'Cảnh báo tồn kho',
                description: 'Vải lụa tại chi nhánh Q3 sắp hết',
                time: '30 phút trước',
                color: 'text-yellow-500'
              },
              {
                icon: TrendingUp,
                title: 'Mục tiêu doanh thu đạt được',
                description: 'Chi nhánh Bình Thạnh đã đạt 120% mục tiêu tháng',
                time: '1 giờ trước',
                color: 'text-violet-500'
              }
            ].map((activity, index) => {
              const Icon = activity.icon
              return (
                <div key={index} className='flex gap-4'>
                  <div className={cn('p-2 rounded-lg bg-muted', activity.color)}>
                    <Icon className='h-4 w-4' />
                  </div>
                  <div className='flex-1 space-y-1'>
                    <p className='text-sm font-medium'>{activity.title}</p>
                    <p className='text-xs text-muted-foreground'>{activity.description}</p>
                    <p className='text-xs text-muted-foreground'>{activity.time}</p>
                  </div>
                </div>
              )
            })}
          </div>
        </CardContent>
      </Card>
    </div>
  )
}
