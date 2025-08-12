// order-statistics.tsx - Lightweight Statistics Cards
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card'
import { Package, Truck, CheckCircle, RotateCcw, TrendingUp, TrendingDown } from 'lucide-react'

interface OrderStatisticsProps {
  totalOrders: number
  processedOrders: number
  deliveredOrders: number
  returnAmount: number
  isLoading?: boolean
}

export function OrderStatistics({
  totalOrders,
  processedOrders,
  deliveredOrders,
  returnAmount,
  isLoading = false
}: OrderStatisticsProps) {
  const formatCurrency = (amount: number) => {
    return new Intl.NumberFormat('vi-VN', {
      style: 'currency',
      currency: 'VND'
    }).format(amount)
  }

  const stats = [
    {
      title: 'Orders',
      subtitle: 'No.of Orders Received',
      value: totalOrders,
      unit: '',
      icon: Package,
      change: '+4.13%',
      changeType: 'increase' as const,
      iconBg: 'bg-violet-100 text-violet-700 dark:bg-violet-900/40 dark:text-violet-300',
      border: 'border-border'
    },
    {
      title: 'Processed',
      subtitle: 'Order Accepted',
      value: processedOrders,
      unit: '',
      icon: Truck,
      change: '+4.13%',
      changeType: 'increase' as const,
      iconBg: 'bg-orange-100 text-orange-700 dark:bg-orange-900/40 dark:text-orange-300',
      border: 'border-border'
    },
    {
      title: 'Delivered',
      subtitle: 'Courier reached',
      value: deliveredOrders,
      unit: '',
      icon: CheckCircle,
      change: '+4.13%',
      changeType: 'increase' as const,
      iconBg: 'bg-green-100 text-green-700 dark:bg-green-900/40 dark:text-green-300',
      border: 'border-border'
    },
    {
      title: 'Return',
      subtitle: 'Loss due to returns',
      value: returnAmount,
      unit: 'USD',
      icon: RotateCcw,
      change: '+4.13%',
      changeType: 'increase' as const,
      iconBg: 'bg-red-100 text-red-700 dark:bg-red-900/40 dark:text-red-300',
      border: 'border-border'
    }
  ]

  if (isLoading) {
    return (
      <div className='grid gap-4 md:grid-cols-2 lg:grid-cols-4'>
        {[1, 2, 3, 4].map((i) => (
          <Card key={i}>
            <CardHeader className='pb-2'>
              <div className='h-4 w-24 bg-muted rounded' />
              <div className='h-3 w-32 bg-muted rounded mt-1' />
            </CardHeader>
            <CardContent>
              <div className='h-7 w-20 bg-muted rounded' />
            </CardContent>
          </Card>
        ))}
      </div>
    )
  }

  return (
    <div className='grid gap-4 md:grid-cols-2 lg:grid-cols-4'>
      {stats.map((stat, index) => {
        const Icon = stat.icon
        const TrendIcon = stat.changeType === 'increase' ? TrendingUp : TrendingDown
        const trendColor = stat.changeType === 'increase' ? 'text-green-600' : 'text-red-600'

        return (
          <Card key={index} className={`border ${stat.border}`}>
            <CardHeader className='flex flex-row items-center justify-between space-y-0 pb-2'>
              <div className='space-y-1'>
                <CardTitle className='text-sm font-semibold'>{stat.title}</CardTitle>
                <p className='text-xs text-muted-foreground'>{stat.subtitle}</p>
              </div>
              <div className={`p-2 rounded-md ${stat.iconBg}`}>
                <Icon className='h-5 w-5' />
              </div>
            </CardHeader>
            <CardContent className='pt-0'>
              <div className='flex items-baseline justify-between'>
                <div className='text-2xl font-bold'>
                  {stat.unit === 'USD' ? formatCurrency(stat.value) : stat.value.toLocaleString()}
                </div>
                <div className={`flex items-center gap-1 text-xs ${trendColor}`}>
                  <TrendIcon className='h-3.5 w-3.5' />
                  <span>{stat.change}</span>
                </div>
              </div>
            </CardContent>
          </Card>
        )
      })}
    </div>
  )
}
