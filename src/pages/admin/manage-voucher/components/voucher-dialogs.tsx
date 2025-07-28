import { useVoucher } from '../contexts/voucher-context'
import { VoucherBatchFormDialog } from './voucher-action-dialog'
import { VoucherBatchDeleteDialog } from './voucher-delete-dialog'
import { VoucherAssignDialog } from './voucher-assign-dialog'

export function VoucherDialogs() {
  const { open, setOpen, currentVoucherBatch, setCurrentVoucherBatch, currentVoucherDiscount } = useVoucher()

  return (
    <>
      {/* Add Voucher Batch Dialog */}
      <VoucherBatchFormDialog
        key='voucher-batch-add'
        open={open === 'add-batch'}
        onOpenChange={() => setOpen('add-batch')}
      />

      {/* Edit Voucher Batch Dialog */}
      {currentVoucherBatch && (
        <>
          <VoucherBatchFormDialog
            key={`voucher-batch-edit-${currentVoucherBatch.id}`}
            open={open === 'edit-batch'}
            onOpenChange={() => {
              setOpen('edit-batch')
              setTimeout(() => {
                setCurrentVoucherBatch(null)
              }, 500)
            }}
            currentRow={currentVoucherBatch}
          />

          <VoucherBatchDeleteDialog
            key={`voucher-batch-delete-${currentVoucherBatch.id}`}
            open={open === 'delete-batch'}
            onOpenChange={() => {
              setOpen('delete-batch')
              setTimeout(() => {
                setCurrentVoucherBatch(null)
              }, 500)
            }}
            currentRow={currentVoucherBatch}
          />

          <VoucherAssignDialog
            key={`voucher-assign-${currentVoucherBatch.id}`}
            open={open === 'assign-voucher'}
            onOpenChange={() => {
              setOpen('assign-voucher')
              setTimeout(() => {
                setCurrentVoucherBatch(null)
              }, 500)
            }}
            voucherBatch={currentVoucherBatch}
          />
        </>
      )}

      {/* TODO: Add voucher discount dialogs when needed */}
      {currentVoucherDiscount && (
        <>
          {/* Placeholder for voucher discount delete dialog */}
          {/* <VoucherDiscountDeleteDialog
            key={`voucher-discount-delete-${currentVoucherDiscount.id}`}
            open={open === 'delete-discount'}
            onOpenChange={() => {
              setOpen('delete-discount')
              setTimeout(() => {
                setCurrentVoucherDiscount(null)
              }, 500)
            }}
            currentRow={currentVoucherDiscount}
          /> */}
        </>
      )}
    </>
  )
}
