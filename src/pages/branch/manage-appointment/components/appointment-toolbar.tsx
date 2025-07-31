import { useState } from 'react'
import { Input } from '@/components/ui/input'
import { Button } from '@/components/ui/button'
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select'
import { Calendar } from '@/components/ui/calendar'
import { Popover, PopoverContent, PopoverTrigger } from '@/components/ui/popover'
import { Badge } from '@/components/ui/badge'
import { CalendarIcon, Search, Plus, Filter, X } from 'lucide-react'
import { format } from 'date-fns'
import { vi } from 'date-fns/locale'
import { AppointmentStatus, AppointmentFilters } from '@/@types/apointment.type'
import { cn } from '@/lib/utils/utils'

interface AppointmentToolbarProps {
  filters: AppointmentFilters
  onFiltersChange: (filters: AppointmentFilters) => void
  onCreateAppointment: () => void
}

export const AppointmentToolbar = ({ filters, onFiltersChange, onCreateAppointment }: AppointmentToolbarProps) => {
  const [isDatePickerOpen, setIsDatePickerOpen] = useState(false)

  const handleSearchChange = (value: string) => {
    onFiltersChange({ ...filters, searchTerm: value })
  }

  const handleStatusChange = (value: string) => {
    onFiltersChange({
      ...filters,
      status: value === 'all' ? undefined : (value as AppointmentStatus)
    })
  }

  const handleDateChange = (date: Date | undefined) => {
    onFiltersChange({ ...filters, date })
    setIsDatePickerOpen(false)
  }

  const clearFilters = () => {
    onFiltersChange({})
  }

  const hasActiveFilters = filters.searchTerm || filters.status || filters.date

  const statusOptions = [
    { value: 'all', label: 'Tất cả trạng thái' },
    { value: AppointmentStatus.UP_COMING, label: 'Sắp tới' },
    { value: AppointmentStatus.IN_PROGRESS, label: 'Đang diễn ra' },
    { value: AppointmentStatus.COMPLETED, label: 'Hoàn thành' },
    { value: AppointmentStatus.CANCELED, label: 'Đã hủy' }
  ]

  return (
    <div className='p-6 bg-gradient-to-r from-purple-50 via-white to-indigo-50'>
      <div className='flex flex-col lg:flex-row gap-6 items-start lg:items-center justify-between'>
        <div className='flex flex-col sm:flex-row gap-4 flex-1 w-full lg:w-auto'>
          {/* Tìm kiếm với enhanced styling */}
          <div className='relative flex-1 max-w-md'>
            <Search className='absolute left-4 top-1/2 transform -translate-y-1/2 text-purple-400 h-5 w-5' />
            <Input
              placeholder='Tìm kiếm theo tên hoặc số điện thoại...'
              value={filters.searchTerm || ''}
              onChange={(e) => handleSearchChange(e.target.value)}
              className='pl-12 h-12 border-0 shadow-lg bg-white/80 backdrop-blur-sm focus:bg-white transition-all duration-300 rounded-xl'
            />
          </div>

          {/* Bộ lọc trạng thái với enhanced styling */}
          <Select value={filters.status || 'all'} onValueChange={handleStatusChange}>
            <SelectTrigger className='w-full sm:w-56 h-12 border-0 shadow-lg bg-white/80 backdrop-blur-sm hover:bg-white transition-all duration-300 rounded-xl'>
              <Filter className='h-5 w-5 mr-3 text-purple-400' />
              <SelectValue placeholder='Chọn trạng thái' />
            </SelectTrigger>
            <SelectContent className='rounded-xl border-0 shadow-xl'>
              {statusOptions.map((option) => (
                <SelectItem key={option.value} value={option.value} className='rounded-lg'>
                  <div className='flex items-center gap-3'>
                    <span className='font-medium'>{option.label}</span>
                  </div>
                </SelectItem>
              ))}
            </SelectContent>
          </Select>

          {/* Bộ lọc ngày với enhanced styling */}
          <Popover open={isDatePickerOpen} onOpenChange={setIsDatePickerOpen}>
            <PopoverTrigger asChild>
              <Button
                variant='outline'
                className={cn(
                  'w-full sm:w-56 h-12 justify-start text-left font-normal border-0 shadow-lg bg-white/80 backdrop-blur-sm hover:bg-white transition-all duration-300 rounded-xl',
                  !filters.date && 'text-muted-foreground'
                )}
              >
                <CalendarIcon className='mr-3 h-5 w-5 text-purple-400' />
                {filters.date ? (
                  <span className='font-medium'>{format(filters.date, 'dd/MM/yyyy', { locale: vi })}</span>
                ) : (
                  <span>Chọn ngày</span>
                )}
              </Button>
            </PopoverTrigger>
            <PopoverContent className='w-auto p-0 border-0 shadow-xl rounded-xl' align='start'>
              <Calendar
                mode='single'
                selected={filters.date}
                onSelect={handleDateChange}
                locale={vi}
                initialFocus
                className='rounded-xl'
              />
            </PopoverContent>
          </Popover>
        </div>

        {/* Action buttons với enhanced styling */}
        <div className='flex items-center gap-3'>
          {hasActiveFilters && (
            <Button
              variant='outline'
              size='sm'
              onClick={clearFilters}
              className='flex items-center gap-2 h-10 border-red-200 text-red-600 hover:bg-red-50 rounded-lg shadow-sm'
            >
              <X className='h-4 w-4' />
              Xóa bộ lọc
            </Button>
          )}

          <Button
            onClick={onCreateAppointment}
            className='flex items-center gap-2 h-12 px-6 bg-gradient-to-r from-purple-600 to-indigo-600 hover:from-purple-700 hover:to-indigo-700 text-white shadow-lg hover:shadow-xl transition-all duration-300 rounded-xl'
          >
            <Plus className='h-5 w-5' />
            <span className='font-medium'>Thêm lịch hẹn</span>
          </Button>
        </div>
      </div>

      {/* Active filters với enhanced styling */}
      {hasActiveFilters && (
        <div className='mt-6 p-4 bg-white/60 backdrop-blur-sm rounded-xl border border-purple-100'>
          <div className='flex flex-wrap items-center gap-3'>
            <span className='text-sm font-medium text-purple-700'>Bộ lọc đang áp dụng:</span>

            {filters.searchTerm && (
              <Badge className='flex items-center gap-2 bg-purple-100 text-purple-700 hover:bg-purple-200 rounded-lg px-3 py-1.5'>
                <span className='font-medium'>Tìm kiếm: {filters.searchTerm}</span>
                <X className='h-3 w-3 cursor-pointer hover:text-purple-900' onClick={() => handleSearchChange('')} />
              </Badge>
            )}

            {filters.status && (
              <Badge className='flex items-center gap-2 bg-blue-100 text-blue-700 hover:bg-blue-200 rounded-lg px-3 py-1.5'>
                <span className='font-medium'>
                  Trạng thái: {statusOptions.find((opt) => opt.value === filters.status)?.label}
                </span>
                <X className='h-3 w-3 cursor-pointer hover:text-blue-900' onClick={() => handleStatusChange('all')} />
              </Badge>
            )}

            {filters.date && (
              <Badge className='flex items-center gap-2 bg-emerald-100 text-emerald-700 hover:bg-emerald-200 rounded-lg px-3 py-1.5'>
                <span className='font-medium'>Ngày: {format(filters.date, 'dd/MM/yyyy', { locale: vi })}</span>
                <X
                  className='h-3 w-3 cursor-pointer hover:text-emerald-900'
                  onClick={() => handleDateChange(undefined)}
                />
              </Badge>
            )}
          </div>
        </div>
      )}
    </div>
  )
}
