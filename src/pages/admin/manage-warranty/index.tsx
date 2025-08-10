import { useState } from 'react'
import { Shield, RefreshCw, Plus, TrendingUp } from 'lucide-react'
import { Tabs, TabsList, TabsTrigger } from '@/components/ui/tabs'
import { Dialog, DialogContent } from '@/components/ui/dialog'
import { Button } from '@/components/ui/button'
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card'
import { WarrantyFilters, WarrantyRequestCard, WarrantyRequestDetail, RejectItemDialog } from './components'
import { WarrantyItem } from './types'
import { useWarrantyFilters } from './hooks/useWarrantyFilters'
import { useWarrantyRequestList } from '@/services/global/warranty.service'
import { WarrantyRequestList, StatusWarrantyRequest } from '@/@types/warranty-request.types'

function WarrantyManagementSystem() {
  const [selectedTab, setSelectedTab] = useState('all')
  const [searchQuery, setSearchQuery] = useState('')
  const [statusFilter, setStatusFilter] = useState('all')
  const [selectedRequest, setSelectedRequest] = useState<WarrantyRequestList | null>(null)
  const [selectedItemForEdit, setSelectedItemForEdit] = useState<WarrantyItem | null>(null)

  const {
    data: warrantyRequests,
    isLoading,
    refetch
  } = useWarrantyRequestList({
    page: 1,
    limit: 100,
    search: searchQuery,
    sortBy: 'CREATED_AT_DESC'
  })

  // Filter requests based on tab, search and status
  const { filteredRequests } = useWarrantyFilters({
    requests: warrantyRequests?.items ?? [],
    selectedTab,
    searchQuery,
    statusFilter
  })

  // Calculate stats
  const stats = {
    total: warrantyRequests?.items.length ?? 0,
    pending: warrantyRequests?.items.filter((r) => r.status === StatusWarrantyRequest.PENDING).length ?? 0,
    inTransit: warrantyRequests?.items.filter((r) => r.status === StatusWarrantyRequest.REPAIRING).length ?? 0,
    completed: warrantyRequests?.items.filter((r) => r.status === StatusWarrantyRequest.COMPLETED).length ?? 0
  }

  const handleRejectItem = (itemId: string, reason: string) => {
    console.log('Rejecting item:', itemId, 'Reason:', reason)
    // API call to update item status with rejection reason
  }

  return (
    <div className='min-h-screen bg-gradient-to-br from-gray-50 via-white to-gray-100 p-6'>
      <div className='max-w-7xl mx-auto'>
        {/* Header */}
        <div className='mb-8'>
          <div className='flex flex-col lg:flex-row lg:items-center justify-between gap-4'>
            <div>
              <h1 className='text-4xl font-bold text-gray-900 mb-2'>🛡️ Quản lý bảo hành</h1>
              <p className='text-lg text-gray-600'>Xử lý và theo dõi các yêu cầu bảo hành từ khách hàng</p>
            </div>
            <div className='flex items-center gap-3'>
              <Button variant='outline' onClick={() => refetch()} disabled={isLoading} className='gap-2'>
                <RefreshCw className={`w-4 h-4 ${isLoading ? 'animate-spin' : ''}`} />
                Làm mới
              </Button>
              <Button className='gap-2 bg-violet-600 hover:bg-violet-700'>
                <Plus className='w-4 h-4' />
                Tạo mới
              </Button>
            </div>
          </div>
        </div>

        {/* Stats Cards */}
        <div className='grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6 mb-8'>
          <Card className='border-l-4 border-l-blue-400 bg-gradient-to-br from-blue-50 to-white'>
            <CardHeader className='pb-3'>
              <CardTitle className='text-sm font-medium text-blue-700 flex items-center gap-2'>
                <Shield className='w-4 h-4' />
                Tổng yêu cầu
              </CardTitle>
            </CardHeader>
            <CardContent>
              <div className='text-3xl font-bold text-blue-900'>{stats.total}</div>
              <p className='text-blue-600 text-sm'>Tất cả yêu cầu</p>
            </CardContent>
          </Card>

          <Card className='border-l-4 border-l-amber-400 bg-gradient-to-br from-amber-50 to-white'>
            <CardHeader className='pb-3'>
              <CardTitle className='text-sm font-medium text-amber-700 flex items-center gap-2'>
                <TrendingUp className='w-4 h-4' />
                Chờ xử lý
              </CardTitle>
            </CardHeader>
            <CardContent>
              <div className='text-3xl font-bold text-amber-900'>{stats.pending}</div>
              <p className='text-amber-600 text-sm'>Cần xử lý ngay</p>
            </CardContent>
          </Card>

          <Card className='border-l-4 border-l-orange-400 bg-gradient-to-br from-orange-50 to-white'>
            <CardHeader className='pb-3'>
              <CardTitle className='text-sm font-medium text-orange-700 flex items-center gap-2'>
                <RefreshCw className='w-4 h-4' />
                Đang xử lý
              </CardTitle>
            </CardHeader>
            <CardContent>
              <div className='text-3xl font-bold text-orange-900'>{stats.inTransit}</div>
              <p className='text-orange-600 text-sm'>Đang sửa chữa</p>
            </CardContent>
          </Card>

          <Card className='border-l-4 border-l-green-400 bg-gradient-to-br from-green-50 to-white'>
            <CardHeader className='pb-3'>
              <CardTitle className='text-sm font-medium text-green-700 flex items-center gap-2'>
                <Shield className='w-4 h-4' />
                Hoàn thành
              </CardTitle>
            </CardHeader>
            <CardContent>
              <div className='text-3xl font-bold text-green-900'>{stats.completed}</div>
              <p className='text-green-600 text-sm'>Đã xử lý xong</p>
            </CardContent>
          </Card>
        </div>

        {/* Filters */}
        <WarrantyFilters
          searchQuery={searchQuery}
          onSearchChange={setSearchQuery}
          statusFilter={statusFilter}
          onStatusFilterChange={setStatusFilter}
        />

        {/* Tabs */}
        <Tabs value={selectedTab} onValueChange={setSelectedTab} className='mb-6'>
          <TabsList className='grid w-full grid-cols-6'>
            <TabsTrigger value='all'>Tất cả</TabsTrigger>
            <TabsTrigger value='pending'>Chờ xử lý</TabsTrigger>
            <TabsTrigger value='in_transit'>Vận chuyển</TabsTrigger>
            <TabsTrigger value='repairing'>Sửa chữa</TabsTrigger>
            <TabsTrigger value='completed'>Hoàn thành</TabsTrigger>
            <TabsTrigger value='rejected'>Từ chối</TabsTrigger>
          </TabsList>
        </Tabs>

        {/* Results Summary */}
        <div className='mb-6 flex items-center justify-between'>
          <div className='text-sm text-gray-600'>
            Hiển thị <span className='font-semibold'>{filteredRequests.length}</span> trong tổng số{' '}
            <span className='font-semibold'>{stats.total}</span> yêu cầu
          </div>
          {(searchQuery || statusFilter !== 'all') && (
            <Button
              variant='ghost'
              size='sm'
              onClick={() => {
                setSearchQuery('')
                setStatusFilter('all')
                setSelectedTab('all')
              }}
              className='text-gray-500 hover:text-gray-700'
            >
              Xóa bộ lọc
            </Button>
          )}
        </div>

        {/* Loading State */}
        {isLoading && (
          <div className='grid grid-cols-1 lg:grid-cols-2 xl:grid-cols-3 gap-6'>
            {[...Array(6)].map((_, i) => (
              <Card key={i} className='animate-pulse'>
                <CardHeader>
                  <div className='h-4 bg-gray-200 rounded w-3/4'></div>
                  <div className='h-3 bg-gray-200 rounded w-1/2'></div>
                </CardHeader>
                <CardContent>
                  <div className='space-y-3'>
                    <div className='h-3 bg-gray-200 rounded'></div>
                    <div className='h-3 bg-gray-200 rounded w-5/6'></div>
                    <div className='h-8 bg-gray-200 rounded'></div>
                  </div>
                </CardContent>
              </Card>
            ))}
          </div>
        )}

        {/* Warranty Requests Grid */}
        {!isLoading && filteredRequests.length > 0 && (
          <div className='grid grid-cols-1 lg:grid-cols-2 xl:grid-cols-3 gap-6'>
            {filteredRequests.map((request) => (
              <WarrantyRequestCard key={request.id} request={request} onViewDetail={setSelectedRequest} />
            ))}
          </div>
        )}

        {/* Empty State */}
        {!isLoading && filteredRequests.length === 0 && (
          <div className='text-center py-16'>
            <div className='mx-auto w-24 h-24 bg-gray-100 rounded-full flex items-center justify-center mb-6'>
              <Shield className='w-12 h-12 text-gray-400' />
            </div>
            <h3 className='text-xl font-semibold text-gray-900 mb-3'>
              {stats.total === 0 ? 'Chưa có yêu cầu bảo hành nào' : 'Không tìm thấy yêu cầu nào'}
            </h3>
            <p className='text-gray-600 max-w-md mx-auto mb-6'>
              {stats.total === 0
                ? 'Chưa có yêu cầu bảo hành nào được tạo. Các yêu cầu mới sẽ xuất hiện ở đây.'
                : 'Thử thay đổi bộ lọc hoặc từ khóa tìm kiếm để xem thêm yêu cầu.'}
            </p>
            {(searchQuery || statusFilter !== 'all' || selectedTab !== 'all') && (
              <Button
                variant='outline'
                onClick={() => {
                  setSearchQuery('')
                  setStatusFilter('all')
                  setSelectedTab('all')
                }}
                className='gap-2'
              >
                <RefreshCw className='w-4 h-4' />
                Xóa tất cả bộ lọc
              </Button>
            )}
          </div>
        )}
      </div>

      {/* Warranty Request Detail Dialog */}
      <Dialog open={!!selectedRequest} onOpenChange={() => setSelectedRequest(null)}>
        <DialogContent className='sm:max-w-4xl max-h-[90vh] overflow-hidden'>
          {selectedRequest && (
            <WarrantyRequestDetail request={selectedRequest} onClose={() => setSelectedRequest(null)} />
          )}
        </DialogContent>
      </Dialog>

      {/* Reject Item Dialog */}
      <Dialog open={!!selectedItemForEdit} onOpenChange={() => setSelectedItemForEdit(null)}>
        <DialogContent className='max-w-2xl'>
          {selectedItemForEdit && (
            <RejectItemDialog
              item={selectedItemForEdit}
              onClose={() => setSelectedItemForEdit(null)}
              onReject={handleRejectItem}
            />
          )}
        </DialogContent>
      </Dialog>
    </div>
  )
}

export default WarrantyManagementSystem
