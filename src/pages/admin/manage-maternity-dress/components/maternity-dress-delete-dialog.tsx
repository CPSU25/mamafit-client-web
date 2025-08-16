import {
  AlertDialog,
  AlertDialogAction,
  AlertDialogCancel,
  AlertDialogContent,
  AlertDialogDescription,
  AlertDialogFooter,
  AlertDialogHeader,
  AlertDialogTitle
} from '@/components/ui/alert-dialog'
import { Loader2, AlertTriangle } from 'lucide-react'

import { MaternityDress } from '../data/schema'
import { useDeleteMaternityDress } from '@/services/admin/maternity-dress.service'

interface MaternityDressDeleteDialogProps {
  open: boolean
  onOpenChange: (open: boolean) => void
  currentRow: MaternityDress
}

export function MaternityDressDeleteDialog({ open, onOpenChange, currentRow }: MaternityDressDeleteDialogProps) {
  const deleteMutation = useDeleteMaternityDress()

  const handleDelete = async () => {
    try {
      await deleteMutation.mutateAsync(currentRow.id)
      onOpenChange(false)
    } catch (error) {
      console.error('Delete error:', error)
    }
  }

  return (
    <AlertDialog open={open} onOpenChange={onOpenChange}>
      <AlertDialogContent>
        <AlertDialogHeader>
          <AlertDialogTitle className='flex items-center gap-2 text-destructive'>
            <AlertTriangle className='h-5 w-5' />
            Xác nhận xóa đầm bầu
          </AlertDialogTitle>
          <AlertDialogDescription className='space-y-2'>
            <p>
              Bạn có chắc chắn muốn xóa đầm bầu <strong>"{currentRow.name}"</strong> không?
            </p>
            <p className='text-sm text-muted-foreground'>
              Hành động này không thể hoàn tác. Đầm bầu sẽ bị xóa vĩnh viễn khỏi hệ thống.
            </p>
          </AlertDialogDescription>
        </AlertDialogHeader>
        <AlertDialogFooter>
          <AlertDialogCancel disabled={deleteMutation.isPending}>Hủy</AlertDialogCancel>
          <AlertDialogAction
            onClick={handleDelete}
            disabled={deleteMutation.isPending}
            className='bg-destructive text-destructive-foreground hover:bg-destructive/90'
          >
            {deleteMutation.isPending && <Loader2 className='mr-2 h-4 w-4 animate-spin' />}
            Xóa
          </AlertDialogAction>
        </AlertDialogFooter>
      </AlertDialogContent>
    </AlertDialog>
  )
}
