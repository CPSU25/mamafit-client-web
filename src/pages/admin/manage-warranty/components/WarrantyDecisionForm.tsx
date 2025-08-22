import { useState, useEffect } from 'react'
import {
  CheckCircle,
  XCircle,
  Clock,
  CreditCard,
  Truck,
  ChevronRight,
  User,
  MapPin,
  Building2,
  Factory,
  MessageSquare,
  Calendar
} from 'lucide-react'
import { useNavigate } from 'react-router-dom'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import { Label } from '@/components/ui/label'
import { Textarea } from '@/components/ui/textarea'
import { Badge } from '@/components/ui/badge'
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card'
import { ImageViewer } from '@/components/ui/image-viewer'
import { VideoThumbnail, VideoViewerDialog } from '@/components/video-viewer'
import { toast } from 'sonner'
import {
  WarrantyRequestById,
  WarrantyRequestItemForm,
  StatusWarrantyRequestItem,
  RequestType,
  DestinationType
} from '@/@types/warranty-request.types'
import { OrderStatus } from '@/@types/manage-order.types'
import { AddressType } from '@/@types/global.types'
import { useSubmitDecisionMutation } from '@/services/global/warranty.service'
import globalAPI from '@/apis/global.api'
import warrantyAPI from '@/apis/warranty-request.api'

import { useAuth } from '@/context/auth-context'

interface WarrantyDecisionFormProps {
  warrantyRequest: WarrantyRequestById
  onClose: () => void
}

interface ItemDecision {
  status: StatusWarrantyRequestItem
  fee?: number
  shippingFee?: number
  rejectedReason?: string
  estimateTime?: string
  estimateDays?: number
}

