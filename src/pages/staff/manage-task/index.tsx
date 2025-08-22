import { useMemo, useState } from 'react'
import dayjs from 'dayjs'
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card'
import { Badge } from '@/components/ui/badge'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select'
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs'
import { Skeleton } from '@/components/ui/skeleton'
import { Search, Filter, Eye, Clock, CheckCircle, AlertCircle, FileText, Package, ExternalLink, Flame } from 'lucide-react'
import { TaskStatus as StaffTaskStatus, ProductTaskGroup } from '@/pages/staff/manage-task/tasks/types'
import { useStaffGetOrderTasks, useStaffUpdateTaskStatus } from '@/services/staff/staff-task.service'
import { TaskDetailDialog } from './components/task-detail-dialog'
import { useNavigate } from 'react-router-dom'

export default function StaffTasksPage() {
  const [searchTerm, setSearchTerm] = useState('')
  const [statusFilter, setStatusFilter] = useState<string>('all')
  const [priorityOnly, setPriorityOnly] = useState<boolean>(false)
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

  // Compute SLA and urgency per order item
  const itemsWithSLA = useMemo(() => {
    return (orderItems || []).map((oi) => {
      const allTasks = oi.milestones.flatMap((m) => m.maternityDressTasks || [])
      const isCompleted = allTasks.every((t) => ['DONE', 'PASS', 'FAIL'].includes(t.status))
      const pendingTasks = allTasks.filter((t) => !['DONE', 'PASS', 'FAIL'].includes(t.status))
      const nextTask = pendingTasks
        .slice()
        .sort((a, b) => {
          const seq = (a.sequenceOrder ?? 0) - (b.sequenceOrder ?? 0)
          if (seq !== 0) return seq
          const da = a.deadline ? dayjs(a.deadline).valueOf() : Infinity
          const db = b.deadline ? dayjs(b.deadline).valueOf() : Infinity
          return da - db
        })[0]

      const nearest = pendingTasks.reduce<dayjs.Dayjs | null>((min, t) => {
        if (!t.deadline) return min
        const d = dayjs(t.deadline)
        if (!min) return d
        return d.isBefore(min) ? d : min
      }, null)

      const minutesLeft = nearest ? nearest.diff(dayjs(), 'minute') : null
      let urgency: 'overdue' | 'hour' | 'fourHours' | 'none' = 'none'
      if (minutesLeft !== null) {
        if (minutesLeft < 0) urgency = 'overdue'
        else if (minutesLeft <= 60) urgency = 'hour'
        else if (minutesLeft <= 240) urgency = 'fourHours'
      }

      const estimateTotal = pendingTasks.reduce((sum, t) => sum + (t.estimateTimeSpan || 0), 0)

      return {
        base: oi,
        progress: {
          total: allTasks.length,
          done: allTasks.filter((t) => ['DONE', 'PASS', 'FAIL'].includes(t.status)).length
        },
        isCompleted,
        nextTask,
        sla: {
          nearestDeadline: nearest ? nearest.toISOString() : null,
          minutesLeft,
          urgency,
          estimateTotal
        }
      }
    })
  }, [orderItems])

  const filteredOrderItems = useMemo(() => {
    const search = searchTerm.trim().toLowerCase()
    const status = statusFilter
    const urgencyRank: Record<string, number> = { overdue: 0, hour: 1, fourHours: 2, none: 3 }

    const filtered = itemsWithSLA.filter((it) => {
      const oi = it.base
      const styleName = oi.preset.styleName || ''
      const orderItemId = oi.orderItemId || ''
      const matchesSearch = styleName.toLowerCase().includes(search) || orderItemId.toLowerCase().includes(search)

      const statusOk = status === 'all' ? true : getTaskStatus(oi.milestones) === status
      const priorityOk = !priorityOnly || it.sla.urgency !== 'none'
      return matchesSearch && statusOk && priorityOk
    })

    return filtered.sort((a, b) => {
      const ua = urgencyRank[a.sla.urgency]
      const ub = urgencyRank[b.sla.urgency]
      if (ua !== ub) return ua - ub
      const ma = a.sla.minutesLeft ?? Number.POSITIVE_INFINITY
      const mb = b.sla.minutesLeft ?? Number.POSITIVE_INFINITY
      return ma - mb
    })
  }, [itemsWithSLA, searchTerm, statusFilter, priorityOnly])

  const handleViewDetail = (orderItem: ProductTaskGroup) => {
    setSelectedOrderItemId(orderItem.orderItemId)
    setIsDetailDialogOpen(true)
  }

  const totalOrderItems = orderItems?.length || 0
  const completedItems = orderItems?.filter((item) => getTaskStatus(item.milestones) === 'COMPLETED').length || 0
  const inProgressItems = orderItems?.filter((item) => getTaskStatus(item.milestones) === 'IN_PROGRESS').length || 0
  const overdueCount = itemsWithSLA.filter((it) => it.sla.urgency === 'overdue').length
  const dueSoonCount = itemsWithSLA.filter((it) => it.sla.urgency === 'hour').length
  const groupedItems = useMemo(() => {
    const overdue = filteredOrderItems.filter((it) => it.sla.urgency === 'overdue')
    const soon = filteredOrderItems.filter((it) => it.sla.urgency === 'hour' || it.sla.urgency === 'fourHours')
    const others = filteredOrderItems.filter((it) => it.sla.urgency === 'none')
    return [
      { key: 'overdue', label: 'Quá hạn', color: 'text-red-600', items: overdue },
      { key: 'soon', label: 'Sắp tới', color: 'text-amber-600', items: soon },
      { key: 'others', label: 'Khác', color: 'text-muted-foreground', items: others }
    ]
  }, [filteredOrderItems])

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
        <div className='hidden sm:flex items-center gap-2'>
          <Badge variant='secondary' className='gap-1'>
            <AlertCircle className='w-3 h-3' /> Quá hạn: {overdueCount}
          </Badge>
          <Badge variant='outline' className='gap-1'>
            <Clock className='w-3 h-3' /> ≤ 1 giờ: {dueSoonCount}
          </Badge>
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
            <Button
              type='button'
              variant={priorityOnly ? 'default' : 'outline'}
              className='w-full sm:w-auto gap-2'
              onClick={() => setPriorityOnly((v) => !v)}
            >
              <Flame className='w-4 h-4' /> Ưu tiên
            </Button>
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
          <div className='space-y-6'>
            {groupedItems.map((group) =>
              group.items.length > 0 && (
                <div key={group.key} className='space-y-3'>
                  <div className='flex items-center gap-2'>
                    <span className={`font-semibold ${group.color}`}>{group.label}</span>
                    <Badge variant='outline'>{group.items.length}</Badge>
                  </div>
                  <div className='grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6'>
                    {group.items.map((it) => {
              const orderItem = it.base
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

                    {/* Next task (deadline is shown inside detail page) */}
                    <div className='flex flex-wrap items-center gap-2'>
                      {it.sla.estimateTotal > 0 && (
                        <Badge variant='outline'>Ước lượng: {it.sla.estimateTotal} phút</Badge>
                      )}
                      {it.nextTask && <Badge variant='outline'>Tiếp theo: {it.nextTask.name}</Badge>}
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
                </div>
              )
            )}
          </div>
        </TabsContent>

        <TabsContent value='list' className='space-y-4'>
          <Card>
            <CardHeader>
              <CardTitle>Danh sách công việc</CardTitle>
              <CardDescription>Hiển thị chi tiết tất cả các công việc được giao</CardDescription>
            </CardHeader>
            <CardContent>
              <div className='space-y-6'>
                {groupedItems.map((group) =>
                  group.items.length > 0 && (
                    <div key={group.key} className='space-y-3'>
                      <div className='flex items-center gap-2'>
                        <span className={`font-semibold ${group.color}`}>{group.label}</span>
                        <Badge variant='outline'>{group.items.length}</Badge>
                      </div>
                      <div className='space-y-4'>
                        {group.items.map((it) => {
                  const orderItem = it.base
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
                                  <div className='flex flex-wrap items-center gap-2 mt-1'>
                                    <span className='text-sm text-muted-foreground'>
                                      {completedTasks}/{totalTasks} nhiệm vụ • {progress}% hoàn thành
                                    </span>
                                    {it.sla.minutesLeft !== null && (
                                      <Badge
                                        variant={it.sla.urgency === 'overdue' ? 'destructive' : it.sla.urgency === 'hour' ? 'default' : 'secondary'}
                                        className={`${it.sla.urgency === 'fourHours' ? 'bg-amber-100 text-amber-800 border-amber-200' : ''}`}
                                      >
                                        {(() => {
                                          const m = it.sla.minutesLeft as number
                                          const abs = Math.abs(m)
                                          const hours = Math.floor(abs / 60)
                                          const mins = abs % 60
                                          const label = hours > 0 ? `${hours}h ${mins}m` : `${mins}m`
                                          return m < 0 ? `Quá hạn ${label}` : `Còn ${label}`
                                        })()}
                                      </Badge>
                                    )}
                                    {it.sla.estimateTotal > 0 && (
                                      <Badge variant='outline'>Ước lượng: {it.sla.estimateTotal} phút</Badge>
                                    )}
                                    {it.nextTask && <Badge variant='outline'>Tiếp theo: {it.nextTask.name}</Badge>}
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
                    </div>
                  )
                )}
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
