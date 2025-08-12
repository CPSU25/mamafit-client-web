// order-table-toolbar.tsx - Enhanced Table Toolbar
import { Table } from '@tanstack/react-table'
import { DataTableViewOptions } from '../../components/data-table-view-options'
import { DataTableFacetedFilter } from '../../components/data-table-faceted-filter'
import { Input } from '@/components/ui/input'
import { Button } from '@/components/ui/button'
import { Badge } from '@/components/ui/badge'
import { X, Search, Calendar, Filter } from 'lucide-react'
import { orderStatusOptions, paymentStatusOptions, paymentMethodOptions, typeOrderOptions } from '../data/data'

interface DataTableToolbarProps<TData> {
  table: Table<TData>
  onCreateNew?: () => void
  isFiltered?: boolean
}

export function OrderTableToolbar<TData>({ table, isFiltered: customIsFiltered }: DataTableToolbarProps<TData>) {
  const isFiltered = customIsFiltered ?? table.getState().columnFilters.length > 0
  const activeFiltersCount = table.getState().columnFilters.length

  return (
    <div className='space-y-4'>
      {/* Top row - Search and primary actions */}
      <div className='flex flex-col gap-4 lg:flex-row lg:items-center lg:justify-between'>
        <div className='flex flex-1 items-center space-x-3'>
          {/* Enhanced Search */}
          <div className='relative flex-1 max-w-sm'>
            <Search className='absolute left-3 top-1/2 transform -translate-y-1/2 h-4 w-4 text-muted-foreground' />
            <Input
              placeholder='Tìm kiếm đơn hàng theo mã...'
              value={(table.getColumn('code')?.getFilterValue() as string) ?? ''}
              onChange={(event) => table.getColumn('code')?.setFilterValue(event.target.value)}
              className='pl-10 h-10 border-violet-200 dark:border-violet-800 focus:border-violet-500 dark:focus:border-violet-400 bg-white/50 dark:bg-card/50 backdrop-blur-sm'
            />
          </div>

          {/* Quick filters indicator */}
          {activeFiltersCount > 0 && (
            <Badge
              variant='secondary'
              className='bg-violet-100 text-violet-700 dark:bg-violet-900/50 dark:text-violet-300 border-violet-200 dark:border-violet-700'
            >
              <Filter className='h-3 w-3 mr-1' />
              {activeFiltersCount} bộ lọc
            </Badge>
          )}
        </div>

        {/* Primary Actions */}
        <div className='flex items-center space-x-2'>
          <DataTableViewOptions table={table} />
        </div>
      </div>

      {/* Bottom row - Filters */}
      <div className='flex flex-wrap items-center gap-3'>
        {/* Status Filter */}
        {table.getColumn('status') && (
          <div className='flex items-center space-x-2'>
            <span className='text-sm font-medium text-muted-foreground'>Trạng thái:</span>
            <DataTableFacetedFilter
              column={table.getColumn('status')}
              title='Trạng thái'
              options={orderStatusOptions}
            />
          </div>
        )}

        {/* Payment Status Filter */}
        {table.getColumn('paymentStatus') && (
          <div className='flex items-center space-x-2'>
            <span className='text-sm font-medium text-muted-foreground'>Thanh toán:</span>
            <DataTableFacetedFilter
              column={table.getColumn('paymentStatus')}
              title='Thanh toán'
              options={paymentStatusOptions}
            />
          </div>
        )}

        {/* Payment Method Filter */}
        {table.getColumn('paymentMethod') && (
          <div className='flex items-center space-x-2'>
            <span className='text-sm font-medium text-muted-foreground'>Phương thức:</span>
            <DataTableFacetedFilter
              column={table.getColumn('paymentMethod')}
              title='Phương thức'
              options={paymentMethodOptions}
            />
          </div>
        )}

        {table.getColumn('type') && (
          <div className='flex items-center space-x-2'>
            <span className='text-sm font-medium text-muted-foreground'>Loại đơn hàng:</span>
            <DataTableFacetedFilter column={table.getColumn('type')} title='Loại đơn hàng' options={typeOrderOptions} />
          </div>
        )}
        {/* Date Filter */}
        <div className='flex items-center space-x-2'>
          <span className='text-sm font-medium text-muted-foreground'>Ngày tạo:</span>
          <Button
            variant='outline'
            size='sm'
            className='h-8 border-violet-200 dark:border-violet-800 text-violet-700 dark:text-violet-300 hover:bg-violet-50 dark:hover:bg-violet-950/20'
          >
            <Calendar className='mr-2 h-4 w-4' />
            Chọn ngày
          </Button>
        </div>

        {/* Clear filters */}
        {isFiltered && (
          <Button
            variant='ghost'
            onClick={() => table.resetColumnFilters()}
            className='h-8 px-3 text-violet-600 dark:text-violet-400 hover:bg-violet-50 dark:hover:bg-violet-950/20'
          >
            Xóa bộ lọc
            <X className='ml-2 h-4 w-4' />
          </Button>
        )}
      </div>

      {/* Filter summary */}
      {isFiltered && (
        <div className='bg-violet-50 dark:bg-violet-950/20 border border-violet-200 dark:border-violet-800 rounded-lg p-3'>
          <div className='flex items-center justify-between'>
            <div className='flex items-center space-x-2 text-sm'>
              <Filter className='h-4 w-4 text-violet-600 dark:text-violet-400' />
              <span className='font-medium text-violet-700 dark:text-violet-300'>
                Đang hiển thị kết quả với {activeFiltersCount} bộ lọc đang áp dụng
              </span>
            </div>
            <Button
              variant='ghost'
              size='sm'
              onClick={() => table.resetColumnFilters()}
              className='text-violet-600 dark:text-violet-400 hover:bg-violet-100 dark:hover:bg-violet-900/30 h-7'
            >
              Xóa tất cả
            </Button>
          </div>
        </div>
      )}
    </div>
  )
}
