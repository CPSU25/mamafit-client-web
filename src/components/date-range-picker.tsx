// src/components/ui/date-range-picker.tsx

'use client'

import * as React from 'react'
import { addDays, format, startOfMonth } from 'date-fns'
import { vi } from 'date-fns/locale'
import { Calendar as CalendarIcon } from 'lucide-react'
import { DateRange } from 'react-day-picker'

// Giả định đường dẫn đúng là '@/lib/utils'. Hãy điều chỉnh nếu cần.
import { cn } from '@/lib/utils/utils'
import { Button } from '@/components/ui/button'
import { Calendar } from '@/components/ui/calendar'
import { Popover, PopoverContent, PopoverTrigger } from '@/components/ui/popover'
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select'

/**
 * Interface cho DateRangePicker props.
 * @param {DateRange} [initialDate] - Khoảng ngày khởi tạo ban đầu.
 * @param {(range: DateRange | undefined) => void} [onDateChange] - Callback được gọi khi khoảng ngày thay đổi.
 */
export interface DateRangePickerProps extends React.HTMLAttributes<HTMLDivElement> {
  initialDate?: DateRange
  onDateChange?: (range: DateRange | undefined) => void
}

export function DateRangePicker({ className, initialDate, onDateChange }: DateRangePickerProps) {
  const [date, setDate] = React.useState<DateRange | undefined>(
    initialDate || {
      from: addDays(new Date(), -6),
      to: new Date()
    }
  )
  const [month, setMonth] = React.useState<Date>(date?.from || new Date())

  React.useEffect(() => {
    if (onDateChange) {
      onDateChange(date)
    }
    // Cập nhật tháng hiển thị khi khoảng ngày thay đổi
    if (date?.from) {
      setMonth(startOfMonth(date.from))
    }
  }, [date, onDateChange])

  const handlePresetSelect = (preset: string) => {
    const now = new Date()
    let newDate: DateRange | undefined
    switch (preset) {
      case 'today':
        newDate = { from: now, to: now }
        break
      case 'yesterday': {
        const yesterday = addDays(now, -1)
        newDate = { from: yesterday, to: yesterday }
        break
      }
      case 'last7':
        newDate = { from: addDays(now, -6), to: now }
        break
      case 'last14':
        newDate = { from: addDays(now, -13), to: now }
        break
      case 'last30':
        newDate = { from: addDays(now, -29), to: now }
        break
      case 'thisMonth':
        newDate = { from: new Date(now.getFullYear(), now.getMonth(), 1), to: now }
        break
      case 'lastMonth': {
        const lastMonthStart = new Date(now.getFullYear(), now.getMonth() - 1, 1)
        const lastMonthEnd = new Date(now.getFullYear(), now.getMonth(), 0)
        newDate = { from: lastMonthStart, to: lastMonthEnd }
        break
      }
      default:
        break
    }
    setDate(newDate)
    if (newDate?.from) {
      setMonth(startOfMonth(newDate.from))
    }
  }

  return (
    <div className={cn('grid gap-2', className)}>
      <Popover
        onOpenChange={(open) => {
          // Reset tháng hiển thị về tháng của ngày bắt đầu mỗi khi mở Popover
          if (open && date?.from) {
            setMonth(startOfMonth(date.from))
          }
        }}
      >
        <PopoverTrigger asChild>
          <Button
            id='date'
            variant={'outline'}
            className={cn('w-[260px] justify-start text-left font-normal', !date && 'text-muted-foreground')}
          >
            <CalendarIcon className='mr-2 h-4 w-4' />
            {date?.from ? (
              date.to ? (
                <>
                  {format(date.from, 'LLL dd, y', { locale: vi })} - {format(date.to, 'LLL dd, y', { locale: vi })}
                </>
              ) : (
                format(date.from, 'LLL dd, y', { locale: vi })
              )
            ) : (
              <span>Chọn một khoảng ngày</span>
            )}
          </Button>
        </PopoverTrigger>
        <PopoverContent className='w-auto p-0' align='start'>
          <div className='flex flex-col sm:flex-row'>
            <div className='flex w-full flex-col space-y-2 border-b p-4 sm:border-b-0 sm:border-r sm:pr-2'>
              <p className='text-sm font-medium text-muted-foreground'>Chọn nhanh</p>
              <Select onValueChange={handlePresetSelect}>
                <SelectTrigger>
                  <SelectValue placeholder='Chọn một khoảng đặt trước...' />
                </SelectTrigger>
                <SelectContent position='popper'>
                  <SelectItem value='today'>Hôm nay</SelectItem>
                  <SelectItem value='yesterday'>Hôm qua</SelectItem>
                  <SelectItem value='last7'>7 ngày qua</SelectItem>
                  <SelectItem value='last14'>14 ngày qua</SelectItem>
                  <SelectItem value='last30'>30 ngày qua</SelectItem>
                  <SelectItem value='thisMonth'>Tháng này</SelectItem>
                  <SelectItem value='lastMonth'>Tháng trước</SelectItem>
                </SelectContent>
              </Select>
            </div>
            <Calendar
              initialFocus
              mode='range'
              month={month}
              onMonthChange={setMonth}
              selected={date}
              onSelect={setDate}
              numberOfMonths={2}
              locale={vi}
            />
          </div>
        </PopoverContent>
      </Popover>
    </div>
  )
}
