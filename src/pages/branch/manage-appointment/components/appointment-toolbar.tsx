import { useState } from 'react'
import { Input } from '@/components/ui/input'
import { Button } from '@/components/ui/button'
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select'
import { Calendar } from '@/components/ui/calendar'
import { Popover, PopoverContent, PopoverTrigger } from '@/components/ui/popover'
import { Badge } from '@/components/ui/badge'
import { CalendarIcon, Search, Plus, X } from 'lucide-react'
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

  // ----- LOGIC GỐC CỦA BẠN ĐƯỢC GIỮ NGUYÊN -----
  const handleSearchChange = (value: string) => onFiltersChange({ ...filters, searchTerm: value })
  const handleStatusChange = (value: string) => onFiltersChange({ ...filters, status: value === 'all' ? undefined : (value as AppointmentStatus) })
  const handleDateChange = (date: Date | undefined) => {
    onFiltersChange({ ...filters, date })
    setIsDatePickerOpen(false)
  }
  const clearFilters = () => onFiltersChange({})

  const hasActiveFilters = filters.searchTerm || filters.status || filters.date
  const statusOptions = [
    { value: 'all', label: 'Tất cả trạng thái' },
    { value: AppointmentStatus.UP_COMING, label: 'Sắp tới' },
    { value: AppointmentStatus.IN_PROGRESS, label: 'Đang diễn ra' },
    { value: AppointmentStatus.COMPLETED, label: 'Hoàn thành' },
    { value: AppointmentStatus.CANCELED, label: 'Đã hủy' }
  ]

  // ----- GIAO DIỆN ĐƯỢC REFECTOR -----
  return (
    <div className='space-y-4 p-4 md:p-6'>
      <div className='flex flex-col gap-4 lg:flex-row lg:items-center lg:justify-between'>
        <div className='flex flex-1 flex-col gap-4 md:flex-row'>
          <div className='relative min-w-0 flex-1'>
            <Search className='absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-muted-foreground' />
            <Input
              placeholder='Tìm theo tên hoặc SĐT...'
              value={filters.searchTerm || ''}
              onChange={(e) => handleSearchChange(e.target.value)}
              className='pl-9'
            />
          </div>
          <div className='flex flex-col gap-4 sm:flex-row'>
            <Select value={filters.status || 'all'} onValueChange={handleStatusChange}>
              <SelectTrigger className='w-full sm:w-[180px]'>
                <SelectValue placeholder='Chọn trạng thái' />
              </SelectTrigger>
              <SelectContent>
                {statusOptions.map((option) => (
                  <SelectItem key={option.value} value={option.value}>{option.label}</SelectItem>
                ))}
              </SelectContent>
            </Select>
            <Popover open={isDatePickerOpen} onOpenChange={setIsDatePickerOpen}>
              <PopoverTrigger asChild>
                <Button variant='outline' className={cn('w-full sm:w-[200px] justify-start text-left font-normal', !filters.date && 'text-muted-foreground')}>
                  <CalendarIcon className='mr-2 h-4 w-4' />
                  {filters.date ? format(filters.date, 'dd/MM/yyyy', { locale: vi }) : <span>Chọn ngày</span>}
                </Button>
              </PopoverTrigger>
              <PopoverContent className='w-auto p-0'><Calendar mode='single' selected={filters.date} onSelect={handleDateChange} locale={vi} initialFocus /></PopoverContent>
            </Popover>
          </div>
        </div>
        <Button onClick={onCreateAppointment} className='w-full lg:w-auto'><Plus className='mr-2 h-4 w-4' /> Tạo lịch hẹn</Button>
      </div>

      {hasActiveFilters && (
        <div className='flex flex-wrap items-center gap-2'>
          <span className='text-sm font-medium'>Bộ lọc:</span>
          {filters.searchTerm && (
            <Badge variant='secondary' className='cursor-pointer' onClick={() => handleSearchChange('')}>
              {filters.searchTerm} <X className='ml-1.5 h-3 w-3' />
            </Badge>
          )}
          {filters.status && (
            <Badge variant='secondary' className='cursor-pointer' onClick={() => handleStatusChange('all')}>
              {statusOptions.find((opt) => opt.value === filters.status)?.label} <X className='ml-1.5 h-3 w-3' />
            </Badge>
          )}
          {filters.date && (
            <Badge variant='secondary' className='cursor-pointer' onClick={() => handleDateChange(undefined)}>
              {format(filters.date, 'dd/MM/yyyy')} <X className='ml-1.5 h-3 w-3' />
            </Badge>
          )}
          <Button variant='ghost' size='sm' className='h-auto px-2 py-1 text-sm text-destructive hover:text-destructive' onClick={clearFilters}>
            Xóa tất cả
          </Button>
        </div>
      )}
    </div>
  )
}