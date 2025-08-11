import { useBranchOrders } from '../contexts/branch-order-context'
import { BranchOrderDeleteDialog } from './branch-order-delete-dialog'

export function OrderDialogs() {
  const { open, setOpen, currentRow } = useBranchOrders()

  const handleClose = () => setOpen(null)

  return <>{open === 'delete' && <BranchOrderDeleteDialog open={true} onOpenChange={handleClose} order={currentRow} />}</>
}
