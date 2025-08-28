import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card'
import { DollarSign, ShoppingCart, ShieldCheck, CalendarDays } from 'lucide-react'
import type { BranchKpis } from './types'
import { formatCurrencyVND } from './types'

export function KpiCards({ kpis }: { kpis: BranchKpis }) {
  return (
    <div className='grid gap-4 sm:grid-cols-2 lg:grid-cols-4'>
      <Card>
        <CardHeader className='flex flex-row items-center justify-between space-y-0 pb-2'>
          <CardTitle className='text-sm font-medium'>Doanh thu hôm nay</CardTitle>
          <DollarSign className='h-4 w-4 text-muted-foreground' />
        </CardHeader>
        <CardContent>
          <div className='text-2xl font-bold text-violet-700 dark:text-violet-300'>
            {formatCurrencyVND(kpis.revenueToday)}
          </div>
          <p className='text-xs text-muted-foreground'>So sánh hôm qua: +8.3%</p>
        </CardContent>
      </Card>
      <Card>
        <CardHeader className='flex flex-row items-center justify-between space-y-0 pb-2'>
          <CardTitle className='text-sm font-medium'>Đơn hàng hôm nay</CardTitle>
          <ShoppingCart className='h-4 w-4 text-muted-foreground' />
        </CardHeader>
        <CardContent>
          <div className='text-2xl font-bold'>{kpis.ordersToday}</div>
          <p className='text-xs text-muted-foreground'>Trong ngày</p>
        </CardContent>
      </Card>
      <Card>
        <CardHeader className='flex flex-row items-center justify-between space-y-0 pb-2'>
          <CardTitle className='text-sm font-medium'>Bảo hành đang mở</CardTitle>
          <ShieldCheck className='h-4 w-4 text-muted-foreground' />
        </CardHeader>
        <CardContent>
          <div className='text-2xl font-bold'>{kpis.warrantyOpen}</div>
          <p className='text-xs text-muted-foreground'>Yêu cầu đang xử lý</p>
        </CardContent>
      </Card>
      <Card>
        <CardHeader className='flex flex-row items-center justify-between space-y-0 pb-2'>
          <CardTitle className='text-sm font-medium'>Lịch hẹn hôm nay</CardTitle>
          <CalendarDays className='h-4 w-4 text-muted-foreground' />
        </CardHeader>
        <CardContent>
          <div className='text-2xl font-bold'>{kpis.appointmentsToday}</div>
          <p className='text-xs text-muted-foreground'>Tại chi nhánh</p>
        </CardContent>
      </Card>
    </div>
  )
}
