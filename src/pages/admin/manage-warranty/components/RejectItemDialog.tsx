import { useState } from 'react'
import { DialogHeader, DialogTitle, DialogDescription } from '@/components/ui/dialog'
import { Button } from '@/components/ui/button'
import { Textarea } from '@/components/ui/textarea'
import { Label } from '@/components/ui/label'
import { RejectItemDialogProps } from '../types'

export const RejectItemDialog = ({ item, onClose, onReject }: RejectItemDialogProps) => {
  const [rejectionReason, setRejectionReason] = useState('')

  if (!item) return null

  return (
    <div className='w-full'>
      <DialogHeader>
        <DialogTitle>Từ chối bảo hành</DialogTitle>
        <DialogDescription>Nhập lý do từ chối bảo hành cho sản phẩm: {item.productName}</DialogDescription>
      </DialogHeader>

      <div className='space-y-4 mt-4'>
        <div>
          <Label htmlFor='rejection-reason'>Lý do từ chối</Label>
          <Textarea
            id='rejection-reason'
            placeholder='Nhập lý do từ chối bảo hành...'
            value={rejectionReason}
            onChange={(e) => setRejectionReason(e.target.value)}
            className='mt-2'
          />
        </div>

        <div className='flex justify-end gap-3'>
          <Button variant='outline' onClick={onClose}>
            Hủy
          </Button>
          <Button
            className='bg-red-600 hover:bg-red-700'
            onClick={() => {
              onReject(item.id, rejectionReason)
              onClose()
            }}
            disabled={!rejectionReason.trim()}
          >
            Từ chối
          </Button>
        </div>
      </div>
    </div>
  )
}
