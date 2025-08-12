import { BranchOrderType } from '@/@types/branch-order.types'
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

interface BranchOrderDeleteDialogProps {
  open: boolean
  onOpenChange: (open: boolean) => void
  order: BranchOrderType | null
}

export function BranchOrderDeleteDialog({ open, onOpenChange, order }: BranchOrderDeleteDialogProps) {
  if (!order) return null

  const handleDelete = () => {
    console.log('Deleting order:', order.id)
    onOpenChange(false)
  }

  return (
    <AlertDialog open={open} onOpenChange={(isOpen) => !isOpen && onOpenChange(false)}>
      <AlertDialogContent>
        <AlertDialogHeader>
          <AlertDialogTitle>Xác nhận xóa đơn hàng</AlertDialogTitle>
          <AlertDialogDescription>
            Bạn có chắc chắn muốn xóa đơn hàng <strong>#{order.code}</strong>? Hành động này không thể hoàn tác.
          </AlertDialogDescription>
        </AlertDialogHeader>
        <AlertDialogFooter>
          <AlertDialogCancel>Hủy</AlertDialogCancel>
          <AlertDialogAction onClick={handleDelete} className='bg-destructive hover:bg-destructive/90'>
            Xóa đơn hàng
          </AlertDialogAction>
        </AlertDialogFooter>
      </AlertDialogContent>
    </AlertDialog>
  )
}
