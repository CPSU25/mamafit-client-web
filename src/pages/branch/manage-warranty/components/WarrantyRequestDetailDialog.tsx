import { useState } from 'react'
import { Dialog, DialogContent, DialogHeader, DialogTitle } from '@/components/ui/dialog'
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card'
import { Badge } from '@/components/ui/badge'
import { Button } from '@/components/ui/button'
import { Separator } from '@/components/ui/separator'
import { ScrollArea } from '@/components/ui/scroll-area'
import {
  User,
  Phone,
  Mail,
  Package,
  Clock,
  CheckCircle,
  XCircle,
  AlertTriangle,
  Factory,
  Building,
  Image as ImageIcon,
  Video,
  FileText,
  Eye,
  Loader2
} from 'lucide-react'

import { useWarrantyRequestById } from '@/services/global/warranty.service'
import { StatusWarrantyRequest, StatusWarrantyRequestItem, DestinationType } from '@/@types/warranty-request.types'
import { VideoThumbnail, VideoViewerDialog } from '@/components/video-viewer'

interface WarrantyRequestDetailDialogProps {
  open: boolean
  onOpenChange: (open: boolean) => void
  warrantyRequestId: string
}

export function WarrantyRequestDetailDialog({
  open,
  onOpenChange,
  warrantyRequestId
}: WarrantyRequestDetailDialogProps) {
  const [selectedImages, setSelectedImages] = useState<string[]>([])
  const [selectedVideos, setSelectedVideos] = useState<string[]>([])
  const [mediaViewerOpen, setMediaViewerOpen] = useState(false)
  const [videoViewerOpen, setVideoViewerOpen] = useState(false)
  const [currentVideo, setCurrentVideo] = useState<string>('')

  const {
    data: warrantyRequest,
    isLoading,
    error
  } = useWarrantyRequestById(warrantyRequestId, {
    enabled: open && !!warrantyRequestId
  })

  // Status configuration helpers
  const getStatusConfig = (status: StatusWarrantyRequest) => {
    const configs = {
      [StatusWarrantyRequest.PENDING]: {
        label: 'Chờ xử lý',
        color: 'bg-amber-100 text-amber-800 dark:bg-amber-900/30 dark:text-amber-400',
        icon: Clock
      },
      [StatusWarrantyRequest.APPROVED]: {
        label: 'Đã duyệt',
        color: 'bg-blue-100 text-blue-800 dark:bg-blue-900/30 dark:text-blue-400',
        icon: CheckCircle
      },
      [StatusWarrantyRequest.REPAIRING]: {
        label: 'Đang sửa chữa',
        color: 'bg-indigo-100 text-indigo-800 dark:bg-indigo-900/30 dark:text-indigo-400',
        icon: Package
      },
      [StatusWarrantyRequest.COMPLETED]: {
        label: 'Hoàn thành',
        color: 'bg-emerald-100 text-emerald-800 dark:bg-emerald-900/30 dark:text-emerald-400',
        icon: CheckCircle
      },
      [StatusWarrantyRequest.REJECTED]: {
        label: 'Từ chối',
        color: 'bg-red-100 text-red-800 dark:bg-red-900/30 dark:text-red-400',
        icon: XCircle
      },
      [StatusWarrantyRequest.PARTIALLY_REJECTED]: {
        label: 'Từ chối một phần',
        color: 'bg-orange-100 text-orange-800 dark:bg-orange-900/30 dark:text-orange-400',
        icon: AlertTriangle
      },
      [StatusWarrantyRequest.CANCELLED]: {
        label: 'Đã hủy',
        color: 'bg-gray-100 text-gray-800 dark:bg-gray-900/30 dark:text-gray-400',
        icon: XCircle
      }
    }
    return configs[status] || configs[StatusWarrantyRequest.PENDING]
  }

  const getItemStatusConfig = (status: StatusWarrantyRequestItem) => {
    const configs = {
      [StatusWarrantyRequestItem.PENDING]: {
        label: 'Chờ xử lý',
        color: 'bg-amber-100 text-amber-800 dark:bg-amber-900/30 dark:text-amber-400'
      },
      [StatusWarrantyRequestItem.APPROVED]: {
        label: 'Đã duyệt',
        color: 'bg-blue-100 text-blue-800 dark:bg-blue-900/30 dark:text-blue-400'
      },
      [StatusWarrantyRequestItem.REJECTED]: {
        label: 'Từ chối',
        color: 'bg-red-100 text-red-800 dark:bg-red-900/30 dark:text-red-400'
      },
      [StatusWarrantyRequestItem.IN_TRANSIT]: {
        label: 'Đang vận chuyển',
        color: 'bg-purple-100 text-purple-800 dark:bg-purple-900/30 dark:text-purple-400'
      }
    }
    return configs[status] || configs[StatusWarrantyRequestItem.PENDING]
  }

  const openMediaViewer = (images?: string[], videos?: string[]) => {
    setSelectedImages(images || [])
    setSelectedVideos(videos || [])
    setMediaViewerOpen(true)
  }

  const openVideoViewer = (videoUrl: string) => {
    setCurrentVideo(videoUrl)
    setVideoViewerOpen(true)
  }

  if (isLoading) {
    return (
      <Dialog open={open} onOpenChange={onOpenChange}>
        <DialogContent className='max-w-4xl max-h-[90vh]'>
          <div className='flex items-center justify-center py-8'>
            <Loader2 className='h-8 w-8 animate-spin' />
            <span className='ml-2'>Đang tải chi tiết...</span>
          </div>
        </DialogContent>
      </Dialog>
    )
  }

  if (error || !warrantyRequest) {
    return (
      <Dialog open={open} onOpenChange={onOpenChange}>
        <DialogContent className='max-w-4xl max-h-[90vh]'>
          <div className='flex items-center justify-center py-8 text-red-500'>
            <XCircle className='h-8 w-8 mr-2' />
            Không thể tải chi tiết yêu cầu bảo hành
          </div>
        </DialogContent>
      </Dialog>
    )
  }

  const statusConfig = getStatusConfig(warrantyRequest.status)
  const StatusIcon = statusConfig.icon

  return (
    <>
      <Dialog open={open} onOpenChange={onOpenChange}>
        <DialogContent className='max-w-6xl max-h-[90vh] overflow-hidden'>
          <DialogHeader>
            <DialogTitle className='flex items-center gap-3'>
              <Package className='h-6 w-6' />
              Chi tiết yêu cầu bảo hành - {warrantyRequest.sku}
            </DialogTitle>
          </DialogHeader>

          <ScrollArea className='max-h-[calc(90vh-100px)]'>
            <div className='space-y-6 pr-4'>
              {/* Status và thông tin chính */}
              <div className='grid grid-cols-1 md:grid-cols-2 gap-6'>
                <Card>
                  <CardHeader>
                    <CardTitle className='flex items-center gap-2'>
                      <StatusIcon className='h-5 w-5' />
                      Trạng thái & Thông tin chính
                    </CardTitle>
                  </CardHeader>
                  <CardContent className='space-y-4'>
                    <div className='flex items-center gap-2'>
                      <span className='text-sm font-medium'>Trạng thái:</span>
                      <Badge className={statusConfig.color}>
                        <StatusIcon className='h-3 w-3 mr-1' />
                        {statusConfig.label}
                      </Badge>
                    </div>

                    <div className='space-y-2'>
                      <div className='flex justify-between'>
                        <span className='text-sm text-muted-foreground'>SKU:</span>
                        <span className='font-medium'>{warrantyRequest.sku}</span>
                      </div>
                      <div className='flex justify-between'>
                        <span className='text-sm text-muted-foreground'>Lần bảo hành:</span>
                        <span className='font-medium'>{warrantyRequest.warrantyRound}</span>
                      </div>
                      <div className='flex justify-between'>
                        <span className='text-sm text-muted-foreground'>Số sản phẩm:</span>
                        <span className='font-medium'>{warrantyRequest.countItem}</span>
                      </div>
                      {warrantyRequest.totalFee && (
                        <div className='flex justify-between'>
                          <span className='text-sm text-muted-foreground'>Tổng phí:</span>
                          <span className='font-medium text-red-600'>
                            {warrantyRequest.totalFee.toLocaleString('vi-VN')} ₫
                          </span>
                        </div>
                      )}
                    </div>

                    <Separator />

                    <div className='space-y-2'>
                      <div className='flex justify-between'>
                        <span className='text-sm text-muted-foreground'>Ngày tạo:</span>
                        <span className='font-medium'>
                          {new Date(warrantyRequest.createdAt).toLocaleDateString('vi-VN')}
                        </span>
                      </div>
                      <div className='flex justify-between'>
                        <span className='text-sm text-muted-foreground'>Cập nhật:</span>
                        <span className='font-medium'>
                          {new Date(warrantyRequest.updatedAt).toLocaleDateString('vi-VN')}
                        </span>
                      </div>
                    </div>
                  </CardContent>
                </Card>

                <Card>
                  <CardHeader>
                    <CardTitle className='flex items-center gap-2'>
                      <User className='h-5 w-5' />
                      Thông tin khách hàng
                    </CardTitle>
                  </CardHeader>
                  <CardContent className='space-y-4'>
                    <div className='space-y-3'>
                      <div className='flex items-center gap-3'>
                        <User className='h-4 w-4 text-muted-foreground' />
                        <div>
                          <p className='font-medium'>{warrantyRequest.customer.fullName}</p>
                          <p className='text-sm text-muted-foreground'>Khách hàng</p>
                        </div>
                      </div>

                      <div className='flex items-center gap-3'>
                        <Phone className='h-4 w-4 text-muted-foreground' />
                        <div>
                          <p className='font-medium'>{warrantyRequest.customer.phoneNumber}</p>
                          <p className='text-sm text-muted-foreground'>Số điện thoại</p>
                        </div>
                      </div>

                      <div className='flex items-center gap-3'>
                        <Mail className='h-4 w-4 text-muted-foreground' />
                        <div>
                          <p className='font-medium'>{warrantyRequest.customer.userEmail}</p>
                          <p className='text-sm text-muted-foreground'>Email</p>
                        </div>
                      </div>
                    </div>
                  </CardContent>
                </Card>
              </div>

              {/* Ghi chú nội bộ */}
              {warrantyRequest.noteInternal && (
                <Card>
                  <CardHeader>
                    <CardTitle className='flex items-center gap-2'>
                      <FileText className='h-5 w-5' />
                      Ghi chú nội bộ
                    </CardTitle>
                  </CardHeader>
                  <CardContent>
                    <p className='text-sm'>{warrantyRequest.noteInternal}</p>
                  </CardContent>
                </Card>
              )}

              {/* Danh sách sản phẩm */}
              <Card>
                <CardHeader>
                  <CardTitle className='flex items-center gap-2'>
                    <Package className='h-5 w-5' />
                    Danh sách sản phẩm ({warrantyRequest.items?.length || 0})
                  </CardTitle>
                </CardHeader>
                <CardContent>
                  <div className='space-y-4'>
                    {warrantyRequest.items?.length > 0 ? (
                      warrantyRequest.items.map((item, index) => {
                        const itemStatusConfig = getItemStatusConfig(item.status)
                        return (
                          <div key={index} className='border rounded-lg p-4 space-y-3'>
                            <div className='flex items-center justify-between'>
                              <div className='flex items-center gap-2'>
                                <Badge className={itemStatusConfig.color}>{itemStatusConfig.label}</Badge>
                                {item.destinationType === DestinationType.FACTORY ? (
                                  <Badge variant='outline' className='flex items-center gap-1'>
                                    <Factory className='h-3 w-3' />
                                    Nhà máy
                                  </Badge>
                                ) : (
                                  <Badge variant='outline' className='flex items-center gap-1'>
                                    <Building className='h-3 w-3' />
                                    Chi nhánh
                                  </Badge>
                                )}
                              </div>
                              <div className='flex gap-2'>
                                {(item.images?.length || 0) > 0 && (
                                  <Button variant='outline' size='sm' onClick={() => openMediaViewer(item.images, [])}>
                                    <Eye className='h-4 w-4 mr-1' />
                                    Hình ảnh ({item.images?.length || 0})
                                  </Button>
                                )}
                                {(item.videos?.length || 0) > 0 && (
                                  <Button variant='outline' size='sm' onClick={() => openMediaViewer([], item.videos)}>
                                    <Video className='h-4 w-4 mr-1' />
                                    Video ({item.videos?.length || 0})
                                  </Button>
                                )}
                              </div>
                            </div>

                            <div className='space-y-2'>
                              <p className='text-sm'>
                                <strong>Mô tả:</strong> {item.description}
                              </p>

                              {/* Media Preview */}
                              {((item.images?.length || 0) > 0 || (item.videos?.length || 0) > 0) && (
                                <div className='space-y-2'>
                                  {/* Images Preview */}
                                  {(item.images?.length || 0) > 0 && (
                                    <div>
                                      <p className='text-xs text-muted-foreground mb-1'>Hình ảnh:</p>
                                      <div className='flex gap-2 flex-wrap'>
                                        {item.images
                                          ?.slice(0, 3)
                                          .map((image, imgIndex) => (
                                            <img
                                              key={imgIndex}
                                              src={image}
                                              alt={`Item image ${imgIndex + 1}`}
                                              className='w-12 h-12 object-cover rounded border cursor-pointer hover:opacity-80 transition-opacity'
                                              onClick={() => openMediaViewer(item.images, [])}
                                            />
                                          ))}
                                        {(item.images?.length || 0) > 3 && (
                                          <div className='w-12 h-12 bg-muted rounded border flex items-center justify-center text-xs text-muted-foreground'>
                                            +{(item.images?.length || 0) - 3}
                                          </div>
                                        )}
                                      </div>
                                    </div>
                                  )}

                                  {/* Videos Preview */}
                                  {(item.videos?.length || 0) > 0 && (
                                    <div>
                                      <p className='text-xs text-muted-foreground mb-1'>Video:</p>
                                      <div className='flex gap-2 flex-wrap'>
                                        {item.videos
                                          ?.slice(0, 3)
                                          .map((video, videoIndex) => (
                                            <VideoThumbnail
                                              key={videoIndex}
                                              src={video}
                                              title={`Video ${videoIndex + 1}`}
                                              width={48}
                                              height={48}
                                              onClick={() => openVideoViewer(video)}
                                              className='rounded border'
                                            />
                                          ))}
                                        {(item.videos?.length || 0) > 3 && (
                                          <div className='w-12 h-12 bg-muted rounded border flex items-center justify-center text-xs text-muted-foreground'>
                                            +{(item.videos?.length || 0) - 3}
                                          </div>
                                        )}
                                      </div>
                                    </div>
                                  )}
                                </div>
                              )}

                              {item.trackingCode && (
                                <p className='text-sm'>
                                  <strong>Mã vận chuyển:</strong>
                                  <code className='ml-1 px-2 py-1 bg-muted rounded text-xs'>{item.trackingCode}</code>
                                </p>
                              )}

                              {item.fee && (
                                <p className='text-sm'>
                                  <strong>Phí sửa chữa:</strong>
                                  <span className='ml-1 text-red-600 font-medium'>
                                    {item.fee.toLocaleString('vi-VN')} ₫
                                  </span>
                                </p>
                              )}

                              {item.shippingFee && (
                                <p className='text-sm'>
                                  <strong>Phí vận chuyển:</strong>
                                  <span className='ml-1 text-orange-600 font-medium'>
                                    {item.shippingFee.toLocaleString('vi-VN')} ₫
                                  </span>
                                </p>
                              )}

                              {item.estimateTime && (
                                <p className='text-sm'>
                                  <strong>Thời gian dự kiến:</strong>
                                  <span className='ml-1'>{item.estimateTime}</span>
                                </p>
                              )}

                              {item.rejectedReason && (
                                <p className='text-sm text-red-600'>
                                  <strong>Lý do từ chối:</strong> {item.rejectedReason}
                                </p>
                              )}
                            </div>

                            {/* Order information */}
                            {(item.orders?.length || 0) > 0 && (
                              <div className='bg-muted/50 rounded p-3 space-y-2'>
                                <h4 className='font-medium text-sm'>Đơn hàng liên quan:</h4>
                                {item.orders?.map((order, orderIndex) => (
                                  <div key={orderIndex} className='text-sm space-y-1'>
                                    <p>
                                      <strong>Mã đơn:</strong> {order.code}
                                    </p>
                                    {order.receivedAt && (
                                      <p>
                                        <strong>Ngày nhận:</strong>{' '}
                                        {new Date(order.receivedAt).toLocaleDateString('vi-VN')}
                                      </p>
                                    )}
                                    <p>
                                      <strong>Sản phẩm:</strong> {order.orderItems?.length || 0} item(s)
                                    </p>
                                  </div>
                                ))}
                              </div>
                            )}
                          </div>
                        )
                      })
                    ) : (
                      <div className='text-center py-8 text-muted-foreground'>
                        Không có sản phẩm nào trong yêu cầu bảo hành này
                      </div>
                    )}
                  </div>
                </CardContent>
              </Card>
            </div>
          </ScrollArea>
        </DialogContent>
      </Dialog>

      {/* Media Viewer Dialog */}
      <Dialog open={mediaViewerOpen} onOpenChange={setMediaViewerOpen}>
        <DialogContent className='max-w-4xl max-h-[90vh]'>
          <DialogHeader>
            <DialogTitle className='flex items-center gap-2'>
              <ImageIcon className='h-5 w-5' />
              Hình ảnh và Video
            </DialogTitle>
          </DialogHeader>

          <ScrollArea className='max-h-[calc(90vh-100px)]'>
            <div className='space-y-6'>
              {/* Images */}
              {(selectedImages?.length || 0) > 0 && (
                <div>
                  <h4 className='font-medium mb-3 flex items-center gap-2'>
                    <ImageIcon className='h-4 w-4' />
                    Hình ảnh ({selectedImages?.length || 0})
                  </h4>
                  <div className='grid grid-cols-2 md:grid-cols-3 gap-4'>
                    {selectedImages?.map((image, index) => (
                      <div key={index} className='relative group'>
                        <img
                          src={image}
                          alt={`Warranty image ${index + 1}`}
                          className='w-full h-32 object-cover rounded-lg border'
                        />
                        <Button
                          variant='outline'
                          size='sm'
                          className='absolute top-2 right-2 opacity-0 group-hover:opacity-100 transition-opacity'
                          onClick={() => window.open(image, '_blank')}
                        >
                          <Eye className='h-3 w-3' />
                        </Button>
                      </div>
                    ))}
                  </div>
                </div>
              )}

              {/* Videos */}
              {(selectedVideos?.length || 0) > 0 && (
                <div>
                  <h4 className='font-medium mb-3 flex items-center gap-2'>
                    <Video className='h-4 w-4' />
                    Video ({selectedVideos?.length || 0})
                  </h4>
                  <div className='grid grid-cols-1 md:grid-cols-2 gap-4'>
                    {selectedVideos?.map((video, index) => (
                      <div
                        key={index}
                        className='relative w-full h-48 rounded-lg border hover:shadow-lg transition-shadow cursor-pointer overflow-hidden'
                        onClick={() => openVideoViewer(video)}
                      >
                        <VideoThumbnail
                          src={video}
                          title={`Video ${index + 1}`}
                          width={300}
                          height={200}
                          onClick={() => openVideoViewer(video)}
                          className='w-full h-full'
                        />
                      </div>
                    ))}
                  </div>
                </div>
              )}

              {(selectedImages?.length || 0) === 0 && (selectedVideos?.length || 0) === 0 && (
                <div className='text-center py-8 text-muted-foreground'>Không có hình ảnh hoặc video</div>
              )}
            </div>
          </ScrollArea>
        </DialogContent>
      </Dialog>

      {/* Video Viewer Dialog */}
      <VideoViewerDialog
        open={videoViewerOpen}
        onOpenChange={setVideoViewerOpen}
        src={currentVideo}
        title='Warranty Request Video'
        autoPlay={true}
      />
    </>
  )
}
