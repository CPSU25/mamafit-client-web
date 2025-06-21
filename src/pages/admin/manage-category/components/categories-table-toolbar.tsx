import { X } from 'lucide-react'
import { Table } from '@tanstack/react-table'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import { DataTableViewOptions } from '../../components/data-table-view-options'
import { CategoryType } from '@/@types/inventory.type'

interface CategoriesTableToolbarProps {
  table: Table<CategoryType>
}

export function CategoriesTableToolbar({ table }: CategoriesTableToolbarProps) {
  const isFiltered = table.getState().columnFilters.length > 0

  return (
    <div className='flex items-center justify-between'>
      <div className='flex flex-1 flex-col-reverse items-start gap-y-2 sm:flex-row sm:items-center sm:space-x-2'>
        <Input
          placeholder='Tìm kiếm danh mục...'
          value={(table.getColumn('name')?.getFilterValue() as string) ?? ''}
          onChange={(event) => table.getColumn('name')?.setFilterValue(event.target.value)}
          className='h-8 w-[150px] lg:w-[250px]'
        />
        {isFiltered && (
          <Button 
            variant='ghost' 
            onClick={() => table.resetColumnFilters()} 
            className='h-8 px-2 lg:px-3'
            aria-label='Xóa bộ lọc'
          >
            Xóa bộ lọc
            <X className='ml-2 h-4 w-4' aria-hidden="true" />
          </Button>
        )}
      </div>
      <DataTableViewOptions table={table} />
    </div>
  )
} 