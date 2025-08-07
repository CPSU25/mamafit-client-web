'use client'

import { useState } from 'react'
import { AlertTriangle } from 'lucide-react'
import { toast } from 'sonner'
import { Alert, AlertDescription, AlertTitle } from '@/components/ui/alert'
import { Input } from '@/components/ui/input'
import { Label } from '@/components/ui/label'
import { ConfirmDialog } from '@/components/confirm-dialog'
import { Branch } from '../data/schema'
import { useDeleteBranch } from '@/services/admin/manage-branch.service'

interface Props {
  open: boolean
  onOpenChange: (open: boolean) => void
  currentRow: Branch
}

export function BranchDeleteDialog({ open, onOpenChange, currentRow }: Props) {
  const [value, setValue] = useState('')
  const deleteBranchMutation = useDeleteBranch()

  const handleDelete = async () => {
    if (value.trim() !== currentRow.name) return

    try {
      await deleteBranchMutation.mutateAsync(currentRow.id)
      toast.success(`Branch "${currentRow.name}" has been deleted successfully`)
      onOpenChange(false)
      setValue('')
    } catch (error) {
      toast.error('Failed to delete branch')
      console.error('Delete error:', error)
    }
  }

  return (
    <ConfirmDialog
      open={open}
      onOpenChange={(state) => {
        if (!deleteBranchMutation.isPending) {
          setValue('')
          onOpenChange(state)
        }
      }}
      handleConfirm={handleDelete}
      disabled={value.trim() !== currentRow.name || deleteBranchMutation.isPending}
      title={
        <span className='text-destructive'>
          <AlertTriangle className='stroke-destructive mr-1 inline-block' size={18} /> Delete Branch
        </span>
      }
      desc={
        <div className='space-y-4'>
          <p className='mb-2'>
            Are you sure you want to delete <span className='font-bold'>{currentRow.name}</span>?
            <br />
            This action will permanently remove the branch and all associated data from the system. This cannot be
            undone.
          </p>

          <div className='space-y-2'>
            <p className='text-sm text-muted-foreground'>
              <strong>Branch Details:</strong>
            </p>
            <ul className='text-sm space-y-1 ml-4'>
              <li>
                • Address:{' '}
                {[currentRow.street, currentRow.ward, currentRow.district, currentRow.province]
                  .filter(Boolean)
                  .join(', ')}
              </li>
              <li>• Manager ID: {currentRow.branchManager.id}</li>
              <li>
                • Coordinates: {currentRow.latitude}, {currentRow.longitude}
              </li>
            </ul>
          </div>

          <Label className='my-2'>
            Branch Name:
            <Input
              value={value}
              onChange={(e) => setValue(e.target.value)}
              placeholder='Enter branch name to confirm deletion.'
              disabled={deleteBranchMutation.isPending}
            />
          </Label>

          <Alert variant='destructive'>
            <AlertTitle>Warning!</AlertTitle>
            <AlertDescription>Please be careful, this operation can not be rolled back.</AlertDescription>
          </Alert>
        </div>
      }
      confirmText={deleteBranchMutation.isPending ? 'Deleting...' : 'Delete'}
      destructive
    />
  )
}
