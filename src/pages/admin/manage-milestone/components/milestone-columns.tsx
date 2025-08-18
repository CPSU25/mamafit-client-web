// milestone-columns.tsx - Enhanced Table Columns
import { ColumnDef } from '@tanstack/react-table'
import { Badge } from '@/components/ui/badge'
import { FileText, Calendar } from 'lucide-react'
import { Milestone } from '../data/schema'
import LongText from '@/components/long-text'
import dayjs from 'dayjs'
import relativeTime from 'dayjs/plugin/relativeTime'
dayjs.extend(relativeTime)
import { cn } from '@/lib/utils/utils'
import { Checkbox } from '@/components/ui/checkbox'
import { DataTableColumnHeader } from '../../components/data-table-column-header'
import { MilestoneTableRowActions } from './milestone-row-action'
import { Avatar, AvatarFallback } from '@/components/ui/avatar'
import { Tooltip, TooltipContent, TooltipProvider, TooltipTrigger } from '@/components/ui/tooltip'

export const columns: ColumnDef<Milestone>[] = [
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
        'sticky md:table-cell left-12 z-10 rounded-tl w-12',
        'bg-background transition-colors duration-200 group-hover/row:bg-emerald-50/50 dark:group-hover/row:bg-emerald-950/20 group-data-[state=selected]/row:bg-emerald-50 dark:group-data-[state=selected]/row:bg-emerald-950/30'
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
    accessorKey: 'sequenceOrder',
    header: ({ column }) => (
      <DataTableColumnHeader
        column={column}
        title='Thứ Tự'
        className='text-violet-700 dark:text-violet-300 font-semibold'
      />
    ),
    cell: ({ row }) => {
      const sequenceOrder = row.getValue('sequenceOrder') as number
      return (
        <div className='flex items-center gap-2'>
          <div className='h-8 w-8 rounded-lg bg-gradient-to-br from-violet-500 to-violet-600 flex items-center justify-center shadow-sm'>
            <span className='text-white font-bold text-sm'>{sequenceOrder}</span>
          </div>
        </div>
      )
    },
    meta: {
      className: cn(
        'drop-shadow-[0_1px_2px_rgb(0_0_0_/_0.1)] dark:drop-shadow-[0_1px_2px_rgb(255_255_255_/_0.1)] lg:drop-shadow-none',
        'bg-background transition-colors duration-200 group-hover/row:bg-emerald-50/50 dark:group-hover/row:bg-emerald-950/20 group-data-[state=selected]/row:bg-emerald-50 dark:group-data-[state=selected]/row:bg-emerald-950/30'
      )
    },
    enableSorting: true,
    enableHiding: false
  },
  {
    accessorKey: 'name',
    header: ({ column }) => (
      <DataTableColumnHeader
        column={column}
        title='Tên Mốc Nhiệm Vụ'
        className='text-violet-700 dark:text-violet-300 font-semibold'
      />
    ),
    cell: ({ row }) => {
      const name = row.getValue('name') as string

      return (
        <div className='flex items-center '>
          <div className='flex flex-col'>
            <span className='font-semibold text-foreground'>{name}</span>
          </div>
        </div>
      )
    },
    meta: {
      className: cn(
        'drop-shadow-[0_1px_2px_rgb(0_0_0_/_0.1)] dark:drop-shadow-[0_1px_2px_rgb(255_255_255_/_0.1)] lg:drop-shadow-none',
        'bg-background transition-colors duration-200 group-hover/row:bg-emerald-50/50 dark:group-hover/row:bg-emerald-950/20 group-data-[state=selected]/row:bg-emerald-50 dark:group-data-[state=selected]/row:bg-emerald-950/30',
        'sticky left-24 md:table-cell'
      )
    },
    enableSorting: true,
    enableHiding: false
  },
  {
    accessorKey: 'description',
    header: ({ column }) => (
      <DataTableColumnHeader column={column} title='Mô Tả' className='text-violet-700 dark:text-violet-300' />
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
        <TooltipProvider>
          <Tooltip>
            <TooltipTrigger asChild>
              <div className='max-w-xs'>
                <LongText className='text-sm line-clamp-2'>{description}</LongText>
              </div>
            </TooltipTrigger>
            <TooltipContent className='max-w-sm'>
              <p className='text-sm'>{description}</p>
            </TooltipContent>
          </Tooltip>
        </TooltipProvider>
      )
    },
    meta: {
      className: cn(
        'drop-shadow-[0_1px_2px_rgb(0_0_0_/_0.1)] dark:drop-shadow-[0_1px_2px_rgb(255_255_255_/_0.1)] lg:drop-shadow-none',
        'bg-background transition-colors duration-200 group-hover/row:bg-emerald-50/50 dark:group-hover/row:bg-emerald-950/20 group-data-[state=selected]/row:bg-emerald-50 dark:group-data-[state=selected]/row:bg-emerald-950/30'
      )
    },
    enableSorting: false
  },
  {
    accessorKey: 'applyFor',
    header: ({ column }) => (
      <DataTableColumnHeader column={column} title='Áp Dụng Cho' className='text-violet-700 dark:text-violet-300' />
    ),
    cell: ({ row }) => {
      const applyFor = row.getValue('applyFor') as string[]

      const getBadgeConfig = (type: string) => {
        const configs = {
          READY_TO_BUY: {
            variant: 'default' as const,
            className: 'bg-gradient-to-r from-green-500 to-green-600 text-white border-0 shadow-sm',
            label: 'Sẵn sàng mua'
          },
          PRESET: {
            variant: 'secondary' as const,
            className: 'bg-gradient-to-r from-blue-500 to-blue-600 text-white border-0 shadow-sm',
            label: 'Mẫu có sẵn'
          },
          DESIGN_REQUEST: {
            variant: 'outline' as const,
            className: 'bg-gradient-to-r from-orange-500 to-orange-600 text-white border-0 shadow-sm',
            label: 'Yêu cầu thiết kế'
          },
          WARRANTY: {
            variant: 'outline' as const,
            className: 'bg-gradient-to-r from-purple-500 to-purple-600 text-white border-0 shadow-sm',
            label: 'Bảo hành'
          },
          ADD_ON: {
            variant: 'outline' as const,
            className: 'bg-gradient-to-r from-pink-500 to-pink-600 text-white border-0 shadow-sm',
            label: 'Dịch vụ thêm'
          },
          QC_FAIL: {
            variant: 'outline' as const,
            className: 'bg-gradient-to-r from-red-500 to-red-600 text-white border-0 shadow-sm',
            label: 'QC thất bại'
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

      // Hiển thị tối đa 2 items đầu + số lượng còn lại
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
                className={`text-xs font-medium transition-all duration-200 hover:scale-105 ${config.className}`}
              >
                {config.label}
              </Badge>
            )
          })}

          {remainingCount > 0 && (
            <Badge
              variant='outline'
              className='text-xs font-medium bg-violet-50 text-violet-700 border-violet-300 dark:bg-violet-950/30 dark:text-violet-400'
            >
              +{remainingCount} khác
            </Badge>
          )}

          {applyFor.length === 0 && (
            <span className='text-xs text-muted-foreground italic flex items-center gap-1'>
              <FileText className='h-3 w-3' />
              Chưa áp dụng
            </span>
          )}
        </div>
      )
    },
    enableSorting: true,
    filterFn: (row, id, value) => {
      const applyForArray = row.getValue(id) as string[]
      // Check if any of the selected filter values exist in the applyFor array
      return value.some((filterValue: string) => applyForArray.includes(filterValue))
    }
  },
  {
    accessorKey: 'createdAt',
    header: ({ column }) => (
      <DataTableColumnHeader column={column} title='Ngày Tạo' className='text-violet-700 dark:text-violet-300' />
    ),
    cell: ({ row }) => {
      const date = row.getValue('createdAt') as string
      const formattedDate = dayjs(date).format('DD/MM/YYYY')
      const relativeTime = dayjs(date).fromNow()

      return (
        <TooltipProvider>
          <Tooltip>
            <TooltipTrigger asChild>
              <div className='flex items-center gap-2 text-sm'>
                <Calendar className='h-4 w-4 text-violet-500' />
                <span className='font-medium'>{formattedDate}</span>
              </div>
            </TooltipTrigger>
            <TooltipContent>
              <p className='text-xs'>{relativeTime}</p>
            </TooltipContent>
          </Tooltip>
        </TooltipProvider>
      )
    },
    enableSorting: true
  },
  {
    accessorKey: 'createdBy',
    header: ({ column }) => (
      <DataTableColumnHeader column={column} title='Người Tạo' className='text-violet-700 dark:text-violet-300' />
    ),
    cell: ({ row }) => {
      const createdBy = row.getValue('createdBy') as string
      const initials = createdBy
        .split(' ')
        .map((word) => word.charAt(0))
        .join('')
        .toUpperCase()
        .slice(0, 2)

      return (
        <div className='flex items-center gap-2'>
          <Avatar className='h-8 w-8 border border-violet-200 dark:border-violet-800'>
            <AvatarFallback className='bg-violet-100 dark:bg-violet-900/30 text-violet-700 dark:text-violet-400 text-xs font-medium'>
              {initials}
            </AvatarFallback>
          </Avatar>
          <span className='text-sm font-medium'>{createdBy}</span>
        </div>
      )
    },
    enableSorting: true
  },
  {
    id: 'actions',
    cell: ({ row }) => (
      <div data-action-button='true'>
        <MilestoneTableRowActions row={row} />
      </div>
    )
  }
]
