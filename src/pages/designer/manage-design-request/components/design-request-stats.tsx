import { Card, CardContent } from '@/components/ui/card'
import { Badge } from '@/components/ui/badge'
import { CheckCircle, AlertCircle, Target, Palette } from 'lucide-react'
import { ExtendedOrderTaskItem } from '../types'

interface DesignRequestStatsProps {
  designRequests: ExtendedOrderTaskItem[]
}

export const DesignRequestStats = ({ designRequests }: DesignRequestStatsProps) => {
  // Calculate stats
  const totalRequests = designRequests.length
  const pendingRequests = designRequests.filter(req => {
    const status = getTaskStatus(req.milestones, req.orderStatus)
    return status === 'PENDING'
  }).length
  const inProgressRequests = designRequests.filter(req => {
    const status = getTaskStatus(req.milestones, req.orderStatus)
    return status === 'IN_PROGRESS'
  }).length
  const completedRequests = designRequests.filter(req => {
    const status = getTaskStatus(req.milestones, req.orderStatus)
    return status === 'COMPLETED'
  }).length

  const completionRate = totalRequests > 0 ? Math.round((completedRequests / totalRequests) * 100) : 0

  return (
    <div className='grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4 mb-6'>
      <Card className='border-violet-200 dark:border-violet-800 bg-gradient-to-br from-violet-50 to-white dark:from-violet-950/30 dark:to-background hover:shadow-lg transition-all duration-300'>
        <CardContent className='p-4'>
          <div className='flex items-center justify-between'>
            <div className='space-y-1'>
              <p className='text-sm font-medium text-muted-foreground'>Tổng yêu cầu</p>
              <p className='text-2xl font-bold text-violet-600 dark:text-violet-400'>{totalRequests}</p>
            </div>
            <div className='h-12 w-12 rounded-full bg-violet-100 dark:bg-violet-900/30 flex items-center justify-center'>
              <Target className='h-6 w-6 text-violet-600 dark:text-violet-400' />
            </div>
          </div>
        </CardContent>
      </Card>

      <Card className='border-orange-200 dark:border-orange-800 bg-gradient-to-br from-orange-50 to-white dark:from-orange-950/30 dark:to-background hover:shadow-lg transition-all duration-300'>
        <CardContent className='p-4'>
          <div className='flex items-center justify-between'>
            <div className='space-y-1'>
              <p className='text-sm font-medium text-muted-foreground'>Chờ xử lý</p>
              <p className='text-2xl font-bold text-orange-600 dark:text-orange-400'>{pendingRequests}</p>
            </div>
            <div className='h-12 w-12 rounded-full bg-orange-100 dark:bg-orange-900/30 flex items-center justify-center'>
              <AlertCircle className='h-6 w-6 text-orange-600 dark:text-orange-400' />
            </div>
          </div>
        </CardContent>
      </Card>

      <Card className='border-blue-200 dark:border-blue-800 bg-gradient-to-br from-blue-50 to-white dark:from-blue-950/30 dark:to-background hover:shadow-lg transition-all duration-300'>
        <CardContent className='p-4'>
          <div className='flex items-center justify-between'>
            <div className='space-y-1'>
              <p className='text-sm font-medium text-muted-foreground'>Đang thiết kế</p>
              <p className='text-2xl font-bold text-blue-600 dark:text-blue-400'>{inProgressRequests}</p>
            </div>
            <div className='h-12 w-12 rounded-full bg-blue-100 dark:bg-blue-900/30 flex items-center justify-center'>
              <Palette className='h-6 w-6 text-blue-600 dark:text-blue-400' />
            </div>
          </div>
        </CardContent>
      </Card>

      <Card className='border-green-200 dark:border-green-800 bg-gradient-to-br from-green-50 to-white dark:from-green-950/30 dark:to-background hover:shadow-lg transition-all duration-300'>
        <CardContent className='p-4'>
          <div className='flex items-center justify-between'>
            <div className='space-y-1'>
              <p className='text-sm font-medium text-muted-foreground'>Hoàn thành</p>
              <p className='text-2xl font-bold text-green-600 dark:text-green-400'>{completedRequests}</p>
              <Badge variant='outline' className='text-xs border-green-300 text-green-700 dark:text-green-400'>
                {completionRate}% hoàn thành
              </Badge>
            </div>
            <div className='h-12 w-12 rounded-full bg-green-100 dark:bg-green-900/30 flex items-center justify-center'>
              <CheckCircle className='h-6 w-6 text-green-600 dark:text-green-400' />
            </div>
          </div>
        </CardContent>
      </Card>
    </div>
  )
}

// Helper function to get task status
const getTaskStatus = (milestones: ExtendedOrderTaskItem['milestones'], orderStatus?: string) => {
  // Nếu có orderStatus từ API, sử dụng nó
  if (orderStatus) {
    switch (orderStatus) {
      case 'COMPLETED':
        return 'COMPLETED'
      case 'IN_PROGRESS':
        return 'IN_PROGRESS'
      case 'PENDING':
        return 'PENDING'
      default:
        break
    }
  }

  // Fallback về logic cũ nếu không có orderStatus
  if (!milestones || milestones.length === 0) return 'PENDING'

  const allTasks = milestones.flatMap((m) => m.maternityDressTasks)
  if (allTasks.every((task) => task.status === 'COMPLETED')) return 'COMPLETED'
  if (allTasks.some((task) => task.status === 'IN_PROGRESS')) return 'IN_PROGRESS'
  return 'PENDING'
}
