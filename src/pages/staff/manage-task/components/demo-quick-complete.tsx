import React, { useState } from 'react'
import { Button } from '@/components/ui/button'
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogTrigger, DialogFooter } from '@/components/ui/dialog'
import { Badge } from '@/components/ui/badge'
import { Zap, CheckCircle2, Clock, AlertTriangle } from 'lucide-react'
import { MilestoneUI } from '@/pages/staff/manage-task/tasks/types'
import { useStaffCompleteAllTasksForDemo } from '@/services/staff/staff-task.service'
import { toast } from 'sonner'

interface DemoQuickCompleteProps {
  orderItemId: string
  milestones: MilestoneUI[]
  currentSequence?: { milestone: number; task: number } | null
  variant?: 'default' | 'outline'
  size?: 'sm' | 'lg'
  className?: string
}

export const DemoQuickComplete: React.FC<DemoQuickCompleteProps> = ({
  orderItemId,
  milestones,
  currentSequence,
  variant = 'outline',
  size = 'sm',
  className = ''
}) => {
  const [open, setOpen] = useState(false)
  const completeAllTasksForDemoMutation = useStaffCompleteAllTasksForDemo()

  // Xác định milestone hiện tại
  const getTargetMilestone = () => {
    if (currentSequence && currentSequence.milestone > 0) {
      return milestones.find(m => m.sequenceOrder === currentSequence.milestone) || null
    } else {
      return milestones.find(m => {
        const hasIncompleteTasks = m.maternityDressTasks.some(task => 
          task.status !== 'DONE' && task.status !== 'PASS' && task.status !== 'FAIL'
        )
        return hasIncompleteTasks
      }) || null
    }
  }

  const targetMilestone = getTargetMilestone()
  const pendingTasks = targetMilestone?.maternityDressTasks.filter(
    (task) => task.status !== 'DONE' && task.status !== 'PASS' && task.status !== 'FAIL'
  ) || []

  const handleQuickComplete = () => {
    if (!targetMilestone) {
      toast.info('Không có milestone nào cần hoàn thành!')
      return
    }

    if (pendingTasks.length === 0) {
      toast.info(`Milestone "${targetMilestone.name}" đã hoàn thành tất cả task!`)
      return
    }

    completeAllTasksForDemoMutation.mutate({
      orderItemId,
      milestones,
      currentSequence
    })
    setOpen(false)
  }

  const getStatusIcon = (status: string) => {
    switch (status) {
      case 'DONE':
      case 'PASS':
      case 'FAIL':
        return <CheckCircle2 className="h-4 w-4 text-green-600" />
      case 'IN_PROGRESS':
        return <Clock className="h-4 w-4 text-blue-600" />
      default:
        return <Clock className="h-4 w-4 text-gray-400" />
    }
  }

  const getStatusBadge = (status: string) => {
    switch (status) {
      case 'DONE':
      case 'PASS':
        return <Badge className="bg-green-100 text-green-800 border-green-200">Hoàn thành</Badge>
      case 'FAIL':
        return <Badge className="bg-red-100 text-red-800 border-red-200">Fail</Badge>
      case 'IN_PROGRESS':
        return <Badge className="bg-blue-100 text-blue-800 border-blue-200">Đang thực hiện</Badge>
      default:
        return <Badge className="bg-gray-100 text-gray-800 border-gray-200">Chờ thực hiện</Badge>
    }
  }

  return (
    <Dialog open={open} onOpenChange={setOpen}>
      <DialogTrigger asChild>
        <Button
          size={size}
          variant={variant}
          className={`gap-2 bg-gradient-to-r from-yellow-50 to-orange-50 border-yellow-300 text-yellow-800 hover:bg-yellow-100 ${className}`}
          title='Hoàn thành nhanh tất cả nhiệm vụ trong milestone hiện tại cho demo (chỉ dùng cho demo)'
        >
          <Zap className='h-4 w-4' />
          Hoàn thành milestone (Demo)
        </Button>
      </DialogTrigger>
      
      <DialogContent className="max-w-2xl max-h-[80vh] overflow-y-auto">
        <DialogHeader>
          <DialogTitle className="flex items-center gap-2 text-lg">
            <Zap className="h-5 w-5 text-yellow-600" />
            Hoàn thành nhanh cho Demo
          </DialogTitle>
        </DialogHeader>

        <div className="space-y-4">
          {/* Warning */}
          <div className="bg-yellow-50 border border-yellow-200 rounded-lg p-4">
            <div className="flex items-start gap-3">
              <AlertTriangle className="h-5 w-5 text-yellow-600 mt-0.5 flex-shrink-0" />
              <div>
                <h4 className="font-semibold text-yellow-800 mb-1">⚠️ Chức năng Demo</h4>
                <p className="text-sm text-yellow-700">
                  Chức năng này chỉ dành cho mục đích demo sản phẩm. Tất cả task sẽ được hoàn thành nhanh với note "Hoàn thành nhanh cho demo".
                </p>
              </div>
            </div>
          </div>

          {/* Milestone Info */}
          {targetMilestone ? (
            <div className="space-y-4">
              <div className="bg-blue-50 border border-blue-200 rounded-lg p-4">
                <h3 className="font-semibold text-blue-800 mb-2">
                  Milestone: {targetMilestone.name}
                </h3>
                <p className="text-sm text-blue-700 mb-3">{targetMilestone.description}</p>
                <div className="flex items-center gap-4 text-sm">
                  <span className="text-blue-600">
                    <strong>{pendingTasks.length}</strong> task cần hoàn thành
                  </span>
                  <span className="text-blue-600">
                    <strong>{targetMilestone.maternityDressTasks.length - pendingTasks.length}</strong> task đã hoàn thành
                  </span>
                </div>
              </div>

              {/* Tasks List */}
              <div className="space-y-3">
                <h4 className="font-medium text-gray-900">Danh sách task sẽ được hoàn thành:</h4>
                
                {pendingTasks.length > 0 ? (
                  <div className="space-y-2 max-h-60 overflow-y-auto">
                    {pendingTasks.map((task, index) => (
                      <div
                        key={task.id}
                        className="flex items-center justify-between p-3 bg-orange-50 border border-orange-200 rounded-lg"
                      >
                        <div className="flex items-center gap-3">
                          <div className="flex items-center gap-2">
                            <span className="text-sm font-medium text-orange-800">#{index + 1}</span>
                            {getStatusIcon(task.status)}
                          </div>
                          <div>
                            <p className="font-medium text-gray-900 text-sm">{task.name}</p>
                            {task.description && (
                              <p className="text-xs text-gray-600 mt-1">{task.description}</p>
                            )}
                          </div>
                        </div>
                        <div className="flex items-center gap-2">
                          {getStatusBadge(task.status)}
                          <Badge className="bg-green-100 text-green-800 border-green-200">
                            → Hoàn thành
                          </Badge>
                        </div>
                      </div>
                    ))}
                  </div>
                ) : (
                  <div className="text-center py-6 text-gray-500">
                    <CheckCircle2 className="h-8 w-8 mx-auto mb-2 text-green-500" />
                    <p>Tất cả task trong milestone này đã hoàn thành!</p>
                  </div>
                )}
              </div>
            </div>
          ) : (
            <div className="text-center py-6 text-gray-500">
              <AlertTriangle className="h-8 w-8 mx-auto mb-2 text-yellow-500" />
              <p>Không có milestone nào cần hoàn thành!</p>
            </div>
          )}
        </div>

        <DialogFooter className="flex flex-col sm:flex-row gap-2">
          <Button
            variant="outline"
            onClick={() => setOpen(false)}
            className="w-full sm:w-auto"
          >
            Hủy
          </Button>
          <Button
            onClick={handleQuickComplete}
            disabled={completeAllTasksForDemoMutation.isPending || !targetMilestone || pendingTasks.length === 0}
            className="w-full sm:w-auto gap-2 bg-gradient-to-r from-yellow-500 to-orange-500 hover:from-yellow-600 hover:to-orange-600"
          >
            <Zap className="h-4 w-4" />
            {completeAllTasksForDemoMutation.isPending 
              ? 'Đang hoàn thành...' 
              : `Hoàn thành ${pendingTasks.length} task`
            }
          </Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  )
}
