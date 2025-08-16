import { ColumnDef } from '@tanstack/react-table'
import { cn } from '@/lib/utils/utils'
import { Badge } from '@/components/ui/badge'
import { Checkbox } from '@/components/ui/checkbox'
import { userTypes } from '../data/data'
import { User } from '../data/schema'
import { DataTableColumnHeader } from '../../components/data-table-column-header'
import { UserTableRowActions } from './user-table-row-action'
import LongText from '@/components/long-text'

export const columns: ColumnDef<User>[] = [
  {
    id: 'select',
    header: ({ table }) => (
      <Checkbox
        checked={table.getIsAllPageRowsSelected() || (table.getIsSomePageRowsSelected() && 'indeterminate')}
        onCheckedChange={(value) => table.toggleAllPageRowsSelected(!!value)}
        aria-label='Select all'
  className='translate-y-[2px] border-violet-300 data-[state=checked]:bg-violet-600 data-[state=checked]:border-violet-600'
  data-action-button='true'
      />
    ),
    meta: {
      className: cn(
  'sticky md:table-cell left-0 z-10 rounded-tl w-12',
  'bg-background transition-colors duration-200 group-hover/row:bg-violet-50/50 dark:group-hover/row:bg-violet-950/20 group-data-[state=selected]/row:bg-violet-50 dark:group-data-[state=selected]/row:bg-violet-950/30'
      )
    },
    cell: ({ row }) => (
      <Checkbox
        checked={row.getIsSelected()}
        onCheckedChange={(value) => row.toggleSelected(!!value)}
        aria-label='Select row'
  className='translate-y-[2px] border-violet-300 data-[state=checked]:bg-violet-600 data-[state=checked]:border-violet-600'
  data-action-button='true'
      />
    ),
    enableSorting: false,
    enableHiding: false
  },
  {
    accessorKey: 'userName',
    header: ({ column }) => <DataTableColumnHeader column={column} title='Username' />,
    cell: ({ row }) => <LongText className='max-w-36'>{row.getValue('userName')}</LongText>,
    meta: {
      className: cn(
        'drop-shadow-[0_1px_2px_rgb(0_0_0_/_0.1)] dark:drop-shadow-[0_1px_2px_rgb(255_255_255_/_0.1)] lg:drop-shadow-none',
        'bg-background transition-colors duration-200 group-hover/row:bg-violet-50/50 dark:group-hover/row:bg-violet-950/20 group-data-[state=selected]/row:bg-violet-50 dark:group-data-[state=selected]/row:bg-violet-950/30',
  'sticky left-12 md:table-cell'
      )
    },
    enableHiding: false
  },
  {
    accessorKey: 'fullName',
    header: ({ column }) => <DataTableColumnHeader column={column} title='Full Name' />,
    cell: ({ row }) => {
      const value = row.getValue('fullName') as string
      return <div className='block max-w-[240px] min-w-[160px] truncate'>{value}</div>
    },
    meta: { className: 'min-w-[160px] max-w-[260px]' }
  },
  {
    accessorKey: 'userEmail',
    header: ({ column }) => <DataTableColumnHeader column={column} title='Email' />,
    cell: ({ row }) => <div className='w-fit text-nowrap'>{row.getValue('userEmail')}</div>
  },
  {
    accessorKey: 'phoneNumber',
    header: ({ column }) => <DataTableColumnHeader column={column} title='Phone Number' />,
    cell: ({ row }) => <div>{row.getValue('phoneNumber')}</div>,
    enableSorting: false
  },
  {
    accessorKey: 'status',
    header: ({ column }) => <DataTableColumnHeader column={column} title='Status' />,
    cell: ({ row }) => {
      const user = row.original
      const status = user.isVerify ? 'active' : 'inactive'
      const isActive = status === 'active'
      return (
        <div className='flex items-center gap-2'>
          <div className={cn('h-2 w-2 rounded-full', isActive ? 'bg-green-500 animate-pulse' : 'bg-gray-400')} />
          <Badge
            variant={isActive ? 'default' : 'secondary'}
            className={cn(
              'font-semibold capitalize',
              isActive
                ? 'bg-gradient-to-r from-green-500 to-green-600 text-white border-0 shadow-sm'
                : 'bg-gray-100 text-gray-600 dark:bg-gray-800 dark:text-gray-400'
            )}
          >
            {isActive ? 'Active' : 'Inactive'}
          </Badge>
        </div>
      )
    },
    filterFn: (row, value) => {
      const user = row.original
      const status = user.isVerify ? 'active' : 'inactive'
      return value.includes(status)
    },
    enableHiding: false,
    enableSorting: false
  },
  {
    accessorKey: 'roleName',
    header: ({ column }) => <DataTableColumnHeader column={column} title='Role' />,
    cell: ({ row }) => {
      const roleName = row.getValue('roleName') as string
      const userType = userTypes.find(({ value }) => value === roleName.toLowerCase())

      if (!userType) {
        return (
          <div className='flex items-center gap-x-2'>
            <span className='text-sm capitalize'>{roleName}</span>
          </div>
        )
      }

      return (
        <div className='flex items-center gap-x-2'>
          {userType.icon && <userType.icon size={16} className='text-muted-foreground' />}
          <span className='text-sm capitalize'>{roleName}</span>
        </div>
      )
    },
    filterFn: (row, value) => {
      const roleName = row.getValue('roleName') as string
      return value.includes(roleName.toLowerCase())
    },
    enableSorting: false,
    enableHiding: false
  },
  {
    id: 'actions',
    cell: UserTableRowActions
  }
]
