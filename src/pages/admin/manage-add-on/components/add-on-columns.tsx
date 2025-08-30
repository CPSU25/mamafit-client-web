import { ColumnDef } from '@tanstack/react-table'
import { Checkbox } from '@/components/ui/checkbox'
import { AddOn, AddOnOption } from '../data/schema'
import { DataTableColumnHeader } from '../../components/data-table-column-header'
import { AddOnTableRowActions } from './add-on-row-action'
import { Package, Hash, FileText, Calendar, User } from 'lucide-react'
import dayjs from 'dayjs'
import { cn } from '@/lib/utils/utils'
import { Avatar, AvatarFallback } from '@/components/ui/avatar'

export const addOnColumns: ColumnDef<AddOn>[] = [
  {
    id: 'select',
    header: ({ table }) => (
      <Checkbox
        checked={table.getIsAllPageRowsSelected() || (table.getIsSomePageRowsSelected() && 'indeterminate')}
        onCheckedChange={(value) => table.toggleAllPageRowsSelected(!!value)}
        aria-label='Select all'
        className='translate-y-[2px] border-blue-300 data-[state=checked]:bg-blue-600 data-[state=checked]:border-blue-600'
        data-action-button='true'
      />
    ),
    meta: {
      className: cn(
        'sticky md:table-cell left-12 z-10 rounded-tl w-12',
        'bg-background transition-colors duration-200 group-hover/row:bg-blue-50/50 dark:group-hover/row:bg-blue-950/20 group-data-[state=selected]/row:bg-blue-50 dark:group-data-[state=selected]/row:bg-blue-950/30'
      )
    },
    cell: ({ row }) => (
      <Checkbox
        checked={row.getIsSelected()}
        onCheckedChange={(value) => row.toggleSelected(!!value)}
        aria-label='Select row'
        className='translate-y-[2px] border-blue-300 data-[state=checked]:bg-blue-600 data-[state=checked]:border-blue-600'
        data-action-button='true'
      />
    ),
    enableSorting: false,
    enableHiding: false
  },
  {
    accessorKey: 'name',
    header: ({ column }) => (
      <DataTableColumnHeader
        column={column}
        title='Tên Add-on'
        className='text-blue-700 dark:text-blue-300 font-semibold'
      />
    ),
    cell: ({ row }) => {
      const name = row.getValue('name') as string
      const firstLetter = name.charAt(0).toUpperCase()

      return (
        <div className='flex items-center gap-3'>
          <Avatar className='h-10 w-10 border-2 border-blue-200 dark:border-blue-800'>
            <AvatarFallback className='bg-gradient-to-br from-blue-500 to-blue-600 text-white font-bold text-sm'>
              {firstLetter}
            </AvatarFallback>
          </Avatar>
          <div className='flex flex-col'>
            <span className='font-semibold text-foreground'>{name}</span>
            <span className='text-xs text-muted-foreground flex items-center gap-1'>
              <Hash className='h-3 w-3' />
              {row.original.id.slice(-6)}
            </span>
          </div>
        </div>
      )
    },
    meta: {
      className: cn(
        'drop-shadow-[0_1px_2px_rgb(0_0_0_/_0.1)] dark:drop-shadow-[0_1px_2px_rgb(255_255_255_/_0.1)] lg:drop-shadow-none',
        'bg-background transition-colors duration-200 group-hover/row:bg-blue-50/50 dark:group-hover/row:bg-blue-950/20 group-data-[state=selected]/row:bg-blue-50 dark:group-data-[state=selected]/row:bg-blue-950/30',
        'sticky left-24 md:table-cell'
      )
    },
    enableHiding: false
  },
  {
    accessorKey: 'description',
    header: ({ column }) => (
      <DataTableColumnHeader column={column} title='Mô Tả' className='text-blue-700 dark:text-blue-300' />
    ),
    cell: ({ row }) => {
      const description = row.getValue('description') as string

      if (!description) {
        return (
          <span className='text-muted-foreground italic flex items-center gap-1'>
            <FileText className='h-3 w-3' />
            Chưa có mô tả
          </span>
        )
      }

      return (
        <div className='max-w-xs'>
          <span className='text-sm line-clamp-2'>{description}</span>
        </div>
      )
    },
    meta: {
      className: cn(
        'drop-shadow-[0_1px_2px_rgb(0_0_0_/_0.1)] dark:drop-shadow-[0_1px_2px_rgb(255_255_255_/_0.1)] lg:drop-shadow-none',
        'bg-background transition-colors duration-200 group-hover/row:bg-blue-50/50 dark:group-hover/row:bg-blue-950/20 group-data-[state=selected]/row:bg-blue-50 dark:group-data-[state=selected]/row:bg-blue-950/30',
        'sticky left-6 md:table-cell'
      )
    },
    enableHiding: false
  },
  {
    accessorKey: 'addOnOptions',
    header: ({ column }) => (
      <DataTableColumnHeader column={column} title='Số Options' className='text-blue-700 dark:text-blue-300' />
    ),
    cell: ({ row }) => {
      const addOnOptions = row.getValue('addOnOptions') as AddOnOption[]
      const count = addOnOptions?.length || 0

      return (
        <div className='flex items-center gap-2'>
          <div className='w-8 h-8 rounded-lg bg-blue-100 dark:bg-blue-900/30 flex items-center justify-center'>
            <Package className='h-4 w-4 text-blue-600' />
          </div>
          <div className='flex flex-col'>
            <span className='font-medium text-sm'>{count}</span>
            <span className='text-xs text-muted-foreground'>Options</span>
          </div>
        </div>
      )
    },
    enableSorting: false,
    enableHiding: false
  },
  {
    accessorKey: 'createdAt',
    header: ({ column }) => (
      <DataTableColumnHeader column={column} title='Ngày Tạo' className='text-blue-700 dark:text-blue-300' />
    ),
    cell: ({ row }) => {
      const date = row.getValue('createdAt') as string
      const formattedDate = dayjs(date).format('DD/MM/YYYY')
      const relativeTime = dayjs(date).fromNow()

      return (
        <div className='flex items-center gap-2 text-sm'>
          <Calendar className='h-4 w-4 text-blue-500' />
          <div className='flex flex-col'>
            <span className='font-medium'>{formattedDate}</span>
            <span className='text-xs text-muted-foreground'>{relativeTime}</span>
          </div>
        </div>
      )
    },
    enableSorting: false,
    enableHiding: false
  },
  {
    accessorKey: 'createdBy',
    header: ({ column }) => (
      <DataTableColumnHeader column={column} title='Người Tạo' className='text-blue-700 dark:text-blue-300' />
    ),
    cell: ({ row }) => {
      const createdBy = row.getValue('createdBy') as string
      return (
        <div className='flex items-center gap-2 text-sm'>
          <User className='h-4 w-4 text-blue-500' />
          <span className='font-medium'>{createdBy}</span>
        </div>
      )
    },
    enableSorting: false,
    enableHiding: false
  },
  {
    id: 'actions',
    cell: ({ row }) => (
      <div data-action-button='true'>
        <AddOnTableRowActions row={row} />
      </div>
    )
  }
]
