import { useComponents } from '../context/components-context'
import { ComponentFormDialog } from './component-action-dialog'
import { ComponentDeleteDialog } from './component-delete-dialog'

export function ComponentsDialogs() {
  const { open, setOpen, currentRow, setCurrentRow } = useComponents()

  return (
    <>
      <ComponentFormDialog key='component-add' open={open === 'add'} onOpenChange={() => setOpen('add')} />

      {currentRow && (
        <>
          <ComponentFormDialog
            key={`component-edit-${currentRow.id}`}
            open={open === 'edit'}
            onOpenChange={() => {
              setOpen('edit')
              setTimeout(() => {
                setCurrentRow(null)
              }, 500)
            }}
            currentRow={currentRow}
          />

          <ComponentDeleteDialog
            key={`component-delete-${currentRow.id}`}
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
