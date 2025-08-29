import { useMemo } from 'react'
import { useNavigate } from 'react-router-dom'
import { Main } from '@/components/layout/main'
import { Button } from '@/components/ui/button'
import { Card, CardContent } from '@/components/ui/card'
import { Badge } from '@/components/ui/badge'
import { Separator } from '@/components/ui/separator'
import { ArrowRight, MessageSquare, Palette, Plus, Sparkles } from 'lucide-react'
import { useAuthStore } from '@/lib/zustand/use-auth-store'
import { useDesignerTasks } from '@/hooks/use-designer-tasks'
import { DesignRequestStats, DesignRequestGrid } from '@/pages/designer/manage-design-request/components'
import { ExtendedOrderTaskItem } from '@/pages/designer/manage-design-request/types'

export default function DesignerDashboard() {
  const navigate = useNavigate()
  const { user } = useAuthStore()
  const { data: designRequests, isLoading } = useDesignerTasks()

  // Chuẩn hóa dữ liệu từ hook (API trả về trong data.data)
  const requests: ExtendedOrderTaskItem[] = useMemo(() => {
    const arr = designRequests?.data?.data
    return Array.isArray(arr) ? (arr as ExtendedOrderTaskItem[]) : []
  }, [designRequests])

  const todaysRequests: ExtendedOrderTaskItem[] = useMemo(() => {
    const today = new Date()
    const start = new Date(today.getFullYear(), today.getMonth(), today.getDate())
    const end = new Date(today.getFullYear(), today.getMonth(), today.getDate() + 1)
    return requests.filter((r: ExtendedOrderTaskItem) => {
      const createdAt = new Date(r.orderItem.createdAt)
      return createdAt >= start && createdAt < end
    })
  }, [requests])

  const inProgress: ExtendedOrderTaskItem[] = useMemo(() => {
    return requests.filter((r: ExtendedOrderTaskItem) => {
      if (r.orderStatus) return r.orderStatus === 'IN_PROGRESS'
      const ms = r.milestones || []
      const all = ms.flatMap((m) => m.maternityDressTasks || [])
      return all.some((t) => t.status === 'IN_PROGRESS')
    })
  }, [requests])

  const recentSix: ExtendedOrderTaskItem[] = useMemo(() => {
    return [...requests]
      .sort(
        (a: ExtendedOrderTaskItem, b: ExtendedOrderTaskItem) =>
          new Date(b.orderItem.createdAt).getTime() - new Date(a.orderItem.createdAt).getTime()
      )
      .slice(0, 6)
  }, [requests])

  return (
    <Main className='space-y-6'>
      {/* Greeting & Quick Actions */}
      <div className='flex flex-col gap-4'>
        <div className='flex flex-col md:flex-row md:items-center md:justify-between gap-3'>
          <div>
            <h1 className='text-3xl font-bold tracking-tight'>
              Xin chào{user?.fullName ? `, ${user.fullName}` : user?.username ? `, ${user.username}` : ''}
            </h1>
            <p className='text-sm text-muted-foreground mt-1'>
              Chúc bạn một ngày sáng tạo! Hôm nay có {todaysRequests.length} yêu cầu mới.
            </p>
          </div>

          <div className='flex flex-wrap gap-2'>
            <Button onClick={() => navigate('/system/designer/manage-design-request')}>
              <Palette className='w-4 h-4 mr-2' />
              Quản lý yêu cầu
            </Button>
            <Button variant='secondary' onClick={() => navigate('/system/designer/manage-template')}>
              <Sparkles className='w-4 h-4 mr-2' />
              Quản lý template
            </Button>
            <Button variant='outline' onClick={() => navigate('/system/designer/messages')}>
              <MessageSquare className='w-4 h-4 mr-2' />
              Tin nhắn
            </Button>
          </div>
        </div>

        {/* Today summary */}
        <div className='grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4'>
          <Card>
            <CardContent className='p-4'>
              <div className='flex items-center justify-between'>
                <div>
                  <p className='text-sm text-muted-foreground'>Yêu cầu hôm nay</p>
                  <p className='text-2xl font-bold'>{todaysRequests.length}</p>
                </div>
                <Badge variant='secondary'>Hôm nay</Badge>
              </div>
            </CardContent>
          </Card>

          <Card>
            <CardContent className='p-4'>
              <div className='flex items-center justify-between'>
                <div>
                  <p className='text-sm text-muted-foreground'>Đang thiết kế</p>
                  <p className='text-2xl font-bold'>{inProgress.length}</p>
                </div>
                <Badge variant='outline'>Tiến độ</Badge>
              </div>
            </CardContent>
          </Card>

          <Card>
            <CardContent className='p-4'>
              <div className='flex items-center justify-between'>
                <div>
                  <p className='text-sm text-muted-foreground'>Tổng yêu cầu</p>
                  <p className='text-2xl font-bold'>{requests.length}</p>
                </div>
                <Badge variant='secondary'>Tất cả</Badge>
              </div>
            </CardContent>
          </Card>

          <Card>
            <CardContent className='p-4'>
              <div className='flex items-center justify-between'>
                <div>
                  <p className='text-sm text-muted-foreground'>Tạo nhanh</p>
                  <p className='text-2xl font-bold'>Mẫu đầm bầu</p>
                </div>
                <Button size='sm' onClick={() => navigate('/system/designer/manage-template')}>
                  <Plus className='w-4 h-4 mr-1' /> Mới
                </Button>
              </div>
            </CardContent>
          </Card>
        </div>
      </div>

      {/* Overall Stats (reuse component) */}
      <div>
        <div className='flex items-center justify-between mb-2'>
          <h2 className='text-xl font-semibold'>Thống kê yêu cầu</h2>
          <Button variant='ghost' size='sm' onClick={() => navigate('/system/designer/manage-design-request')}>
            Xem tất cả <ArrowRight className='w-4 h-4 ml-1' />
          </Button>
        </div>
        <DesignRequestStats designRequests={requests} />
      </div>

      <Separator />

      {/* Recent requests grid */}
      <div className='space-y-3'>
        <div className='flex items-center justify-between'>
          <h2 className='text-xl font-semibold'>Yêu cầu gần đây</h2>
          <Button variant='outline' size='sm' onClick={() => navigate('/system/designer/manage-design-request')}>
            Quản lý
          </Button>
        </div>

        {isLoading ? (
          <div className='text-sm text-muted-foreground py-12 text-center'>Đang tải dữ liệu...</div>
        ) : recentSix.length === 0 ? (
          <Card>
            <CardContent className='p-6 text-center text-muted-foreground'>Chưa có yêu cầu nào.</CardContent>
          </Card>
        ) : (
          <DesignRequestGrid
            requests={recentSix}
            onViewDetail={() => navigate('/system/designer/manage-design-request')}
            onStartChat={() => navigate('/system/designer/manage-design-request')}
            onQuickStart={() => navigate('/system/designer/manage-design-request')}
            onComplete={() => navigate('/system/designer/manage-design-request')}
          />
        )}
      </div>
    </Main>
  )
}
