import { useMemo, useEffect } from 'react'
import dayjs from 'dayjs'
import { toast } from 'sonner'

import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card'
import { Badge } from '@/components/ui/badge'
import { Separator } from '@/components/ui/separator'
import { Main } from '@/components/layout/main'
import { useAuth } from '@/context/auth-context'
import { useStaffGetOrderTasks } from '@/services/staff/staff-task.service'

export default function StaffDashboardPage() {
  const { userPermission } = useAuth()
  const { data: taskGroups = [] } = useStaffGetOrderTasks()

  const flatTasks = useMemo(() => {
    return taskGroups.flatMap((g) =>
      g.milestones.flatMap((m) =>
        m.maternityDressTasks.map((t) => ({
          task: t,
          milestoneName: m.name,
          orderCode: g.orderCode
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
    const name = userPermission?.userName || 'Staff'
    const role = userPermission?.roleName || 'Staff'
    return { name, role }
  }, [userPermission])

  return (
    <Main className='space-y-6'>
      <div className='space-y-1'>
        <h1 className='text-3xl font-bold'>Xin chào, {greeting.name}</h1>
        <p className='text-muted-foreground'>Vai trò: {greeting.role} • Hôm nay bạn có {stats.total} nhiệm vụ</p>
      </div>

      {/* Stats */}
      <div className='grid grid-cols-1 md:grid-cols-4 gap-4'>
        <Card>
          <CardHeader className='pb-2'>
            <CardTitle className='text-sm text-muted-foreground'>Tổng nhiệm vụ</CardTitle>
          </CardHeader>
          <CardContent className='text-2xl font-bold'>{stats.total}</CardContent>
        </Card>
        <Card>
          <CardHeader className='pb-2'>
            <CardTitle className='text-sm text-muted-foreground'>Chờ thực hiện</CardTitle>
          </CardHeader>
          <CardContent className='text-2xl font-bold'>{stats.pending}</CardContent>
        </Card>
        <Card>
          <CardHeader className='pb-2'>
            <CardTitle className='text-sm text-muted-foreground'>Đang thực hiện</CardTitle>
          </CardHeader>
          <CardContent className='text-2xl font-bold text-blue-600'>{stats.inProgress}</CardContent>
        </Card>
        <Card>
          <CardHeader className='pb-2'>
            <CardTitle className='text-sm text-muted-foreground'>Hoàn thành</CardTitle>
          </CardHeader>
          <CardContent className='text-2xl font-bold text-green-600'>{stats.completed}</CardContent>
        </Card>
      </div>

      {/* Near deadlines */}
      <Card>
        <CardHeader>
          <CardTitle>Nhiệm vụ cần ưu tiên</CardTitle>
        </CardHeader>
        <CardContent className='space-y-3'>
          {nearDeadlines.length === 0 ? (
            <p className='text-sm text-muted-foreground'>Không có nhiệm vụ sắp đến hạn.</p>
          ) : (
            nearDeadlines.slice(0, 8).map((x, idx) => {
              const d = dayjs(x.task.deadline as string)
              const minutes = x.minutesLeft
              const isOverdue = minutes < 0
              const badgeClass = isOverdue
                ? 'bg-red-100 text-red-700 border-red-200'
                : minutes <= 60
                  ? 'bg-yellow-100 text-yellow-800 border-yellow-200'
                  : 'bg-orange-100 text-orange-800 border-orange-200'
              const label = isOverdue
                ? `Quá hạn ${Math.abs(minutes)} phút`
                : minutes >= 60
                  ? `Còn ${Math.floor(minutes / 60)} giờ ${minutes % 60} phút`
                  : `Còn ${minutes} phút`
              return (
                <div key={idx} className='flex items-center justify-between p-3 border rounded-lg'>
                  <div className='space-y-1'>
                    <div className='text-sm font-medium'>[{x.orderCode}] {x.task.name}</div>
                    <div className='text-xs text-muted-foreground'>Milestone: {x.milestoneName}</div>
                  </div>
                  <div className='flex items-center gap-2'>
                    <Badge variant='outline' className='text-xs'>{d.format('DD/MM/YYYY HH:mm')}</Badge>
                    <Badge className={`${badgeClass} text-xs`}>{label}</Badge>
                  </div>
                </div>
              )
            })
          )}
          <Separator />
          <p className='text-xs text-muted-foreground'>SLA: Cảnh báo khi còn ≤ 4 giờ, cảnh báo gấp khi ≤ 1 giờ.</p>
        </CardContent>
      </Card>
    </Main>
  )
}


