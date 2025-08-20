import { Search, Filter, SlidersHorizontal } from 'lucide-react'
import { Input } from '@/components/ui/input'
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select'
import { Badge } from '@/components/ui/badge'
import { WarrantyFiltersProps } from '../types'

export const WarrantyFilters = ({
  searchQuery,
  onSearchChange,
  statusFilter,
  onStatusFilterChange
}: WarrantyFiltersProps) => {
  const getStatusBadge = (status: string) => {
    const statusConfig = {
      pending: {
        color:
          'bg-amber-50 text-amber-700 border-amber-200 dark:bg-amber-950/20 dark:text-amber-400 dark:border-amber-800',
        label: 'Chờ xử lý',
        count: '12'
      },
      in_transit: {
        color: 'bg-blue-50 text-blue-700 border-blue-200 dark:bg-blue-950/20 dark:text-blue-400 dark:border-blue-800',
        label: 'Đang vận chuyển',
        count: '5'
      },
      repairing: {
        color:
          'bg-violet-50 text-violet-700 border-violet-200 dark:bg-violet-950/20 dark:text-violet-400 dark:border-violet-800',
        label: 'Đang sửa chữa',
        count: '8'
      },
      completed: {
        color:
          'bg-emerald-50 text-emerald-700 border-emerald-200 dark:bg-emerald-950/20 dark:text-emerald-400 dark:border-emerald-800',
        label: 'Hoàn thành',
        count: '23'
      },
      partially_rejected: {
        color:
          'bg-orange-50 text-orange-700 border-orange-200 dark:bg-orange-950/20 dark:text-orange-400 dark:border-orange-800',
        label: 'Từ chối một phần',
        count: '3'
      },
      fully_rejected: {
        color: 'bg-red-50 text-red-700 border-red-200 dark:bg-red-950/20 dark:text-red-400 dark:border-red-800',
        label: 'Từ chối hoàn toàn',
        count: '2'
      }
    }
    return (
      statusConfig[status as keyof typeof statusConfig] || {
        color: 'bg-gray-50 text-gray-700 border-gray-200 dark:bg-gray-950/20 dark:text-gray-400 dark:border-gray-800',
        label: 'Tất cả',
        count: '53'
      }
    )
  }

  return (
    <div className='space-y-6'>
      {/* Main Search Bar */}
      <div className='relative group'>
        <div className='absolute inset-0 bg-gradient-to-r from-violet-400/20 to-purple-400/20 dark:from-violet-600/30 dark:to-purple-600/30 rounded-2xl blur opacity-20 group-hover:opacity-30 transition-opacity'></div>
        <div className='relative bg-white dark:bg-gray-900 rounded-2xl border border-gray-200 dark:border-gray-700 shadow-lg p-6'>
          <div className='flex flex-col lg:flex-row gap-6 items-start lg:items-center'>
            <div className='flex-1 relative'>
              <div className='absolute inset-y-0 left-0 pl-4 flex items-center pointer-events-none'>
                <Search className='h-5 w-5 text-violet-400 dark:text-violet-500' />
              </div>
              <Input
                placeholder='Tìm kiếm theo mã SKU, tên khách hàng, số điện thoại...'
                value={searchQuery}
                onChange={(e) => onSearchChange(e.target.value)}
                className='pl-12 h-14 text-base border-0 bg-gray-50 dark:bg-gray-800 focus:bg-white dark:focus:bg-gray-700 focus:ring-2 focus:ring-violet-400 dark:focus:ring-violet-500 focus:border-transparent rounded-xl shadow-sm transition-all'
              />
            </div>

            <div className='flex flex-col sm:flex-row gap-4 items-start sm:items-center'>
              <div className='flex items-center gap-2'>
                <SlidersHorizontal className='w-5 h-5 text-gray-400 dark:text-gray-500' />
                <span className='text-sm font-medium text-gray-600 dark:text-gray-300'>Lọc theo:</span>
              </div>

              <Select value={statusFilter} onValueChange={onStatusFilterChange}>
                <SelectTrigger className='w-full sm:w-64 h-12 border border-gray-200 dark:border-gray-700 focus:border-violet-400 dark:focus:border-violet-500 focus:ring-2 focus:ring-violet-400 dark:focus:ring-violet-500 bg-white dark:bg-gray-800 shadow-sm rounded-xl'>
                  <div className='flex items-center gap-3'>
                    <Filter className='w-4 h-4 text-violet-600 dark:text-violet-400' />
                    <SelectValue placeholder='Chọn trạng thái' />
                  </div>
                </SelectTrigger>
                <SelectContent className='min-w-80 bg-white dark:bg-gray-900 border border-gray-200 dark:border-gray-700 shadow-xl rounded-xl'>
                  <SelectItem value='all' className='py-4 px-4 hover:bg-gray-50 dark:hover:bg-gray-800 cursor-pointer'>
                    <div className='flex items-center justify-between w-full'>
                      <div className='flex items-center gap-3'>
                        <div className='w-3 h-3 rounded-full bg-gray-400 dark:bg-gray-500'></div>
                        <span className='font-medium'>Tất cả trạng thái</span>
                      </div>
                      <Badge className={getStatusBadge('all').color + ' ml-2'}>{getStatusBadge('all').count}</Badge>
                    </div>
                  </SelectItem>

                  <SelectItem
                    value='pending'
                    className='py-4 px-4 hover:bg-amber-50 dark:hover:bg-amber-950/10 cursor-pointer'
                  >
                    <div className='flex items-center justify-between w-full'>
                      <div className='flex items-center gap-3'>
                        <div className='w-3 h-3 rounded-full bg-amber-400 dark:bg-amber-500'></div>
                        <span className='font-medium'>Chờ xử lý</span>
                      </div>
                      <Badge className={getStatusBadge('pending').color + ' ml-2'}>
                        {getStatusBadge('pending').count}
                      </Badge>
                    </div>
                  </SelectItem>

                  <SelectItem
                    value='in_transit'
                    className='py-4 px-4 hover:bg-blue-50 dark:hover:bg-blue-950/10 cursor-pointer'
                  >
                    <div className='flex items-center justify-between w-full'>
                      <div className='flex items-center gap-3'>
                        <div className='w-3 h-3 rounded-full bg-blue-400 dark:bg-blue-500'></div>
                        <span className='font-medium'>Đang vận chuyển</span>
                      </div>
                      <Badge className={getStatusBadge('in_transit').color + ' ml-2'}>
                        {getStatusBadge('in_transit').count}
                      </Badge>
                    </div>
                  </SelectItem>

                  <SelectItem
                    value='repairing'
                    className='py-4 px-4 hover:bg-violet-50 dark:hover:bg-violet-950/10 cursor-pointer'
                  >
                    <div className='flex items-center justify-between w-full'>
                      <div className='flex items-center gap-3'>
                        <div className='w-3 h-3 rounded-full bg-violet-400 dark:bg-violet-500'></div>
                        <span className='font-medium'>Đang sửa chữa</span>
                      </div>
                      <Badge className={getStatusBadge('repairing').color + ' ml-2'}>
                        {getStatusBadge('repairing').count}
                      </Badge>
                    </div>
                  </SelectItem>

                  <SelectItem
                    value='completed'
                    className='py-4 px-4 hover:bg-emerald-50 dark:hover:bg-emerald-950/10 cursor-pointer'
                  >
                    <div className='flex items-center justify-between w-full'>
                      <div className='flex items-center gap-3'>
                        <div className='w-3 h-3 rounded-full bg-emerald-400 dark:bg-emerald-500'></div>
                        <span className='font-medium'>Hoàn thành</span>
                      </div>
                      <Badge className={getStatusBadge('completed').color + ' ml-2'}>
                        {getStatusBadge('completed').count}
                      </Badge>
                    </div>
                  </SelectItem>

                  <SelectItem
                    value='partially_rejected'
                    className='py-4 px-4 hover:bg-orange-50 dark:hover:bg-orange-950/10 cursor-pointer'
                  >
                    <div className='flex items-center justify-between w-full'>
                      <div className='flex items-center gap-3'>
                        <div className='w-3 h-3 rounded-full bg-orange-600 dark:bg-orange-500'></div>
                        <span className='font-medium'>Từ chối một phần</span>
                      </div>
                      <Badge className={getStatusBadge('partially_rejected').color + ' ml-2'}>
                        {getStatusBadge('partially_rejected').count}
                      </Badge>
                    </div>
                  </SelectItem>

                  <SelectItem
                    value='fully_rejected'
                    className='py-4 px-4 hover:bg-red-50 dark:hover:bg-red-950/10 cursor-pointer'
                  >
                    <div className='flex items-center justify-between w-full'>
                      <div className='flex items-center gap-3'>
                        <div className='w-3 h-3 rounded-full bg-red-400 dark:bg-red-500'></div>
                        <span className='font-medium'>Từ chối hoàn toàn</span>
                      </div>
                      <Badge className={getStatusBadge('fully_rejected').color + ' ml-2'}>
                        {getStatusBadge('fully_rejected').count}
                      </Badge>
                    </div>
                  </SelectItem>
                </SelectContent>
              </Select>
            </div>
          </div>
        </div>
      </div>

      {/* Quick Filter Tags (Optional) */}
      {(searchQuery || statusFilter !== 'all') && (
        <div className='flex flex-wrap gap-2 items-center'>
          <span className='text-sm font-medium text-gray-600 dark:text-gray-300'>Bộ lọc hiện tại:</span>
          {searchQuery && (
            <Badge
              variant='secondary'
              className='bg-violet-50 text-violet-700 border border-violet-200 dark:bg-violet-950/20 dark:text-violet-400 dark:border-violet-800 px-3 py-1'
            >
              Tìm kiếm: "{searchQuery}"
            </Badge>
          )}
          {statusFilter !== 'all' && (
            <Badge variant='secondary' className={getStatusBadge(statusFilter).color + ' px-3 py-1'}>
              {getStatusBadge(statusFilter).label}
            </Badge>
          )}
        </div>
      )}
    </div>
  )
}
