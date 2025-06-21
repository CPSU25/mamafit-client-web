import React, { useState } from 'react'
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
import { ChevronDown, ChevronRight } from 'lucide-react'
import { CategoryType } from '@/@types/inventory.type'
import { DataTablePagination } from '../../components/data-table-pagination'
import { CategoriesTableToolbar } from './categories-table-toolbar'
import { ExpandedCategoryStyles } from './expanded-category-styles'

declare module '@tanstack/react-table' {
  // eslint-disable-next-line @typescript-eslint/no-unused-vars
  interface ColumnMeta<TData extends RowData, TValue> {
    className: string
  }
}

interface CategoriesTableProps {
  columns: ColumnDef<CategoryType>[]
  data: CategoryType[]
  expandedCategoryId?: string | null
  onCategoryClick?: (categoryId: string) => void
}

export const CategoriesTable = React.memo(function CategoriesTable({ 
  columns, 
  data, 
  expandedCategoryId, 
  onCategoryClick 
}: CategoriesTableProps) {
  const [rowSelection, setRowSelection] = useState({})
  const [columnVisibility, setColumnVisibility] = useState<VisibilityState>({})
  const [columnFilters, setColumnFilters] = useState<ColumnFiltersState>([])
  const [sorting, setSorting] = useState<SortingState>([])

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

  const handleCategoryClick = React.useCallback((categoryId: string, event: React.MouseEvent) => {
    // Prevent expansion when clicking on action buttons
    const target = event.target as HTMLElement
    if (target.closest('[data-action-button]') || target.closest('[role="button"]')) {
      return
    }
    
    onCategoryClick?.(categoryId)
  }, [onCategoryClick])

  return (
    <div className='space-y-4'>
      <CategoriesTableToolbar table={table} />
      <div className='rounded-md border'>
        <Table>
          <TableHeader>
            {table.getHeaderGroups().map((headerGroup) => (
              <TableRow key={headerGroup.id}>
                {headerGroup.headers.map((header) => {
                  return (
                    <TableHead
                      key={header.id}
                      colSpan={header.colSpan}
                      className={header.column.columnDef.meta?.className ?? ''}
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
              table.getRowModel().rows.map((row) => {
                const isExpanded = expandedCategoryId === row.original.id
                const categoryId = row.original.id
                
                return (
                  <React.Fragment key={`category-fragment-${categoryId}`}>
                    {/* Main Category Row */}
                    <TableRow 
                      key={`category-row-${categoryId}`}
                      data-state={row.getIsSelected() && 'selected'} 
                      className='cursor-pointer hover:bg-muted/50 transition-colors'
                      onClick={(e) => handleCategoryClick(categoryId, e)}
                    >
                      {row.getVisibleCells().map((cell, cellIndex) => (
                        <TableCell 
                          key={`cell-${categoryId}-${cellIndex}`} 
                          className={cell.column.columnDef.meta?.className ?? ''}
                        >
                          <div className='flex items-center gap-2'>
                            {/* Add expand indicator to first data cell (after checkbox) */}
                            {cellIndex === 1 && (
                              <div className='flex-shrink-0' aria-hidden="true">
                                {isExpanded ? (
                                  <ChevronDown className='h-4 w-4 text-blue-600' />
                                ) : (
                                  <ChevronRight className='h-4 w-4 text-gray-400' />
                                )}
                              </div>
                            )}
                            <div className='flex-1'>
                              {flexRender(cell.column.columnDef.cell, cell.getContext())}
                            </div>
                          </div>
                        </TableCell>
                      ))}
                    </TableRow>
                    
                    {/* Expanded Content Row */}
                    {isExpanded && (
                      <TableRow key={`expanded-row-${categoryId}`} className='border-0 bg-muted/20'>
                        <TableCell colSpan={columns.length} className='p-0 border-0'>
                          <div className='w-full'>
                            <ExpandedCategoryStyles categoryId={categoryId} />
                          </div>
                        </TableCell>
                      </TableRow>
                    )}
                  </React.Fragment>
                )
              })
            ) : (
              <TableRow>
                <TableCell colSpan={columns.length} className='h-24 text-center'>
                  Không có dữ liệu
                </TableCell>
              </TableRow>
            )}
          </TableBody>
        </Table>
      </div>
      <DataTablePagination table={table} />
    </div>
  )
}) 