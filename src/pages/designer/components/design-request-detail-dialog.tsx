import { useState } from 'react'
import { Dialog, DialogContent, DialogDescription, DialogHeader, DialogTitle } from '@/components/ui/dialog'
import { Badge } from '@/components/ui/badge'
import { Button } from '@/components/ui/button'
import { Progress } from '@/components/ui/progress'
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card'
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs'
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
  ExternalLink
} from 'lucide-react'
import dayjs from 'dayjs'
import { OrderTaskItem } from '@/@types/order-task.types'

// Interface mở rộng từ OrderTaskItem để bao gồm các field bổ sung
interface ExtendedOrderTaskItem extends OrderTaskItem {
  measurement?: unknown
  orderCode?: string
  addressId?: string | null
}

interface DesignRequestDetailDialogProps {
  isOpen: boolean
  onClose: () => void
  designRequest: ExtendedOrderTaskItem
}

export function DesignRequestDetailDialog({ isOpen, onClose, designRequest }: DesignRequestDetailDialogProps) {
  const [selectedImageIndex, setSelectedImageIndex] = useState(0)

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

  const calculateProgress = () => {
    const allTasks = designRequest.milestones.flatMap((m) => m.maternityDressTasks)
    if (allTasks.length === 0) return 0
    const completedTasks = allTasks.filter((task) => task.status === 'COMPLETED').length
    return Math.round((completedTasks / allTasks.length) * 100)
  }

  return (
    <Dialog open={isOpen} onOpenChange={onClose}>
      <DialogContent className='max-w-4xl max-h-[90vh] overflow-y-auto'>
        <DialogHeader>
          <DialogTitle className='flex items-center gap-2'>
            <Palette className='h-5 w-5' />
            Chi tiết Design Request - #{designRequest.orderCode || 'N/A'}
          </DialogTitle>
          <DialogDescription>Xem thông tin chi tiết và tiến độ thiết kế cho yêu cầu của khách hàng</DialogDescription>
        </DialogHeader>

        <Tabs defaultValue='overview' className='space-y-4'>
          <TabsList className='grid w-full grid-cols-3'>
            <TabsTrigger value='overview'>Tổng quan</TabsTrigger>
            <TabsTrigger value='images'>Hình ảnh tham khảo</TabsTrigger>
            <TabsTrigger value='progress'>Tiến độ thiết kế</TabsTrigger>
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
                      {designRequest.orderItem.designRequest?.description || 'Không có mô tả'}
                    </p>
                  </div>
                  <div className='grid grid-cols-2 gap-3'>
                    <div>
                      <label className='text-sm font-medium'>Loại sản phẩm:</label>
                      <p className='text-sm text-muted-foreground'>{designRequest.orderItem.itemType}</p>
                    </div>
                    <div>
                      <label className='text-sm font-medium'>Số lượng:</label>
                      <p className='text-sm text-muted-foreground'>{designRequest.orderItem.quantity}</p>
                    </div>
                  </div>
                  <div>
                    <label className='text-sm font-medium'>Giá trị:</label>
                    <p className='text-sm text-muted-foreground'>{formatCurrency(designRequest.orderItem.price)}</p>
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
                  <div>
                    <label className='text-sm font-medium'>ID khách hàng:</label>
                    <p className='text-sm text-muted-foreground'>
                      {designRequest.orderItem.designRequest?.userId || 'N/A'}
                    </p>
                  </div>
                  <div className='grid grid-cols-2 gap-3'>
                    <div>
                      <label className='text-sm font-medium'>Tạo bởi:</label>
                      <p className='text-sm text-muted-foreground'>
                        {designRequest.orderItem.designRequest?.createdBy || 'N/A'}
                      </p>
                    </div>
                    <div>
                      <label className='text-sm font-medium'>Ngày tạo:</label>
                      <p className='text-sm text-muted-foreground'>
                        {designRequest.orderItem.designRequest?.createdAt
                          ? formatDate(designRequest.orderItem.designRequest.createdAt)
                          : 'N/A'}
                      </p>
                    </div>
                  </div>
                </CardContent>
              </Card>
            </div>

            {/* Progress Overview */}
            <Card>
              <CardHeader>
                <CardTitle className='flex items-center gap-2'>
                  <Clock className='h-4 w-4' />
                  Tổng quan tiến độ
                </CardTitle>
              </CardHeader>
              <CardContent>
                <div className='space-y-3'>
                  <div className='flex items-center justify-between'>
                    <span className='text-sm font-medium'>Tiến độ hoàn thành:</span>
                    <span className='text-sm font-bold'>{calculateProgress()}%</span>
                  </div>
                  <Progress value={calculateProgress()} className='h-2' />
                  <div className='flex justify-between text-xs text-muted-foreground'>
                    <span>
                      {
                        designRequest.milestones
                          .flatMap((m) => m.maternityDressTasks)
                          .filter((t) => t.status === 'COMPLETED').length
                      }{' '}
                      /{designRequest.milestones.flatMap((m) => m.maternityDressTasks).length} công việc đã hoàn thành
                    </span>
                  </div>
                </div>
              </CardContent>
            </Card>
          </TabsContent>

          <TabsContent value='images' className='space-y-4'>
            <Card>
              <CardHeader>
                <CardTitle className='flex items-center gap-2'>
                  <ImageIcon className='h-4 w-4' />
                  Hình ảnh tham khảo ({designRequest.orderItem.designRequest?.images?.length || 0})
                </CardTitle>
              </CardHeader>
              <CardContent>
                {designRequest.orderItem.designRequest?.images &&
                designRequest.orderItem.designRequest.images.length > 0 ? (
                  <div className='space-y-4'>
                    {/* Main Image */}
                    <div className='aspect-video bg-muted rounded-lg overflow-hidden'>
                      <img
                        src={designRequest.orderItem.designRequest.images[selectedImageIndex]}
                        alt={`Reference ${selectedImageIndex + 1}`}
                        className='w-full h-full object-contain'
                      />
                    </div>

                    {/* Thumbnail Gallery */}
                    <div className='grid grid-cols-6 gap-2'>
                      {designRequest.orderItem.designRequest.images.map((image, index) => (
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
                      onClick={() =>
                        window.open(designRequest.orderItem.designRequest!.images[selectedImageIndex], '_blank')
                      }
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
              {designRequest.milestones.map((milestone) => (
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
                      {milestone.maternityDressTasks.map((task) => (
                        <div key={task.id} className='flex items-center justify-between p-3 border rounded-lg'>
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
                          {task.image && (
                            <div className='ml-4'>
                              <Button variant='outline' size='sm' onClick={() => window.open(task.image!, '_blank')}>
                                <Eye className='h-4 w-4 mr-2' />
                                Xem hình
                              </Button>
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
