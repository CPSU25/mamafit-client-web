import { useState, useMemo } from 'react'
import {
  FileText,
  Filter,
  RefreshCw,
  Eye,
  CheckCircle,
  Clock,
  ShieldCheck,
  AlertTriangle,
  Wrench,
  Loader2,
  User,
  Package,
  Calendar
} from 'lucide-react'
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card'
import { Input } from '@/components/ui/input'
import { Button } from '@/components/ui/button'
import { Badge } from '@/components/ui/badge'
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select'
import { Alert, AlertDescription } from '@/components/ui/alert'
import { useWarrantyRequestOfBranchs, useCompleteWarrantyRequest } from '@/services/global/warranty.service'
import { StatusWarrantyRequest } from '@/@types/warranty-request.types'
import { WarrantyRequestDetailDialog } from './WarrantyRequestDetailDialog'

// Enhanced Warranty Requests List Component with Pagination and Filters - Horizontal Layout
export function WarrantyRequestsList() {
  const [currentPage, setCurrentPage] = useState(1)
  const [statusFilter, setStatusFilter] = useState<string>('all')
  const [searchQuery, setSearchQuery] = useState('')
  const [selectedRequestId, setSelectedRequestId] = useState<string>('')
  const [detailDialogOpen, setDetailDialogOpen] = useState(false)
  const pageSize = 8 // Fewer items for horizontal layout

  const { data, isLoading, error, refetch } = useWarrantyRequestOfBranchs({
    index: currentPage,
    pageSize: pageSize,
    search: searchQuery,
    sortBy: 'CREATED_AT_ASC'
  })

  const { mutateAsync: completeWarrantyRequest, isPending: isCompleting } = useCompleteWarrantyRequest()

  const totalPages = data?.totalPages ?? 0

  // Filter by status and sort by created date (newest first)
  const filteredRequests = useMemo(() => {
    const warrantyRequests = data?.items ?? []
    let filtered = warrantyRequests

    // Filter by status
    if (statusFilter !== 'all') {
      filtered = warrantyRequests.filter((request) => request.status === statusFilter)
    }

    // Sort by created date (newest first) - additional client-side sorting
    filtered = filtered.sort((a, b) => {
      const dateA = new Date(a.createdAt).getTime()
      const dateB = new Date(b.createdAt).getTime()
      return dateB - dateA // Descending order (newest first)
    })

    return filtered
  }, [data?.items, statusFilter])

  const getStatusConfig = (status: StatusWarrantyRequest) => {
    const configs = {
      [StatusWarrantyRequest.PENDING]: {
        label: 'Chờ xử lý',
        color: 'bg-amber-100 text-amber-800 dark:bg-amber-900/30 dark:text-amber-400',
        icon: Clock
      },
      [StatusWarrantyRequest.APPROVED]: {
        label: 'Đã duyệt',
        color: 'bg-blue-100 text-blue-800 dark:bg-blue-900/30 dark:text-blue-400',
        icon: ShieldCheck
      },
      [StatusWarrantyRequest.REPAIRING]: {
        label: 'Đang sửa chữa',
        color: 'bg-indigo-100 text-indigo-800 dark:bg-indigo-900/30 dark:text-indigo-400',
        icon: Wrench
      },
      [StatusWarrantyRequest.COMPLETED]: {
        label: 'Hoàn thành',
        color: 'bg-emerald-100 text-emerald-800 dark:bg-emerald-900/30 dark:text-emerald-400',
        icon: CheckCircle
      },
      [StatusWarrantyRequest.REJECTED]: {
        label: 'Từ chối',
        color: 'bg-red-100 text-red-800 dark:bg-red-900/30 dark:text-red-400',
        icon: AlertTriangle
      },
      [StatusWarrantyRequest.PARTIALLY_REJECTED]: {
        label: 'Từ chối một phần',
        color: 'bg-orange-100 text-orange-800 dark:bg-orange-900/30 dark:text-orange-400',
        icon: AlertTriangle
      },
      [StatusWarrantyRequest.CANCELLED]: {
        label: 'Đã hủy',
        color: 'bg-gray-100 text-gray-800 dark:bg-gray-900/30 dark:text-gray-400',
        icon: AlertTriangle
      }
    }
    return configs[status] || configs[StatusWarrantyRequest.PENDING]
  }

  const handlePageChange = (page: number) => {
    if (page >= 1 && page <= totalPages) {
      setCurrentPage(page)
    }
  }

  const handleSearch = (value: string) => {
    setSearchQuery(value)
    setCurrentPage(1) // Reset to first page when searching
  }

  const handleStatusFilter = (status: string) => {
    setStatusFilter(status)
    setCurrentPage(1) // Reset to first page when filtering
  }

  const handleCompleteWarranty = async (requestId: string) => {
    // Show confirmation dialog
    const confirmed = window.confirm('Bạn có chắc chắn muốn hoàn thành yêu cầu bảo hành này không?')

    if (!confirmed) return

    try {
      await completeWarrantyRequest(requestId)
      // The service will automatically invalidate queries and refresh the list
    } catch (error) {
      console.error('Error completing warranty request:', error)
    }
  }

  const handleViewDetail = (requestId: string) => {
    setSelectedRequestId(requestId)
    setDetailDialogOpen(true)
  }

  if (error) {
    return (
      <>
        <Card>
          <CardContent className='p-6'>
            <Alert variant='destructive'>
              <AlertTriangle className='h-4 w-4' />
              <AlertDescription>
                Không thể tải danh sách yêu cầu bảo hành.
                <Button size='sm' variant='outline' className='ml-2' onClick={() => refetch()}>
                  <RefreshCw className='h-4 w-4 mr-1' />
                  Thử lại
                </Button>
              </AlertDescription>
            </Alert>
          </CardContent>
        </Card>

        {/* Detail Dialog */}
        <WarrantyRequestDetailDialog
          open={detailDialogOpen}
          onOpenChange={setDetailDialogOpen}
          warrantyRequestId={selectedRequestId}
        />
      </>
    )
  }

  return (
    <>
      <Card>
        <CardHeader>
          <div className='flex items-center justify-between'>
            <div>
              <CardTitle className='text-xl bg-gradient-to-r from-violet-600 to-purple-600 bg-clip-text text-transparent flex items-center gap-2'>
                <FileText className='h-5 w-5 text-violet-600' />
                Danh sách yêu cầu bảo hành
              </CardTitle>
              <p className='text-sm text-muted-foreground mt-1'>
                Quản lý và theo dõi các yêu cầu bảo hành của chi nhánh
              </p>
            </div>
            <Button variant='outline' onClick={() => refetch()} disabled={isLoading}>
              <RefreshCw className='h-4 w-4 mr-2' />
              Tải lại
            </Button>
          </div>

          {/* Filters and Search */}
          <div className='flex flex-col sm:flex-row gap-4'>
            <div className='flex-1'>
              <Input
                placeholder='Tìm kiếm theo SKU, mã đơn hàng...'
                value={searchQuery}
                onChange={(e) => handleSearch(e.target.value)}
                className='bg-white dark:bg-background'
              />
            </div>
            <div className='flex items-center gap-2'>
              <Filter className='h-4 w-4 text-muted-foreground' />
              <Select value={statusFilter} onValueChange={handleStatusFilter}>
                <SelectTrigger className='w-40 bg-white dark:bg-background'>
                  <SelectValue placeholder='Trạng thái' />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value='all'>Tất cả</SelectItem>
                  <SelectItem value={StatusWarrantyRequest.PENDING}>Chờ xử lý</SelectItem>
                  <SelectItem value={StatusWarrantyRequest.APPROVED}>Đã duyệt</SelectItem>
                  <SelectItem value={StatusWarrantyRequest.REPAIRING}>Đang sửa chữa</SelectItem>
                  <SelectItem value={StatusWarrantyRequest.COMPLETED}>Hoàn thành</SelectItem>
                  <SelectItem value={StatusWarrantyRequest.REJECTED}>Từ chối</SelectItem>
                </SelectContent>
              </Select>
            </div>
          </div>
        </CardHeader>

        <CardContent>
          {isLoading ? (
            <div className='grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4'>
              {Array.from({ length: 4 }).map((_, index) => (
                <Card key={index} className='animate-pulse'>
                  <CardContent className='p-4'>
                    <div className='space-y-3'>
                      <div className='h-4 bg-muted rounded w-3/4'></div>
                      <div className='h-3 bg-muted rounded w-1/2'></div>
                      <div className='h-8 bg-muted rounded'></div>
                    </div>
                  </CardContent>
                </Card>
              ))}
            </div>
          ) : filteredRequests.length === 0 ? (
            <div className='text-center py-12'>
              <FileText className='h-12 w-12 mx-auto text-muted-foreground mb-4' />
              <h3 className='text-lg font-medium mb-2'>Không có yêu cầu bảo hành</h3>
              <p className='text-muted-foreground'>
                {searchQuery || statusFilter !== 'all'
                  ? 'Không tìm thấy yêu cầu nào với bộ lọc hiện tại'
                  : 'Chưa có yêu cầu bảo hành nào được tạo'}
              </p>
            </div>
          ) : (
            <div className='grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4'>
              {filteredRequests.map((request) => {
                const statusConfig = getStatusConfig(request.status)
                const StatusIcon = statusConfig.icon

                return (
                  <Card key={request.id} className='hover:shadow-md transition-shadow'>
                    <CardContent className='p-4'>
                      <div className='space-y-3'>
                        {/* Header with Status */}
                        <div className='flex items-center justify-between'>
                          <Badge className={statusConfig.color}>
                            <StatusIcon className='h-3 w-3 mr-1' />
                            {statusConfig.label}
                          </Badge>
                          <span className='text-xs text-muted-foreground'>#{request.id.slice(-8)}</span>
                        </div>

                        {/* SKU */}
                        <div>
                          <p className='font-medium text-sm'>SKU: {request.sku}</p>
                          <p className='text-xs text-muted-foreground'>ID: {request.id.slice(0, 8)}...</p>
                        </div>

                        {/* Customer Info */}
                        <div className='space-y-1'>
                          <div className='flex items-center gap-2 text-xs'>
                            <User className='h-3 w-3' />
                            <span>{request.customer.fullName}</span>
                          </div>
                          <div className='flex items-center gap-2 text-xs text-muted-foreground'>
                            <span>{request.customer.phoneNumber}</span>
                          </div>
                        </div>

                        {/* Warranty Info */}
                        <div className='flex items-center justify-between text-xs'>
                          <div className='flex items-center gap-1'>
                            <Package className='h-3 w-3' />
                            <span>Lần BH: {request.warrantyRound}</span>
                          </div>
                          <div className='flex items-center gap-1'>
                            <span>{request.countItem} SP</span>
                          </div>
                        </div>

                        {/* Fee Info */}
                        {request.totalFee && request.totalFee > 0 && (
                          <div className='flex items-center gap-1 text-xs text-amber-600 dark:text-amber-400'>
                            <span>Phí: {request.totalFee.toLocaleString('vi-VN')} ₫</span>
                          </div>
                        )}

                        {/* Created Date */}
                        <div className='flex items-center gap-1 text-xs text-muted-foreground'>
                          <Calendar className='h-3 w-3' />
                          <div className='text-xs text-muted-foreground'>
                            {new Date(request.createdAt).toLocaleDateString('vi-VN')}
                          </div>
                        </div>

                        {/* Action Buttons */}
                        <div className='flex flex-col gap-2 pt-2 border-t'>
                          <Button
                            size='sm'
                            variant='outline'
                            className='w-full'
                            onClick={() => handleViewDetail(request.id)}
                          >
                            <Eye className='h-3 w-3 mr-1' />
                            Xem chi tiết
                          </Button>
                          {(request.status === StatusWarrantyRequest.APPROVED ||
                            request.status === StatusWarrantyRequest.REPAIRING) && (
                            <Button
                              size='sm'
                              variant='default'
                              className='w-full bg-emerald-600 hover:bg-emerald-700'
                              onClick={() => handleCompleteWarranty(request.id)}
                              disabled={isCompleting}
                            >
                              {isCompleting ? (
                                <Loader2 className='h-3 w-3 mr-1 animate-spin' />
                              ) : (
                                <CheckCircle className='h-3 w-3 mr-1' />
                              )}
                              {isCompleting ? 'Đang xử lý...' : 'Hoàn thành'}
                            </Button>
                          )}
                        </div>
                      </div>
                    </CardContent>
                  </Card>
                )
              })}
            </div>
          )}

          {/* Enhanced Pagination */}
          {data && data.totalCount > 0 && (
            <div className='flex flex-col sm:flex-row items-center justify-between gap-4 pt-4 border-t'>
              <div className='text-sm text-muted-foreground'>
                Trang {currentPage} của {totalPages} ({data?.totalCount ?? 0} yêu cầu
                {statusFilter !== 'all' ? `, hiển thị ${filteredRequests.length} đã lọc` : ''})
              </div>
              {totalPages > 1 && (
                <div className='flex items-center gap-2'>
                  <Button
                    variant='outline'
                    size='sm'
                    onClick={() => handlePageChange(currentPage - 1)}
                    disabled={currentPage <= 1}
                  >
                    ← Trước
                  </Button>

                  <div className='flex items-center gap-1'>
                    {Array.from({ length: Math.min(5, totalPages) }, (_, i) => {
                      const page = i + 1
                      return (
                        <Button
                          key={page}
                          variant={currentPage === page ? 'default' : 'outline'}
                          size='sm'
                          onClick={() => handlePageChange(page)}
                          className='w-9 h-9 p-0'
                        >
                          {page}
                        </Button>
                      )
                    })}

                    {totalPages > 5 && (
                      <>
                        <span className='text-muted-foreground px-2'>...</span>
                        <Button
                          variant='outline'
                          size='sm'
                          onClick={() => handlePageChange(totalPages)}
                          className='w-9 h-9 p-0'
                        >
                          {totalPages}
                        </Button>
                      </>
                    )}
                  </div>

                  <Button
                    variant='outline'
                    size='sm'
                    onClick={() => handlePageChange(currentPage + 1)}
                    disabled={currentPage >= totalPages}
                  >
                    Sau →
                  </Button>
                </div>
              )}
            </div>
          )}
        </CardContent>
      </Card>

      {/* Detail Dialog */}
      <WarrantyRequestDetailDialog
        open={detailDialogOpen}
        onOpenChange={setDetailDialogOpen}
        warrantyRequestId={selectedRequestId}
      />
    </>
  )
}
