// transaction-table.tsx - Main Table Component for Transactions (No Expand)
import { useState } from 'react'
import type { DateRange } from 'react-day-picker'
import {
  ColumnDef,
  ColumnFiltersState,
  RowData,
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
import { Transaction } from '../data/schema'
import { DataTablePagination } from '@/pages/admin/components/data-table-pagination'
import { TransactionTableToolbar } from './transaction-table-toolbar'

declare module '@tanstack/react-table' {
  // eslint-disable-next-line @typescript-eslint/no-unused-vars
  interface ColumnMeta<TData extends RowData, TValue> {
    className: string
  }
}

interface TransactionTableProps {
  columns: ColumnDef<Transaction>[]
  data: Transaction[]
  onDateRangeChange?: (range: DateRange | undefined) => void
}

export function TransactionTable({ columns, data, onDateRangeChange }: TransactionTableProps) {
  const [rowSelection, setRowSelection] = useState({})
  const [sorting, setSorting] = useState<SortingState>([])
  const [columnFilters, setColumnFilters] = useState<ColumnFiltersState>([])
  const [columnVisibility, setColumnVisibility] = useState<VisibilityState>({})

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
    getPaginationRowModel: getPaginationRowModel(),
    getSortedRowModel: getSortedRowModel(),
    getFacetedRowModel: getFacetedRowModel(),
    getFacetedUniqueValues: getFacetedUniqueValues(),
    getFilteredRowModel: getFilteredRowModel()
  })

  return (
    <div className='space-y-6'>
      {/* Search Filter and Toolbar */}
      <TransactionTableToolbar<Transaction> table={table} onDateRangeChange={onDateRangeChange} />

      {/* Table */}
      <div className='rounded-md border border-violet-200 dark:border-violet-800 shadow-sm '>
        <Table>
          <TableHeader>
            {table.getHeaderGroups().map((headerGroup) => (
              <TableRow
                key={headerGroup.id}
                className='group/row bg-violet-50/50 dark:bg-violet-950/20 hover:bg-violet-50 dark:hover:bg-violet-950/30'
              >
                {headerGroup.headers.map((header) => {
                  return (
                    <TableHead
                      key={header.id}
                      colSpan={header.colSpan}
                      className={`border-violet-200 dark:border-violet-800 ${header.column.columnDef.meta?.className ?? ''}`}
                    >
                      {header.isPlaceholder ? null : flexRender(header.column.columnDef.header, header.getContext())}
                    </TableHead>
                  )
                })}
              </TableRow>
            ))}
          </TableHeader>
          <TableBody>
            {table.getRowModel().rows?.length ? (
              table.getRowModel().rows.map((row) => (
                <TableRow
                  key={row.id}
                  data-state={row.getIsSelected() && 'selected'}
                  className='group/row cursor-pointer transition-colors hover:bg-violet-50/50 dark:hover:bg-violet-950/20 data-[state=selected]:bg-violet-50 dark:data-[state=selected]:bg-violet-950/30 border-violet-100 dark:border-violet-900'
                >
                  {row.getVisibleCells().map((cell) => (
                    <TableCell
                      key={cell.id}
                      className={`border-violet-100 dark:border-violet-900 ${cell.column.columnDef.meta?.className ?? ''}`}
                      onClick={(e) => {
                        // Prevent row click when clicking on checkboxes or action buttons
                        if (
                          (e.target as HTMLElement).closest('[data-action-button="true"]') ||
                          (e.target as HTMLElement).closest('input[type="checkbox"]')
                        ) {
                          e.stopPropagation()
                        }
                      }}
                    >
                      {flexRender(cell.column.columnDef.cell, cell.getContext())}
                    </TableCell>
                  ))}
                </TableRow>
              ))
            ) : (
              <TableRow>
                <TableCell
                  colSpan={columns.length}
                  className='h-24 text-center border-violet-100 dark:border-violet-900'
                >
                  <div className='flex flex-col items-center gap-2 text-muted-foreground'>
                    <span>Không có giao dịch nào được tìm thấy.</span>
                    <span className='text-sm'>Thử thay đổi bộ lọc hoặc từ khóa tìm kiếm.</span>
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
