import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card'
import { Button } from '@/components/ui/button'
import { Badge } from '@/components/ui/badge'
import { Separator } from '@/components/ui/separator'
import { Link } from 'react-router-dom'
import { Package } from 'lucide-react'
import type { RecentOrder } from './types'
import { formatCurrencyVND } from './types'

export function RecentOrdersCard({ orders }: { orders: RecentOrder[] }) {
  const statusBadge = (s: RecentOrder['status']) => (
    <Badge variant='secondary' className='text-xs'>
      {s === 'DELIVERING'
        ? 'Đang giao'
        : s === 'RECEIVED_AT_BRANCH'
          ? 'Đã nhận tại cửa hàng'
          : s === 'PICKUP_IN_PROGRESS'
            ? 'Đang lấy hàng'
            : 'Hoàn thành'}
    </Badge>
  )

  return (
    <Card>
      <CardHeader className='pb-3'>
        <CardTitle className='text-sm font-medium flex items-center gap-2'>
          <Package className='h-4 w-4' /> Đơn hàng gần đây
        </CardTitle>
      </CardHeader>
      <CardContent className='space-y-3'>
        {orders.map((o) => (
          <div key={o.id} className='flex items-center justify-between border rounded-md p-3'>
            <div className='space-y-1'>
              <div className='text-sm font-medium'>#{o.code}</div>
              <div className='text-xs text-muted-foreground'>{formatCurrencyVND(o.totalAmount)}</div>
            </div>
            {statusBadge(o.status)}
          </div>
        ))}
        <Separator />
        <Link to='/system/branch/manage-branch-order'>
          <Button variant='outline' className='w-full'>
            Xem tất cả đơn hàng
          </Button>
        </Link>
      </CardContent>
    </Card>
  )
}
