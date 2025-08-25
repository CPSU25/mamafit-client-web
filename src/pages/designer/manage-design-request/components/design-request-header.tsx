import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select'
import { Filter, Grid, List, Search } from 'lucide-react'

interface DesignRequestHeaderProps {
  searchTerm: string
  onSearchChange: (value: string) => void
  statusFilter: string
  onStatusFilterChange: (value: string) => void
  viewMode: 'grid' | 'list'
  onViewModeChange: (mode: 'grid' | 'list') => void
}

export const DesignRequestHeader = ({
  searchTerm,
  onSearchChange,
  statusFilter,
  onStatusFilterChange,
  viewMode,
  onViewModeChange
}: DesignRequestHeaderProps) => {
  return (
    <div className='flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4 mb-6'>
      <div className='space-y-1'>
        <h1 className='text-3xl font-bold tracking-tight bg-gradient-to-r from-violet-600 to-violet-500 bg-clip-text text-transparent'>
          Quản Lý Yêu Cầu Thiết Kế
        </h1>
        <p className='text-sm text-muted-foreground'>
          Quản lý và theo dõi các yêu cầu thiết kế từ khách hàng
        </p>
      </div>

      <div className='flex flex-col sm:flex-row gap-3 w-full sm:w-auto'>
        {/* Search */}
        <div className='relative flex-1 sm:flex-none'>
          <Search className='absolute left-3 top-1/2 transform -translate-y-1/2 text-muted-foreground w-4 h-4' />
          <Input
            placeholder='Tìm kiếm theo mã đơn hàng, tên khách hàng...'
            value={searchTerm}
            onChange={(e) => onSearchChange(e.target.value)}
            className='pl-10 w-full sm:w-80'
          />
        </div>

        {/* Status Filter */}
        <Select value={statusFilter} onValueChange={onStatusFilterChange}>
          <SelectTrigger className='w-full sm:w-40'>
            <Filter className='w-4 h-4 mr-2' />
            <SelectValue placeholder='Lọc theo trạng thái' />
          </SelectTrigger>
          <SelectContent>
            <SelectItem value='all'>Tất cả</SelectItem>
            <SelectItem value='PENDING'>Chờ xử lý</SelectItem>
            <SelectItem value='IN_PROGRESS'>Đang thiết kế</SelectItem>
            <SelectItem value='COMPLETED'>Hoàn thành</SelectItem>
          </SelectContent>
        </Select>

        {/* View Mode Toggle */}
        <div className='flex border rounded-lg p-1 bg-muted'>
          <Button
            variant={viewMode === 'grid' ? 'default' : 'ghost'}
            size='sm'
            onClick={() => onViewModeChange('grid')}
            className='h-8 px-3'
          >
            <Grid className='w-4 h-4' />
          </Button>
          <Button
            variant={viewMode === 'list' ? 'default' : 'ghost'}
            size='sm'
            onClick={() => onViewModeChange('list')}
            className='h-8 px-3'
          >
            <List className='w-4 h-4' />
          </Button>
        </div>
      </div>
    </div>
  )
}
