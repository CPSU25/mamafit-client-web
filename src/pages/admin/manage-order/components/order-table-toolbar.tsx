import { Table } from '@tanstack/react-table'
import { DataTableViewOptions } from '../../components/data-table-view-options'
import { DataTableFacetedFilter } from '../../components/data-table-faceted-filter'
import { Input } from '@/components/ui/input'
import { Button } from '@/components/ui/button'
import { X, Search, Calendar, Plus } from 'lucide-react'
import { orderStatusOptions, paymentStatusOptions, paymentMethodOptions } from '../data/data'

interface DataTableToolbarProps<TData> {
  table: Table<TData>
  onCreateNew?: () => void
  isFiltered?: boolean
}

export function OrderTableToolbar<TData>({
  table,
  onCreateNew,
  isFiltered: customIsFiltered
}: DataTableToolbarProps<TData>) {
  const isFiltered = customIsFiltered ?? table.getState().columnFilters.length > 0

  return (
    <div className='flex items-center justify-between'>
      <div className='flex flex-1 items-center space-x-2'>
        <div className='relative'>
          <Search className='absolute left-2 top-2.5 h-4 w-4 text-muted-foreground' />
          <Input
            placeholder='Tìm kiếm đơn hàng theo mã...'
            value={(table.getColumn('code')?.getFilterValue() as string) ?? ''}
            onChange={(event) => table.getColumn('code')?.setFilterValue(event.target.value)}
            className='h-8 w-[200px] lg:w-[300px] pl-8'
          />
        </div>

        {table.getColumn('status') && (
          <DataTableFacetedFilter column={table.getColumn('status')} title='Trạng thái' options={orderStatusOptions} />
        )}

        {table.getColumn('paymentStatus') && (
          <DataTableFacetedFilter
            column={table.getColumn('paymentStatus')}
            title='Thanh toán'
            options={paymentStatusOptions}
          />
        )}

        {table.getColumn('paymentMethod') && (
          <DataTableFacetedFilter
            column={table.getColumn('paymentMethod')}
            title='Phương thức'
            options={paymentMethodOptions}
          />
        )}

        <Button variant='outline' size='sm' className='h-8'>
          <Calendar className='mr-2 h-4 w-4' />
          Chọn ngày
        </Button>

        {isFiltered && (
          <Button variant='ghost' onClick={() => table.resetColumnFilters()} className='h-8 px-2 lg:px-3'>
            Xóa bộ lọc
            <X className='ml-2 h-4 w-4' />
          </Button>
        )}
      </div>

      <div className='flex items-center space-x-2'>
        {onCreateNew && (
          <Button onClick={onCreateNew} size='sm' className='h-8'>
            <Plus className='mr-2 h-4 w-4' />
            Tạo đơn hàng
          </Button>
        )}
        <DataTableViewOptions table={table} />
      </div>
    </div>
  )
}
