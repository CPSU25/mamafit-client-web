import { useMemo, useState, useCallback } from 'react'
import dayjs from 'dayjs'
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card'
import { Badge } from '@/components/ui/badge'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select'
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs'
import { Skeleton } from '@/components/ui/skeleton'
import {
  Search,
  Filter,
  Eye,
  Clock,
  CheckCircle,
  AlertCircle,
  FileText,
  Package,
  Flame,
  ShoppingBag,
  Tag,
  Zap
} from 'lucide-react'
import { ProductTaskGroup } from '@/pages/staff/manage-task/tasks/types'
import { useStaffGetOrderTasks, useStaffCompleteAllTasksForDemo } from '@/services/staff/staff-task.service'
import { useNavigate } from 'react-router-dom'
import { Main } from '@/components/layout/main'
import { toast } from 'sonner'

type AnyMilestone = { maternityDressTasks: Array<{ status: string }> }

export default function StaffTasksPage() {
  const [searchTerm, setSearchTerm] = useState('')
  const [statusFilter, setStatusFilter] = useState<string>('all')
  const [priorityOnly, setPriorityOnly] = useState<boolean>(false)

  const navigate = useNavigate()
  const { data: orderItems, isLoading, isError } = useStaffGetOrderTasks()
  const completeAllTasksForDemoMutation = useStaffCompleteAllTasksForDemo()
  console.log('Order Items:', orderItems)

  const getTaskStatus = useCallback((milestones: ProductTaskGroup['milestones']) => {
    if (!milestones || milestones.length === 0) return 'PENDING'

    const allTasks = milestones.flatMap((m) => m.maternityDressTasks)
    if (allTasks.every((task) => task.status === 'DONE' || task.status === 'PASS' || task.status === 'FAIL'))
      return 'COMPLETED'
    if (allTasks.some((task) => task.status === 'IN_PROGRESS')) return 'IN_PROGRESS'
    return 'PENDING'
  }, [])

  const getStatusBadge = useCallback((status: string) => {
    switch (status) {
      case 'COMPLETED':
        return (
          <Badge variant='default' className='bg-green-500 hover:bg-green-600'>
            <CheckCircle className='w-3 h-3 mr-1' />
            Hoàn thành
          </Badge>
        )
      case 'IN_PROGRESS':
        return (
          <Badge variant='default' className='bg-blue-500 hover:bg-blue-600'>
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
  }, [])

  // Compute SLA and urgency per order item
  const itemsWithSLA = useMemo(() => {
    return (orderItems || []).map((oi) => {
      const allTasks = oi.milestones.flatMap((m) => m.maternityDressTasks || [])
      const isCompleted = allTasks.every((t) => ['DONE', 'PASS', 'FAIL'].includes(t.status))
      const pendingTasks = allTasks.filter((t) => !['DONE', 'PASS', 'FAIL'].includes(t.status))
      const nextTask = pendingTasks.slice().sort((a, b) => {
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

  // Group items by order code
  const groupedByOrder = useMemo(() => {
    const grouped = new Map<string, typeof itemsWithSLA>()

    itemsWithSLA.forEach((item) => {
      const orderCode = item.base.orderCode || 'Unknown'
      if (!grouped.has(orderCode)) {
        grouped.set(orderCode, [])
      }
      grouped.get(orderCode)!.push(item)
    })

    return Array.from(grouped.entries()).map(([orderCode, items]) => ({
      orderCode,
      items,
      totalItems: items.length,
      completedItems: items.filter((item) => item.isCompleted).length,
      inProgressItems: items.filter((item) => getTaskStatus(item.base.milestones) === 'IN_PROGRESS').length
    }))
  }, [itemsWithSLA, getTaskStatus])

  const filteredOrderItems = useMemo(() => {
    const search = searchTerm.trim().toLowerCase()
    const status = statusFilter
    const urgencyRank: Record<string, number> = { overdue: 0, hour: 1, fourHours: 2, none: 3 }

    const filtered = groupedByOrder.filter((group) => {
      const hasMatchingItems = group.items.some((it) => {
        const oi = it.base // it.base is ProductTaskGroup
        const styleName = oi.preset?.styleName ?? oi.maternityDressDetail?.name ?? ''
        const orderItemId = oi.orderItemId
        const matchesSearch = styleName.toLowerCase().includes(search) || orderItemId.toLowerCase().includes(search)
        const statusOk = status === 'all' ? true : getTaskStatus(oi.milestones) === status
        const priorityOk = !priorityOnly || it.sla.urgency !== 'none'
        return matchesSearch && statusOk && priorityOk
      })

      return hasMatchingItems
    })

    return filtered.sort((a, b) => {
      // Sort by urgency (highest first)
      const maxUrgencyA = Math.min(...a.items.map((item) => urgencyRank[item.sla.urgency]))
      const maxUrgencyB = Math.min(...b.items.map((item) => urgencyRank[item.sla.urgency]))
      if (maxUrgencyA !== maxUrgencyB) return maxUrgencyA - maxUrgencyB

      // Then by nearest deadline
      const minDeadlineA = Math.min(...a.items.map((item) => item.sla.minutesLeft ?? Number.POSITIVE_INFINITY))
      const minDeadlineB = Math.min(...b.items.map((item) => item.sla.minutesLeft ?? Number.POSITIVE_INFINITY))
      return minDeadlineA - minDeadlineB
    })
  }, [groupedByOrder, searchTerm, statusFilter, priorityOnly, getTaskStatus])

  const totalOrderItems = orderItems?.length || 0
  const completedItems = orderItems?.filter((item) => getTaskStatus(item.milestones) === 'COMPLETED').length || 0
  const inProgressItems = orderItems?.filter((item) => getTaskStatus(item.milestones) === 'IN_PROGRESS').length || 0
  const overdueCount = itemsWithSLA.filter((it) => it.sla.urgency === 'overdue').length
  const dueSoonCount = itemsWithSLA.filter((it) => it.sla.urgency === 'hour').length

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
    <Main className='space-y-6'>
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
          <Button
            size='sm'
            variant='outline'
            onClick={() => {
              if (orderItems && orderItems.length > 0) {
                // Hoàn thành nhanh milestone hiện tại của tất cả order items
                const promises = orderItems.map(orderItem => 
                  completeAllTasksForDemoMutation.mutateAsync({
                    orderItemId: orderItem.orderItemId,
                    milestones: orderItem.milestones,
                    currentSequence: null // Sẽ tự động tìm milestone đầu tiên chưa hoàn thành
                  })
                )
                Promise.all(promises).then(() => {
                  toast.success('Đã hoàn thành nhanh milestone hiện tại của tất cả công việc cho demo!')
                }).catch((error) => {
                  console.error('Error completing milestone tasks:', error)
                })
              }
            }}
            disabled={completeAllTasksForDemoMutation.isPending}
            className='gap-2 bg-gradient-to-r from-yellow-50 to-orange-50 border-yellow-300 text-yellow-800 hover:bg-yellow-100'
          >
            <Zap className='h-4 w-4' />
            {completeAllTasksForDemoMutation.isPending ? 'Đang hoàn thành...' : 'Hoàn thành milestone (Demo)'}
          </Button>
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

        <TabsContent value='grid' className='space-y-6'>
          <div className='space-y-8'>
            {filteredOrderItems.map((orderGroup) => (
              <div key={orderGroup.orderCode} className='space-y-4'>
                <div className='flex items-center justify-between p-4 bg-gradient-to-r from-violet-50 to-purple-50 rounded-lg border border-violet-200'>
                  <div className='flex items-center gap-3'>
                    <div className='p-2 bg-violet-100 rounded-lg'>
                      <ShoppingBag className='h-5 w-5 text-violet-600' />
                    </div>
                    <div>
                      <h3 className='text-lg font-semibold text-violet-900'>Đơn hàng: {orderGroup.orderCode}</h3>
                      <p className='text-sm text-violet-700'>
                        {orderGroup.totalItems} sản phẩm • {orderGroup.completedItems} hoàn thành •{' '}
                        {orderGroup.inProgressItems} đang thực hiện
                      </p>
                    </div>
                  </div>
                  <Badge variant='outline' className='bg-white border-violet-300 text-violet-700'>
                    {orderGroup.totalItems} sản phẩm
                  </Badge>
                </div>

                {/* Product Cards Grid */}
                <div className='grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6'>
                  {orderGroup.items.map((it) => {
                    const orderItem = it.base // it.base is ProductTaskGroup
                    const displayName = orderItem.preset?.name ?? orderItem.maternityDressDetail?.name ?? '—'
                    const displaySku = orderItem.preset?.sku ?? orderItem.maternityDressDetail?.sku ?? '—'
                    const displayImage =
                      orderItem.preset?.images?.[0] ?? orderItem.maternityDressDetail?.image?.[0] ?? ''
                    const displayPrice = orderItem.preset?.price ?? orderItem.maternityDressDetail?.price ?? 0
                    const displayOrderItemId = orderItem.orderItemId
                    const totalTasks = orderItem.milestones.reduce(
                      (sum: number, milestone: AnyMilestone) => sum + milestone.maternityDressTasks.length,
                      0
                    )
                    const completedTasks = orderItem.milestones.reduce(
                      (sum: number, milestone: AnyMilestone) =>
                        sum +
                        milestone.maternityDressTasks.filter(
                          (task: { status: string }) =>
                            task.status === 'DONE' || task.status === 'PASS' || task.status === 'FAIL'
                        ).length,
                      0
                    )
                    const progress = totalTasks > 0 ? Math.round((completedTasks / totalTasks) * 100) : 0

                    return (
                      <Card
                        key={`grid-${displayOrderItemId}`}
                        className='hover:shadow-lg transition-all duration-300 border-2 hover:border-violet-300'
                      >
                        <CardHeader className='pb-3'>
                          <div className='flex items-start justify-between'>
                            <div className='flex-1'>
                              <CardTitle className='text-lg text-gray-900 mb-1'>{displayName}</CardTitle>
                              <div className='flex items-center gap-2 text-sm text-gray-600'>
                                <Tag className='h-3 w-3' />
                                <span>SKU: {displaySku}</span>
                              </div>
                            </div>
                            {getStatusBadge(getTaskStatus(orderItem.milestones))}
                          </div>
                        </CardHeader>

                        <CardContent className='space-y-4'>
                          {/* Product Image and Price */}
                          <div className='flex items-center gap-4'>
                            <div className='relative'>
                              <img
                                src={displayImage}
                                alt={displayName}
                                className='w-20 h-20 rounded-lg object-cover shadow-md border-2 border-gray-100'
                              />
                              {it.sla.urgency === 'overdue' && (
                                <div className='absolute -top-2 -right-2 w-6 h-6 bg-red-500 rounded-full flex items-center justify-center'>
                                  <span className='text-white text-xs font-bold'>!</span>
                                </div>
                              )}
                            </div>
                            <div className='flex-1'>
                              <p className='text-xl font-bold text-primary mb-1'>
                                {new Intl.NumberFormat('vi-VN', {
                                  style: 'currency',
                                  currency: 'VND'
                                }).format(displayPrice)}
                              </p>
                              <p className='text-sm text-muted-foreground mb-2'>{progress}% hoàn thành</p>
                              <div className='w-full bg-gray-200 rounded-full h-2'>
                                <div
                                  className='bg-gradient-to-r from-violet-500 to-purple-600 h-2 rounded-full transition-all duration-300'
                                  style={{ width: `${progress}%` }}
                                ></div>
                              </div>
                            </div>
                          </div>

                          {/* Task Progress Info */}
                          <div className='space-y-2 bg-violet-50 p-3 rounded-lg'>
                            <div className='flex items-center justify-between text-sm'>
                              <div className='flex items-center gap-2'>
                                <FileText className='h-4 w-4 text-violet-600' />
                                <span className='font-medium'>{orderItem.milestones.length} giai đoạn</span>
                              </div>
                              <Badge variant='secondary' className='text-xs'>
                                {completedTasks}/{totalTasks}
                              </Badge>
                            </div>
                            <div className='flex items-center gap-2 text-sm text-violet-600'>
                              <Package className='h-4 w-4 text-purple-600' />
                              <span>
                                {completedTasks}/{totalTasks} nhiệm vụ hoàn thành
                              </span>
                            </div>
                          </div>

                          {/* SLA and Next Task */}
                          <div className='space-y-2'>
                            {it.sla.estimateTotal > 0 && (
                              <Badge
                                variant='outline'
                                className='w-full justify-center bg-amber-50 text-amber-700 border-amber-200'
                              >
                                ⏱️ Ước lượng: {it.sla.estimateTotal} phút
                              </Badge>
                            )}
                            {it.nextTask && (
                              <Badge
                                variant='outline'
                                className='w-full justify-center bg-violet-50 text-violet-700 border-violet-200'
                              >
                                📋 Tiếp theo: {it.nextTask.name}
                              </Badge>
                            )}
                            {it.sla.minutesLeft !== null && (
                              <Badge
                                variant={
                                  it.sla.urgency === 'overdue'
                                    ? 'destructive'
                                    : it.sla.urgency === 'hour'
                                      ? 'default'
                                      : 'secondary'
                                }
                                className={`w-full justify-center ${
                                  it.sla.urgency === 'fourHours' ? 'bg-amber-100 text-amber-800 border-amber-200' : ''
                                }`}
                              >
                                {(() => {
                                  const m = it.sla.minutesLeft as number
                                  const abs = Math.abs(m)
                                  const hours = Math.floor(abs / 60)
                                  const mins = abs % 60
                                  const label = hours > 0 ? `${hours}h ${mins}m` : `${mins}m`
                                  return m < 0 ? `⏰ Quá hạn ${label}` : `⏰ Còn ${label}`
                                })()}
                              </Badge>
                            )}
                          </div>

                          {/* Actions */}
                          <div className='pt-2'>
                            <Button
                              size='sm'
                              onClick={() => navigate(`/system/staff/order-item/${displayOrderItemId}`)}
                              className='w-full bg-gradient-to-r from-violet-600 to-purple-600 hover:from-violet-700 hover:to-purple-700'
                            >
                              <Eye className='h-4 w-4 mr-2' />
                              Xem chi tiết
                            </Button>
                          </div>
                        </CardContent>
                      </Card>
                    )
                  })}
                </div>
              </div>
            ))}
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
                {filteredOrderItems.map((orderGroup) => (
                  <div key={orderGroup.orderCode} className='space-y-3'>
                    {/* Order Group Header for List View */}
                    <div className='flex items-center gap-2 p-3 bg-violet-50 rounded-lg border border-violet-200'>
                      <ShoppingBag className='h-5 w-5 text-violet-600' />
                      <span className='font-semibold text-violet-900'>Order: {orderGroup.orderCode}</span>
                      <Badge variant='outline' className='bg-white border-violet-300 text-violet-700'>
                        {orderGroup.totalItems} items
                      </Badge>
                    </div>

                    <div className='space-y-4'>
                      {orderGroup.items.map((it) => {
                        const orderItem = it.base // it.base is ProductTaskGroup
                        const displayName = orderItem.preset?.styleName ?? orderItem.maternityDressDetail?.name ?? '—'
                        const displaySku = orderItem.preset?.sku ?? orderItem.maternityDressDetail?.sku ?? '—'
                        const displayImage =
                          orderItem.preset?.images?.[0] ?? orderItem.maternityDressDetail?.image?.[0] ?? ''
                        const displayPrice = orderItem.preset?.price ?? orderItem.maternityDressDetail?.price ?? 0
                        const displayOrderItemId = orderItem.orderItemId
                        const totalTasks = orderItem.milestones.reduce(
                          (sum: number, milestone: AnyMilestone) => sum + milestone.maternityDressTasks.length,
                          0
                        )
                        const completedTasks = orderItem.milestones.reduce(
                          (sum: number, milestone: AnyMilestone) =>
                            sum +
                            milestone.maternityDressTasks.filter(
                              (task: { status: string }) =>
                                task.status === 'DONE' || task.status === 'PASS' || task.status === 'FAIL'
                            ).length,
                          0
                        )
                        const progress = totalTasks > 0 ? Math.round((completedTasks / totalTasks) * 100) : 0

                        return (
                          <div
                            key={`list-${displayOrderItemId}`}
                            className='flex items-center justify-between p-4 border rounded-lg hover:bg-gray-50 transition-colors bg-white'
                          >
                            <div className='flex items-center gap-4'>
                              <div className='relative'>
                                <img
                                  src={displayImage}
                                  alt={displayName}
                                  className='w-16 h-16 rounded-lg object-cover shadow-sm border-2 border-gray-100'
                                />
                                {it.sla.urgency === 'overdue' && (
                                  <div className='absolute -top-1 -right-1 w-5 h-5 bg-red-500 rounded-full flex items-center justify-center'>
                                    <span className='text-white text-xs font-bold'>!</span>
                                  </div>
                                )}
                              </div>
                              <div>
                                <h3 className='font-semibold text-gray-900'>{displayName}</h3>
                                <p className='text-sm text-gray-600 mb-1'>SKU: {displaySku}</p>
                                <div className='flex flex-wrap items-center gap-2'>
                                  <span className='text-sm text-muted-foreground'>
                                    {completedTasks}/{totalTasks} nhiệm vụ • {progress}% hoàn thành
                                  </span>
                                  {it.sla.minutesLeft !== null && (
                                    <Badge
                                      variant={
                                        it.sla.urgency === 'overdue'
                                          ? 'destructive'
                                          : it.sla.urgency === 'hour'
                                            ? 'default'
                                            : 'secondary'
                                      }
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
                              <div className='text-right'>
                                <p className='text-lg font-bold text-primary'>
                                  {new Intl.NumberFormat('vi-VN', {
                                    style: 'currency',
                                    currency: 'VND'
                                  }).format(displayPrice)}
                                </p>
                                {getStatusBadge(getTaskStatus(orderItem.milestones))}
                              </div>
                              <Button
                                variant='outline'
                                size='sm'
                                onClick={() => navigate(`/system/staff/order-item/${displayOrderItemId}`)}
                              >
                                <Eye className='h-4 w-4 mr-2' />
                                Xem
                              </Button>
                            </div>
                          </div>
                        )
                      })}
                    </div>
                  </div>
                ))}
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
    </Main>
  )
}
