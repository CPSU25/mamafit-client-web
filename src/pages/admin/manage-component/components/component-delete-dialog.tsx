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
      toast.success(`Thành phần "${currentRow.name}" đã được xóa thành công`)
      onOpenChange(false)
      setValue('')
    } catch (error: unknown) {
      console.error('Error deleting component:', error)

      const errorMessage =
        error instanceof Error
          ? error.message
          : (error as { response?: { data?: { message?: string } } })?.response?.data?.message || 'Đã xảy ra lỗi'

      toast.error(`Không thể xóa thành phần: ${errorMessage}`)
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
          <AlertTriangle className='stroke-destructive mr-1 inline-block' size={18} /> Xóa Thành phần
        </span>
      }
      desc={
        <div className='space-y-4'>
          <p className='mb-2'>
            Bạn có chắc chắn muốn xóa <span className='font-bold'>{currentRow.name}</span>?
            <br />
            Hành động này sẽ xóa vĩnh viễn thành phần và tất cả các tùy chọn của nó khỏi hệ thống. Điều này không thể
            hoàn tác.
          </p>
          <Label className='my-2'>
            Tên Thành phần:
            <Input
              value={value}
              onChange={(e) => setValue(e.target.value)}
              placeholder='Nhập tên thành phần để xác nhận xóa.'
              disabled={deleteComponentMutation.isPending}
            />
          </Label>
        </div>
      }
      confirmText={isDeleting ? 'Đang xóa...' : 'Xóa'}
      destructive
    >
      <Alert variant='destructive'>
        <AlertTitle>Cảnh báo!</AlertTitle>
        <AlertDescription>
          Vui lòng cẩn thận, thao tác này không thể hoàn tác và sẽ xóa tất cả các tùy chọn thành phần.
        </AlertDescription>
      </Alert>
    </ConfirmDialog>
  )
}
