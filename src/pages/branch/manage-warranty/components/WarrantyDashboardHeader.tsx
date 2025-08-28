import { useMemo } from 'react'
import { Package, Clock, ShieldCheck, CheckCircle, Loader2 } from 'lucide-react'
import { Card, CardContent } from '@/components/ui/card'
import { useWarrantyRequestOfBranchs } from '@/services/global/warranty.service'
import { StatusWarrantyRequest } from '@/@types/warranty-request.types'

// Dashboard Statistics Header Component
export function WarrantyDashboardHeader() {
  const { data, isLoading } = useWarrantyRequestOfBranchs({
    index: 1,
    pageSize: 100, // Get more data for accurate statistics
    search: '',
    sortBy: 'CREATED_AT_DESC'
  })

  const stats = useMemo(() => {
    if (!data?.items) return { total: 0, pending: 0, approved: 0, completed: 0 }

    const items = data.items
    return {
      total: data.totalCount || 0,
      pending: items.filter((r) => r.status === StatusWarrantyRequest.PENDING).length,
      approved: items.filter((r) => r.status === StatusWarrantyRequest.APPROVED).length,
      completed: items.filter((r) => r.status === StatusWarrantyRequest.COMPLETED).length
    }
  }, [data])

  const statCards = [
    {
      title: 'Tổng yêu cầu',
      value: stats.total,
      icon: Package,
      gradient: 'from-violet-500 to-purple-600',
      bgGradient: 'from-violet-50 to-purple-50 dark:from-violet-950/50 dark:to-purple-950/50'
    },
    {
      title: 'Chờ xử lý',
      value: stats.pending,
      icon: Clock,
      gradient: 'from-amber-500 to-orange-600',
      bgGradient: 'from-amber-50 to-orange-50 dark:from-amber-950/50 dark:to-orange-950/50'
    },
    {
      title: 'Đã duyệt',
      value: stats.approved,
      icon: ShieldCheck,
      gradient: 'from-blue-500 to-indigo-600',
      bgGradient: 'from-blue-50 to-indigo-50 dark:from-blue-950/50 dark:to-indigo-950/50'
    },
    {
      title: 'Hoàn thành',
      value: stats.completed,
      icon: CheckCircle,
      gradient: 'from-emerald-500 to-teal-600',
      bgGradient: 'from-emerald-50 to-teal-50 dark:from-emerald-950/50 dark:to-teal-950/50'
    }
  ]

  return (
    <div className='grid gap-6 md:grid-cols-2 lg:grid-cols-4'>
      {statCards.map((stat, index) => {
        const Icon = stat.icon
        return (
          <Card key={index} className={`relative overflow-hidden border-0 bg-gradient-to-br ${stat.bgGradient}`}>
            <CardContent className='p-6'>
              <div className='flex items-center justify-between'>
                <div className='space-y-2'>
                  <p className='text-sm font-medium text-muted-foreground'>{stat.title}</p>
                  <div className='text-2xl font-bold'>
                    {isLoading ? (
                      <div className='flex items-center'>
                        <Loader2 className='h-4 w-4 animate-spin mr-2' />
                        --
                      </div>
                    ) : (
                      stat.value.toLocaleString('vi-VN')
                    )}
                  </div>
                </div>
                <div className={`p-3 rounded-full bg-gradient-to-r ${stat.gradient}`}>
                  <Icon className='h-5 w-5 text-white' />
                </div>
              </div>
            </CardContent>
          </Card>
        )
      })}
    </div>
  )
}
