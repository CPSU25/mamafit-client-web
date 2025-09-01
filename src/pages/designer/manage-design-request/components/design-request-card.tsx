import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card'
import { Badge } from '@/components/ui/badge'
import { Button } from '@/components/ui/button'
import { Avatar, AvatarFallback } from '@/components/ui/avatar'
// import { Progress } from '@/components/ui/progress'
import { Separator } from '@/components/ui/separator'
import {
  CheckCircle,
  Clock,
  AlertCircle,
  Zap,
  MessageSquare,
  Eye,
  Play,
  Calendar,
  Camera
} from 'lucide-react'
import dayjs from 'dayjs'
import { ExtendedOrderTaskItem } from '../types'

interface DesignRequestCardProps {
  request: ExtendedOrderTaskItem
  onViewDetail: (request: ExtendedOrderTaskItem) => void
  onStartChat: (request: ExtendedOrderTaskItem) => void
  onQuickStart: (request: ExtendedOrderTaskItem) => void
  onComplete: (request: ExtendedOrderTaskItem) => void
}

export const DesignRequestCard = ({
  request,
  onViewDetail,
  onStartChat,
  onQuickStart,
  onComplete
}: DesignRequestCardProps) => {
  const taskStatus = getTaskStatus(request.milestones, request.orderStatus)
  // const progress = calculateProgress(request.milestones)
  const priority = getPriorityLevel(request)

  return (
    <Card className='group hover:shadow-xl transition-all duration-300 border-l-4 border-l-violet-500 hover:border-l-violet-600'>
      <CardHeader className='pb-3'>
        <div className='flex items-start justify-between'>
          <div className='space-y-2'>
            <CardTitle className='text-lg font-semibold text-foreground group-hover:text-violet-600 transition-colors'>
              {request.orderCode}
            </CardTitle>
            <div className='flex items-center gap-2'>
              <Avatar className='h-6 w-6'>
                <AvatarFallback className='text-xs bg-violet-100 text-violet-700'>
                  {request.orderItem.designRequest.username?.charAt(0) || 'U'}
                </AvatarFallback>
              </Avatar>
              <span className='text-sm text-muted-foreground'>
                {request.orderItem.designRequest.username || 'Khách hàng'}
              </span>
            </div>
          </div>
          <div className='flex flex-col items-end gap-2'>
            {getStatusBadge(taskStatus)}
            {getPriorityBadge(priority)}
          </div>
        </div>
      </CardHeader>

      <CardContent className='space-y-4'>
        {/* Progress */}
        {/* <div className='space-y-2'>
          <div className='flex items-center justify-between text-sm'>
            <span className='text-muted-foreground'>Tiến độ thiết kế</span>
            <span className='font-medium'>{progress}%</span>
          </div>
          <Progress value={progress} className='h-2' />
        </div> */}

        {/* Order Details */}
        <div className='grid grid-cols-2 gap-3 text-sm'>
          <div className='flex items-center gap-2 text-muted-foreground'>
            <Calendar className='w-4 h-4' />
            <span>{formatDate(request.orderItem.createdAt)}</span>
          </div>
          <div className='flex items-center gap-2 text-muted-foreground'>
            <span>Giá: {request.orderItem.price?.toLocaleString('vi-VN')} ₫</span>
          </div>
        </div>

        {/* Product Info */}
        <div className='space-y-2'>
          <div className='flex items-center gap-2'>
            <Camera className='w-4 h-4 text-muted-foreground' />
            <span className='text-sm font-medium'>Mô tả thiết kế</span>
          </div>
          <div className='text-xs text-muted-foreground'>
            {request.orderItem.designRequest.description || 'Không có mô tả'}
          </div>
          {request.orderItem.designRequest.images && request.orderItem.designRequest.images.length > 0 && (
            <div className='flex gap-1'>
              {request.orderItem.designRequest.images.slice(0, 3).map((image, index) => (
                <img
                  key={index}
                  src={image}
                  alt={`Hình ảnh thiết kế ${index + 1}`}
                  className='w-8 h-8 rounded object-cover border'
                />
              ))}
              {request.orderItem.designRequest.images.length > 3 && (
                <div className='w-8 h-8 rounded bg-muted flex items-center justify-center text-xs text-muted-foreground'>
                  +{request.orderItem.designRequest.images.length - 3}
                </div>
              )}
            </div>
          )}
        </div>

        <Separator />

        {/* Action Buttons */}
        <div className='flex flex-wrap gap-2'>
          <Button variant='outline' size='sm' onClick={() => onViewDetail(request)} className='flex-1'>
            <Eye className='w-4 h-4 mr-2' />
            Chi tiết
          </Button>

          <Button variant='outline' size='sm' onClick={() => onStartChat(request)} className='flex-1'>
            <MessageSquare className='w-4 h-4 mr-2' />
            Chat
          </Button>
        </div>

        <div className='flex gap-2'>
          {taskStatus === 'PENDING' && (
            <Button
              variant='default'
              size='sm'
              onClick={() => onQuickStart(request)}
              className='flex-1 bg-gradient-to-r from-blue-500 to-blue-600 hover:from-blue-600 hover:to-blue-700'
            >
              <Play className='w-4 h-4 mr-2' />
              Bắt đầu
            </Button>
          )}

          {taskStatus === 'IN_PROGRESS' && (
            <Button
              variant='default'
              size='sm'
              onClick={() => onComplete(request)}
              className='flex-1 bg-gradient-to-r from-green-500 to-green-600 hover:from-green-600 hover:to-green-700'
            >
              <CheckCircle className='w-4 h-4 mr-2' />
              Hoàn thành
            </Button>
          )}
        </div>
      </CardContent>
    </Card>
  )
}

