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
      iconColor: 'text-blue-600',
      bgColor: 'bg-blue-50'
    },
    {
      title: 'Processed',
      subtitle: 'Order Accepted',
      value: processedOrders,
      unit: '',
      icon: Truck,
      change: '+4.13%',
      changeType: 'increase' as const,
      iconColor: 'text-orange-600',
      bgColor: 'bg-orange-50'
    },
    {
      title: 'Delivered',
      subtitle: 'Courier reached',
      value: deliveredOrders,
      unit: '',
      icon: CheckCircle,
      change: '+4.13%',
      changeType: 'increase' as const,
      iconColor: 'text-green-600',
      bgColor: 'bg-green-50'
    },
    {
      title: 'Return',
      subtitle: 'Loss due to returns',
      value: returnAmount,
      unit: 'USD',
      icon: RotateCcw,
      change: '+4.13%',
      changeType: 'increase' as const,
      iconColor: 'text-red-600',
      bgColor: 'bg-red-50'
    }
  ]

  if (isLoading) {
    return (
      <div className='grid gap-4 md:grid-cols-2 lg:grid-cols-4'>
        {[1, 2, 3, 4].map((i) => (
          <Card key={i}>
            <CardHeader className='flex flex-row items-center justify-between space-y-0 pb-2'>
              <div className='h-4 w-16 bg-gray-200 rounded animate-pulse' />
              <div className='h-4 w-4 bg-gray-200 rounded animate-pulse' />
            </CardHeader>
            <CardContent>
              <div className='h-8 w-20 bg-gray-200 rounded animate-pulse mb-2' />
              <div className='h-3 w-24 bg-gray-200 rounded animate-pulse' />
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
          <Card key={index}>
            <CardHeader className='flex flex-row items-center justify-between space-y-0 pb-2'>
              <CardTitle className='text-sm font-medium text-muted-foreground'>{stat.title}</CardTitle>
              <div className={`p-2 rounded-lg ${stat.bgColor}`}>
                <Icon className={`h-4 w-4 ${stat.iconColor}`} />
              </div>
            </CardHeader>
            <CardContent>
              <div className='flex items-baseline space-x-1'>
                <div className='text-2xl font-bold'>
                  {stat.unit === 'USD' ? formatCurrency(stat.value) : stat.value.toLocaleString()}
                </div>
                {stat.unit && stat.unit !== 'USD' && <span className='text-sm text-muted-foreground'>{stat.unit}</span>}
              </div>
              <div className='flex items-center space-x-1 mt-1'>
                <TrendIcon className={`h-3 w-3 ${trendColor}`} />
                <span className={`text-xs ${trendColor}`}>{stat.change}</span>
                <span className='text-xs text-muted-foreground'>{stat.subtitle}</span>
              </div>
            </CardContent>
          </Card>
        )
      })}
    </div>
  )
}
