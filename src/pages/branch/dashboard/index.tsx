import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card'
import { DollarSign, ShoppingCart, Package, TrendingUp } from 'lucide-react'
import { DateRangePicker } from '@/components/date-range-picker'
import { useState } from 'react'
import { DateRange } from 'react-day-picker'

export default function BranchDashboard() {
  const [dateRange, setDateRange] = useState<DateRange | undefined>()

  console.log('Khoảng ngày đã chọn:', dateRange)
  return (
    <div className='space-y-8'>
      <h1 className='text-3xl font-bold'>Branch Dashboard</h1>

      <div className='grid gap-4 md:grid-cols-2 lg:grid-cols-4'>
        <Card>
          <CardHeader className='flex flex-row items-center justify-between space-y-0 pb-2'>
            <CardTitle className='text-sm font-medium'>Today's Sales</CardTitle>
            <DollarSign className='h-4 w-4 text-muted-foreground' />
          </CardHeader>
          <CardContent>
            <div className='text-2xl font-bold'>$12,234</div>
            <p className='text-xs text-muted-foreground'>+20.1% from yesterday</p>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className='flex flex-row items-center justify-between space-y-0 pb-2'>
            <CardTitle className='text-sm font-medium'>Orders Today</CardTitle>
            <ShoppingCart className='h-4 w-4 text-muted-foreground' />
          </CardHeader>
          <CardContent>
            <div className='text-2xl font-bold'>+123</div>
            <p className='text-xs text-muted-foreground'>+15% from yesterday</p>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className='flex flex-row items-center justify-between space-y-0 pb-2'>
            <CardTitle className='text-sm font-medium'>Inventory Items</CardTitle>
            <Package className='h-4 w-4 text-muted-foreground' />
          </CardHeader>
          <CardContent>
            <div className='text-2xl font-bold'>573</div>
            <p className='text-xs text-muted-foreground'>+23 new items</p>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className='flex flex-row items-center justify-between space-y-0 pb-2'>
            <CardTitle className='text-sm font-medium'>Customer Traffic</CardTitle>
            <TrendingUp className='h-4 w-4 text-muted-foreground' />
          </CardHeader>
          <CardContent>
            <div className='text-2xl font-bold'>+235</div>
            <p className='text-xs text-muted-foreground'>+180.1% from yesterday</p>
          </CardContent>
        </Card>
      </div>

      <div className='grid gap-4 md:grid-cols-2 lg:grid-cols-7'>
        <Card className='col-span-4'>
          <CardHeader>
            <CardTitle>Sales Overview</CardTitle>
          </CardHeader>
          <CardContent>
            {/* Add chart component here */}
            <div className='h-[200px] w-full bg-muted'></div>
          </CardContent>
        </Card>

        <Card className='col-span-3'>
          <CardHeader>
            <CardTitle>Recent Orders</CardTitle>
          </CardHeader>
          <CardContent>
            <div className='space-y-4'>
              {[1, 2, 3].map((i) => (
                <div key={i} className='flex items-center'>
                  <div className='space-y-1'>
                    <p className='text-sm font-medium leading-none'>Order #{i}</p>
                    <p className='text-sm text-muted-foreground'>$234.56</p>
                  </div>
                  <div className='ml-auto font-medium'>Completed</div>
                </div>
              ))}
            </div>
          </CardContent>
        </Card>
      </div>
      <div className='flex flex-col space-y-4 p-8'>
        <h1 className='text-2xl font-bold'>Dashboard</h1>
        <div className='flex items-center space-x-4'>
          <p>Chọn khoảng thời gian báo cáo:</p>
          <DateRangePicker className='[&>button]:font-semibold' onDateChange={setDateRange} />
        </div>
      </div>
    </div>
  )
}
