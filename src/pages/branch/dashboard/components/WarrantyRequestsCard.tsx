import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card'
import { Button } from '@/components/ui/button'
import { Badge } from '@/components/ui/badge'
import { Separator } from '@/components/ui/separator'
import { Link } from 'react-router-dom'
import type { WarrantyCard } from './types'
import { formatCurrencyVND } from './types'

export function WarrantyRequestsCard({ items }: { items: WarrantyCard[] }) {
  const badge = (s: WarrantyCard['status']) => (
    <Badge variant='secondary' className='text-xs'>
      {s === 'PENDING' ? 'Chờ xử lý' : s === 'APPROVED' ? 'Đã duyệt' : s === 'REPAIRING' ? 'Đang sửa' : 'Hoàn thành'}
    </Badge>
  )

  return (
    <Card>
      <CardHeader className='pb-3'>
        <CardTitle className='text-sm font-medium'>Yêu cầu bảo hành</CardTitle>
      </CardHeader>
      <CardContent className='space-y-3'>
        {items.map((w) => (
          <div key={w.id} className='flex items-center justify-between border rounded-md p-3'>
            <div className='space-y-1'>
              <div className='text-sm font-medium'>SKU: {w.sku}</div>
              {w.totalFee ? (
                <div className='text-xs text-muted-foreground'>Phí: {formatCurrencyVND(w.totalFee)}</div>
              ) : (
                <div className='text-xs text-muted-foreground'>Không phí</div>
              )}
            </div>
            {badge(w.status)}
          </div>
        ))}
        <Separator />
        <Link to='/system/branch/manage-warranty'>
          <Button variant='outline' className='w-full'>
            Xem tất cả bảo hành
          </Button>
        </Link>
      </CardContent>
    </Card>
  )
}
