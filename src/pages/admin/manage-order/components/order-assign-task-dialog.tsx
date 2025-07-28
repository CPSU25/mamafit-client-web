import { OrderType } from '@/@types/manage-order.types'
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogFooter } from '@/components/ui/dialog'
import { Button } from '@/components/ui/button'
import { Label } from '@/components/ui/label'
import { Checkbox } from '@/components/ui/checkbox'
import { Badge } from '@/components/ui/badge'
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card'
import { Separator } from '@/components/ui/separator'
import { useState } from 'react'
import { Package, CheckCircle, Clock, User } from 'lucide-react'

interface OrderAssignTaskDialogProps {
  open: boolean
  onOpenChange: (open: boolean) => void
  order: OrderType | null
}

// Mock milestone data - in real app this would come from API
const availableMilestones = [
  {
    id: 'ms1',
    name: 'Thiết kế sản phẩm',
    description: 'Tạo thiết kế cho sản phẩm theo yêu cầu khách hàng',
    sequenceOrder: 1,
    tasks: [
      { id: 't1', name: 'Phân tích yêu cầu khách hàng', estimatedHours: 2 },
      { id: 't2', name: 'Tạo sketch thiết kế', estimatedHours: 4 },
      { id: 't3', name: 'Hoàn thiện thiết kế', estimatedHours: 6 }
    ]
  },
  {
    id: 'ms2',
    name: 'Sản xuất',
    description: 'Tiến hành sản xuất sản phẩm theo thiết kế đã duyệt',
    sequenceOrder: 2,
    tasks: [
      { id: 't4', name: 'Chuẩn bị nguyên liệu', estimatedHours: 1 },
      { id: 't5', name: 'Cắt vải theo pattern', estimatedHours: 3 },
      { id: 't6', name: 'May sản phẩm', estimatedHours: 8 },
      { id: 't7', name: 'Hoàn thiện và ủi', estimatedHours: 2 }
    ]
  },
  {
    id: 'ms3',
    name: 'Kiểm tra chất lượng',
    description: 'Kiểm tra chất lượng sản phẩm trước khi giao hàng',
    sequenceOrder: 3,
    tasks: [
      { id: 't8', name: 'Kiểm tra kích thước', estimatedHours: 0.5 },
      { id: 't9', name: 'Kiểm tra chất lượng may', estimatedHours: 0.5 },
      { id: 't10', name: 'Kiểm tra tổng thể', estimatedHours: 1 }
    ]
  }
]

