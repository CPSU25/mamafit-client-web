import { ColumnDef } from '@tanstack/react-table'
import { Badge } from '@/components/ui/badge'
import { Target } from 'lucide-react'
import { Milestone } from '../data/schema'
import LongText from '@/components/long-text'
import dayjs from 'dayjs'
import { Checkbox } from '@/components/ui/checkbox'
import { DataTableColumnHeader } from '../../components/data-table-column-header'
import { MilestoneTableRowActions } from './milestone-row-action'
import { applyForOptions } from '../data/data'

// Component để hiển thị applyFor badge
function ApplyForBadge({ applyFor }: { applyFor: string }) {
  const option = applyForOptions.find((opt) => opt.value === applyFor)
  const label = option?.label || applyFor

  const badgeVariant = (applyFor: string) => {
    switch (applyFor) {
      case 'READY_TO_BUY':
        return 'default'
      case 'PRESET':
        return 'secondary'
      case 'DESIGN_REQUEST':
        return 'outline'
      default:
        return 'outline'
    }
  }

  return (
    <Badge variant={badgeVariant(applyFor)} className='text-xs'>
      {label}
    </Badge>
  )
}

export const columns: ColumnDef<Milestone>[] = [
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
    accessorKey: 'sequenceOrder',
    header: ({ column }) => <DataTableColumnHeader column={column} title='Thứ tự' />,
    cell: ({ row }) => {
      return (
        <div className='flex items-center'>
          <Badge variant='outline' className='text-sm font-mono'>
            {row.getValue('sequenceOrder')}
          </Badge>
        </div>
      )
    },
    enableSorting: true,
    enableHiding: false
  },
  {
    accessorKey: 'name',
    header: ({ column }) => <DataTableColumnHeader column={column} title='Tên Milestone' />,
    cell: ({ row }) => {
      const name = row.getValue('name') as string
      return (
        <div className='flex items-center gap-3'>
          <div className='w-8 h-8 rounded-lg bg-primary/10 flex items-center justify-center'>
            <Target className='h-4 w-4 text-primary' />
          </div>
          <div className='flex flex-col'>
            <span className='font-medium'>{name}</span>
          </div>
        </div>
      )
    },
    enableSorting: true,
    enableHiding: false
  },
  {
    accessorKey: 'description',
    header: ({ column }) => <DataTableColumnHeader column={column} title='Mô tả' />,
    cell: ({ row }) => {
      const description = row.getValue('description') as string
      return (
        <div className='max-w-[300px]'>
          <LongText className='max-w-xs'>{description || '-'}</LongText>
        </div>
      )
    },
    enableSorting: false
  },
  {
    accessorKey: 'applyFor',
    header: ({ column }) => <DataTableColumnHeader column={column} title='Áp dụng cho' />,
    cell: ({ row }) => {
      const applyFor = row.getValue('applyFor') as string
      return <ApplyForBadge applyFor={applyFor} />
    },
    enableSorting: true,
    filterFn: (row, id, value) => {
      return value.includes(row.getValue(id))
    }
  },
  {
    accessorKey: 'options',
    header: 'Tasks',
    cell: ({ row }) => {
      const options = row.getValue('options') as Array<{ id: string; name: string }>
      const taskCount = options?.length || 0

      return (
        <div className='flex items-center gap-2'>
          <Badge variant='secondary' className='text-xs'>
            {taskCount} task{taskCount !== 1 ? 's' : ''}
          </Badge>
        </div>
      )
    },
    enableSorting: false
  },
  {
    accessorKey: 'createdAt',
    header: ({ column }) => <DataTableColumnHeader column={column} title='Ngày tạo' />,
    cell: ({ row }) => {
      const createdAt = row.getValue('createdAt') as string
      return <div className='text-sm text-muted-foreground'>{dayjs(createdAt).format('DD/MM/YYYY HH:mm')}</div>
    },
    enableSorting: true
  },
  {
    accessorKey: 'createdBy',
    header: ({ column }) => <DataTableColumnHeader column={column} title='Người tạo' />,
    cell: ({ row }) => {
      const createdBy = row.getValue('createdBy') as string
      return <div className='text-sm'>{createdBy}</div>
    },
    enableSorting: true
  },
  {
    id: 'actions',
    cell: ({ row }) => <MilestoneTableRowActions row={row} />,
    enableSorting: false,
    enableHiding: false
  }
]
