import { useState, useEffect } from 'react'
import { CheckCircle, XCircle, Clock, CreditCard, Truck, ChevronRight, User, Phone, Mail, MapPin } from 'lucide-react'
import { useNavigate } from 'react-router-dom'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import { Label } from '@/components/ui/label'
import { Textarea } from '@/components/ui/textarea'
import { Badge } from '@/components/ui/badge'
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card'
import { ImageViewer } from '@/components/ui/image-viewer'
import { toast } from 'sonner'
import {
  WarrantyRequestById,
  WarrantyRequestItemForm,
  StatusWarrantyRequestItem,
  RequestType
} from '@/@types/warranty-request.types'
import { OrderStatus } from '@/@types/manage-order.types'
import { AddressType } from '@/@types/global.types'
import { useSubmitDecisionMutation } from '@/services/global/warranty.service'
import globalAPI from '@/apis/global.api'
import warrantyAPI from '@/apis/warranty-request.api'

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
  const [noteInternal, setNoteInternal] = useState<string>(warrantyRequest.noteInternal || '')
  const [address, setAddress] = useState<AddressType | null>(null)
  const [loadingAddress, setLoadingAddress] = useState(false)
  const [loadingShippingFee, setLoadingShippingFee] = useState<Record<string, boolean>>({})
  const [loadingCreateShipping, setLoadingCreateShipping] = useState(false)
  const navigate = useNavigate()

  const submitDecisionMutation = useSubmitDecisionMutation({ id: warrantyRequest.id })

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
    for (const [orderItemId, decision] of Object.entries(itemDecisions)) {
      if (decision.status === StatusWarrantyRequestItem.REJECTED && !decision.rejectedReason?.trim()) {
        return `Vui lòng nhập lý do từ chối cho sản phẩm ${orderItemId}`
      }

      if (decision.status === StatusWarrantyRequestItem.APPROVED) {
        if (!decision.estimateDays || decision.estimateDays <= 0) {
          return `Vui lòng nhập thời gian ước tính cho sản phẩm ${orderItemId}`
        }

        // Nếu là FEE type thì cần có phí bảo hành và phí vận chuyển
        if (warrantyRequest.requestType === RequestType.FEE) {
          if (!decision.fee || decision.fee <= 0) {
            return `Vui lòng nhập phí bảo hành cho sản phẩm ${orderItemId}`
          }
          if (!decision.shippingFee || decision.shippingFee <= 0) {
            return `Vui lòng nhập phí vận chuyển cho sản phẩm ${orderItemId}`
          }
        }
      }
    }
    return null
  }

  const handleSubmit = () => {
    const validationError = validateForm()
    if (validationError) {
      return // Toast sẽ được hiển thị từ mutation
    }

    const itemsToSubmit: WarrantyRequestItemForm[] = Object.entries(itemDecisions).map(([orderItemId, decision]) => {
      const baseItem = {
        orderItemId,
        status: decision.status
      }

      if (decision.status === StatusWarrantyRequestItem.REJECTED) {
        return {
          ...baseItem,
          destinationType: 'FACTORY' as const,
          shippingFee: null,
          fee: null,
          rejectedReason: decision.rejectedReason || null,
          estimateTime: null
        }
      } else {
        return {
          ...baseItem,
          destinationType: 'FACTORY' as const,
          shippingFee: warrantyRequest.requestType === RequestType.FEE ? decision.shippingFee || null : null,
          fee: warrantyRequest.requestType === RequestType.FEE ? decision.fee || null : null,
          rejectedReason: null,
          estimateTime: decision.estimateTime || new Date().toISOString()
        }
      }
    })

    submitDecisionMutation.mutate({
      noteInternal,
      items: itemsToSubmit
    })
  }

  const handleCreateShipping = async () => {
    if (!canCreateShippingOrder) return

    setLoadingCreateShipping(true)
    try {
      await warrantyAPI.createShippingWarrantyRequestFee(warrantyRequest.id)
      toast.success('✅ Đã tạo đơn shipping thành công!')
    } catch (error) {
      console.error('Lỗi khi tạo đơn shipping:', error)
      toast.error('❌ Không thể tạo đơn shipping. Vui lòng thử lại sau.')
    } finally {
      setLoadingCreateShipping(false)
    }
  }

  const isRequestTypeFee = warrantyRequest.requestType === RequestType.FEE
  const canCreateShippingOrder = warrantyRequest.orderStatus === OrderStatus.PICKUP_IN_PROGRESS

  const getItemStatusColor = (status: StatusWarrantyRequestItem) => {
    switch (status) {
      case StatusWarrantyRequestItem.APPROVED:
        return 'bg-emerald-100 text-emerald-800 border-emerald-200'
      case StatusWarrantyRequestItem.REJECTED:
        return 'bg-red-100 text-red-800 border-red-200'
      case StatusWarrantyRequestItem.IN_TRANSIT:
        return 'bg-blue-100 text-blue-800 border-blue-200'
      default:
        return 'bg-amber-100 text-amber-800 border-amber-200'
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

  return (
    <div className='max-h-[85vh] overflow-y-auto custom-scrollbar'>
      <div className='space-y-6 p-1 pb-20'>
        {/* TOP SECTION: Customer Info + Address */}
        <div className='grid grid-cols-1 lg:grid-cols-2 gap-6'>
          {/* Thông tin khách hàng */}
          <Card className='border-l-4 border-l-blue-400 shadow-sm hover:shadow-md transition-shadow duration-200'>
            <CardHeader className='bg-gradient-to-r from-blue-50 to-white dark:from-blue-950/30 dark:to-gray-900 pb-4'>
              <CardTitle className='flex items-center gap-3'>
                <div className='p-2 bg-white dark:bg-gray-800 rounded-lg shadow-sm'>
                  <User className='w-5 h-5 text-blue-600' />
                </div>
                <div>
                  <h3 className='text-lg font-bold text-gray-900 dark:text-white'>Khách hàng</h3>
                  <p className='text-xs text-gray-600 dark:text-gray-300 mt-0.5'>Thông tin người yêu cầu</p>
                </div>
              </CardTitle>
            </CardHeader>
            <CardContent className='pt-4 space-y-4'>
              <div className='flex items-center gap-3'>
                <User className='w-4 h-4 text-gray-500' />
                <div className='flex-1'>
                  <p className='text-sm font-medium text-gray-900'>{warrantyRequest.customer.fullName}</p>
                  <p className='text-xs text-gray-500'>Tên khách hàng</p>
                </div>
              </div>

              <div className='flex items-center gap-3'>
                <Phone className='w-4 h-4 text-gray-500' />
                <div className='flex-1'>
                  <p className='text-sm font-medium text-gray-900'>{warrantyRequest.customer.phoneNumber}</p>
                  <p className='text-xs text-gray-500'>Số điện thoại</p>
                </div>
              </div>

              <div className='flex items-center gap-3'>
                <Mail className='w-4 h-4 text-gray-500' />
                <div className='flex-1'>
                  <p className='text-sm font-medium text-gray-900 truncate'>{warrantyRequest.customer.userEmail}</p>
                  <p className='text-xs text-gray-500'>Email</p>
                </div>
              </div>
            </CardContent>
          </Card>

          {/* Địa chỉ nhận hàng */}
          <Card className='border-l-4 border-l-sky-400 shadow-sm hover:shadow-md transition-shadow duration-200'>
            <CardHeader className='bg-gradient-to-r from-sky-50 to-white dark:from-sky-950/30 dark:to-gray-900 pb-4'>
              <CardTitle className='flex items-center gap-3'>
                <div className='p-2 bg-white dark:bg-gray-800 rounded-lg shadow-sm'>
                  <MapPin className='w-5 h-5 text-sky-600' />
                </div>
                <div className='flex-1'>
                  <h3 className='text-lg font-bold text-gray-900 dark:text-white'>Địa chỉ nhận hàng</h3>
                  <p className='text-xs text-gray-600 dark:text-gray-300 mt-0.5'>Cho tính phí ship & giao nhận</p>
                </div>
                {isRequestTypeFee && address && (
                  <Button variant='outline' size='sm' onClick={calculateAllShippingFees} className='text-xs px-2 py-1'>
                    Tính tất cả
                  </Button>
                )}
              </CardTitle>
            </CardHeader>
            <CardContent className='pt-4'>
              {loadingAddress ? (
                <div className='flex items-center gap-2 text-sm text-gray-500'>
                  <div className='animate-spin rounded-full h-4 w-4 border-b-2 border-sky-500'></div>
                  Đang tải địa chỉ...
                </div>
              ) : address ? (
                <div className='space-y-2'>
                  <p className='text-sm font-medium text-gray-900'>{warrantyRequest.customer.fullName}</p>
                  <p className='text-sm text-gray-700 leading-relaxed'>
                    {address.street}, {address.ward}, {address.district}, {address.province}
                  </p>
                  <p className='text-xs text-gray-500'>📞 {warrantyRequest.customer.phoneNumber}</p>
                </div>
              ) : (
                <div className='text-sm text-gray-500 italic'>Không có địa chỉ nhận hàng.</div>
              )}
            </CardContent>
          </Card>
        </div>

        {/* MIDDLE SECTION: Request Info + Payment Status */}
        <div className='grid grid-cols-1 lg:grid-cols-3 gap-6'>
          {/* Thông tin yêu cầu bảo hành */}
          <Card className='lg:col-span-2 border-l-4 border-l-amber-400 shadow-sm hover:shadow-md transition-shadow duration-200'>
            <CardHeader className='bg-gradient-to-r from-amber-50 to-white dark:from-amber-950/30 dark:to-gray-900 pb-4'>
              <CardTitle className='flex items-center gap-3'>
                <div className='p-2 bg-white dark:bg-gray-800 rounded-lg shadow-sm'>
                  <Clock className='w-5 h-5 text-amber-600' />
                </div>
                <div>
                  <h3 className='text-lg font-bold text-gray-900 dark:text-white'>Yêu cầu bảo hành</h3>
                  <p className='text-xs text-gray-600 dark:text-gray-300 mt-0.5'>{warrantyRequest.sku}</p>
                </div>
              </CardTitle>
            </CardHeader>
            <CardContent className='pt-4'>
              <div className='grid grid-cols-2 md:grid-cols-4 gap-4'>
                <div className='text-center'>
                  <Badge
                    className={`${isRequestTypeFee ? 'bg-orange-100 text-orange-800' : 'bg-green-100 text-green-800'} px-2 py-1 text-xs`}
                  >
                    {isRequestTypeFee ? 'Bảo hành/sửa chữa có phí' : 'Bảo hành miễn phí'}
                  </Badge>
                  <p className='text-xs text-gray-500 mt-1'>Loại yêu cầu</p>
                </div>

                <div className='text-center'>
                  <Badge variant='outline' className='px-2 py-1 text-xs'>
                    {warrantyRequest.status === 'PENDING' && 'Chờ xử lý'}
                    {warrantyRequest.status === 'APPROVED' && 'Đã duyệt'}
                    {warrantyRequest.status === 'REJECTED' && 'Đã từ chối'}
                  </Badge>
                  <p className='text-xs text-gray-500 mt-1'>Trạng thái</p>
                </div>

                <div className='text-center'>
                  <p className='text-sm font-medium text-gray-900'>
                    {warrantyRequest.totalFee ? `${warrantyRequest.totalFee.toLocaleString('vi-VN')}₫` : '0₫'}
                  </p>
                  <p className='text-xs text-gray-500 mt-1'>Tổng phí</p>
                </div>

                <div className='text-center'>
                  <p className='text-sm font-medium text-gray-900'>{warrantyRequest.items?.length || 0}</p>
                  <p className='text-xs text-gray-500 mt-1'>Sản phẩm</p>
                </div>
              </div>

              {warrantyRequest.rejectReason && (
                <div className='mt-4 p-3 bg-red-50 border border-red-200 rounded-lg'>
                  <p className='text-xs font-medium text-red-800 mb-1'>Lý do từ chối</p>
                  <p className='text-sm text-red-700'>{warrantyRequest.rejectReason}</p>
                </div>
              )}
            </CardContent>
          </Card>

          {/* Payment Status - chỉ hiển thị khi là FEE */}
          {isRequestTypeFee && (
            <Card className='border-l-4 border-l-violet-400 shadow-sm hover:shadow-md transition-shadow duration-200'>
              <CardHeader className='bg-gradient-to-r from-violet-50 to-white dark:from-violet-950/30 dark:to-gray-900 pb-4'>
                <CardTitle className='flex items-center gap-3'>
                  <div className='p-2 bg-white dark:bg-gray-800 rounded-lg shadow-sm'>
                    <CreditCard className='w-5 h-5 text-violet-600' />
                  </div>
                  <div>
                    <h3 className='text-lg font-bold text-gray-900 dark:text-white'>Thanh toán</h3>
                    <p className='text-xs text-gray-600 dark:text-gray-300 mt-0.5'>Trạng thái & hành động</p>
                  </div>
                </CardTitle>
              </CardHeader>
              <CardContent className='pt-4 space-y-4'>
                <div className='text-center'>
                  <Badge
                    variant='outline'
                    className={`px-3 py-1.5 text-xs font-medium ${
                      warrantyRequest.orderStatus === OrderStatus.AWAITING_PAID_WARRANTY
                        ? 'bg-violet-100 text-violet-800 border-violet-200'
                        : warrantyRequest.orderStatus === OrderStatus.PICKUP_IN_PROGRESS
                          ? 'bg-green-100 text-green-800 border-green-200'
                          : 'bg-gray-100 text-gray-800 border-gray-200'
                    }`}
                  >
                    {warrantyRequest.orderStatus === OrderStatus.AWAITING_PAID_WARRANTY && 'Chờ thanh toán'}
                    {warrantyRequest.orderStatus === OrderStatus.PICKUP_IN_PROGRESS && 'Đã thanh toán'}
                  </Badge>
                </div>

                <Button
                  variant='outline'
                  size='sm'
                  disabled={!canCreateShippingOrder || loadingCreateShipping}
                  onClick={handleCreateShipping}
                  className={`w-full gap-2 text-xs ${
                    canCreateShippingOrder
                      ? 'text-blue-700 border-blue-200 hover:bg-blue-50'
                      : 'text-gray-400 border-gray-200 bg-gray-50'
                  }`}
                >
                  {loadingCreateShipping ? (
                    <>
                      <div className='animate-spin rounded-full h-4 w-4 border-b-2 border-blue-500'></div>
                      Đang tạo...
                    </>
                  ) : (
                    <>
                      <Truck className='w-4 h-4' />
                      Tạo đơn shipping
                    </>
                  )}
                </Button>

                {!canCreateShippingOrder && (
                  <div className='p-2 bg-amber-50 border border-amber-200 rounded text-center'>
                    <p className='text-xs text-amber-800'>
                      {warrantyRequest.orderStatus === OrderStatus.AWAITING_PAID_WARRANTY
                        ? 'Cần thanh toán trước'
                        : 'Cần duyệt & thanh toán'}
                    </p>
                  </div>
                )}
              </CardContent>
            </Card>
          )}
        </div>

        {/* REQUEST TYPE INDICATOR (cho FREE type) */}
        {!isRequestTypeFee && (
          <Card className='border-l-4 border-l-green-400 shadow-sm'>
            <CardContent className='py-4'>
              <div className='flex items-center gap-3'>
                <div className='p-2 bg-green-100 rounded-lg'>
                  <CheckCircle className='w-5 h-5 text-green-600' />
                </div>
                <div>
                  <h4 className='font-semibold text-gray-900'>Bảo hành miễn phí</h4>
                  <p className='text-sm text-gray-600'>Yêu cầu trong thời hạn bảo hành, không tính phí</p>
                </div>
              </div>
            </CardContent>
          </Card>
        )}

        {/* BOTTOM SECTION: Internal Notes */}
        <Card className='shadow-sm hover:shadow-md transition-shadow duration-200'>
          <CardHeader className='pb-4'>
            <CardTitle className='text-lg font-semibold text-gray-900 dark:text-white flex items-center gap-2'>
              <div className='p-1 bg-gray-100 rounded'>
                <Clock className='w-4 h-4 text-gray-600' />
              </div>
              Ghi chú nội bộ
            </CardTitle>
          </CardHeader>
          <CardContent>
            <Textarea
              placeholder='Nhập ghi chú nội bộ...'
              value={noteInternal}
              onChange={(e) => setNoteInternal(e.target.value)}
              rows={3}
              className='w-full resize-none focus:ring-2 focus:ring-violet-500 focus:border-violet-500 transition-all duration-200'
            />
          </CardContent>
        </Card>

        {/* Danh sách items */}
        <Card className='shadow-sm hover:shadow-md transition-shadow duration-200'>
          <CardHeader>
            <CardTitle className='text-lg font-semibold text-gray-900 dark:text-white'>
              Quyết định cho từng sản phẩm
            </CardTitle>
          </CardHeader>
          <CardContent className='space-y-6'>
            {warrantyRequest.items?.map((item, index) => (
              <div
                key={item.orderItemId}
                className='border border-gray-200 rounded-xl p-6 space-y-4 bg-gradient-to-br from-gray-50 to-white dark:from-gray-800 dark:to-gray-900 shadow-sm hover:shadow-md transition-all duration-200'
              >
                <div className='flex items-start justify-between'>
                  <div className='flex-1'>
                    <h4 className='font-semibold text-gray-900'>Sản phẩm #{index + 1}</h4>
                    <p className='text-sm text-gray-600 mt-1'>• Lần bảo hành: {item.warrantyRound}</p>
                    <div className='mt-3'>
                      <Label className='text-xs text-gray-500 uppercase tracking-wide'>Mô tả lỗi</Label>
                      <p className='text-sm text-gray-700 mt-2'>{item.description}</p>
                    </div>

                    {/* Hiển thị hình ảnh */}
                    {item.images && item.images.length > 0 && (
                      <div className='mt-3'>
                        <Label className='text-xs text-gray-500 uppercase tracking-wide'>Hình ảnh vấn đề</Label>
                        <div className='mt-2 grid grid-cols-3 gap-2'>
                          {item.images.slice(0, 3).map((image, imgIndex) => (
                            <ImageViewer
                              key={imgIndex}
                              src={image}
                              alt={`Hình ảnh ${imgIndex + 1}`}
                              className='w-full'
                              thumbnailClassName='w-full h-20 object-cover rounded-lg border'
                              title={`Hình ảnh vấn đề ${imgIndex + 1}`}
                            />
                          ))}
                        </div>
                        {item.images.length > 3 && (
                          <p className='text-xs text-gray-500 mt-1'>+{item.images.length - 3} hình ảnh khác</p>
                        )}
                      </div>
                    )}
                  </div>

                  <Badge
                    variant='outline'
                    className={getItemStatusColor(
                      itemDecisions[item.orderItemId]?.status ?? StatusWarrantyRequestItem.PENDING
                    )}
                  >
                    {getItemStatusLabel(itemDecisions[item.orderItemId]?.status ?? StatusWarrantyRequestItem.PENDING)}
                  </Badge>
                </div>

                {/* Buttons quyết định */}
                <div className='space-y-3'>
                  <Label className='text-sm font-medium text-gray-600'>Quyết định xử lý</Label>
                  <div className='flex gap-2'>
                    <Button
                      size='sm'
                      variant={
                        itemDecisions[item.orderItemId]?.status === StatusWarrantyRequestItem.REJECTED
                          ? 'default'
                          : 'outline'
                      }
                      onClick={() => handleItemDecision(item.orderItemId, StatusWarrantyRequestItem.REJECTED)}
                      className={
                        itemDecisions[item.orderItemId]?.status === StatusWarrantyRequestItem.REJECTED
                          ? 'bg-red-600 hover:bg-red-700 text-white'
                          : 'text-red-700 border-red-200 hover:bg-red-50'
                      }
                    >
                      <XCircle className='w-4 h-4 mr-1' />
                      Từ chối
                    </Button>

                    <Button
                      size='sm'
                      variant={
                        itemDecisions[item.orderItemId]?.status === StatusWarrantyRequestItem.APPROVED
                          ? 'default'
                          : 'outline'
                      }
                      onClick={() => handleItemDecision(item.orderItemId, StatusWarrantyRequestItem.APPROVED)}
                      className={
                        itemDecisions[item.orderItemId]?.status === StatusWarrantyRequestItem.APPROVED
                          ? 'bg-emerald-600 hover:bg-emerald-700 text-white'
                          : 'text-emerald-700 border-emerald-200 hover:bg-emerald-50'
                      }
                    >
                      <CheckCircle className='w-4 h-4 mr-1' />
                      Chấp nhận
                    </Button>
                  </div>
                </div>

                {/* Form chi tiết dựa trên quyết định */}
                {itemDecisions[item.orderItemId]?.status === StatusWarrantyRequestItem.REJECTED && (
                  <div className='p-4 bg-red-50 rounded-lg border border-red-200'>
                    <Label className='text-sm font-medium text-red-800'>Lý do từ chối *</Label>
                    <Textarea
                      placeholder='Nhập lý do từ chối bảo hành...'
                      value={itemDecisions[item.orderItemId]?.rejectedReason || ''}
                      onChange={(e) => handleItemDetailChange(item.orderItemId, 'rejectedReason', e.target.value)}
                      rows={2}
                      className='mt-2'
                    />
                  </div>
                )}

                {itemDecisions[item.orderItemId]?.status === StatusWarrantyRequestItem.APPROVED && (
                  <div className='p-4 bg-emerald-50 rounded-lg border border-emerald-200 space-y-4'>
                    <div className='grid grid-cols-1 md:grid-cols-3 gap-4'>
                      {/* Thời gian ước tính - bắt buộc cho cả FREE và FEE */}
                      <div>
                        <Label className='text-sm font-medium text-emerald-800'>Thời gian ước tính (ngày) *</Label>
                        <Input
                          type='number'
                          placeholder='7'
                          min='1'
                          max='30'
                          value={itemDecisions[item.orderItemId]?.estimateDays || ''}
                          onChange={(e) => handleEstimateDaysChange(item.orderItemId, Number(e.target.value) || 0)}
                          className='mt-1'
                        />
                      </div>

                      {/* Phí bảo hành - chỉ hiển thị cho FEE type */}
                      {isRequestTypeFee && (
                        <div>
                          <Label className='text-sm font-medium text-emerald-800'>Phí bảo hành (VNĐ) *</Label>
                          <Input
                            type='number'
                            placeholder='0'
                            min='0'
                            value={itemDecisions[item.orderItemId]?.fee || ''}
                            onChange={(e) =>
                              handleItemDetailChange(item.orderItemId, 'fee', Number(e.target.value) || 0)
                            }
                            className='mt-1'
                          />
                        </div>
                      )}

                      {/* Phí vận chuyển - chỉ hiển thị cho FEE type */}
                      {isRequestTypeFee && (
                        <div>
                          <Label className='text-sm font-medium text-emerald-800'>Phí vận chuyển (VNĐ) *</Label>
                          <div className='flex gap-2 mt-1'>
                            <Input
                              type='number'
                              placeholder='0'
                              min='0'
                              value={itemDecisions[item.orderItemId]?.shippingFee || ''}
                              onChange={(e) =>
                                handleItemDetailChange(item.orderItemId, 'shippingFee', Number(e.target.value) || 0)
                              }
                              className='flex-1'
                            />
                            <Button
                              type='button'
                              variant='outline'
                              size='sm'
                              onClick={() => calculateShippingFee(item.orderItemId)}
                              disabled={!address || loadingShippingFee[item.orderItemId]}
                              className='px-3 whitespace-nowrap'
                            >
                              {loadingShippingFee[item.orderItemId] ? (
                                <div className='animate-spin rounded-full h-4 w-4 border-b-2 border-emerald-500'></div>
                              ) : (
                                'Tính phí'
                              )}
                            </Button>
                          </div>
                          {!address && (
                            <p className='text-xs text-gray-500 mt-1'>Cần có địa chỉ để tính phí vận chuyển</p>
                          )}
                        </div>
                      )}
                    </div>

                    {/* Hiển thị thông tin dự kiến */}
                    <div className='flex items-center gap-2 text-sm text-emerald-700'>
                      <Clock className='w-4 h-4' />
                      <span>
                        Dự kiến hoàn thành:{' '}
                        {itemDecisions[item.orderItemId]?.estimateTime
                          ? new Date(itemDecisions[item.orderItemId].estimateTime!).toLocaleDateString('vi-VN')
                          : 'Chưa xác định'}
                      </span>
                    </div>
                  </div>
                )}

                {/* Hiển thị thông tin đơn hàng gốc */}
                {Array.isArray(item.orders) && item.orders.length > 0 && (
                  <div className='mt-6 pt-4 border-t border-gray-200'>
                    <Label className='text-sm font-medium text-gray-700 mb-3 block'>📦 Đơn hàng gốc liên quan</Label>
                    <div className='space-y-4'>
                      {item.orders.map((order) => (
                        <div
                          key={order.id}
                          role='button'
                          aria-label={`Xem đơn ${order.code}`}
                          onClick={() => navigate(`/system/manager/manage-order/${order.id}`)}
                          className='rounded-xl border border-gray-200 p-4 bg-gradient-to-br from-gray-50 to-white dark:from-gray-800 dark:to-gray-900 hover:shadow-md transition-all cursor-pointer group hover:border-violet-300'
                        >
                          <div className='flex items-center justify-between gap-3 mb-3'>
                            <p className='text-base font-semibold text-slate-700 dark:text-slate-300'>
                              Mã đơn: <span className='text-violet-700 dark:text-violet-400'>{order.code}</span>
                            </p>
                            <p className='text-sm text-slate-500'>
                              Ngày nhận:{' '}
                              {order.receivedAt ? new Date(order.receivedAt).toLocaleString('vi-VN') : 'Chưa có'}
                            </p>
                          </div>

                          <div className='grid grid-cols-1 md:grid-cols-2 gap-3'>
                            {order.orderItems?.map((oi) => (
                              <div
                                key={oi.id}
                                className='flex gap-3 border border-gray-200 rounded-lg p-3 bg-white dark:bg-gray-700'
                              >
                                <div className='w-16 h-16 bg-gray-100 dark:bg-gray-600 rounded overflow-hidden flex-shrink-0 border'>
                                  {oi.preset?.images?.[0] && (
                                    <img
                                      src={oi.preset.images[0]}
                                      alt={oi.preset?.styleName ?? 'Preset'}
                                      className='w-full h-full object-cover'
                                    />
                                  )}
                                </div>
                                <div className='flex-1 min-w-0'>
                                  <div className='text-sm font-semibold text-gray-900 dark:text-gray-100 truncate'>
                                    {oi.preset?.styleName ?? 'Sản phẩm'}
                                  </div>
                                  <div className='text-xs text-gray-600 dark:text-gray-400 truncate'>
                                    {oi.preset?.styleName}
                                  </div>
                                  <div className='mt-1 text-xs text-gray-700 dark:text-gray-300'>
                                    SL: <span className='font-medium'>{oi.quantity}</span> • Giá:
                                    <span className='font-medium'> {oi.price?.toLocaleString('vi-VN')}₫</span>
                                  </div>
                                  {oi.warrantyDate && (
                                    <div className='text-xs text-gray-500 dark:text-gray-400'>
                                      Ngày Bảo Hành Lần 1: {new Date(oi.warrantyDate).toLocaleString('vi-VN')}
                                    </div>
                                  )}
                                </div>
                              </div>
                            ))}
                          </div>

                          <div className='mt-3 flex items-center justify-end text-violet-700 dark:text-violet-400 text-sm font-medium'>
                            <span className='mr-1 opacity-0 group-hover:opacity-100 transition-opacity'>
                              Xem chi tiết đơn
                            </span>
                            <ChevronRight className='w-4 h-4' />
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
        <div className='flex justify-end gap-3 pt-6 pb-4 mt-6 border-t bg-gradient-to-r from-white via-violet-50/30 to-white dark:from-gray-950 dark:via-violet-950/30 dark:to-gray-950 sticky bottom-0 z-10 -mx-1 px-1 shadow-[0_-4px_6px_-1px_rgba(0,0,0,0.1)] backdrop-blur-sm'>
          <Button
            variant='outline'
            onClick={onClose}
            disabled={submitDecisionMutation.isPending}
            className='px-6 py-2.5 border-gray-300 text-gray-700 hover:bg-gray-50 hover:border-gray-400 transition-all duration-200'
          >
            Hủy bỏ
          </Button>
          <Button
            onClick={handleSubmit}
            disabled={submitDecisionMutation.isPending}
            className='px-8 py-2.5 bg-gradient-to-r from-violet-600 to-violet-700 hover:from-violet-700 hover:to-violet-800 text-white font-medium shadow-lg hover:shadow-xl transition-all duration-200 transform hover:scale-[1.02]'
          >
            {submitDecisionMutation.isPending ? (
              <>
                <div className='animate-spin rounded-full h-4 w-4 border-b-2 border-white mr-2'></div>
                Đang xử lý...
              </>
            ) : (
              'Lưu quyết định'
            )}
          </Button>
        </div>
      </div>
    </div>
  )
}