export const WarrantyDecisionForm = ({ warrantyRequest, onClose }: WarrantyDecisionFormProps) => {
  const [itemDecisions, setItemDecisions] = useState<Record<string, ItemDecision>>({})
  const { hasRole } = useAuth()
  const [noteInternal, setNoteInternal] = useState<string>(warrantyRequest.noteInternal || '')
  const [address, setAddress] = useState<AddressType | null>(null)
  const [loadingAddress, setLoadingAddress] = useState(false)
  const [loadingShippingFee, setLoadingShippingFee] = useState<Record<string, boolean>>({})
  const [loadingCreateShipping, setLoadingCreateShipping] = useState(false)
  const [selectedVideo, setSelectedVideo] = useState<{ src: string; title: string } | null>(null)
  const navigate = useNavigate()
  const roleBasePath = hasRole('Admin') ? '/system/admin' : hasRole('Manager') ? '/system/manager' : '/system/admin'
  const submitDecisionMutation = useSubmitDecisionMutation({ id: warrantyRequest.id })

  // Đóng dialog khi mutation thành công
  useEffect(() => {
    if (submitDecisionMutation.isSuccess) {
      onClose()
    }
  }, [submitDecisionMutation.isSuccess, onClose])

  // Load địa chỉ khi có pickAddressId/pickAdrressId (hỗ trợ cả 2 key)
  useEffect(() => {
    const loadAddress = async () => {
      const pickId = warrantyRequest.pickAddressId
      if (pickId) {
        setLoadingAddress(true)
        try {
          const response = await globalAPI.getAddress(pickId)
          setAddress(response.data.data)
        } catch (error) {
          console.error('Failed to load address:', error)
        } finally {
          setLoadingAddress(false)
        }
      }
    }
    loadAddress()
  }, [warrantyRequest.pickAddressId])

  // Tính shipping fee cho item khi có địa chỉ
  const calculateShippingFee = async (itemId: string) => {
    if (!address || warrantyRequest.requestType !== RequestType.FEE) return

    setLoadingShippingFee((prev) => ({ ...prev, [itemId]: true }))
    try {
      const response = await globalAPI.getShippingFee({
        Province: address.province,
        District: address.district,
        Weight: 500
      })

      handleItemDetailChange(itemId, 'shippingFee', response.data.fee.fee)
    } catch (error) {
      console.error('Failed to calculate shipping fee:', error)
    } finally {
      setLoadingShippingFee((prev) => ({ ...prev, [itemId]: false }))
    }
  }

  // Tính phí ship cho tất cả items (nếu là FEE và có địa chỉ)
  const calculateAllShippingFees = async () => {
    if (!address || warrantyRequest.requestType !== RequestType.FEE) return
    const ids = warrantyRequest.items?.map((i) => i.orderItemId) || []
    for (const id of ids) {
      // tuần tự để tránh spam API
      await calculateShippingFee(id)
    }
  }

  useEffect(() => {
    if (warrantyRequest.items) {
      const initialDecisions = warrantyRequest.items.reduce<Record<string, ItemDecision>>((acc, item) => {
        acc[item.orderItemId] = {
          status: item.status ?? StatusWarrantyRequestItem.PENDING,
          fee: item.fee ?? 0,
          shippingFee: item.shippingFee ?? 0,
          rejectedReason: item.rejectedReason ?? '',
          estimateTime: item.estimateTime ?? '',
          estimateDays: item.estimateTime
            ? Math.ceil((new Date(item.estimateTime).getTime() - new Date().getTime()) / (1000 * 60 * 60 * 24))
            : 7
        }
        return acc
      }, {})
      setItemDecisions(initialDecisions)
    }
  }, [warrantyRequest])

  const handleItemDecision = (itemId: string, status: StatusWarrantyRequestItem) => {
    setItemDecisions((prev) => ({
      ...prev,
      [itemId]: {
        ...prev[itemId],
        status
      }
    }))
  }

  const handleItemDetailChange = (itemId: string, field: keyof ItemDecision, value: string | number) => {
    setItemDecisions((prev) => ({
      ...prev,
      [itemId]: {
        ...prev[itemId],
        [field]: value
      }
    }))
  }

  const handleEstimateDaysChange = (itemId: string, days: number) => {
    const estimateDate = new Date()
    estimateDate.setDate(estimateDate.getDate() + days)

    setItemDecisions((prev) => ({
      ...prev,
      [itemId]: {
        ...prev[itemId],
        estimateDays: days,
        estimateTime: estimateDate.toISOString()
      }
    }))
  }

  const validateForm = (): string | null => {
    // Chỉ validate những item chưa được finalized
    const pendingItems = warrantyRequest.items?.filter((item) => !isItemFinalized(item.status)) || []

    for (const item of pendingItems) {
      const decision = itemDecisions[item.orderItemId]
      if (!decision) {
        return `Vui lòng đưa ra quyết định cho sản phẩm ${item.orderItemId}`
      }

      if (decision.status === StatusWarrantyRequestItem.REJECTED && !decision.rejectedReason?.trim()) {
        return `Vui lòng nhập lý do từ chối cho sản phẩm ${item.orderItemId}`
      }

      if (decision.status === StatusWarrantyRequestItem.APPROVED) {
        if (!decision.estimateDays || decision.estimateDays <= 0) {
          return `Vui lòng nhập thời gian ước tính cho sản phẩm ${item.orderItemId}`
        }

        // Nếu là FEE type thì cần có phí bảo hành và phí vận chuyển
        if (warrantyRequest.requestType === RequestType.FEE) {
          if (!decision.fee || decision.fee <= 0) {
            return `Vui lòng nhập phí bảo hành cho sản phẩm ${item.orderItemId}`
          }
          if (!decision.shippingFee || decision.shippingFee <= 0) {
            return `Vui lòng nhập phí vận chuyển cho sản phẩm ${item.orderItemId}`
          }
        }
      }
    }
    return null
  }

  const handleSubmit = () => {
    const validationError = validateForm()
    if (validationError) {
      toast.error(validationError)
      return
    }

    // Chỉ submit những item chưa được finalized
    const pendingItems = warrantyRequest.items?.filter((item) => !isItemFinalized(item.status)) || []

    const itemsToSubmit: WarrantyRequestItemForm[] = pendingItems.map((item) => {
      const decision = itemDecisions[item.orderItemId]
      const baseItem = {
        orderItemId: item.orderItemId,
        status: decision.status
      }

      if (decision.status === StatusWarrantyRequestItem.REJECTED) {
        return {
          ...baseItem,
          destinationType: DestinationType.FACTORY as const, // Tất cả từ chối sẽ gửi về xưởng
          shippingFee: null,
          fee: null,
          rejectedReason: decision.rejectedReason || null,
          estimateTime: null
        }
      } else {
        return {
          ...baseItem,
          destinationType: DestinationType.FACTORY as const,
          shippingFee: warrantyRequest.requestType === RequestType.FEE ? decision.shippingFee || null : null,
          fee: warrantyRequest.requestType === RequestType.FEE ? decision.fee || null : null,
          rejectedReason: null,
          estimateTime: decision.estimateTime || new Date().toISOString()
        }
      }
    })

    if (itemsToSubmit.length === 0) {
      toast.error('Không có item nào cần xử lý')
      return
    }

    submitDecisionMutation.mutate({
      noteInternal,
      items: itemsToSubmit
    })
  }

  const handleCreateShipping = async () => {
    if (!canCreateShippingOrder) return

    setLoadingCreateShipping(true)

    await warrantyAPI.createShippingWarrantyRequestFee(warrantyRequest.id)
    toast.success('✅ Đã tạo đơn shipping thành công!')

    setLoadingCreateShipping(false)
  }

  const isRequestTypeFee = warrantyRequest.requestType === RequestType.FEE
  const canCreateShippingOrder = warrantyRequest.orderStatus === OrderStatus.PICKUP_IN_PROGRESS

  // Kiểm tra xem có item nào có destinationType là BRANCH không
  const hasBranchDestination =
    warrantyRequest.items?.some((item) => item.destinationType === DestinationType.BRANCH) ?? false

  // Kiểm tra xem item đã được finalized (APPROVED hoặc REJECTED) chưa
  const isItemFinalized = (status: StatusWarrantyRequestItem) => {
    return status === StatusWarrantyRequestItem.APPROVED || status === StatusWarrantyRequestItem.REJECTED
  }

  // Kiểm tra xem có item nào chưa được finalized không
  const hasItemsPendingDecision = warrantyRequest.items?.some((item) => !isItemFinalized(item.status)) ?? false

  const getItemStatusColor = (status: StatusWarrantyRequestItem) => {
    switch (status) {
      case StatusWarrantyRequestItem.APPROVED:
        return 'bg-emerald-100 text-emerald-800 border-emerald-200 dark:bg-emerald-950/20 dark:text-emerald-400 dark:border-emerald-800'
      case StatusWarrantyRequestItem.REJECTED:
        return 'bg-rose-100 text-rose-800 border-rose-200 dark:bg-rose-950/20 dark:text-rose-400 dark:border-rose-800'
      case StatusWarrantyRequestItem.IN_TRANSIT:
        return 'bg-blue-100 text-blue-800 border-blue-200 dark:bg-blue-950/20 dark:text-blue-400 dark:border-blue-800'
      default:
        return 'bg-violet-100 text-violet-800 border-violet-200 dark:bg-violet-950/20 dark:text-violet-400 dark:border-violet-800'
    }
  }

  const getItemStatusLabel = (status: StatusWarrantyRequestItem) => {
    switch (status) {
      case StatusWarrantyRequestItem.APPROVED:
        return 'Đã duyệt'
      case StatusWarrantyRequestItem.REJECTED:
        return 'Đã từ chối'
      case StatusWarrantyRequestItem.IN_TRANSIT:
        return 'Đang vận chuyển'
      default:
        return 'Chờ xử lý'
    }
  }

  // Helper function to check if file is video
  const isVideoFile = (url: string): boolean => {
    const videoExtensions = ['.mp4', '.avi', '.mov', '.wmv', '.flv', '.webm', '.mkv', '.m4v']
    const lowerUrl = url.toLowerCase()
    return (
      videoExtensions.some((ext) => lowerUrl.includes(ext)) ||
      lowerUrl.includes('video/') ||
      lowerUrl.includes('.mp4') ||
      lowerUrl.includes('cloudinary.com/video/')
    )
  }

  // Helper function to separate images and videos
  const separateMediaFiles = (files: string[]) => {
    const images: string[] = []
    const videos: string[] = []

    files.forEach((file) => {
      if (isVideoFile(file)) {
        videos.push(file)
      } else {
        images.push(file)
      }
    })

    return { images, videos }
  }

  const handleVideoClick = (src: string, title: string) => {
    setSelectedVideo({ src, title })
  }

  return (
    <div className='max-h-[85vh] overflow-y-auto custom-scrollbar'>
      <div className='space-y-8 p-2 pb-20'>
        {/* HEADER SECTION: Warranty Request Overview */}
        <Card className='shadow-lg border-0 bg-gradient-to-br from-white via-violet-50/30 to-white dark:from-gray-900 dark:via-violet-950/30 dark:to-gray-900'>
          <CardHeader className='pb-4'>
            <div className='flex flex-col lg:flex-row lg:items-start lg:justify-between gap-4'>
              <div className='flex items-start gap-4'>
                <div className='w-12 h-12 bg-gradient-to-br from-violet-500 to-purple-600 rounded-xl flex items-center justify-center shadow-md'>
                  <Clock className='w-6 h-6 text-white' />
                </div>
                <div className='flex-1'>
                  <div className='flex items-center gap-3 mb-2'>
                    <h1 className='text-lg font-bold text-gray-900 dark:text-white'>Chi tiết yêu cầu bảo hành</h1>
                    <Badge
                      variant='outline'
                      className='px-2 py-1 text-xs bg-violet-50 text-violet-700 border-violet-200'
                    >
                      {warrantyRequest.sku}
                    </Badge>
                  </div>
                  <p className='text-xs text-gray-600 dark:text-gray-400'>
                    Đánh giá và xử lý yêu cầu bảo hành từ khách hàng
                  </p>
                  <div className='flex items-center gap-2 mt-2 text-xs text-gray-500'>
                    <Calendar className='w-3 h-3' />
                    <span>Tạo lúc: {new Date(warrantyRequest.createdAt).toLocaleString('vi-VN')}</span>
                  </div>
                </div>
              </div>

              <div className='flex flex-wrap gap-2 lg:items-start'>
                <Badge
                  variant='outline'
                  className={`px-3 py-1.5 text-xs font-medium ${
                    isRequestTypeFee
                      ? 'bg-orange-50 text-orange-700 border-orange-300'
                      : 'bg-emerald-50 text-emerald-700 border-emerald-300'
                  }`}
                >
                  {isRequestTypeFee ? '💰 Có phí' : '🆓 Miễn phí'}
                </Badge>

                <Badge
                  variant='outline'
                  className={`px-3 py-1.5 text-xs font-medium ${
                    warrantyRequest.status === 'PENDING'
                      ? 'bg-amber-50 text-amber-700 border-amber-300'
                      : warrantyRequest.status === 'APPROVED'
                        ? 'bg-emerald-50 text-emerald-700 border-emerald-300'
                        : warrantyRequest.status === 'REPAIRING'
                          ? 'bg-blue-50 text-blue-700 border-blue-300'
                          : warrantyRequest.status === 'COMPLETED'
                            ? 'bg-green-50 text-green-700 border-green-300'
                            : 'bg-red-50 text-red-700 border-red-300'
                  }`}
                >
                  {warrantyRequest.status === 'PENDING' && '⏳ Chờ xử lý'}
                  {warrantyRequest.status === 'APPROVED' && '✅ Đã duyệt'}
                  {warrantyRequest.status === 'REPAIRING' && '🔧 Đang sửa chữa'}
                  {warrantyRequest.status === 'COMPLETED' && '✅ Hoàn thành'}
                  {warrantyRequest.status === 'REJECTED' && '❌ Đã từ chối'}
                </Badge>

                {warrantyRequest.destinationType && (
                  <Badge
                    variant='outline'
                    className={`px-3 py-1.5 text-xs font-medium flex items-center gap-1 ${
                      warrantyRequest.destinationType === DestinationType.BRANCH
                        ? 'bg-blue-50 text-blue-700 border-blue-200'
                        : 'bg-indigo-50 text-indigo-700 border-indigo-200'
                    }`}
                  >
                    {warrantyRequest.destinationType === DestinationType.BRANCH ? (
                      <Building2 className='h-3 w-3' />
                    ) : (
                      <Factory className='h-3 w-3' />
                    )}
                    {warrantyRequest.destinationType === DestinationType.BRANCH ? 'Chi nhánh' : 'Nhà máy'}
                  </Badge>
                )}
              </div>
            </div>
          </CardHeader>

          <CardContent className='pt-0'>
            <div className='grid grid-cols-2 lg:grid-cols-4 gap-4'>
              <div className='bg-gray-50 dark:bg-gray-800/50 rounded-lg p-3 text-center'>
                <div className='text-lg font-bold text-gray-900 dark:text-white'>
                  {warrantyRequest.items?.length || 0}
                </div>
                <div className='text-xs text-gray-600 dark:text-gray-400'>Sản phẩm</div>
              </div>

              <div className='bg-gray-50 dark:bg-gray-800/50 rounded-lg p-3 text-center'>
                <div className='text-lg font-bold text-violet-700 dark:text-violet-300'>
                  {warrantyRequest.totalFee ? `${warrantyRequest.totalFee.toLocaleString('vi-VN')}₫` : '0₫'}
                </div>
                <div className='text-xs text-gray-600 dark:text-gray-400'>Tổng phí</div>
              </div>

              <div className='bg-gray-50 dark:bg-gray-800/50 rounded-lg p-3 text-center'>
                <div className='text-lg font-bold text-blue-700 dark:text-blue-300'>
                  {warrantyRequest.customer.phoneNumber}
                </div>
                <div className='text-xs text-gray-600 dark:text-gray-400'>Số điện thoại</div>
              </div>

              <div className='bg-gray-50 dark:bg-gray-800/50 rounded-lg p-3 text-center'>
                <div className='text-sm font-bold text-emerald-700 dark:text-emerald-300 truncate'>
                  {warrantyRequest.customer.fullName}
                </div>
                <div className='text-xs text-gray-600 dark:text-gray-400'>Khách hàng</div>
              </div>
            </div>
          </CardContent>
        </Card>

        {/* CUSTOMER & ADDRESS SECTION */}
        <div className='grid grid-cols-1 lg:grid-cols-3 gap-6'>
          {/* Thông tin khách hàng */}
          <Card className='shadow-md border-0 bg-white dark:bg-gray-800'>
            <CardHeader className='pb-3'>
              <CardTitle className='flex items-center gap-2 text-base font-semibold'>
                <div className='w-8 h-8 bg-blue-100 dark:bg-blue-900 rounded-lg flex items-center justify-center'>
                  <User className='w-4 h-4 text-blue-600 dark:text-blue-400' />
                </div>
                Thông tin khách hàng
              </CardTitle>
            </CardHeader>
            <CardContent className='space-y-3 pt-0'>
              <div className='space-y-2'>
                <div className='flex justify-between items-center'>
                  <span className='text-xs text-gray-500'>Họ và tên:</span>
                  <span className='text-sm font-medium text-gray-900 dark:text-white'>
                    {warrantyRequest.customer.fullName}
                  </span>
                </div>
                <div className='flex justify-between items-center'>
                  <span className='text-xs text-gray-500'>Điện thoại:</span>
                  <span className='text-sm font-medium text-blue-600'>{warrantyRequest.customer.phoneNumber}</span>
                </div>
                <div className='flex justify-between items-start'>
                  <span className='text-xs text-gray-500'>Email:</span>
                  <span
                    className='text-xs font-medium text-gray-700 dark:text-gray-300 text-right max-w-[180px] truncate'
                    title={warrantyRequest.customer.userEmail}
                  >
                    {warrantyRequest.customer.userEmail}
                  </span>
                </div>
              </div>
            </CardContent>
          </Card>

          {/* Địa chỉ giao nhận */}
          <Card className='lg:col-span-2 shadow-md border-0 bg-white dark:bg-gray-800'>
            <CardHeader className='pb-3'>
              <CardTitle className='flex items-center justify-between'>
                <div className='flex items-center gap-2 text-base font-semibold'>
                  <div className='w-8 h-8 bg-sky-100 dark:bg-sky-900 rounded-lg flex items-center justify-center'>
                    <MapPin className='w-4 h-4 text-sky-600 dark:text-sky-400' />
                  </div>
                  Địa chỉ giao nhận
                </div>
                {isRequestTypeFee && address && (
                  <Button
                    variant='outline'
                    size='sm'
                    onClick={calculateAllShippingFees}
                    className='text-xs px-3 py-1.5 bg-sky-50 hover:bg-sky-100 border-sky-300 text-sky-700'
                  >
                    🧮 Tính phí ship
                  </Button>
                )}
              </CardTitle>
            </CardHeader>
            <CardContent className='pt-0'>
              {loadingAddress ? (
                <div className='flex items-center gap-3 text-sm text-gray-600 dark:text-gray-300 p-3 bg-gray-50 dark:bg-gray-700 rounded-lg'>
                  <div className='animate-spin rounded-full h-4 w-4 border-b-2 border-sky-500'></div>
                  <span>Đang tải địa chỉ...</span>
                </div>
              ) : address ? (
                <div className='p-3 bg-gray-50 dark:bg-gray-700 rounded-lg'>
                  <div className='space-y-2'>
                    <div className='flex justify-between items-center'>
                      <span className='text-xs text-gray-500'>Người nhận:</span>
                      <span className='text-sm font-medium text-gray-900 dark:text-white'>
                        {warrantyRequest.customer.fullName}
                      </span>
                    </div>
                    <div className='flex justify-between items-start'>
                      <span className='text-xs text-gray-500'>Địa chỉ:</span>
                      <span className='text-sm text-gray-700 dark:text-gray-300 text-right max-w-[280px] leading-relaxed'>
                        {address.street}, {address.ward}, {address.district}, {address.province}
                      </span>
                    </div>
                    <div className='flex justify-between items-center'>
                      <span className='text-xs text-gray-500'>Điện thoại:</span>
                      <span className='text-sm font-medium text-blue-600'>{warrantyRequest.customer.phoneNumber}</span>
                    </div>
                  </div>
                </div>
              ) : (
                <div className='p-3 bg-amber-50 border border-amber-200 rounded-lg text-center'>
                  <p className='text-sm text-amber-800 font-medium'>⚠️ Chưa có địa chỉ giao nhận</p>
                  <p className='text-xs text-amber-600 mt-1'>Cần yêu cầu khách hàng cung cấp</p>
                </div>
              )}
            </CardContent>
          </Card>
        </div>

        {/* REQUEST INFO & PAYMENT SECTION */}
        <div className='grid grid-cols-1 lg:grid-cols-2 gap-6'>
          {/* Thông tin yêu cầu bảo hành */}
          <Card className='shadow-md border-0 bg-white dark:bg-gray-800'>
            <CardHeader className='pb-3'>
              <CardTitle className='flex items-center gap-2 text-base font-semibold'>
                <div className='w-8 h-8 bg-amber-100 dark:bg-amber-900 rounded-lg flex items-center justify-center'>
                  <Clock className='w-4 h-4 text-amber-600 dark:text-amber-400' />
                </div>
                Chi tiết yêu cầu
              </CardTitle>
            </CardHeader>
            <CardContent className='space-y-4 pt-0'>
              <div className='grid grid-cols-2 gap-3'>
                <div className='bg-gray-50 dark:bg-gray-700 p-3 rounded-lg text-center'>
                  <div
                    className={`text-sm font-bold mb-1 ${isRequestTypeFee ? 'text-orange-600' : 'text-emerald-600'}`}
                  >
                    {isRequestTypeFee ? '💰 Có phí' : '🆓 Miễn phí'}
                  </div>
                  <div className='text-xs text-gray-500'>Loại yêu cầu</div>
                </div>

                <div className='bg-gray-50 dark:bg-gray-700 p-3 rounded-lg text-center'>
                  <div
                    className={`text-sm font-bold mb-1 ${
                      warrantyRequest.status === 'PENDING'
                        ? 'text-amber-600'
                        : warrantyRequest.status === 'APPROVED'
                          ? 'text-emerald-600'
                          : warrantyRequest.status === 'REPAIRING'
                            ? 'text-blue-600'
                            : warrantyRequest.status === 'COMPLETED'
                              ? 'text-green-600'
                              : 'text-red-600'
                    }`}
                  >
                    {warrantyRequest.status === 'PENDING' && '⏳ Chờ duyệt'}
                    {warrantyRequest.status === 'APPROVED' && '✅ Đã duyệt'}
                    {warrantyRequest.status === 'REPAIRING' && '🔧 Đang sửa'}
                    {warrantyRequest.status === 'COMPLETED' && '✅ Hoàn thành'}
                    {warrantyRequest.status === 'REJECTED' && '❌ Từ chối'}
                  </div>
                  <div className='text-xs text-gray-500'>Trạng thái</div>
                </div>
              </div>

              <div className='space-y-2'>
                <div className='flex justify-between items-center'>
                  <span className='text-xs text-gray-500'>Số sản phẩm:</span>
                  <span className='text-sm font-medium text-gray-900 dark:text-white'>
                    {warrantyRequest.items?.length || 0}
                  </span>
                </div>
                <div className='flex justify-between items-center'>
                  <span className='text-xs text-gray-500'>Tổng phí dự kiến:</span>
                  <span className='text-sm font-medium text-violet-600'>
                    {warrantyRequest.totalFee ? `${warrantyRequest.totalFee.toLocaleString('vi-VN')}₫` : '0₫'}
                  </span>
                </div>
                <div className='flex justify-between items-center'>
                  <span className='text-xs text-gray-500'>Địa điểm xử lý:</span>
                  <span className='text-sm font-medium text-blue-600'>
                    {warrantyRequest.destinationType === DestinationType.BRANCH ? 'Chi nhánh' : 'Nhà máy'}
                  </span>
                </div>
              </div>

              {warrantyRequest.rejectReason && (
                <div className='p-3 bg-red-50 border border-red-200 rounded-lg'>
                  <div className='flex items-center gap-2 mb-2'>
                    <XCircle className='w-4 h-4 text-red-600' />
                    <span className='text-sm font-medium text-red-800'>Lý do từ chối</span>
                  </div>
                  <p className='text-sm text-red-700'>{warrantyRequest.rejectReason}</p>
                </div>
              )}
            </CardContent>
          </Card>

          {/* Payment Status - chỉ hiển thị khi là FEE */}
          {isRequestTypeFee && (
            <Card className='shadow-md border-0 bg-white dark:bg-gray-800'>
              <CardHeader className='pb-3'>
                <CardTitle className='flex items-center gap-2 text-base font-semibold'>
                  <div className='w-8 h-8 bg-violet-100 dark:bg-violet-900 rounded-lg flex items-center justify-center'>
                    <CreditCard className='w-4 h-4 text-violet-600 dark:text-violet-400' />
                  </div>
                  Thanh toán & Vận chuyển
                </CardTitle>
              </CardHeader>
              <CardContent className='space-y-4 pt-0'>
                <div className='bg-gray-50 dark:bg-gray-700 p-3 rounded-lg text-center'>
                  <div
                    className={`text-sm font-bold mb-1 ${
                      warrantyRequest.orderStatus === OrderStatus.AWAITING_PAID_WARRANTY
                        ? 'text-amber-600'
                        : warrantyRequest.orderStatus === OrderStatus.PICKUP_IN_PROGRESS
                          ? 'text-emerald-600'
                          : 'text-gray-600'
                    }`}
                  >
                    {warrantyRequest.orderStatus === OrderStatus.AWAITING_PAID_WARRANTY && '⏳ Chờ thanh toán'}
                    {warrantyRequest.orderStatus === OrderStatus.PICKUP_IN_PROGRESS && '✅ Đã thanh toán'}
                  </div>
                  <div className='text-xs text-gray-500'>Trạng thái thanh toán</div>
                </div>

                <Button
                  variant='outline'
                  size='sm'
                  disabled={!canCreateShippingOrder || loadingCreateShipping}
                  onClick={handleCreateShipping}
                  className={`w-full gap-2 py-2 text-sm ${
                    canCreateShippingOrder
                      ? 'bg-blue-50 hover:bg-blue-100 text-blue-700 border-blue-300'
                      : 'text-gray-400 border-gray-200 bg-gray-50 cursor-not-allowed'
                  }`}
                >
                  {loadingCreateShipping ? (
                    <>
                      <div className='animate-spin rounded-full h-3 w-3 border-b-2 border-blue-500'></div>
                      Đang tạo...
                    </>
                  ) : (
                    <>
                      <Truck className='w-4 h-4' />
                      Tạo đơn vận chuyển
                    </>
                  )}
                </Button>

                {!canCreateShippingOrder && (
                  <div className='p-3 bg-amber-50 border border-amber-200 rounded-lg'>
                    <p className='text-xs text-amber-800 font-medium text-center'>
                      {warrantyRequest.orderStatus === OrderStatus.AWAITING_PAID_WARRANTY
                        ? '⚠️ Cần thanh toán trước'
                        : '⚠️ Cần duyệt và thanh toán'}
                    </p>
                  </div>
                )}
              </CardContent>
            </Card>
          )}
        </div>

        {/* INTERNAL NOTES SECTION */}
        <Card className='shadow-md border-0 bg-white dark:bg-gray-800'>
          <CardHeader className='pb-3'>
            <CardTitle className='flex items-center gap-2 text-base font-semibold'>
              <div className='w-8 h-8 bg-gray-100 dark:bg-gray-700 rounded-lg flex items-center justify-center'>
                <MessageSquare className='w-4 h-4 text-gray-600 dark:text-gray-400' />
              </div>
              Ghi chú nội bộ
            </CardTitle>
          </CardHeader>
          <CardContent className='pt-0'>
            <Textarea
              placeholder='Thêm ghi chú nội bộ để hỗ trợ đội ngũ xử lý...'
              value={noteInternal}
              onChange={(e) => setNoteInternal(e.target.value)}
              rows={3}
              className='w-full resize-none focus:ring-2 focus:ring-violet-500 focus:border-violet-500 transition-all'
            />
          </CardContent>
        </Card>

        {/* PRODUCT DECISIONS SECTION */}
        <Card className='shadow-md border-0 bg-white dark:bg-gray-800'>
          <CardHeader className='pb-4'>
            <CardTitle className='flex items-center justify-between'>
              <div className='flex items-center gap-2 text-base font-semibold'>
                <div className='w-8 h-8 bg-indigo-100 dark:bg-indigo-900 rounded-lg flex items-center justify-center'>
                  <CheckCircle className='w-4 h-4 text-indigo-600 dark:text-indigo-400' />
                </div>
                Quyết định sản phẩm
              </div>
              <Badge variant='outline' className='px-2 py-1 text-xs bg-indigo-50 text-indigo-700 border-indigo-200'>
                {warrantyRequest.items?.length || 0} sản phẩm
              </Badge>
            </CardTitle>
          </CardHeader>
          <CardContent className='space-y-6 pt-0'>
            {warrantyRequest.items?.map((item, index) => (
              <div
                key={item.orderItemId}
                className='border border-gray-200 rounded-lg p-4 space-y-4 bg-gray-50/50 dark:bg-gray-700/50'
              >
                <div className='flex items-start justify-between'>
                  <div className='flex-1'>
                    <div className='flex items-center gap-3 mb-3'>
                      <div className='w-6 h-6 bg-indigo-100 dark:bg-indigo-900 rounded-full flex items-center justify-center text-indigo-600 dark:text-indigo-400 font-bold text-xs'>
                        {index + 1}
                      </div>
                      <div className='flex-1'>
                        <h4 className='text-sm font-bold text-gray-900 dark:text-white'>Sản phẩm #{index + 1}</h4>
                        <div className='flex items-center gap-2 mt-1'>
                          <span className='text-xs text-gray-500'>Lần bảo hành:</span>
                          <span className='text-xs font-medium text-indigo-600'>{item.warrantyRound}</span>
                        </div>
                      </div>
                    </div>

                    <div className='mb-3 p-3 bg-white dark:bg-gray-800 border border-amber-200 rounded-lg'>
                      <Label className='text-xs font-medium text-amber-700 mb-1 block'>📝 Mô tả vấn đề</Label>
                      <p className='text-sm text-gray-700 dark:text-gray-300 leading-relaxed'>{item.description}</p>
                    </div>

                    {/* Hiển thị hình ảnh và video */}
                    {item.images &&
                      item.images.length > 0 &&
                      (() => {
                        const { images, videos } = separateMediaFiles(item.images)
                        const totalMedia = images.length + videos.length

                        return (
                          <div className='mb-3 space-y-3'>
                            {/* Hiển thị hình ảnh */}
                            {images.length > 0 && (
                              <div>
                                <Label className='text-xs font-medium text-blue-700 mb-2 block'>
                                  📸 Hình ảnh vấn đề ({images.length})
                                </Label>
                                <div className='grid grid-cols-3 gap-2'>
                                  {images.slice(0, 3).map((image, imgIndex) => (
                                    <ImageViewer
                                      key={`img-${imgIndex}`}
                                      src={image}
                                      alt={`Hình ảnh vấn đề ${imgIndex + 1}`}
                                      className='w-full'
                                      fit='contain'
                                      thumbnailClassName='w-full h-50 object-cover rounded border border-gray-200 hover:border-blue-300 transition-all'
                                      title={`Hình ảnh vấn đề ${imgIndex + 1}`}
                                    />
                                  ))}
                                </div>
                                {images.length > 3 && (
                                  <p className='text-xs text-blue-600 mt-1'>+{images.length - 3} ảnh khác</p>
                                )}
                              </div>
                            )}

                            {/* Hiển thị video */}
                            {videos.length > 0 && (
                              <div>
                                <Label className='text-xs font-medium text-purple-700 mb-2 block'>
                                  🎥 Video vấn đề ({videos.length})
                                </Label>
                                <div className='grid grid-cols-3 gap-2'>
                                  {videos.slice(0, 3).map((video, videoIndex) => (
                                    <VideoThumbnail
                                      key={`video-${videoIndex}`}
                                      src={video}
                                      title={`Video vấn đề ${videoIndex + 1}`}
                                      className='w-full h-50 border border-gray-200 hover:border-purple-300 transition-all'
                                      width={200}
                                      height={64}
                                      onClick={() =>
                                        handleVideoClick(
                                          video,
                                          `Video vấn đề ${videoIndex + 1} - Sản phẩm #${index + 1}`
                                        )
                                      }
                                    />
                                  ))}
                                </div>
                                {videos.length > 3 && (
                                  <p className='text-xs text-purple-600 mt-1'>+{videos.length - 3} video khác</p>
                                )}
                              </div>
                            )}

                            {/* Tổng số media */}
                            {totalMedia > 0 && (
                              <p className='text-xs text-gray-500'>Tổng cộng: {totalMedia} tệp đa phương tiện</p>
                            )}
                          </div>
                        )
                      })()}
                  </div>

                  <div className='flex flex-col gap-2'>
                    <Badge
                      variant='outline'
                      className={`${getItemStatusColor(
                        item.status ?? StatusWarrantyRequestItem.PENDING
                      )} px-3 py-1 text-xs font-medium`}
                    >
                      {getItemStatusLabel(item.status ?? StatusWarrantyRequestItem.PENDING)}
                    </Badge>
                    {item.trackingCode && (
                      <Badge
                        variant='outline'
                        className='px-3 py-1 text-xs font-medium bg-blue-50 text-blue-700 border-blue-200'
                      >
                        📦 {item.trackingCode}
                      </Badge>
                    )}
                  </div>
                </div>

                {/* Decision Buttons */}
                {isItemFinalized(item.status) ? (
                  <div className='p-4 bg-gray-50/50 dark:bg-gray-800/30 rounded-xl border border-gray-200'>
                    <div className='flex items-center gap-3 justify-center'>
                      <div className='flex items-center gap-2 text-gray-600 dark:text-gray-400'>
                        <CheckCircle className='w-5 h-5' />
                        <span className='font-medium'>Đã được xử lý - {getItemStatusLabel(item.status)}</span>
                      </div>
                    </div>
                    {item.status === StatusWarrantyRequestItem.REJECTED && item.rejectedReason && (
                      <div className='mt-3 p-3 bg-red-50 border border-red-200 rounded-lg'>
                        <p className='text-sm text-red-800 font-medium mb-1'>Lý do từ chối:</p>
                        <p className='text-sm text-red-700'>{item.rejectedReason}</p>
                      </div>
                    )}
                    {item.status === StatusWarrantyRequestItem.APPROVED && item.estimateTime && (
                      <div className='mt-3 p-3 bg-emerald-50 border border-emerald-200 rounded-lg'>
                        <p className='text-sm text-emerald-800 font-medium mb-1'>Thông tin xử lý:</p>
                        <div className='space-y-1'>
                          <p className='text-sm text-emerald-700'>
                            ⏱️ Dự kiến hoàn thành:{' '}
                            {new Date(item.estimateTime).toLocaleDateString('vi-VN', {
                              weekday: 'long',
                              year: 'numeric',
                              month: 'long',
                              day: 'numeric'
                            })}
                          </p>
                          {item.fee && item.fee > 0 && (
                            <p className='text-sm text-emerald-700'>
                              💰 Phí bảo hành: {item.fee.toLocaleString('vi-VN')}₫
                            </p>
                          )}
                          {item.shippingFee && item.shippingFee > 0 && (
                            <p className='text-sm text-emerald-700'>
                              🚚 Phí vận chuyển: {item.shippingFee.toLocaleString('vi-VN')}₫
                            </p>
                          )}
                        </div>
                      </div>
                    )}
                  </div>
                ) : (
                  <div className='space-y-4 p-4 bg-gray-50/50 dark:bg-gray-800/30 rounded-xl border border-gray-200'>
                    <Label className='text-sm font-semibold text-gray-700 dark:text-gray-300 flex items-center gap-2'>
                      ⚖️ Quyết định xử lý
                    </Label>
                    <div className='flex gap-3'>
                      <Button
                        size='lg'
                        variant={
                          itemDecisions[item.orderItemId]?.status === StatusWarrantyRequestItem.REJECTED
                            ? 'default'
                            : 'outline'
                        }
                        onClick={() => handleItemDecision(item.orderItemId, StatusWarrantyRequestItem.REJECTED)}
                        className={`flex-1 py-3 font-semibold ${
                          itemDecisions[item.orderItemId]?.status === StatusWarrantyRequestItem.REJECTED
                            ? 'bg-red-600 hover:bg-red-700 text-white shadow-md'
                            : 'text-red-700 border-red-300 hover:bg-red-50 border-2'
                        }`}
                      >
                        <XCircle className='w-5 h-5 mr-2' />
                        Từ chối
                      </Button>

                      <Button
                        size='lg'
                        variant={
                          itemDecisions[item.orderItemId]?.status === StatusWarrantyRequestItem.APPROVED
                            ? 'default'
                            : 'outline'
                        }
                        onClick={() => handleItemDecision(item.orderItemId, StatusWarrantyRequestItem.APPROVED)}
                        className={`flex-1 py-3 font-semibold ${
                          itemDecisions[item.orderItemId]?.status === StatusWarrantyRequestItem.APPROVED
                            ? 'bg-emerald-600 hover:bg-emerald-700 text-white shadow-md'
                            : 'text-emerald-700 border-emerald-300 hover:bg-emerald-50 border-2'
                        }`}
                      >
                        <CheckCircle className='w-5 h-5 mr-2' />
                        Chấp nhận
                      </Button>
                    </div>
                  </div>
                )}

                {/* Form chi tiết dựa trên quyết định - chỉ hiển thị khi item chưa finalized */}
                {!isItemFinalized(item.status) &&
                  itemDecisions[item.orderItemId]?.status === StatusWarrantyRequestItem.REJECTED && (
                    <div className='p-5 bg-red-50 rounded-xl border-2 border-red-200'>
                      <div className='flex items-center gap-2 mb-3'>
                        <XCircle className='w-5 h-5 text-red-600' />
                        <Label className='text-sm font-semibold text-red-800'>Lý do từ chối *</Label>
                      </div>
                      <Textarea
                        placeholder='Nhập lý do cụ thể tại sao từ chối yêu cầu bảo hành này...'
                        value={itemDecisions[item.orderItemId]?.rejectedReason || ''}
                        onChange={(e) => handleItemDetailChange(item.orderItemId, 'rejectedReason', e.target.value)}
                        rows={3}
                        className='mt-2 border-2 border-red-300 focus:border-red-500'
                      />
                    </div>
                  )}

                {!isItemFinalized(item.status) &&
                  itemDecisions[item.orderItemId]?.status === StatusWarrantyRequestItem.APPROVED && (
                    <div className='p-5 bg-emerald-50 rounded-xl border-2 border-emerald-200 space-y-5'>
                      <div className='flex items-center gap-2 mb-3'>
                        <CheckCircle className='w-5 h-5 text-emerald-600' />
                        <Label className='text-sm font-semibold text-emerald-800'>Chi tiết xử lý</Label>
                      </div>

                      <div className='grid grid-cols-1 md:grid-cols-3 gap-5'>
                        {/* Thời gian ước tính - bắt buộc cho cả FREE và FEE */}
                        <div className='bg-white p-4 rounded-lg border border-emerald-200'>
                          <Label className='text-sm font-semibold text-emerald-800 mb-2 block'>
                            ⏱️ Thời gian ước tính (ngày) *
                          </Label>
                          <Input
                            type='number'
                            placeholder='Ví dụ: 7'
                            min='1'
                            max='30'
                            value={itemDecisions[item.orderItemId]?.estimateDays || ''}
                            onChange={(e) => handleEstimateDaysChange(item.orderItemId, Number(e.target.value) || 0)}
                            className='border-2 border-emerald-300 focus:border-emerald-500'
                          />
                          <p className='text-xs text-emerald-600 mt-1'>Từ 1-30 ngày làm việc</p>
                        </div>

                        {/* Phí bảo hành - chỉ hiển thị cho FEE type */}
                        {isRequestTypeFee && (
                          <div className='bg-white p-4 rounded-lg border border-emerald-200'>
                            <Label className='text-sm font-semibold text-emerald-800 mb-2 block'>
                              💰 Phí bảo hành (VNĐ) *
                            </Label>
                            <Input
                              type='number'
                              placeholder='Ví dụ: 200000'
                              min='0'
                              value={itemDecisions[item.orderItemId]?.fee || ''}
                              onChange={(e) =>
                                handleItemDetailChange(item.orderItemId, 'fee', Number(e.target.value) || 0)
                              }
                              className='border-2 border-emerald-300 focus:border-emerald-500'
                            />
                            <p className='text-xs text-emerald-600 mt-1'>Chi phí sửa chữa/thay thế</p>
                          </div>
                        )}

                        {/* Phí vận chuyển - chỉ hiển thị cho FEE type */}
                        {isRequestTypeFee && (
                          <div className='bg-white p-4 rounded-lg border border-emerald-200'>
                            <Label className='text-sm font-semibold text-emerald-800 mb-2 block'>
                              🚚 Phí vận chuyển (VNĐ) *
                            </Label>
                            <div className='flex gap-2'>
                              <Input
                                type='number'
                                placeholder='Ví dụ: 50000'
                                min='0'
                                value={itemDecisions[item.orderItemId]?.shippingFee || ''}
                                onChange={(e) =>
                                  handleItemDetailChange(item.orderItemId, 'shippingFee', Number(e.target.value) || 0)
                                }
                                className='flex-1 border-2 border-emerald-300 focus:border-emerald-500'
                              />
                              <Button
                                type='button'
                                variant='outline'
                                size='sm'
                                onClick={() => calculateShippingFee(item.orderItemId)}
                                disabled={!address || loadingShippingFee[item.orderItemId]}
                                className='px-3 whitespace-nowrap border-2 border-emerald-300 hover:bg-emerald-50'
                              >
                                {loadingShippingFee[item.orderItemId] ? (
                                  <div className='animate-spin rounded-full h-4 w-4 border-b-2 border-emerald-500'></div>
                                ) : (
                                  '🧮 Tính phí'
                                )}
                              </Button>
                            </div>
                            {!address && (
                              <p className='text-xs text-amber-600 mt-1'>⚠️ Cần có địa chỉ để tính phí vận chuyển</p>
                            )}
                          </div>
                        )}
                      </div>

                      {/* Hiển thị thông tin dự kiến */}
                      <div className='flex items-center gap-3 p-3 bg-emerald-100 border border-emerald-300 rounded-lg'>
                        <Clock className='w-5 h-5 text-emerald-700' />
                        <div>
                          <span className='text-sm font-semibold text-emerald-800'>
                            Dự kiến hoàn thành:{' '}
                            {itemDecisions[item.orderItemId]?.estimateTime
                              ? new Date(itemDecisions[item.orderItemId].estimateTime!).toLocaleDateString('vi-VN', {
                                  weekday: 'long',
                                  year: 'numeric',
                                  month: 'long',
                                  day: 'numeric'
                                })
                              : 'Chưa xác định'}
                          </span>
                        </div>
                      </div>
                    </div>
                  )}

                {/* Hiển thị thông tin đơn hàng gốc */}
                {Array.isArray(item.orders) && item.orders.length > 0 && (
                  <div className='mt-6 pt-6 border-t-2 border-gray-200 dark:border-gray-700'>
                    <Label className='text-sm font-semibold text-gray-700 dark:text-gray-300 mb-4 flex items-center gap-2'>
                      📦 Đơn hàng gốc liên quan ({item.orders.length} đơn)
                    </Label>
                    <div className='space-y-4'>
                      {item.orders.map((order) => (
                        <div
                          key={order.id}
                          role='button'
                          aria-label={`Xem đơn ${order.code}`}
                          onClick={() => navigate(`${roleBasePath}/manage-order/${order.id}`)}
                          className='rounded-xl border-2 border-gray-200 p-5 bg-gradient-to-br from-white to-blue-50/30 dark:from-gray-800 dark:to-blue-950/20 hover:shadow-lg transition-all cursor-pointer group hover:border-violet-400'
                        >
                          <div className='flex items-center justify-between gap-3 mb-4'>
                            <div className='flex items-center gap-3'>
                              <div>
                                <p className='text-base font-bold text-slate-700 dark:text-slate-300'>
                                  Mã Đơn Hàng:{' '}
                                  <span className='text-violet-700 dark:text-violet-400'>{order.code}</span>
                                </p>
                                <p className='text-sm text-slate-500'>
                                  📅 Ngày nhận:{' '}
                                  {order.receivedAt
                                    ? new Date(order.receivedAt).toLocaleString('vi-VN')
                                    : 'Chưa xác định'}
                                </p>
                              </div>
                            </div>
                            <ChevronRight className='w-5 h-5 text-violet-500 opacity-0 group-hover:opacity-100 transition-opacity' />
                          </div>

                          <div className='grid grid-cols-1 md:grid-cols-2 gap-4'>
                            {order.orderItems?.map((oi) => (
                              <div
                                key={oi.id}
                                className='flex gap-4 border-2 border-gray-200 rounded-xl p-4 bg-white dark:bg-gray-700'
                              >
                                <div className='w-16 h-16 bg-gray-100 dark:bg-gray-600 rounded-lg overflow-hidden flex-shrink-0 border-2 border-gray-200'>
                                  {oi.preset?.images?.[0] && (
                                    <img
                                      src={oi.preset.images[0]}
                                      alt={oi.preset?.styleName ?? 'Sản phẩm'}
                                      className='w-full h-full object-cover'
                                    />
                                  )}
                                </div>
                                <div className='flex-1 min-w-0'>
                                  <div className='text-sm font-bold text-gray-900 dark:text-gray-100 truncate'>
                                    {oi.preset?.styleName ?? 'Sản phẩm không xác định'}
                                  </div>
                                  <div className='mt-2 grid grid-cols-2 gap-2 text-xs'>
                                    <div className='bg-blue-50 dark:bg-blue-900/30 p-1 rounded text-center'>
                                      <span className='font-medium text-blue-700 dark:text-blue-300'>
                                        SL: {oi.quantity}
                                      </span>
                                    </div>
                                    <div className='bg-green-50 dark:bg-green-900/30 p-1 rounded text-center'>
                                      <span className='font-medium text-green-700 dark:text-green-300'>
                                        {oi.price?.toLocaleString('vi-VN')}₫
                                      </span>
                                    </div>
                                  </div>
                                  {oi.warrantyDate && (
                                    <div className='mt-2 text-xs text-orange-600 dark:text-orange-400 bg-orange-50 dark:bg-orange-900/30 p-1 rounded'>
                                      🛡️ BH: {new Date(oi.warrantyDate).toLocaleDateString('vi-VN')}
                                    </div>
                                  )}
                                </div>
                              </div>
                            ))}
                          </div>

                          <div className='mt-4 flex items-center justify-end text-violet-700 dark:text-violet-400 text-sm font-semibold'>
                            <span className='mr-2 opacity-0 group-hover:opacity-100 transition-opacity'>
                              👆 Click để xem chi tiết đơn hàng
                            </span>
                            <div className='w-2 h-2 bg-violet-500 rounded-full opacity-0 group-hover:opacity-100 transition-opacity'></div>
                          </div>
                        </div>
                      ))}
                    </div>
                  </div>
                )}
              </div>
            ))}
          </CardContent>
        </Card>

        {/* Action buttons */}
        <Card className='shadow-md border-0 bg-white dark:bg-gray-800 sticky bottom-0 z-20'>
          <CardContent className='p-4'>
            <div className='flex flex-col sm:flex-row justify-between items-center gap-4'>
              <div className='flex-1'>
                {hasBranchDestination && (
                  <div className='flex items-center gap-2 text-blue-600 text-sm'>
                    <Building2 className='w-4 h-4' />
                    <span>Xử lý tại chi nhánh - Không thể thay đổi quyết định</span>
                  </div>
                )}

                {!hasBranchDestination && !hasItemsPendingDecision && (
                  <div className='flex items-center gap-2 text-emerald-600 text-sm'>
                    <CheckCircle className='w-4 h-4' />
                    <span>Tất cả sản phẩm đã được xử lý</span>
                  </div>
                )}
              </div>

              <div className='flex gap-3'>
                <Button
                  variant='outline'
                  onClick={onClose}
                  disabled={submitDecisionMutation.isPending}
                  className='px-6 py-2 text-sm font-medium'
                >
                  Đóng
                </Button>

                {!hasBranchDestination && hasItemsPendingDecision && (
                  <Button
                    onClick={handleSubmit}
                    disabled={submitDecisionMutation.isPending}
                    className='px-6 py-2 text-sm font-medium bg-violet-600 hover:bg-violet-700 text-white'
                  >
                    {submitDecisionMutation.isPending ? (
                      <>
                        <div className='animate-spin rounded-full h-4 w-4 border-b-2 border-white mr-2'></div>
                        Đang xử lý...
                      </>
                    ) : (
                      <>💾 Lưu quyết định</>
                    )}
                  </Button>
                )}
              </div>
            </div>
          </CardContent>
        </Card>
      </div>

      {/* Video Viewer Dialog */}
      <VideoViewerDialog
        open={!!selectedVideo}
        onOpenChange={(open) => !open && setSelectedVideo(null)}
        src={selectedVideo?.src || ''}
        title={selectedVideo?.title || 'Video'}
        autoPlay={true}
        controls={true}
      />
    </div>
  )
}
