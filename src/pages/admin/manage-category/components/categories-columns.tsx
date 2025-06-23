import { ColumnDef } from '@tanstack/react-table'
import { Badge } from '@/components/ui/badge'
import { Package } from 'lucide-react'
import { Category } from '../data/schema'
import LongText from '@/components/long-text'
import dayjs from 'dayjs'
import { cn } from '@/lib/utils/utils'
import { Checkbox } from '@/components/ui/checkbox'
import { DataTableColumnHeader } from '../../components/data-table-column-header'
import { CategoryTableRowActions } from './category-row-action'

// Component để hiển thị hình ảnh category
function CategoryImage({ src, alt, count }: { src: string; alt: string; count: number }) {
  if (!src) {
    return (
      <div className='w-12 h-12 rounded-lg bg-gray-100 flex items-center justify-center'>
        <Package className='h-6 w-6 text-gray-400' />
      </div>
    )
  }

  return (
    <div className='flex items-center gap-2'>
      <img
        src={src}
        alt={alt}
        className='w-12 h-12 rounded-lg object-cover border-2 border-gray-100'
        onError={(e) => {
          const target = e.target as HTMLImageElement
          target.style.display = 'none'
          target.nextElementSibling?.classList.remove('hidden')
        }}
      />
      <div className='w-12 h-12 rounded-lg bg-gray-100 flex items-center justify-center hidden'>
        <Package className='h-6 w-6 text-gray-400' />
      </div>
      {count > 1 && (
        <Badge variant='secondary' className='text-xs'>
          +{count - 1}
        </Badge>
      )}
    </div>
  )
}

// // Actions cell component
// function ActionsCell({ category }: { category: Category }) {
//   const { setOpen, setCurrentRow } = useCategories()

//   const handleEdit = (e: React.MouseEvent) => {
//     e.stopPropagation()
//     setCurrentRow(category)
//     setOpen('edit')
//   }

//   const handleDelete = (e: React.MouseEvent) => {
//     e.stopPropagation()
//     setCurrentRow(category)
//     setOpen('delete')
//   }

//   return (
//     <DropdownMenu>
//       <DropdownMenuTrigger asChild>
//         <Button variant='ghost' className='h-8 w-8 p-0'>
//           <span className='sr-only'>Mở menu</span>
//           <MoreHorizontal className='h-4 w-4' />
//         </Button>
//       </DropdownMenuTrigger>
//       <DropdownMenuContent align='end' className='w-[160px]'>
//         <DropdownMenuItem onClick={handleEdit}>
//           <Edit className='h-4 w-4 mr-2' />
//           Chỉnh sửa
//         </DropdownMenuItem>
//         <DropdownMenuItem
//           onClick={handleDelete}
//           className='text-red-600 focus:text-red-600 hover:text-red-600'
//         >
//           <Trash2 className='h-4 w-4 mr-2' />
//           Xóa
//         </DropdownMenuItem>
//       </DropdownMenuContent>
//     </DropdownMenu>
//   )
// }

export const columns: ColumnDef<Category>[] = [
  {
    id: 'select',
    header: ({ table }) => (
      <Checkbox
        checked={table.getIsAllPageRowsSelected() || (table.getIsSomePageRowsSelected() && 'indeterminate')}
        onCheckedChange={(value) => table.toggleAllPageRowsSelected(!!value)}
        aria-label='Select all'
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
        aria-label='Select row'
        className='translate-y-[2px]'
        data-action-button='true'
      />
    ),
    enableSorting: false,
    enableHiding: false
  },
  {
    accessorKey: 'name',
    header: ({ column }) => <DataTableColumnHeader column={column} title='Category Name' />,
    cell: ({ row }) => <LongText className='max-w-36'>{row.getValue('name')}</LongText>,
    meta: {
      className: cn(
        'drop-shadow-[0_1px_2px_rgb(0_0_0_/_0.1)] dark:drop-shadow-[0_1px_2px_rgb(255_255_255_/_0.1)] lg:drop-shadow-none',
        'bg-background transition-colors duration-200 group-hover/row:bg-muted group-data-[state=selected]/row:bg-muted',
        'sticky left-24 md:table-cell'
      )
    },
    enableHiding: false
  },
  {
    accessorKey: 'description',
    header: ({ column }) => <DataTableColumnHeader column={column} title='Description' />,
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
    enableHiding: false
  },
  {
    accessorKey: 'images',
    header: ({ column }) => <DataTableColumnHeader column={column} title='Images' />,
    cell: ({ row }) => {
      const images = row.getValue('images') as string[]
      const categoryName = row.getValue('name') as string

      if (!images || images.length === 0) {
        return <Package className='h-6 w-6 text-gray-400' />
      }

      return <CategoryImage src={images[0]} alt={categoryName} count={images.length} />
    },
    enableSorting: false,
    enableHiding: false
  },
  {
    accessorKey: 'status',
    header: ({ column }) => <DataTableColumnHeader column={column} title='Status' />,
    cell: ({ row }) => {
      const status = row.getValue('status') as string
      return (
        <Badge variant={status === 'active' ? 'default' : 'secondary'}>
          {status === 'active' ? 'Active' : 'Inactive'}
        </Badge>
      )
    },
    enableSorting: false,
    enableHiding: false
  },
  {
    accessorKey: 'createdAt',
    header: ({ column }) => <DataTableColumnHeader column={column} title='Created At' />,
    cell: ({ row }) => {
      const date = row.getValue('createdAt') as string
      return <div className='text-gray-600 text-sm'>{dayjs(date).format('DD/MM/YYYY')}</div>
    },
    enableSorting: false,
    enableHiding: false
  },
  {
    id: 'actions',
    cell: ({ row }) => (
      <div data-action-button='true'>
        <CategoryTableRowActions row={row} />
      </div>
    )
  }
]
