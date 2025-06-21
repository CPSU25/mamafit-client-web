import { ColumnDef } from '@tanstack/react-table'
import { cn } from '@/lib/utils/utils'
import { Badge } from '@/components/ui/badge'
import { Checkbox } from '@/components/ui/checkbox'
import { Button } from '@/components/ui/button'
import { Package, Edit, Trash2, MoreHorizontal } from 'lucide-react'
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuTrigger
} from '@/components/ui/dropdown-menu'
import { CategoryType } from '@/@types/inventory.type'
import { DataTableColumnHeader } from '../../components/data-table-column-header'
import LongText from '@/components/long-text'
import dayjs from 'dayjs'

// Component để hiển thị hình ảnh category
function CategoryImage({ src, alt, count }: { src: string; alt: string; count: number }) {
  if (!src) {
    return (
      <div className='w-12 h-12 rounded-lg bg-gray-100 flex items-center justify-center'>
        <Package className='h-6 w-6 text-gray-400' aria-hidden="true" />
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
        <Package className='h-6 w-6 text-gray-400' aria-hidden="true" />
      </div>
      {count > 1 && (
        <Badge variant='secondary' className='text-xs'>
          +{count - 1}
        </Badge>
      )}
    </div>
  )
}

interface CreateColumnsProps {
  onEditCategory?: (category: CategoryType) => void
  onDeleteCategory?: (category: CategoryType) => void
}

export const createColumns = ({ onEditCategory, onDeleteCategory }: CreateColumnsProps = {}): ColumnDef<CategoryType>[] => [
  {
    id: 'select',
    header: ({ table }) => (
      <div data-action-button="true">
        <Checkbox
          checked={table.getIsAllPageRowsSelected() || (table.getIsSomePageRowsSelected() && 'indeterminate')}
          onCheckedChange={(value) => table.toggleAllPageRowsSelected(!!value)}
          aria-label='Chọn tất cả'
          className='translate-y-[2px]'
          onClick={(e) => e.stopPropagation()}
        />
      </div>
    ),
    meta: {
      className: cn(
        'sticky left-0 z-10 w-[50px]',
        'bg-background transition-colors duration-200 group-hover/row:bg-muted group-data-[state=selected]/row:bg-muted'
      )
    },
    cell: ({ row }) => (
      <div data-action-button="true">
        <Checkbox
          checked={row.getIsSelected()}
          onCheckedChange={(value) => row.toggleSelected(!!value)}
          aria-label={`Chọn hàng ${row.getValue('name')}`}
          className='translate-y-[2px]'
          onClick={(e) => e.stopPropagation()}
        />
      </div>
    ),
    enableSorting: false,
    enableHiding: false
  },
  {
    accessorKey: 'name',
    header: ({ column }) => <DataTableColumnHeader column={column} title='Tên Danh Mục' />,
    cell: ({ row }) => (
      <div className='font-medium text-gray-900'>
        <LongText className='max-w-48'>{row.getValue('name')}</LongText>
      </div>
    ),
    meta: {
      className: cn(
        'sticky left-[50px] min-w-[200px]',
        'bg-background transition-colors duration-200 group-hover/row:bg-muted group-data-[state=selected]/row:bg-muted'
      )
    },
    enableHiding: false
  },
  {
    accessorKey: 'description',
    header: ({ column }) => <DataTableColumnHeader column={column} title='Mô Tả' />,
    cell: ({ row }) => {
      const description = row.getValue('description') as string
      return (
        <div className='text-gray-600 max-w-xs'>
          <LongText className='max-w-xs'>
            {description || '-'}
          </LongText>
        </div>
      )
    },
    meta: { className: 'min-w-[300px]' }
  },
  {
    accessorKey: 'images',
    header: ({ column }) => <DataTableColumnHeader column={column} title='Hình Ảnh' />,
    cell: ({ row }) => {
      const images = row.getValue('images') as string[]
      const categoryName = row.getValue('name') as string
      
      if (!images || images.length === 0) {
        return (
          <div className='w-12 h-12 rounded-lg bg-gray-100 flex items-center justify-center'>
            <Package className='h-6 w-6 text-gray-400' aria-hidden="true" />
          </div>
        )
      }

      return <CategoryImage src={images[0]} alt={categoryName} count={images.length} />
    },
    enableSorting: false,
    meta: { className: 'w-[120px]' }
  },
  {
    accessorKey: 'createdAt',
    header: ({ column }) => <DataTableColumnHeader column={column} title='Ngày Tạo' />,
    cell: ({ row }) => {
      const date = row.getValue('createdAt') as string
      return (
        <div className='text-gray-600 text-sm'>
          {dayjs(date).format('DD/MM/YYYY')}
        </div>
      )
    },
    meta: { className: 'w-[120px]' }
  },
  {
    id: 'actions',
    cell: ({ row }) => {
      const category = row.original

      const handleEdit = (e: React.MouseEvent) => {
        e.stopPropagation()
        onEditCategory?.(category)
      }

      const handleDelete = (e: React.MouseEvent) => {
        e.stopPropagation()
        onDeleteCategory?.(category)
      }

      return (
        <div data-action-button="true">
          <DropdownMenu>
            <DropdownMenuTrigger asChild>
              <Button
                variant='ghost'
                className='h-8 w-8 p-0'
                onClick={(e) => e.stopPropagation()}
                data-action-button="true"
                aria-label={`Mở menu cho ${category.name}`}
              >
                <span className='sr-only'>Mở menu</span>
                <MoreHorizontal className='h-4 w-4' aria-hidden="true" />
              </Button>
            </DropdownMenuTrigger>
            <DropdownMenuContent 
              align='end' 
              className='w-[160px]'
              onClick={(e) => e.stopPropagation()}
            >
              <DropdownMenuItem onClick={handleEdit}>
                <Edit className='h-4 w-4 mr-2' aria-hidden="true" />
                Chỉnh sửa
              </DropdownMenuItem>
              <DropdownMenuItem
                onClick={handleDelete}
                className='text-red-600 focus:text-red-600 hover:text-red-600'
              >
                <Trash2 className='h-4 w-4 mr-2' aria-hidden="true" />
                Xóa
              </DropdownMenuItem>
            </DropdownMenuContent>
          </DropdownMenu>
        </div>
      )
    },
    meta: { className: 'w-[80px]' }
  }
]

// Default columns export for backward compatibility
export const columns = createColumns() 