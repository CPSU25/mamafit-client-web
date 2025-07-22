import { Row } from '@tanstack/react-table'
import { Button } from '@/components/ui/button'
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuSeparator,
  DropdownMenuTrigger
} from '@/components/ui/dropdown-menu'
import { Eye, Pencil, Trash2, MoreHorizontal } from 'lucide-react'
import { Milestone } from '../data/schema'
import { useMilestones } from '../context/milestones-context'

interface DataTableRowActionsProps<TData> {
  row: Row<TData>
}

export function MilestoneTableRowActions<TData>({ row }: DataTableRowActionsProps<TData>) {
  const milestone = row.original as Milestone
  const { setOpen, setCurrentRow } = useMilestones()

  const handleView = () => {
    setCurrentRow(milestone)
    // TODO: Add view detail logic here
  }

  const handleEdit = () => {
    setCurrentRow(milestone)
    setOpen('edit')
  }

  const handleDelete = () => {
    setCurrentRow(milestone)
    setOpen('delete')
  }

  return (
    <DropdownMenu modal={false}>
      <DropdownMenuTrigger asChild>
        <Button variant='ghost' className='flex h-8 w-8 p-0 data-[state=open]:bg-muted'>
          <MoreHorizontal className='h-4 w-4' />
          <span className='sr-only'>Open menu</span>
        </Button>
      </DropdownMenuTrigger>
      <DropdownMenuContent align='end' className='w-[160px]'>
        <DropdownMenuItem onClick={handleView}>
          <Eye className='mr-2 h-4 w-4' />
          Xem chi tiết
        </DropdownMenuItem>
        <DropdownMenuItem onClick={handleEdit}>
          <Pencil className='mr-2 h-4 w-4' />
          Chỉnh sửa
        </DropdownMenuItem>
        <DropdownMenuSeparator />
        <DropdownMenuItem onClick={handleDelete} className='text-destructive focus:text-destructive'>
          <Trash2 className='mr-2 h-4 w-4' />
          Xóa
        </DropdownMenuItem>
      </DropdownMenuContent>
    </DropdownMenu>
  )
}
