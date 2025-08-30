import { Edit, MoreHorizontal, Trash } from 'lucide-react'
import { Row } from '@tanstack/react-table'
import { Button } from '@/components/ui/button'
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuSeparator,
  DropdownMenuShortcut,
  DropdownMenuTrigger
} from '@/components/ui/dropdown-menu'
import { PositionSchema } from '../data/schema'
import { useAddOn } from '../context/add-on-context'

interface PositionTableRowActionsProps {
  row: Row<PositionSchema>
}

export function PositionTableRowActions({ row }: PositionTableRowActionsProps) {
  const { setOpen, setCurrentPosition } = useAddOn()

  return (
    <DropdownMenu modal={false}>
      <DropdownMenuTrigger asChild>
        <Button variant='ghost' className='data-[state=open]:bg-muted flex h-8 w-8 p-0'>
          <MoreHorizontal className='h-4 w-4' />
          <span className='sr-only'>Open menu</span>
        </Button>
      </DropdownMenuTrigger>
      <DropdownMenuContent align='end' className='w-[160px]'>
        <DropdownMenuItem
          onClick={() => {
            setCurrentPosition(row.original)
            setOpen('edit-position')
          }}
        >
          <Edit className='mr-2 h-4 w-4' />
          Chỉnh sửa
          <DropdownMenuShortcut>⌘E</DropdownMenuShortcut>
        </DropdownMenuItem>
        <DropdownMenuSeparator />
        <DropdownMenuItem
          onClick={() => {
            setCurrentPosition(row.original)
            setOpen('delete-position')
          }}
          className='text-destructive focus:text-destructive'
        >
          <Trash className='mr-2 h-4 w-4' />
          Xóa
          <DropdownMenuShortcut>⌘D</DropdownMenuShortcut>
        </DropdownMenuItem>
      </DropdownMenuContent>
    </DropdownMenu>
  )
}
