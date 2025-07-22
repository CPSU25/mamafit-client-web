'use client'
import { useState } from 'react'

import { useDeleteComponent } from '@/services/admin/manage-component.service'
import { toast } from 'sonner'
import { Component } from '../data/schema'
import { ConfirmDialog } from '@/components/confirm-dialog'
import { Alert, AlertDescription, AlertTitle } from '@/components/ui/alert'
import { AlertTriangle } from 'lucide-react'
import { Label } from '@/components/ui/label'
import { Input } from '@/components/ui/input'

interface Props {
  open: boolean
  onOpenChange: (open: boolean) => void
  currentRow: Component
}

export function ComponentDeleteDialog({ open, onOpenChange, currentRow }: Props) {
  const [value, setValue] = useState('')
  const deleteComponentMutation = useDeleteComponent()

  const handleDelete = async () => {
    if (value.trim() !== currentRow.name) return
    try {
      await deleteComponentMutation.mutateAsync(currentRow.id)
      toast.success(`Component "${currentRow.name}" has been deleted successfully`)
      onOpenChange(false)
      setValue('')
    } catch (error: unknown) {
      console.error('Error deleting component:', error)

      const errorMessage =
        error instanceof Error
          ? error.message
          : (error as { response?: { data?: { message?: string } } })?.response?.data?.message || 'Something went wrong'

      toast.error(`Failed to delete component: ${errorMessage}`)
    }
  }

  const isDeleting = deleteComponentMutation.isPending

  return (
    <ConfirmDialog
      open={open}
      onOpenChange={(state) => {
        setValue('')
        onOpenChange(state)
      }}
      handleConfirm={handleDelete}
      disabled={value.trim() !== currentRow.name || deleteComponentMutation.isPending}
      title={
        <span className='text-destructive'>
          <AlertTriangle className='stroke-destructive mr-1 inline-block' size={18} /> Delete Component
        </span>
      }
      desc={
        <div className='space-y-4'>
          <p className='mb-2'>
            Are you sure you want to delete <span className='font-bold'>{currentRow.name}</span>?
            <br />
            This action will permanently remove the component and all its options from the system. This cannot be
            undone.
          </p>
          <Label className='my-2'>
            Component Name:
            <Input
              value={value}
              onChange={(e) => setValue(e.target.value)}
              placeholder='Enter component name to confirm deletion.'
              disabled={deleteComponentMutation.isPending}
            />
          </Label>
        </div>
      }
      confirmText={isDeleting ? 'Deleting...' : 'Delete'}
      destructive
    >
      <Alert variant='destructive'>
        <AlertTitle>Warning!</AlertTitle>
        <AlertDescription>
          Please be careful, this operation can not be rolled back and will delete all component options.
        </AlertDescription>
      </Alert>
    </ConfirmDialog>
  )
}
