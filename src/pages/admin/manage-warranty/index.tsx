import { useState, useEffect, useMemo } from 'react'
import { Shield, RefreshCw, TrendingUp, Clock, Sparkles, Search, X } from 'lucide-react'
import { Tabs, TabsList, TabsTrigger } from '@/components/ui/tabs'
import { Dialog, DialogContent } from '@/components/ui/dialog'
import { Button } from '@/components/ui/button'
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card'
import { Input } from '@/components/ui/input'
import { Badge } from '@/components/ui/badge'
import {
  Pagination,
  PaginationContent,
  PaginationItem,
  PaginationLink,
  PaginationNext,
  PaginationPrevious
} from '@/components/ui/pagination'
import { Main } from '@/components/layout/main'
import { WarrantyRequestCard, WarrantyDecisionForm } from './components'
import { useWarrantyRequestList, useWarrantyRequestById } from '@/services/global/warranty.service'
import { WarrantyRequestList, StatusWarrantyRequest } from '@/@types/warranty-request.types'
import { cn } from '@/lib/utils/utils'
import { tabStatusMapping } from './constants'

function WarrantyManagementSystem() {
  const [selectedTab, setSelectedTab] = useState('all')
  const [searchQuery, setSearchQuery] = useState('')
  const [debouncedSearchQuery, setDebouncedSearchQuery] = useState('')
  const [selectedRequestId, setSelectedRequestId] = useState<string | null>(null)
  const [selectedItemForEdit, setSelectedItemForEdit] = useState<WarrantyRequestList | null>(null)

  // Pagination states
  const [currentPage, setCurrentPage] = useState(1)
  const [pageSize] = useState(12) // 12 items per page for better grid layout

  // Debounce search query
  useEffect(() => {
    const timer = setTimeout(() => {
      setDebouncedSearchQuery(searchQuery)
    }, 500)

    return () => clearTimeout(timer)
  }, [searchQuery])

  const { data: warrantyRequestsResponse, isLoading } = useWarrantyRequestList({
    index: currentPage,
    pageSize: pageSize,
    search: debouncedSearchQuery,
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

  // Apply local filtering based on selected tab
  const filteredRequests = useMemo(() => {
    if (selectedTab === 'all') return warrantyRequests

    const allowedStatuses = tabStatusMapping[selectedTab] || []
    return warrantyRequests.filter((request) => allowedStatuses.includes(request.status))
  }, [warrantyRequests, selectedTab])

  // Calculate stats from filtered data
  const stats = {
    total: warrantyRequestsResponse?.totalCount ?? 0,
    pending: warrantyRequests.filter((r) => r.status === StatusWarrantyRequest.PENDING).length,
    approved: warrantyRequests.filter((r) => r.status === StatusWarrantyRequest.APPROVED).length,
    repairing: warrantyRequests.filter((r) => r.status === StatusWarrantyRequest.REPAIRING).length,
    completed: warrantyRequests.filter((r) => r.status === StatusWarrantyRequest.COMPLETED).length,
    rejected: warrantyRequests.filter(
      (r) => r.status === StatusWarrantyRequest.REJECTED || r.status === StatusWarrantyRequest.PARTIALLY_REJECTED
    ).length
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

  const handleTabChange = (tab: string) => {
    setSelectedTab(tab)
    setCurrentPage(1)
  }

  const handleClearFilters = () => {
    setSearchQuery('')
    setSelectedTab('all')
    setCurrentPage(1)
  }

  // Check if any filters are active
  const hasActiveFilters = searchQuery || selectedTab !== 'all'

  return (
    <Main className='min-h-screen'>
      {/* Modern Header */}
      <div className='sticky top-0 z-30 bg-white/80 dark:bg-gray-900/80 backdrop-blur-lg border-b border-gray-200/50 dark:border-gray-700/50 -mx-4 -mt-6 mb-8'>
        <div className='px-6 py-4'>
          <div className='flex flex-col lg:flex-row lg:items-center justify-between gap-4'>
            <div className='space-y-1'>
              <div className='flex items-center gap-2'>
                <div className='h-10 w-10 rounded-lg bg-gradient-to-br from-violet-500 to-violet-600 flex items-center justify-center shadow-lg'>
                  <Shield className='h-6 w-6 text-white' />
                </div>
                <div>
                  <h1 className='text-3xl font-bold tracking-tight bg-gradient-to-r from-violet-600 to-violet-500 bg-clip-text text-transparent'>
                    Yêu Cầu Bảo Hành
                  </h1>
                  <p className='text-sm text-muted-foreground flex items-center gap-1'>
                    Quản lý các yêu cầu bảo hành và tiến độ xử lý
                    <Sparkles className='h-3 w-3 text-violet-500' />
                  </p>
                </div>
              </div>
            </div>
          </div>
        </div>
      </div>

      <div className='space-y-8'>
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
              <div className='text-3xl font-bold mb-2'>{stats.total}</div>
              <p className='text-violet-100 text-xs'>Tất cả yêu cầu bảo hành</p>
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
              <div className='text-3xl font-bold mb-2'>{stats.pending}</div>
              <div className='flex items-center gap-2'>
                <div className='w-2 h-2 bg-white rounded-full animate-pulse'></div>
                <p className='text-amber-100 text-xs'>Cần xử lý ngay</p>
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
              <div className='text-3xl font-bold mb-2'>{stats.approved}</div>
              <p className='text-emerald-100 text-xs'>Đã chấp nhận xử lý</p>
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
              <div className='text-3xl font-bold mb-2'>{stats.completed}</div>
              <p className='text-blue-100 text-xs'>Đã hoàn tất xử lý</p>
            </CardContent>
          </Card>
        </div>

        {/* Simple Search Bar */}
        <Card className='border-0 shadow-md bg-white dark:bg-gray-900'>
          <CardContent className='p-4'>
            <div className='w-full max-w-2xl mx-auto'>
              <div className='relative'>
                <div className='absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none'>
                  <Search className='h-5 w-5 text-gray-400' />
                </div>
                <Input
                  placeholder='Tìm kiếm theo mã SKU, tên khách hàng, số điện thoại...'
                  value={searchQuery}
                  onChange={(e) => handleSearchChange(e.target.value)}
                  className='h-11 text-sm border border-gray-200 dark:border-gray-700 bg-white dark:bg-gray-800 focus:ring-2 focus:ring-violet-500 focus:border-violet-500 rounded-lg'
                />
                {searchQuery && (
                  <Button
                    variant='ghost'
                    size='sm'
                    onClick={() => handleSearchChange('')}
                    className='absolute inset-y-0 right-0 px-3 h-full hover:bg-gray-100 dark:hover:bg-gray-700'
                  >
                    <X className='h-4 w-4 text-gray-400' />
                  </Button>
                )}
              </div>
            </div>
          </CardContent>
        </Card>

        {/* Enhanced Tab Navigation with inline search */}
        <div className='bg-gradient-to-br from-white via-violet-50/20 to-white dark:from-gray-900 dark:via-violet-950/20 dark:to-gray-900 rounded-3xl shadow-xl border border-violet-100/50 dark:border-violet-800/50 p-8'>
          <Tabs value={selectedTab} onValueChange={handleTabChange} className='space-y-8'>
            <div className='flex flex-col lg:flex-row lg:items-center justify-between gap-6'>
              <TabsList className='grid grid-cols-7 bg-gradient-to-r from-gray-100 via-violet-50 to-gray-100 dark:from-gray-800 dark:via-violet-950/30 dark:to-gray-800 p-2 rounded-2xl h-auto shadow-lg'>
                <TabsTrigger
                  value='all'
                  className='data-[state=active]:bg-white dark:data-[state=active]:bg-gray-700 data-[state=active]:shadow-lg data-[state=active]:scale-105 rounded-xl py-4 px-5 text-sm font-semibold transition-all duration-200'
                >
                  <div className='flex flex-col items-center gap-2'>
                    <span className='text-gray-900 dark:text-gray-100'>Tất cả</span>
                    <Badge
                      variant='secondary'
                      className='text-xs px-3 py-1 bg-gradient-to-r from-gray-500 to-gray-600 text-white border-0 shadow-md'
                    >
                      {stats.total}
                    </Badge>
                  </div>
                </TabsTrigger>
                <TabsTrigger
                  value='pending'
                  className='data-[state=active]:bg-white dark:data-[state=active]:bg-gray-700 data-[state=active]:shadow-lg data-[state=active]:scale-105 rounded-xl py-4 px-5 text-sm font-semibold transition-all duration-200'
                >
                  <div className='flex flex-col items-center gap-2'>
                    <span className='text-gray-900 dark:text-gray-100'>Chờ xử lý</span>
                    <Badge
                      variant='secondary'
                      className='text-xs px-3 py-1 bg-gradient-to-r from-amber-500 to-orange-500 text-white border-0 shadow-md'
                    >
                      {stats.pending}
                    </Badge>
                  </div>
                </TabsTrigger>
                <TabsTrigger
                  value='approved'
                  className='data-[state=active]:bg-white dark:data-[state=active]:bg-gray-700 data-[state=active]:shadow-lg data-[state=active]:scale-105 rounded-xl py-4 px-5 text-sm font-semibold transition-all duration-200'
                >
                  <div className='flex flex-col items-center gap-2'>
                    <span className='text-gray-900 dark:text-gray-100'>Đã duyệt</span>
                    <Badge
                      variant='secondary'
                      className='text-xs px-3 py-1 bg-gradient-to-r from-emerald-500 to-green-500 text-white border-0 shadow-md'
                    >
                      {stats.approved}
                    </Badge>
                  </div>
                </TabsTrigger>
                <TabsTrigger
                  value='repairing'
                  className='data-[state=active]:bg-white dark:data-[state=active]:bg-gray-700 data-[state=active]:shadow-lg data-[state=active]:scale-105 rounded-xl py-4 px-5 text-sm font-semibold transition-all duration-200'
                >
                  <div className='flex flex-col items-center gap-2'>
                    <span className='text-gray-900 dark:text-gray-100'>Sửa chữa</span>
                    <Badge
                      variant='secondary'
                      className='text-xs px-3 py-1 bg-gradient-to-r from-blue-500 to-indigo-500 text-white border-0 shadow-md'
                    >
                      {stats.repairing}
                    </Badge>
                  </div>
                </TabsTrigger>
                <TabsTrigger
                  value='awaiting_payment'
                  className='data-[state=active]:bg-white dark:data-[state=active]:bg-gray-700 data-[state=active]:shadow-lg data-[state=active]:scale-105 rounded-xl py-4 px-5 text-sm font-semibold transition-all duration-200'
                >
                  <div className='flex flex-col items-center gap-2'>
                    <span className='text-gray-900 dark:text-gray-100'>Chờ TT</span>
                    <Badge
                      variant='secondary'
                      className='text-xs px-3 py-1 bg-gradient-to-r from-violet-500 to-purple-500 text-white border-0 shadow-md'
                    >
                      {stats.approved}
                    </Badge>
                  </div>
                </TabsTrigger>
                <TabsTrigger
                  value='completed'
                  className='data-[state=active]:bg-white dark:data-[state=active]:bg-gray-700 data-[state=active]:shadow-lg data-[state=active]:scale-105 rounded-xl py-4 px-5 text-sm font-semibold transition-all duration-200'
                >
                  <div className='flex flex-col items-center gap-2'>
                    <span className='text-gray-900 dark:text-gray-100'>Hoàn thành</span>
                    <Badge
                      variant='secondary'
                      className='text-xs px-3 py-1 bg-gradient-to-r from-green-500 to-emerald-500 text-white border-0 shadow-md'
                    >
                      {stats.completed}
                    </Badge>
                  </div>
                </TabsTrigger>
                <TabsTrigger
                  value='rejected'
                  className='data-[state=active]:bg-white dark:data-[state=active]:bg-gray-700 data-[state=active]:shadow-lg data-[state=active]:scale-105 rounded-xl py-4 px-5 text-sm font-semibold transition-all duration-200'
                >
                  <div className='flex flex-col items-center gap-2'>
                    <span className='text-gray-900 dark:text-gray-100'>Từ chối</span>
                    <Badge
                      variant='secondary'
                      className='text-xs px-3 py-1 bg-gradient-to-r from-red-500 to-pink-500 text-white border-0 shadow-md'
                    >
                      {stats.rejected}
                    </Badge>
                  </div>
                </TabsTrigger>
              </TabsList>

              {/* Results Summary with modern styling */}
              <div className='flex items-center gap-4'>
                <div className='bg-gradient-to-r from-violet-500 to-purple-600 text-white px-6 py-3 rounded-2xl shadow-lg border-0'>
                  <span className='text-sm font-semibold'>
                    <span className='text-white font-bold text-lg'>{filteredRequests.length}</span> / {stats.total} yêu
                    cầu
                  </span>
                </div>
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
            {!isLoading && filteredRequests.length > 0 && (
              <div className='grid grid-cols-1 lg:grid-cols-2 xl:grid-cols-3 gap-6'>
                {filteredRequests.map((request) => (
                  <WarrantyRequestCard key={request.id} request={request} onViewDetail={handleViewDetail} />
                ))}
              </div>
            )}

            {/* Enhanced Empty State */}
            {!isLoading && filteredRequests.length === 0 && (
              <div className='text-center py-20'>
                <div className='mx-auto w-32 h-32 bg-gradient-to-br from-violet-100 to-purple-100 dark:from-violet-900/30 dark:to-purple-900/30 rounded-full flex items-center justify-center mb-8'>
                  <Shield className='w-16 h-16 text-violet-400 dark:text-violet-500' />
                </div>
                <h3 className='text-xl font-bold text-gray-900 dark:text-gray-100 mb-4'>
                  {stats.total === 0 ? 'Chưa có yêu cầu bảo hành nào' : 'Không tìm thấy yêu cầu nào'}
                </h3>
                <p className='text-gray-600 dark:text-gray-300 max-w-md mx-auto mb-8 text-sm'>
                  {stats.total === 0
                    ? 'Chưa có yêu cầu bảo hành nào được tạo. Các yêu cầu mới sẽ xuất hiện ở đây.'
                    : 'Thử thay đổi bộ lọc hoặc từ khóa tìm kiếm để xem thêm yêu cầu.'}
                </p>
                {hasActiveFilters && (
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
            {!isLoading && filteredRequests.length > 0 && (
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
                    Trang {currentPage} • Hiển thị {filteredRequests.length} yêu cầu • Tổng: {stats.total} yêu cầu
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
                <h2 className='text-xl font-bold bg-gradient-to-r from-gray-900 to-violet-700 dark:from-gray-100 dark:to-violet-300 bg-clip-text text-transparent'>
                  Chi tiết yêu cầu bảo hành
                </h2>
                <p className='text-sm text-gray-600 dark:text-gray-300'>
                  Đánh giá và xử lý yêu cầu bảo hành từ khách hàng
                </p>
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
