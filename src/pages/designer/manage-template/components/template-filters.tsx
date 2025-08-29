import React, { useState } from 'react'
import { Search, Filter, SortAsc } from 'lucide-react'
import { Input } from '@/components/ui/input'
import { Button } from '@/components/ui/button'
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select'
import { Badge } from '@/components/ui/badge'
import { SortBy, FilterBy } from '@/@types/designer.types'

interface TemplateFiltersProps {
  searchTerm: string
  onSearchChange: (value: string) => void
  sortBy: SortBy
  onSortChange: (sort: SortBy) => void
  filterBy: FilterBy
  onFilterChange: (filter: FilterBy) => void
  totalResults: number
}

export const TemplateFilters: React.FC<TemplateFiltersProps> = ({
  searchTerm,
  onSearchChange,
  sortBy,
  onSortChange,
  filterBy,
  onFilterChange,
  totalResults
}) => {
  const [isAdvancedOpen, setIsAdvancedOpen] = useState(false)

  const getFilterLabel = (filter: FilterBy) => {
    switch (filter) {
      case 'SYSTEM':
        return 'Mẫu hệ thống'
      case 'default':
        return 'Mẫu mặc định'
      default:
        return 'Tất cả'
    }
  }

  const getSortLabel = (sort: SortBy) => {
    switch (sort) {
      //   case 'createdAt': return 'Ngày tạo';
      //   case 'updatedAt': return 'Ngày cập nhật';
      //   case 'price': return 'Giá';
      //   case 'styleName': return 'Tên style';
      default:
        return 'Ngày tạo'
    }
  }

  return (
    <div className='space-y-4'>
      <div className='flex items-center gap-4'>
        <div className='relative flex-1 max-w-md'>
          <Search className='absolute left-3 top-1/2 transform -translate-y-1/2 text-muted-foreground w-4 h-4' />
          <Input
            placeholder='Tìm kiếm mẫu, kiểu dáng...'
            className='pl-10'
            value={searchTerm}
            onChange={(e) => onSearchChange(e.target.value)}
          />
        </div>

        <div className='flex items-center gap-2'>
          <Button variant='outline' size='sm' onClick={() => setIsAdvancedOpen(!isAdvancedOpen)}>
            <Filter className='w-4 h-4 mr-2' />
            Lọc
          </Button>
        </div>
      </div>

      {/* Advanced Filters */}
      {isAdvancedOpen && (
        <div className='flex items-center gap-4 p-4 bg-muted/50 rounded-lg'>
          <div className='space-y-1'>
            <label className='text-xs font-medium text-muted-foreground'>Sắp xếp theo</label>
            <Select value={sortBy} onValueChange={(value: SortBy) => onSortChange(value)}>
              <SelectTrigger className='w-40'>
                <SelectValue />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value='createdAt'>Ngày tạo</SelectItem>
                <SelectItem value='updatedAt'>Ngày cập nhật</SelectItem>
                <SelectItem value='price'>Giá</SelectItem>
                <SelectItem value='styleName'>Tên style</SelectItem>
              </SelectContent>
            </Select>
          </div>

          <div className='space-y-1'>
            <label className='text-xs font-medium text-muted-foreground'>Lọc theo</label>
            <Select value={filterBy} onValueChange={(value: FilterBy) => onFilterChange(value)}>
              <SelectTrigger className='w-48'>
                <SelectValue />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value='all'>Tất cả</SelectItem>
                <SelectItem value='SYSTEM'>System Templates</SelectItem>
                <SelectItem value='USER'>User Templates</SelectItem>
                <SelectItem value='default'>Default Templates</SelectItem>
                <SelectItem value='hasOptions'>Có Component Options</SelectItem>
              </SelectContent>
            </Select>
          </div>

          <div className='flex-1' />

          <Button
            variant='ghost'
            size='sm'
            onClick={() => {
              onSearchChange('')
              onFilterChange('all')
            }}
          >
            Xóa bộ lọc
          </Button>
        </div>
      )}

      <div className='flex items-center justify-between'>
        <div className='flex items-center gap-2'>
          <span className='text-sm text-muted-foreground'>{totalResults} kết quả</span>
          {filterBy !== 'all' && (
            <Badge variant='secondary' className='text-xs'>
              {getFilterLabel(filterBy)}
            </Badge>
          )}
          {searchTerm && (
            <Badge variant='outline' className='text-xs'>
              "{searchTerm}"
            </Badge>
          )}
        </div>

        <div className='text-xs text-muted-foreground'>
          <SortAsc className='w-3 h-3 inline mr-1' />
          {getSortLabel(sortBy)}
        </div>
      </div>
    </div>
  )
}
