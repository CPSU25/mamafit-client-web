import { Edit, MoreHorizontal, Trash, Plus } from 'lucide-react'
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
import { AddOn } from '../data/schema'
import { useAddOn } from '../context/add-on-context'

interface AddOnTableRowActionsProps {
  row: Row<AddOn>
}

export function AddOnTableRowActions({ row }: AddOnTableRowActionsProps) {
  const { setOpen, setCurrentAddOn } = useAddOn()

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
            setCurrentAddOn(row.original)
            setOpen('edit-add-on')
          }}
        >
          <Edit className='mr-2 h-4 w-4' />
          Chỉnh sửa
          <DropdownMenuShortcut>⌘E</DropdownMenuShortcut>
        </DropdownMenuItem>
        <DropdownMenuItem
          onClick={() => {
            setCurrentAddOn(row.original)
            setOpen('add-add-on-option')
          }}
        >
          <Plus className='mr-2 h-4 w-4' />
          Thêm Option
          <DropdownMenuShortcut>⌘O</DropdownMenuShortcut>
        </DropdownMenuItem>
        <DropdownMenuSeparator />
        <DropdownMenuItem
          onClick={() => {
            setCurrentAddOn(row.original)
            setOpen('delete-add-on')
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
