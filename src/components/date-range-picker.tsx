'use client'

import * as React from 'react'
import { addDays, format, startOfMonth } from 'date-fns'
import { vi } from 'date-fns/locale'
import { Calendar as CalendarIcon } from 'lucide-react'
import { DateRange } from 'react-day-picker'

import { cn } from '@/lib/utils/utils'
import { Button } from '@/components/ui/button'
import { Calendar } from '@/components/ui/calendar'
import { Popover, PopoverContent, PopoverTrigger } from '@/components/ui/popover'
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select'

export interface DateRangePickerProps extends React.HTMLAttributes<HTMLDivElement> {
  // Đổi tên prop để rõ ràng hơn, đây là giá trị được truyền từ ngoài vào
  value?: DateRange
  onDateChange?: (range: DateRange | undefined) => void
  // Bỏ initialDate để tránh nhầm lẫn, component sẽ được kiểm soát hoàn toàn bởi prop `value`
}

export function DateRangePicker({ className, value, onDateChange }: DateRangePickerProps) {
  const [date, setDate] = React.useState<DateRange | undefined>(value)
  const [month, setMonth] = React.useState<Date>(value?.from || new Date())

  // *** SỬA LỖI 1: Đồng bộ hóa state nội bộ khi prop `value` từ bên ngoài thay đổi ***
  // Điều này cho phép component được reset khi bộ lọc bên ngoài bị xóa.
  React.useEffect(() => {
    setDate(value)
  }, [value])

  // *** SỬA LỖI 2: Tạo một hàm duy nhất để cập nhật state và thông báo cho component cha ***
  const handleDateChange = (newDate: DateRange | undefined) => {
    // Cập nhật state nội bộ
    setDate(newDate)
    // Gọi callback để cập nhật state ở component cha
    onDateChange?.(newDate)
    // Cập nhật tháng hiển thị trên lịch
    if (newDate?.from) {
      setMonth(startOfMonth(newDate.from))
    }
  }

  const handlePresetSelect = (preset: string) => {
    const now = new Date()
    let newDate: DateRange | undefined
    switch (preset) {
      case 'today':
        newDate = { from: now, to: now }
        break
      case 'yesterday': {
        const d = addDays(now, -1)
        newDate = { from: d, to: d }
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
        newDate = { from: startOfMonth(now), to: now }
        break
      case 'lastMonth': {
        const lastMonthStart = startOfMonth(addDays(now, -30))
        const lastMonthEnd = new Date(now.getFullYear(), now.getMonth(), 0)
        newDate = { from: lastMonthStart, to: lastMonthEnd }
        break
      }
      default:
        break
    }
    // Dùng hàm handleDateChange đã tạo
    handleDateChange(newDate)
  }

  // *** SỬA LỖI 3: Bỏ hoàn toàn useEffect gây ra vòng lặp vô hạn ***

  return (
    <div className={cn('grid gap-2', className)}>
      <Popover
        onOpenChange={(open) => {
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
                  {format(date.from, 'dd/MM/yyyy', { locale: vi })} - {format(date.to, 'dd/MM/yyyy', { locale: vi })}
                </>
              ) : (
                format(date.from, 'dd/MM/yyyy', { locale: vi })
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
              // Dùng hàm handleDateChange khi người dùng chọn ngày trên lịch
              onSelect={handleDateChange}
              numberOfMonths={2}
              locale={vi}
            />
          </div>
        </PopoverContent>
      </Popover>
    </div>
  )
}