export function OrderAssignTaskDialog({ open, onOpenChange, order }: OrderAssignTaskDialogProps) {
  const [selectedMilestones, setSelectedMilestones] = useState<string[]>([])
  const [isSubmitting, setIsSubmitting] = useState(false)

  if (!order) return null

  const handleMilestoneToggle = (milestoneId: string) => {
    setSelectedMilestones((prev) =>
      prev.includes(milestoneId) ? prev.filter((id) => id !== milestoneId) : [...prev, milestoneId]
    )
  }

  const handleSubmit = async () => {
    setIsSubmitting(true)

    try {
      // TODO: Implement actual API call using AssignTask from admin.types
      console.log('Assigning tasks:', {
        orderId: order.id,
        milestoneIds: selectedMilestones
      })

      // Simulate API call
      await new Promise((resolve) => setTimeout(resolve, 1000))

      onOpenChange(false)
      setSelectedMilestones([])
      // TODO: Show success toast
      // TODO: Refresh order data
    } catch (error) {
      console.error('Error assigning tasks:', error)
      // TODO: Show error toast
    } finally {
      setIsSubmitting(false)
    }
  }

  const handleCancel = () => {
    setSelectedMilestones([])
    onOpenChange(false)
  }

  const totalEstimatedHours = selectedMilestones.reduce((total, milestoneId) => {
    const milestone = availableMilestones.find((m) => m.id === milestoneId)
    return total + (milestone?.tasks.reduce((sum, task) => sum + task.estimatedHours, 0) || 0)
  }, 0)

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className='max-w-3xl max-h-[80vh] overflow-y-auto'>
        <DialogHeader>
          <DialogTitle className='flex items-center space-x-2'>
            <Package className='h-5 w-5 text-blue-600' />
            <span>Giao nhiệm vụ cho đơn hàng #{order.code}</span>
          </DialogTitle>
        </DialogHeader>

        <div className='space-y-6'>
          {/* Order Summary */}
          <Card>
            <CardHeader className='pb-3'>
              <CardTitle className='text-sm'>Thông tin đơn hàng</CardTitle>
            </CardHeader>
            <CardContent className='space-y-2'>
              <div className='grid grid-cols-2 gap-4 text-sm'>
                <div>
                  <span className='text-muted-foreground'>Mã đơn:</span>
                  <span className='ml-2 font-medium'>#{order.code}</span>
                </div>
                <div>
                  <span className='text-muted-foreground'>Tổng tiền:</span>
                  <span className='ml-2 font-medium'>
                    {new Intl.NumberFormat('vi-VN', { style: 'currency', currency: 'VND' }).format(
                      order.totalAmount ?? 0
                    )}
                  </span>
                </div>
                <div>
                  <span className='text-muted-foreground'>Trạng thái:</span>
                  <Badge variant='secondary' className='ml-2'>
                    {order.status}
                  </Badge>
                </div>
                <div>
                  <span className='text-muted-foreground'>Phương thức giao:</span>
                  <span className='ml-2'>{order.deliveryMethod === 'DELIVERY' ? 'Giao hàng' : 'Lấy tại cửa hàng'}</span>
                </div>
              </div>
            </CardContent>
          </Card>

          {/* Milestone Selection */}
          <div className='space-y-4'>
            <div className='flex items-center justify-between'>
              <Label className='text-base font-medium'>Chọn milestone để giao</Label>
              {selectedMilestones.length > 0 && (
                <div className='flex items-center space-x-2 text-sm text-muted-foreground'>
                  <Clock className='h-4 w-4' />
                  <span>Ước tính: {totalEstimatedHours}h</span>
                </div>
              )}
            </div>

            <div className='space-y-3'>
              {availableMilestones.map((milestone) => (
                <Card
                  key={milestone.id}
                  className={`transition-colors ${
                    selectedMilestones.includes(milestone.id) ? 'border-primary bg-primary/5' : ''
                  }`}
                >
                  <CardContent className='p-4'>
                    <div className='flex items-start space-x-3'>
                      <Checkbox
                        id={milestone.id}
                        checked={selectedMilestones.includes(milestone.id)}
                        onCheckedChange={() => handleMilestoneToggle(milestone.id)}
                        className='mt-1'
                      />
                      <div className='flex-1 space-y-2'>
                        <div className='flex items-center space-x-2'>
                          <Label htmlFor={milestone.id} className='font-medium cursor-pointer'>
                            {milestone.sequenceOrder}. {milestone.name}
                          </Label>
                          <Badge variant='outline' className='text-xs'>
                            {milestone.tasks.length} nhiệm vụ
                          </Badge>
                        </div>
                        <p className='text-sm text-muted-foreground'>{milestone.description}</p>

                        {selectedMilestones.includes(milestone.id) && (
                          <div className='mt-3 space-y-2'>
                            <Separator />
                            <div className='space-y-1'>
                              <h5 className='text-sm font-medium text-muted-foreground'>
                                Các nhiệm vụ trong milestone:
                              </h5>
                              {milestone.tasks.map((task) => (
                                <div key={task.id} className='flex items-center justify-between text-sm pl-4'>
                                  <div className='flex items-center space-x-2'>
                                    <CheckCircle className='h-3 w-3 text-green-500' />
                                    <span>{task.name}</span>
                                  </div>
                                  <Badge variant='secondary' className='text-xs'>
                                    {task.estimatedHours}h
                                  </Badge>
                                </div>
                              ))}
                            </div>
                          </div>
                        )}
                      </div>
                    </div>
                  </CardContent>
                </Card>
              ))}
            </div>
          </div>

          {/* Assignment Summary */}
          {selectedMilestones.length > 0 && (
            <Card className='bg-blue-50 border-blue-200'>
              <CardContent className='p-4'>
                <div className='flex items-start space-x-3'>
                  <User className='h-5 w-5 text-blue-600 mt-0.5' />
                  <div className='space-y-2'>
                    <h4 className='font-medium text-blue-900'>Tóm tắt giao việc</h4>
                    <div className='text-sm text-blue-800 space-y-1'>
                      <p>
                        • Sẽ giao {selectedMilestones.length} milestone cho đơn hàng #{order.code}
                      </p>
                      <p>• Tổng ước tính thời gian: {totalEstimatedHours} giờ</p>
                      <p>• Các milestone sẽ được giao theo thứ tự ưu tiên</p>
                    </div>
                  </div>
                </div>
              </CardContent>
            </Card>
          )}
        </div>

        <DialogFooter className='flex space-x-2'>
          <Button variant='outline' onClick={handleCancel} disabled={isSubmitting}>
            Hủy
          </Button>
          <Button
            onClick={handleSubmit}
            disabled={isSubmitting || selectedMilestones.length === 0}
            className='min-w-[120px]'
          >
            {isSubmitting ? 'Đang giao việc...' : `Giao ${selectedMilestones.length} milestone`}
          </Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  )
}
