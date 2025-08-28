import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card'
import { TrendingUp } from 'lucide-react'

export function SalesChartCard() {
  return (
    <Card className='lg:col-span-2'>
      <CardHeader className='flex items-center justify-between'>
        <CardTitle className='text-sm font-medium'>Biểu đồ doanh thu (mock)</CardTitle>
        <TrendingUp className='h-4 w-4 text-muted-foreground' />
      </CardHeader>
      <CardContent>
        <div className='h-[220px] w-full rounded-lg bg-gradient-to-br from-violet-50 to-purple-50 dark:from-violet-950/20 dark:to-purple-950/20 border' />
      </CardContent>
    </Card>
  )
}