// Helper functions
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

// const calculateProgress = (milestones: ExtendedOrderTaskItem['milestones']) => {
//   if (!milestones || milestones.length === 0) return 0

//   const allTasks = milestones.flatMap((m) => m.maternityDressTasks)
//   if (allTasks.length === 0) return 0

//   const completedTasks = allTasks.filter((task) => task.status === 'COMPLETED').length
//   return Math.round((completedTasks / allTasks.length) * 100)
// }

const getPriorityLevel = (request: ExtendedOrderTaskItem) => {
  const createdAt = dayjs(request.orderItem.createdAt)
  const daysSinceCreation = dayjs().diff(createdAt, 'day')

  if (daysSinceCreation > 7) return 'high'
  if (daysSinceCreation > 3) return 'medium'
  return 'low'
}

const getStatusBadge = (status: string) => {
  switch (status) {
    case 'COMPLETED':
      return (
        <Badge variant='default' className='bg-gradient-to-r from-green-500 to-emerald-600 text-white border-0'>
          <CheckCircle className='w-3 h-3 mr-1' />
          Hoàn thành
        </Badge>
      )
    case 'IN_PROGRESS':
      return (
        <Badge variant='default' className='bg-gradient-to-r from-blue-500 to-indigo-600 text-white border-0'>
          <Clock className='w-3 h-3 mr-1' />
          Đang thiết kế
        </Badge>
      )
    case 'PENDING':
      return (
        <Badge variant='secondary' className='bg-gradient-to-r from-amber-500 to-orange-600 text-white border-0'>
          <AlertCircle className='w-3 h-3 mr-1' />
          Chờ xử lý
        </Badge>
      )
    default:
      return <Badge variant='outline'>Không xác định</Badge>
  }
}

const getPriorityBadge = (priority: string) => {
  switch (priority) {
    case 'high':
      return (
        <Badge variant='destructive' className='bg-gradient-to-r from-red-500 to-pink-600 text-white border-0'>
          <Zap className='w-3 h-3 mr-1' />
          Ưu tiên cao
        </Badge>
      )
    case 'medium':
      return (
        <Badge variant='secondary' className='bg-gradient-to-r from-orange-500 to-yellow-600 text-white border-0'>
          <Clock className='w-3 h-3 mr-1' />
          Ưu tiên trung bình
        </Badge>
      )
    default:
      return null
  }
}

const formatDate = (dateString: string) => {
  return dayjs(dateString).format('DD/MM/YYYY')
}
