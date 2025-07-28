import { Table } from '@tanstack/react-table'
import { X } from 'lucide-react'

import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import { DataTableViewOptions } from '../../components/data-table-view-options'
import { DataTableFacetedFilter } from '../../components/data-table-faceted-filter'
import { voucherBatchStatusOptions, voucherDiscountStatusOptions, discountTypeOptions } from '../data/data'
import { useVoucher } from '../contexts/voucher-context'

interface DataTableToolbarProps<TData> {
  table: Table<TData>
}

export function VoucherTableToolbar<TData>({ table }: DataTableToolbarProps<TData>) {
  const { activeTab } = useVoucher()
  const isFiltered = table.getState().columnFilters.length > 0

  // Different search placeholders based on active tab
  const searchPlaceholder = activeTab === 'batch' ? 'Tìm kiếm theo mã lô, mô tả...' : 'Tìm kiếm theo mã voucher...'

  // Different search column based on active tab
  const searchColumn = activeTab === 'batch' ? 'batchCode' : 'code'

  return (
    <div className='flex items-center justify-between'>
      <div className='flex flex-1 items-center space-x-2'>
        <Input
          placeholder={searchPlaceholder}
          value={(table.getColumn(searchColumn)?.getFilterValue() as string) ?? ''}
          onChange={(event) => table.getColumn(searchColumn)?.setFilterValue(event.target.value)}
          className='h-8 w-[150px] lg:w-[250px]'
        />

        {/* Filters for voucher batch */}
        {activeTab === 'batch' && (
          <>
            {table.getColumn('status') && (
              <DataTableFacetedFilter
                column={table.getColumn('status')}
                title='Trạng thái'
                options={voucherBatchStatusOptions}
              />
            )}
            {table.getColumn('discountType') && (
              <DataTableFacetedFilter
                column={table.getColumn('discountType')}
                title='Loại giảm giá'
                options={discountTypeOptions}
              />
            )}
          </>
        )}

        {/* Filters for voucher discount */}
        {activeTab === 'discount' && (
          <>
            {table.getColumn('status') && (
              <DataTableFacetedFilter
                column={table.getColumn('status')}
                title='Trạng thái'
                options={voucherDiscountStatusOptions}
              />
            )}
            {table.getColumn('isDeleted') && (
              <DataTableFacetedFilter
                column={table.getColumn('isDeleted')}
                title='Vô hiệu hóa'
                options={[
                  { value: 'false', label: 'Khả dụng' },
                  { value: 'true', label: 'Vô hiệu hóa' }
                ]}
              />
            )}
          </>
        )}

        {isFiltered && (
          <Button variant='ghost' onClick={() => table.resetColumnFilters()} className='h-8 px-2 lg:px-3'>
            Xóa bộ lọc
            <X className='ml-2 h-4 w-4' />
          </Button>
        )}
      </div>
      <DataTableViewOptions table={table} />
    </div>
  )
}
