import { useState } from 'react'
import { Dialog, DialogContent, DialogDescription, DialogHeader, DialogTitle } from '@/components/ui/dialog'
import { Badge } from '@/components/ui/badge'
import { Button } from '@/components/ui/button'
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card'
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs'

import { Textarea } from '@/components/ui/textarea'
import { Label } from '@/components/ui/label'
import {
  Calendar,
  User,
  FileText,
  Image as ImageIcon,
  Palette,
  CheckCircle,
  Clock,
  AlertCircle,
  Eye,
  ExternalLink,
  Edit,
  Save,
  Send
} from 'lucide-react'
import dayjs from 'dayjs'
// import { DesignerOrderTaskItemList, OrderItemOfDesigner } from '@/@types/designer-task.types'
import { useUpdateTaskStatus } from '@/hooks/use-designer-tasks'
import { CloudinarySingleImageUpload } from '@/components/cloudinary-single-image-upload'
import { useNavigate } from 'react-router-dom'
import { useCreateRoom } from '@/services/chat/chat.service'
import { useAuthStore } from '@/lib/zustand/use-auth-store'
import { toast } from 'sonner'
import { getItemTypeColor, getItemTypeLabel } from '@/pages/admin/manage-order/data/data'
import { ExtendedOrderTaskItem } from '../types'

// Interface mở rộng từ DesignerOrderTaskItemList để handle API response mới
// interface ExtendedOrderTaskItem extends Omit<DesignerOrderTaskItemList, 'orderItem'> {
//   orderItem: OrderItemOfDesigner // Thay đổi từ array thành object duy nhất
//   measurement?: unknown
//   addressId?: string | null
// }

interface DesignRequestDetailDialogProps {
  isOpen: boolean
  onClose: () => void
  designRequest: ExtendedOrderTaskItem
}

