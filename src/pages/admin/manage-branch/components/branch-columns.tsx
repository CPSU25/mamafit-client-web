import { ColumnDef } from '@tanstack/react-table'
import { cn } from '@/lib/utils/utils'
import { Checkbox } from '@/components/ui/checkbox'
import { Branch } from '../data/schema'
import { DataTableColumnHeader } from '../../components/data-table-column-header'
import { BranchTableRowActions } from './branch-table-row-action'
import LongText from '@/components/long-text'
import { BranchManagerType } from '@/@types/branch.type'
import { ImageViewer } from '@/components/ui/image-viewer'

export const columns: ColumnDef<Branch>[] = [
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
    accessorKey: 'name',
    header: ({ column }) => <DataTableColumnHeader column={column} title='Tên chi nhánh' />,
    cell: ({ row }) => <LongText className='max-w-36 font-medium'>{row.getValue('name')}</LongText>,
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
    accessorKey: 'images',
    header: ({ column }) => <DataTableColumnHeader column={column} title='Hình ảnh' />,
    cell: ({ row }) => {
      const branch = row.original
      const firstImage = branch.images && branch.images.length > 0 ? branch.images[0] : null

      if (!firstImage) {
        return (
          <div className='w-16 h-16 rounded-lg border-2 border-dashed border-gray-300 flex items-center justify-center bg-gray-50'>
            <span className='text-xs text-gray-400'>Không có ảnh</span>
          </div>
        )
      }

      return (
        <ImageViewer
          src={firstImage}
          alt={`Hình ảnh chi nhánh ${branch.name}`}
          containerClassName='w-16 h-16 rounded-lg border-2 border-violet-200 dark:border-violet-700 bg-background'
          imgClassName='p-1'
          fit='cover'
          title={`Hình ảnh chi nhánh ${branch.name}`}
        />
      )
    },
    enableSorting: false,
    meta: { className: 'w-20' }
  },
  {
    id: 'address',
    header: 'Địa chỉ',
    cell: ({ row }) => {
      const branch = row.original
      const address = [branch.street, branch.ward, branch.district, branch.province].filter(Boolean).join(', ')
      return <LongText className='max-w-64 text-sm'>{address || 'Chưa có địa chỉ'}</LongText>
    },
    enableSorting: false,
    meta: { className: 'min-w-[200px] max-w-[300px]' }
  },
  {
    accessorKey: 'description',
    header: ({ column }) => <DataTableColumnHeader column={column} title='Mô tả' />,
    cell: ({ row }) => {
      const value = row.getValue('description') as string
      return <LongText className='max-w-48'>{value || 'Chưa có mô tả'}</LongText>
    },
    meta: { className: 'min-w-[160px] max-w-[200px]' }
  },
  {
    id: 'operatingHours',
    header: 'Giờ hoạt động',
    cell: ({ row }) => {
      const branch = row.original
      return (
        <div className='text-sm space-y-1'>
          <div className='font-medium'>
            {branch.openingHour} - {branch.closingHour}
          </div>
          <div className='text-muted-foreground text-xs'>Hàng ngày</div>
        </div>
      )
    },
    enableSorting: false,
    meta: { className: 'w-fit text-nowrap' }
  },
  {
    accessorKey: 'branchManager',
    header: ({ column }) => <DataTableColumnHeader column={column} title='Quản lý chi nhánh' />,
    cell: ({ row }) => {
      const branchManager: BranchManagerType = row.getValue('branchManager')
      return (
        <div className='flex flex-col space-y-1 min-w-[180px]'>
          <span className='font-medium text-sm'>{branchManager.fullName}</span>
          <span className='text-xs text-muted-foreground'>{branchManager.userEmail}</span>
          <span className='text-xs text-muted-foreground'>{branchManager.phoneNumber}</span>
        </div>
      )
    },
    enableSorting: false,
    enableHiding: false,
    meta: { className: 'min-w-[180px]' }
  },
  {
    id: 'actions',
    cell: BranchTableRowActions
  }
]
