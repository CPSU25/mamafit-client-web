'use client'
import { useState } from 'react'
import { useDeleteAddOn } from '@/services/admin/add-on.service'
import { toast } from 'sonner'
import { AddOn } from '../data/schema'
import { ConfirmDialog } from '@/components/confirm-dialog'
import { Alert, AlertDescription, AlertTitle } from '@/components/ui/alert'
import { AlertTriangle } from 'lucide-react'
import { Label } from '@/components/ui/label'
import { Input } from '@/components/ui/input'

interface Props {
  open: boolean
  onOpenChange: (open: boolean) => void
  currentRow: AddOn
}

export function AddOnDeleteDialog({ open, onOpenChange, currentRow }: Props) {
  const [value, setValue] = useState('')
  const deleteAddOnMutation = useDeleteAddOn()

  const handleDelete = async () => {
    if (value.trim() !== currentRow.name) return
    try {
      await deleteAddOnMutation.mutateAsync(currentRow.id)
      toast.success(`Add-on "${currentRow.name}" đã được xóa thành công`)
      onOpenChange(false)
      setValue('')
    } catch (error: unknown) {
      console.error('Error deleting add-on:', error)

      const errorMessage =
        error instanceof Error
          ? error.message
          : (error as { response?: { data?: { message?: string } } })?.response?.data?.message || 'Có lỗi xảy ra'

      toast.error(`Không thể xóa add-on: ${errorMessage}`)
    }
  }

  const isDeleting = deleteAddOnMutation.isPending

  return (
    <ConfirmDialog
      open={open}
      onOpenChange={(state) => {
        setValue('')
        onOpenChange(state)
      }}
      handleConfirm={handleDelete}
      disabled={value.trim() !== currentRow.name || deleteAddOnMutation.isPending}
      title={
        <span className='text-destructive'>
          <AlertTriangle className='stroke-destructive mr-1 inline-block' size={18} /> Xóa Add-on
        </span>
      }
      desc={
        <div className='space-y-4'>
          <p className='mb-2'>
            Bạn có chắc chắn muốn xóa <span className='font-bold'>{currentRow.name}</span>?
            <br />
            Hành động này sẽ xóa vĩnh viễn add-on khỏi hệ thống. Không thể hoàn tác.
          </p>
          <Label className='my-2'>
            Tên Add-on:
            <Input
              value={value}
              onChange={(e) => setValue(e.target.value)}
              placeholder='Nhập tên add-on để xác nhận xóa.'
              disabled={deleteAddOnMutation.isPending}
            />
          </Label>
        </div>
      }
      confirmText={isDeleting ? 'Đang xóa...' : 'Xóa'}
      destructive
    >
      <Alert variant='destructive'>
        <AlertTitle>Cảnh báo!</AlertTitle>
        <AlertDescription>Vui lòng cẩn thận, thao tác này không thể hoàn tác.</AlertDescription>
      </Alert>
    </ConfirmDialog>
  )
}
