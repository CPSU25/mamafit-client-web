import { Table } from '@tanstack/react-table'

import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import { DataTableViewOptions } from '../../components/data-table-view-options'
import { DataTableFacetedFilter } from '../../components/data-table-faceted-filter'
import { applyForOptions } from '../data/data'
import { X } from 'lucide-react'

interface DataTableToolbarProps<TData> {
  table: Table<TData>
}

export function MilestoneTableToolbar<TData>({ table }: DataTableToolbarProps<TData>) {
  const isFiltered = table.getState().columnFilters.length > 0

  return (
    <div className='flex items-center justify-between'>
      <div className='flex flex-1 items-center space-x-2'>
        <Input
          placeholder='Tìm kiếm milestone...'
          value={(table.getColumn('name')?.getFilterValue() as string) ?? ''}
          onChange={(event) => table.getColumn('name')?.setFilterValue(event.target.value)}
          className='h-8 w-[150px] lg:w-[250px]'
        />
        {table.getColumn('applyFor') && (
          <DataTableFacetedFilter column={table.getColumn('applyFor')} title='Áp dụng cho' options={applyForOptions} />
        )}
        {isFiltered && (
          <Button variant='ghost' onClick={() => table.resetColumnFilters()} className='h-8 px-2 lg:px-3'>
            Reset
            <X className='ml-2 h-4 w-4' />
          </Button>
        )}
      </div>
      <DataTableViewOptions table={table} />
    </div>
  )
}
