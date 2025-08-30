import { Search, X, Filter } from 'lucide-react'
import { Input } from '@/components/ui/input'
import { Button } from '@/components/ui/button'
import { Badge } from '@/components/ui/badge'

interface WarrantyFiltersProps {
  searchQuery: string
  onSearchChange: (search: string) => void
  onClearFilters?: () => void
  hasActiveFilters?: boolean
  selectedTab?: string
}

export const WarrantyFilters = ({
  searchQuery,
  onSearchChange,
  onClearFilters,
  hasActiveFilters = false,
  selectedTab = 'all'
}: WarrantyFiltersProps) => {
  const handleClearSearch = () => {
    onSearchChange('')
  }

  const getTabLabel = (tab: string) => {
    switch (tab) {
      case 'pending':
        return 'Chờ xử lý'
      case 'approved':
        return 'Đã duyệt'
      case 'repairing':
        return 'Sửa chữa'
      case 'awaiting_payment':
        return 'Chờ TT'
      case 'completed':
        return 'Hoàn thành'
      case 'rejected':
        return 'Từ chối'
      default:
        return tab
    }
  }

  return (
    <div className='w-full space-y-6'>
      {/* Modern Search Bar */}
      <div className='w-full max-w-2xl mx-auto'>
        <div className='relative'>
          <div className='absolute inset-y-0 left-0 pl-4 flex items-center pointer-events-none'>
            <Search className='h-5 w-5 text-gray-400 dark:text-gray-500' />
          </div>
          <Input
            placeholder='Tìm kiếm theo mã SKU, tên khách hàng, số điện thoại...'
            value={searchQuery}
            onChange={(e) => onSearchChange(e.target.value)}
            className='pl-12 pr-12 h-12 text-sm border border-gray-200 dark:border-gray-700 bg-white dark:bg-gray-800 focus:ring-2 focus:ring-violet-500 focus:border-violet-500 rounded-lg shadow-sm transition-all'
          />
          {searchQuery && (
            <Button
              variant='ghost'
              size='sm'
              onClick={handleClearSearch}
              className='absolute inset-y-0 right-0 px-3 h-full hover:bg-transparent'
            >
              <X className='h-4 w-4 text-gray-400 hover:text-gray-600' />
            </Button>
          )}
        </div>

        {/* Search Result Badge */}
        {searchQuery && (
          <div className='mt-3 flex items-center gap-2'>
            <Badge
              variant='secondary'
              className='bg-violet-50 text-violet-700 border border-violet-200 dark:bg-violet-950/20 dark:text-violet-400 dark:border-violet-800 px-3 py-1'
            >
              <Search className='w-3 h-3 mr-1' />
              Tìm kiếm: "{searchQuery}"
            </Badge>
          </div>
        )}
      </div>

      {/* Active Filters Display */}
      {hasActiveFilters && onClearFilters && (
        <div className='flex items-center gap-3 flex-wrap justify-center'>
          <div className='flex items-center gap-2 text-sm text-gray-600 dark:text-gray-400'>
            <Filter className='w-4 h-4' />
            <span>Bộ lọc đang hoạt động:</span>
          </div>

          {selectedTab !== 'all' && (
            <Badge
              variant='outline'
              className='bg-blue-50 text-blue-700 border-blue-200 dark:bg-blue-950/20 dark:text-blue-400 dark:border-blue-800'
            >
              Tab: {getTabLabel(selectedTab)}
            </Badge>
          )}

          <Button
            variant='ghost'
            size='sm'
            onClick={onClearFilters}
            className='text-red-600 hover:text-red-700 hover:bg-red-50 dark:text-red-400 dark:hover:text-red-300 dark:hover:bg-red-950/20'
          >
            <X className='w-4 h-4 mr-1' />
            Xóa tất cả bộ lọc
          </Button>
        </div>
      )}
    </div>
  )
}
