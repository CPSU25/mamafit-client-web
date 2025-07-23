import { useOrders } from '../contexts/order-context'
import { OrderDetailDialog } from './order-detail-dialog'
import { OrderUpdateStatusDialog } from './order-update-status-dialog'
import { OrderDeleteDialog } from './order-delete-dialog'
import { OrderAssignTaskDialog } from './order-assign-task-dialog'

export function OrderDialogs() {
  const { open, setOpen, currentRow } = useOrders()

  return (
    <>
      <OrderDetailDialog
        open={open === 'view' || open === 'edit'}
        onOpenChange={(isOpen: boolean) => !isOpen && setOpen(null)}
        order={currentRow}
        mode={open === 'edit' ? 'edit' : 'view'}
      />

      <OrderUpdateStatusDialog
        open={open === 'update'}
        onOpenChange={(isOpen: boolean) => !isOpen && setOpen(null)}
        order={currentRow}
      />

      <OrderDeleteDialog
        open={open === 'delete'}
        onOpenChange={(isOpen: boolean) => !isOpen && setOpen(null)}
        order={currentRow}
      />

      <OrderAssignTaskDialog
        open={open === 'assign-task'}
        onOpenChange={(isOpen: boolean) => !isOpen && setOpen(null)}
        order={currentRow}
      />
    </>
  )
}
