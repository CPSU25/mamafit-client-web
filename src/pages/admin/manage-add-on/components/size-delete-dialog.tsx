'use client'
import { useState } from 'react'
import { useDeleteSize } from '@/services/admin/add-on.service'
import { toast } from 'sonner'
import { SizeSchema } from '../data/schema'
import { ConfirmDialog } from '@/components/confirm-dialog'
import { Alert, AlertDescription, AlertTitle } from '@/components/ui/alert'
import { AlertTriangle } from 'lucide-react'
import { Label } from '@/components/ui/label'
import { Input } from '@/components/ui/input'

interface Props {
  open: boolean
  onOpenChange: (open: boolean) => void
  currentRow: SizeSchema
}

export function SizeDeleteDialog({ open, onOpenChange, currentRow }: Props) {
  const [value, setValue] = useState('')
  const deleteSizeMutation = useDeleteSize()

  const handleDelete = async () => {
    if (value.trim() !== currentRow.name) return
    try {
      await deleteSizeMutation.mutateAsync(currentRow.id)
      toast.success(`Size "${currentRow.name}" đã được xóa thành công`)
      onOpenChange(false)
      setValue('')
    } catch (error: unknown) {
      console.error('Error deleting size:', error)

      const errorMessage =
        error instanceof Error
          ? error.message
          : (error as { response?: { data?: { message?: string } } })?.response?.data?.message || 'Có lỗi xảy ra'

      toast.error(`Không thể xóa size: ${errorMessage}`)
    }
  }

  const isDeleting = deleteSizeMutation.isPending

  return (
    <ConfirmDialog
      open={open}
      onOpenChange={(state) => {
        setValue('')
        onOpenChange(state)
      }}
      handleConfirm={handleDelete}
      disabled={value.trim() !== currentRow.name || deleteSizeMutation.isPending}
      title={
        <span className='text-destructive'>
          <AlertTriangle className='stroke-destructive mr-1 inline-block' size={18} /> Xóa Size
        </span>
      }
      desc={
        <div className='space-y-4'>
          <p className='mb-2'>
            Bạn có chắc chắn muốn xóa <span className='font-bold'>{currentRow.name}</span>?
            <br />
            Hành động này sẽ xóa vĩnh viễn size khỏi hệ thống. Không thể hoàn tác.
          </p>
          <Label className='my-2'>
            Tên Size:
            <Input
              value={value}
              onChange={(e) => setValue(e.target.value)}
              placeholder='Nhập tên size để xác nhận xóa.'
              disabled={deleteSizeMutation.isPending}
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
