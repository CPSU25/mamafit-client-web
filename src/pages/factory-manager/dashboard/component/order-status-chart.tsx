import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card'
import { PieChart, Pie, Cell, ResponsiveContainer, Tooltip } from 'recharts'
import { Package } from 'lucide-react'

const statusColors = ['#f59e0b', '#3b82f6', '#8b5cf6', '#10b981', '#ef4444', '#6b7280']

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

interface OrderStatusChartProps {
  orderStatusData?: {
    data?: {
      counts?: Array<{
        status: string
        value: number
      }>
    }
  }
}

export function OrderStatusChart({ orderStatusData }: OrderStatusChartProps) {
  // Filter out statuses with 0 orders and sort by value
  const filteredData = orderStatusData?.data?.counts
    ?.filter(item => item.value > 0)
    ?.sort((a, b) => b.value - a.value) || []

  const totalOrders = filteredData.reduce((sum, item) => sum + item.value, 0)

  // If no data, show empty state
  if (filteredData.length === 0) {
    return (
      <Card>
        <CardHeader>
          <CardTitle>Trạng thái đơn hàng sản xuất</CardTitle>
          <CardDescription>Phân bố đơn hàng theo trạng thái hiện tại</CardDescription>
        </CardHeader>
        <CardContent>
          <div className='flex flex-col items-center justify-center py-12'>
            <div className='w-24 h-24 rounded-full bg-muted/30 flex items-center justify-center mb-4'>
              <Package className='h-12 w-12 text-muted-foreground' />
            </div>
            <h3 className='text-lg font-semibold mb-2'>Không có dữ liệu</h3>
            <p className='text-sm text-muted-foreground text-center'>
              Hiện tại chưa có đơn hàng nào để hiển thị thống kê
            </p>
          </div>
        </CardContent>
      </Card>
    )
  }

  return (
    <Card>
      <CardHeader>
        <CardTitle>Trạng thái đơn hàng sản xuất</CardTitle>
        <CardDescription>Phân bố đơn hàng theo trạng thái hiện tại</CardDescription>
      </CardHeader>
      <CardContent>
        <div className='grid gap-6 lg:grid-cols-2'>
          {/* Chart */}
          <div className='flex items-center justify-center'>
            <ResponsiveContainer width='100%' height={280}>
              <PieChart>
                <Pie
                  data={filteredData.map((item, index) => ({
                    ...item,
                    name: getVietnameseStatus(item.status),
                    color: statusColors[index % statusColors.length]
                  }))}
                  cx='50%'
                  cy='50%'
                  labelLine={false}
                  label={false}
                  outerRadius={90}
                  innerRadius={35}
                  fill='#8884d8'
                  dataKey='value'
                >
                  {filteredData.map((_, index) => (
                    <Cell key={`cell-${index}`} fill={statusColors[index % statusColors.length]} />
                  ))}
                </Pie>
                <Tooltip
                  formatter={(value: number, name: string) => [
                    `${value} đơn (${((value / totalOrders) * 100).toFixed(1)}%)`, 
                    name
                  ]}
                  contentStyle={{
                    backgroundColor: 'hsl(var(--background))',
                    border: '1px solid hsl(var(--border))',
                    borderRadius: '8px',
                    boxShadow: '0 4px 6px -1px rgb(0 0 0 / 0.1)'
                  }}
                />
              </PieChart>
            </ResponsiveContainer>
          </div>

          {/* Legend */}
          <div className='space-y-3'>
            <div className='flex items-center justify-between mb-4'>
              <h4 className='font-semibold text-sm'>Chi tiết trạng thái</h4>
              <div className='text-xs text-muted-foreground'>
                Tổng: <span className='font-semibold'>{totalOrders} đơn</span>
              </div>
            </div>
            
            {filteredData.map((item, index) => {
              const percentage = ((item.value / totalOrders) * 100).toFixed(1)
              return (
                <div key={index} className='flex items-center justify-between p-3 rounded-lg bg-muted/20 hover:bg-muted/30 transition-colors'>
                  <div className='flex items-center gap-3'>
                    <div
                      className='w-4 h-4 rounded-full flex-shrink-0'
                      style={{ backgroundColor: statusColors[index % statusColors.length] }}
                    />
                    <span className='text-sm font-medium'>{getVietnameseStatus(item.status)}</span>
                  </div>
                  <div className='text-right'>
                    <div className='text-sm font-bold'>{item.value}</div>
                    <div className='text-xs text-muted-foreground'>{percentage}%</div>
                  </div>
                </div>
              )
            })}
          </div>
        </div>
      </CardContent>
    </Card>
  )
}
