import { useState, useEffect } from 'react'
import {
  CheckCircle,
  XCircle,
  Clock,
  CreditCard,
  Truck,
  ChevronRight,
  User,
  Phone,
  Mail,
  MapPin,
  Building2,
  Factory
} from 'lucide-react'
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
  RequestType,
  DestinationType
} from '@/@types/warranty-request.types'
import { OrderStatus } from '@/@types/manage-order.types'
import { AddressType } from '@/@types/global.types'
import { useSubmitDecisionMutation } from '@/services/global/warranty.service'
import globalAPI from '@/apis/global.api'
import warrantyAPI from '@/apis/warranty-request.api'
import { cn } from '@/lib/utils/utils'

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

  return (
    <div className='max-h-[85vh] overflow-y-auto custom-scrollbar'>
      <div className='space-y-8 p-2 pb-20'>
        {/* HEADER SECTION: Warranty Request Overview */}
        <div className='bg-gradient-to-br from-violet-50 via-purple-50 to-violet-100 dark:from-violet-950/30 dark:via-purple-950/30 dark:to-violet-950/20 rounded-2xl p-6 border border-violet-200/50 dark:border-violet-800/50 shadow-lg'>
          <div className='flex flex-col lg:flex-row lg:items-center lg:justify-between gap-6'>
            <div className='flex items-center gap-4'>
              <div className='w-16 h-16 bg-gradient-to-br from-violet-500 to-purple-600 dark:from-violet-600 dark:to-purple-700 rounded-2xl flex items-center justify-center shadow-lg'>
                <Clock className='w-8 h-8 text-white' />
              </div>
              <div>
                <h1 className='text-xl font-bold text-gray-900 dark:text-white'>Chi tiết yêu cầu bảo hành</h1>
                <p className='text-violet-700 dark:text-violet-300 font-medium text-base'>{warrantyRequest.sku}</p>
                <p className='text-sm text-gray-600 dark:text-gray-400 mt-1'>
                  Đánh giá và xử lý yêu cầu bảo hành từ khách hàng
                </p>
              </div>
            </div>

            <div className='flex flex-wrap gap-3'>
              <Badge
                variant='outline'
                className={`px-4 py-2 text-sm font-semibold ${
                  isRequestTypeFee
                    ? 'bg-orange-50 text-orange-700 border-orange-300 dark:bg-orange-950/20 dark:text-orange-400 dark:border-orange-800'
                    : 'bg-emerald-50 text-emerald-700 border-emerald-300 dark:bg-emerald-950/20 dark:text-emerald-400 dark:border-emerald-800'
                }`}
              >
                {isRequestTypeFee ? '💰 Có phí' : '🆓 Miễn phí'}
              </Badge>
              <Badge
                variant='outline'
                className={`px-4 py-2 text-sm font-semibold ${
                  warrantyRequest.status === 'PENDING'
                    ? 'bg-violet-50 text-violet-700 border-violet-300 dark:bg-violet-950/20 dark:text-violet-400 dark:border-violet-800'
                    : warrantyRequest.status === 'APPROVED'
                      ? 'bg-emerald-50 text-emerald-700 border-emerald-300 dark:bg-emerald-950/20 dark:text-emerald-400 dark:border-emerald-800'
                      : 'bg-rose-50 text-rose-700 border-rose-300 dark:bg-rose-950/20 dark:text-rose-400 dark:border-rose-800'
                }`}
              >
                {warrantyRequest.status === 'PENDING' && '⏳ Chờ xử lý'}
                {warrantyRequest.status === 'APPROVED' && '✅ Đã duyệt'}
                {warrantyRequest.status === 'REJECTED' && '❌ Đã từ chối'}
              </Badge>
              <Badge
                variant='outline'
                className='px-4 py-2 text-sm font-semibold bg-blue-50 text-blue-700 border-blue-300'
              >
                📦 {warrantyRequest.items?.length || 0} sản phẩm
              </Badge>
              {warrantyRequest.destinationType && (
                <Badge
                  variant={warrantyRequest.destinationType === DestinationType.BRANCH ? 'default' : 'secondary'}
                  className={cn(
                    'px-3 py-2 text-sm flex items-center gap-1',
                    warrantyRequest.destinationType === DestinationType.BRANCH
                      ? 'bg-blue-50 text-blue-700 border border-blue-200'
                      : 'bg-indigo-50 text-indigo-700 border border-indigo-200'
                  )}
                >
                  {warrantyRequest.destinationType === DestinationType.BRANCH ? (
                    <Building2 className='h-3 w-3' />
                  ) : (
                    <Factory className='h-3 w-3' />
                  )}
                  {warrantyRequest.destinationType === DestinationType.BRANCH
                    ? 'Bảo hành tại Chi nhánh'
                    : 'Bảo hành tại Nhà máy'}
                </Badge>
              )}
            </div>
          </div>

          {warrantyRequest.totalFee && warrantyRequest.totalFee > 0 && (
            <div className='mt-4 pt-4 border-t border-violet-200/50'>
              <div className='flex items-center justify-between'>
                <span className='text-sm font-medium text-gray-600 dark:text-gray-300'>Tổng phí dự kiến:</span>
                <span className='text-xl font-bold text-violet-700 dark:text-violet-300'>
                  {warrantyRequest.totalFee.toLocaleString('vi-VN')}₫
                </span>
              </div>
            </div>
          )}
        </div>

        {/* TOP SECTION: Customer Info + Address */}
        <div className='grid grid-cols-1 lg:grid-cols-2 gap-6'>
          {/* Thông tin khách hàng */}
          <Card className='border-l-4 border-l-blue-500 shadow-lg hover:shadow-xl transition-all duration-300 bg-gradient-to-br from-white to-blue-50/30 dark:from-gray-800 dark:to-blue-950/20 py-0'>
            <CardHeader className='bg-gradient-to-r from-blue-50 to-blue-100/50 dark:from-blue-950/40 dark:to-blue-900/30 rounded-t-lg p-4'>
              <CardTitle className='flex items-center gap-3'>
                <div className='p-3 bg-white dark:bg-gray-800 rounded-xl shadow-md border border-violet-200 dark:border-violet-700'>
                  <User className='w-6 h-6 text-blue-600' />
                </div>
                <div>
                  <h3 className='text-lg font-bold text-gray-900 dark:text-white'>Thông tin khách hàng</h3>
                  <p className='text-sm text-blue-600 dark:text-blue-300 mt-0.5'>Người yêu cầu bảo hành</p>
                </div>
              </CardTitle>
            </CardHeader>
            <CardContent className='space-y-5 py-4 pt-1'>
              <div className='flex items-center gap-4 p-3 bg-blue-50/50 dark:bg-blue-950/20 rounded-lg shadow-xl'>
                <div className='w-10 h-10 bg-blue-100 dark:bg-blue-900 rounded-full flex items-center justify-center'>
                  <User className='w-5 h-5 text-blue-600 dark:text-blue-400' />
                </div>
                <div className='flex-1'>
                  <p className='text-base font-semibold text-gray-900 dark:text-white'>
                    {warrantyRequest.customer.fullName}
                  </p>
                  <p className='text-sm text-blue-600 dark:text-blue-400'>Tên khách hàng</p>
                </div>
              </div>

              <div className='flex items-center gap-4 p-3 bg-green-50/50 dark:bg-green-950/20 rounded-lg shadow-xl'>
                <div className='w-10 h-10 bg-green-100 dark:bg-green-900 rounded-full flex items-center justify-center'>
                  <Phone className='w-5 h-5 text-green-600 dark:text-green-400' />
                </div>
                <div className='flex-1'>
                  <p className='text-base font-semibold text-gray-900 dark:text-white'>
                    {warrantyRequest.customer.phoneNumber}
                  </p>
                  <p className='text-sm text-green-600 dark:text-green-400'>Số điện thoại</p>
                </div>
              </div>

              <div className='flex items-center gap-4 p-3 bg-purple-50/50 dark:bg-purple-950/20 rounded-lg shadow-xl'>
                <div className='w-10 h-10 bg-purple-100 dark:bg-purple-900 rounded-full flex items-center justify-center'>
                  <Mail className='w-5 h-5 text-purple-600 dark:text-purple-400' />
                </div>
                <div className='flex-1'>
                  <p
                    className='text-base font-semibold text-gray-900 dark:text-white truncate'
                    title={warrantyRequest.customer.userEmail}
                  >
                    {warrantyRequest.customer.userEmail}
                  </p>
                  <p className='text-sm text-purple-600 dark:text-purple-400'>Email liên hệ</p>
                </div>
              </div>
            </CardContent>
          </Card>

          {/* Địa chỉ nhận hàng */}
          <Card className='border-l-4 border-l-sky-500 shadow-lg hover:shadow-xl transition-all duration-300 bg-gradient-to-br from-white to-sky-50/30 dark:from-gray-800 dark:to-sky-950/20 py-0'>
            <CardHeader className='bg-gradient-to-r from-sky-50 to-sky-100/50 dark:from-sky-950/40 dark:to-sky-900/30 pb-4 rounded-t-lg p-4'>
              <CardTitle className='flex items-center gap-3'>
                <div className='p-3 bg-white dark:bg-gray-800 rounded-xl shadow-md border border-violet-200 dark:border-violet-700'>
                  <MapPin className='w-6 h-6 text-sky-600' />
                </div>
                <div className='flex-1'>
                  <h3 className='text-xl font-bold text-gray-900 dark:text-white'>Địa chỉ giao nhận</h3>
                  <p className='text-sm text-sky-600 dark:text-sky-300 mt-0.5'>Để tính phí vận chuyển</p>
                </div>
                {isRequestTypeFee && address && (
                  <Button
                    variant='outline'
                    size='sm'
                    onClick={calculateAllShippingFees}
                    className='text-sm px-4 py-2 bg-sky-50 hover:bg-sky-100 border-sky-300 text-sky-700 font-medium'
                  >
                    🧮 Tính tất cả
                  </Button>
                )}
              </CardTitle>
            </CardHeader>
            <CardContent className='pt-6'>
              {loadingAddress ? (
                <div className='flex items-center gap-3 text-base text-gray-600 dark:text-gray-300 p-4 bg-violet-50/50 dark:bg-violet-950/10 rounded-lg'>
                  <div className='animate-spin rounded-full h-5 w-5 border-b-2 border-sky-500'></div>
                  <span>Đang tải thông tin địa chỉ...</span>
                </div>
              ) : address ? (
                <div className='space-y-4'>
                  <div className='p-4 bg-sky-50/50 dark:bg-sky-950/20 rounded-lg border border-sky-200/50'>
                    <div className='flex items-center gap-3 mb-3'>
                      <div className='w-8 h-8 bg-sky-100 dark:bg-sky-900 rounded-full flex items-center justify-center'>
                        <User className='w-4 h-4 text-sky-600 dark:text-sky-400' />
                      </div>
                      <p className='text-base font-semibold text-gray-900 dark:text-white'>
                        {warrantyRequest.customer.fullName}
                      </p>
                    </div>
                    <div className='space-y-2 pl-11'>
                      <p className='text-sm text-gray-700 dark:text-gray-300 leading-relaxed'>
                        📍 {address.street}, {address.ward}, {address.district}, {address.province}
                      </p>
                      <p className='text-sm text-sky-600 dark:text-sky-400 font-medium'>
                        📞 {warrantyRequest.customer.phoneNumber}
                      </p>
                    </div>
                  </div>
                </div>
              ) : (
                <div className='p-4 bg-amber-50 border border-amber-200 rounded-lg text-center'>
                  <p className='text-sm text-amber-800 font-medium'>⚠️ Không có địa chỉ nhận hàng</p>
                  <p className='text-xs text-amber-600 mt-1'>Yêu cầu khách hàng cung cấp địa chỉ</p>
                </div>
              )}
            </CardContent>
          </Card>
        </div>

        {/* MIDDLE SECTION: Request Info + Payment Status */}
        <div className='grid grid-cols-1 lg:grid-cols-3 gap-6'>
          {/* Thông tin yêu cầu bảo hành */}
          <Card className='lg:col-span-2 border-l-4 border-l-amber-500 shadow-lg hover:shadow-xl transition-all duration-300 bg-gradient-to-br from-white to-amber-50/30 dark:from-gray-800 dark:to-amber-950/20 py-0'>
            <CardHeader className='bg-gradient-to-r from-amber-50 to-amber-100/50 dark:from-amber-950/40 dark:to-amber-900/30 p-4 rounded-t-lg'>
              <CardTitle className='flex items-center gap-3'>
                <div className='p-3 bg-white dark:bg-gray-800 rounded-xl shadow-md border border-violet-200 dark:border-violet-700'>
                  <Clock className='w-6 h-6 text-amber-600' />
                </div>
                <div>
                  <h3 className='text-xl font-bold text-gray-900 dark:text-white'>Thông tin yêu cầu</h3>
                  <p className='text-sm text-amber-600 dark:text-amber-300 mt-0.5'>{warrantyRequest.sku}</p>
                </div>
              </CardTitle>
            </CardHeader>
            <CardContent className='pt-6'>
              <div className='grid grid-cols-2 md:grid-cols-4 gap-4 mb-6'>
                <div className='bg-gradient-to-br from-orange-50 to-orange-100/50 dark:from-orange-950/30 dark:to-orange-900/20 p-4 rounded-xl text-center border border-orange-200/50'>
                  <Badge
                    className={`${isRequestTypeFee ? 'bg-orange-500 text-white' : 'bg-green-500 text-white'} px-3 py-1.5 text-sm font-semibold mb-2`}
                  >
                    {isRequestTypeFee ? '💰 Có phí' : '🆓 Miễn phí'}
                  </Badge>
                  <p className='text-xs text-orange-600 dark:text-orange-400 font-medium'>Loại yêu cầu</p>
                </div>

                <div className='bg-gradient-to-br from-blue-50 to-blue-100/50 dark:from-blue-950/30 dark:to-blue-900/20 p-4 rounded-xl text-center border border-blue-200/50'>
                  <Badge
                    variant='outline'
                    className={`px-3 py-1.5 text-sm font-semibold mb-2 ${
                      warrantyRequest.status === 'PENDING'
                        ? 'bg-amber-100 text-amber-800 border-amber-300'
                        : warrantyRequest.status === 'APPROVED'
                          ? 'bg-green-100 text-green-800 border-green-300'
                          : 'bg-red-100 text-red-800 border-red-300'
                    }`}
                  >
                    {warrantyRequest.status === 'PENDING' && '⏳ Chờ duyệt'}
                    {warrantyRequest.status === 'APPROVED' && '✅ Đã duyệt'}
                    {warrantyRequest.status === 'REJECTED' && '❌ Từ chối'}
                  </Badge>
                  <p className='text-xs text-blue-600 dark:text-blue-400 font-medium'>Trạng thái</p>
                </div>

                <div className='bg-gradient-to-br from-violet-50 to-violet-100/50 dark:from-violet-950/30 dark:to-violet-900/20 p-4 rounded-xl text-center border border-violet-200/50'>
                  <p className='text-lg font-bold text-violet-800 dark:text-violet-300 mb-1'>
                    {warrantyRequest.totalFee ? `${warrantyRequest.totalFee.toLocaleString('vi-VN')}₫` : '0₫'}
                  </p>
                  <p className='text-xs text-violet-600 dark:text-violet-400 font-medium'>Tổng phí</p>
                </div>

                <div className='bg-gradient-to-br from-emerald-50 to-emerald-100/50 dark:from-emerald-950/30 dark:to-emerald-900/20 p-4 rounded-xl text-center border border-emerald-200/50'>
                  <p className='text-lg font-bold text-emerald-800 dark:text-emerald-300 mb-1'>
                    {warrantyRequest.items?.length || 0}
                  </p>
                  <p className='text-xs text-emerald-600 dark:text-emerald-400 font-medium'>Sản phẩm</p>
                </div>
              </div>

              {warrantyRequest.rejectReason && (
                <div className='p-4 bg-red-50 border border-red-200 rounded-xl'>
                  <div className='flex items-center gap-2 mb-2'>
                    <div className='w-5 h-5 bg-red-100 rounded-full flex items-center justify-center'>
                      <XCircle className='w-3 h-3 text-red-600' />
                    </div>
                    <p className='text-sm font-semibold text-red-800'>Lý do từ chối</p>
                  </div>
                  <p className='text-sm text-red-700 pl-7'>{warrantyRequest.rejectReason}</p>
                </div>
              )}
            </CardContent>
          </Card>

          {/* Payment Status - chỉ hiển thị khi là FEE */}
          {isRequestTypeFee && (
            <Card className='border-l-4 border-l-violet-500 shadow-lg hover:shadow-xl transition-all duration-300 bg-gradient-to-br from-white to-violet-50/30 dark:from-gray-800 dark:to-violet-950/20'>
              <CardHeader className='bg-gradient-to-r from-violet-50 to-violet-100/50 dark:from-violet-950/40 dark:to-violet-900/30 pb-4 rounded-t-lg'>
                <CardTitle className='flex items-center gap-3'>
                  <div className='p-3 bg-white dark:bg-gray-800 rounded-xl shadow-md border border-violet-200 dark:border-violet-700'>
                    <CreditCard className='w-6 h-6 text-violet-600' />
                  </div>
                  <div>
                    <h3 className='text-xl font-bold text-gray-900 dark:text-white'>Thanh toán</h3>
                    <p className='text-sm text-violet-600 dark:text-violet-300 mt-0.5'>& Vận chuyển</p>
                  </div>
                </CardTitle>
              </CardHeader>
              <CardContent className='pt-6 space-y-5'>
                <div className='text-center'>
                  <Badge
                    variant='outline'
                    className={`px-4 py-2.5 text-sm font-semibold ${
                      warrantyRequest.orderStatus === OrderStatus.AWAITING_PAID_WARRANTY
                        ? 'bg-amber-50 text-amber-800 border-amber-300'
                        : warrantyRequest.orderStatus === OrderStatus.PICKUP_IN_PROGRESS
                          ? 'bg-green-50 text-green-800 border-green-300'
                          : 'bg-violet-100 text-violet-800 border-violet-300 dark:bg-violet-950/20 dark:text-violet-400 dark:border-violet-800'
                    }`}
                  >
                    {warrantyRequest.orderStatus === OrderStatus.AWAITING_PAID_WARRANTY && '⏳ Chờ thanh toán'}
                    {warrantyRequest.orderStatus === OrderStatus.PICKUP_IN_PROGRESS && '✅ Đã thanh toán'}
                  </Badge>
                </div>

                <Button
                  variant='outline'
                  size='sm'
                  disabled={!canCreateShippingOrder || loadingCreateShipping}
                  onClick={handleCreateShipping}
                  className={`w-full gap-3 py-3 text-sm font-medium ${
                    canCreateShippingOrder
                      ? 'bg-blue-50 hover:bg-blue-100 text-blue-700 border-blue-300 shadow-sm hover:shadow-md'
                      : 'text-gray-400 border-gray-200 bg-gray-50 cursor-not-allowed'
                  }`}
                >
                  {loadingCreateShipping ? (
                    <>
                      <div className='animate-spin rounded-full h-4 w-4 border-b-2 border-blue-500'></div>
                      Đang tạo đơn...
                    </>
                  ) : (
                    <>
                      <Truck className='w-5 h-5' />
                      Tạo đơn vận chuyển
                    </>
                  )}
                </Button>

                {!canCreateShippingOrder && (
                  <div className='p-3 bg-amber-50 border border-amber-200 rounded-lg text-center'>
                    <p className='text-sm text-amber-800 font-medium'>
                      {warrantyRequest.orderStatus === OrderStatus.AWAITING_PAID_WARRANTY
                        ? '⚠️ Cần thanh toán trước khi tạo shipping'
                        : '⚠️ Cần duyệt yêu cầu và thanh toán'}
                    </p>
                  </div>
                )}
              </CardContent>
            </Card>
          )}
        </div>

        {/* INTERNAL NOTES SECTION */}
        <Card className='shadow-lg hover:shadow-xl transition-all duration-300 bg-gradient-to-br from-white to-gray-50/30 dark:from-gray-800 dark:to-gray-900/50 py-0'>
          <CardHeader className='pb-4 bg-gradient-to-r from-gray-50 to-gray-100/50 dark:from-gray-800 dark:to-gray-700/30 rounded-t-lg p-4'>
            <CardTitle className='text-xl font-semibold text-gray-900 dark:text-white flex items-center gap-3'>
              <div className='w-10 h-10 bg-gradient-to-br from-gray-500 to-gray-600 rounded-xl flex items-center justify-center shadow-md'>
                <Clock className='w-5 h-5 text-white' />
              </div>
              <div>
                <span>Ghi chú nội bộ</span>
                <p className='text-sm text-gray-600 dark:text-gray-400 font-normal mt-0.5'>
                  Thông tin cho đội ngũ xử lý
                </p>
              </div>
            </CardTitle>
          </CardHeader>
          <CardContent className='p-4 pt-1'>
            <Textarea
              placeholder='Nhập ghi chú nội bộ để hỗ trợ quá trình xử lý...'
              value={noteInternal}
              onChange={(e) => setNoteInternal(e.target.value)}
              rows={4}
              className='w-full resize-none focus:ring-2 focus:ring-violet-500 focus:border-violet-500 transition-all duration-200 border-2 border-gray-200 bg-gray-50/50 focus:bg-white'
            />
          </CardContent>
        </Card>

        {/* PRODUCT DECISIONS SECTION */}
        <Card className='shadow-lg hover:shadow-xl transition-all duration-300 bg-gradient-to-br from-white to-indigo-50/20 dark:from-gray-800 dark:to-indigo-950/20 py-0'>
          <CardHeader className='bg-gradient-to-r from-indigo-50 to-indigo-100/50 dark:from-indigo-950/40 dark:to-indigo-900/30 rounded-t-lg p-4'>
            <CardTitle className='text-xl font-semibold text-gray-900 dark:text-white flex items-center gap-3'>
              <div className='w-10 h-10 bg-gradient-to-br from-indigo-500 to-purple-600 rounded-xl flex items-center justify-center shadow-md'>
                <CheckCircle className='w-5 h-5 text-white' />
              </div>
              <div>
                <span>Quyết định cho từng sản phẩm</span>
                <p className='text-sm text-indigo-600 dark:text-indigo-300 font-normal mt-0.5'>
                  Xem xét và đưa ra quyết định cho {warrantyRequest.items?.length || 0} sản phẩm
                </p>
              </div>
            </CardTitle>
          </CardHeader>
          <CardContent className='space-y-8 p-6'>
            {warrantyRequest.items?.map((item, index) => (
              <div
                key={item.orderItemId}
                className='border-2 border-gray-200 rounded-2xl p-6 space-y-6 bg-gradient-to-br from-white to-gray-50/50 dark:from-gray-800 dark:to-gray-900/50 shadow-md hover:shadow-lg transition-all duration-300 hover:border-indigo-300'
              >
                <div className='flex items-start justify-between'>
                  <div className='flex-1'>
                    <div className='flex items-center gap-3 mb-4'>
                      <div className='w-8 h-8 bg-gradient-to-br from-indigo-500 to-purple-600 rounded-lg flex items-center justify-center text-white font-bold text-sm'>
                        {index + 1}
                      </div>
                      <div className='flex-1'>
                        <h4 className='text-lg font-bold text-gray-900 dark:text-white'>Sản phẩm #{index + 1}</h4>
                        <div className='flex items-center gap-3 mt-1'>
                          <p className='text-sm text-indigo-600 dark:text-indigo-300 font-medium'>
                            🔄 Lần bảo hành: {item.warrantyRound}
                          </p>
                          <Badge
                            variant='outline'
                            className={`${
                              item.destinationType === DestinationType.BRANCH
                                ? 'bg-blue-50 text-blue-700 border-blue-200 dark:bg-blue-950/20 dark:text-blue-400 dark:border-blue-800'
                                : 'bg-indigo-50 text-indigo-700 border-indigo-200 dark:bg-indigo-950/20 dark:text-indigo-400 dark:border-indigo-800'
                            } text-xs`}
                          ></Badge>
                        </div>
                      </div>
                    </div>

                    <div className='mb-4 p-4 bg-amber-50 border border-amber-200 rounded-xl'>
                      <Label className='text-sm font-semibold text-amber-800 uppercase tracking-wide mb-2 block'>
                        📝 Mô tả vấn đề từ khách hàng
                      </Label>
                      <p className='text-sm text-gray-700 leading-relaxed'>{item.description}</p>
                    </div>

                    {/* Hiển thị hình ảnh */}
                    {item.images && item.images.length > 0 && (
                      <div className='mb-4'>
                        <Label className='text-sm font-semibold text-blue-800 uppercase tracking-wide mb-3 block'>
                          📸 Hình ảnh vấn đề ({item.images.length} ảnh)
                        </Label>
                        <div className='grid grid-cols-2 md:grid-cols-4 gap-3'>
                          {item.images.slice(0, 4).map((image, imgIndex) => (
                            <ImageViewer
                              key={imgIndex}
                              src={image}
                              alt={`Hình ảnh vấn đề ${imgIndex + 1}`}
                              className='w-full'
                              thumbnailClassName='w-full h-24 object-cover rounded-lg border-2 border-gray-200 hover:border-indigo-300 transition-all duration-200 shadow-sm hover:shadow-md'
                              title={`Hình ảnh vấn đề ${imgIndex + 1}`}
                            />
                          ))}
                        </div>
                        {item.images.length > 4 && (
                          <p className='text-sm text-indigo-600 mt-2 font-medium'>
                            +{item.images.length - 4} hình ảnh khác - click để xem tất cả
                          </p>
                        )}
                      </div>
                    )}
                  </div>

                  <Badge
                    variant='outline'
                    className={`${getItemStatusColor(
                      itemDecisions[item.orderItemId]?.status ?? StatusWarrantyRequestItem.PENDING
                    )} px-4 py-2 text-sm font-semibold`}
                  >
                    {getItemStatusLabel(itemDecisions[item.orderItemId]?.status ?? StatusWarrantyRequestItem.PENDING)}
                  </Badge>
                  {item.trackingCode && (
                    <Badge variant='outline' className='px-4 py-2 text-sm font-semibold'>
                      Tracking code: {item.trackingCode}
                    </Badge>
                  )}
                </div>

                {/* Decision Buttons */}
                <div className='space-y-4 p-4 bg-gray-50/50 dark:bg-gray-800/30 rounded-xl border border-gray-200'>
                  <Label className='text-base font-semibold text-gray-700 dark:text-gray-300 flex items-center gap-2'>
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

                {/* Form chi tiết dựa trên quyết định */}
                {itemDecisions[item.orderItemId]?.status === StatusWarrantyRequestItem.REJECTED && (
                  <div className='p-5 bg-red-50 rounded-xl border-2 border-red-200'>
                    <div className='flex items-center gap-2 mb-3'>
                      <XCircle className='w-5 h-5 text-red-600' />
                      <Label className='text-base font-semibold text-red-800'>Lý do từ chối *</Label>
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

                {itemDecisions[item.orderItemId]?.status === StatusWarrantyRequestItem.APPROVED && (
                  <div className='p-5 bg-emerald-50 rounded-xl border-2 border-emerald-200 space-y-5'>
                    <div className='flex items-center gap-2 mb-3'>
                      <CheckCircle className='w-5 h-5 text-emerald-600' />
                      <Label className='text-base font-semibold text-emerald-800'>Chi tiết xử lý</Label>
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
                    <Label className='text-base font-semibold text-gray-700 dark:text-gray-300 mb-4 flex items-center gap-2'>
                      📦 Đơn hàng gốc liên quan ({item.orders.length} đơn)
                    </Label>
                    <div className='space-y-4'>
                      {item.orders.map((order) => (
                        <div
                          key={order.id}
                          role='button'
                          aria-label={`Xem đơn ${order.code}`}
                          onClick={() => navigate(`/system/manager/manage-order/${order.id}`)}
                          className='rounded-xl border-2 border-gray-200 p-5 bg-gradient-to-br from-white to-blue-50/30 dark:from-gray-800 dark:to-blue-950/20 hover:shadow-lg transition-all cursor-pointer group hover:border-violet-400'
                        >
                          <div className='flex items-center justify-between gap-3 mb-4'>
                            <div className='flex items-center gap-3'>
                              <div>
                                <p className='text-lg font-bold text-slate-700 dark:text-slate-300'>
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
        <div className='flex justify-end gap-4 pt-8 pb-6 mt-8 border-t-2 bg-gradient-to-r from-white via-violet-50/40 to-white dark:from-gray-950 dark:via-violet-950/40 dark:to-gray-950 sticky bottom-0 z-20 -mx-2 px-4 shadow-[0_-8px_16px_-4px_rgba(0,0,0,0.1)] backdrop-blur-md rounded-t-2xl border-violet-200'>
          <Button
            variant='outline'
            onClick={onClose}
            disabled={submitDecisionMutation.isPending}
            className='px-8 py-3 text-base font-semibold border-2 border-gray-300 text-gray-700 hover:bg-gray-50 hover:border-gray-400 transition-all duration-300 transform hover:scale-[1.02] shadow-sm hover:shadow-md'
          >
            ❌ Hủy bỏ
          </Button>

          {/* Chỉ hiển thị nút submit khi KHÔNG có item nào có destinationType là BRANCH */}
          {!hasBranchDestination && (
            <Button
              onClick={handleSubmit}
              disabled={submitDecisionMutation.isPending}
              className='px-10 py-3 text-base font-bold bg-gradient-to-r from-violet-600 via-purple-600 to-violet-700 hover:from-violet-700 hover:via-purple-700 hover:to-violet-800 text-white shadow-xl hover:shadow-2xl transition-all duration-300 transform hover:scale-[1.02] border-0'
            >
              {submitDecisionMutation.isPending ? (
                <>
                  <div className='animate-spin rounded-full h-5 w-5 border-b-2 border-white mr-3'></div>
                  Đang xử lý quyết định...
                </>
              ) : (
                <>💾 Lưu quyết định</>
              )}
            </Button>
          )}

          {/* Hiển thị thông báo khi có item có destinationType là BRANCH */}
          {hasBranchDestination && (
            <div className='px-6 py-3 bg-blue-50 dark:bg-blue-950/20 border border-blue-200 dark:border-blue-800 rounded-lg text-blue-700 dark:text-blue-300 text-sm font-medium'>
              🏢 Yêu cầu này được xử lý tại chi nhánh, không thể thay đổi quyết định từ hệ thống
            </div>
          )}
        </div>
      </div>
    </div>
  )
}
