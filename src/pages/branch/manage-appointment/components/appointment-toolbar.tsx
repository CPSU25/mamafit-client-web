import { format } from 'date-fns'
import { DateRange } from 'react-day-picker'
import { Search, X } from 'lucide-react'

import { AppointmentStatus, AppointmentFilters } from '@/@types/apointment.type'
import { DateRangePicker } from '@/components/date-range-picker'
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select'
import { Input } from '@/components/ui/input'
import { Button } from '@/components/ui/button'
import { Badge } from '@/components/ui/badge'

interface AppointmentToolbarProps {
  filters: AppointmentFilters
  onFiltersChange: (filters: AppointmentFilters) => void
  // onCreateAppointment: () => void
}

// Danh sách các tùy chọn trạng thái, được đưa ra ngoài để dễ quản lý
const statusOptions: { value: AppointmentStatus; label: string }[] = [
  { value: AppointmentStatus.UP_COMING, label: 'Sắp tới' },
  { value: AppointmentStatus.CHECKED_IN, label: 'Đang diễn ra' },
  { value: AppointmentStatus.CHECKED_OUT, label: 'Hoàn thành' },
  { value: AppointmentStatus.CANCELED, label: 'Đã hủy' }
]

export const AppointmentToolbar = ({ filters, onFiltersChange }: AppointmentToolbarProps) => {
  // Hàm generic này vẫn là giải pháp tốt nhất và được giữ lại
  const handleFilterChange = <K extends keyof AppointmentFilters>(key: K, value: AppointmentFilters[K] | undefined) => {
    // 1. Xác định giá trị cuối cùng trước
    const finalValue = typeof value === 'string' && value.trim() === '' ? undefined : value

    // 2. Tạo object mới với giá trị đã được xác định
    const newFilters = {
      ...filters,
      [key]: finalValue
    }

    onFiltersChange(newFilters)
  }

  const clearFilters = () => onFiltersChange({})

  const hasActiveFilters = Object.values(filters).some((value) => value !== undefined && value !== '')

  return (
    <div className='space-y-4 p-4 md:p-6'>
      <div className='flex flex-col gap-4 lg:flex-row lg:items-center lg:justify-between'>
        <div className='flex flex-1 flex-col gap-4 md:flex-row'>
          {/* --- Input Search --- */}
          <div className='relative min-w-0 flex-1'>
            <Search className='absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-muted-foreground' />
            <Input
              placeholder='Tìm theo tên hoặc SĐT...'
              value={filters.searchTerm || ''}
              onChange={(e) => handleFilterChange('searchTerm', e.target.value)}
              className='pl-9'
            />
          </div>

          <div className='flex flex-col gap-4 sm:flex-row'>
            {/* --- Select Status (ĐÃ SỬA LỖI) --- */}
            <Select
              value={filters.status || 'all'}
              onValueChange={(value: string) => {
                const statusValue = value === 'all' ? undefined : (value as AppointmentStatus)
                handleFilterChange('status', statusValue)
              }}
            >
              <SelectTrigger className='w-full sm:w-[180px]'>
                <SelectValue placeholder='Chọn trạng thái' />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value='all'>Tất cả trạng thái</SelectItem>
                {statusOptions.map((option) => (
                  <SelectItem key={option.value} value={option.value}>
                    {option.label}
                  </SelectItem>
                ))}
              </SelectContent>
            </Select>

            {/* --- DateRangePicker --- */}
            <DateRangePicker
              value={filters.dateRange}
              onDateChange={(range: DateRange | undefined) => handleFilterChange('dateRange', range)}
            />
          </div>
        </div>

        {/* --- Create Button --- */}
        {/* <Button onClick={onCreateAppointment} className='w-full lg:w-auto'>
          <Plus className='mr-2 h-4 w-4' /> Tạo lịch hẹn
        </Button> */}
      </div>

      {/* --- Hiển thị các bộ lọc đang áp dụng --- */}
      {hasActiveFilters && (
        <div className='flex flex-wrap items-center gap-2 pt-2 border-t'>
          <span className='text-sm font-medium'>Đang lọc theo:</span>
          {filters.searchTerm && (
            <Badge
              variant='secondary'
              className='cursor-pointer'
              onClick={() => handleFilterChange('searchTerm', undefined)}
            >
              Từ khóa: {filters.searchTerm} <X className='ml-1.5 h-3 w-3' />
            </Badge>
          )}
          {filters.status && (
            <Badge
              variant='secondary'
              className='cursor-pointer'
              onClick={() => handleFilterChange('status', undefined)}
            >
              Trạng thái: {statusOptions.find((opt) => opt.value === filters.status)?.label}
              <X className='ml-1.5 h-3 w-3' />
            </Badge>
          )}
          {filters.dateRange?.from && (
            <Badge
              variant='secondary'
              className='cursor-pointer'
              onClick={() => handleFilterChange('dateRange', undefined)}
            >
              Ngày: {format(filters.dateRange.from, 'dd/MM/yy')}
              {filters.dateRange.to ? ` - ${format(filters.dateRange.to, 'dd/MM/yy')}` : ''}
              <X className='ml-1.5 h-3 w-3' />
            </Badge>
          )}

          <Button
            variant='ghost'
            size='sm'
            className='h-auto px-2 py-1 text-sm text-destructive hover:text-destructive'
            onClick={clearFilters}
          >
            Xóa tất cả
          </Button>
        </div>
      )}
    </div>
  )
}
