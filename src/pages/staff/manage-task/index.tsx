import { useState } from 'react'
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card'
import { Badge } from '@/components/ui/badge'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select'
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs'
import { Skeleton } from '@/components/ui/skeleton'
import { Search, Filter, Eye, Clock, CheckCircle, AlertCircle, FileText, Package, ExternalLink } from 'lucide-react'
import { TaskStatus as StaffTaskStatus, ProductTaskGroup } from '@/pages/staff/manage-task/tasks/types'
import { useStaffGetOrderTasks, useStaffUpdateTaskStatus } from '@/services/staff/staff-task.service'
import { TaskDetailDialog } from './components/task-detail-dialog'
import { useNavigate } from 'react-router-dom'

export default function StaffTasksPage() {
  const [searchTerm, setSearchTerm] = useState('')
  const [statusFilter, setStatusFilter] = useState<string>('all')
  const [selectedOrderItemId, setSelectedOrderItemId] = useState<string | null>(null)
  const [isDetailDialogOpen, setIsDetailDialogOpen] = useState(false)

  const navigate = useNavigate()
  const { data: orderItems, isLoading, isError } = useStaffGetOrderTasks()
  console.log('Order Items:', orderItems)
  const updateTaskStatusMutation = useStaffUpdateTaskStatus()

  const handleTaskStatusChange = (
    taskId: string,
    status: StaffTaskStatus,
    orderItemId?: string,
    options?: {
      image?: string
      note?: string
    }
  ) => {
    if (!orderItemId) {
      console.error('orderItemId is required for updating task status')
      return
    }

    console.log(`Cập nhật task ${taskId} thành trạng thái ${status} cho orderItem ${orderItemId}`, options)

    updateTaskStatusMutation.mutate({
      dressTaskId: taskId,
      orderItemId: orderItemId,
      status: status,
      ...options
    })
  }

  const getTaskStatus = (milestones: ProductTaskGroup['milestones']) => {
    if (!milestones || milestones.length === 0) return 'PENDING'

    const allTasks = milestones.flatMap((m) => m.maternityDressTasks)
    if (allTasks.every((task) => task.status === 'DONE' || task.status === 'PASS' || task.status === 'FAIL'))
      return 'COMPLETED'
    if (allTasks.some((task) => task.status === 'IN_PROGRESS')) return 'IN_PROGRESS'
    return 'PENDING'
  }

  const getStatusBadge = (status: string) => {
    switch (status) {
      case 'COMPLETED':
        return (
          <Badge variant='default' className='bg-green-500'>
            <CheckCircle className='w-3 h-3 mr-1' />
            Hoàn thành
          </Badge>
        )
      case 'IN_PROGRESS':
        return (
          <Badge variant='default' className='bg-blue-500'>
            <Clock className='w-3 h-3 mr-1' />
            Đang thực hiện
          </Badge>
        )
      case 'PENDING':
        return (
          <Badge variant='secondary'>
            <AlertCircle className='w-3 h-3 mr-1' />
            Chờ thực hiện
          </Badge>
        )
      default:
        return <Badge variant='outline'>Không xác định</Badge>
    }
  }

  const filteredOrderItems = orderItems
    ? orderItems.filter((orderItem) => {
        const styleName = orderItem.preset.styleName || ''
        const orderItemId = orderItem.orderItemId || ''
        const matchesSearch =
          styleName.toLowerCase().includes(searchTerm.toLowerCase()) ||
          orderItemId.toLowerCase().includes(searchTerm.toLowerCase())

        if (statusFilter === 'all') return matchesSearch
        return matchesSearch && getTaskStatus(orderItem.milestones) === statusFilter
      })
    : []

  const handleViewDetail = (orderItem: ProductTaskGroup) => {
    setSelectedOrderItemId(orderItem.orderItemId)
    setIsDetailDialogOpen(true)
  }

  const totalOrderItems = orderItems?.length || 0
  const completedItems = orderItems?.filter((item) => getTaskStatus(item.milestones) === 'COMPLETED').length || 0
  const inProgressItems = orderItems?.filter((item) => getTaskStatus(item.milestones) === 'IN_PROGRESS').length || 0

  if (isLoading) {
    return (
      <div className='container mx-auto p-4 md:p-8 space-y-8'>
        <div className='text-center space-y-2'>
          <Skeleton className='h-8 w-64 mx-auto rounded-lg' />
          <Skeleton className='h-4 w-96 mx-auto rounded-lg' />
        </div>
        <div className='space-y-4'>
          <Skeleton className='h-32 w-full rounded-lg' />
          <Skeleton className='h-32 w-full rounded-lg' />
          <Skeleton className='h-32 w-full rounded-lg' />
        </div>
      </div>
    )
  }

  if (isError) {
    return (
      <div className='container mx-auto p-8 text-center'>
        <div className='text-red-500 space-y-2'>
          <AlertCircle className='h-8 w-8 mx-auto' />
          <h2 className='text-xl font-semibold'>Lỗi tải dữ liệu</h2>
          <p>Đã có lỗi xảy ra khi tải danh sách công việc được giao.</p>
        </div>
      </div>
    )
  }

  return (
    <div className='space-y-6'>
      {/* Header */}
      <div className='flex items-center justify-between'>
        <div>
          <h1 className='text-3xl font-bold tracking-tight'>Quản lý Công việc</h1>
          <p className='text-muted-foreground'>
            Quản lý {totalOrderItems} công việc được giao • {completedItems} hoàn thành • {inProgressItems} đang thực
            hiện
          </p>
        </div>
      </div>

      {/* Stats Cards */}
      <div className='grid grid-cols-1 md:grid-cols-3 gap-6'>
        <Card>
          <CardHeader className='flex flex-row items-center justify-between space-y-0 pb-2'>
            <CardTitle className='text-sm font-medium'>Tổng số công việc</CardTitle>
            <Package className='h-4 w-4 text-muted-foreground' />
          </CardHeader>
          <CardContent>
            <div className='text-2xl font-bold'>{totalOrderItems}</div>
            <p className='text-xs text-muted-foreground'>công việc được giao</p>
          </CardContent>
        </Card>
        <Card>
          <CardHeader className='flex flex-row items-center justify-between space-y-0 pb-2'>
            <CardTitle className='text-sm font-medium'>Đang thực hiện</CardTitle>
            <Clock className='h-4 w-4 text-muted-foreground' />
          </CardHeader>
          <CardContent>
            <div className='text-2xl font-bold text-blue-600'>{inProgressItems}</div>
            <p className='text-xs text-muted-foreground'>công việc đang làm</p>
          </CardContent>
        </Card>
        <Card>
          <CardHeader className='flex flex-row items-center justify-between space-y-0 pb-2'>
            <CardTitle className='text-sm font-medium'>Hoàn thành</CardTitle>
            <CheckCircle className='h-4 w-4 text-muted-foreground' />
          </CardHeader>
          <CardContent>
            <div className='text-2xl font-bold text-green-600'>{completedItems}</div>
            <p className='text-xs text-muted-foreground'>công việc đã xong</p>
          </CardContent>
        </Card>
      </div>

      {/* Filters */}
      <Card>
        <CardHeader>
          <CardTitle className='flex items-center gap-2'>
            <Filter className='h-5 w-5' />
            Bộ lọc và tìm kiếm
          </CardTitle>
        </CardHeader>
        <CardContent>
          <div className='flex flex-col sm:flex-row gap-4'>
            <div className='flex-1'>
              <div className='relative'>
                <Search className='absolute left-3 top-1/2 transform -translate-y-1/2 h-4 w-4 text-muted-foreground' />
                <Input
                  placeholder='Tìm kiếm theo tên sản phẩm hoặc mã order item...'
                  value={searchTerm}
                  onChange={(e) => setSearchTerm(e.target.value)}
                  className='pl-10'
                />
              </div>
            </div>
            <Select value={statusFilter} onValueChange={setStatusFilter}>
              <SelectTrigger className='w-full sm:w-[200px]'>
                <SelectValue placeholder='Trạng thái' />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value='all'>Tất cả trạng thái</SelectItem>
                <SelectItem value='PENDING'>Chờ thực hiện</SelectItem>
                <SelectItem value='IN_PROGRESS'>Đang thực hiện</SelectItem>
                <SelectItem value='COMPLETED'>Hoàn thành</SelectItem>
              </SelectContent>
            </Select>
          </div>
        </CardContent>
      </Card>

      {/* Tabs for different views */}
      <Tabs defaultValue='grid' className='space-y-4'>
        <TabsList>
          <TabsTrigger value='grid'>Dạng lưới</TabsTrigger>
          <TabsTrigger value='list'>Dạng danh sách</TabsTrigger>
        </TabsList>

        <TabsContent value='grid' className='space-y-4'>
          <div className='grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6'>
            {filteredOrderItems.map((orderItem) => {
              const totalTasks = orderItem.milestones.reduce(
                (sum, milestone) => sum + milestone.maternityDressTasks.length,
                0
              )
              const completedTasks = orderItem.milestones.reduce(
                (sum, milestone) =>
                  sum +
                  milestone.maternityDressTasks.filter(
                    (task) => task.status === 'DONE' || task.status === 'PASS' || task.status === 'FAIL'
                  ).length,
                0
              )
              const progress = totalTasks > 0 ? Math.round((completedTasks / totalTasks) * 100) : 0

              return (
                <Card key={`grid-${orderItem.orderItemId}`} className='hover:shadow-lg transition-shadow'>
                  <CardHeader>
                    <div className='flex items-center justify-between'>
                      <CardTitle className='text-lg'>{orderItem.preset.styleName}</CardTitle>
                      {getStatusBadge(getTaskStatus(orderItem.milestones))}
                    </div>
                    <CardDescription>Order Code: {orderItem.orderCode}</CardDescription>
                  </CardHeader>
                  <CardContent className='space-y-4'>
                    {/* Product Image */}
                    <div className='flex items-center gap-3'>
                      <img
                        src={orderItem.preset.images[0]}
                        alt={orderItem.preset.styleName}
                        className='w-16 h-16 rounded-lg object-cover shadow-sm'
                      />
                      <div className='flex-1'>
                        <p className='text-lg font-semibold text-primary'>
                          {new Intl.NumberFormat('vi-VN', {
                            style: 'currency',
                            currency: 'VND'
                          }).format(orderItem.preset.price)}
                        </p>
                        <p className='text-sm text-muted-foreground'>{progress}% hoàn thành</p>
                        <div className='w-full bg-gray-200 rounded-full h-2 mt-2'>
                          <div
                            className='bg-blue-600 h-2 rounded-full transition-all duration-300'
                            style={{ width: `${progress}%` }}
                          ></div>
                        </div>
                      </div>
                    </div>

                    {/* Task Info */}
                    <div className='space-y-2'>
                      <div className='flex items-center gap-2 text-sm'>
                        <FileText className='h-4 w-4 text-muted-foreground' />
                        <span>{orderItem.milestones.length} giai đoạn</span>
                      </div>
                      <div className='flex items-center gap-2 text-sm'>
                        <Package className='h-4 w-4 text-muted-foreground' />
                        <span>
                          {completedTasks}/{totalTasks} nhiệm vụ hoàn thành
                        </span>
                      </div>
                    </div>

                    {/* Actions */}
                    <div className='flex gap-2'>
                      <Button
                        variant='outline'
                        size='sm'
                        onClick={() => handleViewDetail(orderItem)}
                        className='flex-1'
                      >
                        <Eye className='h-4 w-4 mr-2' />
                        Xem chi tiết
                      </Button>
                      <Button
                        size='sm'
                        onClick={() => navigate(`/system/staff/order-item/${orderItem.orderItemId}`)}
                        className='flex-1'
                      >
                        <ExternalLink className='h-4 w-4 mr-2' />
                        Mở trang
                      </Button>
                    </div>
                  </CardContent>
                </Card>
              )
            })}
          </div>
        </TabsContent>

        <TabsContent value='list' className='space-y-4'>
          <Card>
            <CardHeader>
              <CardTitle>Danh sách công việc</CardTitle>
              <CardDescription>Hiển thị chi tiết tất cả các công việc được giao</CardDescription>
            </CardHeader>
            <CardContent>
              <div className='space-y-4'>
                {filteredOrderItems.map((orderItem) => {
                  const totalTasks = orderItem.milestones.reduce(
                    (sum, milestone) => sum + milestone.maternityDressTasks.length,
                    0
                  )
                  const completedTasks = orderItem.milestones.reduce(
                    (sum, milestone) =>
                      sum +
                      milestone.maternityDressTasks.filter(
                        (task) => task.status === 'DONE' || task.status === 'PASS' || task.status === 'FAIL'
                      ).length,
                    0
                  )
                  const progress = totalTasks > 0 ? Math.round((completedTasks / totalTasks) * 100) : 0

                  return (
                    <div
                      key={`list-${orderItem.orderItemId}`}
                      className='flex items-center justify-between p-4 border rounded-lg hover:bg-gray-50 transition-colors'
                    >
                      <div className='flex items-center gap-4'>
                        <img
                          src={orderItem.preset.images[0]}
                          alt={orderItem.preset.styleName}
                          className='w-12 h-12 rounded-lg object-cover shadow-sm'
                        />
                        <div>
                          <h3 className='font-medium'>{orderItem.preset.styleName}</h3>
                          <p className='text-sm text-muted-foreground'>Order Item: {orderItem.orderItemId}</p>
                          <div className='flex items-center gap-4 mt-1'>
                            <span className='text-sm text-muted-foreground'>
                              {completedTasks}/{totalTasks} nhiệm vụ
                            </span>
                            <span className='text-sm text-muted-foreground'>{progress}% hoàn thành</span>
                          </div>
                        </div>
                      </div>
                      <div className='flex items-center gap-3'>
                        {getStatusBadge(getTaskStatus(orderItem.milestones))}
                        <Button variant='outline' size='sm' onClick={() => handleViewDetail(orderItem)}>
                          <Eye className='h-4 w-4 mr-2' />
                          Xem
                        </Button>
                      </div>
                    </div>
                  )
                })}
              </div>
            </CardContent>
          </Card>
        </TabsContent>
      </Tabs>

      {/* Empty State */}
      {filteredOrderItems.length === 0 && !isLoading && (
        <Card>
          <CardContent className='text-center py-12'>
            <Package className='h-12 w-12 text-muted-foreground mx-auto mb-4' />
            <h3 className='text-lg font-medium mb-2'>Không có công việc nào</h3>
            <p className='text-muted-foreground'>
              {searchTerm || statusFilter !== 'all'
                ? 'Không tìm thấy công việc nào phù hợp với bộ lọc.'
                : 'Bạn chưa được giao bất kỳ công việc nào.'}
            </p>
          </CardContent>
        </Card>
      )}

      {/* Task Detail Dialog */}
      <TaskDetailDialog
        orderItemId={selectedOrderItemId}
        open={isDetailDialogOpen}
        onOpenChange={setIsDetailDialogOpen}
        onTaskStatusChange={handleTaskStatusChange}
        isUpdating={updateTaskStatusMutation.isPending}
      />
    </div>
  )
}
