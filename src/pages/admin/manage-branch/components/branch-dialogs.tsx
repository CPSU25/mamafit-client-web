import { useBranch } from '../context/branch-context'
import { BranchActionDialog } from './branch-action-dialog'
import { BranchDeleteDialog } from './branch-delete-dialog'

export function BranchDialogs() {
  const { open, setOpen, currentRow, setCurrentRow } = useBranch()
  return (
    <>
      <BranchActionDialog key='branch-add' open={open === 'add'} onOpenChange={() => setOpen('add')} />

      {currentRow && (
        <>
          <BranchActionDialog
            key={`branch-edit-${currentRow.id}`}
            open={open === 'edit'}
            onOpenChange={() => {
              setOpen('edit')
              setTimeout(() => {
                setCurrentRow(null)
              }, 500)
            }}
            currentRow={currentRow}
          />

          <BranchDeleteDialog
            key={`branch-delete-${currentRow.id}`}
            open={open === 'delete'}
            onOpenChange={() => {
              setOpen('delete')
              setTimeout(() => {
                setCurrentRow(null)
              }, 500)
            }}
            currentRow={currentRow}
          />
        </>
      )}
    </>
  )
}
