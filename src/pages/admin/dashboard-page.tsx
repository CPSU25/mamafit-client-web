import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card'
import { Users, DollarSign, ShoppingCart, TrendingUp } from 'lucide-react'

export default function AdminDashboard() {
  return (
    <div className='space-y-8'>
      <h1 className='text-3xl font-bold'>Admin Dashboard</h1>

      <div className='grid gap-4 md:grid-cols-2 lg:grid-cols-4'>
        <Card>
          <CardHeader className='flex flex-row items-center justify-between space-y-0 pb-2'>
            <CardTitle className='text-sm font-medium'>Total Users</CardTitle>
            <Users className='h-4 w-4 text-muted-foreground' />
          </CardHeader>
          <CardContent>
            <div className='text-2xl font-bold'>1,234</div>
            <p className='text-xs text-muted-foreground'>+20.1% from last month</p>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className='flex flex-row items-center justify-between space-y-0 pb-2'>
            <CardTitle className='text-sm font-medium'>Total Revenue</CardTitle>
            <DollarSign className='h-4 w-4 text-muted-foreground' />
          </CardHeader>
          <CardContent>
            <div className='text-2xl font-bold'>$45,231.89</div>
            <p className='text-xs text-muted-foreground'>+15% from last month</p>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className='flex flex-row items-center justify-between space-y-0 pb-2'>
            <CardTitle className='text-sm font-medium'>Total Orders</CardTitle>
            <ShoppingCart className='h-4 w-4 text-muted-foreground' />
          </CardHeader>
          <CardContent>
            <div className='text-2xl font-bold'>+573</div>
            <p className='text-xs text-muted-foreground'>+201 since last hour</p>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className='flex flex-row items-center justify-between space-y-0 pb-2'>
            <CardTitle className='text-sm font-medium'>Active Now</CardTitle>
            <TrendingUp className='h-4 w-4 text-muted-foreground' />
          </CardHeader>
          <CardContent>
            <div className='text-2xl font-bold'>+2350</div>
            <p className='text-xs text-muted-foreground'>+180.1% from last hour</p>
          </CardContent>
        </Card>
      </div>

      <div className='grid gap-4 md:grid-cols-2 lg:grid-cols-7'>
        <Card className='col-span-4'>
          <CardHeader>
            <CardTitle>Overview</CardTitle>
          </CardHeader>
          <CardContent>
            {/* Add chart component here */}
            <div className='h-[200px] w-full bg-muted'></div>
          </CardContent>
        </Card>

        <Card className='col-span-3'>
          <CardHeader>
            <CardTitle>Recent Sales</CardTitle>
          </CardHeader>
          <CardContent>
            <div className='space-y-4'>
              {[1, 2, 3].map((i) => (
                <div key={i} className='flex items-center'>
                  <div className='space-y-1'>
                    <p className='text-sm font-medium leading-none'>Sale #{i}</p>
                    <p className='text-sm text-muted-foreground'>$1,234.56</p>
                  </div>
                  <div className='ml-auto font-medium'>+$234.56</div>
                </div>
              ))}
            </div>
          </CardContent>
        </Card>
      </div>
    </div>
  )
}
