import { useBranchOrders } from '../contexts/branch-order-context'
import { BranchOrderReceiveDialog } from './branch-order-receive-dialog'
import { BranchOrderCompleteDialog } from './branch-order-complete-dialog'

export function OrderDialogs() {
  const { open, setOpen, currentRow } = useBranchOrders()

  const handleClose = () => setOpen(null)

  return (
    <>
      {open === 'receive' && <BranchOrderReceiveDialog open={true} onOpenChange={handleClose} order={currentRow} />}

      {open === 'complete' && <BranchOrderCompleteDialog open={true} onOpenChange={handleClose} order={currentRow} />}
    </>
  )
}
