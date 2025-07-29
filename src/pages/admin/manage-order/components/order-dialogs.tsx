import { useOrders } from '../contexts/order-context'
import { OrderUpdateStatusDialog } from './order-update-status-dialog'
import { OrderDeleteDialog } from './order-delete-dialog'

export function OrderDialogs() {
  const { open, setOpen, currentRow } = useOrders()

  const handleClose = () => setOpen(null)

  return (
    <>
      {open === 'update' && <OrderUpdateStatusDialog open={true} onOpenChange={handleClose} order={currentRow} />}

      {open === 'delete' && <OrderDeleteDialog open={true} onOpenChange={handleClose} order={currentRow} />}
    </>
  )
}
