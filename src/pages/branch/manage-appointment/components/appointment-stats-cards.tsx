import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card'
import { Skeleton } from '@/components/ui/skeleton'
import { Calendar, Clock, CheckCircle, XCircle } from 'lucide-react'
import { AppointmentStats } from '@/@types/apointment.type'

interface AppointmentStatsCardsProps {
  stats?: AppointmentStats
  isLoading: boolean
}

export const AppointmentStatsCards = ({ stats, isLoading }: AppointmentStatsCardsProps) => {
  const statCardsData = [
    { title: 'Tổng lịch hẹn', value: stats?.totalAppointments, icon: Calendar, colorClass: 'text-primary' },
    { title: 'Sắp tới', value: stats?.upComing, icon: Clock, colorClass: 'text-sky-500' },
    { title: 'Đang diễn ra', value: stats?.inProgress, icon: CheckCircle, colorClass: 'text-green-500' },
    { title: 'Đã hủy', value: stats?.canceled, icon: XCircle, colorClass: 'text-destructive' }
  ]

  if (isLoading) {
    return Array.from({ length: 4 }).map((_, i) => (
      <Card key={i}>
        <CardHeader className='flex flex-row items-center justify-between space-y-0 pb-2'>
          <Skeleton className='h-4 w-2/3' />
          <Skeleton className='h-6 w-6' />
        </CardHeader>
        <CardContent>
          <Skeleton className='h-8 w-12' />
        </CardContent>
      </Card>
    ))
  }

  return statCardsData.map((stat, index) => {
    const Icon = stat.icon
    return (
      <Card key={index}>
        <CardHeader className='flex flex-row items-center justify-between space-y-0 pb-2'>
          <CardTitle className='text-sm font-medium text-muted-foreground'>{stat.title}</CardTitle>
          <Icon className={`h-4 w-4 ${stat.colorClass}`} />
        </CardHeader>
        <CardContent>
          <div className={`text-2xl font-bold ${stat.colorClass}`}>{stat.value}</div>
        </CardContent>
      </Card>
    )
  })
}