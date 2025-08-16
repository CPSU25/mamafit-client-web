import { Row } from '@tanstack/react-table'
import { Button } from '@/components/ui/button'
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuSeparator,
  DropdownMenuTrigger
} from '@/components/ui/dropdown-menu'
import { Eye, MoreHorizontal, Pencil, Trash2 } from 'lucide-react'

import { MaternityDress } from '../data/schema'
import { useMaternityDress } from '../context/maternity-dress-context'

interface MaternityDressTableRowActionsProps {
  row: Row<MaternityDress>
}

export function MaternityDressTableRowActions({ row }: MaternityDressTableRowActionsProps) {
  const { setCurrentRow, setOpen } = useMaternityDress()
  const maternityDress = row.original

  const handleEdit = () => {
    setCurrentRow(maternityDress)
    setOpen('edit')
  }

  const handleDelete = () => {
    setCurrentRow(maternityDress)
    setOpen('delete')
  }

  return (
    <DropdownMenu>
      <DropdownMenuTrigger asChild>
        <Button variant='ghost' className='flex h-8 w-8 p-0 data-[state=open]:bg-muted' data-action-button='true'>
          <MoreHorizontal className='h-4 w-4' />
          <span className='sr-only'>Mở menu</span>
        </Button>
      </DropdownMenuTrigger>
      <DropdownMenuContent align='end' className='w-[160px]'>
        <DropdownMenuItem onClick={(e) => e.stopPropagation()}>
          <Eye className='mr-2 h-4 w-4' />
          Xem chi tiết
        </DropdownMenuItem>
        <DropdownMenuItem onClick={handleEdit}>
          <Pencil className='mr-2 h-4 w-4' />
          Chỉnh sửa
        </DropdownMenuItem>
        <DropdownMenuSeparator />
        <DropdownMenuItem onClick={handleDelete} className='text-destructive'>
          <Trash2 className='mr-2 h-4 w-4' />
          Xóa
        </DropdownMenuItem>
      </DropdownMenuContent>
    </DropdownMenu>
  )
}
