import { useState, Fragment } from 'react'
import {
  ColumnDef,
  ColumnFiltersState,
  ExpandedState,
  SortingState,
  VisibilityState,
  flexRender,
  getCoreRowModel,
  getExpandedRowModel,
  getFacetedRowModel,
  getFacetedUniqueValues,
  getFilteredRowModel,
  getPaginationRowModel,
  getSortedRowModel,
  useReactTable
} from '@tanstack/react-table'
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from '@/components/ui/table'
import { Button } from '@/components/ui/button'
import { ChevronDown, ChevronRight } from 'lucide-react'
import { DataTablePagination } from '@/pages/admin/components/data-table-pagination'
import { ComponentTableToolbar } from './component-table-toolbar'
import { ExpandedComponentDetail } from './expanded-component-detail'

interface ComponentsTableProps<TData, TValue> {
  columns: ColumnDef<TData, TValue>[]
  data: TData[]
}

export function ComponentsTable<TData, TValue>({ columns, data }: ComponentsTableProps<TData, TValue>) {
  const [rowSelection, setRowSelection] = useState({})
  const [sorting, setSorting] = useState<SortingState>([])
  const [columnFilters, setColumnFilters] = useState<ColumnFiltersState>([])
  const [columnVisibility, setColumnVisibility] = useState<VisibilityState>({})
  const [expanded, setExpanded] = useState<ExpandedState>({})

  const expandableColumns: ColumnDef<TData, TValue>[] = [
    {
      id: 'expand',
      header: () => null,
      cell: ({ row }) => {
        return (
          <Button
            variant='ghost'
            size='sm'
            onClick={(e) => {
              e.stopPropagation()
              row.toggleExpanded()
            }}
            className='h-8 w-8 p-0 hover:bg-muted'
            aria-label={row.getIsExpanded() ? 'Collapse row' : 'Expand row'}
            data-action-button='true'
          >
            {row.getIsExpanded() ? <ChevronDown className='h-4 w-4' /> : <ChevronRight className='h-4 w-4' />}
          </Button>
        )
      },
      enableSorting: false,
      enableHiding: false,
      meta: {
        className: 'w-12'
      }
    },
    ...columns
  ]

  const table = useReactTable({
    data,
    columns: expandableColumns,
    state: {
      sorting,
      columnVisibility,
      rowSelection,
      columnFilters,
      expanded
    },
    enableRowSelection: true,
    enableExpanding: true,
    onRowSelectionChange: setRowSelection,
    onSortingChange: setSorting,
    onColumnFiltersChange: setColumnFilters,
    onColumnVisibilityChange: setColumnVisibility,
    onExpandedChange: setExpanded,
    getCoreRowModel: getCoreRowModel(),
    getPaginationRowModel: getPaginationRowModel(),
    getSortedRowModel: getSortedRowModel(),
    getFacetedRowModel: getFacetedRowModel(),
    getFacetedUniqueValues: getFacetedUniqueValues(),
    getFilteredRowModel: getFilteredRowModel(),
    getExpandedRowModel: getExpandedRowModel(),
    getRowCanExpand: () => true
  })

  return (
    <div className='space-y-4'>
      <ComponentTableToolbar table={table} />
      <div className='rounded-md border'>
        <Table>
          <TableHeader>
            {table.getHeaderGroups().map((headerGroup) => (
              <TableRow key={headerGroup.id} className='group/row'>
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
              table.getRowModel().rows.map((row) => (
                <Fragment key={row.id}>
                  <TableRow
                    data-state={row.getIsSelected() && 'selected'}
                    className={`group/row cursor-pointer transition-colors hover:bg-muted/50 ${
                      row.getIsExpanded() ? 'bg-muted/30' : ''
                    }`}
                    onClick={() => row.toggleExpanded()}
                  >
                    {row.getVisibleCells().map((cell) => (
                      <TableCell
                        key={cell.id}
                        className={cell.column.columnDef.meta?.className ?? ''}
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

                  {row.getIsExpanded() && (
                    <TableRow>
                      <TableCell colSpan={expandableColumns.length} className='p-0'>
                        <div className='border-l-4 border-primary'>
                          <ExpandedComponentDetail componentId={(row.original as { id: string }).id} />
                        </div>
                      </TableCell>
                    </TableRow>
                  )}
                </Fragment>
              ))
            ) : (
              <TableRow>
                <TableCell colSpan={expandableColumns.length} className='h-24 text-center'>
                  No results.
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
