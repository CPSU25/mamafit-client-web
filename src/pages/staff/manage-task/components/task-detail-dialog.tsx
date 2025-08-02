import { useState } from 'react'
import { Dialog, DialogContent, DialogDescription, DialogHeader, DialogTitle } from '@/components/ui/dialog'
import { Badge } from '@/components/ui/badge'
import { Button } from '@/components/ui/button'
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card'
import { Textarea } from '@/components/ui/textarea'
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select'
import { Progress } from '@/components/ui/progress'
import { Package, FileText, Image as ImageIcon, Save, X, Edit, ShieldCheck, ShieldX } from 'lucide-react'
import { ProductTaskGroup, TaskStatus, QualityCheckStatus } from '@/pages/staff/manage-task/tasks/types'
import { CloudinarySingleImageUpload } from '@/components/cloudinary-single-image-upload'

interface TaskDetailDialogProps {
  task: ProductTaskGroup | null
  open: boolean
  onOpenChange: (open: boolean) => void
  onTaskStatusChange: (
    taskId: string,
    status: TaskStatus,
    orderItemId?: string,
    options?: {
      image?: string
      note?: string
    }
  ) => void
  isUpdating?: boolean
}

export function TaskDetailDialog({
  task,
  open,
  onOpenChange,
  onTaskStatusChange,
  isUpdating = false
}: TaskDetailDialogProps) {
  const [editingTaskId, setEditingTaskId] = useState<string | null>(null)
  const [editingNote, setEditingNote] = useState('')
  const [editingStatus, setEditingStatus] = useState<TaskStatus>('PENDING')
  const [editingImage, setEditingImage] = useState('')

  if (!task) return null

  const totalTasks = task.milestones.reduce((sum, milestone) => sum + milestone.maternityDressTasks.length, 0)
  const completedTasks = task.milestones.reduce(
    (sum, milestone) =>
      sum +
      milestone.maternityDressTasks.filter((t) => t.status === 'DONE' || t.status === 'PASS' || t.status === 'FAIL')
        .length,
    0
  )
  const progress = totalTasks > 0 ? Math.round((completedTasks / totalTasks) * 100) : 0

  const getStatusColor = (status: TaskStatus) => {
    switch (status) {
      case 'DONE':
        return 'bg-green-100 text-green-800 border-green-200'
      case 'IN_PROGRESS':
        return 'bg-blue-100 text-blue-800 border-blue-200'
      case 'PENDING':
        return 'bg-gray-100 text-gray-800 border-gray-200'
      case 'CANCELLED':
        return 'bg-red-100 text-red-800 border-red-200'
      default:
        return 'bg-gray-100 text-gray-800 border-gray-200'
    }
  }

  const getStatusText = (status: TaskStatus) => {
    switch (status) {
      case 'DONE':
        return 'Hoàn thành'
      case 'IN_PROGRESS':
        return 'Đang thực hiện'
      case 'PENDING':
        return 'Chờ thực hiện'
      case 'CANCELLED':
        return 'Đã hủy'
      default:
        return 'Không xác định'
    }
  }

  const getQualityStatusBadge = (status: QualityCheckStatus) => {
    switch (status) {
      case 'PASS':
        return (
          <Badge className='bg-green-100 text-green-800 border-green-200'>
            <ShieldCheck className='w-3 h-3 mr-1' />
            Pass
          </Badge>
        )
      case 'FAIL':
        return (
          <Badge className='bg-red-100 text-red-800 border-red-200'>
            <ShieldX className='w-3 h-3 mr-1' />
            Fail
          </Badge>
        )
    }
  }

  const handleStartEdit = (taskId: string, currentStatus: TaskStatus, currentNote: string, currentImage: string) => {
    setEditingTaskId(taskId)
    setEditingStatus(currentStatus)
    setEditingNote(currentNote || '')
    setEditingImage(currentImage || '')
  }

  const handleSaveEdit = () => {
    if (!editingTaskId) return

    // Gọi API update với status đã chỉnh sửa
    // Với Quality Check, status sẽ là PASS/FAIL thay vì DONE + qualityCheckStatus
    onTaskStatusChange(editingTaskId, editingStatus, task.orderItemId, {
      image: editingImage || undefined,
      note: editingNote || undefined
    })

    // Reset editing state
    setEditingTaskId(null)
    setEditingNote('')
    setEditingStatus('PENDING')
    setEditingImage('')
  }

  const handleCancelEdit = () => {
    setEditingTaskId(null)
    setEditingNote('')
    setEditingStatus('PENDING')
    setEditingImage('')
  }

  const isQualityCheckMilestone = (milestoneName: string) => {
    return milestoneName.toLowerCase().includes('quality') || milestoneName.toLowerCase().includes('kiểm tra')
  }

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className='max-w-4xl max-h-[80vh] overflow-y-auto'>
        <DialogHeader>
          <DialogTitle className='text-xl font-bold'>{task.preset.styleName}</DialogTitle>
          <DialogDescription>Chi tiết công việc Order Item: {task.orderItemId}</DialogDescription>
        </DialogHeader>

        <div className='space-y-6'>
          {/* Product Overview */}
          <Card>
            <CardHeader>
              <CardTitle className='flex items-center gap-2'>
                <Package className='h-5 w-5' />
                Thông tin sản phẩm
              </CardTitle>
            </CardHeader>
            <CardContent>
              <div className='flex gap-4'>
                <img
                  src={task.preset.images[0]}
                  alt={task.preset.styleName}
                  className='w-24 h-24 rounded-lg object-cover shadow-sm'
                />
                <div className='flex-1 space-y-2'>
                  <h3 className='text-lg font-semibold'>{task.preset.styleName}</h3>
                  <p className='text-lg font-bold text-primary'>
                    {new Intl.NumberFormat('vi-VN', {
                      style: 'currency',
                      currency: 'VND'
                    }).format(task.preset.price)}
                  </p>
                  <div className='flex items-center gap-4'>
                    <span className='text-sm text-muted-foreground'>Tiến độ: {progress}%</span>
                    <span className='text-sm text-muted-foreground'>
                      {completedTasks}/{totalTasks} nhiệm vụ hoàn thành
                    </span>
                  </div>
                  <Progress value={progress} className='w-full' />
                </div>
              </div>
            </CardContent>
          </Card>

          {/* Milestones and Tasks */}
          <div className='space-y-4'>
            <h3 className='text-lg font-semibold flex items-center gap-2'>
              <FileText className='h-5 w-5' />
              Quy trình thực hiện ({task.milestones.length} giai đoạn)
            </h3>

            {task.milestones
              .sort((a, b) => a.sequenceOrder - b.sequenceOrder)
              .map((milestone, index) => {
                const milestoneCompleted = milestone.maternityDressTasks.filter(
                  (t) => t.status === 'DONE' || t.status === 'PASS' || t.status === 'FAIL'
                ).length
                const milestoneTotal = milestone.maternityDressTasks.length
                const milestoneProgress = milestoneTotal > 0 ? (milestoneCompleted / milestoneTotal) * 100 : 0
                const isQualityCheck = isQualityCheckMilestone(milestone.name)

                return (
                  <Card key={`milestone-${index}`} className='overflow-hidden'>
                    <CardHeader className='bg-gradient-to-r from-blue-50 to-indigo-50'>
                      <div className='flex items-center justify-between'>
                        <CardTitle className='text-lg'>
                          {milestone.sequenceOrder}. {milestone.name}
                          {isQualityCheck && (
                            <Badge variant='outline' className='ml-2'>
                              <ShieldCheck className='w-3 h-3 mr-1' />
                              Quality Check
                            </Badge>
                          )}
                        </CardTitle>
                        <Badge variant='outline'>
                          {milestoneCompleted}/{milestoneTotal} nhiệm vụ
                        </Badge>
                      </div>
                      <p className='text-sm text-muted-foreground'>{milestone.description}</p>
                      <Progress value={milestoneProgress} className='w-full' />
                    </CardHeader>
                    <CardContent className='p-4'>
                      <div className='space-y-3'>
                        {milestone.maternityDressTasks
                          .sort((a, b) => a.sequenceOrder - b.sequenceOrder)
                          .map((taskItem) => (
                            <div
                              key={taskItem.id}
                              className='flex items-start justify-between p-4 border rounded-lg hover:bg-gray-50 transition-colors'
                            >
                              <div className='flex items-start gap-3 flex-1'>
                                <Badge variant='outline' className='text-xs font-mono mt-1'>
                                  #{taskItem.sequenceOrder}
                                </Badge>
                                <div className='flex-1'>
                                  <h4 className='font-medium'>{taskItem.name}</h4>
                                  <p className='text-sm text-muted-foreground'>{taskItem.description}</p>

                                  {editingTaskId === taskItem.id ? (
                                    // Edit Mode
                                    <div className='mt-3 space-y-3'>
                                      <div>
                                        <label className='text-sm font-medium'>Trạng thái:</label>
                                        <Select
                                          value={editingStatus}
                                          onValueChange={(value: TaskStatus) => setEditingStatus(value)}
                                        >
                                          <SelectTrigger className='w-full mt-1'>
                                            <SelectValue />
                                          </SelectTrigger>
                                          <SelectContent>
                                            {isQualityCheck ? (
                                              // Quality Check tasks có các option đặc biệt
                                              <>
                                                <SelectItem value='PENDING'>Chờ kiểm tra</SelectItem>
                                                <SelectItem value='IN_PROGRESS'>Đang kiểm tra</SelectItem>
                                                <SelectItem value='PASS'>Pass - Đạt chất lượng</SelectItem>
                                                <SelectItem value='FAIL'>Fail - Không đạt chất lượng</SelectItem>
                                              </>
                                            ) : (
                                              // Tasks thường
                                              <>
                                                <SelectItem value='PENDING'>Chờ thực hiện</SelectItem>
                                                <SelectItem value='IN_PROGRESS'>Đang thực hiện</SelectItem>
                                                <SelectItem value='DONE'>Hoàn thành</SelectItem>
                                                <SelectItem value='CANCELLED'>Đã hủy</SelectItem>
                                              </>
                                            )}
                                          </SelectContent>
                                        </Select>
                                      </div>

                                      <div>
                                        <label className='text-sm font-medium'>Ghi chú:</label>
                                        <Textarea
                                          value={editingNote}
                                          onChange={(e) => setEditingNote(e.target.value)}
                                          placeholder='Thêm ghi chú...'
                                          className='mt-1'
                                          rows={3}
                                        />
                                      </div>

                                      {(editingStatus === 'DONE' ||
                                        editingStatus === 'PASS' ||
                                        editingStatus === 'FAIL') && (
                                        <div>
                                          <label className='text-sm font-medium'>Hình ảnh kết quả:</label>
                                          <CloudinarySingleImageUpload
                                            value={editingImage}
                                            onChange={setEditingImage}
                                            className='mt-1'
                                          />
                                        </div>
                                      )}

                                      <div className='flex gap-2'>
                                        <Button size='sm' onClick={handleSaveEdit} disabled={isUpdating}>
                                          <Save className='h-4 w-4 mr-2' />
                                          {isUpdating ? 'Đang lưu...' : 'Lưu'}
                                        </Button>
                                        <Button size='sm' variant='outline' onClick={handleCancelEdit}>
                                          <X className='h-4 w-4 mr-2' />
                                          Hủy
                                        </Button>
                                      </div>
                                    </div>
                                  ) : (
                                    // View Mode
                                    <div className='mt-2 space-y-2'>
                                      {taskItem.note && (
                                        <p className='text-xs text-blue-600'>Ghi chú: {taskItem.note}</p>
                                      )}

                                      {taskItem.image && (
                                        <div className='flex items-center gap-2'>
                                          <ImageIcon className='h-4 w-4 text-muted-foreground' />
                                          <img
                                            src={taskItem.image}
                                            alt='Task result'
                                            className='w-16 h-16 rounded object-cover'
                                          />
                                        </div>
                                      )}

                                      {isQualityCheck && (taskItem.status === 'PASS' || taskItem.status === 'FAIL') && (
                                        <div className='flex items-center gap-2'>
                                          <span className='text-sm text-muted-foreground'>Kết quả:</span>
                                          {getQualityStatusBadge(taskItem.status as QualityCheckStatus)}
                                        </div>
                                      )}
                                    </div>
                                  )}
                                </div>
                              </div>

                              <div className='flex items-center gap-3'>
                                <Badge className={`${getStatusColor(taskItem.status)} border`}>
                                  {getStatusText(taskItem.status)}
                                </Badge>

                                {editingTaskId !== taskItem.id && (
                                  <Button
                                    size='sm'
                                    variant='outline'
                                    onClick={() =>
                                      handleStartEdit(
                                        taskItem.id,
                                        taskItem.status,
                                        taskItem.note || '',
                                        taskItem.image || ''
                                      )
                                    }
                                  >
                                    <Edit className='h-4 w-4 mr-2' />
                                    Sửa
                                  </Button>
                                )}
                              </div>
                            </div>
                          ))}
                      </div>
                    </CardContent>
                  </Card>
                )
              })}
          </div>
        </div>
      </DialogContent>
    </Dialog>
  )
}
