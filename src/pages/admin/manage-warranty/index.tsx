import { useState } from 'react'
import { Shield, RefreshCw, TrendingUp, Clock } from 'lucide-react'
import { Tabs, TabsList, TabsTrigger } from '@/components/ui/tabs'
import { Dialog, DialogContent } from '@/components/ui/dialog'
import { Button } from '@/components/ui/button'
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card'
import {
  Pagination,
  PaginationContent,
  PaginationItem,
  PaginationLink,
  PaginationNext,
  PaginationPrevious
} from '@/components/ui/pagination'
import { Main } from '@/components/layout/main'
import { WarrantyFilters, WarrantyRequestCard, WarrantyDecisionForm } from './components'
import { useWarrantyRequestList, useWarrantyRequestById } from '@/services/global/warranty.service'
import { WarrantyRequestList, StatusWarrantyRequest } from '@/@types/warranty-request.types'
import { cn } from '@/lib/utils/utils'

function WarrantyManagementSystem() {
  const [selectedTab, setSelectedTab] = useState('all')
  const [searchQuery, setSearchQuery] = useState('')
  const [statusFilter, setStatusFilter] = useState('all')
  const [selectedRequestId, setSelectedRequestId] = useState<string | null>(null)
  const [selectedItemForEdit, setSelectedItemForEdit] = useState<WarrantyRequestList | null>(null)

  // Pagination states
  const [currentPage, setCurrentPage] = useState(1)
  const [pageSize] = useState(12) // 12 items per page for better grid layout

  const { data: warrantyRequestsResponse, isLoading } = useWarrantyRequestList({
    page: currentPage,
    limit: pageSize,
    search: searchQuery,
    sortBy: 'CREATED_AT_DESC'
  })

  const { data: selectedWarrantyRequest, isLoading: isLoadingDetail } = useWarrantyRequestById(
    selectedRequestId || '',
    {
      enabled: !!selectedRequestId
    }
  )

  // Extract warranty requests and pagination info
  const warrantyRequests = warrantyRequestsResponse?.items ?? []

  // For pagination, we'll display all items from current page
  // Filtering will be handled server-side through search params
  const displayRequests = warrantyRequests

  // Calculate stats từ current page data
  const stats = {
    total: warrantyRequestsResponse?.totalCount ?? 0,
    pending: warrantyRequests.filter((r) => r.status === StatusWarrantyRequest.PENDING).length ?? 0,
    approved: warrantyRequests.filter((r) => r.status === StatusWarrantyRequest.APPROVED).length ?? 0,
    completed: warrantyRequests.filter((r) => r.status === StatusWarrantyRequest.COMPLETED).length ?? 0
  }

  const handleViewDetail = (request: WarrantyRequestList) => {
    setSelectedRequestId(request.id)
  }

  const handleCloseDetail = () => {
    setSelectedRequestId(null)
  }

  // Handle pagination
  const handlePageChange = (page: number) => {
    setCurrentPage(page)
  }

  // Reset page when filters change
  const handleSearchChange = (search: string) => {
    setSearchQuery(search)
    setCurrentPage(1)
  }

  const handleStatusFilterChange = (status: string) => {
    setStatusFilter(status)
    setCurrentPage(1)
  }

  const handleTabChange = (tab: string) => {
    setSelectedTab(tab)
    setCurrentPage(1)
  }

  const handleClearFilters = () => {
    setSearchQuery('')
    setStatusFilter('all')
    setSelectedTab('all')
    setCurrentPage(1)
  }
  return (
    <Main className='min-h-screen'>
      {/* Modern Header */}
      <div className='sticky top-0 z-30 bg-white/80 dark:bg-gray-900/80 backdrop-blur-lg border-b border-gray-200/50 dark:border-gray-700/50 -mx-4 -mt-6 mb-8'>
        <div className='container mx-auto px-6 py-4'>
          <div className='flex flex-col lg:flex-row lg:items-center justify-between gap-4'>
            <div className='flex items-center gap-4'>
              <div className='p-3 bg-gradient-to-r from-violet-500 to-purple-600 dark:from-violet-600 dark:to-purple-700 rounded-xl shadow-lg'>
                <Shield className='w-8 h-8 text-white' />
              </div>
              <div>
                <h1 className='text-3xl font-bold bg-gradient-to-r from-purple-900 via-violet-700 to-purple-700 dark:from-gray-100 dark:via-violet-300 dark:to-purple-300 bg-clip-text text-transparent'>
                  Yêu Cầu Bảo Hành
                </h1>
                <p className='text-gray-600 dark:text-gray-300 mt-1'>
                  Xử lý và theo dõi yêu cầu bảo hành từ khách hàng
                </p>
              </div>
            </div>
          </div>
        </div>
      </div>

      <div className='container mx-auto space-y-8'>
        {/* Enhanced Stats Cards with Modern Design */}
        <div className='grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6'>
          <Card className='relative overflow-hidden bg-gradient-to-br from-violet-500 via-violet-600 to-purple-600 dark:from-violet-600 dark:via-violet-700 dark:to-purple-700 text-white border-0 shadow-xl'>
            <div className='absolute inset-0 bg-[url("data:image/svg+xml,%3Csvg width="20" height="20" xmlns="http://www.w3.org/2000/svg"%3E%3Cdefs%3E%3Cpattern id="grid" width="20" height="20" patternUnits="userSpaceOnUse"%3E%3Cpath d="M 20 0 L 0 0 0 20" fill="none" stroke="white" stroke-width="0.5" opacity="0.1"/%3E%3C/pattern%3E%3C/defs%3E%3Crect width="100%25" height="100%25" fill="url(%23grid)" /%3E%3C/svg%3E")] opacity-20'></div>
            <CardHeader className='pb-3 relative'>
              <CardTitle className='text-sm font-medium flex items-center gap-2 text-violet-100'>
                <Shield className='w-4 h-4' />
                Tổng yêu cầu
              </CardTitle>
            </CardHeader>
            <CardContent className='relative'>
              <div className='text-4xl font-bold mb-2'>{stats.total}</div>
              <p className='text-violet-100 text-sm'>Tất cả yêu cầu bảo hành</p>
            </CardContent>
          </Card>

          <Card className='relative overflow-hidden bg-gradient-to-br from-amber-400 via-orange-400 to-amber-500 dark:from-amber-500 dark:via-orange-500 dark:to-amber-600 text-white border-0 shadow-xl'>
            <div className='absolute top-2 right-2 w-16 h-16 bg-white/10 rounded-full -mr-8 -mt-8'></div>
            <CardHeader className='pb-3 relative'>
              <CardTitle className='text-sm font-medium flex items-center gap-2 text-amber-100'>
                <Clock className='w-4 h-4' />
                Chờ xử lý
              </CardTitle>
            </CardHeader>
            <CardContent className='relative'>
              <div className='text-4xl font-bold mb-2'>{stats.pending}</div>
              <div className='flex items-center gap-2'>
                <div className='w-2 h-2 bg-white rounded-full animate-pulse'></div>
                <p className='text-amber-100 text-sm'>Cần xử lý ngay</p>
              </div>
            </CardContent>
          </Card>

          <Card className='relative overflow-hidden bg-gradient-to-br from-emerald-500 via-green-500 to-emerald-600 dark:from-emerald-600 dark:via-green-600 dark:to-emerald-700 text-white border-0 shadow-xl'>
            <div className='absolute -bottom-4 -right-4 w-24 h-24 bg-white/10 rounded-full'></div>
            <CardHeader className='pb-3 relative'>
              <CardTitle className='text-sm font-medium flex items-center gap-2 text-emerald-100'>
                <TrendingUp className='w-4 h-4' />
                Đã duyệt
              </CardTitle>
            </CardHeader>
            <CardContent className='relative'>
              <div className='text-4xl font-bold mb-2'>{stats.approved}</div>
              <p className='text-emerald-100 text-sm'>Đã chấp nhận xử lý</p>
            </CardContent>
          </Card>

          <Card className='relative overflow-hidden bg-gradient-to-br from-blue-500 via-indigo-500 to-blue-600 dark:from-blue-600 dark:via-indigo-600 dark:to-blue-700 text-white border-0 shadow-xl'>
            <div className='absolute top-0 right-0 w-20 h-20 bg-gradient-to-br from-white/20 to-transparent rounded-bl-full'></div>
            <CardHeader className='pb-3 relative'>
              <CardTitle className='text-sm font-medium flex items-center gap-2 text-blue-100'>
                <TrendingUp className='w-4 h-4' />
                Hoàn thành
              </CardTitle>
            </CardHeader>
            <CardContent className='relative'>
              <div className='text-4xl font-bold mb-2'>{stats.completed}</div>
              <p className='text-blue-100 text-sm'>Đã hoàn tất xử lý</p>
            </CardContent>
          </Card>
        </div>

        {/* Modern Filters Section */}
        <Card className='border-0 shadow-lg bg-white/70 dark:bg-gray-900/70 backdrop-blur-sm'>
          <CardContent className='p-6'>
            <WarrantyFilters
              searchQuery={searchQuery}
              onSearchChange={handleSearchChange}
              statusFilter={statusFilter}
              onStatusFilterChange={handleStatusFilterChange}
            />
          </CardContent>
        </Card>

        {/* Enhanced Tab Navigation */}
        <div className='bg-white dark:bg-gray-900 rounded-2xl shadow-lg border border-gray-100 dark:border-gray-800 p-6'>
          <Tabs value={selectedTab} onValueChange={handleTabChange} className='space-y-6'>
            <div className='flex flex-col lg:flex-row lg:items-center justify-between gap-4'>
              <TabsList className='grid grid-cols-7 bg-gray-100 dark:bg-gray-800 p-1 rounded-xl h-auto'>
                <TabsTrigger
                  value='all'
                  className='data-[state=active]:bg-white dark:data-[state=active]:bg-gray-700 data-[state=active]:shadow-sm rounded-lg py-3 px-4 text-sm font-medium'
                >
                  Tất cả
                </TabsTrigger>
                <TabsTrigger
                  value='pending'
                  className='data-[state=active]:bg-white dark:data-[state=active]:bg-gray-700 data-[state=active]:shadow-sm rounded-lg py-3 px-4 text-sm font-medium'
                >
                  Chờ xử lý
                </TabsTrigger>
                <TabsTrigger
                  value='approved'
                  className='data-[state=active]:bg-white dark:data-[state=active]:bg-gray-700 data-[state=active]:shadow-sm rounded-lg py-3 px-4 text-sm font-medium'
                >
                  Đã duyệt
                </TabsTrigger>
                <TabsTrigger
                  value='repairing'
                  className='data-[state=active]:bg-white dark:data-[state=active]:bg-gray-700 data-[state=active]:shadow-sm rounded-lg py-3 px-4 text-sm font-medium'
                >
                  Sửa chữa
                </TabsTrigger>
                <TabsTrigger
                  value='awaiting_payment'
                  className='data-[state=active]:bg-white dark:data-[state=active]:bg-gray-700 data-[state=active]:shadow-sm rounded-lg py-3 px-4 text-sm font-medium'
                >
                  Chờ TT
                </TabsTrigger>
                <TabsTrigger
                  value='completed'
                  className='data-[state=active]:bg-white dark:data-[state=active]:bg-gray-700 data-[state=active]:shadow-sm rounded-lg py-3 px-4 text-sm font-medium'
                >
                  Hoàn thành
                </TabsTrigger>
                <TabsTrigger
                  value='rejected'
                  className='data-[state=active]:bg-white dark:data-[state=active]:bg-gray-700 data-[state=active]:shadow-sm rounded-lg py-3 px-4 text-sm font-medium'
                >
                  Từ chối
                </TabsTrigger>
              </TabsList>

              {/* Results Summary with modern styling */}
              <div className='flex items-center gap-4'>
                <div className='bg-gray-50 dark:bg-gray-800 px-4 py-2 rounded-lg border border-gray-200 dark:border-gray-700'>
                  <span className='text-sm text-gray-600 dark:text-gray-300'>
                    <span className='font-semibold text-violet-600 dark:text-violet-400'>{displayRequests.length}</span>{' '}
                    / {stats.total} yêu cầu
                  </span>
                </div>
                {(searchQuery || statusFilter !== 'all') && (
                  <Button
                    variant='ghost'
                    size='sm'
                    onClick={handleClearFilters}
                    className='text-gray-500 dark:text-gray-400 hover:text-gray-700 dark:hover:text-gray-200 hover:bg-gray-100 dark:hover:bg-gray-800'
                  >
                    Xóa bộ lọc
                  </Button>
                )}
              </div>
            </div>

            {/* Loading State với modern design */}
            {isLoading && (
              <div className='grid grid-cols-1 lg:grid-cols-2 xl:grid-cols-3 gap-6'>
                {[...Array(6)].map((_, i) => (
                  <Card key={i} className='animate-pulse border-0 shadow-lg bg-white dark:bg-gray-800'>
                    <CardHeader className='space-y-3'>
                      <div className='flex items-center gap-3'>
                        <div className='w-10 h-10 bg-violet-100 dark:bg-violet-900/30 rounded-lg'></div>
                        <div className='space-y-2 flex-1'>
                          <div className='h-4 bg-violet-100 dark:bg-violet-900/30 rounded w-3/4'></div>
                          <div className='h-3 bg-violet-50 dark:bg-violet-900/20 rounded w-1/2'></div>
                        </div>
                      </div>
                    </CardHeader>
                    <CardContent className='space-y-4'>
                      <div className='grid grid-cols-2 gap-3'>
                        <div className='h-16 bg-violet-50 dark:bg-violet-900/20 rounded-lg'></div>
                        <div className='h-16 bg-violet-50 dark:bg-violet-900/20 rounded-lg'></div>
                      </div>
                      <div className='h-10 bg-violet-100 dark:bg-violet-900/30 rounded-lg'></div>
                    </CardContent>
                  </Card>
                ))}
              </div>
            )}

            {/* Warranty Requests Grid với modern layout */}
            {!isLoading && displayRequests.length > 0 && (
              <div className='grid grid-cols-1 lg:grid-cols-2 xl:grid-cols-3 gap-6'>
                {displayRequests.map((request) => (
                  <WarrantyRequestCard key={request.id} request={request} onViewDetail={handleViewDetail} />
                ))}
              </div>
            )}

            {/* Enhanced Empty State */}
            {!isLoading && displayRequests.length === 0 && (
              <div className='text-center py-20'>
                <div className='mx-auto w-32 h-32 bg-gradient-to-br from-violet-100 to-purple-100 dark:from-violet-900/30 dark:to-purple-900/30 rounded-full flex items-center justify-center mb-8'>
                  <Shield className='w-16 h-16 text-violet-400 dark:text-violet-500' />
                </div>
                <h3 className='text-2xl font-bold text-gray-900 dark:text-gray-100 mb-4'>
                  {stats.total === 0 ? 'Chưa có yêu cầu bảo hành nào' : 'Không tìm thấy yêu cầu nào'}
                </h3>
                <p className='text-gray-600 dark:text-gray-300 max-w-md mx-auto mb-8 text-lg'>
                  {stats.total === 0
                    ? 'Chưa có yêu cầu bảo hành nào được tạo. Các yêu cầu mới sẽ xuất hiện ở đây.'
                    : 'Thử thay đổi bộ lọc hoặc từ khóa tìm kiếm để xem thêm yêu cầu.'}
                </p>
                {(searchQuery || statusFilter !== 'all' || selectedTab !== 'all') && (
                  <Button
                    onClick={handleClearFilters}
                    className='gap-2 bg-gradient-to-r from-violet-600 to-purple-600 hover:from-violet-700 hover:to-purple-700 dark:from-violet-700 dark:to-purple-700 dark:hover:from-violet-800 dark:hover:to-purple-800 text-white shadow-lg'
                  >
                    <RefreshCw className='w-4 h-4' />
                    Xóa tất cả bộ lọc
                  </Button>
                )}
              </div>
            )}

            {/* Pagination Component - Always show when we have data */}
            {!isLoading && (
              <div className='mt-8 flex flex-col items-center space-y-4'>
                <Pagination>
                  <PaginationContent>
                    {/* Previous Button */}
                    <PaginationItem>
                      <PaginationPrevious
                        onClick={() => currentPage > 1 && handlePageChange(currentPage - 1)}
                        className={cn(
                          'cursor-pointer select-none',
                          currentPage <= 1 && 'opacity-50 cursor-not-allowed pointer-events-none'
                        )}
                      />
                    </PaginationItem>

                    {/* Current page number (simple version) */}
                    <PaginationItem>
                      <PaginationLink isActive className='cursor-default'>
                        {currentPage}
                      </PaginationLink>
                    </PaginationItem>

                    {/* Next Button */}
                    <PaginationItem>
                      <PaginationNext
                        onClick={() => handlePageChange(currentPage + 1)}
                        className='cursor-pointer select-none'
                      />
                    </PaginationItem>
                  </PaginationContent>
                </Pagination>

                {/* Pagination Info */}
                <div className='text-center'>
                  <span className='text-sm text-gray-600 dark:text-gray-300'>
                    Trang {currentPage} • Hiển thị {displayRequests.length} yêu cầu • Tổng: {stats.total} yêu cầu
                  </span>
                </div>
              </div>
            )}
          </Tabs>
        </div>
      </div>

      {/* Modern Warranty Request Detail Dialog */}
      <Dialog open={!!selectedRequestId} onOpenChange={() => setSelectedRequestId(null)}>
        <DialogContent className='sm:max-w-6xl max-h-[95vh] overflow-hidden flex flex-col bg-white dark:bg-gray-900 border-0 shadow-2xl'>
          <div className='flex-shrink-0 p-6 border-b border-violet-100 dark:border-violet-800/50 bg-gradient-to-r from-violet-50 to-purple-50 dark:from-violet-900/20 dark:to-purple-900/20'>
            <div className='flex items-center gap-4'>
              <div className='p-3 bg-gradient-to-r from-violet-500 to-purple-600 dark:from-violet-600 dark:to-purple-700 rounded-xl shadow-lg'>
                <Shield className='w-6 h-6 text-white' />
              </div>
              <div>
                <h2 className='text-2xl font-bold bg-gradient-to-r from-gray-900 to-violet-700 dark:from-gray-100 dark:to-violet-300 bg-clip-text text-transparent'>
                  Chi tiết yêu cầu bảo hành
                </h2>
                <p className='text-gray-600 dark:text-gray-300'>Đánh giá và xử lý yêu cầu bảo hành từ khách hàng</p>
              </div>
            </div>
          </div>
          <div className='flex-1 overflow-hidden p-6'>
            {selectedWarrantyRequest && !isLoadingDetail && (
              <WarrantyDecisionForm warrantyRequest={selectedWarrantyRequest} onClose={handleCloseDetail} />
            )}
            {isLoadingDetail && (
              <div className='flex flex-col items-center justify-center p-12'>
                <div className='relative'>
                  <div className='w-16 h-16 border-4 border-violet-200 dark:border-violet-800 border-t-violet-600 dark:border-t-violet-400 rounded-full animate-spin'></div>
                  <div className='absolute inset-0 w-16 h-16 border-4 border-transparent border-t-purple-600 dark:border-t-purple-400 rounded-full animate-spin-slow'></div>
                </div>
                <span className='mt-4 text-gray-600 dark:text-gray-300 font-medium'>Đang tải chi tiết...</span>
              </div>
            )}
          </div>
        </DialogContent>
      </Dialog>

      {/* Enhanced Reject Item Dialog */}
      <Dialog open={!!selectedItemForEdit} onOpenChange={() => setSelectedItemForEdit(null)}>
        <DialogContent className='max-w-3xl bg-white dark:bg-gray-900 border-0 shadow-2xl'>
          <div className='p-6 border-b border-violet-100 dark:border-violet-800/50 bg-gradient-to-r from-violet-50 to-purple-50 dark:from-violet-900/20 dark:to-purple-900/20'>
            <h3 className='text-xl font-bold text-gray-900 dark:text-gray-100 mb-2'>Từ chối sản phẩm</h3>
            <p className='text-gray-600 dark:text-gray-300 mb-6'>Vui lòng cung cấp lý do từ chối sản phẩm này</p>
            {/* Dialog content will be implemented in RejectItemDialog component */}
          </div>
        </DialogContent>
      </Dialog>
    </Main>
  )
}

export default WarrantyManagementSystem
