import { ColumnDef } from '@tanstack/react-table'
import { Checkbox } from '@/components/ui/checkbox'
import { SizeSchema } from '../data/schema'
import { DataTableColumnHeader } from '../../components/data-table-column-header'
import { SizeTableRowActions } from './size-row-action'
import { Hash } from 'lucide-react'
import { cn } from '@/lib/utils/utils'
import { Avatar, AvatarFallback } from '@/components/ui/avatar'

export const sizeColumns: ColumnDef<SizeSchema>[] = [
  {
    id: 'select',
    header: ({ table }) => (
      <Checkbox
        checked={table.getIsAllPageRowsSelected() || (table.getIsSomePageRowsSelected() && 'indeterminate')}
        onCheckedChange={(value) => table.toggleAllPageRowsSelected(!!value)}
        aria-label='Select all'
        className='translate-y-[2px] border-orange-300 data-[state=checked]:bg-orange-600 data-[state=checked]:border-orange-600'
        data-action-button='true'
      />
    ),
    meta: {
      className: cn(
        'sticky md:table-cell left-12 z-10 rounded-tl w-12',
        'bg-background transition-colors duration-200 group-hover/row:bg-orange-50/50 dark:group-hover/row:bg-orange-950/20 group-data-[state=selected]/row:bg-orange-50 dark:group-data-[state=selected]/row:bg-orange-950/30'
      )
    },
    cell: ({ row }) => (
      <Checkbox
        checked={row.getIsSelected()}
        onCheckedChange={(value) => row.toggleSelected(!!value)}
        aria-label='Select row'
        className='translate-y-[2px] border-orange-300 data-[state=checked]:bg-orange-600 data-[state=checked]:border-orange-600'
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
        title='Tên Size'
        className='text-orange-700 dark:text-orange-300 font-semibold'
      />
    ),
    cell: ({ row }) => {
      const name = row.getValue('name') as string
      const firstLetter = name.charAt(0).toUpperCase()

      return (
        <div className='flex items-center gap-3'>
          <Avatar className='h-10 w-10 border-2 border-orange-200 dark:border-orange-800'>
            <AvatarFallback className='bg-gradient-to-br from-orange-500 to-orange-600 text-white font-bold text-sm'>
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
        'bg-background transition-colors duration-200 group-hover/row:bg-orange-50/50 dark:group-hover/row:bg-orange-950/20 group-data-[state=selected]/row:bg-orange-50 dark:group-data-[state=selected]/row:bg-orange-950/30',
        'sticky left-24 md:table-cell'
      )
    },
    enableHiding: false
  },
  {
    id: 'actions',
    cell: ({ row }) => (
      <div data-action-button='true'>
        <SizeTableRowActions row={row} />
      </div>
    )
  }
]
