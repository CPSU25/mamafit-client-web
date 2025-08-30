import { X } from 'lucide-react'
import { Table } from '@tanstack/react-table'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import { DataTableFacetedFilter } from '../../components/data-table-faceted-filter'
import { DataTableViewOptions } from '../../components/data-table-view-options'
import { useAddOn } from '../context/add-on-context'
import { itemServiceTypeOptions } from '../data/data'

interface AddOnTableToolbarProps<TData> {
  table: Table<TData>
}

export function AddOnTableToolbar<TData>({ table }: AddOnTableToolbarProps<TData>) {
  const { activeTab } = useAddOn()
  const isFiltered = table.getState().columnFilters.length > 0

  const getSearchPlaceholder = () => {
    switch (activeTab) {
      case 'add-ons':
        return 'Tìm kiếm add-ons...'
      case 'positions':
        return 'Tìm kiếm positions...'
      case 'sizes':
        return 'Tìm kiếm sizes...'
      default:
        return 'Tìm kiếm...'
    }
  }

  const getSearchColumn = () => {
    switch (activeTab) {
      case 'add-ons':
        return 'name'
      case 'positions':
        return 'name'
      case 'sizes':
        return 'name'
      default:
        return 'name'
    }
  }

  const searchColumn = getSearchColumn()

  return (
    <div className='flex items-center justify-between'>
      <div className='flex flex-1 flex-col-reverse items-start gap-y-2 sm:flex-row sm:items-center sm:space-x-2'>
        <Input
          placeholder={getSearchPlaceholder()}
          value={(table.getColumn(searchColumn)?.getFilterValue() as string) ?? ''}
          onChange={(event) => table.getColumn(searchColumn)?.setFilterValue(event.target.value)}
          className='h-8 w-[150px] lg:w-[250px]'
        />
        <div className='flex gap-x-2'>
          {activeTab === 'add-ons' && table.getColumn('itemServiceType') && (
            <DataTableFacetedFilter
              column={table.getColumn('itemServiceType')}
              title='Loại dịch vụ'
              options={itemServiceTypeOptions}
            />
          )}
        </div>
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
