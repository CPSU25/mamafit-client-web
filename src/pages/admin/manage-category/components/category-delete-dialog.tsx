'use client'
import { useState } from 'react'

import { useDeleteCategory } from '@/services/admin/category.service'
import { toast } from 'sonner'
import { Category } from '../data/schema'
import { ConfirmDialog } from '@/components/confirm-dialog'
import { Alert, AlertDescription, AlertTitle } from '@/components/ui/alert'
import { AlertTriangle } from 'lucide-react'
import { Label } from '@/components/ui/label'
import { Input } from '@/components/ui/input'

interface Props {
  open: boolean
  onOpenChange: (open: boolean) => void
  currentRow: Category
}

export function CategoryDeleteDialog({ open, onOpenChange, currentRow }: Props) {
  const [value, setValue] = useState('')
  const deleteCategoryMutation = useDeleteCategory()

  const handleDelete = async () => {
    if (value.trim() !== currentRow.name) return
    try {
      await deleteCategoryMutation.mutateAsync(currentRow.id)
      toast.success(`Category "${currentRow.name}" has been deleted successfully`)
      onOpenChange(false)
      setValue('')
    } catch (error: unknown) {
      console.error('Error deleting category:', error)

      const errorMessage =
        error instanceof Error
          ? error.message
          : (error as { response?: { data?: { message?: string } } })?.response?.data?.message || 'Something went wrong'

      toast.error(`Failed to delete category: ${errorMessage}`)
    }
  }

  const isDeleting = deleteCategoryMutation.isPending

  return (
    <ConfirmDialog
      open={open}
      onOpenChange={(state) => {
        setValue('')
        onOpenChange(state)
      }}
      handleConfirm={handleDelete}
      disabled={value.trim() !== currentRow.name || deleteCategoryMutation.isPending}
      title={
        <span className='text-destructive'>
          <AlertTriangle className='stroke-destructive mr-1 inline-block' size={18} /> Delete Category
        </span>
      }
      desc={
        <div className='space-y-4'>
          <p className='mb-2'>
            Are you sure you want to delete <span className='font-bold'>{currentRow.name}</span>?
            <br />
            This action will permanently remove the category from the system. This cannot be undone.
          </p>
          <Label className='my-2'>
            Category Name:
            <Input
              value={value}
              onChange={(e) => setValue(e.target.value)}
              placeholder='Enter category name to confirm deletion.'
              disabled={deleteCategoryMutation.isPending}
            />
          </Label>
        </div>
      }
      confirmText={isDeleting ? 'Deleting...' : 'Delete'}
      destructive
    >
      <Alert variant='destructive'>
        <AlertTitle>Warning!</AlertTitle>
        <AlertDescription>Please be careful, this operation can not be rolled back.</AlertDescription>
      </Alert>
    </ConfirmDialog>
  )
}
