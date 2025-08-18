import { X } from 'lucide-react'
import { Table } from '@tanstack/react-table'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import { DataTableViewOptions } from '../../components/data-table-view-options'

interface BranchTableToolbarProps<TData> {
  table: Table<TData>
}

export function BranchTableToolbar<TData>({ table }: BranchTableToolbarProps<TData>) {
  const isFiltered = table.getState().columnFilters.length > 0

  return (
    <div className='flex items-center justify-between'>
      <div className='flex flex-1 flex-col-reverse items-start gap-y-2 sm:flex-row sm:items-center sm:space-x-2'>
        <Input
          placeholder='Tìm kiếm chi nhánh...'
          value={(table.getColumn('name')?.getFilterValue() as string) ?? ''}
          onChange={(event) => table.getColumn('name')?.setFilterValue(event.target.value)}
          className='h-8 w-[150px] lg:w-[250px] border-violet-200 dark:border-violet-800 focus:border-violet-400 dark:focus:border-violet-600'
        />
        <div className='flex gap-x-2'>{/* Removed status filter since no status field exists */}</div>
        {isFiltered && (
          <Button
            variant='ghost'
            onClick={() => table.resetColumnFilters()}
            className='h-8 px-2 lg:px-3 hover:bg-violet-50 dark:hover:bg-violet-950/30'
          >
            Đặt lại
            <X className='ml-2 h-4 w-4' />
          </Button>
        )}
      </div>
      <DataTableViewOptions table={table} />
    </div>
  )
}