export function DesignRequestDetailDialog({ isOpen, onClose, designRequest }: DesignRequestDetailDialogProps) {
  const [selectedImageIndex, setSelectedImageIndex] = useState(0)
  const [editingTask, setEditingTask] = useState<string | null>(null)
  const [taskStatus, setTaskStatus] = useState<string>('')
  const [taskNote, setTaskNote] = useState('')
  const [taskImage, setTaskImage] = useState('')

  const navigate = useNavigate()
  const { user } = useAuthStore()
  const createRoomMutation = useCreateRoom()

  // Sử dụng hook để update task status
  const updateTaskMutation = useUpdateTaskStatus()

  // orderItem bây giờ là object duy nhất, không phải array
  const orderItem = designRequest.orderItem

  if (!orderItem || !orderItem.designRequest) {
    return null
  }

  const handleEditTask = (task: { id: string; status: string; note?: string | null; image?: string | null }) => {
    setEditingTask(task.id)
    setTaskStatus(task.status)
    setTaskNote(task.note || '')
    setTaskImage(task.image || '')
  }

  const handleSaveTask = (task: { id: string }) => {
    const body: { status: 'PENDING' | 'IN_PROGRESS' | 'DONE' | 'CANCELLED'; note?: string; image?: string } = {
      status: taskStatus as 'PENDING' | 'IN_PROGRESS' | 'DONE' | 'CANCELLED'
    }
    if (taskNote) body.note = taskNote
    if (taskImage) body.image = taskImage

    updateTaskMutation.mutate(
      {
        taskId: task.id,
        orderItemId: orderItem.id,
        body
      },
      {
        onSuccess: () => {
          setEditingTask(null)
          setTaskStatus('')
          setTaskNote('')
          setTaskImage('')
        }
      }
    )
  }

  const handleCancelEdit = () => {
    setEditingTask(null)
    setTaskStatus('')
    setTaskNote('')
    setTaskImage('')
  }

  const formatDate = (dateString: string) => {
    return dayjs(dateString).format('DD/MM/YYYY HH:mm')
  }

  const formatCurrency = (amount: number) => {
    return new Intl.NumberFormat('vi-VN', {
      style: 'currency',
      currency: 'VND'
    }).format(amount)
  }

  const getTaskStatusBadge = (status: string) => {
    switch (status) {
      case 'COMPLETED':
        return (
          <Badge variant='default' className='bg-green-500'>
            <CheckCircle className='w-3 h-3 mr-1' />
            Hoàn thành
          </Badge>
        )
      case 'IN_PROGRESS':
        return (
          <Badge variant='default' className='bg-blue-500'>
            <Clock className='w-3 h-3 mr-1' />
            Đang thực hiện
          </Badge>
        )
      case 'PENDING':
        return (
          <Badge variant='secondary'>
            <AlertCircle className='w-3 h-3 mr-1' />
            Chờ xử lý
          </Badge>
        )
      default:
        return <Badge variant='outline'>Không xác định</Badge>
    }
  }


  // Handle chat với khách hàng
  const handleChatWithCustomer = async () => {
    if (!user?.userId || !orderItem.designRequest.userId) {
      toast.error('Không thể tạo chat room: Thiếu thông tin user')
      return
    }

    try {
      console.log('Creating chat room between:', user.userId, 'and', orderItem.designRequest.userId)

      const newRoom = await createRoomMutation.mutateAsync({
        userId1: user.userId,
        userId2: orderItem.designRequest.userId
      })

      toast.success('Đã tạo chat room thành công!')

      // Navigate đến trang chat với roomId và design request context
      const chatUrl = `/system/designer/messages?roomId=${newRoom.id}&designRequestId=${orderItem.designRequest.id}&orderId=${orderItem.orderId}&orderCode=${designRequest.orderCode}`
      navigate(chatUrl)
      onClose() // Đóng dialog
    } catch (error) {
      console.error('Error creating chat room:', error)
      toast.error('Có lỗi khi tạo chat room')
    }
  }

  return (
    <Dialog open={isOpen} onOpenChange={onClose}>
      <DialogContent className='max-w-4xl max-h-[90vh] overflow-y-auto'>
        <DialogHeader>
          <div className='flex items-center justify-between'>
            <div>
              <DialogTitle className='flex items-center gap-2'>
                <Palette className='h-5 w-5' />
                Chi tiết yêu cầu thiết kế - #{designRequest.orderCode || 'N/A'}
              </DialogTitle>
              <DialogDescription>
                Xem thông tin chi tiết và tiến độ thiết kế cho yêu cầu của khách hàng
              </DialogDescription>
            </div>
            <Button
              onClick={handleChatWithCustomer}
              disabled={createRoomMutation.isPending}
              className='flex items-center gap-2'
            >
              <Send className='h-4 w-4' />
              {createRoomMutation.isPending ? 'Đang tạo...' : 'Chat với khách hàng'}
            </Button>
          </div>
        </DialogHeader>

        <Tabs defaultValue='overview' className='space-y-4'>
          <TabsList className='grid w-full grid-cols-2'>
            <TabsTrigger value='overview'>Tổng quan</TabsTrigger>
            <TabsTrigger value='images'>Hình ảnh tham khảo</TabsTrigger>
            {/* <TabsTrigger value='progress'>Tiến độ thiết kế</TabsTrigger> */}
          </TabsList>

          <TabsContent value='overview' className='space-y-4'>
            <div className='grid grid-cols-1 md:grid-cols-2 gap-4'>
              {/* Design Request Info */}
              <Card>
                <CardHeader>
                  <CardTitle className='flex items-center gap-2'>
                    <FileText className='h-4 w-4' />
                    Thông tin yêu cầu thiết kế
                  </CardTitle>
                </CardHeader>
                <CardContent className='space-y-3'>
                  <div>
                    <label className='text-sm font-medium'>Mô tả:</label>
                    <p className='text-sm text-muted-foreground mt-1'>
                      {orderItem.designRequest.description || 'Không có mô tả'}
                    </p>
                  </div>
                  <div className='grid grid-cols-2 gap-3'>
                    <div>
                      {/* <label className='text-sm font-medium'>Loại sản phẩm:</label>
                      <p className={`text-sm text-muted-foreground ${getItemTypeColor(orderItem.itemType)}`}>
                        {getItemTypeLabel(orderItem.itemType)}
                      </p> */}
                      <Badge
                        variant='secondary'
                        className={`text-xs font-medium px-3 py-1 ${getItemTypeColor(orderItem.itemType)}`}
                      >
                        <div
                          className={`w-2 h-2 rounded-full mr-2 ${
                            orderItem.itemType === 'DESIGN_REQUEST' ? 'bg-purple-500' : 'bg-gray-400'
                          }`}
                        />
                        {getItemTypeLabel(orderItem.itemType)}
                      </Badge>
                    </div>
                    {/* <div>
                      <label className='text-sm font-medium'>Số lượng:</label>
                      <p className='text-sm text-muted-foreground'>{orderItem.quantity}</p>
                    </div> */}
                  </div>
                  <div>
                    <label className='text-sm font-medium'>Phí dịch vụ đã thanh toán:</label>
                    <p className='text-sm text-muted-foreground'>{formatCurrency(orderItem.price)}</p>
                  </div>
                </CardContent>
              </Card>

              {/* Order Info */}
              <Card>
                <CardHeader>
                  <CardTitle className='flex items-center gap-2'>
                    <User className='h-4 w-4' />
                    Thông tin đơn hàng
                  </CardTitle>
                </CardHeader>
                <CardContent className='space-y-3'>
                  <div>
                    <label className='text-sm font-medium'>Mã đơn hàng:</label>
                    <p className='text-sm text-muted-foreground'>{designRequest.orderCode || 'N/A'}</p>
                  </div>
                  <div className='grid grid-cols-2 gap-3'>
                    {/* <div>
                      <label className='text-sm font-medium'>Tạo bởi:</label>
                      <p className='text-sm text-muted-foreground'>{orderItem.designRequest.createdBy || 'N/A'}</p>
                    </div> */}
                    <div>
                      <label className='text-sm font-medium'>Ngày tạo:</label>
                      <p className='text-sm text-muted-foreground'>
                        {orderItem.designRequest.createdAt ? formatDate(orderItem.designRequest.createdAt) : 'N/A'}
                      </p>
                    </div>
                  </div>
                </CardContent>
              </Card>
            </div>
          </TabsContent>

          <TabsContent value='images' className='space-y-4'>
            <Card>
              <CardHeader>
                <CardTitle className='flex items-center gap-2'>
                  <ImageIcon className='h-4 w-4' />
                  Hình ảnh tham khảo ({orderItem.designRequest.images?.length || 0})
                </CardTitle>
              </CardHeader>
              <CardContent>
                {orderItem.designRequest.images && orderItem.designRequest.images.length > 0 ? (
                  <div className='space-y-4'>
                    {/* Main Image */}
                    <div className='aspect-video bg-muted rounded-lg overflow-hidden'>
                      <img
                        src={orderItem.designRequest.images[selectedImageIndex]}
                        alt={`Reference ${selectedImageIndex + 1}`}
                        className='w-full h-full object-contain'
                      />
                    </div>

                    {/* Thumbnail Gallery */}
                    <div className='grid grid-cols-6 gap-2'>
                      {orderItem.designRequest.images.map((image: string, index: number) => (
                        <button
                          key={index}
                          onClick={() => setSelectedImageIndex(index)}
                          className={`aspect-square bg-muted rounded-lg overflow-hidden border-2 transition-colors ${
                            selectedImageIndex === index ? 'border-primary' : 'border-transparent'
                          }`}
                        >
                          <img src={image} alt={`Thumbnail ${index + 1}`} className='w-full h-full object-cover' />
                        </button>
                      ))}
                    </div>

                    {/* View Full Size Button */}
                    <Button
                      variant='outline'
                      className='w-full'
                      onClick={() => window.open(orderItem.designRequest.images![selectedImageIndex], '_blank')}
                    >
                      <ExternalLink className='h-4 w-4 mr-2' />
                      Xem kích thước đầy đủ
                    </Button>
                  </div>
                ) : (
                  <div className='text-center py-8'>
                    <ImageIcon className='h-12 w-12 mx-auto text-muted-foreground' />
                    <p className='text-muted-foreground mt-2'>Không có hình ảnh tham khảo</p>
                  </div>
                )}
              </CardContent>
            </Card>
          </TabsContent>

          <TabsContent value='progress' className='space-y-4'>
            <div className='space-y-4'>
              {designRequest.milestones?.map((milestone) => (
                <Card key={milestone.sequenceOrder}>
                  <CardHeader>
                    <CardTitle className='flex items-center justify-between'>
                      <div className='flex items-center gap-2'>
                        <span className='bg-primary text-primary-foreground rounded-full w-6 h-6 flex items-center justify-center text-sm font-bold'>
                          {milestone.sequenceOrder}
                        </span>
                        {milestone.name}
                      </div>
                    </CardTitle>
                    <CardDescription>{milestone.description}</CardDescription>
                  </CardHeader>
                  <CardContent>
                    <div className='space-y-3'>
                      {milestone.maternityDressTasks?.map((task) => (
                        <div key={task.id} className='p-3 border rounded-lg'>
                          {editingTask === task.id ? (
                            // Edit Mode
                            <div className='space-y-4'>
                              <div className='flex items-center gap-2'>
                                <h4 className='font-medium'>{task.name}</h4>
                              </div>
                              <p className='text-sm text-muted-foreground'>{task.description}</p>

                              {/* Status Buttons */}
                              <div className='space-y-2'>
                                <Label htmlFor={`status-${task.id}`}>Trạng thái:</Label>
                                <div className='flex gap-2'>
                                  <Button
                                    type='button'
                                    variant={taskStatus === 'IN_PROGRESS' ? 'default' : 'outline'}
                                    onClick={() => setTaskStatus('IN_PROGRESS')}
                                    size='sm'
                                  >
                                    <Clock className='h-4 w-4 mr-2' />
                                    Bắt đầu thiết kế
                                  </Button>
                                  <Button
                                    type='button'
                                    variant={taskStatus === 'DONE' ? 'default' : 'outline'}
                                    onClick={() => setTaskStatus('DONE')}
                                    size='sm'
                                  >
                                    <CheckCircle className='h-4 w-4 mr-2' />
                                    Hoàn thành
                                  </Button>
                                </div>
                              </div>

                              {/* Note & Image only when DONE */}
                              {taskStatus === 'DONE' && (
                                <>
                                  <div className='space-y-2'>
                                    <Label htmlFor={`note-${task.id}`}>Ghi chú:</Label>
                                    <Textarea
                                      id={`note-${task.id}`}
                                      value={taskNote}
                                      onChange={(e) => setTaskNote(e.target.value)}
                                      placeholder='Thêm ghi chú cho task...'
                                      rows={3}
                                    />
                                  </div>

                                  <div className='space-y-2'>
                                    <Label>Hình ảnh kết quả:</Label>
                                    <CloudinarySingleImageUpload
                                      value={taskImage}
                                      onChange={(url: string) => setTaskImage(url)}
                                      placeholder='Upload hình ảnh kết quả task...'
                                    />
                                  </div>
                                </>
                              )}

                              {/* Action Buttons */}
                              <div className='flex gap-2'>
                                <Button
                                  size='sm'
                                  onClick={() => handleSaveTask(task)}
                                  disabled={updateTaskMutation.isPending}
                                >
                                  <Save className='h-4 w-4 mr-2' />
                                  {updateTaskMutation.isPending ? 'Đang lưu...' : 'Lưu'}
                                </Button>
                                <Button variant='outline' size='sm' onClick={handleCancelEdit}>
                                  Hủy
                                </Button>
                              </div>
                            </div>
                          ) : (
                            // View Mode
                            <div className='flex items-center justify-between'>
                              <div className='flex-1 space-y-1'>
                                <div className='flex items-center gap-2'>
                                  <h4 className='font-medium'>{task.name}</h4>
                                  {getTaskStatusBadge(task.status)}
                                </div>
                                <p className='text-sm text-muted-foreground'>{task.description}</p>
                                {task.note && (
                                  <p className='text-xs text-muted-foreground bg-muted p-2 rounded'>
                                    <strong>Ghi chú:</strong> {task.note}
                                  </p>
                                )}
                                <div className='flex items-center gap-4 text-xs text-muted-foreground'>
                                  <span className='flex items-center gap-1'>
                                    <Calendar className='h-3 w-3' />
                                    Cập nhật: {formatDate(task.updatedAt)}
                                  </span>
                                </div>
                              </div>
                              <div className='flex gap-2 ml-4'>
                                {task.image && (
                                  <Button
                                    variant='outline'
                                    size='sm'
                                    onClick={() => window.open(task.image!, '_blank')}
                                  >
                                    <Eye className='h-4 w-4 mr-2' />
                                    Xem hình
                                  </Button>
                                )}
                                <Button variant='outline' size='sm' onClick={() => handleEditTask(task)}>
                                  <Edit className='h-4 w-4 mr-2' />
                                  Cập nhật
                                </Button>
                              </div>
                            </div>
                          )}
                        </div>
                      ))}
                    </div>
                  </CardContent>
                </Card>
              ))}
            </div>
          </TabsContent>
        </Tabs>
      </DialogContent>
    </Dialog>
  )
}
