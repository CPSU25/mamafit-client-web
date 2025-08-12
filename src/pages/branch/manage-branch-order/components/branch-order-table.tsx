// order-table.tsx - Enhanced Order Table
import React from 'react'
import {
  ColumnDef,
  ColumnFiltersState,
  SortingState,
  VisibilityState,
  flexRender,
  getCoreRowModel,
  getFacetedRowModel,
  getFacetedUniqueValues,
  getFilteredRowModel,
  getPaginationRowModel,
  getSortedRowModel,
  useReactTable
} from '@tanstack/react-table'

import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from '@/components/ui/table'
import { DataTablePagination } from '../../components/data-table-pagination'
import { AlertCircle, Search } from 'lucide-react'
import { BranchOrderTableToolbar } from './branch-order-table-toolbar'

interface DataTableProps<TData, TValue> {
  columns: ColumnDef<TData, TValue>[]
  data: TData[]
  isLoading?: boolean
  error?: string | null
}

export function BranchOrderTable<TData, TValue>({ columns, data, isLoading, error }: DataTableProps<TData, TValue>) {
  const [rowSelection, setRowSelection] = React.useState({})
  const [columnVisibility, setColumnVisibility] = React.useState<VisibilityState>({})
  const [columnFilters, setColumnFilters] = React.useState<ColumnFiltersState>([])
  const [sorting, setSorting] = React.useState<SortingState>([])

  const table = useReactTable({
    data,
    columns,
    state: {
      sorting,
      columnVisibility,
      rowSelection,
      columnFilters
    },
    enableRowSelection: true,
    onRowSelectionChange: setRowSelection,
    onSortingChange: setSorting,
    onColumnFiltersChange: setColumnFilters,
    onColumnVisibilityChange: setColumnVisibility,
    getCoreRowModel: getCoreRowModel(),
    getFilteredRowModel: getFilteredRowModel(),
    getPaginationRowModel: getPaginationRowModel(),
    getSortedRowModel: getSortedRowModel(),
    getFacetedRowModel: getFacetedRowModel(),
    getFacetedUniqueValues: getFacetedUniqueValues()
  })

  if (error) {
    return (
      <div className='space-y-6'>
        <BranchOrderTableToolbar table={table} />
        <div className='rounded-xl border-2 border-red-200 dark:border-red-800 bg-gradient-to-br from-red-50 to-white dark:from-red-950/10 dark:to-card'>
          <div className='flex items-center justify-center h-48'>
            <div className='text-center space-y-4'>
              <div className='w-16 h-16 bg-red-100 dark:bg-red-900/30 rounded-2xl flex items-center justify-center mx-auto'>
                <AlertCircle className='h-8 w-8 text-red-600 dark:text-red-400' />
              </div>
              <div>
                <p className='text-red-700 dark:text-red-300 mb-2 font-semibold text-lg'>
                  Không thể tải danh sách đơn hàng
                </p>
                <p className='text-red-600 dark:text-red-400 text-sm max-w-md'>{error}</p>
              </div>
            </div>
          </div>
        </div>
      </div>
    )
  }

  return (
    <div className='space-y-6'>
      <BranchOrderTableToolbar table={table} />

      <div className='rounded-xl border-2 border-violet-200 dark:border-violet-800 overflow-hidden bg-gradient-to-br from-white via-violet-50/30 to-white dark:from-card dark:via-violet-950/10 dark:to-card shadow-lg'>
        <Table>
          <TableHeader className='bg-gradient-to-r from-violet-100 via-violet-50 to-purple-100 dark:from-violet-950/30 dark:via-violet-950/20 dark:to-purple-950/30'>
            {table.getHeaderGroups().map((headerGroup) => (
              <TableRow
                key={headerGroup.id}
                className='border-b border-violet-200 dark:border-violet-800 hover:bg-transparent'
              >
                {headerGroup.headers.map((header) => {
                  return (
                    <TableHead
                      key={header.id}
                      colSpan={header.colSpan}
                      className='text-violet-700 dark:text-violet-300 font-semibold'
                    >
                      {header.isPlaceholder ? null : flexRender(header.column.columnDef.header, header.getContext())}
                    </TableHead>
                  )
                })}
              </TableRow>
            ))}
          </TableHeader>
          <TableBody>
            {isLoading ? (
              <TableRow>
                <TableCell colSpan={columns.length} className='h-32 text-center'>
                  <div className='flex items-center justify-center space-x-3'>
                    <div className='animate-spin rounded-full h-6 w-6 border-2 border-violet-600 border-t-transparent'></div>
                    <span className='text-violet-600 dark:text-violet-400 font-medium'>
                      Đang tải danh sách đơn hàng...
                    </span>
                  </div>
                </TableCell>
              </TableRow>
            ) : table.getRowModel().rows?.length ? (
              table.getRowModel().rows.map((row, index) => (
                <TableRow
                  key={row.id}
                  data-state={row.getIsSelected() && 'selected'}
                  className={`
                    border-b border-violet-100 dark:border-violet-900 hover:bg-violet-50/50 dark:hover:bg-violet-950/20 transition-colors duration-200
                    ${index % 2 === 0 ? 'bg-white dark:bg-card' : 'bg-violet-50/30 dark:bg-violet-950/5'}
                    ${row.getIsSelected() ? 'bg-violet-100 dark:bg-violet-950/30' : ''}
                  `}
                >
                  {row.getVisibleCells().map((cell) => (
                    <TableCell key={cell.id} className='py-4'>
                      {flexRender(cell.column.columnDef.cell, cell.getContext())}
                    </TableCell>
                  ))}
                </TableRow>
              ))
            ) : (
              <TableRow>
                <TableCell colSpan={columns.length} className='h-48 text-center'>
                  <div className='flex flex-col items-center justify-center space-y-4'>
                    <div className='w-20 h-20 bg-violet-100 dark:bg-violet-900/30 rounded-2xl flex items-center justify-center'>
                      <Search className='h-10 w-10 text-violet-400' />
                    </div>
                    <div className='space-y-2'>
                      <p className='text-lg font-semibold text-violet-700 dark:text-violet-300'>
                        Không tìm thấy đơn hàng nào
                      </p>
                      <p className='text-sm text-muted-foreground max-w-md'>
                        Thử điều chỉnh bộ lọc hoặc tìm kiếm với từ khóa khác
                      </p>
                    </div>
                  </div>
                </TableCell>
              </TableRow>
            )}
          </TableBody>
        </Table>
      </div>

      <DataTablePagination table={table} />
    </div>
  )
}
