import { Activity, Package, Users, TrendingUp, AlertCircle, CheckCircle } from 'lucide-react'
import { Progress } from '@/components/ui/progress'
import { cn } from '@/lib/utils/utils'
import { useSidebar } from '@/components/ui/sidebar'

interface SystemStatusProps {
  role: string
}

export function SystemStatus({ role }: SystemStatusProps) {
  const { state } = useSidebar()
  const isCollapsed = state === 'collapsed'

  // Don't show when sidebar is collapsed
  if (isCollapsed) return null

  // Mock data - should be fetched from API based on role
  const getStatusData = () => {
    switch (role) {
      case 'Admin':
        return {
          title: 'Hệ thống',
          stats: [
            { label: 'Đơn hôm nay', value: 0, icon: Package, color: 'text-blue-500' },
            { label: 'Online', value: 0, icon: Users, color: 'text-green-500' },
            { label: 'Doanh thu', value: '0', icon: TrendingUp, color: 'text-violet-500' }
          ],
          systemHealth: 98
        }
      case 'BranchManager':
        return {
          title: 'Chi nhánh Q1',
          stats: [
            { label: 'Lịch hẹn', value: 0, icon: Package, color: 'text-blue-500' },
            { label: 'Đang chờ', value: 0, icon: AlertCircle, color: 'text-yellow-500' },
            { label: 'Hoàn thành', value: 0, icon: CheckCircle, color: 'text-green-500' }
          ],
          systemHealth: 92
        }
      case 'Manager':
        return {
          title: 'Sản xuất',
          stats: [
            { label: 'Đang SX', value: 0, icon: Package, color: 'text-orange-500' },
            { label: 'Chờ QC', value: 0, icon: AlertCircle, color: 'text-yellow-500' },
            { label: 'Xong', value: 0, icon: CheckCircle, color: 'text-green-500' }
          ],
          systemHealth: 87
        }
      default:
        return null
    }
  }

  const statusData = getStatusData()

  if (!statusData) return null

  const getHealthColor = (health: number) => {
    if (health >= 90) return 'bg-green-500'
    if (health >= 70) return 'bg-yellow-500'
    return 'bg-red-500'
  }

  return (
    <div className='px-3 py-3 border-t border-violet-100 dark:border-violet-900/20'>
      <div className='space-y-3'>
        {/* System Health */}
        <div className='rounded-lg bg-gradient-to-br from-violet-50 to-violet-100/30 dark:from-violet-950/30 dark:to-violet-900/20 p-3'>
          <div className='flex items-center justify-between mb-2'>
            <div className='flex items-center gap-2'>
              <Activity className='h-4 w-4 text-violet-500' />
              <span className='text-xs font-semibold'>{statusData.title}</span>
            </div>
            <span className='text-xs text-muted-foreground'>{statusData.systemHealth}%</span>
          </div>

          <Progress
            value={statusData.systemHealth}
            className={cn('h-2 bg-violet-100 dark:bg-violet-900/30', getHealthColor(statusData.systemHealth))}
          />

          <div className='mt-2 text-[10px] text-muted-foreground'>Trạng thái hoạt động tốt</div>
        </div>

        {/* Quick Stats Grid */}
        <div className='grid grid-cols-3 gap-1.5'>
          {statusData.stats.map((stat, index) => {
            const Icon = stat.icon
            return (
              <button
                key={index}
                className='flex flex-col items-center gap-1 p-2 rounded-lg bg-violet-50 dark:bg-violet-950/30 hover:bg-violet-100 dark:hover:bg-violet-900/30 transition-colors group'
              >
                <Icon className={cn('h-3.5 w-3.5 group-hover:scale-110 transition-transform', stat.color)} />
                <span className='text-xs font-bold'>{stat.value}</span>
                <span className='text-[9px] text-muted-foreground text-center leading-tight line-clamp-1'>
                  {stat.label}
                </span>
              </button>
            )
          })}
        </div>
      </div>
    </div>
  )
}
