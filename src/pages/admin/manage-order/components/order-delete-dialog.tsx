import { OrderType } from '@/@types/admin.types'
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

interface OrderDeleteDialogProps {
  open: boolean
  onOpenChange: (open: boolean) => void
  order: OrderType | null
}

export function OrderDeleteDialog({ open, onOpenChange, order }: OrderDeleteDialogProps) {
  if (!order) return null

  const handleDelete = () => {
    // TODO: Implement delete logic
    console.log('Deleting order:', order.id)
    onOpenChange(false)
  }

  return (
    <AlertDialog open={open} onOpenChange={onOpenChange}>
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
