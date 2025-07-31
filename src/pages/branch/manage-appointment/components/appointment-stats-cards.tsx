import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card'
import { Skeleton } from '@/components/ui/skeleton'
import { Calendar, Clock, CheckCircle, XCircle } from 'lucide-react'
import { AppointmentStats } from '@/@types/apointment.type'

interface AppointmentStatsCardsProps {
  stats?: AppointmentStats
  isLoading: boolean
}

export const AppointmentStatsCards = ({ stats, isLoading }: AppointmentStatsCardsProps) => {
  if (isLoading) {
    return (
      <>
        {Array.from({ length: 4 }).map((_, i) => (
          <Card key={i} className='relative overflow-hidden group hover:shadow-xl transition-all duration-300'>
            <CardHeader className='flex flex-row items-center justify-between space-y-0 pb-2'>
              <Skeleton className='h-4 w-20' />
              <Skeleton className='h-6 w-6 rounded-lg' />
            </CardHeader>
            <CardContent>
              <Skeleton className='h-8 w-16 mb-2' />
              <Skeleton className='h-3 w-28' />
            </CardContent>
          </Card>
        ))}
      </>
    )
  }

  if (!stats) return null

  const statCards = [
    {
      title: 'Tổng lịch hẹn',
      value: stats.totalAppointments,
      description: 'Tổng số lịch hẹn',
      icon: Calendar,
      gradient: 'from-blue-500 to-blue-600',
      bgGradient: 'from-blue-50 to-blue-100',
      textColor: 'text-blue-600',
      iconBg: 'bg-blue-100'
    },
    {
      title: 'Sắp tới',
      value: stats.upComing,
      description: 'Lịch hẹn sắp tới',
      icon: Clock,
      gradient: 'from-yellow-500 to-orange-600',
      bgGradient: 'from-yellow-50 to-orange-100',
      textColor: 'text-orange-600',
      iconBg: 'bg-orange-100'
    },
    {
      title: 'Đang diễn ra',
      value: stats.inProgress,
      description: 'Đang phục vụ',
      icon: CheckCircle,
      gradient: 'from-green-500 to-emerald-600',
      bgGradient: 'from-green-50 to-emerald-100',
      textColor: 'text-emerald-600',
      iconBg: 'bg-emerald-100'
    },
    {
      title: 'Đã hủy',
      value: stats.canceled,
      description: 'Lịch hẹn bị hủy',
      icon: XCircle,
      gradient: 'from-red-500 to-rose-600',
      bgGradient: 'from-red-50 to-rose-100',
      textColor: 'text-rose-600',
      iconBg: 'bg-rose-100'
    }
  ]

  return (
    <>
      {statCards.map((stat, index) => {
        const Icon = stat.icon
        return (
          <Card
            key={index}
            className='relative overflow-hidden group hover:shadow-xl hover:-translate-y-1 transition-all duration-300 border-0 shadow-lg'
          >
            {/* Background gradient */}
            <div className={`absolute inset-0 bg-gradient-to-br ${stat.bgGradient} opacity-50`}></div>

            {/* Content */}
            <div className='relative z-10'>
              <CardHeader className='flex flex-row items-center justify-between space-y-0 pb-2 px-4 lg:px-6 pt-4 lg:pt-6'>
                <CardTitle className='text-xs lg:text-sm font-semibold text-gray-600 truncate'>{stat.title}</CardTitle>
                <div
                  className={`p-1.5 lg:p-2.5 rounded-lg lg:rounded-xl ${stat.iconBg} group-hover:scale-110 transition-transform duration-300 flex-shrink-0`}
                >
                  <Icon className={`h-4 w-4 lg:h-5 lg:w-5 ${stat.textColor}`} />
                </div>
              </CardHeader>
              <CardContent className='space-y-1 lg:space-y-2 px-4 lg:px-6 pb-4 lg:pb-6'>
                <div className='flex items-end justify-between'>
                  <div className={`text-xl lg:text-3xl font-bold ${stat.textColor}`}>{stat.value}</div>
                  <div
                    className={`text-xs font-medium ${stat.textColor} bg-white/60 px-1.5 lg:px-2 py-0.5 lg:py-1 rounded-full`}
                  >
                    +{stat.value}
                  </div>
                </div>
                <p className='text-xs text-gray-600 font-medium truncate'>{stat.description}</p>
              </CardContent>
            </div>

            {/* Hover effect */}
            <div className='absolute inset-0 bg-gradient-to-r from-white/10 to-transparent opacity-0 group-hover:opacity-100 transition-opacity duration-300'></div>
          </Card>
        )
      })}
    </>
  )
}
