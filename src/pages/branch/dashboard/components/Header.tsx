import { DateRange } from 'react-day-picker'
import { DateRangePicker } from '@/components/date-range-picker'
import { Store } from 'lucide-react'

interface HeaderProps {
  onDateChange?: (range: DateRange | undefined) => void
}

export function BranchHeader({ onDateChange }: HeaderProps) {
  return (
    <div className='flex items-center justify-between'>
      <div className='flex items-center gap-3'>
        <div className='h-10 w-10 rounded-lg bg-gradient-to-br from-violet-500 to-violet-600 grid place-items-center shadow'>
          <Store className='h-6 w-6 text-white' />
        </div>
        <div>
          <h1 className='text-2xl font-bold tracking-tight'>Tổng quan chi nhánh</h1>
          <p className='text-sm text-muted-foreground'>Theo dõi đơn hàng, bảo hành và lịch hẹn tại cửa hàng</p>
        </div>
      </div>
      <div className='hidden md:flex items-center gap-3'>
        <DateRangePicker className='[&>button]:h-9' onDateChange={onDateChange} />
      </div>
    </div>
  )
}
