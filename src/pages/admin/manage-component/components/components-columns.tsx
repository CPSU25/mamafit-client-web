import { ColumnDef } from '@tanstack/react-table'
import { Badge } from '@/components/ui/badge'
import { Package } from 'lucide-react'
import { Component } from '../data/schema'
import LongText from '@/components/long-text'
import dayjs from 'dayjs'
import { cn } from '@/lib/utils/utils'
import { Checkbox } from '@/components/ui/checkbox'
import { DataTableColumnHeader } from '../../components/data-table-column-header'
import { ComponentTableRowActions } from './component-row-action'

// Component để hiển thị hình ảnh component
function ComponentImage({ src, alt, count }: { src: string; alt: string; count: number }) {
  if (!src) {
    return (
      <div className='w-12 h-12 rounded-lg bg-muted flex items-center justify-center'>
        <Package className='h-6 w-6 text-muted-foreground' />
      </div>
    )
  }

  return (
    <div className='flex items-center gap-2'>
      <img
        src={src}
        alt={alt}
        className='w-12 h-12 rounded-lg object-cover border-2 border-border'
        onError={(e) => {
          const target = e.target as HTMLImageElement
          target.style.display = 'none'
          target.nextElementSibling?.classList.remove('hidden')
        }}
      />
      <div className='w-12 h-12 rounded-lg bg-muted flex items-center justify-center hidden'>
        <Package className='h-6 w-6 text-muted-foreground' />
      </div>
      {count > 1 && (
        <Badge variant='secondary' className='text-xs'>
          +{count - 1}
        </Badge>
      )}
    </div>
  )
}

export const columns: ColumnDef<Component>[] = [
  {
    id: 'select',
    header: ({ table }) => (
      <Checkbox
        checked={table.getIsAllPageRowsSelected() || (table.getIsSomePageRowsSelected() && 'indeterminate')}
        onCheckedChange={(value) => table.toggleAllPageRowsSelected(!!value)}
        aria-label='Chọn tất cả'
        className='translate-y-[2px]'
        data-action-button='true'
      />
    ),
    meta: {
      className: cn(
        'sticky md:table-cell left-12 z-10 rounded-tl w-12',
        'bg-background transition-colors duration-200 group-hover/row:bg-muted group-data-[state=selected]/row:bg-muted'
      )
    },
    cell: ({ row }) => (
      <Checkbox
        checked={row.getIsSelected()}
        onCheckedChange={(value) => row.toggleSelected(!!value)}
        aria-label='Chọn dòng'
        className='translate-y-[2px]'
        data-action-button='true'
      />
    ),
    enableSorting: false,
    enableHiding: false
  },
  {
    accessorKey: 'name',
    header: ({ column }) => <DataTableColumnHeader column={column} title='Tên thành phần' />,
    cell: ({ row }) => <LongText className='max-w-36'>{row.getValue('name')}</LongText>,
    meta: {
      className: cn(
        'drop-shadow-[0_1px_2px_rgb(0_0_0_/_0.1)] dark:drop-shadow-[0_1px_2px_rgb(255_255_255_/_0.1)] lg:drop-shadow-none',
        'bg-background transition-colors duration-200 group-hover/row:bg-muted group-data-[state=selected]/row:bg-muted',
        'sticky left-24 md:table-cell'
      )
    },
    enableHiding: true
  },
  {
    accessorKey: 'description',
    header: ({ column }) => <DataTableColumnHeader column={column} title='Mô tả' />,
    cell: ({ row }) => {
      const description = row.getValue('description') as string
      return <LongText className='max-w-xs'>{description || '-'}</LongText>
    },
    meta: {
      className: cn(
        'drop-shadow-[0_1px_2px_rgb(0_0_0_/_0.1)] dark:drop-shadow-[0_1px_2px_rgb(255_255_255_/_0.1)] lg:drop-shadow-none',
        'bg-background transition-colors duration-200 group-hover/row:bg-muted group-data-[state=selected]/row:bg-muted',
        'sticky left-6 md:table-cell'
      )
    },
    enableHiding: true
  },
  {
    accessorKey: 'images',
    header: ({ column }) => <DataTableColumnHeader column={column} title='Hình ảnh' />,
    cell: ({ row }) => {
      const images = row.getValue('images') as string[]
      const componentName = row.getValue('name') as string

      if (!images || images.length === 0) {
        return <Package className='h-6 w-6 text-muted-foreground' />
      }

      return <ComponentImage src={images[0]} alt={componentName} count={images.length} />
    },
    enableSorting: false,
    enableHiding: true
  },
  {
    accessorKey: 'globalStatus',
    header: ({ column }) => <DataTableColumnHeader column={column} title='Trạng thái' />,
    cell: ({ row }) => {
      const status = row.getValue('globalStatus') as string
      return (
        <Badge variant={status === 'ACTIVE' ? 'default' : 'secondary'}>
          {status === 'ACTIVE' ? 'Đang hoạt động' : 'Tạm ngưng'}
        </Badge>
      )
    },
    enableSorting: false,
    enableHiding: true
  },
  {
    accessorKey: 'createdAt',
    header: ({ column }) => <DataTableColumnHeader column={column} title='Ngày tạo' />,
    cell: ({ row }) => {
      const date = row.getValue('createdAt') as string
      return <div className='text-muted-foreground text-sm'>{dayjs(date).format('DD/MM/YYYY')}</div>
    },
    enableSorting: false,
    enableHiding: true
  },
  {
    id: 'actions',
    cell: ({ row }) => (
      <div data-action-button='true'>
        <ComponentTableRowActions row={row} />
      </div>
    )
  }
]
