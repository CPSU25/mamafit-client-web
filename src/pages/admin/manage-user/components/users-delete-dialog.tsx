'use client'

import { useState } from 'react'
import { AlertTriangle } from 'lucide-react'
import { toast } from 'sonner'
import { useDeleteUser } from '@/services/admin/manage-user.service'
import { Alert, AlertDescription, AlertTitle } from '@/components/ui/alert'
import { Input } from '@/components/ui/input'
import { Label } from '@/components/ui/label'
import { ConfirmDialog } from '@/components/confirm-dialog'
import { User } from '../data/schema'

interface Props {
  open: boolean
  onOpenChange: (open: boolean) => void
  currentRow: User
}

export function UsersDeleteDialog({ open, onOpenChange, currentRow }: Props) {
  const [value, setValue] = useState('')
  const deleteUserMutation = useDeleteUser()

  const handleDelete = async () => {
    if (value.trim() !== currentRow.userName) return

    try {
      await deleteUserMutation.mutateAsync(currentRow.id)
      toast.success(`User "${currentRow.userName}" has been deleted successfully`)
      onOpenChange(false)
      setValue('')
    } catch (error) {
      toast.error('Failed to delete user')
      console.error('Delete error:', error)
    }
  }

  return (
    <ConfirmDialog
      open={open}
      onOpenChange={(state) => {
        setValue('')
        onOpenChange(state)
      }}
      handleConfirm={handleDelete}
      disabled={value.trim() !== currentRow.userName || deleteUserMutation.isPending}
      title={
        <span className='text-destructive'>
          <AlertTriangle className='stroke-destructive mr-1 inline-block' size={18} /> Delete User
        </span>
      }
      desc={
        <div className='space-y-4'>
          <p className='mb-2'>
            Are you sure you want to delete <span className='font-bold'>{currentRow.userName}</span>?
            <br />
            This action will permanently remove the user with the role of{' '}
            <span className='font-bold'>{currentRow.roleName?.toUpperCase()}</span> from the system. This cannot be undone.
          </p>

          <Label className='my-2'>
            Username:
            <Input
              value={value}
              onChange={(e) => setValue(e.target.value)}
              placeholder='Enter username to confirm deletion.'
              disabled={deleteUserMutation.isPending}
            />
          </Label>

          <Alert variant='destructive'>
            <AlertTitle>Warning!</AlertTitle>
            <AlertDescription>Please be careful, this operation can not be rolled back.</AlertDescription>
          </Alert>
        </div>
      }
      confirmText={deleteUserMutation.isPending ? 'Deleting...' : 'Delete'}
      destructive
    />
  )
}
