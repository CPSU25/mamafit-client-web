// maternity-dress-columns.tsx - Enhanced Table Columns
import { ColumnDef } from '@tanstack/react-table'
import { Badge } from '@/components/ui/badge'
import { Package, Image, Calendar, FileText } from 'lucide-react'
import { MaternityDress } from '../data/schema'
import dayjs from 'dayjs'
import relativeTime from 'dayjs/plugin/relativeTime'
dayjs.extend(relativeTime)
import { cn } from '@/lib/utils/utils'
import { Checkbox } from '@/components/ui/checkbox'
import { DataTableColumnHeader } from '../../components/data-table-column-header'
import { MaternityDressTableRowActions } from './maternity-dress-row-action'
import { Tooltip, TooltipContent, TooltipProvider, TooltipTrigger } from '@/components/ui/tooltip'
import ExpandableHtmlContent from '@/components/expandable-html-content'

// Helper function để format tiền VNĐ
const formatCurrency = (amount: number): string => {
  return (
    new Intl.NumberFormat('vi-VN', {
      style: 'decimal',
      minimumFractionDigits: 0,
      maximumFractionDigits: 0
    }).format(amount) + ' VNĐ'
  )
}

// Enhanced Maternity Dress Image Component
function MaternityDressImage({ src, alt, count }: { src: string; alt: string; count: number }) {
  if (!src) {
    return (
      <div className='relative group'>
        <div className='w-14 h-14 rounded-xl bg-gradient-to-br from-violet-100 to-violet-50 dark:from-violet-900/30 dark:to-violet-950/30 flex items-center justify-center border-2 border-violet-200 dark:border-violet-800 shadow-sm group-hover:shadow-md transition-all duration-300'>
          <Package className='h-7 w-7 text-violet-500 dark:text-violet-400' />
        </div>
      </div>
    )
  }

  return (
    <div className='flex items-center gap-3'>
      <div className='relative group'>
        <img
          src={src}
          alt={alt}
          className='w-14 h-14 rounded-xl object-cover border-2 border-violet-200 dark:border-violet-800 shadow-md group-hover:shadow-xl group-hover:scale-105 transition-all duration-300'
          onError={(e) => {
            const target = e.target as HTMLImageElement
            target.style.display = 'none'
            target.nextElementSibling?.classList.remove('hidden')
          }}
        />
        <div className='w-14 h-14 rounded-xl bg-gradient-to-br from-violet-100 to-violet-50 dark:from-violet-900/30 dark:to-violet-950/30 items-center justify-center hidden border-2 border-violet-200 dark:border-violet-800'>
          <Package className='h-7 w-7 text-violet-500 dark:text-violet-400' />
        </div>
        {count > 1 && (
          <div className='absolute -top-2 -right-2 bg-gradient-to-r from-violet-500 to-violet-600 text-white text-xs font-bold rounded-full w-6 h-6 flex items-center justify-center shadow-lg'>
            +{count - 1}
          </div>
        )}
      </div>
    </div>
  )
}

