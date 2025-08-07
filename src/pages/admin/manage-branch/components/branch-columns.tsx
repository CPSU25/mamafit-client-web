import { ColumnDef } from '@tanstack/react-table'
import { cn } from '@/lib/utils/utils'
import { Badge } from '@/components/ui/badge'
import { Checkbox } from '@/components/ui/checkbox'
import { callTypes } from '../data/data'
import { Branch } from '../data/schema'
import { DataTableColumnHeader } from '../../components/data-table-column-header'
import { BranchTableRowActions } from './branch-table-row-action'
import LongText from '@/components/long-text'
import { BranchManagerType } from '@/@types/branch.type'



export const createBranchColumns = (): ColumnDef<Branch>[] => [
  {
    id: 'select',
    header: ({ table }) => (
      <Checkbox
        checked={table.getIsAllPageRowsSelected() || (table.getIsSomePageRowsSelected() && 'indeterminate')}
        onCheckedChange={(value) => table.toggleAllPageRowsSelected(!!value)}
        aria-label='Select all'
        className='translate-y-[2px]'
      />
    ),
    meta: {
      className: cn(
        'sticky md:table-cell left-0 z-10 rounded-tl',
        'bg-background transition-colors duration-200 group-hover/row:bg-muted group-data-[state=selected]/row:bg-muted'
      )
    },
    cell: ({ row }) => (
      <Checkbox
        checked={row.getIsSelected()}
        onCheckedChange={(value) => row.toggleSelected(!!value)}
        aria-label='Select row'
        className='translate-y-[2px]'
      />
    ),
    enableSorting: false,
    enableHiding: false
  },
  {
    accessorKey: 'name',
    header: ({ column }) => <DataTableColumnHeader column={column} title='Branch Name' />,
    cell: ({ row }) => <LongText className='max-w-36 font-medium'>{row.getValue('name')}</LongText>,
    meta: {
      className: cn(
        'drop-shadow-[0_1px_2px_rgb(0_0_0_/_0.1)] dark:drop-shadow-[0_1px_2px_rgb(255_255_255_/_0.1)] lg:drop-shadow-none',
        'bg-background transition-colors duration-200 group-hover/row:bg-muted group-data-[state=selected]/row:bg-muted',
        'sticky left-6 md:table-cell'
      )
    },
    enableHiding: false
  },
  {
    id: 'address',
    header: 'Address',
    cell: ({ row }) => {
      const branch = row.original
      const address = [branch.street, branch.ward, branch.district, branch.province].filter(Boolean).join(', ')
      return <LongText className='max-w-64 text-sm'>{address || 'No address'}</LongText>
    },
    enableSorting: false
  },
  {
    accessorKey: 'description',
    header: ({ column }) => <DataTableColumnHeader column={column} title='Description' />,
    cell: ({ row }) => <LongText className='max-w-48'>{row.getValue('description')}</LongText>
  },
  {
    accessorKey: 'openingHour',
    header: ({ column }) => <DataTableColumnHeader column={column} title='Opening Time' />,
    cell: ({ row }) => <div className='text-sm'>{row.getValue('openingHour')}</div>,
    enableSorting: false
  },
  {
    accessorKey: 'closingHour',
    header: ({ column }) => <DataTableColumnHeader column={column} title='Closing Time' />,
    cell: ({ row }) => <div className='text-sm'>{row.getValue('closingHour')}</div>,
    enableSorting: false
  },
  {
    accessorKey: 'branchManager',
    header: ({ column }) => <DataTableColumnHeader column={column} title='Branch Manager' />,
    cell: ({ row }) => {
      const branchManager: BranchManagerType = row.getValue('branchManager')
      return (
        <div className='flex flex-col'>
          <span className='font-medium'>{branchManager.fullName}</span>
          <span className='text-sm text-muted-foreground'>{branchManager.userEmail}</span>
          <span className='text-sm text-muted-foreground'>{branchManager.phoneNumber}</span>
        </div>
      )
    },
    enableSorting: false,
    enableHiding: false
  },
  {
    id: 'status',
    accessorFn: () => 'active', // Always return 'active' since there's no status field in schema
    header: ({ column }) => <DataTableColumnHeader column={column} title='Status' />,
    cell: () => {
      // For now, we'll assume all branches are active since there's no status field in the schema
      const status = 'active'
      const badgeColor = callTypes.get(status)
      return (
        <div className='flex space-x-2'>
          <Badge variant='outline' className={cn('capitalize', badgeColor)}>
            {status}
          </Badge>
        </div>
      )
    },
    filterFn: (filterValue) => {
      const status = 'active' // Default status
      return Array.isArray(filterValue) ? filterValue.includes(status) : true
    },
    enableHiding: false,
    enableSorting: false
  },
  {
    id: 'actions',
    cell: BranchTableRowActions
  }
]

export const columns = createBranchColumns()
