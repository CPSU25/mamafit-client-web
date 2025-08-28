import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card'
import { Button } from '@/components/ui/button'
import { Link } from 'react-router-dom'
import { ArrowRight } from 'lucide-react'

export function QuickActions() {
  return (
    <Card>
      <CardHeader>
        <CardTitle className='text-sm font-medium'>Lối tắt thao tác</CardTitle>
      </CardHeader>
      <CardContent className='grid gap-2'>
        <Link to='/system/branch/manage-branch-order'>
          <Button variant='outline' className='w-full justify-between'>
            Quản lý đơn hàng <ArrowRight className='h-4 w-4' />
          </Button>
        </Link>
        <Link to='/system/branch/manage-warranty'>
          <Button variant='outline' className='w-full justify-between'>
            Quản lý bảo hành <ArrowRight className='h-4 w-4' />
          </Button>
        </Link>
        <Link to='/system/branch/manage-appointment'>
          <Button variant='outline' className='w-full justify-between'>
            Quản lý lịch hẹn <ArrowRight className='h-4 w-4' />
          </Button>
        </Link>
      </CardContent>
    </Card>
  )
}