export const columns: ColumnDef<MaternityDress>[] = [
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
    accessorKey: 'sku',
    header: ({ column }) => (
      <DataTableColumnHeader
        column={column}
        title='SKU'
        className='text-violet-700 dark:text-violet-300 font-semibold'
      />
    ),
    cell: ({ row }) => {
      const sku = row.getValue('sku') as string

      return (
        <div className='flex items-center gap-2'>
          <div className='flex flex-col'>
            <span className='font-semibold text-foreground'>{sku}</span>
          </div>
        </div>
      )
    },
    meta: {
      className: cn(
        'drop-shadow-[0_1px_2px_rgb(0_0_0_/_0.1)] dark:drop-shadow-[0_1px_2px_rgb(255_255_255_/_0.1)] lg:drop-shadow-none',
        'bg-background transition-colors duration-200 group-hover/row:bg-violet-50/50 dark:group-hover/row:bg-violet-950/20 group-data-[state=selected]/row:bg-violet-50 dark:group-data-[state=selected]/row:bg-violet-950/30',
        'sticky left-24 md:table-cell'
      )
    },
    enableHiding: false
  },
  {
    accessorKey: 'name',
    header: ({ column }) => (
      <DataTableColumnHeader
        column={column}
        title='Tên Đầm Bầu'
        className='text-violet-700 dark:text-violet-300 font-semibold'
      />
    ),
    cell: ({ row }) => {
      const name = row.getValue('name') as string
      return (
        <div className='flex items-center text-center'>
          <div className='flex flex-col'>
            <span
              className='font-semibold text-foreground'
              style={{
                wordBreak: 'break-word',
                overflowWrap: 'break-word',
                maxWidth: '100%'
              }}
            >
              {name}
            </span>
          </div>
        </div>
      )
    },
    meta: {
      className: cn(
        'drop-shadow-[0_1px_2px_rgb(0_0_0_/_0.1)] dark:drop-shadow-[0_1px_2px_rgb(255_255_255_/_0.1)] lg:drop-shadow-none',
        'bg-background transition-colors duration-200 group-hover/row:bg-violet-50/50 dark:group-hover/row:bg-violet-950/20 group-data-[state=selected]/row:bg-violet-50 dark:group-data-[state=selected]/row:bg-violet-950/30',
        'sticky left-24 md:table-cell'
      )
    },
    enableHiding: false
  },
  {
    accessorKey: 'styleName',
    header: ({ column }) => (
      <DataTableColumnHeader
        column={column}
        title='Kiểu dáng'
        className='text-violet-700 dark:text-violet-300 font-md'
      />
    ),
    cell: ({ row }) => {
      const styleName = row.getValue('styleName') as string
      return (
        <div className='flex items-center gap-2'>
          <div className='flex flex-col'>
            <span className='font-md text-foreground'>{styleName}</span>
          </div>
        </div>
      )
    },
    meta: {
      className: cn(
        'drop-shadow-[0_1px_2px_rgb(0_0_0_/_0.1)] dark:drop-shadow-[0_1px_2px_rgb(255_255_255_/_0.1)] lg:drop-shadow-none',
        'bg-background transition-colors duration-200 group-hover/row:bg-violet-50/50 dark:group-hover/row:bg-violet-950/20 group-data-[state=selected]/row:bg-violet-50 dark:group-data-[state=selected]/row:bg-violet-950/30',
        'sticky left-24 md:table-cell'
      )
    },
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
                <ExpandableHtmlContent content={description} maxLength={20} />
              </div>
            </TooltipTrigger>
            <TooltipContent className='max-w-sm'>
              <ExpandableHtmlContent content={description} maxLength={20} />
            </TooltipContent>
          </Tooltip>
        </TooltipProvider>
      )
    },
    meta: {
      className: cn(
        'drop-shadow-[0_1px_2px_rgb(0_0_0_/_0.1)] dark:drop-shadow-[0_1px_2px_rgb(255_255_255_/_0.1)] lg:drop-shadow-none',
        'bg-background transition-colors duration-200 group-hover/row:bg-violet-50/50 dark:group-hover/row:bg-violet-950/20 group-data-[state=selected]/row:bg-violet-50 dark:group-data-[state=selected]/row:bg-violet-950/30',
        'sticky left-6 md:table-cell'
      )
    },
    enableHiding: false
  },
  {
    accessorKey: 'images',
    header: ({ column }) => (
      <DataTableColumnHeader column={column} title='Hình Ảnh' className='text-violet-700 dark:text-violet-300' />
    ),
    cell: ({ row }) => {
      const images = row.getValue('images') as string[]
      const maternityDressName = row.getValue('name') as string

      if (!images || images.length === 0) {
        return (
          <div className='flex items-center gap-2 text-muted-foreground'>
            <Image className='h-5 w-5' />
            <span className='text-sm'>Chưa có</span>
          </div>
        )
      }

      return <MaternityDressImage src={images[0]} alt={maternityDressName} count={images.length} />
    },
    enableSorting: false,
    enableHiding: false
  },
  {
    accessorKey: 'price',
    header: ({ column }) => (
      <DataTableColumnHeader column={column} title='Giá' className='text-violet-700 dark:text-violet-300' />
    ),
    cell: ({ row }) => {
      const price = row.getValue('price') as number

      return (
        <div className='flex items-center gap-2'>
          <span className='font-semibold text-foreground'>{formatCurrency(price)}</span>
        </div>
      )
    },
    enableSorting: true,
    enableHiding: false
  },
  {
    accessorKey: 'globalStatus',
    header: ({ column }) => (
      <DataTableColumnHeader column={column} title='Trạng Thái' className='text-violet-700 dark:text-violet-300' />
    ),
    cell: ({ row }) => {
      const status = (row.getValue('globalStatus') as string) || 'ACTIVE'
      const isActive = status === 'ACTIVE'

      return (
        <div className='flex items-center gap-2'>
          <div className={cn('h-2 w-2 rounded-full', isActive ? 'bg-green-500 animate-pulse' : 'bg-gray-400')} />
          <Badge
            variant={isActive ? 'default' : 'secondary'}
            className={cn(
              'font-semibold',
              isActive
                ? 'bg-gradient-to-r from-green-500 to-green-600 text-white border-0 shadow-sm'
                : 'bg-gray-100 text-gray-600 dark:bg-gray-800 dark:text-gray-400'
            )}
          >
            {isActive ? 'Hoạt động' : 'Không hoạt động'}
          </Badge>
        </div>
      )
    },
    enableSorting: false,
    enableHiding: false
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
    enableSorting: false,
    enableHiding: false
  },
  {
    id: 'actions',
    cell: ({ row }) => (
      <div data-action-button='true'>
        <MaternityDressTableRowActions row={row} />
      </div>
    )
  }
]
