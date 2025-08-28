import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card'
import { Badge } from '@/components/ui/badge'
import { Button } from '@/components/ui/button'
import { Separator } from '@/components/ui/separator'
import { Link } from 'react-router-dom'
import type { AppointmentMini } from './types'

export function TodayAppointmentsCard({ items }: { items: AppointmentMini[] }) {
  return (
    <Card>
      <CardHeader className='pb-3'>
        <CardTitle className='text-sm font-medium'>Lịch hẹn hôm nay</CardTitle>
      </CardHeader>
      <CardContent className='space-y-3'>
        {items.map((a) => (
          <div key={a.id} className='flex items-center justify-between border rounded-md p-3'>
            <div>
              <div className='text-sm font-medium'>{a.customer}</div>
              <div className='text-xs text-muted-foreground'>
                {a.phone} • {a.time}
              </div>
            </div>
            <Badge variant='secondary' className='text-xs'>
              {a.status === 'UP_COMING'
                ? 'Sắp tới'
                : a.status === 'CHECKED_IN'
                  ? 'Đang diễn ra'
                  : a.status === 'CHECKED_OUT'
                    ? 'Hoàn thành'
                    : 'Đã hủy'}
            </Badge>
          </div>
        ))}
        <Separator />
        <Link to='/system/branch/manage-appointment'>
          <Button variant='outline' className='w-full'>
            Xem lịch hẹn
          </Button>
        </Link>
      </CardContent>
    </Card>
  )
}
