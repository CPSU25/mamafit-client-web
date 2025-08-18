import { X } from 'lucide-react'
import { Table } from '@tanstack/react-table'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import { DataTableFacetedFilter } from '../../components/data-table-faceted-filter'
import { DataTableViewOptions } from '../../components/data-table-view-options'
import { applyForOptions } from '../data/data'

interface MilestoneTableToolbarProps<TData> {
  table: Table<TData>
}

export function MilestoneTableToolbar<TData>({ table }: MilestoneTableToolbarProps<TData>) {
  const isFiltered = table.getState().columnFilters.length > 0

  return (
    <div className='flex items-center justify-between'>
      <div className='flex flex-1 flex-col-reverse items-start gap-y-2 sm:flex-row sm:items-center sm:space-x-2'>
        <Input
          placeholder='Tìm kiếm mốc nhiệm vụ...'
          value={(table.getColumn('name')?.getFilterValue() as string) ?? ''}
          onChange={(event) => table.getColumn('name')?.setFilterValue(event.target.value)}
          className='h-8 w-[150px] lg:w-[250px]'
        />
        <div className='flex gap-x-2'>
          {table.getColumn('applyFor') && (
            <DataTableFacetedFilter
              column={table.getColumn('applyFor')}
              title='Áp dụng cho'
              options={applyForOptions.map(option => ({
                label: option.label,
                value: option.value
              }))}
            />
          )}
        </div>
        {isFiltered && (
          <Button variant='ghost' onClick={() => table.resetColumnFilters()} className='h-8 px-2 lg:px-3'>
            Đặt lại
            <X className='ml-2 h-4 w-4' />
          </Button>
        )}
      </div>
      <DataTableViewOptions table={table} />
    </div>
  )
}
