// order-assign-dialog.tsx - Enhanced Assignment Dialog
import { useState } from 'react'
import { useQueryClient } from '@tanstack/react-query'
import { toast } from 'sonner'
import { Package, User, Users, CheckCircle, Palette, Target, Clock } from 'lucide-react'

import { AdminOrderItemWithTasks, AdminMilestone } from '@/@types/admin-task.types'

import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogFooter } from '@/components/ui/dialog'
import { Button } from '@/components/ui/button'
import { Label } from '@/components/ui/label'
import { Badge } from '@/components/ui/badge'
import { Separator } from '@/components/ui/separator'
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select'

import { useGetListUser } from '@/services/admin/manage-user.service'
import { useAssignCharge } from '@/services/admin/manage-order.service'

interface OrderAssignDialogProps {
  open: boolean
  onOpenChange: (open: boolean) => void
  orderItem: AdminOrderItemWithTasks | null
  onSuccess?: () => void
}

export function OrderAssignDialog({ open, onOpenChange, orderItem, onSuccess }: OrderAssignDialogProps) {
  const [selectedCharges, setSelectedCharges] = useState<Record<string, string>>({})
  const queryClient = useQueryClient()

  // Get list of users
  const { data: usersResponse, isLoading: isLoadingUsers } = useGetListUser({
    pageSize: 100
  })
  const availableUsers =
    usersResponse?.data?.items.filter((user) => user.roleName === 'Designer' || user.roleName === 'Staff') || []
  const assignMutation = useAssignCharge()

  // Group milestones and merge all tasks with same milestone ID
  const groupedMilestones = orderItem?.milestones
    ? orderItem.milestones
        .reduce((acc: AdminMilestone[], current: AdminMilestone) => {
          const existingIndex = acc.findIndex((m) => m.id === current.id)

          if (existingIndex >= 0) {
            // Merge tasks into existing milestone
            if (current.tasks && current.tasks.length > 0) {
              const existingTasks = acc[existingIndex].tasks || []
              acc[existingIndex].tasks = [...existingTasks, ...current.tasks]
            }
          } else {
            // Add new milestone
            acc.push({
              ...current,
              tasks: current.tasks || []
            })
          }
          return acc
        }, [])
        .sort((a, b) => a.sequenceOrder - b.sequenceOrder)
    : []

  const handleAssignmentChange = (milestoneId: string, userId: string) => {
    setSelectedCharges((prev) => ({
      ...prev,
      [milestoneId]: userId
    }))
  }

  const handleSubmit = async () => {
    if (!orderItem || Object.keys(selectedCharges).length === 0) {
      toast.error('Vui lòng chọn ít nhất một milestone để giao việc')
      return
    }

    try {
      const assignments = Object.entries(selectedCharges).map(([milestoneId, chargeId]) => ({
        chargeId,
        orderItemIds: [orderItem.id],
        milestoneId
      }))

      await assignMutation.mutateAsync(assignments)

      toast.success(`Đã giao thành công ${assignments.length} milestone`)
      queryClient.invalidateQueries({ queryKey: ['order-item', orderItem.id] })

      onSuccess?.()
      onOpenChange(false)
      setSelectedCharges({})
    } catch (error) {
      console.error('Assignment error:', error)
      toast.error('Có lỗi xảy ra khi giao việc')
    }
  }

  const handleCancel = () => {
    setSelectedCharges({})
    onOpenChange(false)
  }

  const getUserName = (userId: string) => {
    return availableUsers.find((user) => user.id === userId)?.fullName || 'Unknown'
  }

  const getUserRole = (userId: string) => {
    return availableUsers.find((user) => user.id === userId)?.roleName || ''
  }

  const isSubmitting = assignMutation.isPending
  const selectedCount = Object.keys(selectedCharges).length

  if (!orderItem) return null

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className='max-w-6xl max-h-[90vh] overflow-y-auto border-violet-200 dark:border-violet-800'>
        {/* Enhanced Header */}
        <DialogHeader className='bg-gradient-to-r from-violet-50 to-purple-50 dark:from-violet-950/30 dark:to-purple-950/30 -m-6 p-6 mb-6 border-b border-violet-200 dark:border-violet-800'>
          <DialogTitle className='flex items-center gap-3 text-xl'>
            <div className='w-10 h-10 bg-gradient-to-r from-violet-600 to-purple-600 rounded-xl flex items-center justify-center'>
              <Users className='h-5 w-5 text-white' />
            </div>
            <div>
              <div className='text-violet-700 dark:text-violet-300'>Giao việc theo Milestone</div>
              <p className='text-sm text-muted-foreground font-normal mt-1'>
                Giao từng milestone cho Designer hoặc Staff. Tất cả tasks trong milestone sẽ được giao cho cùng một
                người.
              </p>
            </div>
          </DialogTitle>
        </DialogHeader>

        <div className='space-y-8'>
          {/* Enhanced Order Info */}
          <div className='border-2 border-violet-200 dark:border-violet-700 rounded-xl p-6 bg-gradient-to-br from-violet-50 via-white to-purple-50/50 dark:from-violet-950/20 dark:via-card dark:to-purple-950/10'>
            <h3 className='font-semibold mb-4 text-violet-700 dark:text-violet-300 flex items-center'>
              <Package className='h-5 w-5 mr-2' />
              Thông tin Order Item
            </h3>
            <div className='grid grid-cols-1 md:grid-cols-3 gap-6'>
              <div className='bg-white/80 dark:bg-card/80 p-4 rounded-lg border border-violet-200 dark:border-violet-700'>
                <span className='text-sm text-muted-foreground block mb-2'>Loại sản phẩm:</span>
                <Badge
                  variant='secondary'
                  className='bg-violet-100 text-violet-700 dark:bg-violet-900/50 dark:text-violet-300'
                >
                  {orderItem.itemType}
                </Badge>
              </div>
              <div className='bg-white/80 dark:bg-card/80 p-4 rounded-lg border border-violet-200 dark:border-violet-700'>
                <span className='text-sm text-muted-foreground block mb-2'>Giá sản phẩm:</span>
                <span className='font-bold text-lg text-violet-600 dark:text-violet-400'>
                  {new Intl.NumberFormat('vi-VN', { style: 'currency', currency: 'VND' }).format(orderItem.price)}
                </span>
              </div>
              <div className='bg-white/80 dark:bg-card/80 p-4 rounded-lg border border-violet-200 dark:border-violet-700'>
                <span className='text-sm text-muted-foreground block mb-2'>Số lượng:</span>
                <span className='font-bold text-lg text-violet-600 dark:text-violet-400'>{orderItem.quantity}</span>
              </div>
            </div>
          </div>

          {/* Enhanced Milestones */}
          <div className='space-y-6'>
            <div className='flex items-center justify-between'>
              <Label className='text-lg font-semibold text-violet-700 dark:text-violet-300 flex items-center'>
                <Target className='h-5 w-5 mr-2' />
                Danh sách Milestones ({groupedMilestones.length} giai đoạn)
              </Label>
              <div className='flex items-center gap-3'>
                <div className='flex items-center gap-2'>
                  <Users className='h-4 w-4 text-violet-500' />
                  <span className='text-sm text-muted-foreground'>
                    {isLoadingUsers ? 'Đang tải...' : `${availableUsers.length} người có thể giao việc`}
                  </span>
                </div>
              </div>
            </div>

            <div className='space-y-6'>
              {groupedMilestones.map((milestone) => {
                const isAssigned = milestone.tasks?.some((task) => task.detail?.chargeId && task.detail?.chargeName)

                return (
                  <div
                    key={milestone.id}
                    className='border-2 border-violet-200 dark:border-violet-700 rounded-2xl overflow-hidden bg-gradient-to-br from-white via-violet-50/30 to-white dark:from-card dark:via-violet-950/10 dark:to-card shadow-lg'
                  >
                    <div className='border-l-4 border-l-violet-500'>
                      {/* Enhanced Milestone Header */}
                      <div className='bg-gradient-to-r from-violet-100 to-purple-100 dark:from-violet-950/30 dark:to-purple-950/30 p-6'>
                        <div className='flex items-start justify-between mb-4'>
                          <div className='flex items-start gap-4'>
                            <div className='w-12 h-12 bg-gradient-to-r from-violet-600 to-purple-600 rounded-xl flex items-center justify-center shadow-lg'>
                              <span className='text-lg font-bold text-white'>{milestone.sequenceOrder}</span>
                            </div>
                            <div className='flex-1'>
                              <h4 className='font-bold text-lg text-violet-700 dark:text-violet-300 mb-2'>
                                {milestone.name}
                              </h4>
                              <p className='text-sm text-muted-foreground mb-3'>{milestone.description}</p>
                              <div className='flex items-center gap-3'>
                                <Badge
                                  variant='outline'
                                  className='bg-violet-50 text-violet-600 border-violet-200 dark:bg-violet-950/30 dark:text-violet-400 dark:border-violet-700'
                                >
                                  <Clock className='h-3 w-3 mr-1' />
                                  {milestone.tasks?.length || 0} tasks
                                </Badge>
                                {isAssigned && (
                                  <Badge className='bg-green-500 hover:bg-green-600 text-white'>
                                    <CheckCircle className='h-3 w-3 mr-1' />
                                    Đã giao việc
                                  </Badge>
                                )}
                              </div>
                            </div>
                          </div>
                        </div>
                      </div>

                      {/* Enhanced Tasks List */}
                      {milestone.tasks && milestone.tasks.length > 0 && (
                        <div className='p-6'>
                          <div className='space-y-4'>
                            <h5 className='text-sm font-semibold text-violet-600 dark:text-violet-400 flex items-center gap-2'>
                              <CheckCircle className='h-4 w-4' />
                              Tasks trong milestone:
                            </h5>
                            <div className='grid gap-3'>
                              {milestone.tasks
                                .sort((a, b) => a.sequenceOrder - b.sequenceOrder)
                                .map((task, taskIndex) => (
                                  <div
                                    key={task.id}
                                    className='bg-gradient-to-r from-violet-50 to-purple-50/50 dark:from-violet-950/20 dark:to-purple-950/10 rounded-lg p-4 border border-violet-200 dark:border-violet-700'
                                  >
                                    <div className='flex items-start justify-between'>
                                      <div className='flex items-start gap-3 flex-1'>
                                        <div className='w-8 h-8 bg-violet-100 dark:bg-violet-900/50 rounded-lg flex items-center justify-center'>
                                          <span className='text-sm font-bold text-violet-600 dark:text-violet-400'>
                                            {taskIndex + 1}
                                          </span>
                                        </div>
                                        <div className='flex-1'>
                                          <h6 className='font-semibold text-sm text-foreground mb-1'>{task.name}</h6>
                                          {task.description && (
                                            <p className='text-xs text-muted-foreground leading-relaxed'>
                                              {task.description}
                                            </p>
                                          )}
                                        </div>
                                      </div>
                                      <div className='flex items-center gap-2'>
                                        <Badge
                                          variant={task.detail?.status === 'PENDING' ? 'secondary' : 'default'}
                                          className={`text-xs ${
                                            task.detail?.status === 'PENDING'
                                              ? 'bg-yellow-100 text-yellow-700 dark:bg-yellow-900/30 dark:text-yellow-400'
                                              : 'bg-violet-100 text-violet-700 dark:bg-violet-900/50 dark:text-violet-300'
                                          }`}
                                        >
                                          {task.detail?.status || 'PENDING'}
                                        </Badge>
                                        {task.detail?.chargeName && (
                                          <Badge
                                            variant='outline'
                                            className='text-xs bg-green-50 text-green-700 border-green-200 dark:bg-green-900/30 dark:text-green-400 dark:border-green-700'
                                          >
                                            <User className='h-3 w-3 mr-1' />
                                            {task.detail.chargeName}
                                          </Badge>
                                        )}
                                      </div>
                                    </div>
                                  </div>
                                ))}
                            </div>
                          </div>

                          {/* Enhanced Assignment Section */}
                          <Separator className='my-6 bg-violet-200 dark:bg-violet-700' />
                          {isAssigned ? (
                            <div className='bg-gradient-to-r from-green-50 to-emerald-50 dark:from-green-950/20 dark:to-emerald-950/20 border-2 border-green-200 dark:border-green-800 rounded-xl p-4'>
                              <div className='flex items-center gap-3 text-green-700 dark:text-green-300'>
                                <div className='w-8 h-8 bg-green-100 dark:bg-green-900/50 rounded-lg flex items-center justify-center'>
                                  <CheckCircle className='h-4 w-4' />
                                </div>
                                <div>
                                  <div className='font-semibold'>Đã giao việc thành công</div>
                                  <div className='text-sm'>
                                    Người thực hiện:{' '}
                                    <strong>
                                      {milestone.tasks?.find((t) => t.detail?.chargeName)?.detail?.chargeName}
                                    </strong>
                                  </div>
                                </div>
                              </div>
                            </div>
                          ) : (
                            <div className='space-y-4'>
                              <Label className='text-sm font-semibold text-violet-600 dark:text-violet-400'>
                                Giao milestone này cho:
                              </Label>
                              <Select
                                value={selectedCharges[milestone.id] || ''}
                                onValueChange={(value) => handleAssignmentChange(milestone.id, value)}
                                disabled={isLoadingUsers}
                              >
                                <SelectTrigger className='border-violet-200 dark:border-violet-700 focus:border-violet-500 dark:focus:border-violet-400'>
                                  <SelectValue placeholder='Chọn Designer hoặc Staff...' />
                                </SelectTrigger>
                                <SelectContent className='border-violet-200 dark:border-violet-800'>
                                  {availableUsers.map((user) => (
                                    <SelectItem key={user.id} value={user.id}>
                                      <div className='flex items-center gap-3'>
                                        <div className='w-8 h-8 bg-violet-100 dark:bg-violet-900/50 rounded-lg flex items-center justify-center'>
                                          <User className='h-4 w-4 text-violet-600 dark:text-violet-400' />
                                        </div>
                                        <div>
                                          <div className='font-medium'>{user.fullName}</div>
                                          <Badge
                                            variant='outline'
                                            className='text-xs bg-violet-50 text-violet-600 border-violet-200 dark:bg-violet-950/30 dark:text-violet-400 dark:border-violet-700'
                                          >
                                            {user.roleName}
                                          </Badge>
                                        </div>
                                      </div>
                                    </SelectItem>
                                  ))}
                                </SelectContent>
                              </Select>

                              {selectedCharges[milestone.id] && (
                                <div className='bg-gradient-to-r from-violet-50 to-purple-50 dark:from-violet-950/20 dark:to-purple-950/20 border-2 border-violet-200 dark:border-violet-700 rounded-xl p-4'>
                                  <div className='flex items-center gap-3 text-violet-700 dark:text-violet-300'>
                                    <div className='w-8 h-8 bg-violet-100 dark:bg-violet-900/50 rounded-lg flex items-center justify-center'>
                                      <CheckCircle className='h-4 w-4' />
                                    </div>
                                    <div>
                                      <div className='font-semibold'>
                                        Sẽ giao cho: {getUserName(selectedCharges[milestone.id])} (
                                        {getUserRole(selectedCharges[milestone.id])})
                                      </div>
                                      <div className='text-sm text-violet-600 dark:text-violet-400 mt-1'>
                                        Người này sẽ thực hiện tất cả {milestone.tasks?.length || 0} tasks trong
                                        milestone.
                                      </div>
                                    </div>
                                  </div>
                                </div>
                              )}
                            </div>
                          )}
                        </div>
                      )}
                    </div>
                  </div>
                )
              })}
            </div>
          </div>

          {/* Enhanced Summary */}
          {selectedCount > 0 && (
            <div className='bg-gradient-to-r from-violet-50 to-purple-50 dark:from-violet-950/20 dark:to-purple-950/20 border-2 border-violet-200 dark:border-violet-700 rounded-xl p-6'>
              <div className='flex items-start gap-4'>
                <div className='w-12 h-12 bg-gradient-to-r from-violet-600 to-purple-600 rounded-xl flex items-center justify-center shadow-lg'>
                  <Users className='h-6 w-6 text-white' />
                </div>
                <div className='flex-1 space-y-4'>
                  <div>
                    <h4 className='font-bold text-lg text-violet-700 dark:text-violet-300 mb-2'>Tóm tắt giao việc</h4>
                    <p className='text-violet-600 dark:text-violet-400'>
                      Sẽ giao <strong>{selectedCount} milestone</strong> cho các người thực hiện:
                    </p>
                  </div>
                  <div className='grid gap-3'>
                    {Object.entries(selectedCharges).map(([milestoneId, userId]) => {
                      const milestone = groupedMilestones.find((m) => m.id === milestoneId)
                      return (
                        <div
                          key={milestoneId}
                          className='bg-white/80 dark:bg-card/80 border border-violet-200 dark:border-violet-700 rounded-lg p-3'
                        >
                          <div className='flex justify-between items-center'>
                            <div className='flex items-center gap-2'>
                              <Palette className='h-4 w-4 text-violet-500' />
                              <span className='font-semibold text-sm'>{milestone?.name}</span>
                            </div>
                            <div className='flex items-center gap-2'>
                              <User className='h-4 w-4 text-violet-500' />
                              <span className='font-semibold text-sm text-violet-600 dark:text-violet-400'>
                                {getUserName(userId)}
                              </span>
                            </div>
                          </div>
                        </div>
                      )
                    })}
                  </div>
                </div>
              </div>
            </div>
          )}
        </div>

        {/* Enhanced Footer */}
        <DialogFooter className='border-t border-violet-200 dark:border-violet-800 pt-6 gap-3'>
          <Button
            variant='outline'
            onClick={handleCancel}
            disabled={isSubmitting}
            className='border-violet-200 dark:border-violet-700 text-violet-600 dark:text-violet-400 hover:bg-violet-50 dark:hover:bg-violet-950/20'
          >
            Hủy bỏ
          </Button>
          <Button
            onClick={handleSubmit}
            disabled={isSubmitting || selectedCount === 0}
            className='min-w-[140px] bg-gradient-to-r from-violet-600 to-purple-600 hover:from-violet-700 hover:to-purple-700 text-white shadow-lg shadow-violet-500/25'
          >
            {isSubmitting ? (
              <div className='flex items-center gap-2'>
                <div className='w-4 h-4 border-2 border-white/30 border-t-white rounded-full animate-spin' />
                Đang giao việc...
              </div>
            ) : (
              <div className='flex items-center gap-2'>
                <Users className='h-4 w-4' />
                Giao {selectedCount} milestone
              </div>
            )}
          </Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  )
}
