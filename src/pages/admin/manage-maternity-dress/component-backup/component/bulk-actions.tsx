import { Button } from '@/components/ui/button'
import { Card, CardContent } from '@/components/ui/card'
import { Trash2 } from 'lucide-react'

type BulkActionsProps = {
  count: number
  onClear: () => void
  onDeleteSelectedDisabled?: boolean
  onDeleteSelected?: () => void
}

export default function BulkActions({ count, onClear, onDeleteSelectedDisabled, onDeleteSelected }: BulkActionsProps) {
  if (!count) return null

  return (
    <Card className='border bg-muted/30'>
      <CardContent className='p-3 flex items-center justify-between gap-3'>
        <div className='text-sm text-muted-foreground'>Đã chọn {count} đầm bầu</div>
        <div className='flex items-center gap-2'>
          <Button size='sm' variant='destructive' disabled={onDeleteSelectedDisabled} onClick={onDeleteSelected}>
            <Trash2 className='h-4 w-4 mr-1.5' /> Xóa đã chọn
          </Button>
          <Button size='sm' variant='outline' onClick={onClear}>
            Bỏ chọn
          </Button>
        </div>
      </CardContent>
    </Card>
  )
}
