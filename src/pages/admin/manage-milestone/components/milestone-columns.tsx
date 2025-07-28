import { ColumnDef } from '@tanstack/react-table'
import { Badge } from '@/components/ui/badge'
import { Target } from 'lucide-react'
import { Milestone } from '../data/schema'
import LongText from '@/components/long-text'
import dayjs from 'dayjs'
import { Checkbox } from '@/components/ui/checkbox'
import { DataTableColumnHeader } from '../../components/data-table-column-header'
import { MilestoneTableRowActions } from './milestone-row-action'

// Component để hiển thị applyFor badge với UI/UX được cải thiện
function ApplyForBadge({ applyFor }: { applyFor: string[] }) {
  const getBadgeConfig = (type: string) => {
    const configs = {
      READY_TO_BUY: {
        variant: 'default' as const,
        className: 'bg-green-100 text-green-800 border-green-200 hover:bg-green-200',
        label: 'Ready to buy'
      },
      PRESET: {
        variant: 'secondary' as const,
        className: 'bg-blue-100 text-blue-800 border-blue-200 hover:bg-blue-200',
        label: 'Preset'
      },
      DESIGN_REQUEST: {
        variant: 'outline' as const,
        className: 'bg-orange-100 text-orange-800 border-orange-200 hover:bg-orange-200',
        label: 'Design request'
      }
    }

    return (
      configs[type as keyof typeof configs] || {
        variant: 'outline' as const,
        className: 'bg-gray-100 text-gray-800 border-gray-200',
        label: type
      }
    )
  }

  // Nếu có quá nhiều items (>3), hiển thị 2 items đầu + "và X khác"
  const displayItems = applyFor.slice(0, 2)
  const remainingCount = applyFor.length - 2

  return (
    <div className='flex flex-wrap items-center gap-1 max-w-[200px]'>
      {displayItems.map((item, index) => {
        const config = getBadgeConfig(item)

        return (
          <Badge
            key={index}
            variant={config.variant}
            className={`text-xs font-medium transition-colors ${config.className}`}
          >
            {config.label}
          </Badge>
        )
      })}

      {remainingCount > 0 && (
        <Badge variant='outline' className='text-xs font-medium bg-gray-50 text-gray-600 border-gray-300'>
          +{remainingCount} khác
        </Badge>
      )}

      {applyFor.length === 0 && <span className='text-xs text-muted-foreground italic'>Chưa áp dụng</span>}
    </div>
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
      const applyFor = row.getValue('applyFor') as string[]
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
