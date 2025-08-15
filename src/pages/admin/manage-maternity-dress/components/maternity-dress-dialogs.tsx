import { useMaternityDress } from '../context/maternity-dress-context'
import { MaternityDressFormDialog } from './maternity-dress-action-dialog'
import { MaternityDressDeleteDialog } from './maternity-dress-delete-dialog'

export function MaternityDressDialogs() {
  const { open, setOpen, currentRow, setCurrentRow } = useMaternityDress()

  return (
    <>
      <MaternityDressFormDialog key='maternity-dress-add' open={open === 'add'} onOpenChange={() => setOpen('add')} />

      {currentRow && (
        <>
          <MaternityDressFormDialog
            key={`maternity-dress-edit-${currentRow.id}`}
            open={open === 'edit'}
            onOpenChange={() => {
              setOpen('edit')
              setTimeout(() => {
                setCurrentRow(null)
              }, 500)
            }}
            currentRow={currentRow}
          />

          <MaternityDressDeleteDialog
            key={`maternity-dress-delete-${currentRow.id}`}
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