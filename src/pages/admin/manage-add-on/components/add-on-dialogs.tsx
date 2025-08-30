import { useAddOn } from '../context/add-on-context'
import { AddOnActionDialog } from './add-on-action-dialog'
import { AddOnDeleteDialog } from './add-on-delete-dialog'
import { PositionActionDialog } from './position-action-dialog'
import { PositionDeleteDialog } from './position-delete-dialog'
import { SizeActionDialog } from './size-action-dialog'
import { SizeDeleteDialog } from './size-delete-dialog'

export function AddOnDialogs() {
  const {
    open,
    setOpen,
    currentAddOn,
    setCurrentAddOn,
    currentPosition,
    setCurrentPosition,
    currentSize,
    setCurrentSize
  } = useAddOn()

  return (
    <>
      {/* Add-on Dialogs */}
      <AddOnActionDialog key='add-on-add' open={open === 'add-add-on'} onOpenChange={() => setOpen('add-add-on')} />

      {currentAddOn && (
        <>
          <AddOnActionDialog
            key={`add-on-edit-${currentAddOn.id}`}
            open={open === 'edit-add-on'}
            onOpenChange={(state) => {
              if (state) {
                setOpen('edit-add-on')
              } else {
                setOpen(null)
                setTimeout(() => {
                  setCurrentAddOn(null)
                }, 500)
              }
            }}
            currentRow={currentAddOn}
          />

          <AddOnDeleteDialog
            key={`add-on-delete-${currentAddOn.id}`}
            open={open === 'delete-add-on'}
            onOpenChange={(state) => {
              if (state) {
                setOpen('delete-add-on')
              } else {
                setOpen(null)
                setTimeout(() => {
                  setCurrentAddOn(null)
                }, 500)
              }
            }}
            currentRow={currentAddOn}
          />
        </>
      )}

      {/* Position Dialogs */}
      <PositionActionDialog
        key='position-add'
        open={open === 'add-position'}
        onOpenChange={() => setOpen('add-position')}
      />

      {currentPosition && (
        <>
          <PositionActionDialog
            key={`position-edit-${currentPosition.id}`}
            open={open === 'edit-position'}
            onOpenChange={(state) => {
              if (state) {
                setOpen('edit-position')
              } else {
                setOpen(null)
                setTimeout(() => {
                  setCurrentPosition(null)
                }, 500)
              }
            }}
            currentRow={currentPosition}
          />

          <PositionDeleteDialog
            key={`position-delete-${currentPosition.id}`}
            open={open === 'delete-position'}
            onOpenChange={(state) => {
              if (state) {
                setOpen('delete-position')
              } else {
                setOpen(null)
                setTimeout(() => {
                  setCurrentPosition(null)
                }, 500)
              }
            }}
            currentRow={currentPosition}
          />
        </>
      )}

      {/* Size Dialogs */}
      <SizeActionDialog key='size-add' open={open === 'add-size'} onOpenChange={() => setOpen('add-size')} />

      {currentSize && (
        <>
          <SizeActionDialog
            key={`size-edit-${currentSize.id}`}
            open={open === 'edit-size'}
            onOpenChange={(state) => {
              if (state) {
                setOpen('edit-size')
              } else {
                setOpen(null)
                setTimeout(() => {
                  setCurrentSize(null)
                }, 500)
              }
            }}
            currentRow={currentSize}
          />

          <SizeDeleteDialog
            key={`size-delete-${currentSize.id}`}
            open={open === 'delete-size'}
            onOpenChange={(state) => {
              if (state) {
                setOpen('delete-size')
              } else {
                setOpen(null)
                setTimeout(() => {
                  setCurrentSize(null)
                }, 500)
              }
            }}
            currentRow={currentSize}
          />
        </>
      )}
    </>
  )
}
