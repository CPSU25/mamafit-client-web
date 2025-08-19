import React from 'react'
import { Package, Palette, Shirt, Settings } from 'lucide-react'
import { Card, CardContent } from '@/components/ui/card'

interface StatsData {
  styles: number
  templates: number
  componentOptions: number
  totalPrice: number
}

interface StatsCardsProps {
  stats: StatsData
}

const StatCard: React.FC<{
  title: string
  value: number | string
  icon: React.ReactNode
  suffix?: string
}> = ({ title, value, icon, suffix = '' }) => (
  <Card>
    <CardContent className='p-6'>
      <div className='flex items-center justify-between'>
        <div>
          <p className='text-sm font-medium text-muted-foreground'>{title}</p>
          <p className='text-2xl font-bold text-foreground'>
            {typeof value === 'number' ? value.toLocaleString('vi-VN') : value}
            {suffix}
          </p>
        </div>
        <div className='p-3 bg-primary/10 rounded-full'>{icon}</div>
      </div>
    </CardContent>
  </Card>
)

export const StatsCards: React.FC<StatsCardsProps> = ({ stats }) => {
  return (
    <div className='grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6'>
      <StatCard title='Kiểu dáng' value={stats.styles} icon={<Palette className='w-6 h-6 text-primary' />} />
      <StatCard title='Mẫu đầm bầu' value={stats.templates} icon={<Shirt className='w-6 h-6 text-primary' />} />
      <StatCard
        title='Tùy chọn thành phần'
        value={stats.componentOptions}
        icon={<Package className='w-6 h-6 text-primary' />}
      />
      <StatCard
        title='Tổng giá trị'
        value={stats.totalPrice}
        suffix='đ'
        icon={<Settings className='w-6 h-6 text-primary' />}
      />
    </div>
  )
}
