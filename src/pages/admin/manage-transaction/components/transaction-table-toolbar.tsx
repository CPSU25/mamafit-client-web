// transaction-table-toolbar.tsx - Table Toolbar for Transactions
import { useState } from 'react'
import { Table } from '@tanstack/react-table'
import { Input } from '@/components/ui/input'
import { Button } from '@/components/ui/button'
import { X, Search, Filter, Download, Calendar as CalendarIcon } from 'lucide-react'
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue
} from '@/components/ui/select'
import { Badge } from '@/components/ui/badge'
import { DateRange } from 'react-day-picker'
import { DateRangePicker } from '@/components/date-range-picker'

interface TransactionTableToolbarProps<TData> {
  table: Table<TData>
  onDateRangeChange?: (range: DateRange | undefined) => void
}

export function TransactionTableToolbar<TData>({ table, onDateRangeChange }: TransactionTableToolbarProps<TData>) {
  const isFiltered = table.getState().columnFilters.length > 0
  const [dateRange, setDateRange] = useState<DateRange | undefined>()

  // Get unique gateways for filter dropdown
  const gateways = Array.from(
    new Set(
      table.getCoreRowModel().rows.map((row) => (row.getValue('gateway') as string))
    )
  ).filter(Boolean)

  return (
    <div className='flex flex-col gap-4 md:flex-row md:items-center md:justify-between'>
      <div className='flex flex-1 flex-col gap-4 md:flex-row md:items-center md:space-x-2'>
        {/* Search Input */}
        <div className='relative flex-1 md:max-w-sm'>
          <Search className='absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-muted-foreground' />
          <Input
            placeholder='Tìm kiếm mã đơn hàng, nội dung...'
            value={(table.getColumn('orderId')?.getFilterValue() as string) ?? ''}
            onChange={(event) => table.getColumn('orderId')?.setFilterValue(event.target.value)}
            className='pl-10 focus-visible:ring-violet-500 border-violet-200 dark:border-violet-800'
          />
        </div>

        {/* Date Range Picker */}
        <div className='flex items-center gap-2'>
          <CalendarIcon className='h-4 w-4 text-muted-foreground' />
          <DateRangePicker
            value={dateRange}
            onDateChange={(range) => {
              setDateRange(range)
              onDateRangeChange?.(range)
            }}
          />
          {dateRange?.from && (
            <Button
              variant='ghost'
              size='sm'
              onClick={() => {
                setDateRange(undefined)
                onDateRangeChange?.(undefined)
              }}
              className='h-8 px-2 lg:px-3 hover:bg-violet-50 dark:hover:bg-violet-950/20'
            >
              Xóa ngày
              <X className='ml-2 h-4 w-4' />
            </Button>
          )}
        </div>

        {/* Gateway Filter */}
        <div className='flex items-center gap-2'>
          <Filter className='h-4 w-4 text-muted-foreground' />
          <Select
            value={(table.getColumn('gateway')?.getFilterValue() as string) ?? 'all'}
            onValueChange={(value) => {
              table.getColumn('gateway')?.setFilterValue(value === 'all' ? '' : value)
            }}
          >
            <SelectTrigger className='w-[200px] focus:ring-violet-500 border-violet-200 dark:border-violet-800'>
              <SelectValue placeholder='Tất cả phương thức' />
            </SelectTrigger>
            <SelectContent>
              <SelectItem value='all'>Tất cả phương thức</SelectItem>
              {gateways.map((gateway) => (
                <SelectItem key={gateway} value={gateway}>
                  {gateway}
                </SelectItem>
              ))}
            </SelectContent>
          </Select>
        </div>

        {/* Clear Filters */}
        {isFiltered && (
          <Button
            variant='ghost'
            onClick={() => table.resetColumnFilters()}
            className='h-8 px-2 lg:px-3 hover:bg-violet-50 dark:hover:bg-violet-950/20'
          >
            Xóa bộ lọc
            <X className='ml-2 h-4 w-4' />
          </Button>
        )}
      </div>

      <div className='flex items-center gap-2'>
        {/* Selected rows count */}
        {table.getFilteredSelectedRowModel().rows.length > 0 && (
          <Badge variant='secondary' className='bg-violet-100 text-violet-700 dark:bg-violet-900/30 dark:text-violet-400'>
            {table.getFilteredSelectedRowModel().rows.length} được chọn
          </Badge>
        )}

        {/* Export Button */}
        <Button variant='outline' size='sm' className='border-violet-300 text-violet-700 hover:bg-violet-50 dark:hover:bg-violet-950/20'>
          <Download className='mr-2 h-4 w-4' />
          Xuất CSV
        </Button>
      </div>
    </div>
  )
}