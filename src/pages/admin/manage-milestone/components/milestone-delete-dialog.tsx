'use client'
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
import { toast } from 'sonner'
import { Milestone } from '../data/schema'
import { useDeleteMilestone } from '@/services/admin/manage-milestone.service'

interface MilestoneDeleteDialogProps {
  open: boolean
  onOpenChange: (open: boolean) => void
  currentRow: Milestone
}

export function MilestoneDeleteDialog({ open, onOpenChange, currentRow }: MilestoneDeleteDialogProps) {
  const { mutate: deleteMilestone, isPending } = useDeleteMilestone()

  const handleDelete = () => {
    deleteMilestone(currentRow.id, {
      onSuccess: () => {
        toast.success(`Milestone "${currentRow.name}" đã được xóa thành công`)
        onOpenChange(false)
      },
      onError: (error) => {
        toast.error(error.message || 'Có lỗi xảy ra khi xóa milestone')
      }
    })
  }

  return (
    <AlertDialog open={open} onOpenChange={onOpenChange}>
      <AlertDialogContent>
        <AlertDialogHeader>
          <AlertDialogTitle>Xác nhận xóa milestone</AlertDialogTitle>
          <AlertDialogDescription>
            Bạn có chắc chắn muốn xóa milestone "{currentRow.name}"? Hành động này không thể hoàn tác và sẽ xóa tất cả
            các task liên quan.
          </AlertDialogDescription>
        </AlertDialogHeader>
        <AlertDialogFooter>
          <AlertDialogCancel disabled={isPending}>Hủy</AlertDialogCancel>
          <AlertDialogAction
            onClick={handleDelete}
            disabled={isPending}
            className='bg-destructive text-destructive-foreground hover:bg-destructive/90'
          >
            {isPending ? 'Đang xóa...' : 'Xóa'}
          </AlertDialogAction>
        </AlertDialogFooter>
      </AlertDialogContent>
    </AlertDialog>
  )
}
