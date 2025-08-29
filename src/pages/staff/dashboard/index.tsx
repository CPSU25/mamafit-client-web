import { useMemo, useEffect, useCallback } from 'react'
import dayjs from 'dayjs'
import { toast } from 'sonner'
import { useNavigate } from 'react-router-dom'

import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card'
import { Badge } from '@/components/ui/badge'
import { Button } from '@/components/ui/button'
import { Main } from '@/components/layout/main'
import { useAuth } from '@/context/auth-context'
import { useStaffGetOrderTasks } from '@/services/staff/staff-task.service'
import {
  Eye,
  Clock,
  CheckCircle,
  AlertTriangle,
  ExternalLink,
  TrendingUp,
  Calendar,
  Target,
  Zap,
  ArrowRight,
  Package
} from 'lucide-react'

export default function StaffDashboardPage() {
  const { userPermission } = useAuth()
  const { data: taskGroups = [] } = useStaffGetOrderTasks()
  const navigate = useNavigate()

  const flatTasks = useMemo(() => {
    return taskGroups.flatMap((g) =>
      g.milestones.flatMap((m) =>
        m.maternityDressTasks.map((t) => ({
          task: t,
          milestoneName: m.name,
          orderCode: g.orderCode,
          orderItemId: g.orderItemId,
          preset: g.preset
        }))
      )
    )
  }, [taskGroups])

  const stats = useMemo(() => {
    const total = flatTasks.length
    const pending = flatTasks.filter((x) => x.task.status === 'PENDING').length
    const inProgress = flatTasks.filter((x) => x.task.status === 'IN_PROGRESS').length
    const completed = flatTasks.filter((x) => ['DONE', 'PASS', 'FAIL'].includes(x.task.status)).length
    return { total, pending, inProgress, completed }
  }, [flatTasks])

  const nearDeadlines = useMemo(() => {
    const now = dayjs()
    return flatTasks
      .filter((x) => ['PENDING', 'IN_PROGRESS'].includes(x.task.status) && x.task.deadline)
      .map((x) => ({
        ...x,
        minutesLeft: dayjs(x.task.deadline as string).diff(now, 'minute')
      }))
      .filter((x) => x.minutesLeft <= 240)
      .sort((a, b) => a.minutesLeft - b.minutesLeft)
  }, [flatTasks])

  useEffect(() => {
    if (nearDeadlines.length > 0) {
      const overdue = nearDeadlines.filter((x) => x.minutesLeft < 0)
      const critical = nearDeadlines.filter((x) => x.minutesLeft >= 0 && x.minutesLeft <= 60)
      if (overdue.length > 0) {
        toast.error(`Có ${overdue.length} nhiệm vụ đã quá hạn`, { duration: 4000 })
      } else if (critical.length > 0) {
        toast.warning(`Có ${critical.length} nhiệm vụ sắp đến hạn trong 1 giờ`, { duration: 4000 })
      }
    }
  }, [nearDeadlines])

  const greeting = useMemo(() => {
    const name = userPermission?.userName || 'Nhân viên'
    const role = userPermission?.roleName || 'Nhân viên'
    return { name, role }
  }, [userPermission])

  const handleViewTask = useCallback(
    (orderItemId: string) => {
      navigate(`/system/staff/order-item/${orderItemId}`)
    },
    [navigate]
  )

  const handleViewAllTasks = useCallback(() => {
    navigate('/system/staff/manage-task')
  }, [navigate])

  const getUrgencyIcon = useCallback((minutesLeft: number) => {
    if (minutesLeft < 0) return <AlertTriangle className='h-4 w-4 text-destructive' />
    if (minutesLeft <= 60) return <Zap className='h-4 w-4 text-warning' />
    if (minutesLeft <= 240) return <Clock className='h-4 w-4 text-orange-500' />
    return <Calendar className='h-4 w-4 text-blue-500' />
  }, [])

  const getUrgencyColor = useCallback((minutesLeft: number) => {
    if (minutesLeft < 0) return 'bg-destructive/10 border-destructive/20 hover:bg-destructive/20'
    if (minutesLeft <= 60) return 'bg-warning/10 border-warning/20 hover:bg-warning/20'
    if (minutesLeft <= 240) return 'bg-orange-500/10 border-orange-500/20 hover:bg-orange-500/20'
    return 'bg-blue-500/10 border-blue-500/20 hover:bg-blue-500/20'
  }, [])

  const getUrgencyBadgeColor = useCallback((minutesLeft: number) => {
    if (minutesLeft < 0) return 'bg-destructive text-destructive-foreground'
    if (minutesLeft <= 60) return 'bg-warning text-warning-foreground'
    if (minutesLeft <= 240) return 'bg-orange-500 text-white'
    return 'bg-blue-500 text-white'
  }, [])

  return (
    <Main className='space-y-6'>
      {/* Welcome Header */}
      <div className='space-y-4'>
        <div className='space-y-2'>
          <h1 className='text-2xl md:text-3xl lg:text-4xl font-bold tracking-tight'>
            Xin chào, <span className='text-primary'>{greeting.name}</span>
          </h1>
          <p className='text-base md:text-lg text-muted-foreground'>
            Vai trò:{' '}
            <span className='font-semibold text-primary'>
              {greeting.role === 'Staff' ? 'Nhân viên' : greeting.role}
            </span>{' '}
            • Hôm nay bạn có <span className='font-bold text-primary'>{stats.pending}</span> nhiệm vụ chờ thực hiện
          </p>
        </div>

        {/* Quick Actions */}
        <div className='flex flex-col sm:flex-row gap-3'>
          <Button
            onClick={handleViewAllTasks}
            className='bg-primary hover:bg-primary/90 text-primary-foreground'
            size='lg'
          >
            <Eye className='h-4 w-4 mr-2' />
            Xem tất cả công việc
          </Button>
        </div>
      </div>

      {/* Stats Cards */}
      <div className='grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4'>
        <Card
          className='hover:shadow-md transition-all duration-200 cursor-pointer border-border/50 hover:border-primary/50'
          onClick={handleViewAllTasks}
        >
          <CardHeader className='pb-2'>
            <CardTitle className='text-sm text-muted-foreground flex items-center gap-2'>
              <Package className='h-4 w-4' />
              Tổng nhiệm vụ
            </CardTitle>
          </CardHeader>
          <CardContent>
            <div className='text-2xl md:text-3xl font-bold'>{stats.total}</div>
          </CardContent>
        </Card>

        <Card
          className='hover:shadow-md transition-all duration-200 cursor-pointer border-border/50 hover:border-primary/50'
          onClick={handleViewAllTasks}
        >
          <CardHeader className='pb-2'>
            <CardTitle className='text-sm text-muted-foreground flex items-center gap-2'>
              <Clock className='h-4 w-4' />
              Chờ thực hiện
            </CardTitle>
          </CardHeader>
          <CardContent>
            <div className='text-2xl md:text-3xl font-bold text-muted-foreground'>{stats.pending}</div>
          </CardContent>
        </Card>

        <Card
          className='hover:shadow-md transition-all duration-200 cursor-pointer border-border/50 hover:border-primary/50'
          onClick={handleViewAllTasks}
        >
          <CardHeader className='pb-2'>
            <CardTitle className='text-sm text-muted-foreground flex items-center gap-2'>
              <TrendingUp className='h-4 w-4' />
              Đang thực hiện
            </CardTitle>
          </CardHeader>
          <CardContent>
            <div className='text-2xl md:text-3xl font-bold text-blue-600 dark:text-blue-400'>{stats.inProgress}</div>
          </CardContent>
        </Card>

        <Card
          className='hover:shadow-md transition-all duration-200 cursor-pointer border-border/50 hover:border-primary/50'
          onClick={handleViewAllTasks}
        >
          <CardHeader className='pb-2'>
            <CardTitle className='text-sm text-muted-foreground flex items-center gap-2'>
              <CheckCircle className='h-4 w-4' />
              Hoàn thành
            </CardTitle>
          </CardHeader>
          <CardContent>
            <div className='text-2xl md:text-3xl font-bold text-green-600 dark:text-green-400'>{stats.completed}</div>
          </CardContent>
        </Card>
      </div>

      {/* Priority Tasks */}
      <Card className='border-border/50'>
        <CardHeader className='border-b border-border/50'>
          <div className='flex flex-col sm:flex-row sm:items-center sm:justify-between gap-3'>
            <CardTitle className='flex items-center gap-2'>
              <Zap className='h-5 w-5 text-primary' />
              Nhiệm vụ cần ưu tiên
            </CardTitle>
            <Badge variant='secondary' className='w-fit'>
              {nearDeadlines.length} nhiệm vụ
            </Badge>
          </div>
        </CardHeader>
        <CardContent className='p-0'>
          {nearDeadlines.length === 0 ? (
            <div className='p-6 md:p-8 text-center'>
              <div className='w-16 h-16 bg-green-100 dark:bg-green-900/20 rounded-full flex items-center justify-center mx-auto mb-4'>
                <CheckCircle className='h-8 w-8 text-green-600 dark:text-green-400' />
              </div>
              <p className='text-lg font-medium text-green-800 dark:text-green-200 mb-2'>Tuyệt vời!</p>
              <p className='text-sm text-muted-foreground'>Không có nhiệm vụ sắp đến hạn.</p>
            </div>
          ) : (
            <div className='divide-y divide-border/50'>
              {nearDeadlines.slice(0, 8).map((x, idx) => {
                const d = dayjs(x.task.deadline as string)
                const minutes = x.minutesLeft
                const isOverdue = minutes < 0
                const label = isOverdue
                  ? `Quá hạn ${Math.abs(minutes)} phút`
                  : minutes >= 60
                    ? `Còn ${Math.floor(minutes / 60)} giờ ${minutes % 60} phút`
                    : `Còn ${minutes} phút`

                return (
                  <div
                    key={idx}
                    className={`p-4 hover:bg-muted/50 transition-colors cursor-pointer ${getUrgencyColor(minutes)}`}
                    onClick={() => handleViewTask(x.orderItemId)}
                  >
                    <div className='flex flex-col lg:flex-row lg:items-center lg:justify-between gap-4'>
                      <div className='flex-1 space-y-2'>
                        <div className='flex items-start gap-3'>
                          {getUrgencyIcon(minutes)}
                          <div className='flex-1 min-w-0'>
                            <div className='text-sm font-semibold text-foreground truncate'>
                              [{x.orderCode}] {x.task.name}
                            </div>
                            <div className='text-xs text-muted-foreground'>
                              Milestone: <span className='font-medium'>{x.milestoneName}</span>
                            </div>
                            {x.preset && (
                              <div className='text-xs text-primary font-medium truncate'>
                                Sản phẩm: {x.preset.styleName}
                              </div>
                            )}
                          </div>
                        </div>
                      </div>

                      <div className='flex flex-col sm:flex-row items-start sm:items-center gap-3'>
                        <div className='flex flex-col gap-2'>
                          <Badge variant='outline' className='text-xs w-fit'>
                            {d.format('DD/MM/YYYY HH:mm')}
                          </Badge>
                          <Badge className={`${getUrgencyBadgeColor(minutes)} text-xs w-fit`}>{label}</Badge>
                        </div>
                        <Button
                          size='sm'
                          variant='ghost'
                          className='text-primary hover:text-primary/80 hover:bg-primary/10'
                          onClick={(e) => {
                            e.stopPropagation()
                            handleViewTask(x.orderItemId)
                          }}
                        >
                          <ArrowRight className='h-4 w-4' />
                        </Button>
                      </div>
                    </div>
                  </div>
                )
              })}
            </div>
          )}

          <div className='p-4 bg-muted/30 border-t border-border/50'>
            <div className='flex flex-col sm:flex-row sm:items-center sm:justify-between gap-3'>
              <p className='text-xs text-muted-foreground'>
                <span className='font-semibold'>SLA:</span> Cảnh báo khi còn ≤ 4 giờ, cảnh báo gấp khi ≤ 1 giờ.
              </p>
              {nearDeadlines.length > 8 && (
                <Button
                  variant='link'
                  size='sm'
                  className='text-primary hover:text-primary/80 p-0 h-auto'
                  onClick={handleViewAllTasks}
                >
                  Xem tất cả ({nearDeadlines.length})
                </Button>
              )}
            </div>
          </div>
        </CardContent>
      </Card>

      {/* Quick Access */}
      <Card className='bg-muted/30 border-border/50'>
        <CardHeader>
          <CardTitle className='flex items-center gap-2'>
            <ExternalLink className='h-5 w-5' />
            Truy cập nhanh
          </CardTitle>
        </CardHeader>
        <CardContent>
          <div className='grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4'>
            <Button
              variant='outline'
              className='h-20 flex-col gap-2 bg-background hover:bg-muted/50 hover:border-primary/50 transition-all duration-200'
              onClick={() => navigate('/system/staff/manage-task')}
            >
              <Target className='h-6 w-6 text-primary' />
              <span className='font-medium'>Quản lý công việc</span>
            </Button>

            <Button
              variant='outline'
              className='h-20 flex-col gap-2 bg-background hover:bg-muted/50 hover:border-primary/50 transition-all duration-200'
              onClick={() => navigate('/system/staff/dashboard')}
            >
              <TrendingUp className='h-6 w-6 text-blue-600 dark:text-blue-400' />
              <span className='font-medium'>Thống kê</span>
            </Button>

            <Button
              variant='outline'
              className='h-20 flex-col gap-2 bg-background hover:bg-muted/50 hover:border-primary/50 transition-all duration-200'
              onClick={() => navigate('/system/staff/manage-task')}
            >
              <Calendar className='h-6 w-6 text-green-600 dark:text-green-400' />
              <span className='font-medium'>Lịch công việc</span>
            </Button>
          </div>
        </CardContent>
      </Card>
    </Main>
  )
}
