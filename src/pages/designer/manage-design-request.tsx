import { useState } from 'react'
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card'
import { Badge } from '@/components/ui/badge'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select'
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs'
import {
  Search,
  Filter,
  Calendar,
  Eye,
  Palette,
  Clock,
  CheckCircle,
  AlertCircle,
  FileText,
  Image as ImageIcon
} from 'lucide-react'
import dayjs from 'dayjs'
import { useDesignerTasks } from '@/hooks/use-designer-tasks'
import { DesignRequestDetailDialog } from './components/design-request-detail-dialog'
import { DesignerOrderTaskItemList, OrderItemOfDesigner } from '@/@types/designer-task.types'

// Interface mở rộng từ DesignerOrderTaskItemList để handle API response mới
interface ExtendedOrderTaskItem extends Omit<DesignerOrderTaskItemList, 'orderItem'> {
  orderItem: OrderItemOfDesigner // Thay đổi từ array thành object duy nhất
  measurement?: unknown
  addressId?: string | null
}

export function ManageDesignRequestPage() {
  const [searchTerm, setSearchTerm] = useState('')
  const [statusFilter, setStatusFilter] = useState<string>('all')
  const [selectedRequest, setSelectedRequest] = useState<ExtendedOrderTaskItem | null>(null)
  const [isDetailDialogOpen, setIsDetailDialogOpen] = useState(false)

  // Hook lấy dữ liệu design requests
  const { data: designRequests, isLoading, error } = useDesignerTasks()

  // Debug log để kiểm tra cấu trúc dữ liệu
  console.log('designRequests:', designRequests)

  const formatDate = (dateString: string) => {
    return dayjs(dateString).format('DD/MM/YYYY HH:mm')
  }

  const getTaskStatus = (milestones: ExtendedOrderTaskItem['milestones']) => {
    if (!milestones || milestones.length === 0) return 'PENDING'

    const allTasks = milestones.flatMap((m) => m.maternityDressTasks)
    if (allTasks.every((task) => task.status === 'COMPLETED')) return 'COMPLETED'
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
            Đang thiết kế
          </Badge>
        )
      case 'PENDING':
        return (
          <Badge variant='secondary'>
            <AlertCircle className='w-3 h-3 mr-1' />
            Chờ xử lý
          </Badge>
        )
      default:
        return <Badge variant='outline'>Không xác định</Badge>
    }
  }

  // Kiểm tra cấu trúc dữ liệu và lấy array đúng cách
  const requestsArray = designRequests?.data?.data || designRequests?.data || []

  const filteredRequests = Array.isArray(requestsArray)
    ? requestsArray.filter((request: ExtendedOrderTaskItem) => {
        // orderItem bây giờ là object duy nhất, không phải array
        const orderItem = request.orderItem

        if (!orderItem || !orderItem.designRequest) return false

        const orderCode = request.orderCode || 'N/A'
        const description = orderItem.designRequest.description || ''

        const matchesSearch =
          orderCode.toLowerCase().includes(searchTerm.toLowerCase()) ||
          description.toLowerCase().includes(searchTerm.toLowerCase())

        if (statusFilter === 'all') return matchesSearch
        return matchesSearch && getTaskStatus(request.milestones) === statusFilter
      })
    : []

  const handleViewDetail = (request: ExtendedOrderTaskItem) => {
    setSelectedRequest(request)
    setIsDetailDialogOpen(true)
  }

  if (isLoading) {
    return (
      <div className='flex items-center justify-center h-64'>
        <div className='text-center'>
          <div className='animate-spin rounded-full h-8 w-8 border-b-2 border-primary mx-auto'></div>
          <p className='mt-2 text-sm text-muted-foreground'>Đang tải dữ liệu...</p>
        </div>
      </div>
    )
  }

  if (error) {
    return (
      <div className='flex items-center justify-center h-64'>
        <div className='text-center'>
          <AlertCircle className='h-8 w-8 text-destructive mx-auto' />
          <p className='mt-2 text-sm text-destructive'>Có lỗi xảy ra khi tải dữ liệu</p>
        </div>
      </div>
    )
  }

  return (
    <div className='space-y-6'>
      {/* Header */}
      <div className='flex items-center justify-between'>
        <div>
          <h1 className='text-3xl font-bold tracking-tight'>Quản lý Design Request</h1>
          <p className='text-muted-foreground'>Quản lý và theo dõi các yêu cầu thiết kế từ khách hàng</p>
        </div>
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
                  placeholder='Tìm kiếm theo mã đơn hàng hoặc mô tả...'
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
                <SelectItem value='PENDING'>Chờ xử lý</SelectItem>
                <SelectItem value='IN_PROGRESS'>Đang thiết kế</SelectItem>
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
            {filteredRequests.map((request: ExtendedOrderTaskItem) => {
              // orderItem bây giờ là object duy nhất
              const orderItem = request.orderItem
              if (!orderItem || !orderItem.designRequest) return null

              return (
                <Card key={orderItem.id} className='hover:shadow-lg transition-shadow'>
                  <CardHeader>
                    <div className='flex items-center justify-between'>
                      <CardTitle className='text-lg'>Đơn hàng #{request.orderCode || 'N/A'}</CardTitle>
                      {getStatusBadge(getTaskStatus(request.milestones))}
                    </div>
                    <CardDescription>Tạo: {formatDate(orderItem.createdAt)}</CardDescription>
                  </CardHeader>
                  <CardContent className='space-y-4'>
                    {/* Design Request Info */}
                    <div className='space-y-2'>
                      <div className='flex items-center gap-2 text-sm'>
                        <FileText className='h-4 w-4 text-muted-foreground' />
                        <span className='font-medium'>Mô tả:</span>
                      </div>
                      <p className='text-sm text-muted-foreground line-clamp-2'>
                        {orderItem.designRequest.description || 'Không có mô tả'}
                      </p>
                    </div>

                    {/* Images preview */}
                    {orderItem.designRequest.images && orderItem.designRequest.images.length > 0 && (
                      <div className='space-y-2'>
                        <div className='flex items-center gap-2 text-sm'>
                          <ImageIcon className='h-4 w-4 text-muted-foreground' />
                          <span className='font-medium'>
                            Hình ảnh tham khảo ({orderItem.designRequest.images.length})
                          </span>
                        </div>
                        <div className='flex gap-2'>
                          {orderItem.designRequest.images.slice(0, 3).map((image: string, index: number) => (
                            <div key={index} className='w-16 h-16 rounded-lg overflow-hidden bg-muted'>
                              <img src={image} alt={`Reference ${index + 1}`} className='w-full h-full object-cover' />
                            </div>
                          ))}
                          {orderItem.designRequest.images.length > 3 && (
                            <div className='w-16 h-16 rounded-lg bg-muted flex items-center justify-center text-xs text-muted-foreground'>
                              +{orderItem.designRequest.images.length - 3}
                            </div>
                          )}
                        </div>
                      </div>
                    )}

                    {/* Tasks Progress */}
                    <div className='space-y-2'>
                      <div className='flex items-center gap-2 text-sm'>
                        <Palette className='h-4 w-4 text-muted-foreground' />
                        <span className='font-medium'>Tiến độ thiết kế:</span>
                      </div>
                      {request.milestones.map((milestone) => (
                        <div key={milestone.sequenceOrder} className='space-y-1'>
                          <p className='text-sm font-medium'>{milestone.name}</p>
                          {milestone.maternityDressTasks.map((task) => (
                            <div key={task.id} className='flex items-center gap-2 text-xs'>
                              <div
                                className={`w-2 h-2 rounded-full ${
                                  task.status === 'COMPLETED'
                                    ? 'bg-green-500'
                                    : task.status === 'IN_PROGRESS'
                                      ? 'bg-blue-500'
                                      : 'bg-gray-300'
                                }`}
                              />
                              <span className='flex-1'>{task.name}</span>
                            </div>
                          ))}
                        </div>
                      ))}
                    </div>

                    {/* Actions */}
                    <div className='flex gap-2 pt-2'>
                      <Button variant='outline' size='sm' className='flex-1' onClick={() => handleViewDetail(request)}>
                        <Eye className='h-4 w-4 mr-2' />
                        Xem chi tiết
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
              <CardTitle>Danh sách Design Request</CardTitle>
            </CardHeader>
            <CardContent>
              <div className='space-y-4'>
                {filteredRequests.map((request: ExtendedOrderTaskItem) => {
                  // orderItem bây giờ là object duy nhất
                  const orderItem = request.orderItem
                  if (!orderItem || !orderItem.designRequest) return null

                  return (
                    <div
                      key={orderItem.id}
                      className='flex items-center justify-between p-4 border rounded-lg hover:bg-muted/50'
                    >
                      <div className='flex-1 space-y-2'>
                        <div className='flex items-center gap-4'>
                          <h3 className='font-semibold'>Đơn hàng #{request.orderCode || 'N/A'}</h3>
                          {getStatusBadge(getTaskStatus(request.milestones))}
                        </div>
                        <p className='text-sm text-muted-foreground line-clamp-1'>
                          {orderItem.designRequest.description || 'Không có mô tả'}
                        </p>
                        <div className='flex items-center gap-4 text-xs text-muted-foreground'>
                          <span className='flex items-center gap-1'>
                            <Calendar className='h-3 w-3' />
                            {formatDate(orderItem.createdAt)}
                          </span>
                          <span className='flex items-center gap-1'>
                            <ImageIcon className='h-3 w-3' />
                            {orderItem.designRequest.images?.length || 0} hình
                          </span>
                        </div>
                      </div>
                      <Button variant='outline' size='sm' onClick={() => handleViewDetail(request)}>
                        <Eye className='h-4 w-4 mr-2' />
                        Chi tiết
                      </Button>
                    </div>
                  )
                })}
              </div>
            </CardContent>
          </Card>
        </TabsContent>
      </Tabs>

      {/* Design Request Detail Dialog */}
      {selectedRequest && (
        <DesignRequestDetailDialog
          isOpen={isDetailDialogOpen}
          onClose={() => setIsDetailDialogOpen(false)}
          designRequest={selectedRequest}
        />
      )}
    </div>
  )
}
