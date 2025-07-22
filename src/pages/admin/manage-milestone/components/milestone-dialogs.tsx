import { useMilestones } from '../context/milestones-context'
import { MilestoneFormDialog } from './milestone-action-dialog'
import { MilestoneDeleteDialog } from './milestone-delete-dialog'

export function MilestoneDialogs() {
  const { open, setOpen, currentRow, setCurrentRow } = useMilestones()

  return (
    <>
      <MilestoneFormDialog key='milestone-add' open={open === 'add'} onOpenChange={() => setOpen('add')} />

      {currentRow && (
        <>
          <MilestoneFormDialog
            key={`milestone-edit-${currentRow.id}`}
            open={open === 'edit'}
            onOpenChange={() => {
              setOpen('edit')
              setTimeout(() => {
                setCurrentRow(null)
              }, 500)
            }}
            currentRow={currentRow}
          />

          <MilestoneDeleteDialog
            key={`milestone-delete-${currentRow.id}`}
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
