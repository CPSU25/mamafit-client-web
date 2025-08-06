import { useState } from 'react'
import { useQueryClient } from '@tanstack/react-query'
import { toast } from 'sonner'
import { Package, User, Users, CheckCircle } from 'lucide-react'

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
      <DialogContent className='max-w-6xl max-h-[90vh] overflow-y-auto'>
        <DialogHeader>
          <DialogTitle className='flex items-center gap-2'>
            <Package className='h-5 w-5 text-blue-600' />
            Giao việc theo Milestone
          </DialogTitle>
          <p className='text-sm text-muted-foreground'>
            Giao từng milestone cho Designer hoặc Staff. Tất cả tasks trong milestone sẽ được giao cho cùng một người.
          </p>
        </DialogHeader>

        <div className='space-y-6'>
          {/* Order Info */}
          <div className='border rounded-lg p-4 bg-gray-50'>
            <h3 className='font-medium mb-3'>Thông tin Order Item</h3>
            <div className='grid grid-cols-3 gap-4 text-sm'>
              <div>
                <span className='text-muted-foreground'>Loại:</span>
                <Badge variant='secondary' className='ml-2'>
                  {orderItem.itemType}
                </Badge>
              </div>
              <div>
                <span className='text-muted-foreground'>Giá:</span>
                <span className='ml-2 font-medium'>
                  {new Intl.NumberFormat('vi-VN', { style: 'currency', currency: 'VND' }).format(orderItem.price)}
                </span>
              </div>
              <div>
                <span className='text-muted-foreground'>Số lượng:</span>
                <span className='ml-2 font-medium'>{orderItem.quantity}</span>
              </div>
            </div>
          </div>

          {/* Milestones */}
          <div className='space-y-4'>
            <div className='flex items-center justify-between'>
              <Label className='text-base font-medium'>
                Danh sách Milestones ({groupedMilestones.length} giai đoạn)
              </Label>
              <div className='flex items-center gap-2'>
                <Users className='h-4 w-4' />
                <span className='text-sm text-muted-foreground'>
                  {isLoadingUsers ? 'Đang tải...' : `${availableUsers.length} người có thể giao việc`}
                </span>
              </div>
            </div>

            <div className='space-y-4'>
              {groupedMilestones.map((milestone) => {
                const isAssigned = milestone.tasks?.some((task) => task.detail?.chargeId && task.detail?.chargeName)

                return (
                  <div key={milestone.id} className='border border-indigo-200 rounded-lg'>
                    <div className='border-l-4 border-l-indigo-500 p-4'>
                      {/* Milestone Header */}
                      <div className='flex items-start justify-between mb-4'>
                        <div className='flex items-start gap-3'>
                          <div className='w-8 h-8 bg-indigo-100 rounded-full flex items-center justify-center'>
                            <span className='text-sm font-bold text-indigo-600'>{milestone.sequenceOrder}</span>
                          </div>
                          <div>
                            <h4 className='font-semibold text-indigo-900'>{milestone.name}</h4>
                            <p className='text-sm text-muted-foreground'>{milestone.description}</p>
                            <div className='flex items-center gap-2 mt-2'>
                              <Badge variant='outline' className='text-xs'>
                                {milestone.tasks?.length || 0} tasks
                              </Badge>
                              {isAssigned && <Badge className='text-xs bg-green-600'>✓ Đã giao việc</Badge>}
                            </div>
                          </div>
                        </div>
                      </div>

                      {/* Tasks List */}
                      {milestone.tasks && milestone.tasks.length > 0 && (
                        <div className='ml-11'>
                          <Separator className='mb-3' />
                          <div className='space-y-2'>
                            <h5 className='text-sm font-medium text-muted-foreground flex items-center gap-2'>
                              <CheckCircle className='h-4 w-4' />
                              Tasks trong milestone:
                            </h5>
                            <div className='grid gap-2'>
                              {milestone.tasks
                                .sort((a, b) => a.sequenceOrder - b.sequenceOrder)
                                .map((task, index) => (
                                  <div key={task.id} className='bg-gray-50 rounded p-3 border'>
                                    <div className='flex items-start justify-between'>
                                      <div className='flex items-start gap-2'>
                                        <span className='w-5 h-5 bg-gray-200 rounded-full flex items-center justify-center text-xs font-medium'>
                                          {index + 1}
                                        </span>
                                        <div>
                                          <h6 className='font-medium text-sm'>{task.name}</h6>
                                          {task.description && (
                                            <p className='text-xs text-muted-foreground'>{task.description}</p>
                                          )}
                                        </div>
                                      </div>
                                      <div className='flex items-center gap-2'>
                                        <Badge
                                          variant={task.detail?.status === 'PENDING' ? 'secondary' : 'default'}
                                          className='text-xs'
                                        >
                                          {task.detail?.status || 'PENDING'}
                                        </Badge>
                                        {task.detail?.chargeName && (
                                          <Badge variant='outline' className='text-xs'>
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

                          {/* Assignment Section */}
                          <Separator className='my-4' />
                          {isAssigned ? (
                            <div className='bg-blue-50 border border-blue-200 rounded p-3'>
                              <div className='flex items-center gap-2 text-sm text-blue-800'>
                                <CheckCircle className='h-4 w-4' />
                                <span>
                                  <strong>Đã giao cho:</strong>{' '}
                                  {milestone.tasks?.find((t) => t.detail?.chargeName)?.detail?.chargeName}
                                </span>
                              </div>
                            </div>
                          ) : (
                            <div className='space-y-3'>
                              <Label className='text-sm font-medium'>Giao milestone này cho:</Label>
                              <Select
                                value={selectedCharges[milestone.id] || ''}
                                onValueChange={(value) => handleAssignmentChange(milestone.id, value)}
                                disabled={isLoadingUsers}
                              >
                                <SelectTrigger>
                                  <SelectValue placeholder='Chọn Designer hoặc Staff...' />
                                </SelectTrigger>
                                <SelectContent>
                                  {availableUsers.map((user) => (
                                    <SelectItem key={user.id} value={user.id}>
                                      <div className='flex items-center gap-2'>
                                        <User className='h-4 w-4' />
                                        <span>{user.fullName}</span>
                                        <Badge variant='outline' className='text-xs'>
                                          {user.roleName}
                                        </Badge>
                                      </div>
                                    </SelectItem>
                                  ))}
                                </SelectContent>
                              </Select>

                              {selectedCharges[milestone.id] && (
                                <div className='bg-green-50 border border-green-200 rounded p-3'>
                                  <div className='flex items-center gap-2 text-sm text-green-800'>
                                    <CheckCircle className='h-4 w-4' />
                                    <span>
                                      <strong>Sẽ giao cho:</strong> {getUserName(selectedCharges[milestone.id])} (
                                      {getUserRole(selectedCharges[milestone.id])})
                                    </span>
                                  </div>
                                  <p className='text-xs text-green-600 mt-1'>
                                    Người này sẽ thực hiện tất cả {milestone.tasks?.length || 0} tasks trong milestone.
                                  </p>
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

          {/* Summary */}
          {selectedCount > 0 && (
            <div className='bg-blue-50 border border-blue-200 rounded p-4'>
              <div className='flex items-start gap-3'>
                <Users className='h-5 w-5 text-blue-600 mt-0.5' />
                <div className='space-y-2'>
                  <h4 className='font-medium text-blue-900'>Tóm tắt giao việc</h4>
                  <p className='text-sm text-blue-800'>
                    Sẽ giao <strong>{selectedCount} milestone</strong> cho các người thực hiện:
                  </p>
                  <div className='space-y-2'>
                    {Object.entries(selectedCharges).map(([milestoneId, userId]) => {
                      const milestone = groupedMilestones.find((m) => m.id === milestoneId)
                      return (
                        <div key={milestoneId} className='bg-blue-100 rounded p-2 text-sm'>
                          <div className='flex justify-between'>
                            <span className='font-medium'>📋 {milestone?.name}</span>
                            <span className='text-blue-900'>👤 {getUserName(userId)}</span>
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

        <DialogFooter>
          <Button variant='outline' onClick={handleCancel} disabled={isSubmitting}>
            Hủy
          </Button>
          <Button onClick={handleSubmit} disabled={isSubmitting || selectedCount === 0} className='min-w-[120px]'>
            {isSubmitting ? 'Đang giao việc...' : `Giao ${selectedCount} milestone`}
          </Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  )
}
